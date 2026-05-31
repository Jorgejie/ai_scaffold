#!/bin/bash
# PostToolUse hook: tracks edited code files for review reminder
# Template file from ai_scaffold_skill — replace {{DIR}} and {{SOURCE_EXTENSIONS}} for target project
# Default extensions: Java/Kotlin/XML/Gradle + C/C++/NDK (cpp|h|c|mk|cmake)
# For non-NDK projects, remove the C/C++/NDK extensions when replacing {{SOURCE_EXTENSIONS}}

stdin=$(cat)
file_path=$(echo "$stdin" | grep -o '"file_path":"[^"]*"' | head -1 | sed 's/"file_path":"//;s/"//')
session_id=$(echo "$stdin" | grep -o '"session_id":"[^"]*"' | head -1 | sed 's/"session_id":"//;s/"//')

# session_id 有效性检查
if [[ -z "$session_id" ]]; then
    exit 0
fi

if [[ "$file_path" =~ \.(kt|java|xml|gradle|cpp|h|c|mk|cmake)$ ]]; then
    track_file="/tmp/{{DIR}}edits_${session_id}.txt"
    echo "$file_path" >> "$track_file"
fi

exit 0
