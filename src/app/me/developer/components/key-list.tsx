"use client";

import { useState } from "react";
import { revokeApiKey, type ApiKeyRecord } from "../actions";
import { useRouter } from "next/navigation";

export function KeyList({ keys }: { keys: ApiKeyRecord[] }) {
  return (
    <div className="bg-white rounded-2xl border border-[#C9A88C]/15 overflow-hidden">
      <div className="divide-y divide-[#C9A88C]/10">
        {keys.map((k) => (
          <KeyRow key={k.id} apiKey={k} />
        ))}
      </div>
    </div>
  );
}

function KeyRow({ apiKey }: { apiKey: ApiKeyRecord }) {
  const [revoking, setRevoking] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  async function handleRevoke() {
    setRevoking(true);
    const result = await revokeApiKey(apiKey.id);
    if (result.success) {
      router.refresh();
    }
    setRevoking(false);
    setShowConfirm(false);
  }

  const usagePercent = Math.round(
    (apiKey.usage_count / apiKey.monthly_limit) * 100
  );

  return (
    <div className="px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-[#3D2B1F]">{apiKey.name}</p>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-600">
              活跃
            </span>
          </div>
          <p className="text-xs text-[#A08060] font-mono mt-1">
            {apiKey.key_prefix}••••••••••••••••
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-[#6B4E3D]">
            <span>
              用量 {apiKey.usage_count}/{apiKey.monthly_limit}
            </span>
            <span>
              创建于{" "}
              {new Date(apiKey.created_at).toLocaleDateString("zh-CN", {
                month: "short",
                day: "numeric",
              })}
            </span>
            {apiKey.last_used_at && (
              <span>
                最后使用{" "}
                {new Date(apiKey.last_used_at).toLocaleDateString("zh-CN", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
          <div className="mt-2 w-32 h-1.5 rounded-full bg-[#F3EDE6] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                usagePercent > 80
                  ? "bg-red-400"
                  : usagePercent > 50
                  ? "bg-amber-400"
                  : "bg-green-400"
              }`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
        </div>

        <div className="shrink-0">
          {showConfirm ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleRevoke}
                disabled={revoking}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {revoking ? "撤销中..." : "确认撤销"}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-[#6B4E3D] hover:bg-[#FAF6F1] transition-colors cursor-pointer"
              >
                取消
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="px-3 py-1.5 rounded-lg text-xs text-[#6B4E3D] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              撤销
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
