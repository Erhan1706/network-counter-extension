let requestCount: number = 0;

chrome.webRequest.onCompleted.addListener(
  async (details) => {
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    requestCount++;
    if (tab.id !== undefined) {
      chrome.tabs.sendMessage(tab.id, {count: requestCount});
      //chrome.tabs.sendMessage(details.tabId, {count: requestCount});
    }
    console.log(details)
  },
  { urls: ["<all_urls>"] }
)
