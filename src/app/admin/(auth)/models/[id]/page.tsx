import { redirect } from "next/navigation";

// Редактор модели переехал в /admin/products/models/[id] (просмотр + редактирование)
export default async function ModelEditorRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/products/models/${id}`);
}
