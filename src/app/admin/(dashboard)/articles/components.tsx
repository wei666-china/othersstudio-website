"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit2, Trash2, Pin, PinOff } from "lucide-react";
import { deleteArticleAction, togglePinArticleAction } from "../../actions";

export function ArticleActions({ id, isPinned }: { id: string; isPinned: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm("确定删除这篇文章？")) return;
    startTransition(async () => {
      await deleteArticleAction(id);
      router.refresh();
    });
  }

  function handleTogglePin() {
    startTransition(async () => {
      await togglePinArticleAction(id, !isPinned);
      router.refresh();
    });
  }

  return (
    <div className={`flex items-center gap-1 ${isPending ? "opacity-50 pointer-events-none" : ""}`}>
      <button
        onClick={handleTogglePin}
        className="p-2 rounded-lg hover:bg-[#FAF6F1] transition-colors cursor-pointer bg-transparent border-none"
        title={isPinned ? "取消置顶" : "置顶"}
      >
        {isPinned ? <PinOff size={15} className="text-[#FF6B35]" /> : <Pin size={15} className="text-[#C9A88C]" />}
      </button>
      <Link
        href={`/admin/articles/${id}/edit`}
        className="p-2 rounded-lg hover:bg-[#FAF6F1] transition-colors"
      >
        <Edit2 size={15} className="text-[#6B4E3D]" />
      </Link>
      <button
        onClick={handleDelete}
        className="p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer bg-transparent border-none"
      >
        <Trash2 size={15} className="text-red-400" />
      </button>
    </div>
  );
}
