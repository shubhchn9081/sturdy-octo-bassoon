#!/usr/bin/env python3
import os
import pandas as pd
import psycopg2
import json
import datetime
from psycopg2.extras import Json

# Configuration - process next 20 users
START_INDEX = 40  # Continue from where we left off
MAX_USERS = 20    # Only process this many users

# Get the database URL from environment variable
db_url = os.environ.get('DATABASE_URL')

def connect_to_db():
    """Connect to the PostgreSQL database and return connection."""
    conn = psycopg2.connect(db_url)
    print("Database connection successful")
    return conn

def main():
    try:
        # Connect to database
        conn = connect_to_db()
        cur = conn.cursor()
        
        # Check existing users
        cur.execute("SELECT COUNT(*) FROM users")
        user_count = cur.fetchone()[0]
        print(f"Current user count: {user_count}")
        
        # Read CSV
        csv_file = 'attached_assets/users - Sheet1.csv'
        df = pd.read_csv(csv_file)
        print(f"CSV has {len(df)} total rows")
        
        # Get subset
        end_index = min(START_INDEX + MAX_USERS, len(df))
        df_subset = df.iloc[START_INDEX:end_index]
        print(f"Processing rows {START_INDEX} to {end_index-1} ({len(df_subset)} users)")
        
        # Create fixed password
        fixed_password = "5f4dcc3b5aa765d61d8327deb882cf99.5eb63bbbe01eeed093cb22bb8f5acdc3"  # md5('password')
        
        # Track existing phones and usernames
        cur.execute("SELECT username FROM users")
        existing_usernames = {row[0] for row in cur.fetchall()}
        
        cur.execute("SELECT phone FROM users")
        existing_phones = {row[0] for row in cur.fetchall()}
        
        # Process each user
        inserted_count = 0
        for _, row in df_subset.iterrows():
            try:
                # Extract data
                phone = str(row['Phone']).strip()
                
                # Skip if phone exists
                if phone in existing_phones:
                    print(f"Skipping existing phone: {phone}")
                    continue
                
                # Get username and ensure uniqueness
                username = str(row['Username']).strip()
                original_username = username
                counter = 1
                
                while username in existing_usernames:
                    username = f"{original_username}_{counter}"
                    counter += 1
                
                # Admin and banned flags
                is_admin = str(row['Is Admin']).lower() == 'yes'
                is_banned = str(row['Is Banned']).lower() == 'yes'
                
                # Insert the user
                cur.execute("""
                INSERT INTO users 
                (username, password, is_admin, is_banned, balance, created_at, email, full_name, phone, referral_code, language) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    username,
                    fixed_password,
                    is_admin,
                    is_banned,
                    Json({'INR': 1000, 'BTC': 0.01, 'ETH': 0.1, 'USDT': 1000}),
                    datetime.datetime.now(),
                    f"{username}@example.com",
                    f"User {username}",
                    phone,
                    None,
                    'English'
                ))
                
                # Track this user
                existing_usernames.add(username)
                existing_phones.add(phone)
                inserted_count += 1
                print(f"Inserted user: {username} with phone: {phone}")
                
            except Exception as e:
                print(f"Error processing user: {e}")
                continue
        
        # Commit changes
        conn.commit()
        print(f"Successfully inserted {inserted_count} users")
        
        # Get new count
        cur.execute("SELECT COUNT(*) FROM users")
        new_user_count = cur.fetchone()[0]
        print(f"New user count: {new_user_count}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()
            print("Database connection closed")

if __name__ == "__main__":
    main()