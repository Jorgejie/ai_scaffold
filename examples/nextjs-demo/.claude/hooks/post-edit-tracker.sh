#!/bin/bash
# PostToolUse hook: tracks edited code files for review reminder
# Next.js TypeScript project — tracks ts|tsx|js|jsx|json|css source files

stdin=$(cat)
file_path=$(echo "$stdin" | grep -o '"file_path":"[^"]*"' | head -1 | sed 's/"file_path":"//;s/"//')
session_id=$(echo "$stdin" | grep -o '"session_id":"[^"]*"' | head -1 | sed 's/"session_id":"//;s/"//')

if [[ "$file_path" =~ \.(ts|tsx|js|jsx|json|css)$ ]]; then
    track_file="/tmp/.claudeedits_${session_id}.txt"
    echo "$file_path" >> "$track_file"
fi

exit 0
