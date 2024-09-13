chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message)
  sendResponse({ message: "hello from popup" })
})