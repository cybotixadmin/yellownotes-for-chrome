function getPageContent() {
    // Retrieve page content
    const content = document.documentElement.innerHTML;
    // Send content to background script
    chrome.runtime.sendMessage({ content: content });
  }
  
  // Wait for the page to fully load before getting its content
  window.addEventListener('load', getPageContent);
  