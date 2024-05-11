
console.debug("start with Yellow Notes");

/*
 *
 * This tool is for adding annotation to the live internet. Describable as Augmentet Reality for the Internet.
 *
 * You add notes to other wedsite notes that exists on you won computer but visible when you go to the remote location.
 * A fully fleshed out and annotated bookmark. Not merely a saved link in you browser, but virtual "sticky note" out there. These notes are shareable to others who will see you notes out there when they go to same place.
 * The site in question is not touched at all. All action happens in the browser plugin and a central "sticky note exchange".
 *
 *
 * Stage 1 Development. Create a stand-alone web annotation service.
 *
 * Stage 2 Make the notes shareable.
 *
 * Stage 3 By paid subscription.

 * */

const server_url = "https://api.yellownotes.cloud";

const URI_plugin_user_create_yellownote = "/api/v1.0/plugin_user_create_yellownote";
const URI_plugin_user_update_yellownote = "/api/v1.0/plugin_user_update_yellownote";
const URI_plugin_user_setstatus_yellownote = "/api/v1.0/plugin_user_setstatus_yellownote";

const URI_plugin_user_add_subscription_v10 = "/api/v1.0/plugin_user_add_subscription";

const URI_plugin_user_get_all_url_yellownotes = "/api/plugin_user_get_all_url_yellownotes";

const URI_plugin_user_get_all_yellownotes = "/api/plugin_user_get_all_yellownotes";

const URI_plugin_user_get_subscribed_url_yellownotes = "/api/v1.0/plugin_user_get_subscribed_url_yellownotes";

const URI_plugin_user_get_own_url_yellownotes = "/api/v1.0/plugin_user_get_own_url_yellownotes";

const URI_plugin_user_get_my_distribution_lists = "/api/v1.0/plugin_user_get_my_distribution_lists";

const URI_plugin_user_delete_yellownote = "/api/v1.0/plugin_user_delete_yellownote";

const URI_plugin_user_get_a_subscribed_note = "/api/v1.0/plugin_user_get_a_subscribed_note";
let salt;

// at installation time a unique identifies is ser for this browser extension. Make this available to the server for identification purposes.
var installationUniqueId;
// the user's authentication token
var sessiontoken;

// the user's unique identifier
var uuid;

const plugin_uuid_header_name = "ynInstallationUniqueId";

// name of HTTP header contaning the session token
const plugin_session_header_name = "xyellownotessession_jwt";

// the session cookie will look something like
// {"userid":"lars.reinertsen@browsersolutions.no","name":"Lars Reinertsen","sessionid":"109be0df-6787-4ab1-cf28-7a329f6b1bed"}

var config = {};

/* keep a record of the setting of individual tabs on whether or not notes should be shown on them, and if so, which kinds
Key is tab id
 */
var in_memory_tab_settings = {};

/** Check if a unique ID has been set for this extenstion. It not, set one.
 * This ID is used to identify the user with the server without the user having to provide any information.
 * The level of security is weak, but it is sufficient for the purpose of this tool when used in the unauthenticated-mode.
 * User requireing stronger security, or cross-device capability, must use the authenticated mode.
 *
 */
chrome.storage.local.get([plugin_uuid_header_name], function (result) {

    if (!result[plugin_uuid_header_name]) {
        // Generate uniqueId here (either fetch from server or generate locally)
        // generate a new unique identifier
        let guid = () => {
            let s4 = () => {
                return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }
        const ynInstallationUniqueId = guid();
        console.debug("setting ynInstallationUniqueId (" + ynInstallationUniqueId + ")");
        chrome.storage.local.set({
            "ynInstallationUniqueId": ynInstallationUniqueId
        });
    } else {
        console.debug("ynInstallationUniqueId already set (" + result[plugin_uuid_header_name] + ")");
    }
});

//const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CACHE_DURATION = 60 * 1000; // 1 minute in milliseconds
const CACHE_URL_REGEX_PATTERN = /.*/; // Adjust this pattern as needed

// Function to check if a URL matches your pattern
function matchesCachePattern(url) {
    console.log("matchesCachePattern (" + url + ") = " + CACHE_URL_REGEX_PATTERN.test(url));
    // Implement pattern matching logic here
    return CACHE_URL_REGEX_PATTERN.test(url);
}

// Function to cache data
function DELETEcacheData(key, data) {
    console.log("cacheData (" + key + ")");
    const cacheEntry = {
        data: data,
        timestamp: Date.now()
    };
    chrome.storage.local.set({
        [key]: cacheEntry
    }, () => {
        console.log(`Data cached for ${key}`);
    });
}

// Function to retrieve cached data
function DELgetCachedData(url) {
    console.log("getCachedData (" + url + ")");
    return new Promise(resolve => {
        chrome.storage.local.get(url, result => {
            resolve(result[url]);
        });
    });
}

// Intercepting fetch requests for caching purposes
/*
self.addEventListener('fetch', event => {
console.log("fetch (" + event.request.url + ")");
const url = event.request.url;
if (matchesCachePattern(url)) {
event.respondWith(
getCachedData(url, timeout).then(cacheEntry => {
if (cacheEntry && Date.now() - cacheEntry.timestamp < CACHE_DURATION) {
return new Response(new Blob([cacheEntry.data]));
} else {
return fetch(event.request).then(response => {
response.clone().text().then(content => {
cacheData(url, content);
});
return response;
});
}
}));
}
});

 */

chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install") {
        chrome.tabs.create({
            url: "https://www.yellownotes.cloud/pages/welcome.html"
        });
    }
});

// start silder
// set initial values for the slider
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
        isEnabled: true,
        defaultSliderPosition: 3
    });
});

var show_sliders = true;
var defaultSliderPosition = 3;

chrome.storage.sync.get(['defaultSliderPosition'], function (result) {
    if (result.hasOwnProperty('defaultSliderPosition')) {
        // If the value exists in storage, update the variable
        defaultSliderPosition = result['defaultSliderPosition'];
        console.log('Value retrieved from storage: ', defaultSliderPosition);
    } else {
        // If the value does not exist, set the variable to the default value
        defaultSliderPosition = 3;
        chrome.storage.sync.set({
            defaultSliderPosition: defaultSliderPosition
        }).then(function (d) {
            console.log('Value not found in storage. Default value set:', defaultSliderPosition);

        });
    }
});

// end silder


var in_memory_tab_settings = {};

// set up the context menu items here
chrome.contextMenus.create({
    id: "yellownotes",
    title: "Yellow Notes",
    contexts: ["all"]
});

chrome.contextMenus.create({
    id: "create-yellownote",
    parentId: "yellownotes",
    title: "attach yellow note to selection",
    contexts: ["selection"]
});

//chrome.contextMenus.create({
//    id: "lookup-yellow-stickynotes",
//    parentId: "yellownotes",
//    title: "check for yellow sticky-notes",
//    contexts: ["selection"]
//});

// create the notes posting external content
chrome.contextMenus.create({
    id: "pin-content-note",
    parentId: "yellownotes",
    title: "attach other web content to selection",
    contexts: ["selection"]
});

// to create blank stickynote on any page, not tied to a text selection
chrome.contextMenus.create({
    id: "create-free-yellownote",
    parentId: "yellownotes",
    title: "attach yellow note on page",
    contexts: ["all"]
});
chrome.contextMenus.create({
    id: "create-free-webframenote",
    parentId: "yellownotes",
    title: "attach other web content on page",
    contexts: ["all"]
});

// listener for context menu clicks

chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.debug("chrome.contextMenus.onClicked.addListener:info:" + JSON.stringify(info));
    console.debug("chrome.contextMenus.onClicked.addListener:tab:" + JSON.stringify(tab));

    if (info.menuItemId === "create-yellownote") {
        console.debug("# create-yellownote");

        // use embeded as the content type. It captures more data some of which will not be used, but it more likely to be uniquely anchored.
        //create_yellownote(info, tab, 'anchor');
        pinYellowNote(info, tab, 'yellownote', 'default');

    } else if (info.menuItemId === "pin-content-note") {
        // pinContentNote(info, tab, 'webframe', 'default');
        pinYellowNote(info, tab, 'webframe', 'default');
    } else if (info.menuItemId === "pin-dagensneringsliv-note") {
        pinYellowNote(info, tab, 'webframe', 'dagensneringsliv');

    } else if (info.menuItemId === "pin-klassekampen-note") {
        pinYellowNote(info, tab, 'webframe', 'klassekampen.no');
    } else if (info.menuItemId === "pin-faktisk-note") {
        pinYellowNote(info, tab, 'webframe', 'faktisk.no');

    } else if (info.menuItemId === "lookup-yellow-stickynotes") {
        lookup_yellownotes(info, tab);

    } else if (info.menuItemId === "create-free-yellownote") {
        console.debug("# create-free-yellownote");
        //create_free_yellownote(info, tab);
        pinYellowNote(info, tab, 'yellownote', 'default');
    } else if (info.menuItemId === "create-free-webframenote") {
        console.debug("# create-free-webframenote");
        //create_free_webframe_note(info, tab);
        pinYellowNote(info, tab, 'webframe', 'default');
    }
});

