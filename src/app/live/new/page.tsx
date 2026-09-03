import { RouteGuard } from "@/components/RouteGuard";
import { LiveStudio } from "./_components/LiveStudio";

export default function NewLivePage() {
  return (
    <RouteGuard require="SELLER">
      <LiveStudio />
    </RouteGuard>
  );
}
