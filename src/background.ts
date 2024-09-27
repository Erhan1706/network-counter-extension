interface RequestCount {
  image: number;
  stylesheet: number;
  script: number;
  font: number;
  total: number;
  error: number;
  reset: () => void;
}

let htmlRendered: boolean = false;
let requestCount: RequestCount = {
  image: 0,
  stylesheet: 0,
  script: 0,
  font: 0,
  total: 0,
  error: 0,
  reset: function () {
    this.image = 0;
    this.stylesheet = 0;
    this.script = 0;
    this.font = 0;
    this.total = 0;
  }
};

function countRequest(type: chrome.webRequest.ResourceType) {
  requestCount.total++;
  switch (type) {
    case "image":
      requestCount.image++;
      break;
    case "stylesheet":
      requestCount.stylesheet++;
      break;
    case "script":
      requestCount.script++;
      break;
    case "font":
      requestCount.font++;
      break;
    default:
      break;
  }
}

chrome.webRequest.onCompleted.addListener(
  async (details) => {
    if (details.statusCode % 100 === 4 || details.statusCode % 100 === 5) {
      requestCount.error++;
    }
    countRequest(details.type);
    if (htmlRendered) {
      const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });
      if (tab.id) chrome.tabs.sendMessage(tab.id, { count: requestCount });
    }
  },
  { urls: ["<all_urls>"] }
);

/* chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        func: () => {
          return true;
        },
      },
      () => {
        chrome.tabs.sendMessage(tabId, { count: requestCount });
      }
    );
  }
}); */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "html-rendered") {
    htmlRendered = true;
    if (sender.tab && sender.tab.id) {
      chrome.tabs.sendMessage(sender.tab.id, { count: requestCount });
    }
  }
});
/* 
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  requestCount = 0; 
  activeTabId = activeInfo.tabId;

  chrome.tabs.sendMessage(activeTabId, { count: requestCount });
}); */
