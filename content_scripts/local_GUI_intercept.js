/**
 * This script intercept cliks to links that should be redirected to /pages/ hosted on the plugin
 *
 */
console.log("Browsersolutions: local_GUI_intercept.js loaded");

console.log(window.location.href);
const accountTargetURL = new RegExp(/\/\/www\.yellownotes\.cloud\/.*my_account.html/);
console.log(accountTargetURL.test(window.location.href));
if (accountTargetURL.test(window.location.href)) {
    console.log("redirect this link to plugin")
    // Notify the background script to redirect
    chrome.runtime.sendMessage({
        action: "local_pages_intercept",
        redirect: true,
        uri: "/pages/my_account.html"
    });
}

const notespage = new RegExp(/\/\/www\.yellownotes\.cloud\/(pages\/my_notes.html|my_notes.html)/);
console.log(notespage.test(window.location.href));
if (notespage.test(window.location.href)) {
    const url = window.location.href;
    console.log("redirect this link to plugin")
    // remove protocol, host and port
    const newUrl = url.replace(/^[a-z]*:\/\/[^/]+/, '');
    // Notify the background script to redirect
    chrome.runtime.sendMessage({
        action: "local_pages_intercept",
        redirect: true,
        uri: newUrl
    });
}

const aboutpage = new RegExp(/\/\/www\.yellownotes\.cloud\/pages\/about_yellownotes.html/);
console.log(aboutpage.test(window.location.href));
if (aboutpage.test(window.location.href)) {
    console.log("redirect this link to plugin")
    // Notify the background script to redirect
    chrome.runtime.sendMessage({
        action: "local_pages_intercept",
        redirect: true,
        uri: "/pages/about_yellownotes.html"
    });
}

// intercept inviation-links to subscribe to feeds
const inviteregexp = new RegExp(/\/\/www\.yellownotes\.cloud\/subscribe/);
if (inviteregexp.test(window.location.href)) {

const distributionlistid = new URLSearchParams(window.location.search).get("distributionlistid");
const redirecturi = new URLSearchParams(window.location.search).get("redirecturi");
console.log(inviteregexp.test(window.location.href));
var uri;
if (redirecturi) {
    uri = "/pages/my_subscriptions.html?add_distributionlistid=" + distributionlistid + "&redirecturi=" + encodeURIComponent(redirecturi);
} else {
  uri = "/pages/my_subscriptions.html?add_distributionlistid=" + distributionlistid ;
}
console.log("intercept to ", uri);
    console.log("send subscripition request to plugin");
    // Notify the background script to redirect to the subscription page and instruc the page to add a subscription for this distributionlist for the user
    chrome.runtime.sendMessage({
        action: "local_pages_intercept",
        redirect: true,
        uri: uri
    });
}


// intercept links to individual notes
const gothereregexp = new RegExp(/\/\/www\.yellownotes\.cloud\/gothere/);
//const gothereregexp = new RegExp(/\/gothere/);

if ((new RegExp(/\/gothere/)).test(window.location.href)) {
  console.log("/gothere")
console.log("redirect to go to note")
const noteid = new URLSearchParams(window.location.search).get("noteid");

//const redirecturi = new URLSearchParams(window.location.search).get("redirecturi");
//console.log(gothereregexp.test(window.location.href));


 // invoke the background script to scroll to the note in question
 chrome.runtime.sendMessage({
  message: {
      action: "gothere",
      gothere: {
          noteid: noteid
      }
  }
}, function (response) {
  console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
  // finally, call "close" on the note
  //  try{
  //  	close_note(event);
  //  }catch(g){console.debug(g);}

});
}


const view_distributionlist = new RegExp(/\/\/www\.yellownotes\.cloud\/pages\/view_distributionlist.html/);
console.log(view_distributionlist.test(window.location.href));
if (view_distributionlist.test(window.location.href)) {
    // Extract the query string
    const queryString = window.location.search;

    console.log("redirect this link to plugin")
    // Notify the background script to redirect
    chrome.runtime.sendMessage({
        action: "local_pages_intercept",
        redirect: true,
        uri: "/pages/view_distributionlist.html" + queryString
    });
}