function pinYellowNote(info, tab, note_type, brand) {

    try{
    // contenttype
    // permitted values: text, html, embeded, http_get_url

    // call back out to the content script to get the selected html - and other parts of the page -and create the not object

    // Should the user later click "save" The event handler for the save-event in the content script will then call back to the background script to save the note to the database.

    console.debug("pinYellowNote (info," + note_type + ") and " + brand);
    console.debug(JSON.stringify(info));
    console.debug(JSON.stringify(tab));
    var pageUrl = info.pageUrl;
    // this is the selection the user flagged.
    var selectionText = info.selectionText;
    console.log("selectionText: " + selectionText);
    console.log(selectionText);

    // call out to the tab to collect the complete html selected
    var replacement_text = new String("");

    var selection_html;
    var usekey;
    var usekey_uuid;
    // ID of tab in use
    var tab_id = tab.id;
    console.debug("tab_id: " + tab_id);

    // get the template file from the server
    console.debug("###calling for contenttype=" + note_type);

    var shared_secret_to_identify_background_js_to_content_script_NoteSelectedHTML = "Glbx_marker6";
    var PinToSelectedHTML_sharedsecret = "Glbx_maraskesfser6";
    if (brand == '') {
        brand = 'default';
    }

    // lookup the template file
    var note_template;
    var note_properties;
    var sessionToken;
    chrome.storage.local.get([plugin_session_header_name]).then(function (result) {
        console.log(JSON.stringify(result));
        sessionToken = result[plugin_session_header_name];
        console.log(sessionToken);
        uuid = getUuid(sessionToken);
        console.log("uuid: " + uuid);
        // get a template, even if it is the default one
        return getTemplate(brand, note_type);
    }).then(function (result) {
        console.log(result);
        note_template = result;
        console.log("note_template");
        console.log(note_template);

        // get personal template related informaton
        console.log("uuid" + uuid);
        console.debug("calling fetchDataFromApi2");
        return fetchDataFromApi2(uuid);

    }).then(function (result) {
        console.log(result);

        note_properties = result;
        console.log("note_properties");
        console.log(note_properties);
// if not was returned, use default

if (note_properties == null) {
// use default for note properties
note_properties = {
"box_height" :"250px",
"box_width": "250px",
"note_color": "#ffff00" 
};
}

        //      return fetch(server_url + '/api/v1.0/get_note_properties', {
        //          method: 'POST',
        //          headers: {
        //              'Content-Type': 'application/json',
        //              [plugin_uuid_header_name]: installationUniqueId,
        //              [plugin_session_header_name]: sessiontoken
        //          },
        //          body: JSON.stringify({
        //              creatorid: uuid
        //           })
        //       });
        //   }).then(function (response) {
        //       console.log(response);
        //       if (!response.ok) {
        //           console.log('API_URL_2 Fetch Error: ' + response.statusText);
        //           // return blank (lower-priority values, or defaults, will be used later.)
        //           return {};
        //      } else {
        //          //note_properties = response.json();
        //          return response.json();
        //      }
        //  }).then(function (data) {
        //      note_properties = data;
        // execute script in active tab
        //    return chrome.scripting.executeScript({
        //        target: {
        //            tabId: tab.id
        //        },
        //        files: ["./content_scripts/PinToSelectedHTML.js"]
        //    });
        //})
        // .then(function (result) {
        // send message to the active tab
        const msg = {
            action: "createnode",
            sharedsecret: PinToSelectedHTML_sharedsecret,
            note_type: note_type,
            brand: brand,
            note_template: note_template,
            note_properties: note_properties,
            session: sessionToken,
            info: info,
            tab: tab
        };
        console.debug("sending message back to tab: " + JSON.stringify(msg) );
        return chrome.tabs.sendMessage(tab_id, msg);
    }).then(function (res) {
        console.debug("###### pinYellowNote response " + JSON.stringify(res));

    });

    }catch(e){
        console.log(e);
    }

}

// for access to admin page there is a separate listener
//chrome.browserAction.onClicked.addListener(() => {
//    // use this functionality to get a full tabpage
//    console.debug("chrome.browserAction.onClicked.addListener");
//    chrome.tabs.create({
//        url: "./pages/view_yellownotes.html"
//    });
//    // can replace the above with a direct referal to this html in the manifest
//    // - but this would not provide a full tab-page
//    // "brower_action": {
//    // "default_popup": "navigate-collection.html"
//});

// in-memory variable
var in_memory_policies = {};

