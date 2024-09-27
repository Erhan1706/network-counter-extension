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

let htmlRendered: boolean = false;
let requestCount: RequestCount = {
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

chrome.webRequest.onErrorOccurred.addListener(
  async (details) => {
    requestCount.error++;
  },
  { urls: ["<all_urls>"] }
);

chrome.webRequest.onCompleted.addListener(
  async (details) => {
    if (details.statusCode % 100 === 4 || details.statusCode % 100 === 5) {
      requestCount.error++;
    } else {
      countRequest(details.type);
    }
    if (htmlRendered) {
      const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });
      if (tab && tab.id)
        chrome.tabs.sendMessage(tab.id, { count: requestCount });
    }
  },
  { urls: ["<all_urls>"] }
);

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "html-rendered") {
    htmlRendered = true;
    if (sender.tab && sender.tab.id) {
      chrome.tabs.sendMessage(sender.tab.id, { count: requestCount });
    }
  } else if (request.action === "reset") {
    requestCount.reset();
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    if (tab && tab.id) chrome.tabs.sendMessage(tab.id, { count: requestCount });
  }
});
