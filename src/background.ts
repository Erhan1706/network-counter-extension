let requestCount: number = 0;
let activeTabId: number | undefined = undefined;

chrome.webRequest.onCompleted.addListener(
  async (details) => {
    //const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    requestCount++;
    if (activeTabId !== undefined) {
      chrome.tabs.sendMessage(activeTabId, {count: requestCount});
    }
    //console.log(details)
  },
  { urls: ["<all_urls>"] }
)

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  requestCount = 0; 
  activeTabId = activeInfo.tabId;

  chrome.tabs.sendMessage(activeTabId, { count: requestCount });
});