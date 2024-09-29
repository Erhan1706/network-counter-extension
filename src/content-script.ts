// Collection of all the id's of the HTML elements where the counters will be displayed
const COUNTER_IDS = {
  total: "success-counter",
  stylesheet: "css-counter",
  script: "js-counter",
  font: "font-counter",
  media: "media-counter",
  xmlhttp: "xmlhttp-counter",
  image: "image-counter",
  error: "error-counter",
  minimal: "minimal-counter",
};

// On first load of the content script, check if the extension is disabled or minimized
chrome.storage.local.get({ disable: false, minimal: false }, toggleExtension);

// Checks if the html should be injected in the DOM or not according to the disable state
function toggleExtension(result: { disable?: boolean; minimal?: boolean }) {
  if (!result.disable) {
    renderExtension(result);
  } else {
    const injectedHTML: HTMLDivElement = document.querySelector(
      ".extension-container"
    ) as HTMLDivElement;
    if (injectedHTML) document.body.removeChild(injectedHTML);
  }
}

/* Injects the HTML in the DOM. If the minimal flag is set to true, the minimal version of the extension is injected
 otherwise it injects the expanded version */
function renderExtension(result: { disable?: boolean; minimal?: boolean }) {
  if (result.disable) return;
  const url: string = result.minimal
    ? chrome.runtime.getURL("assets/html/minimal.html")
    : chrome.runtime.getURL("assets/html/expanded.html");

  // Clean up the previous version if it exists
  const injectedHTML: HTMLDivElement = document.querySelector(
    ".extension-container"
  ) as HTMLDivElement;
  if (injectedHTML) document.body.removeChild(injectedHTML);

  fetch(url)
    .then((response) => response.text())
    .then((html) => {
      const wrapper: HTMLDivElement = document.createElement("div");
      wrapper.className = "extension-container";
      wrapper.innerHTML = html;
      document.body.appendChild(wrapper);
      chrome.runtime.sendMessage({ action: "html-rendered" });
    })
    .catch((error) => {
      console.error("Error injecting HTML in the DOM:", error);
    });
}

// Update the counter in the DOM
function updateCounter(count: RequestCount) {
  Object.keys(COUNTER_IDS).forEach((key) => {
    const element: HTMLSpanElement = document.getElementById(
      COUNTER_IDS[key as keyof typeof COUNTER_IDS]
    ) as HTMLSpanElement;
    if (element)
      if (key === "minimal")
        element.textContent = `${count.total + count.error}`;
      else element.textContent = `${count[key as keyof RequestCount]}`;
  });
}

// Listen for messages from the background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Change the rendering of the extension according to the disable or minimal flag
  // Or check if the previous tab changed the state of the extension
  if (
    request.action === "toggle-disable" ||
    request.action === "toggle-minimal" ||
    request.tabSwitch
  )
    chrome.storage.local.get(
      { disable: false, minimal: false },
      toggleExtension
    );
  // Update counter on each request
  if (request.count !== undefined) {
    updateCounter(request.count);
  }
});
