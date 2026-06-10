"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Plus, Trash2, GripVertical } from "lucide-react";
import { getSettingsAction, saveSettingsAction } from "../../actions";
import { ImageUploader } from "../components/ImageUploader";

type Tab = "product" | "team" | "social";

interface ProductData {
  title: string;
  subtitle: string;
  description: string;
  detail: string;
  features: string[];
  app_store_url: string;
}

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  avatar_url: string;
  initial: string;
}

interface SocialData {
  twitter: string;
  github: string;
  email: string;
  app_store: string;
  custom_links: { label: string; url: string }[];
}

const defaultProduct: ProductData = {
  title: "DAY 1 — 你的智能健身伙伴",
  subtitle: "不只是记录，更是理解",
  description: "用 AI 重新定义训练记录与恢复管理，让每一天都是最好的 Day 1。",
  detail: "DAY 1 结合 Apple Health 数据和 AI 分析，帮你了解身体状态，智能规划训练，并在你需要时提供个性化的教练建议。",
  features: [
    "AI 实时教练 — 训练中的智能语音指导",
    "身体准备度 — 基于 HRV/睡眠的每日状态评估",
    "智能训练计划 — 根据恢复情况动态调整",
    "Apple Watch 联动 — 手腕上的训练助手",
    "训练数据分析 — 可视化你的进步轨迹",
  ],
  app_store_url: "",
};

const defaultTeam: TeamMember[] = [
  { name: "创始人", role: "产品 & 设计", bio: "独立开发者，热爱用技术解决真实问题。", avatar_url: "", initial: "L" },
  { name: "成员 A", role: "iOS 开发", bio: "Swift 爱好者，专注于流畅的用户体验。", avatar_url: "", initial: "A" },
  { name: "成员 B", role: "AI & 后端", bio: "机器学习工程师，让数据有温度。", avatar_url: "", initial: "B" },
];