const subpage = new RegExp(/\/\/www\.yellownotes\.cloud\/pages\/my_subscriptions.html/);
console.log(subpage.test(window.location.href));
if (subpage.test(window.location.href)) {
    // Extract the query string
    const queryString = window.location.search;

    console.log("redirect this link to plugin")
    // Notify the background script to redirect
    chrome.runtime.sendMessage({
        action: "local_pages_intercept",
        redirect: true,
        uri: "/pages/my_subscriptions.html" + queryString
    });
}

const subscribedpage = new RegExp(/\/\/www\.yellownotes\.cloud\/subscribed_notes.html/);
console.log(subscribedpage.test(window.location.href));
if (subscribedpage.test(window.location.href)) {
    console.log("redirect this link to plugin")
    // Notify the background script to redirect
    chrome.runtime.sendMessage({
        action: "local_pages_intercept",
        redirect: true,
        uri: "/pages/subscribed_notes.html"
    });
}

const loginTargetURL = new RegExp(/\/\/www\.yellownotes\.cloud\/login.html/);
console.log(loginTargetURL.test(window.location.href));
if (loginTargetURL.test(window.location.href)) {
    console.log("redirect this link to plugin")
    // Notify the background script to redirect
    chrome.runtime.sendMessage({
        action: "local_pages_intercept",
        redirect: true,
        uri: "/pages/login.html"
    });
}

const logout_silentTargetURL = new RegExp(/\/\/www\.yellownotes\.cloud\/logout_silent/);
console.log(logout_silentTargetURL.test(window.location.href));
if (logout_silentTargetURL.test(window.location.href)) {
    console.log("redirect this link to plugin")
    // Notify the background script to redirect
    chrome.runtime.sendMessage({
        action: "local_pages_intercept",
        redirect: true,
        uri: "/logout_silent"
    });
}

const targetURL = new RegExp(/\/\/www\.yellownotes\.cloud\/view_yellownotes/);
if (targetURL.test(window.location.href)) {
    console.log("redirect this link to plugin")
    // Notify the background script to redirect
    chrome.runtime.sendMessage({
        action: "local_pages_intercept",
        redirect: true,
        uri: "/pages/view_yellownotes.html"
    });
}


const gothere = new RegExp(/\/\/www\.yellownotes\.cloud\/DISABLEgothere/);
if (gothere.test(window.location.href)) {
    console.log("redirect to go to note")

    // first check if user is authorized for note
    const noteid = getQueryStringParameter('noteid');
    console.debug(noteid);
    chrome.runtime.sendMessage({
        action: "get_authorized_note",
        noteid: noteid

    }).then(function (note_data) {
        console.log("note_data");
        console.log(note_data);
        console.log(note_data[0].json);
        const note_obj = JSON.parse(note_data[0].json);
        console.log(note_obj);
        const note_type = note_obj.note_type;
        const brand = "default";

        const msg = {
            action: "get_template",
            brand: brand,
            note_type: note_type
        };
        console.log(msg);
        return chrome.runtime.sendMessage(msg);

    }).then(function (response) {

        //console.debug("browsersolutions message sent to background.js with response: " + JSON.stringify(response));
        const note_template = response;
        console.debug("browsersolutions note_template: ");
        // console.debug( note_template);
        console.debug("browsersolutions resolve");
        var template = safeParseInnerHTML(note_template, 'div');
        console.debug("browsersolutions placeStickyNote");
        placeStickyNote(note_data, template, creatorDetails, isOwner, newNote, true);
        resolve({
            note_data,
            note_template
        });
    }).catch(reject);

    // Notify the background script to redirect
    chrome.runtime.sendMessage({
        action: "local_pages_intercept",
        redirect: true,
        uri: "/pages/view_yellownotes.html"
    });
}

/*
leave this intercept out for now
run the welcome page of the server to make updating it quicker
 */
const welcomeURL = new RegExp(/\/\/www\.yellownotes\.cloud\/welcome.html/);
if (welcomeURL.test(window.location.href)) {
    console.log("redirect this link to plugin")
    chrome.runtime.sendMessage({
        action: "local_pages_intercept",
        redirect: true,
        uri: "/pages/welcome.html"
    });
}

// Function to get the value of the 'dist' query string parameter
function getQueryStringParameter(param) {
    var queryString = window.location.search.substring(1);
    var queryParams = queryString.split('&');

    for (var i = 0; i < queryParams.length; i++) {
        var pair = queryParams[i].split('=');
        if (pair[0] == param) {
            return decodeURIComponent(pair[1]);
        }
    }
    return null;
}
