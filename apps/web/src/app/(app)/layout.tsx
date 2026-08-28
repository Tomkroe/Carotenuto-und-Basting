import { AppSidebar } from "@/components/AppSidebar";
import { AssistantWidget } from "@/components/AssistantWidget";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <AppSidebar />
      <main className="ml-64 min-h-screen">{children}</main>
      <AssistantWidget />
    </div>
  );
}
