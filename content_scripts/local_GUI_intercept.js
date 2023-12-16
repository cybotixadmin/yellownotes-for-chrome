/**
 * This script intercept cliks to links that should be redirected to /pages/ hosted on the plugin
 * 
 */

console.log("Browsersolutions: local_GUI_intercept.js loaded");

const accountTargetURL =  new RegExp(/account/);
if ( accountTargetURL.test(window.location.href )) {
    console.log("redirect this link to plugin")
  // Notify the background script to redirect
  chrome.runtime.sendMessage({action: "local_pages_intercept", redirect: true, uri: "/pages/your_account.html"});
}


const loginTargetURL =  new RegExp(/login.html/);
if ( loginTargetURL.test(window.location.href )) {
    console.log("redirect this link to plugin")
  // Notify the background script to redirect
  chrome.runtime.sendMessage({action: "local_pages_intercept", redirect: true, uri: "/pages/login.html"});
}


const targetURL =  new RegExp(/view_yellowstickynotes/);
if ( targetURL.test(window.location.href )) {
    console.log("redirect this link to plugin")
  // Notify the background script to redirect
  chrome.runtime.sendMessage({action: "local_pages_intercept", redirect: true, uri: "/pages/view_yellowstickynotes.html"});
}

