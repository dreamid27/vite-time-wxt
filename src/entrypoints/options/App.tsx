import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { BlockedSites } from "@/components/blocked-sites/blocked-sites";
import { BlockedWords } from "@/components/blocked-words/blocked-words";
import { Toaster } from "@/components/ui/sonner";
import { useNavigationStore } from "@/store/navigation-store";

function App() {
  const { currentPage } = useNavigationStore();

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
          {currentPage === 'blocked-sites' && (
            <>
              <SiteHeader title="Blocked Sites" />
              <BlockedSites />
            </>
          )}
          {currentPage === 'blocked-words' && (
            <>
              <SiteHeader title="Blocked Words" />
              <BlockedWords />
            </>
          )}
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}

export default App;
