import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getUpdateById } from "../../../../actions";
import EditUpdateForm from "./EditUpdateForm";

export default async function EditUpdatePage({ params }: { params: Promise<{ id: string }> }) {
  const authed = await isAuthenticated();
  if (!authed) redirect("/admin/login");

  const { id } = await params;
  const update = await getUpdateById(id);
  if (!update) redirect("/admin/updates");

  return <EditUpdateForm update={update} />;
}
