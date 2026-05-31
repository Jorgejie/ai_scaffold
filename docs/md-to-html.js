const fs = require('fs');
const path = require('path');

// 读取Markdown文件
const mdPath = path.join(__dirname, 'article2.md');
const mdContent = fs.readFileSync(mdPath, 'utf-8');

// 简单的Markdown转HTML函数
function markdownToHtml(md) {
  let html = md;
  
  // 先处理表格（在其他处理之前）
  html = processTables(html);
  
  // 代码块（```...```）
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`;
  });
  
  // 行内代码（`...`）
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // 标题
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // 引用块（> ...）
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  
  // 粗体（**...**）
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // 斜体（*...*）
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // 链接（[text](url)）
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // 无序列表
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  
  // 有序列表
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  
  // 水平线
  html = html.replace(/^---$/gm, '<hr>');
  
  // 段落（空行分隔的文本块）
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  
  // 清理多余的标签
  html = html.replace(/<p>\s*(<h[1-3]>)/g, '$1');
  html = html.replace(/(<\/h[1-3]>)\s*<\/p>/g, '$1');
  html = html.replace(/<p>\s*(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)\s*<\/p>/g, '$1');
  html = html.replace(/<p>\s*(<pre>)/g, '$1');
  html = html.replace(/(<\/pre>)\s*<\/p>/g, '$1');
  html = html.replace(/<p>\s*(<table>)/g, '$1');
  html = html.replace(/(<\/table>)\s*<\/p>/g, '$1');
  html = html.replace(/<p>\s*(<blockquote>)/g, '$1');
  html = html.replace(/(<\/blockquote>)\s*<\/p>/g, '$1');
  html = html.replace(/<p>\s*(<hr>)\s*<\/p>/g, '$1');
  
  return html;
}

// 处理Markdown表格
function processTables(md) {
  const lines = md.split('\n');
  const result = [];
  let inTable = false;
  let tableRows = [];
  let isHeaderRow = true;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 检测表格行（以 | 开头和结尾）
    if (line.startsWith('|') && line.endsWith('|')) {
      inTable = true;
      
      // 跳过表头分隔行（|---|---|）
      if (/^\|[\s\-\:|]+\|$/.test(line)) {
        isHeaderRow = false;
        continue;
      }
      
      // 解析单元格
      const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
      
      if (isHeaderRow) {
        // 表头行
        const headerHtml = '<tr>' + cells.map(cell => `<th>${cell}</th>`).join('') + '</tr>';
        tableRows.push(headerHtml);
        isHeaderRow = false;
      } else {
        // 数据行
        const rowHtml = '<tr>' + cells.map(cell => `<td>${cell}</td>`).join('') + '</tr>';
        tableRows.push(rowHtml);
      }
    } else {
      // 非表格行
      if (inTable && tableRows.length > 0) {
        // 输出表格
        result.push('<table>' + tableRows.join('\n') + '</table>');
        tableRows = [];
        inTable = false;
        isHeaderRow = true;
      }
      result.push(lines[i]);
    }
  }
  
  // 处理文件末尾的表格
  if (inTable && tableRows.length > 0) {
    result.push('<table>' + tableRows.join('\n') + '</table>');
  }
  
  return result.join('\n');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 生成完整的HTML文档
const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ai_scaffold：一个为 AI 编码助手设计项目运行环境的骨架——架构、对比与选型指南</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.8;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        h1 {
            font-size: 2em;
            color: #2c3e50;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #3498db;
        }
        
        h2 {
            font-size: 1.6em;
            color: #34495e;
            margin-top: 40px;
            margin-bottom: 20px;
            padding-left: 15px;
            border-left: 4px solid #3498db;
        }
        
        h3 {
            font-size: 1.3em;
            color: #2c3e50;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        
        p {
            margin-bottom: 15px;
            text-align: justify;
        }
        
        blockquote {
            background: #f8f9fa;
            border-left: 4px solid #3498db;
            padding: 15px 20px;
            margin: 20px 0;
            color: #555;
            font-style: italic;
        }
        
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: "Courier New", Courier, monospace;
            font-size: 0.9em;
            color: #e74c3c;
        }
        
        pre {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 20px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 20px 0;
            line-height: 1.5;
        }
        
        pre code {
            background: none;
            padding: 0;
            color: inherit;
        }
        
        ul, ol {
            margin: 15px 0;
            padding-left: 30px;
        }
        
        li {
            margin: 8px 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        
        th {
            background: #3498db;
            color: white;
            font-weight: bold;
        }
        
        tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        tr:hover {
            background: #e3f2fd;
        }
        
        a {
            color: #3498db;
            text-decoration: none;
            border-bottom: 1px dotted #3498db;
        }
        
        a:hover {
            color: #2980b9;
            border-bottom: 1px solid #2980b9;
        }
        
        hr {
            border: none;
            border-top: 2px solid #ecf0f1;
            margin: 30px 0;
        }
        
        strong {
            color: #2c3e50;
            font-weight: 600;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ecf0f1;
            color: #7f8c8d;
            font-size: 0.9em;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 20px;
            }
            
            h1 {
                font-size: 1.6em;
            }
            
            h2 {
                font-size: 1.3em;
            }
            
            table {
                font-size: 0.85em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        ${markdownToHtml(mdContent)}
        
        <div class="footer">
            <p>本文发布于 2026-05-31 | ai_scaffold v2.0.4</p>
        </div>
    </div>
</body>
</html>`;

// 写入HTML文件
const htmlPath = path.join(__dirname, 'article2.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf-8');

console.log(`✅ HTML文件已生成: ${htmlPath}`);
console.log(`📊 文件大小: ${(fs.statSync(htmlPath).size / 1024).toFixed(2)} KB`);
