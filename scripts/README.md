# User Bulk Import Tools

This directory contains tools for importing users in bulk from a CSV file.

## Available Scripts

### NodeJS Import Tools
- `direct-import.js` - The main NodeJS bulk import script
- `import-script.js` - Wrapper script that runs the import and referral generation
- `batch-update-referrals.mjs` - Tool to generate referral codes for users without them

### Python Import Tools
- `fast-import.py` - Python implementation of the bulk import (faster for large imports)
- `import-script.py` - Python wrapper script for the full import process

### Legacy Scripts (Not Recommended)
- `bulk_import_users.js` - Previous implementation (less efficient)
- `chunked_import.js` - Another previous approach
- `efficient_bulk_import.js` - Another version
- `import_batches.js` - Another implementation
- `import_remaining_users.js` - Another implementation
- `multi_transaction_import.js` - Another implementation
- `optimized_bulk_import.js` - Another implementation

## How to Use

1. Ensure your CSV file is placed at `attached_assets/users - Sheet1.csv`
2. Verify the CSV has columns: Username, Phone, Is Admin, Is Banned, Balance
3. Run one of the following commands:

```bash
# Using Node.js (recommended for smaller imports)
node scripts/import-script.js

# Using Python (recommended for larger imports)
python3 scripts/import-script.py
```

## CSV Format Requirements

The CSV file should have the following columns:
- `Username`: User's display name
- `Phone`: User's phone number (must be 10 digits)
- `Balance`: This field is read but ignored (all users start with 0 balance)
- `Is Admin`: "Yes" or "No" to indicate admin status
- `Is Banned`: "Yes" or "No" to indicate banned status

## Important Notes

- All imported users can log in with any password (authentication bypass is enabled for bulk imports)
- All imported users have zero balance (INR: 0, BTC: 0, ETH: 0, USDT: 0)
- Duplicate phone numbers are skipped
- Usernames are generated from phone numbers (format: user_XXXXXX)
- Referral codes are automatically generated for imported users

## Utilities

The import process includes several utilities:

- `reset-balances.js` - Tool to reset all imported users' balances to zero
- `update-referrals-tiny.js` - Tool to generate referral codes in small batches (useful if timeouts occur)

## Testing Login

You can test login for an imported user with:

```bash
curl -X POST http://localhost:5000/api/login -H "Content-Type: application/json" -d '{"phone":"9021534055","password":"any_password"}'
```

The phone number can be any valid imported user, and the password can be anything.