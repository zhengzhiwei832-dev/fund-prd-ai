'use client';

import { useState, useEffect, useCallback } from 'react';

interface PRDViewerProps {
  content: string;
  isLoading: boolean;
  onEdit?: (editedContent: string, diff: string) => void;
  readOnly?: boolean;
}

export function PRDViewer({ content, isLoading, onEdit, readOnly = false }: PRDViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [originalContent, setOriginalContent] = useState(content);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (content && content !== originalContent) {
      setEditedContent(content);
      setOriginalContent(content);
    }
  }, [content, originalContent]);

  const computeDiff = useCallback((original: string, edited: string): string => {
    const origLines = original.split('\n');
    const editedLines = edited.split('\n');
    const diff: string[] = [];

    const maxLines = Math.max(origLines.length, editedLines.length);
    for (let i = 0; i < maxLines; i++) {
      const orig = origLines[i] || '';
      const edit = editedLines[i] || '';
      if (orig !== edit) {
        diff.push(`[行${i + 1}]`);
        diff.push(`- ${orig}`);
        diff.push(`+ ${edit}`);
      }
    }

    return diff.join('\n');
  }, []);

  const handleStartEdit = () => {
    setIsEditing(true);
    setOriginalContent(editedContent);
  };

  const handleSaveEdit = () => {
    const diff = computeDiff(originalContent, editedContent);
    setIsEditing(false);
    if (onEdit && diff) {
      onEdit(editedContent, diff);
    }
  };

  const handleCancelEdit = () => {
    setEditedContent(originalContent);
    setIsEditing(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(isEditing ? editedContent : content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([isEditing ? editedContent : content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PRD_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-gray-500">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p>AI 正在生成 PRD，请稍候...</p>
        <p className="text-sm text-gray-400 mt-2">大约需要 10-30 秒</p>
      </div>
    );
  }

  if (!content && !editedContent) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>在左侧输入需求后，PRD 将显示在这里</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
        {!readOnly && (
          <>
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  保存修改
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
              </>
            ) : (
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                编辑 PRD
              </button>
            )}
          </>
        )}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              已复制
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              复制
            </>
          )}
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          下载 Markdown
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto max-h-[600px]">
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-full min-h-[500px] p-4 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            spellCheck={false}
          />
        ) : (
          <div className="prose prose-sm max-w-none p-4">
            <FormattedContent content={editedContent || content} />
          </div>
        )}
      </div>
    </div>
  );
}

function FormattedContent({ content }: { content: string }) {
  return (
    <>
      {content.split('\n').map((line, i) => {
        // Headers
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-xl font-bold text-gray-800 mt-6 mb-3">{line.replace('## ', '')}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-lg font-semibold text-gray-700 mt-4 mb-2">{line.replace('### ', '')}</h3>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={i} className="text-2xl font-bold text-gray-900 mt-4 mb-3">{line.replace('# ', '')}</h1>;
        }
        // Bullet points
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <li key={i} className="ml-4 text-gray-700 leading-relaxed">{line.substring(2)}</li>;
        }
        // Numbered lists
        if (/^\d+\./.test(line)) {
          return <li key={i} className="ml-4 text-gray-700 leading-relaxed">{line}</li>;
        }
        // Empty line
        if (!line.trim()) {
          return <div key={i} className="h-2"></div>;
        }
        // Regular paragraph
        return <p key={i} className="text-gray-700 leading-relaxed mb-2">{line}</p>;
      })}
    </>
  );
}
