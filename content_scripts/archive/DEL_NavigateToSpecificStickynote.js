/*
 * This JS is called from background.js when user has request to see a stickynote "in situ". 
 * 1) The URL the note pertains to is opened in a separate tab. 
 * 2) focus is moved to this URLtab
 * 3) this script is invoked on this tab
 * 4) The script located the note and scrolls down to it
 */


console.debug("browsersolutions NavigateToSpecificStickynote.js");


function locate_note(event){
console.debug("locate_note(event)");
console.debug(event);

const note_root = getYellowStickyNoteRoot(event.target);

console.debug(note_root);



}


// setup the listener need to accept messages from background.js
chrome.runtime.onMessage.addListener(locateStickyNote);

// list for custom events triggered by clicking on a yellow sticky note

// Listen for the custom event
document.addEventListener('myCustomEvent', function(event) {
	// Do something with the event
	console.log('Received a custom event:', event);
	console.log('Message from custom event:', event.detail.message);
	// very request structure to to verify is is gneuine (as far as possible) and properly formated. 

	// there is no call to the background/service worker, only nvaigation to where the note is attached. 

  });
  
