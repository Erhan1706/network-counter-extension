document.addEventListener("DOMContentLoaded", () => {
  const disableSwitch : HTMLInputElement = document.getElementById("disable-switch") as HTMLInputElement;
  const minimalSwitch : HTMLInputElement = document.getElementById("minimal-switch") as HTMLInputElement;

  chrome.storage.local.get({ disable: false, minimal: false }, function (result) {
    disableSwitch.checked = result.disable;
    minimalSwitch.checked = result.minimal;
  });

  disableSwitch.addEventListener("change", () => {
    chrome.storage.local.set({ disable: disableSwitch.checked });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id !== undefined) chrome.tabs.sendMessage(tabs[0].id, { action: "toggle-disable", state: disableSwitch.checked });
    });
  });

  minimalSwitch.addEventListener("change", () => {
    chrome.storage.local.set({ minimal: minimalSwitch.checked });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id !== undefined) chrome.tabs.sendMessage(tabs[0].id, { action: "toggle-minimal", state: minimalSwitch.checked });
    });
  });
});