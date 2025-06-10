import { db as blockedSitesDb } from '@/db/blocked-sites-db';
import { db as blockedWordsDb } from '@/db/blocked-words-db';
import { getSettings } from '@/db/settings-db';

export default defineBackground(() => {
  // Listen for navigation events
  browser.webNavigation.onBeforeNavigate.addListener(async (details) => {
    // Only process main frame navigation (not iframes)
    if (details.frameId !== 0) return;

    try {
      console.log('Checking navigation to:', details.url);
      const url = new URL(details.url);
      const hostname = url.hostname.replace('www.', '');

      // Check if blocking is paused
      const pauseState = await blockedSitesDb.pauseState.toArray();
      const activePause = pauseState.find((state) => state.isActive);

      if (activePause) {
        const startTime = new Date(activePause.startTime).getTime();
        const endTime = startTime + activePause.duration * 60 * 1000;
        const now = Date.now();

        // If pause has expired, deactivate it
        if (now >= endTime) {
          await blockedSitesDb.pauseState.update(activePause.id, {
            isActive: false,
          });
        } else {
          // If pause is still active, allow navigation
          return;
        }
      }

      // Get all blocked sites from Dexie
      const blockedSites = await blockedSitesDb.blockedSites.toArray();

      // Get all blocked words from Dexie
      const blockedWords = await blockedWordsDb.blockedWords.toArray();

      // Check if current URL matches any blocked site
      const isSiteBlocked = blockedSites.some((site) => {
        const blockedHostname = new URL(
          site.url.startsWith('http') ? site.url : `https://${site.url}`
        ).hostname.replace('www.', '');

        return (
          hostname === blockedHostname ||
          hostname.endsWith(`.${blockedHostname}`) ||
          `www.${hostname}`.endsWith(`.${blockedHostname}`)
        );
      });

      // Check if current URL contains any blocked word
      const isWordBlocked = blockedWords.some((blockedWord) => {
        return hostname.toLowerCase().includes(blockedWord.word.toLowerCase());
      });

      // Site is blocked if it matches either a blocked site or contains a blocked word
      const isBlocked = isSiteBlocked || isWordBlocked;

      if (isBlocked) {
        console.log(`Blocking access to: ${details.url}`);

        // Determine if it was blocked by a word or site
        let blockReason = '';
        let blockedWord = '';

        if (isWordBlocked) {
          // Find which word caused the block
          const matchingWord = blockedWords.find((word) =>
            hostname.toLowerCase().includes(word.word.toLowerCase())
          );
          if (matchingWord) {
            blockedWord = matchingWord.word;
          }
        }

        // Get custom redirection URL from settings
        const settings = await getSettings();
        const redirectionUrl = settings.customRedirectionUrl;

        // Redirect to the custom redirection URL
        await browser.tabs.update(details.tabId, {
          url: redirectionUrl,
        });
      }
    } catch (error) {
      console.error('Error checking blocked sites:', error);
    }
  });

  // Listen for messages from popup/options/blocked page
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received in background:', message);

    if (message.action === 'openOptions') {
      // Open the extension options page
      browser.runtime.openOptionsPage();
      sendResponse({ success: true });
      return true; // Keep the message channel open for async response
    }

    if (message.type === 'refreshBlocklist') {
      // This forces the background script to re-check the blocklist
      console.log('Blocklist refresh requested');
      sendResponse({ success: true });
      return true; // Keep the message channel open for async response
    }

    return false; // Not handling this message
  });
});
