import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getArticleById } from "../../../../actions";
import EditArticleForm from "./EditArticleForm";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const authed = await isAuthenticated();
  if (!authed) redirect("/admin/login");

  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) redirect("/admin/articles");

  return <EditArticleForm article={article} />;
}
