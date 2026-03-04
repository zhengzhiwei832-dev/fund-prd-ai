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

      const recordId = await saveGeneration({
        provider: provider.id,
        model,
        requirement,
        context,
        generated_content: data.content,
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
    <main className="min-h-screen bg-[#0a0a0f] text-slate-200 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient Mesh Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-950/60" />

        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Noise Texture Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="pt-16 pb-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            {/* Logo/Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-indigo-300 tracking-wide">AI Powered</span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                FundPRD
              </span>
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {' '}AI
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
              专为公募基金行业打造的
              <span className="text-indigo-300 font-medium">智能 PRD 生成引擎</span>
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {['TA/FA 系统集成', '基金业务术语', '合规要求内置', '多模型支持'].map((feature) => (
                <span
                  key={feature}
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Input Form */}
            <div className="group relative">
              {/* Card Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur" />

              <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 h-full">
                {/* Card Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">输入需求</h2>
                    <p className="text-sm text-slate-400">描述你的产品需求</p>
                  </div>
                </div>

                <RequirementForm onSubmit={handleGenerate} isLoading={isLoading} />

                {error && (
                  <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: PRD Output */}
            <div className="group relative">
              {/* Card Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-emerald-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur" />

              <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 h-full">
                {/* Card Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">生成的 PRD</h2>
                    <p className="text-sm text-slate-400">AI 生成的专业文档</p>
                  </div>
                </div>

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
        </div>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>系统运行正常</span>
              <span className="mx-2">•</span>
              <span>Powered by Multiple AI Models</span>
            </div>

            <div className="flex items-center gap-6">
              <a
                href="/admin"
                className="text-sm text-slate-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                管理员后台
              </a>
              <span className="text-slate-600">|</span>
              <span className="text-sm text-slate-500">
                © 2026 FundPRD AI
              </span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
