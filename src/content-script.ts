let counterDiv: HTMLDivElement;

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

function renderExtension(result: { disable?: boolean; minimal?: boolean }) {
  if (result.disable) return;
  let url: string;
  if (result.minimal) url = chrome.runtime.getURL("assets/html/minimal.html");
  else url = chrome.runtime.getURL("assets/html/expanded.html");

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
    })
    .catch((error) => {
      console.error("Error injecting HTML in the DOM:", error);
    });
}

function updateCounter(count: number) {
  //if (!counterDiv) {
  //  createCounterDiv();
  //}
  //counterDiv.textContent = `Successful requests: ${count}`;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (
    request.action === "toggle-disable" ||
    request.action === "toggle-minimal"
  )
    chrome.storage.local.get(
      { disable: false, minimal: false },
      toggleExtension
    );
  if (request.count !== undefined) {
    updateCounter(request.count);
  }
});

// On first load of the content script, check if the extension is disabled
chrome.storage.local.get({ disable: false, minimal: false }, toggleExtension);
