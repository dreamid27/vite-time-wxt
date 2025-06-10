import { useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/site-header';
import { BlockedSites } from '@/components/blocked-sites/blocked-sites';
import { BlockedWords } from '@/components/blocked-words/blocked-words';
import { Settings } from '@/components/settings/settings';
import { Toaster } from '@/components/ui/sonner';
import { useNavigationStore } from '@/store/navigation-store';
import { ThemeProvider } from '@/components/theme-provider';

function App() {
  const { currentPage } = useNavigationStore();

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
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
            {currentPage === 'settings' && (
              <>
                <SiteHeader title="Settings" />
                <Settings />
              </>
            )}
          </div>
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;
