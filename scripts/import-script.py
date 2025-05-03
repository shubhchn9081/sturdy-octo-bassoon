#!/usr/bin/env python3

"""
User Import Tool Wrapper Script (Python version)
This script runs the fast-import.py script and then the batch-update-referrals.mjs script
"""

import os
import subprocess
import sys

print("======================================")
print("  USER IMPORT TOOL WRAPPER (PYTHON)   ")
print("======================================")

scripts_dir = os.path.dirname(os.path.abspath(__file__))

try:
    # Run the Python import script
    print("\nStep 1: Running bulk user import (Python version)...")
    subprocess.run(["python3", os.path.join(scripts_dir, "fast-import.py")], check=True)
    
    # Run the referral code generator (Node.js script)
    print("\nStep 2: Generating referral codes for users...")
    subprocess.run(["node", os.path.join(scripts_dir, "batch-update-referrals.mjs")], check=True)
    
    print("\n======================================")
    print("  IMPORT PROCESS COMPLETE            ")
    print("======================================")
    print("All users have been imported and assigned referral codes!")
    print("The imported users can log in with their phone number and any password.")
    
except subprocess.CalledProcessError as e:
    print(f"\nError running import process: {e}")
    sys.exit(1)
except Exception as e:
    print(f"\nUnexpected error: {e}")
    sys.exit(1)