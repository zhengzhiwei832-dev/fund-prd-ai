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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* AI Provider Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          选择 AI 模型 <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedProvider.id}
          onChange={(e) => handleProviderChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {AI_PROVIDERS.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.logo} {provider.name}
            </option>
          ))}
        </select>
      </div>

      {/* Model Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          模型版本
        </label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {selectedProvider.modelOptions.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* API Key Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          API Key <span className="text-red-500">*</span>
          <a
            href={selectedProvider.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-xs text-blue-600 hover:underline"
          >
            如何获取?
          </a>
        </label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={selectedProvider.keyPlaceholder}
            className="w-full px-4 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
          >
            {showKey ? '隐藏' : '显示'}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          API Key 仅存储在您的浏览器中，不会发送到我们的服务器
        </p>
      </div>

      <hr className="border-gray-200" />

      {/* Requirement Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          原始需求描述 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          placeholder="例如：需要开发一个货币基金快速赎回功能，支持T+0到账，单日限额1万元..."
          className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          required
        />
      </div>

      {/* Context Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          补充上下文（可选）
        </label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="例如：现有系统使用自建TA，需要对接工行、招行渠道，投资者类型包括个人和机构..."
          className="w-full h-20 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !requirement.trim() || !apiKey.trim()}
        className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all ${
          isLoading || !requirement.trim() || !apiKey.trim()
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
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
            生成中...
          </span>
        ) : (
          '生成 PRD'
        )}
      </button>
    </form>
  );
}
