#!/bin/bash

# Advanced bulk import script with progress tracking and auto-resume capabilities

# Default settings
BATCH_SIZE=50
START_FROM=113  # Starting from where we left off
TOTAL_USERS=827
CHUNK_SIZE=100  # Process users in chunks for better control

# Create a progress file if it doesn't exist
PROGRESS_FILE="./scripts/import_progress.txt"
if [[ ! -f "$PROGRESS_FILE" ]]; then
  echo "$START_FROM" > "$PROGRESS_FILE"
fi

# Read the last imported index
CURRENT_INDEX=$(cat "$PROGRESS_FILE")
echo "Resuming from index $CURRENT_INDEX"

# Function to process a chunk of users
process_chunk() {
  local start=$1
  local size=$2
  echo "==== Processing chunk from $start with size $size ===="
  
  # Run the NodeJS importer with the specified range
  START_INDEX=$start BATCH_SIZE=$BATCH_SIZE MAX_USERS=$size node scripts/bulk_import_users.js
  
  # Check if the import was successful
  if [[ $? -eq 0 ]]; then
    local new_index=$((start + size))
    echo "$new_index" > "$PROGRESS_FILE"
    echo "Progress updated to $new_index"
    return 0
  else
    echo "Import chunk failed. Retrying with smaller batch..."
    return 1
  fi
}

# Main processing loop
while [[ $CURRENT_INDEX -lt $TOTAL_USERS ]]; do
  # Calculate how many users are left to process
  REMAINING=$((TOTAL_USERS - CURRENT_INDEX))
  
  # Process in smaller chunks for better control
  CURRENT_CHUNK_SIZE=$CHUNK_SIZE
  if [[ $REMAINING -lt $CHUNK_SIZE ]]; then
    CURRENT_CHUNK_SIZE=$REMAINING
  fi
  
  # Try to process the current chunk
  process_chunk $CURRENT_INDEX $CURRENT_CHUNK_SIZE
  
  # If failed, try with a smaller chunk size
  if [[ $? -ne 0 && $CURRENT_CHUNK_SIZE -gt 20 ]]; then
    process_chunk $CURRENT_INDEX $((CURRENT_CHUNK_SIZE / 2))
  fi
  
  # Read the updated progress
  CURRENT_INDEX=$(cat "$PROGRESS_FILE")
  
  # Pause briefly to allow server to recover
  sleep 2
done

echo "===== Import completed successfully! ====="
echo "Final user count: $(cat "$PROGRESS_FILE")"