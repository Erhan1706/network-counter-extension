let counterDiv: HTMLDivElement;

function createCounterDiv() {
  counterDiv = document.createElement('div');
  counterDiv.className = 'network-request-counter';
  document.body.appendChild(counterDiv);
}

function updateCounter(count: number) {
  if (!counterDiv) {
    createCounterDiv();
  }
  counterDiv.textContent = `Successful requests: ${count}`;
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.count !== undefined) {
      updateCounter(request.count);
    }
  }
);