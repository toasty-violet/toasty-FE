import { RouteGuard } from "@/components/RouteGuard";
import { BroadcastStudio } from "./_components/BroadcastStudio";

export default async function StudioPage({
  params,
}: PageProps<"/shop/lives/[publicId]/studio">) {
  const { publicId } = await params;

  return (
    <RouteGuard require="SELLER">
      <BroadcastStudio publicId={publicId} />
    </RouteGuard>
  );
}
