#!/bin/bash

# Simple script to run multiple batches of user imports

BATCH_SIZE=10
START_AT=70
BATCHES_TO_RUN=3

for i in $(seq 0 $(($BATCHES_TO_RUN - 1))); do
    # Calculate the current start index
    current_index=$(($START_AT + $i * $BATCH_SIZE))
    
    echo "=== Running batch $((i+1)) of $BATCHES_TO_RUN ==="
    echo "Importing users from index $current_index to $((current_index + BATCH_SIZE - 1))"
    
    # Modify the Python script
    sed -i "s/START_INDEX = [0-9]*/START_INDEX = $current_index/" scripts/import_small_batch.py
    
    # Run the script
    python scripts/import_small_batch.py
    
    # Sleep for 1 second between batches
    sleep 1
done

echo "Completed $BATCHES_TO_RUN batches."