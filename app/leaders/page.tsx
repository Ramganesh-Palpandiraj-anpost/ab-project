import { AppShell } from "@/components/app-shell";
import { LeaderManager } from "@/components/leader-manager";

export default function Page() {
  return <AppShell title="Leaders" subtitle="Manage community leadership profiles"><LeaderManager /></AppShell>;
}
