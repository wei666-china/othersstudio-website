"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { saveUpdateAction } from "../../../../actions";
import { ImageUploader, MultiImageUploader } from "../../../components/ImageUploader";

interface UpdateData {
  id: string;
  type: string;
  title: string;
  content: string | null;
  cover_url: string | null;
  version: string | null;
  changelog: { text: string; highlight: boolean }[] | null;
  why: string | null;
  photos: string[] | null;
  status: string;
}

export default function EditUpdateForm({ update }: { update: UpdateData }) {
  const [state, formAction, isPending] = useActionState(saveUpdateAction, null);
  const [type, setType] = useState(update.type);
  const [changelog, setChangelog] = useState<{ text: string; highlight: boolean }[]>(update.changelog || []);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) router.push("/admin/updates");
  }, [state, router]);

  function addChangelogItem() {
    setChangelog((prev) => [...prev, { text: "", highlight: false }]);
  }

  function updateChangelogItem(index: number, text: string) {
    setChangelog((prev) => prev.map((item, i) => i === index ? { ...item, text } : item));
  }

  function toggleHighlight(index: number) {
    setChangelog((prev) => prev.map((item, i) => i === index ? { ...item, highlight: !item.highlight } : item));
  }

  function removeChangelogItem(index: number) {
    setChangelog((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-[#3D2B1F] mb-8">编辑动态</h1>

      <form action={formAction} className="space-y-6 max-w-2xl">
        <input type="hidden" name="id" value={update.id} />
        <input type="hidden" name="changelog" value={JSON.stringify(changelog)} />

        <div>
          <label className="block text-xs font-medium text-[#6B4E3D] mb-2">动态类型</label>
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[#C9A88C]/20 bg-white text-[#3D2B1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/20 transition-all"
          >
            <option value="thought">产品感想</option>
            <option value="app-update">App 更新</option>
            <option value="photo">照片</option>
          </select>
        </div>

        {type === "app-update" && (
          <div>
            <label className="block text-xs font-medium text-[#6B4E3D] mb-2">版本号</label>
            <input
              name="version"
              defaultValue={update.version || ""}
              className="w-full px-4 py-3 rounded-xl border border-[#C9A88C]/20 bg-white text-[#3D2B1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/20 transition-all"
              placeholder="例如 v2.4.0"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-[#6B4E3D] mb-2">标题</label>
          <input
            name="title"
            required
            defaultValue={update.title}
            className="w-full px-4 py-3 rounded-xl border border-[#C9A88C]/20 bg-white text-[#3D2B1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/20 transition-all"
          />
        </div>

        {/* 封面图 */}
        <div>
          <label className="block text-xs font-medium text-[#6B4E3D] mb-2">封面图</label>
          <ImageUploader name="cover_url" defaultValue={update.cover_url || ""} />
        </div>

        {type === "app-update" && (
          <>
            <div>
              <label className="block text-xs font-medium text-[#6B4E3D] mb-2">更新日志</label>
              <div className="space-y-2">
                {changelog.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleHighlight(i)}
                      className={`w-3 h-3 rounded-full flex-shrink-0 cursor-pointer border-none ${item.highlight ? "bg-[#FF6B35]" : "bg-[#C9A88C]"}`}
                      title="点击切换高亮"
                    />
                    <input
                      value={item.text}
                      onChange={(e) => updateChangelogItem(i, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-[#C9A88C]/20 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5C3D2E]/20 transition-all"
                      placeholder="更新内容..."
                    />
                    <button
                      type="button"
                      onClick={() => removeChangelogItem(i)}
                      className="text-xs text-red-400 hover:text-red-600 cursor-pointer bg-transparent border-none"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addChangelogItem}
                className="mt-2 text-xs text-[#5C3D2E] font-medium cursor-pointer bg-transparent border-none hover:underline"
              >
                + 添加一条
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B4E3D] mb-2">为什么做这个</label>
              <textarea
                name="why"
                rows={4}
                defaultValue={update.why || ""}
                className="w-full px-4 py-3 rounded-xl border border-[#C9A88C]/20 bg-white text-[#3D2B1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/20 transition-all resize-none"
              />
            </div>
          </>
        )}

        {/* 附带照片 */}
        <div>
          <label className="block text-xs font-medium text-[#6B4E3D] mb-2">附带照片（可选）</label>
          <MultiImageUploader name="photos" defaultValue={update.photos || []} />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6B4E3D] mb-2">
            {type === "app-update" ? "补充说明（可选）" : "正文内容"}
          </label>
          <textarea
            name="content"
            rows={6}
            defaultValue={update.content || ""}
            className="w-full px-4 py-3 rounded-xl border border-[#C9A88C]/20 bg-white text-[#3D2B1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/20 transition-all resize-y"
          />
        </div>

        {state?.error && (
          <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            name="action_type"
            value="publish"
            disabled={isPending}
            className="px-6 py-3 bg-[#3D2B1F] text-white text-sm font-medium rounded-xl hover:bg-[#5C3D2E] transition-colors disabled:opacity-50 cursor-pointer border-none"
          >
            {isPending ? "保存中..." : "发布"}
          </button>
          <button
            type="submit"
            name="action_type"
            value="draft"
            disabled={isPending}
            className="px-6 py-3 bg-white text-[#3D2B1F] text-sm font-medium rounded-xl border border-[#C9A88C]/20 hover:bg-[#FAF6F1] transition-colors disabled:opacity-50 cursor-pointer"
          >
            存为草稿
          </button>
        </div>
      </form>
    </div>
  );
}