// listener for messages from the content scripts or the admin pages
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.debug("####################################################");
    console.debug("####################################################");
    console.debug(message);
    console.debug(sender);
    console.debug(message.action);
    console.debug("received from page: " + JSON.stringify(message));

    const tab_id = sender.tab.id;

    try {
        var action = "";
        action = message.action;
        console.debug("action: " + action);

        if (isUndefined(message.action)) {

            if (!isUndefined(message.message.action)) {
                action = message.message.action;

            }

        }

        try {
            if (isUndefined(message.stickynote)) {
                if (isUndefined(message.stickynote.request)) {
                    if (message.stickynote.request) {

                        action = message.stickynote.request;
                    }
                }
            }
        } catch (f) {
            console.debug(f);
        }
    } catch (e) {
        console.debug(e);
    }

    console.debug("action: " + action);
    var ynInstallationUniqueId = "";
    var xYellownotesSession = "";
    try {

        if (action === "toggleSlider") {
            // set slider show/noshow
            // show the notes slider on the page
            try {
                console.log("action: toggleSlider")
                // get new value
                console.log(message);
                console.log(message.isSlidersEnabled);

                // enable sliders
                //if (message.isSlidersEnabled){
                console.log("enable slid");
                show_sliders = true;
                messagePayload = {
                    slidershow: message.isSlidersEnabled
                }
                // Relay the state to all open tabs
                // Query all tabs
                chrome.tabs.query({}, function (tabs) {
                    for (let i = 0; i < tabs.length; i++) {
                        chrome.tabs.sendMessage(tabs[i].id, messagePayload);
                    }
                });
            } catch (e) {
                console.log(e);
            }
        } else if (action === "setSliderDefaultPosition") {
            // set slider default position
            // for new pages, or pages where no setting has been made, this is the default
            try {
                console.log("action: setSliderDefaultPosition")
                // get new value
                console.log(message);
                console.log(message.setting);

                defaultSliderPosition = message.setting;

                chrome.storage.sync.set({
                    isEnabled: true,
                    defaultSliderPosition: message.setting
                });

                // Send a message to all tabs to update the slider position on any tab where no slider position has been specifically set by user action.
                // update the display/non-display of yellownotes accordingly.
                // This takes effect regardless of whether or not the slider is currently shown on the page.
                const sliderupdate_sharedsecret = "Glbx_marke346gewergr3465";

                chrome.tabs.query({}, function (tabs) {
                    for (let tab of tabs) {
                        try {
                            console.log("sending message to tab: " + tab.id);
                            chrome.tabs.sendMessage(tab.id, {
                                "action": "updateSliderPosition",
                                "defaultSliderPosition": message.setting,
                                "sharedsecret": sliderupdate_sharedsecret
                            });
                        } catch (e) {
                            console.log(e);
                        }
                    }
                });

            } catch (e) {
                console.log(e);
            }
        } else if (action === "activeateSubscriptionOnAllTabs") {
            console.log("activeateSubscriptionOnAllTabs: subscription_details: " + JSON.stringify(message.subscription_details));

            // send message to all tabs to activate the subscription (look for any notes pertaning to the URL in question) on those tabs, if the slider position is set to 3


        } else if (action === "suspendSubscriptionOnAllTabs") {
            console.log("suspendSubscriptionOnAllTabs: subscription_details: " + JSON.stringify(message.subscription_details));

            // send message to all tabs to suspend the subscription (remove any notes pertaning to the URL in question) from those tabs, if the slider position is set to 3


        } else if (action === "getSliderDefaultPosition") {
            console.log("getSliderDefaultPosition: " + defaultSliderPosition)
            // Relay the state to all open tabs

            sendResponse({
                defaultSliderPosition: defaultSliderPosition
            });
            //return true;


        } else if (action === "execute_notesupdate_on_page") {
            console.debug("execute_notesupdate_on_page");
            console.debug("tab_id: " + sender.tab.id);
            console.debug(message);
            console.debug(message.message);

            //chrome.scripting.executeScript({
            //    target: {
            //        tabId: sender.tab.id
            //    },
            //    files: ["./content_scripts/NotesHandler.js"],
            //}).then(function (result) {
            // send message to the active tab
            //    return chrome.tabs.sendMessage(sender.tab.id, {
            chrome.tabs.sendMessage(sender.tab.id, {
                sharedsecret: "qwertyui",
                action: "update_notes_on_page",
                position: message.message.parameters.position

                //});
            }).then(function (res) {
                // read response
                console.debug("# response " + JSON.stringify(res));
                sendResponse(res);
            });

            return true;

        } else if (action === "simple_url_lookup") {
            console.log("simple_url_lookup " + JSON.stringify(message));
            // upen a tab and get a URL, then close the tab

            console.log("simple_url_lookup");
            const url = message.message.url;
            console.log(url);
            if (url == "") {
                sendResponse(null);
            } else {
                // call to the "cookie jar" to collect any cookies pertaining to this URL.
                // this is essetial for authentication purposes. The cookies are needed to authenticate the user with the server.
                // session cookie are generallt set to SameSite = lax,
                // which means that they are not sent to the server when the url is being opened from inside an iframe
                logCookiesForUrl(url).then(function (cookies) {
                    console.debug(cookies);

                    // make a fetch to get the page content, using the cookies retieved above

                    return fetchContentWithCookies(url, cookies);
                }).then(content => {
                    console.log('Fetched content:', content);
                    sendResponse(content);
                })
                .catch(error => {
                    console.error('Error fetching content:', error);
                });

            }
            return true;
        } else if (action === "getDistributionLists") {
            console.log("getDistributionLists")
            // get all distribution list belonging to the user

            try {
                chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]).then(function (result) {
                    ynInstallationUniqueId = result[plugin_uuid_header_name];
                    xYellownotesSession = result[plugin_session_header_name];
                    console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);
                    console.debug("xYellownotesSession: " + xYellownotesSession);

                    // Create an AbortController instance
                    const controller = new AbortController();
                    const signal = controller.signal;

                    // Set a timeout of 5 seconds (in milliseconds)
                    const timeout = setTimeout(() => {
                            controller.abort();
                        }, 5000);

                    const opts = {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            [plugin_uuid_header_name]: ynInstallationUniqueId,
                            [plugin_session_header_name]: xYellownotesSession
                        },
                        signal: signal

                    };
                    console.debug(opts);

                    return fetch(server_url + URI_plugin_user_get_my_distribution_lists, opts);
                }).then(function (response) {
                    //                console.log(response);
                    return response.json();
                }).then(function (data) {
                    // return the uuid assigned to this note
                    sendResponse(data);

                });
            } catch (e) {
                console.log(e);
                sendResponse(null);

            }
            return true;

        } else if (action == "local_pages_intercept") {
            // redirect an external link to the GUI page hosted on the plugin itself
            console.debug("local_pages_intercept");
            console.debug(message.redirect);
            console.debug(message.uri);
            if (message.redirect) {
                // The URL inside the plugin (e.g., an HTML file)
                const pluginURL = chrome.runtime.getURL(message.uri);
                chrome.tabs.update(sender.tab.id, {
                    url: pluginURL
                });
            }

        } else if (action == 'single_create') {
            console.debug("request: save a new yellow note");
            // pass the note create message on to the server, returning the unique identifier assigned to the note.
            chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]).then(function (result) {
                ynInstallationUniqueId = result[plugin_uuid_header_name];
                xYellownotesSession = result[plugin_session_header_name];
                console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);
                console.debug("xYellownotesSession: " + xYellownotesSession);

                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [plugin_uuid_header_name]: ynInstallationUniqueId,
                        [plugin_session_header_name]: xYellownotesSession
                    },
                    body: JSON.stringify(message.message.create_details),
                };
                //        console.debug(opts);


                return fetch(server_url + URI_plugin_user_create_yellownote, opts);
            }).then(function (response) {
                //                console.log(response);
                return response.json();
            }).then(function (data) {
                // return the uuid assigned to this note
                sendResponse(data);

            });
            return true;
        } else if (action == 'show_all_sliders') {
            console.log("request: show_all_sliders");
            const messagePayload = {
                action: 'show_slider',
                data: 'YOUR_DATA_HERE'
            };

            // Query all tabs - send a message to all tabs to show the slider
            chrome.tabs.query({}, function (tabs) {
                for (let i = 0; i < tabs.length; i++) {
                    chrome.tabs.sendMessage(tabs[i].id, messagePayload);
                }
            });
        } else if (action == 'close_all_sliders') {
            console.log("request: close_all_sliders");

            const messagePayload = {
                action: 'close_slider',
                data: 'YOUR_DATA_HERE'
            };

            // Query all tabs - and send message to close the slider
            chrome.tabs.query({}, function (tabs) {
                for (let i = 0; i < tabs.length; i++) {
                    chrome.tabs.sendMessage(tabs[i].id, messagePayload);
                }
            });

        } else if (action == 'get_current_tabid') {
            console.log("request: store_current_slider_value_for_tab");
            console.log("request: store_current_slider_value_for_tab: " + JSON.stringify(message));
            console.log(sender);
            console.log(sender.tab.id);
            console.log(in_memory_tab_settings);
            // in_memory_tab_settings["sender.tab.id"] = [ "true", sender.url,"6" ];

            //  console.log(in_memory_tab_settings);
            // store the value in the in-memory store, with key = tab.id
            // in_memory_policies["tab_id_slider_value"][sender.tab.id] = message.stickynote.value;
            sendResponse(sender.tab.id);

        } else if (action == 'single_yellownote_update') {
            console.debug("request: update a single yellow note");
            // if update is to disable the note, remove it from the in-memory store

            const uuid = message.message.update_details.uuid;

            console.debug(message.message.update_details);
            chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]).then(function (result) {
                ynInstallationUniqueId = result[plugin_uuid_header_name];
                xYellownotesSession = result[plugin_session_header_name];
                console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);
                console.debug("xYellownotesSession: " + xYellownotesSession);

                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [plugin_uuid_header_name]: ynInstallationUniqueId,
                        [plugin_session_header_name]: xYellownotesSession
                    },
                    body: JSON.stringify(message.message.update_details),
                };
                return fetch(server_url + URI_plugin_user_update_yellownote, opts);
            }).then(function (response) {
                console.log(response);
                // send notification to all pages to update this note
                return chrome.tabs.sendMessage(sender.tab.id, {
                    sharedsecret: "qwertyui",
                    action: "update_single_note_on_page",
                    uuid: uuid

                });
            }).then(function (res) {
                //                  console.log(data);
                sendResponse(message.message.update_details);

            });

        } else if (action == 'subscribe') {

            console.debug("action: subscribe");
            const distributionlistid = message.distributionlistid;
            // make call to backend to add the user to the distribution list

            var plugin_uuid;
            var session;

            const userid = "";
            const message_body = JSON.stringify({
                    distributionlistid: subscriptionid
                });
            chrome.storage.local.get(["ynInstallationUniqueId"])
            .then(pluginUuidResult => {
                plugin_uuid = pluginUuidResult[plugin_uuid_header_name];

                return chrome.storage.local.get([plugin_session_header_name]).then(sessionResult => {
                    session = sessionResult[plugin_session_header_name];

                    // Fetch data from web service
                    return fetch(server_url + URI_plugin_user_add_subscription_v10, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            [plugin_uuid_header_name]: plugin_uuid,
                            [plugin_session_header_name]: session,
                        },
                        body: message_body,
                    });
                });
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
                // update the row in the table of current subscriptions
            })
            .catch(error => {
                console.error('Error:', error);
            });

            // The URL inside the plugin (e.g., an HTML file)
            const pluginURL = chrome.runtime.getURL(message.uri);
            chrome.tabs.update(sender.tab.id, {
                url: pluginURL
            });

        } else if (action == 'get_template') {

            console.debug("action: get_template");
            console.debug(message);

            const brand = message.brand;

            const note_type = message.note_type;
            console.debug("calling getTemplate");
            getTemplate(brand, note_type).then(function (result) {
                //console.debug(result);
                sendResponse(result);
            });

            return true;

        } else if (action == 'go_there') {

            console.debug("action: go_there");
            console.debug(message);

            // verify if the user is authorized


            const brand = message.brand;

            const note_type = message.note_type;

            getTemplate(brand, note_type).then(function (result) {
                //console.debug(result);
                sendResponse(result);
            });

            return true;

        } else if (action == 'get_webframe_template') {

            console.debug("action: get_webframe_template");
            const brand = message.brand;
            console.debug("calling getTemplate");
            getTemplate(brand, "webframe").then(function (result) {
                console.debug(result);
                sendResponse(result);
            });

            return true;
        } else if (action == 'get_yellownote_template') {

            console.debug("action: get_yellownote_template");
            const brand = message.brand;
            console.debug("calling getTemplate");
            getTemplate(brand, "yellownote").then(function (result) {
                // console.debug(result);
                sendResponse(result);
            });

            return true;
        } else if (action == 'get_my_distribution_lists') {
            console.debug("request: get_my_distribution_lists");
            // if update is to disable the note, remove it from the in-memory store


            chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]).then(function (result) {
                ynInstallationUniqueId = result[plugin_uuid_header_name];
                xYellownotesSession = result[plugin_session_header_name];
                console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);
                console.debug("xYellownotesSession: " + xYellownotesSession);

                const opts = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        [plugin_uuid_header_name]: ynInstallationUniqueId,
                        [plugin_session_header_name]: xYellownotesSession
                    },

                };
                return fetch(server_url + URI_plugin_user_get_my_distribution_lists, opts);
            }).then(function (response) {
                //                console.log(response);
                return response.json();
            }).then(function (data) {
                //                  console.log(data);
                sendResponse(data);

            });

            return true;

        } else if (action == 'single_note_delete') {
            console.debug("request: delete a single yellow note");
            console.debug(JSON.stringify(message));
            console.debug(JSON.stringify(message.message.delete_details));

            const noteid = message.message.delete_details.noteid;
            chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]).then(function (result) {
                ynInstallationUniqueId = result[plugin_uuid_header_name];
                xYellownotesSession = result[plugin_session_header_name];
                console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);
                console.debug("xYellownotesSession: " + xYellownotesSession);

                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [plugin_uuid_header_name]: ynInstallationUniqueId,
                        [plugin_session_header_name]: xYellownotesSession
                    },
                    body: JSON.stringify({
                        noteid: noteid

                    })
                };
                console.debug(JSON.stringify(opts));
                return fetch(server_url + URI_plugin_user_delete_yellownote, opts);
            }).then(function (response) {
                console.debug("response: " + JSON.stringify(response));
                console.debug("sender.tab.id: " + sender.tab.id);
                console.debug("notify tab to remove note with noteid: " + noteid);
                // send notification to all pages that this note should be removed from the page
                return chrome.tabs.sendMessage(sender.tab.id, {
                    sharedsecret: "qwertyui",
                    action: "remove_single_note",
                    noteid: noteid

                });
            }).then(function (res) {

                sendResponse('{"statuscode":0}');

            });

            //delete_note(message.stickynote.delete_details).then(function (res) {});
        } else if (action == 'single_note_disable') {
            console.debug("request: disable a single yellow note");
            console.debug(JSON.stringify(message));
            console.debug(JSON.stringify(message.message.disable_details));

            const noteid = message.message.disable_details.noteid;
            chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]).then(function (result) {
                ynInstallationUniqueId = result[plugin_uuid_header_name];
                xYellownotesSession = result[plugin_session_header_name];
                console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);
                console.debug("xYellownotesSession: " + xYellownotesSession);

                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [plugin_uuid_header_name]: ynInstallationUniqueId,
                        [plugin_session_header_name]: xYellownotesSession
                    },
                    body: JSON.stringify({
                        noteid: noteid,
                        status: 0
                    })
                };
                console.debug(JSON.stringify(opts));
                return fetch(server_url + URI_plugin_user_setstatus_yellownote, opts);
            }).then(function (response) {
                console.debug("notify tab to disable note with uuid: " + uuid);
                // send notification to all pages that this note should be removed from the page
                return chrome.tabs.sendMessage(sender.tab.id, {
                    sharedsecret: "qwertyui",
                    action: "disable_single_note",
                    uuid: uuid

                });
            }).then(function (res) {
                sendResponse('{"response":"ok"}');

            });
        } else if (action == 'single_note_enable') {
            console.debug("request: enable a single yellow note");
            console.debug(JSON.stringify(message));
            console.debug(JSON.stringify(message.message.enable_details));

            const uuid = message.message.enable_details.uuid;
            chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]).then(function (result) {
                ynInstallationUniqueId = result[plugin_uuid_header_name];
                xYellownotesSession = result[plugin_session_header_name];
                console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);
                console.debug("xYellownotesSession: " + xYellownotesSession);

                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [plugin_uuid_header_name]: ynInstallationUniqueId,
                        [plugin_session_header_name]: xYellownotesSession
                    },
                    body: JSON.stringify({
                        uuid: uuid,
                        status: 1
                    })
                };
                console.debug(JSON.stringify(opts));
                return fetch(server_url + URI_plugin_user_setstatus_yellownote, opts);
            }).then(function (response) {

                sendResponse('{"response":"ok"}');

            });

        } else if (action == 'focusTab') {

            // Use the tab ID to focus the tab
            chrome.tabs.update(sender.tab.id, {
                active: true
            });

        } else if (action == 'gothere') {
            console.debug("request: gothere");
            console.debug(message);
            // lookup the details of the not in the database

            const noteid = message.message.gothere.noteid;
            console.debug("noteid: " + noteid);
            chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]).then(function (result) {
                ynInstallationUniqueId = result[plugin_uuid_header_name];
                xYellownotesSession = result[plugin_session_header_name];
                console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);
                console.debug("xYellownotesSession: " + xYellownotesSession);

                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [plugin_uuid_header_name]: ynInstallationUniqueId,
                        [plugin_session_header_name]: xYellownotesSession
                    },
                    body: JSON.stringify({
                        noteid: noteid

                    })
                };
                console.debug(JSON.stringify(opts));
                return fetch(server_url + URI_plugin_user_get_a_subscribed_note, opts);
            }).then(function (response) {
                console.debug(response);
                return response.json();
            }).then(function (data) {

                console.debug(data);
                const datarow = data[0];
                console.debug(datarow);

                openUrlAndScrollToElement(tab_id, datarow.url, datarow.noteid, datarow).then(function (res) {
                    console.debug("response: " + JSON.stringify(res));
                    sendResponse(res);
                });

                //return true;
            });
            return true;
        } else if (action == 'scroll_to_note') {
            console.debug("request: scroll_to_note");
            console.debug(message);
            const datarow = message.message.scroll_to_note_details.datarow;

            openUrlAndScrollToElement(tab_id, message.message.scroll_to_note_details.url, datarow.noteid, datarow).then(function (res) {
                console.debug("response: " + JSON.stringify(res));
                sendResponse(res);
            });
            //return true;
            //return true;

        } else if (action == 'get_authorized_note') {
            console.debug("get authorized note");
            console.debug(message);
            const noteid = message.noteid;
            // call out to database
            chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]).then(function (result) {
                ynInstallationUniqueId = result[plugin_uuid_header_name];
                xYellownotesSession = result[plugin_session_header_name];

                installationUniqueId = result[plugin_uuid_header_name];
                sessiontoken = result[plugin_session_header_name];

                console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);
                console.debug("xYellownotesSession: " + xYellownotesSession);

                console.debug("installationUniqueId: " + installationUniqueId);
                console.debug("sessiontoken: " + sessiontoken);

                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [plugin_uuid_header_name]: ynInstallationUniqueId,
                        [plugin_session_header_name]: xYellownotesSession
                    },
                    body: JSON.stringify({
                        'noteid': noteid
                    }),
                };
                console.log(opts);
                return fetch(server_url + URI_plugin_user_get_a_subscribed_note, opts);
            }).then(function (response) {
                console.log(response);
                if (!response.ok) {
                    throw new Error('Initial Fetch Error: ' + response.statusText);
                }
                // examine each note and for each note creator lookup the note formating infomation for the creator of the note
                // this is needed to display the note in the correct format


                return response.json();
            }).then(initialData => {
                console.log(initialData);
                const promises = initialData.map(item => {
                        if (item.creatorid) {
                            console.debug("calling fetchDataFromApi2");
                            return fetchDataFromApi2(item.creatorid).then(creatorData => {
                                item.creatorDetails = creatorData;
                                item.creatorDetails2 = "creatorData2";
                            });
                        }
                        return Promise.resolve();
                    });
                console.log(promises);
                return Promise.all(promises).then(() => initialData);
            })
            .then(function (data) {
                console.log(data);
                console.log(JSON.stringify(data));

                sendResponse(data);

            });
            return true;

        } else if (action == 'get_url_subscribed_yellownotes') {
            // make call to API to get all notes for this URL that are attached to feeds the user is subscribing to.
            console.debug("get all subscribed notes for " + message.message.url);
            const url = message.message.url;
            // call out to database
            chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]).then(function (result) {
                ynInstallationUniqueId = result[plugin_uuid_header_name];
                xYellownotesSession = result[plugin_session_header_name];

                installationUniqueId = result[plugin_uuid_header_name];
                sessiontoken = result[plugin_session_header_name];

                console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);
                console.debug("xYellownotesSession: " + xYellownotesSession);

                console.debug("installationUniqueId: " + installationUniqueId);
                console.debug("sessiontoken: " + sessiontoken);

                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [plugin_uuid_header_name]: ynInstallationUniqueId,
                        [plugin_session_header_name]: xYellownotesSession
                    },
                    body: JSON.stringify({
                        'url': url
                    }),
                };
                console.log(opts);
                return fetch(server_url + URI_plugin_user_get_subscribed_url_yellownotes, opts);
            }).then(function (response) {
                console.log(response);
                if (!response.ok) {
                    throw new Error('Initial Fetch Error: ' + response.statusText);
                }
                // examine each note and for each note creator lookup the note formating infomation for the creator of the note
                // this is needed to display the note in the correct format


                return response.json();
            }).then(initialData => {
                console.log(initialData);
                const promises = initialData.map(item => {
                        if (item.creatorid) {
                            console.debug("calling fetchDataFromApi2");
                            return fetchDataFromApi2(item.creatorid).then(creatorData => {
                                item.creatorDetails = creatorData;
                                item.creatorDetails2 = "creatorData2";
                            });
                        }
                        return Promise.resolve();
                    });
                console.log(promises);
                return Promise.all(promises).then(() => initialData);
            })
            .then(function (data) {
                console.log(data);
                console.log(JSON.stringify(data));

                sendResponse(data);

            });
            return true;
        } else if (action == 'get_all_available_yellownotes') {
            console.debug("get all available notes for " + message.message.url);
            const url = message.message.url;
            // call out to database
            chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]).then(function (result) {

                console.debug("installationUniqueId: " + installationUniqueId);
                console.debug("sessiontoken: " + sessiontoken);

                ynInstallationUniqueId = result[plugin_uuid_header_name];
                xYellownotesSession = result[plugin_session_header_name];
                console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);
                console.debug("xYellownotesSession: " + xYellownotesSession);

                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [plugin_uuid_header_name]: ynInstallationUniqueId,
                        [plugin_session_header_name]: xYellownotesSession
                    },
                    body: JSON.stringify({
                        'url': url
                    }),
                };
                console.log(opts);
                return fetch(server_url + URI_plugin_user_get_all_url_yellownotes, opts);
            }).then(function (response) {
                //                console.log(response);
                return response.json();
            }).then(function (data) {
                console.log(data);
                sendResponse(data);

            });
            return true;
        } else if (action == 'get_own_applicable_stickynotes') {
            console.debug("get_own_applicable_stickynotes");
            //            console.debug("get all notes for " + message.message);
            console.debug("get all notes for " + message.message.url);
            const url = message.message.url;
            // call out to database
            //  chrome.storage.local.set({xYellownotesSession: xSessionHeader.value}, () => {
            //console.log('Yellownotes Value saved in local storage:', xSessionHeader.value);
            var notes;
            chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]).then(function (result) {
                ynInstallationUniqueId = result[plugin_uuid_header_name];
                xYellownotesSession = result[plugin_session_header_name];
                console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);
                console.debug("xYellownotesSession: " + xYellownotesSession);

                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [plugin_uuid_header_name]: ynInstallationUniqueId,
                        [plugin_session_header_name]: xYellownotesSession
                    },
                    body: JSON.stringify({
                        'url': url
                    }),
                };
                console.log(opts);
                return fetch(server_url + URI_plugin_user_get_own_url_yellownotes, opts);
            }).then(function (response) {
                console.log(response);
                if (!response.ok) {
                    throw new Error('Initial Fetch Error: ' + response.statusText);
                }
                // examine each note and for each note creator lookup the note formating infomation for the creator of the note
                // this is needed to display the note in the correct format
                return response.json();
            }).then(function (initialData) {
                notes = initialData;
                console.log(notes);
                return fetchDataFromApi2(notes[0].creatorid);

            })
            .then(function (creatordata) {
                console.log(creatordata);
                console.log(JSON.stringify(creatordata));
                var resp = {};
                console.log(notes);
                console.log(Array.isArray(notes));
                resp.notes_found = notes;
                resp.creatorDetails = creatordata;

                console.log(resp);
                console.log(JSON.stringify(resp));
                //data.creatorDetails =
                sendResponse(resp);
            });
        }
    } catch (e) {
        console.debug(e);
    }

    return true;

});

