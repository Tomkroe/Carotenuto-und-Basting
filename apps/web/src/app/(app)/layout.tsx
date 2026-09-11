import { AppSidebar } from "@/components/AppSidebar";
import { AssistantWidget } from "@/components/AssistantWidget";
import { MobileNav } from "@/components/MobileNav";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <AppSidebar />
      <MobileNav />
      <div className="hidden md:block fixed right-6 top-6 z-50">
        <ThemeToggle />
      </div>
      <main className="min-h-screen pt-14 md:ml-64 md:pt-0">{children}</main>
      <AssistantWidget />
    </div>
  );
}
