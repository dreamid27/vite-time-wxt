export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });

  browser.webRequest.onBeforeRequest.addListener(
    function (details) {
      console.log(details, "details");
      const url = new URL(details.url);

      // Example: Redirect from example.com to example.org
      if (url.hostname === "facebook.com") {
        const newUrl = url.href.replace("facebook.com", "example.org");
        return { redirectUrl: newUrl };
      }

      return {}; // No redirection
    },
    { urls: ["<all_urls>"], types: ["main_frame"] },
    ["blocking"]
  );
});