// Helper to cache data with a timestamp
function cacheData(key, data) {
    console.log('cacheData: Caching data for key:', key);
    return new Promise((resolve, reject) => {
        const cachedData = {
            data: data,
            timestamp: new Date().getTime()
        };
        chrome.storage.local.set({
            [key]: cachedData
        }, function () {
            console.log(`Data cached for key: ${key}`);
            resolve();
        });
    });
}

// Helper to get cached data , timeout in seconds
function getCachedData(key, cachetimeout) {
    console.log('getCachedData: Getting cached data for key:', key, ", timeout:", cachetimeout);
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get([key], function (result) {
                if (result[key]) {
                    console.log(`Cached data for key: ${key}`, result[key].timestamp);
                    console.log((new Date().getTime() - result[key].timestamp));

                    // only accept data less than 3 hours old
                    //            if (result[key] && (new Date().getTime() - result[key].timestamp) < 3 * 3600 * 1000) {
                    // only accept data less than 10 seconds old
                    if (result[key] && (new Date().getTime() - result[key].timestamp) < cachetimeout * 1000) {
                        console.log(result[key].data);
                        resolve(result[key].data);
                    } else {
                        console.log("return null");
                        resolve(null);
                    }
                } else {
                    console.log("return null - cache miss");
                    resolve(null);
                }
            });
        } catch (e) {
            console.debug(e);
            reject();
        }
    });
}

