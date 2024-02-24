/**
 * This script intercept cliks to links that should be redirected to /pages/ hosted on the plugin
 * 
 */
console.log("Browsersolutions: local_GUI_intercept.js loaded");

console.log(window.location.href);
const accountTargetURL =  new RegExp(/\/\/www\.yellownotes\.xyz\/.*my_account.html/);
console.log( accountTargetURL.test(window.location.href ));
if ( accountTargetURL.test(window.location.href )) {
    console.log("redirect this link to plugin")
  // Notify the background script to redirect
  chrome.runtime.sendMessage({action: "local_pages_intercept", redirect: true, uri: "/pages/my_account.html"});
}


const notespage =  new RegExp(/\/\/www\.yellownotes\.xyz\/(pages\/my_notes.html|my_notes.html)/);
console.log(notespage.test(window.location.href ));
if ( notespage.test(window.location.href )) {
  const url = window.location.href;
  console.log("redirect this link to plugin")
  // remove protocol, host and port
  const newUrl = url.replace(/^[a-z]*:\/\/[^/]+/, '');
// Notify the background script to redirect
chrome.runtime.sendMessage({action: "local_pages_intercept", redirect: true, uri: newUrl});
}

const subpage =  new RegExp(/\/\/www\.yellownotes\.xyz\/pages\/my_subscriptions.html/);
console.log(subpage.test(window.location.href ));
if ( subpage.test(window.location.href )) {
  console.log("redirect this link to plugin")
// Notify the background script to redirect
chrome.runtime.sendMessage({action: "local_pages_intercept", redirect: true, uri: "/pages/my_subscriptions.html"});
}


const subscribedpage =  new RegExp(/\/\/www\.yellownotes\.xyz\/subscribed_notes.html/);
console.log(subscribedpage.test(window.location.href ));
if ( subscribedpage.test(window.location.href )) {
  console.log("redirect this link to plugin")
// Notify the background script to redirect
chrome.runtime.sendMessage({action: "local_pages_intercept", redirect: true, uri: "/pages/subscribed_notes.html"});
}

console.log(loginTargetURL.test(window.location.href ));
const loginTargetURL =  new RegExp(/login.html/);
if ( loginTargetURL.test(window.location.href )) {
    console.log("redirect this link to plugin")
  // Notify the background script to redirect
  chrome.runtime.sendMessage({action: "local_pages_intercept", redirect: true, uri: "/pages/login.html"});
}


console.log(logout_silentTargetURL.test(window.location.href ));
const logout_silentTargetURL =  new RegExp(/logout_silent/);
if ( logout_silentTargetURL.test(window.location.href )) {
    console.log("redirect this link to plugin")
  // Notify the background script to redirect
  chrome.runtime.sendMessage({action: "local_pages_intercept", redirect: true, uri: "/logout_silent"});
}



const targetURL =  new RegExp(/view_yellownotes/);
if ( targetURL.test(window.location.href )) {
    console.log("redirect this link to plugin")
  // Notify the background script to redirect
  chrome.runtime.sendMessage({action: "local_pages_intercept", redirect: true, uri: "/pages/view_yellownotes.html"});
}

