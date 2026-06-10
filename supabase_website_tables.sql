-- ============================================================
-- DAY 1 官网内容管理表
-- 注意：使用 website_ 前缀，和 App 数据表完全隔离
-- ============================================================

-- 文章/思考表
CREATE TABLE IF NOT EXISTS website_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT,
  tag TEXT NOT NULL DEFAULT '个人思考',
  excerpt TEXT,
  content TEXT,
  cover_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  is_pinned BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 动态表
CREATE TABLE IF NOT EXISTS website_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'thought' CHECK (type IN ('app-update', 'photo', 'thought')),
  title TEXT NOT NULL,
  content TEXT,
  cover_url TEXT,
  version TEXT,
  changelog JSONB DEFAULT '[]'::jsonb,
  why TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_website_articles_status ON website_articles(status);
CREATE INDEX IF NOT EXISTS idx_website_articles_published_at ON website_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_website_articles_pinned ON website_articles(is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_website_updates_status ON website_updates(status);
CREATE INDEX IF NOT EXISTS idx_website_updates_published_at ON website_updates(published_at DESC);

-- RLS 策略：公开读取已发布内容，写入仅限 service_role
ALTER TABLE website_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "website_articles_public_read" ON website_articles
  FOR SELECT USING (status = 'published');

CREATE POLICY "website_articles_service_write" ON website_articles
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "website_updates_public_read" ON website_updates
  FOR SELECT USING (status = 'published');

CREATE POLICY "website_updates_service_write" ON website_updates
  FOR ALL USING (true) WITH CHECK (true);

-- 网站设置键值表
CREATE TABLE IF NOT EXISTS website_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "website_settings_public_read" ON website_settings
  FOR SELECT USING (true);

CREATE POLICY "website_settings_service_write" ON website_settings
  FOR ALL USING (true) WITH CHECK (true);

-- 预设初始数据
INSERT INTO website_settings (key, value) VALUES
('product', '{
  "title": "DAY 1 — 你的智能健身伙伴",
  "subtitle": "不只是记录，更是理解",
  "description": "用 AI 重新定义训练记录与恢复管理，让每一天都是最好的 Day 1。",
  "detail": "DAY 1 结合 Apple Health 数据和 AI 分析，帮你了解身体状态，智能规划训练，并在你需要时提供个性化的教练建议。",
  "features": [
    "AI 实时教练 — 训练中的智能语音指导",
    "身体准备度 — 基于 HRV/睡眠的每日状态评估",
    "智能训练计划 — 根据恢复情况动态调整",
    "Apple Watch 联动 — 手腕上的训练助手",
    "训练数据分析 — 可视化你的进步轨迹"
  ],
  "app_store_url": ""
}'::jsonb),
('team', '[
  {"name": "创始人", "role": "产品 & 设计", "bio": "独立开发者，热爱用技术解决真实问题。相信好的产品来自对生活的细致观察。", "avatar_url": "", "initial": "L"},
  {"name": "成员 A", "role": "iOS 开发", "bio": "Swift 爱好者，专注于流畅的用户体验和性能优化。让每一帧都丝滑如初。", "avatar_url": "", "initial": "A"},
  {"name": "成员 B", "role": "AI & 后端", "bio": "机器学习工程师，负责 AI 教练和智能推荐算法。让数据有温度。", "avatar_url": "", "initial": "B"}
]'::jsonb),
('social', '{
  "twitter": "",
  "github": "",
  "email": "",
  "app_store": "",
  "custom_links": []
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Storage bucket (run separately in Supabase Dashboard > Storage)
-- CREATE BUCKET: website-images (public)
