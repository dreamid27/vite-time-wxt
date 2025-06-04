import { useEffect, useState } from "react";
import { Shield, ShieldOff, Settings, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { db } from "@/db/blocked-sites-db";
import { normalizeUrl } from "@/lib/utils";

function App() {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocking, setIsBlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current tab's URL and check if it's blocked
  useEffect(() => {
    const checkCurrentSite = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get the current active tab
        const tabs = await new Promise<globalThis.Browser.tabs.Tab[]>(
          (resolve) => {
            browser.tabs.query(
              { active: true, currentWindow: true },
              (tabs) => {
                resolve(tabs);
              }
            );
          }
        );

        // Skip if no URL (chrome://, edge://, etc.)
        if (!tabs[0]?.url) {
          setError("This page cannot be blocked.");
          return;
        }

        const tabUrl = tabs[0].url;
        setCurrentUrl(tabUrl);

        // Check if the current URL is already blocked
        const url = new URL(tabUrl);
        const domain = url.hostname.replace("www.", "");
        const blockedSites = await db.blockedSites.toArray();
        const isSiteBlocked = blockedSites.some((site: { url: string }) =>
          normalizeUrl(site.url).includes(domain)
        );

        setIsBlocked(!!isSiteBlocked);
      } catch (err) {
        console.error("Error checking current site:", err);
        setError("Failed to check current site. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    checkCurrentSite();
  }, []);

  const handleBlockSite = async () => {
    if (!currentUrl || isBlocked) return;

    try {
      setIsBlocking(true);

      // Normalize the URL for storage (without protocol)
      const url = new URL(currentUrl);
      const domain = url.hostname.replace("www.", "");

      // Check again if already blocked (race condition protection)
      const blockedSites = await db.blockedSites.toArray();
      const alreadyBlocked = blockedSites.some(
        (site) => normalizeUrl(site.url) === domain
      );

      if (alreadyBlocked) {
        setIsBlocked(true);
        return;
      }

      // Add to blocked sites
      await db.blockedSites.add({
        id: crypto.randomUUID(),
        url: domain,
        createdAt: new Date().toISOString(),
      });

      setIsBlocked(true);

      // Show success message
      toast.success("Site blocked", {
        description: `${domain} has been added to your blocked list.`,
      });

      // Close the popup after a short delay
      setTimeout(() => window.close(), 1500);
    } catch (err) {
      console.error("Error blocking site:", err);
      toast.error("Error", {
        description: "Failed to block this site. Please try again.",
      });
    } finally {
      setIsBlocking(false);
    }
  };

  const openOptions = () => {
    browser.runtime.openOptionsPage();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 w-64 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">Checking site...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col p-4 w-64">
        <div className="flex items-center gap-2 mb-4 text-destructive">
          <X className="h-5 w-5" />
          <h2 className="font-medium">Unable to block this page</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" size="sm" onClick={openOptions}>
          <Settings className="h-4 w-4 mr-2" />
          Manage Blocked Sites
        </Button>
      </div>
    );
  }

  // Main UI
  return (
    <div className="flex flex-col w-[360px] min-h-[220px] bg-background  overflow-hidden  transition-all duration-300 animate-in fade-in-50 slide-in-from-top-2">
      {/* Header */}
      <div
        className={`px-6 pt-6 pb-4 transition-colors duration-300 ${
          isBlocked
            ? "bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-900/30"
            : "bg-blue-50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900/30"
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`p-2.5 rounded-xl transition-all duration-300 ${
              isBlocked
                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
            }`}
          >
            {isBlocked ? (
              <ShieldOff className="h-6 w-6" />
            ) : (
              <Shield className="h-6 w-6" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-lg text-foreground mb-1">
              {isBlocked ? "Site is Blocked" : "Block This Site?"}
            </h2>
            <p className="text-sm text-muted-foreground truncate">
              {currentUrl ? new URL(currentUrl).hostname : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pt-5">
        <div className="space-y-4">
          {!isBlocked && (
            <Button
              onClick={handleBlockSite}
              disabled={isBlocking}
              size="lg"
              className={`w-full h-12 text-base font-medium transition-all duration-300 transform hover:scale-[1.02] ${
                isBlocking ? "opacity-80" : "hover:shadow-md"
              }`}
            >
              {isBlocking ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Blocking...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-5 w-5" />
                  Block This Site
                </>
              )}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={openOptions}
            className="w-full h-10 text-sm font-normal transition-colors hover:bg-accent/50"
          >
            <Settings className="h-4 w-4 mr-2 opacity-70" />
            Manage Blocked Sites
          </Button>
        </div>
      </div>

      <Toaster position="top-center" />
    </div>
  );
}

export default App;
