#!/bin/bash

# This script imports users in batches
# It modifies the START_INDEX in the import_small_batch.py file
# and runs it multiple times

BATCH_SIZE=20
TOTAL_USERS=827
CURRENT_INDEX=40  # Start from where we left off (we've already imported 40 users)

# Check how many batches we need to run
REMAINING_USERS=$((TOTAL_USERS - CURRENT_INDEX))
echo "Remaining users to import: $REMAINING_USERS"

# Calculate number of full batches
FULL_BATCHES=$((REMAINING_USERS / BATCH_SIZE))
PARTIAL_BATCH=$((REMAINING_USERS % BATCH_SIZE))

echo "Will process $FULL_BATCHES full batches and 1 partial batch of $PARTIAL_BATCH users"

# Process full batches
for ((i=0; i<FULL_BATCHES; i++)); do
    # Calculate the start index for this batch
    START_INDEX=$((CURRENT_INDEX + (i * BATCH_SIZE)))
    
    echo ""
    echo "====== Processing batch $((i+1)) of $FULL_BATCHES ======"
    echo "START_INDEX = $START_INDEX, importing $BATCH_SIZE users"
    
    # Update the START_INDEX in the Python script
    sed -i "s/START_INDEX = [0-9]*/START_INDEX = $START_INDEX/" scripts/import_small_batch.py
    
    # Run the Python script
    python scripts/import_small_batch.py
    
    # Sleep for a second to give the database a break
    sleep 1
done

# Process the last partial batch if needed
if [ $PARTIAL_BATCH -gt 0 ]; then
    # Calculate the start index for the partial batch
    START_INDEX=$((CURRENT_INDEX + (FULL_BATCHES * BATCH_SIZE)))
    
    echo ""
    echo "====== Processing final partial batch ======"
    echo "START_INDEX = $START_INDEX, importing $PARTIAL_BATCH users"
    
    # Update the START_INDEX in the Python script
    sed -i "s/START_INDEX = [0-9]*/START_INDEX = $START_INDEX/" scripts/import_small_batch.py
    # Update the MAX_USERS in the Python script for the partial batch
    sed -i "s/MAX_USERS = [0-9]*/MAX_USERS = $PARTIAL_BATCH/" scripts/import_small_batch.py
    
    # Run the Python script
    python scripts/import_small_batch.py
fi

echo ""
echo "User import process completed!"
echo "Make sure to update the MAX_USERS back to $BATCH_SIZE in the script for future runs."