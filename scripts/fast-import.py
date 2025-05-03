#!/usr/bin/env python3

"""
Fast Bulk User Import Tool (Python version)
Efficiently imports users from CSV with parallel processing
"""

import os
import csv
import hashlib
import random
import string
import json
import psycopg2
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime

# Configuration
CSV_PATH = "../attached_assets/users - Sheet1.csv"
BATCH_SIZE = 50
MAX_WORKERS = 4  # Number of parallel workers

# Database connection from environment variables
DB_URL = os.environ.get('DATABASE_URL')

# Generate password hash (similar to Node.js version)
def hash_password(password):
    salt = hashlib.md5(str(random.random()).encode()).hexdigest()
    hashed = hashlib.sha512((password + salt).encode()).hexdigest()
    return f"{hashed}.{salt}"

# Generate username from phone
def generate_username_from_phone(phone):
    last_digits = phone[-6:] if len(phone) >= 6 else phone
    return f"user_{last_digits}"

# Generate random referral code
def generate_referral_code():
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choice(chars) for _ in range(8))

# Validate phone number (basic check for 10 digits)
def is_valid_phone(phone):
    if not phone:
        return False
    phone_str = str(phone).strip()
    return phone_str.isdigit() and len(phone_str) == 10

# Check if a string value represents "Yes"
def is_yes_value(value):
    if not value:
        return False
    value_lower = str(value).lower().strip()
    return value_lower in ('yes', 'true', '1')

# Process a batch of users
def process_batch(batch, conn, cursor):
    imported = 0
    skipped = 0
    
    try:
        # Start transaction
        cursor.execute("BEGIN")
        
        # Use a standard password for all users
        standard_password = hash_password("password")
        
        # Process each user in the batch
        for user in batch:
            try:
                # Prepare user data
                username = user['username']
                full_name = user['full_name']
                phone = user['phone']
                is_admin = user['is_admin']
                is_banned = user['is_banned']
                referral_code = user['referral_code']
                
                # Zero balance for all currencies
                balance = json.dumps({"INR": 0, "BTC": 0, "ETH": 0, "USDT": 0})
                
                # Insert user
                cursor.execute("""
                    INSERT INTO users (
                        username, full_name, phone, password, 
                        email, balance, created_at, 
                        is_admin, is_banned, referral_code
                    ) VALUES (
                        %s, %s, %s, %s, 
                        %s, %s, %s, 
                        %s, %s, %s
                    )
                """, (
                    username,
                    full_name,
                    phone,
                    standard_password,
                    f"{phone}@example.com",
                    balance,
                    datetime.now(),
                    is_admin,
                    is_banned,
                    referral_code
                ))
                
                imported += 1
                
            except Exception as e:
                print(f"Error inserting user with phone {phone}: {e}")
                skipped += 1
        
        # Commit transaction
        cursor.execute("COMMIT")
        
    except Exception as e:
        # Rollback on error
        cursor.execute("ROLLBACK")
        print(f"Error processing batch: {e}")
        skipped += len(batch)
        imported = 0
    
    return imported, skipped

