"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit2, Trash2 } from "lucide-react";
import { deleteUpdateAction } from "../../actions";

export function UpdateActions({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm("确定删除这条动态？")) return;
    startTransition(async () => {
      await deleteUpdateAction(id);
      router.refresh();
    });
  }

  return (
    <div className={`flex items-center gap-1 ${isPending ? "opacity-50 pointer-events-none" : ""}`}>
      <Link
        href={`/admin/updates/${id}/edit`}
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