const defaultSocial: SocialData = {
  twitter: "",
  github: "",
  email: "",
  app_store: "",
  custom_links: [],
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("product");
  const [product, setProduct] = useState<ProductData>(defaultProduct);
  const [team, setTeam] = useState<TeamMember[]>(defaultTeam);
  const [social, setSocial] = useState<SocialData>(defaultSocial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const [pRes, tRes, sRes] = await Promise.all([
        getSettingsAction("product"),
        getSettingsAction("team"),
        getSettingsAction("social"),
      ]);
      if (pRes.value) setProduct(pRes.value as ProductData);
      if (tRes.value) setTeam(tRes.value as TeamMember[]);
      if (sRes.value) setSocial(sRes.value as SocialData);
      setLoaded(true);
    }
    load();
  }, []);

  const save = useCallback(async (key: string, value: unknown) => {
    setSaving(true);
    setMessage("");
    const result = await saveSettingsAction(key, value);
    setSaving(false);
    if (result.error) {
      setMessage(`保存失败：${result.error}`);
    } else {
      setMessage("已保存");
      setTimeout(() => setMessage(""), 2000);
    }
  }, []);

  if (!loaded) {
    return <div className="py-20 text-center text-[#A08060]">加载中...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-[#3D2B1F] mb-1">网站设置</h1>
          <p className="text-sm text-[#A08060]">管理产品信息、团队介绍和社交链接</p>
        </div>
        {message && (
          <span className={`text-xs px-3 py-1.5 rounded-lg ${message.includes("失败") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
            {message}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F0E8DF] rounded-full p-1 w-fit mb-8">
        {([["product", "产品信息"], ["team", "团队成员"], ["social", "社交链接"]] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all border-none cursor-pointer font-sans ${
              activeTab === key ? "bg-white text-[#3D2B1F] shadow-sm" : "bg-transparent text-[#A08060] hover:text-[#3D2B1F]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Product Tab */}
      {activeTab === "product" && (
        <div className="space-y-5 max-w-2xl">
          <Field label="产品标题" value={product.title} onChange={(v) => setProduct({ ...product, title: v })} />
          <Field label="副标题" value={product.subtitle} onChange={(v) => setProduct({ ...product, subtitle: v })} />
          <Field label="简短描述" value={product.description} onChange={(v) => setProduct({ ...product, description: v })} />
          <FieldTextarea label="详细介绍" value={product.detail} onChange={(v) => setProduct({ ...product, detail: v })} rows={3} />
          <Field label="App Store 链接" value={product.app_store_url} onChange={(v) => setProduct({ ...product, app_store_url: v })} placeholder="https://apps.apple.com/..." />

          <div>
            <label className="block text-xs font-medium text-[#6B4E3D] mb-2">功能特性</label>
            <div className="space-y-2">
              {product.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C9A88C] flex-shrink-0" />
                  <input
                    value={feat}
                    onChange={(e) => {
                      const updated = [...product.features];
                      updated[i] = e.target.value;
                      setProduct({ ...product, features: updated });
                    }}
                    className="flex-1 px-3 py-2 rounded-lg border border-[#C9A88C]/20 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5C3D2E]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setProduct({ ...product, features: product.features.filter((_, j) => j !== i) })}
                    className="text-xs text-red-400 hover:text-red-600 cursor-pointer bg-transparent border-none"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setProduct({ ...product, features: [...product.features, ""] })}
              className="mt-2 text-xs text-[#5C3D2E] font-medium cursor-pointer bg-transparent border-none hover:underline"
            >
              + 添加特性
            </button>
          </div>

          <SaveButton saving={saving} onClick={() => save("product", product)} />
        </div>
      )}

      {/* Team Tab */}
      {activeTab === "team" && (
        <div className="space-y-6 max-w-2xl">
          {team.map((member, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-[#C9A88C]/15 relative">
              <div className="absolute top-3 right-3 flex gap-1">
                <button
                  type="button"
                  onClick={() => setTeam(team.filter((_, j) => j !== i))}
                  className="p-1.5 rounded-lg hover:bg-red-50 cursor-pointer bg-transparent border-none"
                >
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[0.65rem] font-medium text-[#6B4E3D] mb-1">姓名</label>
                  <input
                    value={member.name}
                    onChange={(e) => { const u = [...team]; u[i] = { ...u[i], name: e.target.value }; setTeam(u); }}
                    className="w-full px-3 py-2 rounded-lg border border-[#C9A88C]/20 bg-[#FAF6F1] text-sm focus:outline-none focus:ring-1 focus:ring-[#5C3D2E]/20"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-medium text-[#6B4E3D] mb-1">角色</label>
                  <input
                    value={member.role}
                    onChange={(e) => { const u = [...team]; u[i] = { ...u[i], role: e.target.value }; setTeam(u); }}
                    className="w-full px-3 py-2 rounded-lg border border-[#C9A88C]/20 bg-[#FAF6F1] text-sm focus:outline-none focus:ring-1 focus:ring-[#5C3D2E]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[0.65rem] font-medium text-[#6B4E3D] mb-1">首字母</label>
                  <input
                    value={member.initial}
                    maxLength={2}
                    onChange={(e) => { const u = [...team]; u[i] = { ...u[i], initial: e.target.value }; setTeam(u); }}
                    className="w-full px-3 py-2 rounded-lg border border-[#C9A88C]/20 bg-[#FAF6F1] text-sm focus:outline-none focus:ring-1 focus:ring-[#5C3D2E]/20"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-medium text-[#6B4E3D] mb-1">头像链接</label>
                  <input
                    value={member.avatar_url}
                    onChange={(e) => { const u = [...team]; u[i] = { ...u[i], avatar_url: e.target.value }; setTeam(u); }}
                    className="w-full px-3 py-2 rounded-lg border border-[#C9A88C]/20 bg-[#FAF6F1] text-sm focus:outline-none focus:ring-1 focus:ring-[#5C3D2E]/20"
                    placeholder="上传后粘贴链接"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.65rem] font-medium text-[#6B4E3D] mb-1">简介</label>
                <textarea
                  value={member.bio}
                  onChange={(e) => { const u = [...team]; u[i] = { ...u[i], bio: e.target.value }; setTeam(u); }}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-[#C9A88C]/20 bg-[#FAF6F1] text-sm focus:outline-none focus:ring-1 focus:ring-[#5C3D2E]/20 resize-none"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setTeam([...team, { name: "", role: "", bio: "", avatar_url: "", initial: "" }])}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-[#5C3D2E] font-medium bg-[#FAF6F1] border border-[#C9A88C]/20 rounded-xl cursor-pointer hover:bg-[#F0E8DF] transition-colors"
          >
            <Plus size={16} /> 添加成员
          </button>

          <SaveButton saving={saving} onClick={() => save("team", team)} />
        </div>
      )}

      {/* Social Tab */}
      {activeTab === "social" && (
        <div className="space-y-5 max-w-2xl">
          <Field label="Twitter / X" value={social.twitter} onChange={(v) => setSocial({ ...social, twitter: v })} placeholder="https://x.com/..." />
          <Field label="GitHub" value={social.github} onChange={(v) => setSocial({ ...social, github: v })} placeholder="https://github.com/..." />
          <Field label="邮箱" value={social.email} onChange={(v) => setSocial({ ...social, email: v })} placeholder="hello@example.com" />
          <Field label="App Store" value={social.app_store} onChange={(v) => setSocial({ ...social, app_store: v })} placeholder="https://apps.apple.com/..." />

          <div>
            <label className="block text-xs font-medium text-[#6B4E3D] mb-2">自定义链接</label>
            <div className="space-y-2">
              {social.custom_links.map((link, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={link.label}
                    onChange={(e) => {
                      const updated = [...social.custom_links];
                      updated[i] = { ...updated[i], label: e.target.value };
                      setSocial({ ...social, custom_links: updated });
                    }}
                    className="w-28 px-3 py-2 rounded-lg border border-[#C9A88C]/20 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5C3D2E]/20"
                    placeholder="名称"
                  />
                  <input
                    value={link.url}
                    onChange={(e) => {
                      const updated = [...social.custom_links];
                      updated[i] = { ...updated[i], url: e.target.value };
                      setSocial({ ...social, custom_links: updated });
                    }}
                    className="flex-1 px-3 py-2 rounded-lg border border-[#C9A88C]/20 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5C3D2E]/20"
                    placeholder="https://..."
                  />
                  <button
                    type="button"
                    onClick={() => setSocial({ ...social, custom_links: social.custom_links.filter((_, j) => j !== i) })}
                    className="text-xs text-red-400 hover:text-red-600 cursor-pointer bg-transparent border-none"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSocial({ ...social, custom_links: [...social.custom_links, { label: "", url: "" }] })}
              className="mt-2 text-xs text-[#5C3D2E] font-medium cursor-pointer bg-transparent border-none hover:underline"
            >
              + 添加链接
            </button>
          </div>

          <SaveButton saving={saving} onClick={() => save("social", social)} />
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#6B4E3D] mb-2">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-[#C9A88C]/20 bg-white text-[#3D2B1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/20 transition-all"
        placeholder={placeholder}
      />
    </div>
  );
}

function FieldTextarea({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#6B4E3D] mb-2">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-4 py-3 rounded-xl border border-[#C9A88C]/20 bg-white text-[#3D2B1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/20 transition-all resize-y"
      />
    </div>
  );
}

function SaveButton({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <div className="pt-4">
      <button
        type="button"
        onClick={onClick}
        disabled={saving}
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#3D2B1F] text-white text-sm font-medium rounded-xl hover:bg-[#5C3D2E] transition-colors disabled:opacity-50 cursor-pointer border-none"
      >
        <Save size={16} />
        {saving ? "保存中..." : "保存"}
      </button>
    </div>
  );
}
