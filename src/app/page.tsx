import { WorkspaceDashboard } from "@/components/workspace-dashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Overview" };

export default function Home() {
  return <WorkspaceDashboard />;
}