// Helper to fetch data from API_URL_2
function fetchDataFromApi2(creatorId) {
    console.log('fetchDataFromApi2: Fetching data for creatorId:', creatorId);

    if (!creatorId) {
        // If no creator ID is supplied, resolve immediately with null
        return Promise.resolve(null);
    }

    const cacheKey = creatorId + "_creator_data";
    
    return getCachedData(cacheKey, 10)
        .then(cachedData => {
            console.log('fetchDataFromApi2: Cached data:', cachedData);

            if (cachedData) {
                console.log('Returning cached data for creatorId:', creatorId, "cacheKey:", cacheKey);
                return cachedData;
            } else {
                return fetchNewData(creatorId, cacheKey);
            }
        })
        .catch(error => {
            console.error("Error during fetchDataFromApi2:", error);
            throw error;  // Propagate the error to be handled in the next link of the promise chain
        });
}

function fetchNewData(creatorId, cacheKey) {
    return chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name])
        .then(result => {
            const installationUniqueId = result[plugin_uuid_header_name];
            const sessionToken = result[plugin_session_header_name];

            const controller = new AbortController();
            setTimeout(() => controller.abort(), 8000);

            console.log('fetchDataFromApi2: Fetching new data from API');
            return fetch(server_url + '/api/v1.0/get_note_properties', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [plugin_uuid_header_name]: installationUniqueId,
                    [plugin_session_header_name]: sessionToken
                },
                signal: controller.signal,
                body: JSON.stringify({ creatorid: creatorId })
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Caching data for', creatorId);
            return cacheData(cacheKey, data)
                .then(() => data);
        })
        .catch(error => {
            console.error("Error in fetchNewData:", error);
            throw error;  // Propagate the error to maintain the integrity of the promise chain
        });
}


function DELETEfetchDataFromApi(creatorId) {
    console.log('fetchDataFromApi: Fetching data for creatorId:', creatorId);

    // Start by fetching the cached data
    return getCachedData(creatorId, 10).then(cachedData => {
        console.log('fetchDataFromApi: Cached data:', cachedData);
        if (cachedData) {
            console.log('fetchDataFromApi: Returning cached data for creatorId:', creatorId);
            return cachedData;
        }

        // If no cached data, fetch new data from the API
        return chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]).then(result => {
            const installationUniqueId = result[plugin_uuid_header_name];
            const sessiontoken = result[plugin_session_header_name];
            console.debug("ynInstallationUniqueId: " + installationUniqueId);
            console.debug("xYellownotesSession: " + sessiontoken);

            const url = server_url + '/api/v1.0/get_note_properties';
            console.log('fetchDataFromApi2: Fetching data from API:', url);
            return fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [plugin_uuid_header_name]: installationUniqueId,
                    [plugin_session_header_name]: sessiontoken
                },
                body: JSON.stringify({
                    creatorid: creatorId
                })
            });
        })
        .then(response => {
            console.log(response);
            if (!response.ok) {
                throw new Error('API Fetch Error: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            cacheData(creatorId, data); // Assuming cacheData is an async but does not need to be awaited here
            return data;
        });
    });
}

// rewrite this to return a promise


