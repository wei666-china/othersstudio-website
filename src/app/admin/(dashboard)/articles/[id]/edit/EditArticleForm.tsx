"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ImageIcon } from "lucide-react";
import { saveArticleAction, uploadImageAction } from "../../../../actions";
import { ImageUploader } from "../../../components/ImageUploader";

interface Article {
  id: string;
  title: string;
  tag: string;
  excerpt: string | null;
  content: string | null;
  cover_url: string | null;
  is_pinned: boolean;
  status: string;
}

export default function EditArticleForm({ article }: { article: Article }) {
  const [state, formAction, isPending] = useActionState(saveArticleAction, null);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [insertingImage, setInsertingImage] = useState(false);

  useEffect(() => {
    if (state?.success) router.push("/admin/articles");
  }, [state, router]);

  async function handleInsertImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setInsertingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadImageAction(formData);
    setInsertingImage(false);
    if (result.url && textareaRef.current) {
      const ta = textareaRef.current;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const text = ta.value;
      const imageMarkdown = `![](${result.url})`;
      ta.value = text.slice(0, start) + imageMarkdown + text.slice(end);
      ta.focus();
      ta.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
      const event = new Event("input", { bubbles: true });
      ta.dispatchEvent(event);
    }
    e.target.value = "";
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-[#3D2B1F] mb-8">编辑文章</h1>

      <form action={formAction} className="space-y-6 max-w-2xl">
        <input type="hidden" name="id" value={article.id} />

        <div>
          <label className="block text-xs font-medium text-[#6B4E3D] mb-2">标题</label>
          <input
            name="title"
            required
            defaultValue={article.title}
            className="w-full px-4 py-3 rounded-xl border border-[#C9A88C]/20 bg-white text-[#3D2B1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/20 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#6B4E3D] mb-2">标签分类</label>
            <select
              name="tag"
              defaultValue={article.tag}
              className="w-full px-4 py-3 rounded-xl border border-[#C9A88C]/20 bg-white text-[#3D2B1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/20 transition-all"
            >
              <option value="产品思考">产品思考</option>
              <option value="功能逻辑">功能逻辑</option>
              <option value="个人思考">个人思考</option>
              <option value="设计笔记">设计笔记</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B4E3D] mb-2">置顶</label>
            <select
              name="is_pinned"
              defaultValue={String(article.is_pinned)}
              className="w-full px-4 py-3 rounded-xl border border-[#C9A88C]/20 bg-white text-[#3D2B1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/20 transition-all"
            >
              <option value="false">不置顶</option>
              <option value="true">置顶</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6B4E3D] mb-2">摘要</label>
          <textarea
            name="excerpt"
            rows={2}
            defaultValue={article.excerpt || ""}
            className="w-full px-4 py-3 rounded-xl border border-[#C9A88C]/20 bg-white text-[#3D2B1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/20 transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6B4E3D] mb-2">封面图片</label>
          <ImageUploader name="cover_url" defaultValue={article.cover_url || ""} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-[#6B4E3D]">正文内容</label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={insertingImage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.7rem] font-medium text-[#5C3D2E] bg-[#FAF6F1] border border-[#C9A88C]/20 hover:bg-[#F0E8DF] transition-colors cursor-pointer disabled:opacity-50"
            >
              {insertingImage ? "上传中..." : <><ImageIcon size={13} /> 插入图片</>}
            </button>
          </div>
          <textarea
            ref={textareaRef}
            name="content"
            rows={12}
            defaultValue={article.content || ""}
            className="w-full px-4 py-3 rounded-xl border border-[#C9A88C]/20 bg-white text-[#3D2B1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/20 transition-all resize-y font-mono leading-relaxed"
          />
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleInsertImage} className="hidden" />
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
