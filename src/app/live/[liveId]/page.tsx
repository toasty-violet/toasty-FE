import { LiveViewer } from "./_components/LiveViewer";

export default async function LivePage({
  params,
}: PageProps<"/live/[liveId]">) {
  const { liveId } = await params;

  return <LiveViewer liveId={Number(liveId)} />;
}
