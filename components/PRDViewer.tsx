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
      <div className="h-96 flex flex-col items-center justify-center text-slate-400">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>
        <p className="text-lg font-medium text-slate-300">AI 正在生成 PRD</p>
        <p className="text-sm text-slate-500 mt-2">请稍候，大约需要 10-30 秒</p>
      </div>
    );
  }

  if (!content && !editedContent) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-white/10 rounded-xl bg-slate-800/30">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-slate-400 font-medium">在左侧输入需求后，PRD 将显示在这里</p>
        <p className="text-sm text-slate-500 mt-2">支持编辑、复制和下载 Markdown</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-white/10">
        {!readOnly && (
          <>
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-600/30 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  保存修改
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-all duration-200"
                >
                  取消
                </button>
              </>
            ) : (
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-600/30 transition-all duration-200"
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
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800/50 border border-white/10 rounded-lg hover:bg-slate-700/50 hover:text-white transition-all duration-200"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-400">已复制</span>
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
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800/50 border border-white/10 rounded-lg hover:bg-slate-700/50 hover:text-white transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          下载 Markdown
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto max-h-[600px] -mx-2 px-2">
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-full min-h-[500px] p-4 font-mono text-sm bg-slate-800/50 border border-white/10 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 resize-none"
            spellCheck={false}
          />
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
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
          return <h2 key={i} className="text-xl font-bold text-white mt-6 mb-3 border-b border-white/10 pb-2">{line.replace('## ', '')}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-lg font-semibold text-slate-200 mt-4 mb-2">{line.replace('### ', '')}</h3>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={i} className="text-2xl font-bold text-white mt-4 mb-3">{line.replace('# ', '')}</h1>;
        }
        // Bullet points
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <li key={i} className="ml-4 text-slate-300 leading-relaxed">{line.substring(2)}</li>;
        }
        // Numbered lists
        if (/^\d+\./.test(line)) {
          return <li key={i} className="ml-4 text-slate-300 leading-relaxed">{line}</li>;
        }
        // Empty line
        if (!line.trim()) {
          return <div key={i} className="h-2"></div>;
        }
        // Regular paragraph
        return <p key={i} className="text-slate-300 leading-relaxed mb-2">{line}</p>;
      })}
    </>
  );
}
