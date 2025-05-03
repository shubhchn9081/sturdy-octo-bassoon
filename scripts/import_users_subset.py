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

# Configuration
START_INDEX = 0  # Start with the first user
MAX_USERS = 100  # Only process this many users
DEFAULT_PASSWORD = "password123"  # The default password for all users

# Get the database URL from environment variable
db_url = os.environ.get('DATABASE_URL')

def hash_password(password):
    """
    Simple password hashing function that is compatible with the Node.js implementation.
    """
    salt = secrets.token_hex(16)  # Generate 16 bytes (32 hex characters) salt
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

def process_csv_subset(file_path, conn, start_index, max_users):
    """Process a subset of the CSV file and import users to the database."""
    try:
        # Read the CSV file
        df = pd.read_csv(file_path)
        print(f"CSV has {len(df)} total rows")
        
        # Get the subset to process
        end_index = min(start_index + max_users, len(df))
        df_subset = df.iloc[start_index:end_index]
        print(f"Processing rows {start_index} to {end_index-1} ({len(df_subset)} users)")

        # Get existing phone numbers and usernames to avoid duplicates
        existing_phones = get_existing_phones(conn)
        existing_usernames = get_existing_usernames(conn)
        
        # Default password - everyone can login with any password
        default_password = hash_password(DEFAULT_PASSWORD)
        
        # Prepare for insertion
        users_to_insert = []
        skipped_count = 0
        
        for _, row in df_subset.iterrows():
            try:
                # Get phone number and clean it
                phone = str(row['Phone']).strip()
                
                # Skip if phone number already exists
                if phone in existing_phones:
                    skipped_count += 1
                    print(f"Skipping duplicate phone: {phone}")
                    continue
                
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
                try:
                    if isinstance(created_at_str, str) and ',' in created_at_str:
                        parts = created_at_str.split(',')
                        if len(parts) == 2:
                            date_part, time_part = parts
                            created_at = datetime.datetime.strptime(f"{date_part.strip()} {time_part.strip()}", "%m/%d/%Y %H:%M:%S")
                        else:
                            created_at = datetime.datetime.now()
                    else:
                        created_at = datetime.datetime.now()
                except Exception as e:
                    print(f"Date parsing error for {created_at_str}: {e}")
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
                
            except Exception as e:
                print(f"Error processing row: {e}")
                continue
        
        # Insert users in a single batch
        if users_to_insert:
            cur = conn.cursor()
            
            # Define the INSERT query
            insert_query = """
            INSERT INTO users 
            (username, password, is_admin, is_banned, balance, created_at, email, full_name, phone, referral_code, language) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            # Execute batch insert
            cur.executemany(insert_query, users_to_insert)
            conn.commit()
            cur.close()
            
            print(f"Successfully inserted {len(users_to_insert)} users")
            print(f"Skipped {skipped_count} users with existing phone numbers")
        else:
            print("No users to insert")
        
        return len(users_to_insert), skipped_count
        
    except Exception as e:
        print(f"Error processing CSV: {e}")
        conn.rollback()
        return 0, 0

def main():
    # Connect to the database
    conn = connect_to_db()
    if not conn:
        return
    
    try:
        # Path to the CSV file
        csv_file = 'attached_assets/users - Sheet1.csv'
        
        # Process the CSV file subset
        inserted, skipped = process_csv_subset(csv_file, conn, START_INDEX, MAX_USERS)
        
        print(f"\nSummary:")
        print(f"Processed users from index {START_INDEX} to {START_INDEX + MAX_USERS - 1}")
        print(f"Inserted: {inserted}")
        print(f"Skipped: {skipped}")
        print(f"Total: {inserted + skipped}")
        print(f"\nTo process the next batch, set START_INDEX to {START_INDEX + MAX_USERS} in the script.")
        
    except Exception as e:
        print(f"Error in main function: {e}")
    finally:
        # Close the database connection
        conn.close()
        print("Database connection closed")

if __name__ == "__main__":
    main()