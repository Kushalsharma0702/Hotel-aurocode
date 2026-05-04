import { ReactNode } from "react";
import { AppSidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function DashboardLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} subtitle={subtitle} />
        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 animate-fade-in-up">{children}</main>
      </div>
    </div>
  );
}
