#!/bin/bash
# Stop hook: checks if code_review is needed after code modifications
# Template file from ai_scaffold_skill — replace {{DIR}} and {{REVIEW_FILE_THRESHOLD}} for target project

stdin=$(cat)
session_id=$(echo "$stdin" | grep -o '"session_id":"[^"]*"' | head -1 | sed 's/"session_id":"//;s/"//')

track_file="/tmp/.claudeedits_${session_id}.txt"

if [ -f "$track_file" ]; then
    file_count=$(sort -u "$track_file" | wc -l | tr -d ' ')
    rm -f "$track_file"
    if [ "$file_count" -ge 2 ]; then
        echo "[强制规则] 检测到 ${file_count} 个源码文件被修改，请确认是否已触发 code_review 技能。如已审查则忽略此提醒。" >&2
        exit 2
    fi
fi

exit 0
