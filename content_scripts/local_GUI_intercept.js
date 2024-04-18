/**
 * This script intercept cliks to links that should be redirected to /pages/ hosted on the plugin
 * 
 */
console.log("Browsersolutions: local_GUI_intercept.js loaded");

console.log(window.location.href);
const accountTargetURL =  new RegExp(/\/\/www\.yellownotes\.cloud\/.*my_account.html/);
console.log( accountTargetURL.test(window.location.href ));
if ( accountTargetURL.test(window.location.href )) {
    console.log("redirect this link to plugin")
  // Notify the background script to redirect
  chrome.runtime.sendMessage({action: "local_pages_intercept", redirect: true, uri: "/pages/my_account.html"});
}


const notespage =  new RegExp(/\/\/www\.yellownotes\.cloud\/(pages\/my_notes.html|my_notes.html)/);
console.log(notespage.test(window.location.href ));
if ( notespage.test(window.location.href )) {
  const url = window.location.href;
  console.log("redirect this link to plugin")
  // remove protocol, host and port
  const newUrl = url.replace(/^[a-z]*:\/\/[^/]+/, '');
// Notify the background script to redirect
chrome.runtime.sendMessage({action: "local_pages_intercept", redirect: true, uri: newUrl});
}

const aboutpage =  new RegExp(/\/\/www\.yellownotes\.cloud\/pages\/about_yellownotes.html/);
console.log(aboutpage.test(window.location.href ));
if ( aboutpage.test(window.location.href )) {
  console.log("redirect this link to plugin")
// Notify the background script to redirect
chrome.runtime.sendMessage({action: "local_pages_intercept", redirect: true, uri: "/pages/about_yellownotes.html"});
}

// intercept inviations to subscribe to feeds
const inviteregexp =  new RegExp(/\/\/www\.yellownotes\.cloud\/subscribe/);

const distributionlistid = new URLSearchParams(window.location.search).get("distributionlistid");
console.log(inviteregexp.test(window.location.href ));
if ( inviteregexp.test(window.location.href )) {
  console.log("send subscripition request to plugin");
// Notify the background script to redirect
chrome.runtime.sendMessage({action: "local_pages_intercept", redirect: true, uri: "/pages/my_subscriptions.html?add_distributionlistid=" + distributionlistid});
}



const subpage =  new RegExp(/\/\/www\.yellownotes\.cloud\/pages\/my_subscriptions.html/);
console.log(subpage.test(window.location.href ));
if ( subpage.test(window.location.href )) {
    // Extract the query string
    const queryString = window.location.search;

  console.log("redirect this link to plugin")
// Notify the background script to redirect
chrome.runtime.sendMessage({action: "local_pages_intercept", redirect: true, uri: "/pages/my_subscriptions.html"+ queryString});
}


const subscribedpage =  new RegExp(/\/\/www\.yellownotes\.cloud\/subscribed_notes.html/);
console.log(subscribedpage.test(window.location.href ));
if ( subscribedpage.test(window.location.href )) {
  console.log("redirect this link to plugin")
// Notify the background script to redirect
chrome.runtime.sendMessage({action: "local_pages_intercept", redirect: true, uri: "/pages/subscribed_notes.html"});
}

const loginTargetURL =  new RegExp(/login.html/);
console.log(loginTargetURL.test(window.location.href ));
if ( loginTargetURL.test(window.location.href )) {
    console.log("redirect this link to plugin")
  // Notify the background script to redirect
  chrome.runtime.sendMessage({action: "local_pages_intercept", redirect: true, uri: "/pages/login.html"});
}


const logout_silentTargetURL =  new RegExp(/logout_silent/);
console.log(logout_silentTargetURL.test(window.location.href ));
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

/*
 leave this intercept out for now
 run the welcome page of the server to make updateing it faster
const welcomeURL =  new RegExp(/welcome.html/);
if ( welcomeURL.test(window.location.href )) {
    console.log("redirect this link to plugin")
  chrome.runtime.sendMessage({action: "local_pages_intercept", redirect: true, uri: "/pages/welcome.html"});
}
*/