def main():
    print("======================================")
    print("  FAST BULK USER IMPORT TOOL (PYTHON) ")
    print("======================================")
    
    # Connect to database
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor()
    
    try:
        # Get current user count
        cursor.execute("SELECT COUNT(*) FROM users")
        initial_count = cursor.fetchone()[0]
        print(f"\nStarting user count: {initial_count}")
        
        # Create temp table for existing phones
        cursor.execute("""
            CREATE TEMP TABLE existing_phones (
                phone TEXT PRIMARY KEY
            )
        """)
        
        # Populate with existing phones
        cursor.execute("""
            INSERT INTO existing_phones (phone)
            SELECT phone FROM users
        """)
        
        print("Loaded existing phone numbers to prevent duplicates")
        
        # Read CSV file
        csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), CSV_PATH)
        print(f"\nReading CSV file from {csv_path}")
        
        valid_users = []
        duplicate_count = 0
        invalid_count = 0
        
        with open(csv_path, 'r') as csvfile:
            reader = csv.DictReader(csvfile)
            total_rows = sum(1 for _ in reader)
            
            # Reset file pointer to start
            csvfile.seek(0)
            # Skip header row
            next(csvfile)
            
            reader = csv.DictReader(csvfile)
            print(f"CSV file contains {total_rows} records")
            
            # Process each CSV record
            for record in reader:
                phone = record.get('Phone', '').strip()
                
                # Skip records with invalid phones
                if not is_valid_phone(phone):
                    print(f"Skipping invalid phone: {phone}")
                    invalid_count += 1
                    continue
                
                # Check if phone exists
                cursor.execute("SELECT 1 FROM existing_phones WHERE phone = %s", (phone,))
                if cursor.fetchone():
                    duplicate_count += 1
                    continue
                
                # Add to our tracking table
                cursor.execute("INSERT INTO existing_phones (phone) VALUES (%s)", (phone,))
                
                # Prepare user data
                username = record.get('Username', '').strip() or generate_username_from_phone(phone)
                is_admin = is_yes_value(record.get('Is Admin'))
                is_banned = is_yes_value(record.get('Is Banned'))
                
                # Add to valid users
                valid_users.append({
                    'username': username,
                    'full_name': username,  # Use username as full name
                    'phone': phone,
                    'is_admin': is_admin,
                    'is_banned': is_banned,
                    'referral_code': generate_referral_code()
                })
        
        # Create batches for processing
        batches = []
        for i in range(0, len(valid_users), BATCH_SIZE):
            batches.append(valid_users[i:i+BATCH_SIZE])
        
        print(f"\nOrganized {len(batches)} batches with up to {BATCH_SIZE} users each")
        
        # Process batches
        total_imported = 0
        total_skipped = 0
        
        # Use parallel processing for better performance
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = []
            
            # Submit batch processing tasks
            for batch_index, batch in enumerate(batches):
                # Create a new connection for each worker
                worker_conn = psycopg2.connect(DB_URL)
                worker_cursor = worker_conn.cursor()
                
                print(f"Submitting batch {batch_index + 1} of {len(batches)} ({len(batch)} users)")
                future = executor.submit(process_batch, batch, worker_conn, worker_cursor)
                futures.append((future, worker_conn, worker_cursor, batch_index + 1))
            
            # Process results as they complete
            for future, worker_conn, worker_cursor, batch_num in futures:
                imported, skipped = future.result()
                total_imported += imported
                total_skipped += skipped
                
                print(f"Completed batch {batch_num}: {imported} imported, {skipped} skipped")
                
                # Close worker connection
                worker_cursor.close()
                worker_conn.close()
        
        # Get final count
        cursor.execute("SELECT COUNT(*) FROM users")
        final_count = cursor.fetchone()[0]
        
        # Print summary report
        print("\n======================================")
        print("  IMPORT SUMMARY                     ")
        print("======================================")
        print(f"Initial user count:     {initial_count}")
        print(f"Final user count:       {final_count}")
        print(f"Users added:            {final_count - initial_count}")
        print(f"Successful imports:     {total_imported}")
        print(f"Duplicate phones:       {duplicate_count}")
        print(f"Invalid phone numbers:  {invalid_count}")
        print(f"Failed imports:         {total_skipped}")
        print("======================================")
        
        print("\nImport process complete!")
        print("All imported users can log in with their phone number and any password")
        print("All imported users have been assigned a zero balance")
        
    except Exception as e:
        print(f"Error in import process: {e}")
    finally:
        # Clean up
        try:
            cursor.execute("DROP TABLE IF EXISTS existing_phones")
        except:
            pass
        
        # Close connections
        cursor.close()
        conn.close()
        print("\nDatabase connection closed")

if __name__ == "__main__":
    main()