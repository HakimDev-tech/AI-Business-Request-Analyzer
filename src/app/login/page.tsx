import { WorkspaceLogin } from "@/components/workspace-login";

export const metadata = {
  title: "Workspace access",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <WorkspaceLogin />;
}
