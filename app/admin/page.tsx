'use client';

import { useState } from 'react';
import { getGenerations, getDashboardStats, DashboardStats, GenerationRecord } from '@/lib/supabase';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [generations, setGenerations] = useState<GenerationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<GenerationRecord | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  const handleLogin = () => {
    // Simple password protection - in production use proper auth
    if (password === 'fundprd2024') {
      setIsAuthenticated(true);
      loadData();
    } else {
      alert('密码错误');
    }
  };

  const loadData = async () => {
    setLoading(true);
    const [statsData, gensData] = await Promise.all([
      getDashboardStats(30),
      getGenerations(50),
    ]);
    setStats(statsData);
    setGenerations(gensData);
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">管理员登录</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="输入管理员密码"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">FundPRD AI 管理后台</h1>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              刷新数据
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">加载中...</div>
        ) : stats ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="总生成次数"
                value={stats.totalGenerations}
                color="blue"
              />
              <StatCard
                title="编辑次数"
                value={stats.totalEdited}
                color="yellow"
              />
              <StatCard
                title="导出次数"
                value={stats.totalExported}
                color="green"
              />
              <StatCard
                title="导出率"
                value={`${stats.exportRate.toFixed(1)}%`}
                color="purple"
                subtitle="导出次数 / 生成次数"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Export Rate Trend */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">导出率趋势 (近30天)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => date.slice(5)} />
                    <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                    <Tooltip formatter={(val) => typeof val === 'number' ? `${val.toFixed(1)}%` : val} />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Provider Distribution */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">AI 提供商分布</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.providerStats}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="count"
                      nameKey="provider"
                      label={(props) => {
                        const { provider, count } = props as { provider: string; count: number };
                        return `${provider}: ${count}`;
                      }}
                    >
                      {stats.providerStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Daily Activity Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">每日活动量 (近30天)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(date) => date.slice(5)} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="generated" fill="#3B82F6" name="生成次数" />
                  <Bar dataKey="exported" fill="#10B981" name="导出次数" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Generations Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800">最近生成记录</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">AI</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">需求摘要</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">编辑</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">导出</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {generations.map((gen) => (
                      <tr key={gen.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {gen.created_at?.slice(0, 16).replace('T', ' ')}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {gen.provider}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                          {gen.requirement.slice(0, 50)}...
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {gen.was_edited ? (
                            <span className="text-yellow-600">✓</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {gen.was_exported ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => setSelectedRecord(gen)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            查看详情
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">暂无数据</div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">生成详情</h2>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="font-medium">AI 提供商: </span>
                  {selectedRecord.provider} / {selectedRecord.model}
                </div>

                <div>
                  <span className="font-medium">原始需求: </span>
                  <p className="mt-1 p-3 bg-gray-50 rounded">{selectedRecord.requirement}</p>
                </div>

                {selectedRecord.was_edited && (
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-medium">编辑记录: </span>
                      <button
                        onClick={() => setShowDiff(!showDiff)}
                        className="text-sm text-blue-600"
                      >
                        {showDiff ? '隐藏' : '显示'}修改对比
                      </button>
                    </div>
                    {showDiff && selectedRecord.edit_diff && (
                      <pre className="p-3 bg-yellow-50 rounded text-sm overflow-x-auto">
                        {selectedRecord.edit_diff}
                      </pre>
                    )}
                  </div>
                )}

                <div>
                  <span className="font-medium">生成的 PRD: </span>
                  <pre className="mt-1 p-3 bg-gray-50 rounded text-sm overflow-x-auto max-h-96">
                    {selectedRecord.edited_content || selectedRecord.generated_content}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  color: string;
  subtitle?: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className={`p-6 rounded-xl ${colorClasses[color]}`}>
      <p className="text-sm opacity-80">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {subtitle && <p className="text-xs mt-2 opacity-60">{subtitle}</p>}
    </div>
  );
}
