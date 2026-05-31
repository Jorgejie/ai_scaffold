#!/bin/bash
# Stop hook: checks if code_review is needed after code modifications
# Template file from ai_scaffold_skill — replace {{DIR}} and {{REVIEW_FILE_THRESHOLD}} for target project

stdin=$(cat)
session_id=$(echo "$stdin" | grep -o '"session_id":"[^"]*"' | head -1 | sed 's/"session_id":"//;s/"//')

# session_id 有效性检查
if [[ -z "$session_id" ]]; then
    exit 0
fi

track_file="/tmp/{{DIR}}edits_${session_id}.txt"

if [ -f "$track_file" ]; then
    file_count=$(sort -u "$track_file" | wc -l | tr -d ' ')
    rm -f "$track_file"
    # 确保 file_count 是有效数字
    if ! [[ "$file_count" =~ ^[0-9]+$ ]]; then
        exit 0
    fi
    if [ "$file_count" -ge {{REVIEW_FILE_THRESHOLD}} ]; then
        echo "[强制规则] 检测到 ${file_count} 个源码文件被修改，请确认是否已触发 code_review 技能。如已审查则忽略此提醒。" >&2
        exit 2
    fi
fi

exit 0