function openUrlAndScrollToElement(tab_id, url, noteid, datarow) {
    console.debug('openUrlAndScrollToElement: Opening url ' + url + ' in tab ' + tab_id + ' and scrolling to element with noteid ' + noteid);
    console.debug(datarow);
    const creatorid = datarow.creatorid;
    var notes = [datarow];

    return new Promise((resolve, reject) => {
        fetchDataFromApi2(creatorid)
        .then((creatordata) => {
            console.log(creatordata);
            console.log(JSON.stringify(creatordata));
            var resp = {
                notes_found: notes,
                creatorDetails: creatordata
            };
            console.debug(resp);

            // Search for tabs with the specified URL
            chrome.tabs.query({
                url: url
            }, function (tabs) {
                console.debug(tabs);
                if (tabs.length > 0) {
                    console.debug("An existing tab was found with this URL.");
                    let tabId = tabs[0].id;
                    console.log('Using existing tab:', tab_id);
                    sendMessageToContentScript(tab_id, resp, noteid);
                    resolve(`Message sent to tab ${tab_id}`);
                } else {
                    // If no tabs with the URL are found, create a new one
                    chrome.tabs.update({
                        url: url
                    }, function (tab) {
                        console.log('Updated tab:', tab.id);
                        // Ensure the tab is completely loaded before sending the message
                        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
                            if (tabId === tab.id && changeInfo.status === 'complete') {
                                chrome.tabs.onUpdated.removeListener(listener); // Remove listener once the tab is loaded
                                sendMessageToContentScript(tab.id, resp, noteid);
                                resolve(`Message sent to new tab ${tab.id}`);
                            }
                        });
                    });
                }
            });
        })
        .catch((error) => {
            reject(error);
        });
    });
}

function sendMessageToContentScript(tabId, data, noteId) {
    chrome.tabs.sendMessage(tabId, {
        data: data,
        noteId: noteId
    }, function (response) {
        console.log('Response from content script:', response);
    });
}

function sendMessageToContentScript(tabId, resp, noteid) {
    // Send a message to the content script in the given tab
    console.debug('sendMessageToContentScript: Sending message to tab ' + tabId);
    const datarow = resp.notes_found[0];
    console.log(datarow);

    const node_obj = datarow.json;
    console.log(node_obj);

    var note = JSON.parse(datarow.json);

    const creatorid = datarow.creatorid;

    const note_type = note.note_type;

    // send message to the active tab
    const msg = {
        sharedsecret: "qwertyui",
        action: "create_and_scroll_to_note",
        notes: resp,
        noteid: noteid,
        note_type: note_type,
        creatorid: datarow.creatorid,
        node_obj: node_obj
    }
    console.debug(msg);

    var creatorDetails;

    console.debug(creatorid);
    // if no creatorid is present - use default values


    return chrome.tabs.sendMessage(tabId, msg).then(function (res) {
        // read response
        console.debug("# response " + JSON.stringify(res));
    });

}

function scrollToElement(selector, uuid) {
    // This part of the function will be injected and executed in the context of the webpage

    // insert a marker in the local memory to indicate that the note with this uuid should be scrolled to when the note is opened
    chrome.storage.sync.set({
        setNoteFocusTo: uuid
    });

    window.addEventListener('load', function () {
        const element = document.querySelectorAll(selector)[0];
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    });
}

function utf8_to_b64(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
}

function b64_to_utf8(str) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
}

function findTabsAndSendMessage(url, message) {
    console.log('findTabsAndSendMessage: Sending message to tabs matching url ' + url + ':', message);
    return chrome.tabs.query({
        url: url
    })
    .then(tabs => {
        console.log('Found tabs:', tabs);

        const promises = tabs.map(tab => {
                console.log('Sending message to tab ' + tab.id + ':', message);
                return chrome.tabs.sendMessage(tab.id, message)
                .then(response => console.log('Response from tab ' + tab.id + ':', response))
                .catch(error => console.error('Error sending message to tab ' + tab.id + ':', error));
            });
        return Promise.all(promises);
    })
    .catch(error => console.error('Error querying tabs:', error));
}

function createCookieHeader(cookies) {
    return cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
}

function fetchContentWithCookies(url, cookies) {
    const cookieHeader = createCookieHeader(cookies);

    return new Promise((resolve, reject) => {
        fetch(url, {
            headers: {
                'Cookie': cookieHeader
            },
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(content => resolve(content))
        .catch(error => reject(error));
    });
}

let cookiesInMemory = {};

/* #############################

Authentication to Yellow Notes Cloud infrastructure takes place here

 * pick up the session header set back from the login process in the www.yellowsnotes.cloud domain

 */

chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
    console.log(details);
    console.log(details.responseHeaders);
    console.log("looking for " + plugin_session_header_name);
    const xSessionHeader = details.responseHeaders.find(header => header.name.toLowerCase() === plugin_session_header_name);
    console.log('Possible Yellownotes session authentication header detected * * * * * *');
    if (xSessionHeader) {
        console.log('Yellownotes session value:' + xSessionHeader.value);
        chrome.storage.local.set({
            [plugin_session_header_name]: xSessionHeader.value
        }, () => {
            console.log('Yellownotes Value saved in local storage (on ', plugin_session_header_name, '): ', xSessionHeader.value);
        });
    }
}, {
    urls: ["*://www.yellownotes.cloud/*"]
},
    ["responseHeaders"]);

// effect the logout
chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
    // console.log(details);
    console.log(details.responseHeaders);
    const xSessionHeader = details.responseHeaders.find(header => header.name.toLowerCase() === plugin_session_header_name);
    console.log('Yellownotes session header detected');
    if (xSessionHeader) {
        console.log('Yellownotes session value:' + xSessionHeader.value);
        chrome.storage.local.set({
            [plugin_session_header_name]: xSessionHeader.value
        }, () => {
            console.log('Yellownotes Value saved in local storage:', xSessionHeader.value);
        });
    }
}, {
    urls: ["*://www.yellownotes.cloud/logout_silent*"]
},
    ["responseHeaders"]);

function logHeaders(tabId, url) {
    console.log('Listening for headers on tab:', tabId);
    chrome.webRequest.onBeforeSendHeaders.addListener(
        function (details) {
        console.log('Headers received for tab:', details.tabId);
        if (details.tabId === tabId) {
            console.log('Headers for tab:', details.requestHeaders);
        }
    }, {
        urls: [url]
    },
        ["requestHeaders"]);
}

function str2base64(str) {
    return btoa(str);
}

function base642str(base64) {
    return atob(base64);
}

function fetchPageContent(url) {
    return new Promise(function (resolve, reject) {
        chrome.tabs.create({
            url: url,
            active: false
        }, function (tab) {
            console.log(`Created tab ${tab.id}`);
            // Log cookies for the URL
            //logCookiesForUrl(url);


            // Listen for a message from the content script
            chrome.runtime.onMessage.addListener(function listener(response, sender) {
                if (sender.tab.id === tab.id) {
                    console.log('Content fetched: ', response.content);

                    // Close the tab
                    chrome.tabs.remove(tab.id);
                    // Close the listener
                    chrome.runtime.onMessage.removeListener(listener);
                    resolve(response.content);
                }
            });
        });
    });
}

function logCookiesForUrl(url) {
    return new Promise(function (resolve, reject) {
        // Retrieve cookies for the given URL
        chrome.cookies.getAll({
            url: url
        })
        .then(cookies => {
            // Log all cookies
            console.log(`Cookies for ${url}:`, cookies);
            resolve(cookies);
        })
        .catch(error => {
            console.error(`Error fetching cookies for ${url}:`, error);
            reject(error);
        });
    });
}

let pendingCollectedUrls = [];

function toggleSlider(isEnabled) {
    if (isEnabled) {
        // If you've saved your slider code as a separate function, you can call it here
        // insertSlider();
    } else {
        const frame = document.querySelector("#yourSliderFrameId");
        if (frame)
            frame.remove();
    }
}

function create_free_yellownote(info, tab) {
    // contenttype
    // permitted values: text, html, embeded, linked

    console.debug("create_free-yellownote(info,tab)");

    console.debug(JSON.stringify(info));
    console.debug(JSON.stringify(tab));

    var pageUrl = info.pageUrl;

    // call out to content script to create a blank note in the middle of the page

    // ID of tab in use
    var tab_id = "";

    console.debug("###calling NoteSelectedHTML.js");

    tab_id = tab.id;
    var background_to_createBlankYellowStickyNote_sharedsecret = "Glbx_marker6";

    chrome.scripting.executeScript({
        target: {
            tabId: tab_id
        },
        files: ["./content_scripts/NoteSelectedHTML.js"],
    }).then(function (result) {
        // send message to the active tab
        return chrome.tabs.sendMessage(tab_id, {
            task: "createBlankYellowStickyNote",
            contenttype: "yellownote",
            sharedsecret: background_to_createBlankYellowStickyNote_sharedsecret,
            info: info,
            tab: tab

        });
    }).then(function (res) {
        // read response
        console.debug("# response " + JSON.stringify(res));
    });
}

