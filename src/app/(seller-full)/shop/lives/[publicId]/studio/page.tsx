import { BroadcastStudio } from "./_components/BroadcastStudio";

export default async function StudioPage({
  params,
}: PageProps<"/shop/lives/[publicId]/studio">) {
  const { publicId } = await params;

  return <BroadcastStudio publicId={publicId} />;
}
