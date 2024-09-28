interface RequestCount {
  image: number;
  stylesheet: number;
  script: number;
  font: number;
  xmlhttp: number;
  media: number;
  total: number;
  error: number;
  reset: () => void;
}

let htmlRendered: boolean = false; // Flag to check if the HTML is injected in the DOM
let requestCount: RequestCount = { // Object to store the count of each request type
  image: 0,
  stylesheet: 0,
  script: 0,
  font: 0,
  xmlhttp: 0,
  media: 0,
  total: 0,
  error: 0,
  reset: function () {
    this.image = 0;
    this.stylesheet = 0;
    this.script = 0;
    this.font = 0;
    this.xmlhttp = 0;
    this.media = 0;
    this.total = 0;
    this.error = 0;
  },
};

// Increment the count of each request type
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
    case "xmlhttprequest":
      requestCount.xmlhttp++;
      break;
    case "media":
      requestCount.media++;
      break;
    default:
      break;
  }
}

// Send a message to the current active tab with the count of each request type
async function sendMessageToTab(tabId: number, message: any) {
  try {
    await chrome.tabs.sendMessage(tabId, message);
  } catch (error) {
    console.log(`Failed to send message to tab ${tabId}: ${error}`);
  }
}

// Reset the counter and notify the content script
function resetCounter() {
  requestCount.reset();
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].id) {
      sendMessageToTab(tabs[0].id, { count: requestCount });
    }
  });
}

// Some failed requests are handled with the onErrorOccurred event instead of onCompleted
chrome.webRequest.onErrorOccurred.addListener(
  async (details) => {
    requestCount.error++;
  },
  { urls: ["<all_urls>"] }
);

// Listen for completed requests and increment the count of each request type
chrome.webRequest.onCompleted.addListener(
  async (details) => {
    if (details.statusCode % 100 === 4 || details.statusCode % 100 === 5) {
      requestCount.error++;
    } else {
      countRequest(details.type);
    }
    // Make sure the html is injected before sending the count on each request, 
    // otherwise the count will be unnacurate.
    if (htmlRendered) {
      const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });
      if (tab && tab.id) sendMessageToTab(tab.id, { count: requestCount });
    }
  },
  { urls: ["<all_urls>"] }
);

// Listen for messages from the popup and content script
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "html-rendered") {
    htmlRendered = true;
    if (sender.tab && sender.tab.id) {
      sendMessageToTab(sender.tab.id, { count: requestCount });
    }
  } else if (request.action === "reset") {
    resetCounter();
  }
});

// If user changes or disables extension in one tab, the other tabs should reflect the change whenever they are activated
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  sendMessageToTab(activeInfo.tabId, { tabSwitch: true });
});

// When user presses 'Alt+Q' the 'reset' command is triggered
chrome.commands.onCommand.addListener((command) => {
  if (command === "reset") resetCounter();
});

// When the URL of the tab changes, the HTML will have to be reinjected
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  htmlRendered = false;
});