function create_free_webframe_note(info, tab) {
    // contenttype
    // permitted values: text, html, embeded, linked

    console.debug("create_free-webframenote(info,tab)");

    console.debug(JSON.stringify(info));
    console.debug(JSON.stringify(tab));

    var pageUrl = info.pageUrl;

    // call out to content script to create a blank note in the middle of the page

    // ID of tab in use
    var tab_id = "";

    console.debug("###calling PinToSelectedHTML.js");

    tab_id = tab.id;
    var background_to_createBlankYellowStickyNote_sharedsecret = "Glbx_marker6";
    var PinToSelectedHTML_sharedsecret = "Glbx_maraskesfser6";
    //chrome.scripting.executeScript({
    //    target: {
    //        tabId: tab_id
    //    },
    //    files: ["./content_scripts/PinToSelectedHTML.js"],
    //}).then(function (result) {
    //    // send message to the active tab
    //    return chrome.tabs.sendMessage(tab_id, {
    // use this when contentsciript is already loaded (from the monifest)
    chrome.tabs.sendMessage(tab_id, {
        sharedsecret: PinToSelectedHTML_sharedsecret,
        contenttype: "webframe",
        task: "createBlankWebFrameNote",
        info: info,
        tab: tab
        //        }); // uncomment this when contentsciript is already loaded (from the monifest)
    }).then(function (res) {
        // read response
        console.debug("# response " + JSON.stringify(res));
    });
}

function create_yellownote(info, tab, contenttype) {
    // contenttype
    // permitted values: text, html, embeded, linked

    // call back out to the content script to get the selected html - and other parts of the page - and create the note object

    // Should the user later click "save" The event handler for the save-event in the content script will then call back to the background script to save the note to the database.


    console.debug("create_yellownote(info," + contenttype + ")");

    console.debug(JSON.stringify(info));
    console.debug(JSON.stringify(tab));

    var pageUrl = info.pageUrl;
    // this is the selection the user flagged.
    var selectionText = info.selectionText;

    // call out to the tab to collect the complete html selected
    var replacement_text = new String("");

    var selection_html;
    var usekey;
    var usekey_uuid;
    // ID of tab in use

    var tab_id = tab.id;

    var shared_secret_to_identify_background_js_to_content_script_NoteSelectedHTML = "Glbx_marker6";

    console.debug("###calling NoteSelectedHTML.js for contenttype=" + contenttype);

    // identify the active tab

    // execute script in active tab

    chrome.scripting.executeScript({
        target: {
            tabId: tab_id
        },
        files: ["./content_scripts/NoteSelectedHTML.js"],
    }).then(function (result) {
        console.debug("background.js:onExecuted: result: " + JSON.stringify(result));
        const msg = {
            sharedsecret: shared_secret_to_identify_background_js_to_content_script_NoteSelectedHTML,
            contenttype: contenttype,
            selectionText: selectionText
        }
        console.debug(msg);
        return chrome.tabs.sendMessage(tab_id, msg);
    }).then(function (res) {
        // console.debug("###### getHTML response " + res);
        console.debug("###### NoteSelectedHTML response " + JSON.stringify(res));
        console.debug("###### NoteSelectedHTML response " + JSON.stringify(res.response));
        console.debug("###### NoteSelectedHTML response " + JSON.stringify(res.response.doc));
        selection_html = res.response.doc;
        // procceed with compression and encryption
        console.debug("###### NoteSelectedHTML response: " + selection_html);
        // console.debug("###### GetSelectedHTML response: " +
        // JSON.stringify(selection_html));

        return getDefaultSecretKey();
    }).then(function (response) {

        console.debug('2 default encryption key loaded OK: ' + JSON.stringify(response));
    });
}

function pinContentNote(info, tab, note_type, brand) {
    // contenttype
    // permitted values: text, html, embeded, http_get_url

    // call back out to the content script to get the selected html - and other parts of the page -and create the not object

    // Should the user later click "save" The event handler for the save-event in the content script will then call back to the background script to save the note to the database.


    console.debug("pinContentNote(info," + note_type + ") and " + brand);

    console.debug(JSON.stringify(info));
    console.debug(JSON.stringify(tab));

    var pageUrl = info.pageUrl;
    // this is the selection the user flagged.
    var selectionText = info.selectionText;

    // call out to the tab to collect the complete html selected
    var replacement_text = new String("");

    var selection_html;
    var usekey;
    var usekey_uuid;
    // ID of tab in use
    var tab_id = tab.id;
    console.debug("tab_id: " + tab_id);

    // get the template file from the server

    console.debug("###calling PinToSelectedHTML.js for contenttype=" + note_type);

    var shared_secret_to_identify_background_js_to_content_script_NoteSelectedHTML = "Glbx_marker6";
    var PinToSelectedHTML_sharedsecret = "Glbx_maraskesfser6";
    if (brand == '') {
        brand = 'default';
    }

    // lookup the template file

    var template;

    chrome.storage.local.get([plugin_session_header_name]).then(function (result) {
        console.log(JSON.stringify(result));
        const sessiontoken = result[plugin_session_header_name];
        console.log(sessiontoken);
        console.debug("calling getTemplate");
        return getTemplate(brand, note_type);
    }).then(function (result) {
        //console.log(result);

        template = result;
        //console.log(template);

        // execute script in active tab
        return chrome.scripting.executeScript({
            target: {
                tabId: tab.id
            },
            files: ["./content_scripts/PinToSelectedHTML.js"]
        });
    })
    .then(function (result) {
        // send message to the active tab
        return chrome.tabs.sendMessage(tab.id, {
            sharedsecret: PinToSelectedHTML_sharedsecret,
            note_type: note_type,
            brand: brand,
            selectionText: selectionText,
            note_template: template
            // });
        });
    }).then(function (res) {
        // console.debug("###### getHTML response " + res);
        console.debug("###### NoteSelectedHTML response " + JSON.stringify(res));

    });
}

// the session token is not completed as yet
function get_username_from_sessiontoken(token) {

    return (JSON.parse(token)).userid;

}

function get_displayname_from_sessiontoken(token) {

    return (JSON.parse(token)).displayname;

}

function isUndefined(variable) {
    return typeof variable === 'undefined';
}

/**
 * Get the template file from the server
 */
function getTemplate(brand, note_type) {
    console.log("getTemplate(brand, note_type):   " + brand + " " + note_type);
    // lookup the template file
    console.log(isUndefined(brand) || brand == null || brand == '' || brand == 'undefined');
    if (isUndefined(brand) || brand == null || brand == '' || brand == 'undefined') {
        brand = '';
    }

    //if (isUndefined(type) || type == null || type == '' || type == 'undefined') {
    //    type = 'yellownote';
    //}

    console.log("getTemplate(brand, note_type): '" + "' '" + brand + "' '" + note_type + "'");

    // The notes are/can be branded. The brand is a feature for premium users.
    // The user can also be part of a brand/organization. If so, the notes are branded accordingly.

    // feature priority: brand over user. Check first if the user is part of a brand. If so, search for a template belonging to this brand first.
    // search order: local filesystem, remote database, default templates

    // If searches return nothing or fail, the default templates are used.


    return new Promise(function (resolve, reject) {

        var template;
        var ynInstallationUniqueId;
        var xYellownotesSession;

        chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]).then(function (ins) {
            ynInstallationUniqueId = ins[plugin_uuid_header_name];
            xYellownotesSession = ins[plugin_session_header_name];
            /* first: look for the template file in the filesystem templates directory
            The template files are stored in the templates directory and have the "_template.html" file name ending.

            The template files are named according to the brand and type of the note.
            This is a feature for note belonging to (premium) brands in order to inrease performance




             */

            // first, does the user have/belong to a brand

            if (!isUndefined(brand) && brand != null && brand != '' && brand != 'undefined') {
                console.log("user has a brand: " + brand);

                // nothing found locally for the brand, try remote


                console.log("looking for template file " + './templates/' + brand + '_' + note_type + '_template.html locally');
                // look for template file in local filesystem
                fetch(chrome.runtime.getURL('./templates/' + brand + '_' + note_type + '_template.html')).then(function (response) {
                    // found the file locally, use it
                    console.debug("found the file locally, use it");
                    console.log(response);
                    template = response.text();
                    console.log(template);

                    resolve(template);
                }).catch(function (err) {
                    console.log(err);
                    // tried and failed to find the file locally, try the server ( there will be a cache-lookup intercept)
                    console.log("looking for template file " + server_url + '/template with params:');
                    const msg_obj = {

                        brand: brand,
                        note_type: note_type
                    }
                    console.log(msg_obj);
                    const message_body = JSON.stringify(msg_obj);
                    fetch(server_url + '/api/get_template', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            [plugin_uuid_header_name]: ynInstallationUniqueId,
                            [plugin_session_header_name]: xYellownotesSession,
                            // Add any other necessary headers
                        },
                        body: message_body,
                    }).then(function (response) {
                        // found the template on the server (or cache)
                        console.log(response);
                        console.log(response.status);
                        template = response.text();
                        console.log(template);
                        if (response.status != 200) {
                            // an error, look for default template file of the requested note type
                            console.log('looking for template file ./templates/default_' + note_type + '_template.html');
                            fetch(chrome.runtime.getURL('./templates/default_' + note_type + '_template.html')).then(function (response) {
                                // found the file locally
                                console.log(response);
                                template = response.text();
                                resolve(template);
                            }).catch(function (err) {
                                console.log(err);
                                reject(err);
                            });

                        } else {
                            resolve(template);
                        }
                    }).catch(function (err) {
                        console.log(err);
                        // no luck with the brand,  try the default
                        console.log('looking for template file ./templates/default_template.html');
                        fetch(chrome.runtime.getURL('./templates/default_' + note_type + '_template.html')).then(function (response) {
                            // found the file locally
                            console.log(response);
                            template = response.text();
                            resolve(template);
                        }).catch(function (err) {
                            console.log(err);
                            reject(err);
                        });
                    });
                });
            }

        });

    });
}

