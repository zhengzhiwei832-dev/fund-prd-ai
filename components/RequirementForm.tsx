'use client';

import { useState } from 'react';
import { AI_PROVIDERS, AIProvider } from '@/lib/ai-config';

interface RequirementFormProps {
  onSubmit: (requirement: string, context: string, provider: AIProvider, apiKey: string, model: string) => void;
  isLoading: boolean;
}

export function RequirementForm({ onSubmit, isLoading }: RequirementFormProps) {
  const [requirement, setRequirement] = useState('');
  const [context, setContext] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(AI_PROVIDERS[0]);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(AI_PROVIDERS[0].defaultModel);
  const [showKey, setShowKey] = useState(false);

  const handleProviderChange = (providerId: string) => {
    const provider = AI_PROVIDERS.find(p => p.id === providerId);
    if (provider) {
      setSelectedProvider(provider);
      setModel(provider.defaultModel);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(requirement, context, selectedProvider, apiKey, model);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* AI Provider Selection */}
      <div className="group">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          选择 AI 模型 <span className="text-indigo-400">*</span>
        </label>
        <div className="relative">
          <select
            value={selectedProvider.id}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-slate-200
                       focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
                       transition-all duration-300 appearance-none cursor-pointer
                       hover:bg-slate-800/70"
          >
            {AI_PROVIDERS.map((provider) => (
              <option key={provider.id} value={provider.id} className="bg-slate-800">
                {provider.logo} {provider.name}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <div className="group">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          模型版本
        </label>
        <div className="relative">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-slate-200
                       focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
                       transition-all duration-300 appearance-none cursor-pointer
                       hover:bg-slate-800/70"
          >
            {selectedProvider.modelOptions.map((m) => (
              <option key={m} value={m} className="bg-slate-800">
                {m}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* API Key Input */}
      <div className="group">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          API Key <span className="text-indigo-400">*</span>
          <a
            href={selectedProvider.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
          >
            如何获取?
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={selectedProvider.keyPlaceholder}
            className="w-full px-4 py-3 pr-24 bg-slate-800/50 border border-white/10 rounded-xl text-slate-200
                       placeholder:text-slate-500
                       focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
                       transition-all duration-300"
            required
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-medium
                       text-slate-400 hover:text-slate-200 bg-slate-700/50 hover:bg-slate-700
                       rounded-lg transition-all duration-200"
          >
            {showKey ? '隐藏' : '显示'}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          API Key 仅存储在您的浏览器中，不会发送到我们的服务器
        </p>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Requirement Input */}
      <div className="group">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          原始需求描述 <span className="text-indigo-400">*</span>
        </label>
        <textarea
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          placeholder="例如：需要开发一个货币基金快速赎回功能，支持T+0到账，单日限额1万元..."
          className="w-full h-36 px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-slate-200
                     placeholder:text-slate-500
                     focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
                     transition-all duration-300 resize-none"
          required
        />
      </div>

      {/* Context Input */}
      <div className="group">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          补充上下文（可选）
        </label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="例如：现有系统使用自建TA，需要对接工行、招行渠道，投资者类型包括个人和机构..."
          className="w-full h-24 px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-slate-200
                     placeholder:text-slate-500
                     focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
                     transition-all duration-300 resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !requirement.trim() || !apiKey.trim()}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300
                   relative overflow-hidden group
          ${isLoading || !requirement.trim() || !apiKey.trim()
            ? 'bg-slate-700 cursor-not-allowed text-slate-400'
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 '
              + 'shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 '
              + 'transform hover:-translate-y-0.5 active:translate-y-0'
          }`}
      >
        {/* Button Glow Effect */}
        {!isLoading && requirement.trim() && apiKey.trim() && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                          translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        )}

        <span className="relative flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              AI 正在生成 PRD...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              生成 PRD
            </>
          )}
        </span>
      </button>
    </form>
  );
}
