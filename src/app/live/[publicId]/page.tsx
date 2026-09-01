import { LiveViewer } from "./_components/LiveViewer";

export default async function LivePage({
  params,
}: PageProps<"/live/[publicId]">) {
  const { publicId } = await params;

  return <LiveViewer publicId={publicId} />;
}
