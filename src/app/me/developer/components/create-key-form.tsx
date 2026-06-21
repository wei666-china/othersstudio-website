"use client";

import { useState } from "react";
import { generateApiKey } from "../actions";
import { useRouter } from "next/navigation";

export function CreateKeyForm({ activeCount }: { activeCount: number }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const atLimit = activeCount >= 5;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (atLimit) return;

    setLoading(true);
    setError(null);

    const result = await generateApiKey(name.trim());

    if ("error" in result) {
      setError(result.error);
    } else {
      setNewKey(result.key);
      setName("");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleCopy() {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDismiss() {
    setNewKey(null);
    setCopied(false);
  }

  if (newKey) {
    return (
      <div className="bg-white rounded-2xl border-2 border-green-200 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-3.5 h-3.5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-green-800">Key 已生成</h3>
        </div>
        <p className="text-xs text-[#6B4E3D] mb-3">
          请立即复制保存，此 Key 不会再次显示。
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-[#FAF6F1] border border-[#C9A88C]/20 rounded-lg px-3 py-2.5 text-xs font-mono text-[#3D2B1F] break-all select-all">
            {newKey}
          </code>
          <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-red-50 border border-red-100">
            <svg
              className="w-3.5 h-3.5 text-red-500 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="text-[11px] font-medium text-red-600 leading-tight">
              请勿把 API 码
              <br />
              发送给任何人
            </span>
          </div>
          <button
            onClick={handleCopy}
            className={`shrink-0 px-4 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              copied
                ? "bg-green-100 text-green-700"
                : "bg-[#3D2B1F] text-white hover:bg-[#5C3D2E]"
            }`}
          >
            {copied ? "已复制" : "复制"}
          </button>
        </div>
        <button
          onClick={handleDismiss}
          className="mt-3 text-xs text-[#6B4E3D] hover:text-[#3D2B1F] transition-colors cursor-pointer"
        >
          我已保存，关闭此提示
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleCreate}>
      <div className="bg-white rounded-2xl border border-[#C9A88C]/15 p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-[#3D2B1F] mb-3">创建新 Key</h3>

        <div className="mb-4 rounded-xl bg-[#FBF3EC] border border-[#C9A88C]/30 p-4">
          <div className="flex items-start gap-2.5">
            <svg
              className="w-4 h-4 text-[#A86B3D] shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
              />
            </svg>
            <div className="text-[12px] leading-relaxed text-[#6B4E3D]">
              <p className="font-semibold text-[#3D2B1F] mb-1">使用前请知悉</p>
              <ul className="space-y-1 list-disc list-inside marker:text-[#A86B3D]">
                <li>API Key 等同于你账号健康数据的访问凭证，请妥善保管。</li>
                <li>请勿将 Key 分享、提交到代码仓库或发送给任何人。</li>
                <li>若因个人保管不当导致 Key 泄露，由此产生的后果需自行承担。</li>
                <li>如怀疑 Key 已泄露，请立即在下方撤销并重新生成。</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="给这个 Key 起个名字（如：My Cursor Agent）"
            maxLength={50}
            disabled={atLimit}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#C9A88C]/20 bg-[#FAF6F1] text-sm text-[#3D2B1F] placeholder:text-[#A08060] focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/20 focus:border-[#5C3D2E]/40 disabled:opacity-50 transition-all"
          />
          <button
            type="submit"
            disabled={loading || !name.trim() || atLimit}
            className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-[#3D2B1F] hover:bg-[#5C3D2E] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {loading ? "生成中..." : atLimit ? "已达上限" : "生成 Key"}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        {atLimit && (
          <p className="mt-2 text-xs text-amber-600">
            已达到 5 个活跃 Key 上限，请先撤销不用的 Key
          </p>
        )}
      </div>
    </form>
  );
}
