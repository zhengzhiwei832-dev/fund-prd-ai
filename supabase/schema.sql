-- 创建生成记录表
CREATE TABLE IF NOT EXISTS generations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    requirement TEXT NOT NULL,
    context TEXT,
    generated_content TEXT NOT NULL,
    edited_content TEXT,
    edit_diff TEXT,
    was_edited BOOLEAN DEFAULT FALSE,
    was_exported BOOLEAN DEFAULT FALSE,
    export_format TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_provider ON generations(provider);
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);

-- 启用 RLS (Row Level Security)
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许匿名插入
CREATE POLICY "Allow anonymous insert" ON generations
    FOR INSERT TO anon
    WITH CHECK (true);

-- 创建策略：允许匿名查询（用于验证数据）
CREATE POLICY "Allow anonymous select" ON generations
    FOR SELECT TO anon
    USING (true);

-- 创建更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
DROP TRIGGER IF EXISTS update_generations_updated_at ON generations;
CREATE TRIGGER update_generations_updated_at
    BEFORE UPDATE ON generations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
