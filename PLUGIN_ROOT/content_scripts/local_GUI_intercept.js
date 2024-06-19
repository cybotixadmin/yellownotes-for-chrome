/**
 * This script intercept cliks to links that should be redirected to /pages/ hosted on the plugin
 *
 */
console.log("Browsersolutions: local_GUI_intercept.js loaded");

console.log(window.location.href);

if ((new RegExp(/\/\/www\.yellownotes\.cloud\/(pages\/my_account.html|my_account.html)/)).test(window.location.href)) {
    console.log("redirect this link to plugin")
    // Notify the background script to redirect
    chrome.runtime.sendMessage({
        action: "local_pages_intercept",
        redirect: true,
        uri: "/pages/my_account.html"
    });
}

/**
 *
 */
else if ((new RegExp(/\/\/www\.yellownotes\.cloud\/(pages\/my_notes.html|my_notes.html)/)).test(window.location.href)) {
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

/*
 */
else if ((new RegExp(/\/\/www\.yellownotes\.cloud\/pages\/about_yellownotes.html/)).test(window.location.href)) {
    console.log("redirect this link to plugin")
    // Notify the background script to redirect
    chrome.runtime.sendMessage({
        action: "local_pages_intercept",
        redirect: true,
        uri: "/pages/about_yellownotes.html"
    });
}

/*
intercept inviation-links to subscribe to feeds
 */
else if ((new RegExp(/\/\/www\.yellownotes\.cloudDISABLED\/subscribe/)).test(window.location.href)) {

    const distributionlistid = new URLSearchParams(window.location.search).get("distributionlistid");
    const redirecturi = new URLSearchParams(window.location.search).get("redirecturi");
    console.log("inviteregexp.test(window.location.href)");
    var uri;
    if (redirecturi) {
        uri = "/pages/my_subscriptions.html?add_distributionlistid=" + distributionlistid + "&redirecturi=" + encodeURIComponent(redirecturi);
    } else {
        uri = "/pages/my_subscriptions.html?add_distributionlistid=" + distributionlistid;
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
/*

*/
 else if ((new RegExp(/\/\/www\.yellownotes\.cloud\/(pages\/subscribe.html|subscribe.html)/)).test(window.location.href)) {
    console.log("redirect to subscribe page")
    // Extract query string (everything after the '?' character)
    const queryString = (window.location.href).split('?')[1] || '';

    // Notify the background script to redirect
    chrome.runtime.sendMessage({
        action: "local_pages_intercept",
        redirect: true,
        uri: "/pages/subscribe.html?" + queryString
    });
}


/*
part of the workaround implemented for pages blocking the default browser context menu
*/
else if ((new RegExp(/\/\/www\.yellownotes\.cloud\/(pages\/attach_to_current_tab.html|attach_to_current_tab.html)/)).test(window.location.href)) {
    console.log("redirect to attach note page")
    // Extract query string (everything after the '?' character)
    const queryString = (window.location.href).split('?')[1] || '';

    // Notify the background script to redirect
    chrome.runtime.sendMessage({
        action: "local_pages_intercept",
        redirect: true,
        uri: "/pages/attach_to_current_tab.html?" + queryString
    });
}


// intercept links to individual notes
else if ((new RegExp(/\/\/www\.yellownotes\.cloud\/(pages\/gothere.html|gothere.html)/)).test(window.location.href)) {
    console.log("/gothere.html")
    console.log("redirect to go to note")
    const noteid = new URLSearchParams(window.location.search).get("noteid");

    //const redirecturi = new URLSearchParams(window.location.search).get("redirecturi");
    //console.log(gothereregexp.test(window.location.href));

    const queryString = window.location.search;

    console.log("redirect this link to plugin")
    // Notify the background script to redirect
    chrome.runtime.sendMessage({
        action: "local_pages_intercept",
        redirect: true,
        uri: "/pages/gothere.html" + queryString
    });

    // invoke the background script to scroll to the note in question
  //  chrome.runtime.sendMessage({
  //      message: {
  //          action: "gothere",
  //          gothere: {
  //              noteid: noteid
  //          }
  //      }
  //  }, function (response) {
  //      console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
  //  });

} 
 /*

*/

else if ((new RegExp(/\/\/www\.yellownotes\.cloud\/pages\/view_distributionlist.html/)).test(window.location.href)) {
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

/*
intercept the my_subscriptions page
This show the feeds/distributionlist the user is subscribing to
It is alaviable to authentucated and unauthenticated users both
 */
else if ((new RegExp(/\/\/www\.yellownotes\.cloud\/pages\/my_subscriptions.html/)).test(window.location.href)) {
    // Extract the query string
    const queryString = window.location.search;

    console.log("redirect this link to plugin")
    // Notify the background script to redirect
    chrome.runtime.sendMessage({
        action: "local_pages_intercept",
        redirect: true,
        uri: "/pages/my_subscriptions.html" + queryString
    });
/*

*/
} else if ((new RegExp(/\/\/www\.yellownotes\.cloud\/pages\/subscribed_notes.html/)).test(window.location.href)) {
    console.log("redirect this link to plugin")
    // Notify the background script to redirect
    chrome.runtime.sendMessage({
        action: "local_pages_intercept",
        redirect: true,
        uri: "/pages/subscribed_notes.html"
    });
/*

*/
} else if ((new RegExp(/\/\/www\.yellownotes\.cloud\/login.html/)).test(window.location.href)) {
    console.log("redirect this link to plugin")
    // Notify the background script to redirect
    chrome.runtime.sendMessage({
        action: "local_pages_intercept",
        redirect: true,
        uri: "/pages/login.html"
    });
/*

*/
} else if ((new RegExp(/\/\/www\.yellownotes\.cloud\/DISABLEDlogout_silent/)).test(window.location.href)) {
    console.log("redirect /logout_silent to plugin")
    // Notify the background script to redirect
    chrome.runtime.sendMessage({
        action: "local_pages_intercept",
        redirect: true,
        uri: "/logout_silent"
    });

}
/**
 * intercept the view_yellownotes page
 */
else if ((new RegExp(/\/\/www\.yellownotes\.cloud\/view_yellownotes/)).test(window.location.href)) {
    console.log("redirect this link to plugin")
    // Notify the background script to redirect
    chrome.runtime.sendMessage({
        action: "local_pages_intercept",
        redirect: true,
        uri: "/pages/view_yellownotes.html"
    });
}

/*

*/
else if ((new RegExp(/\/\/www\.yellownotes\.cloud\/pages\/DISABLEDgothere.html/)).test(window.location.href)) {
    console.log("redirect this link to plugin /pages/gothere.html")
    // Notify the background script to redirect


    // Extract query string (everything after the '?' character)
    const queryString = (window.location.href).split('?')[1] || '';

    const new_uri = "/pages/gothere.html?" + queryString;

    chrome.runtime.sendMessage({
        action: "local_pages_intercept",
        redirect: true,
        uri: new_uri
    });
}
/*

*/

else if ((new RegExp(/\/\/www\.yellownotes\.cloud\/DISABLEgothere/)).test(window.location.href)) {
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
else if ((new RegExp(/\/\/www\.yellownotes\.cloud\/(pages\/welcome.html|welcome.html)/)).test(window.location.href)) {
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