function isDoubleByte(str) {
    for (var i = 0, n = str.length; i < n; i++) {
        if (str.charCodeAt(i) > 255) {
            return true;
        }
    }
    return false;
}

function messageTab(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
        replacement: 'option1',
        CiphertextToPlaintext: "Glbx_marker3",
        regex: 'reg1'

    });
}

function onExecuted(result) {
    console.debug("background.js: onExecuted: We made it....");
    console.debug("background.js: onExecuted: result: " + result);
    console.debug("backgroupd.js: onExecute: selected_text: " + selected_text);

    var querying = chrome.tabs.query({
            active: true,
            currentWindow: true
        });
    querying.then(messageTab);
}

function onError(error) {
    console.debug("Error: $ {        error      }        ");
}

function replaceSelectedText(replacementText) {
    var sel,
    range;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(replacementText));
        }
    } else if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
        range.text = replacementText;
    }
}

function stringToArrayBuffer(str) {
    var buf = new ArrayBuffer(str.length * 2);
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function arrayBufferToString(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function encryptPlaintext(sessionKey, plaintext) {
    // The plaintext is in an enclosing scope, called plaintext
    console.debug("5.encryptPlaintext ");
    var iv = window.crypto.getRandomValues(new Uint8Array(16));
    return window.crypto.subtle.encrypt({
        name: 'AES-CBC',
        iv: iv
    }, sessionKey, plaintext).
    then(function (ciphertext) {
        return [iv, new Uint8Array(ciphertext)];
    });
}

function decryptMessage(key, ciphertext, counter) {
    let decrypted = window.crypto.subtle.decrypt({
            name: 'AES-CTR',
            counter,
            length: 64
        },
            key,
            ciphertext);

    console.debug(dec.decode(decrypted));
}

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab(str) {
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function _arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function _base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    const buffer = new ArrayBuffer(8);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

// from
// https://stackoverflow.com/questions/41586400/using-indexeddb-asynchronously


/**
 * Secure Hash Algorithm (SHA1) http://www.webtoolkit.info/
 */
function SHA1(msg) {
    console.debug("navigate - collection: SHA1 ");
    function rotate_left(n, s) {
        var t4 = (n << s) | (n >>> (32 - s));
        return t4;
    };
    function lsb_hex(val) {
        var str = '';
        var i;
        var vh;
        var vl;
        for (i = 0; i <= 6; i += 2) {
            vh = (val >>> (i * 4 + 4)) & 0x0f;
            vl = (val >>> (i * 4)) & 0x0f;
            str += vh.toString(16) + vl.toString(16);
        }
        return str;
    };
    function cvt_hex(val) {
        var str = '';
        var i;
        var v;
        for (i = 7; i >= 0; i--) {
            v = (val >>> (i * 4)) & 0x0f;
            str += v.toString(16);
        }
        return str;
    };
    function Utf8Encode(string) {
        string = string.replace(/\r\n/g, '\n');
        var utftext = '';
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    };
    var blockstart;
    var i,
    j;
    var W = new Array(80);
    var H0 = 0x67452301;
    var H1 = 0xEFCDAB89;
    var H2 = 0x98BADCFE;
    var H3 = 0x10325476;
    var H4 = 0xC3D2E1F0;
    var A,
    B,
    C,
    D,
    E;
    var temp;
    msg = Utf8Encode(msg);
    var msg_len = msg.length;
    var word_array = new Array();
    for (i = 0; i < msg_len - 3; i += 4) {
        j = msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 |
            msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3);
        word_array.push(j);
    }
    switch (msg_len % 4) {
    case 0:
        i = 0x080000000;
        break;
    case 1:
        i = msg.charCodeAt(msg_len - 1) << 24 | 0x0800000;
        break;
    case 2:
        i = msg.charCodeAt(msg_len - 2) << 24 | msg.charCodeAt(msg_len - 1) << 16 | 0x08000;
        break;
    case 3:
        i = msg.charCodeAt(msg_len - 3) << 24 | msg.charCodeAt(msg_len - 2) << 16 | msg.charCodeAt(msg_len - 1) << 8 | 0x80;
        break;
    }
    word_array.push(i);
    while ((word_array.length % 16) != 14)
        word_array.push(0);
    word_array.push(msg_len >>> 29);
    word_array.push((msg_len << 3) & 0x0ffffffff);
    for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
        for (i = 0; i < 16; i++)
            W[i] = word_array[blockstart + i];
        for (i = 16; i <= 79; i++)
            W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
        A = H0;
        B = H1;
        C = H2;
        D = H3;
        E = H4;
        for (i = 0; i <= 19; i++) {
            temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }
        for (i = 20; i <= 39; i++) {
            temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }
        for (i = 40; i <= 59; i++) {
            temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }
        for (i = 60; i <= 79; i++) {
            temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }
        H0 = (H0 + A) & 0x0ffffffff;
        H1 = (H1 + B) & 0x0ffffffff;
        H2 = (H2 + C) & 0x0ffffffff;
        H3 = (H3 + D) & 0x0ffffffff;
        H4 = (H4 + E) & 0x0ffffffff;
    }
    var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);

    return temp.toLowerCase();
}

function shorty_out() {}

// highlight Glovebox keywords in all pages


var markText = function (node, regex, callback, excludeElements) {

    excludeElements || (excludeElements = ['script', 'style', 'iframe', 'canvas']);
    var child = node.firstChild;

    do {
        switch (child.nodeType) {
        case 1:
            if (excludeElements.indexOf(child.tagName.toLowerCase()) > -1) {
                continue;
            }
            markText(child, regex, callback, excludeElements);
            break;
        case 3:
            child.data.replace(regex, function (all) {
                console.debug("split here ");
                var args = [].slice.call(arguments),
                offset = args[args.length - 2],
                newTextNode = child.splitText(offset);

                newTextNode.data = newTextNode.data.substr(all.length);
                callback.apply(window, [child].concat(args));
                child = newTextNode;
            });
            break;
        }
    } while (child = child.nextSibling);

    return node;
}

//helper function to get an element's exact position
function getPosition(el) {
    var xPosition = 0;
    var yPosition = 0;
    while (el) {
        if (el.tagName == "BODY") {
            // deal with browser quirks with body/window/document and page scroll
            var xScrollPos = el.scrollLeft || document.documentElement.scrollLeft;
            var yScrollPos = el.scrollTop || document.documentElement.scrollTop;

            xPosition += (el.offsetLeft - xScrollPos + el.clientLeft);
            yPosition += (el.offsetTop - yScrollPos + el.clientTop);
        } else {
            xPosition += (el.offsetLeft - el.scrollLeft + el.clientLeft);
            yPosition += (el.offsetTop - el.scrollTop + el.clientTop);
        }

        el = el.offsetParent;
    }
    return {
        x: xPosition,
        y: yPosition
    };
}

function getUuid(sessiontoken) {
    console.log(sessiontoken);

    const parsed = parseJwt(sessiontoken);
    const tokendata = getClaimsFromJwt(parsed, ["uuid"]);
    console.log(tokendata);
    if (tokendata != null) {
        return uuid = tokendata.uuid;
    } else {
        return null;

    }
}

function parseJwt(token) {
    console.log("2.parseJwt( " + token + " )");
    console.log("2.parseJwt( " + (typeof token) + " )");
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        console.log("2.parseJwt( " + base64 + " )");
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
        console.log(jsonPayload);
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Invalid token:', e);
        return null;
    }
}

function getClaimsFromJwt(decodedToken, claimNames) {
    console.log("getClaimsFromJwt( " + decodedToken + " )");
    console.log(claimNames);
    if (!decodedToken)
        return null;
    let claims = {};
    claimNames.forEach(claimName => {
        if (decodedToken.hasOwnProperty(claimName)) {
            claims[claimName] = decodedToken[claimName];
        }
    });
    return claims;
}
