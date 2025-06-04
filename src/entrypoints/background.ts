import { db } from "@/db/blocked-sites-db";

export default defineBackground(() => {
  // Listen for navigation events
  browser.webNavigation.onBeforeNavigate.addListener(async (details) => {
    // Only process main frame navigation (not iframes)
    if (details.frameId !== 0) return;

    try {
      console.log("Checking navigation to:", details.url);
      const url = new URL(details.url);
      const hostname = url.hostname.replace("www.", "");

      // Get all blocked sites from Dexie
      const blockedSites = await db.blockedSites.toArray();

      // Check if current URL matches any blocked site
      const isBlocked = blockedSites.some((site) => {
        const blockedHostname = new URL(
          site.url.startsWith("http") ? site.url : `https://${site.url}`
        ).hostname.replace("www.", "");

        return (
          hostname === blockedHostname ||
          hostname.endsWith(`.${blockedHostname}`) ||
          `www.${hostname}`.endsWith(`.${blockedHostname}`)
        );
      });

      if (isBlocked) {
        console.log(`Blocking access to: ${details.url}`);
        // Redirect to a block page or show a notification
        await browser.tabs.update(details.tabId, {
          url: `https://example.com`,
        });
      }
    } catch (error) {
      console.error("Error checking blocked sites:", error);
    }
  });

  // Listen for messages from popup/options/blocked page
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received in background:", message);

    if (message.action === "openOptions") {
      // Open the extension options page
      browser.runtime.openOptionsPage();
      sendResponse({ success: true });
      return true; // Keep the message channel open for async response
    }

    if (message.type === "refreshBlocklist") {
      // This forces the background script to re-check the blocklist
      console.log("Blocklist refresh requested");
      sendResponse({ success: true });
      return true; // Keep the message channel open for async response
    }

    return false; // Not handling this message
  });
});
