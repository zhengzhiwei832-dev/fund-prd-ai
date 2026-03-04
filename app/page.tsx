'use client';

import { useState, useCallback } from 'react';
import { RequirementForm } from '@/components/RequirementForm';
import { PRDViewer } from '@/components/PRDViewer';
import { AIProvider } from '@/lib/ai-config';
import { saveGeneration, updateGeneration } from '@/lib/supabase';

export default function Home() {
  const [generatedPRD, setGeneratedPRD] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [wasExported, setWasExported] = useState(false);

  const handleGenerate = async (
    requirement: string,
    context: string,
    provider: AIProvider,
    apiKey: string,
    model: string
  ) => {
    setIsLoading(true);
    setError('');
    setGeneratedPRD('');
    setCurrentRecordId(null);
    setWasExported(false);

    try {
      // Call our own API instead of directly calling AI API (to avoid CORS)
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirement,
          context,
          providerId: provider.id,
          apiKey,
          model,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '生成失败');
      }

      setGeneratedPRD(data.content);

      // Save to database
      const recordId = await saveGeneration({
        provider: provider.id,
        model,
        requirement,
        context,
        generated_content: content,
        was_edited: false,
        was_exported: false,
      });

      if (recordId) {
        setCurrentRecordId(recordId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback(async (editedContent: string, diff: string) => {
    if (currentRecordId) {
      await updateGeneration(currentRecordId, {
        edited_content: editedContent,
        edit_diff: diff,
        was_edited: true,
      });
    }
  }, [currentRecordId]);

  const handleDownload = useCallback(async () => {
    if (currentRecordId && !wasExported) {
      await updateGeneration(currentRecordId, {
        was_exported: true,
        export_format: 'markdown',
      });
      setWasExported(true);
    }
  }, [currentRecordId, wasExported]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            FundPRD AI
          </h1>
          <p className="text-lg text-gray-600">
            公募基金产品经理的智能 PRD 生成助手
          </p>
        </header>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Input Form */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                输入需求
              </h2>
              <RequirementForm
                onSubmit={handleGenerate}
                isLoading={isLoading}
              />
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
                  {error}
                </div>
              )}
            </div>

            {/* Right: PRD Output */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                生成的 PRD
              </h2>
              <div onClick={handleDownload}>
                <PRDViewer
                  content={generatedPRD}
                  isLoading={isLoading}
                  onEdit={handleEdit}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Powered by Multiple AI Models • 专为公募基金行业打造</p>
          <a
            href="/admin"
            className="text-gray-400 hover:text-gray-600 mt-2 inline-block"
          >
            管理员入口
          </a>
        </footer>
      </div>
    </main>
  );
}
