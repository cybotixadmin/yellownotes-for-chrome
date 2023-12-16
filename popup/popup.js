document.getElementById('sendMessageButton').addEventListener('click', function() {
    chrome.runtime.sendMessage({ action: 'SEND_MESSAGE_TO_ALL_TABS' });
});
