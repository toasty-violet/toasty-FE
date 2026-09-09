import { LiveEditScreen } from "./_components/LiveEditScreen";

export default async function EditLivePage({
  params,
}: PageProps<"/shop/lives/[publicId]/edit">) {
  const { publicId } = await params;

  return <LiveEditScreen publicId={publicId} />;
}
