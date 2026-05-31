#!/bin/bash
# Stop hook: checks if code_review is needed after code modifications
# Next.js project — REVIEW_FILE_THRESHOLD = 2

stdin=$(cat)
session_id=$(echo "$stdin" | grep -o '"session_id":"[^"]*"' | head -1 | sed 's/"session_id":"//;s/"//')

track_file="/tmp/.claudeedits_${session_id}.txt"

if [ -f "$track_file" ]; then
    file_count=$(sort -u "$track_file" | wc -l | tr -d ' ')
    rm -f "$track_file"
    if [ "$file_count" -ge 2 ]; then
        echo "[Rule] Detected ${file_count} source files modified. Please confirm whether code_review skill has been triggered. Ignore this reminder if already reviewed." >&2
        exit 2
    fi
fi

exit 0
