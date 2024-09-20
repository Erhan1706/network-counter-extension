let counterDiv: HTMLDivElement;

function createCounterDiv() {
  const url = chrome.runtime.getURL('assets/html/expanded.html');

  fetch(url)
  .then(response => response.text()) 
  .then(html => {
    const wrapper: HTMLDivElement = document.createElement('div');
    wrapper.className = "expanded-wrapper";
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);}
  )
  .catch(error => {
    console.error('Error loading HTML file:', error);
  });
}

function updateCounter(count: number) {
  //if (!counterDiv) {
  //  createCounterDiv();
  //}
  //counterDiv.textContent = `Successful requests: ${count}`;
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.count !== undefined) {
      updateCounter(request.count);
    }
  }
);

createCounterDiv();