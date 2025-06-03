import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { BlockedSites } from "@/components/blocked-sites/blocked-sites";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <div className="flex h-screen flex-col">
          <SiteHeader title="Blocked Sites" />
          <BlockedSites />
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}

export default App;
