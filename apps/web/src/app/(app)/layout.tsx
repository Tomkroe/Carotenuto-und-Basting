import { AppSidebar } from "@/components/AppSidebar";
import { AssistantWidget } from "@/components/AssistantWidget";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <AppSidebar />
      <div className="fixed right-6 top-6 z-50">
        <ThemeToggle />
      </div>
      <main className="ml-64 min-h-screen">{children}</main>
      <AssistantWidget />
    </div>
  );
}
