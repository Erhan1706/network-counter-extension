document.addEventListener("DOMContentLoaded", () => {
  const disableSwitch : HTMLInputElement = document.getElementById("disable-switch") as HTMLInputElement;
  disableSwitch.addEventListener("change", () => {
    chrome.storage.sync.set({ disable: disableSwitch.checked });
  });
});