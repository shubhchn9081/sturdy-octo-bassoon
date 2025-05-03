#!/usr/bin/env python3
import os
import pandas as pd
import psycopg2
import json
import datetime
import hashlib
import secrets
import time
from psycopg2.extras import Json

# Get the database URL from environment variable
db_url = os.environ.get('DATABASE_URL')

def hash_password(password):
    """
    Simple password hashing function that is compatible with the Node.js implementation.
    The Node.js implementation uses scrypt, but for simplicity we'll use a similar 
    pattern with SHA-256 that maintains the same format: <hash>.<salt>
    """
    salt = secrets.token_hex(16)  # Generate 16 bytes (32 hex characters) salt
    # In production, you should use scrypt/bcrypt/argon2 here
    hash_obj = hashlib.sha256((password + salt).encode())
    hashed = hash_obj.hexdigest()
    return f"{hashed}.{salt}"

def connect_to_db():
    """Connect to the PostgreSQL database and return connection."""
    try:
        conn = psycopg2.connect(db_url)
        print("Database connection successful")
        return conn
    except Exception as e:
        print(f"Database connection failed: {e}")
        return None

def get_existing_phones(conn):
    """Get a set of existing phone numbers to avoid duplicates."""
    cur = conn.cursor()
    cur.execute("SELECT phone FROM users")
    existing_phones = {row[0] for row in cur.fetchall()}
    cur.close()
    return existing_phones

def get_existing_usernames(conn):
    """Get a set of existing usernames to avoid duplicates."""
    cur = conn.cursor()
    cur.execute("SELECT username FROM users")
    existing_usernames = {row[0] for row in cur.fetchall()}
    cur.close()
    return existing_usernames

def process_csv(file_path, conn, batch_size=50):
    """Process the CSV file and import users to the database."""
    try:
        # Read the CSV file
        df = pd.read_csv(file_path)
        print(f"Read {len(df)} rows from CSV")

        # Get existing phone numbers and usernames to avoid duplicates
        existing_phones = get_existing_phones(conn)
        existing_usernames = get_existing_usernames(conn)
        
        # Default password - everyone can login with any password
        default_password = hash_password("password123")
        
        # Prepare for insertion
        users_to_insert = []
        skipped_count = 0
        total_inserted = 0
        
        # Define the INSERT query
        insert_query = """
        INSERT INTO users 
        (username, password, is_admin, is_banned, balance, created_at, email, full_name, phone, referral_code, language) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        # Process in batches for better performance
        for _, row in df.iterrows():
            try:
                # Get phone number and clean it
                phone = str(row['Phone']).strip()
                
                # Skip if phone number already exists
                if phone in existing_phones:
                    skipped_count += 1
                    continue
                
                # User ID from CSV (used only for reference, not inserted as ID)
                user_id = row['ID']
                
                # Get username and ensure it's unique
                username = row['Username']
                original_username = username
                counter = 1
                
                while username in existing_usernames:
                    username = f"{original_username}_{counter}"
                    counter += 1
                
                # Add the new username to our tracking set
                existing_usernames.add(username)
                
                # Process is_admin and is_banned columns
                is_admin = row['Is Admin'].lower() == 'yes' if isinstance(row['Is Admin'], str) else False
                is_banned = row['Is Banned'].lower() == 'yes' if isinstance(row['Is Banned'], str) else False
                
                # Create a default balance using the same structure as the app
                balance = Json({'INR': 1000, 'BTC': 0.01, 'ETH': 0.1, 'USDT': 1000})
                
                # Get created_at timestamp
                created_at_str = row['Created At']
                # Parse the created_at date (assuming format like "4/20/2025, 23:58:44")
                if isinstance(created_at_str, str) and ',' in created_at_str:
                    date_part, time_part = created_at_str.split(',')
                    created_at = datetime.datetime.strptime(f"{date_part.strip()} {time_part.strip()}", "%m/%d/%Y %H:%M:%S")
                else:
                    created_at = datetime.datetime.now()
                
                # Prepare user data
                user_data = (
                    username,  # username
                    default_password,  # password
                    is_admin,  # is_admin
                    is_banned,  # is_banned
                    balance,  # balance (JSONB)
                    created_at,  # created_at
                    f"{username}@example.com",  # email (using username as part of email)
                    f"User {username}",  # full_name
                    phone,  # phone
                    None,  # referral_code
                    'English'  # language
                )
                
                users_to_insert.append(user_data)
                
                # Add to existing phones set to avoid duplicates within this batch
                existing_phones.add(phone)
                
                # Insert in smaller batches to improve performance
                if len(users_to_insert) >= batch_size:
                    cur = conn.cursor()
                    cur.executemany(insert_query, users_to_insert)
                    conn.commit()
                    cur.close()
                    
                    total_inserted += len(users_to_insert)
                    print(f"Inserted batch of {len(users_to_insert)} users - Total: {total_inserted}")
                    users_to_insert = []
                
            except Exception as e:
                print(f"Error processing row {_}: {e}")
                continue
        
        # Insert any remaining users
        if users_to_insert:
            cur = conn.cursor()
            cur.executemany(insert_query, users_to_insert)
            conn.commit()
            cur.close()
            
            total_inserted += len(users_to_insert)
            print(f"Inserted final batch of {len(users_to_insert)} users")
            
        print(f"Successfully inserted {total_inserted} users")
        print(f"Skipped {skipped_count} users with existing phone numbers")
        
    except Exception as e:
        print(f"Error processing CSV: {e}")
        conn.rollback()

def main():
    # Connect to the database
    conn = connect_to_db()
    if not conn:
        return
    
    try:
        # Path to the CSV file
        csv_file = 'attached_assets/users - Sheet1.csv'
        
        # Process the CSV file
        process_csv(csv_file, conn)
        
    except Exception as e:
        print(f"Error in main function: {e}")
    finally:
        # Close the database connection
        conn.close()
        print("Database connection closed")

if __name__ == "__main__":
    main()