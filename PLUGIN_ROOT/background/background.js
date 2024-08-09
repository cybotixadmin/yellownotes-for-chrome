
console.debug("start with YellowNotes for the Cloud");

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

const URI_plugin_user_update_subscribednote_status = "/api/v1.0/plugin_user_update_subscribednote_status";

const URI_plugin_user_get_own_url_yellownotes_with_selection_text = "/api/v1.0/plugin_user_get_own_url_yellownotes_with_selection_text";

const URI_plugin_user_get_my_distribution_lists = "/api/v1.0/plugin_user_get_my_distribution_lists";

const URI_plugin_user_get_an_authorized_note = "/api/v1.0/plugin_user_get_an_authorized_note";

const URI_plugin_user_delete_yellownote = "/api/v1.0/plugin_user_delete_yellownote";

const URI_plugin_user_get_a_subscribed_note = "/api/v1.0/plugin_user_get_a_subscribed_note";

const URI_plugin_user_get_creatorlevel_note_properties = "/api/v1.0/get_creatorlevel_note_properties";

let salt;

// at installation time a unique identifies is ser for this browser extension. Make this available to the server for identification purposes.
var installationUniqueId;
// the user's authentication token
var sessiontoken;

// the user's unique identifier
var uuid;

const plugin_uuid_header_name = "ynInstallationUniqueId";

// name of HTTP header contaning the session token
const plugin_session_header_name = "xyellownotessessionjwt";

// the session cookie will look something like
// {"userid":"lars.reinertsen@browsersolutions.no","name":"Lars Reinertsen","sessionid":"109be0df-6787-4ab1-cf28-7a329f6b1bed"}

var config = {};

/* keep a record of the setting of individual tabs on whether or not notes should be shown on them, and if so, which kinds
Key is tab id
 */
var in_memory_tab_settings = {};

// to make this code compatible with firefox, we need to check if the browser object is defined. If not, we define it as chrome.
if (typeof browser === "undefined") {
    var browser = chrome;
}

const extension = (typeof browser !== "undefined") ? browser : chrome;

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
    console.debug("matchesCachePattern (" + url + ") = " + CACHE_URL_REGEX_PATTERN.test(url));
    // Implement pattern matching logic here
    return CACHE_URL_REGEX_PATTERN.test(url);
}

// Function to cache data
function DELETEcacheData(key, data) {
    console.debug("cacheData (" + key + ")");
    const cacheEntry = {
        data: data,
        timestamp: Date.now()
    };
    chrome.storage.local.set({
        [key]: cacheEntry
    }, () => {
        console.debug(`Data cached for ${key}`);
    });
}

// Intercepting fetch requests for caching purposes
/*
self.addEventListener('fetch', event => {
console.debug("fetch (" + event.request.url + ")");
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
        console.debug('Value retrieved from storage: ', defaultSliderPosition);
    } else {
        // If the value does not exist, set the variable to the default value
        defaultSliderPosition = 3;
        chrome.storage.sync.set({
            defaultSliderPosition: defaultSliderPosition
        }).then(function (d) {
            console.debug('Value not found in storage. Default value set:', defaultSliderPosition);

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
    id: "create-attached-yellownote",
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
//chrome.contextMenus.create({
//    id: "pin-content-note",
//    parentId: "yellownotes",
//    title: "attach other web content to selection (in testing)",
//    contexts: ["selection"]
//});

// to create blank stickynote on any page, not tied to a text selection
chrome.contextMenus.create({
    id: "create-free-yellownote",
    parentId: "yellownotes",
    title: "attach yellow note on page",
    contexts: ["all"]
});
//chrome.contextMenus.create({
//    id: "create-free-webframenote",
//    parentId: "yellownotes",
//    title: "attach other web content on page (in testing)",
//    contexts: ["all"]
//});

//chrome.contextMenus.create({
//    id: "captureSelection",
//    parentId: "yellownotes",
//    title: "Select and Capture (in development)",
//    contexts: ["all"]
//});

//chrome.contextMenus.create({
//    id: "create-free-canvasnote",
//    parentId: "yellownotes",
//    title: "Select and Canvas (in development)",
//    contexts: ["all"]
//});

// listener for context menu clicks

chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.debug("chrome.contextMenus.onClicked.addListener:info:" + JSON.stringify(info));
    console.debug("chrome.contextMenus.onClicked.addListener:tab:" + JSON.stringify(tab));

    if (info.menuItemId === "create-attached-yellownote") {
        console.debug("# create-attached-yellownote");
        // use embeded as the content type. It captures more data some of which will not be used, but it more likely to be uniquely anchored.
        //create_yellownote(info, tab, 'anchor');
        pinYellowNote(info, tab, 'yellownote', 'default', true, 'plaintext');
   // } else if (info.menuItemId === "pin-content-note") {
   //     pinYellowNote(info, tab, 'yellownote', 'default', true, 'webframe');
    } else if (info.menuItemId === "captureSelection") {
        chrome.tabs.sendMessage(tab.id, {
            action: "initiateSelection",
            sharedsecret: "secret1234"
        });
    } else if (info.menuItemId === "lookup-yellow-stickynotes") {
        lookup_yellownotes(info, tab);
    } else if (info.menuItemId === "create-free-yellownote") {
        console.debug("# create-free-yellownote");
        //create_free_yellownote(info, tab);
        pinYellowNote(info, tab, 'yellownote', 'default', false, 'plaintext');
    } else if (info.menuItemId === "create-free-webframenote") {
        console.debug("# create-free-webframenote");
        //create_free_webframe_note(info, tab);
        pinYellowNote(info, tab, 'yellownote', 'default', false, 'webframe');
    } else if (info.menuItemId === "create-free-canvasnote") {
        console.debug("# create-free-canvasnote");
        //create_free_webframe_note(info, tab);
        pinYellowNote(info, tab, 'yellownote', 'default', false, 'canvas');
    }
});

/**
 * the receiving end of the selctive screen capture functionality
 *
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "capture" && request.coords) {
        chrome.tabs.captureVisibleTab(null, {
            format: 'png'
        }, function (dataUrl) {
            console.debug('Data URL of screenshot:', dataUrl);
            chrome.storage.local.set({
                screenshot: dataUrl
            }, () => {
                console.debug('Screenshot saved.');
            });
            sendResponse({
                status: 'success',
                dataUrl: dataUrl
            });
        });
        return true; // Indicates asynchronous response
    }
});


/**
 * 
 * @param {*} info 
 * @param {*} tab 
 * @param {*} note_type 
 * @param {*} brand 
 * @param {*} is_selection_text_connected 
 * @param {*} type 
 */
function pinYellowNote(info, tab, note_type, brand, is_selection_text_connected, type) {
    console.debug("pinYellowNote.start (info, note_type: " + type + ") and brand: " + brand);
    try {
        // contenttype
        // permitted values: text, html, embeded, http_get_url

        // call back out to the content script to get the selected html - and other parts of the page -and create the not object

        // Should the user later click "save" The event handler for the save-event in the content script will then call back to the background script to save the note to the database.


        console.debug(info);
        console.debug(tab);
        var pageUrl = info.pageUrl;
        // this is the selection the user flagged.
        var selectionText = info.selectionText;
        console.debug("selectionText: " + selectionText);
        console.debug(selectionText);

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
        var notetype_template;
        var note_properties;
        var sessionToken;
        chrome.storage.local.get([plugin_session_header_name]).then(function (result) {
            console.debug(JSON.stringify(result));
            sessionToken = result[plugin_session_header_name];
            console.debug(sessionToken);
            uuid = getUuid(sessionToken);
            console.debug("uuid: " + uuid);
            // get the template for the whole yellownote, usually the default one
            return getTemplate(brand, "yellownote");
        }).then(function (result) {
            //console.debug(result);
            note_template = result;
            console.debug("note_template read");
            // get the part of the template that pertain to the type of note
            return getNotetypeTemplate(type);
        }).then(function (result) {
            //console.debug(result);
            notetype_template = result;
            console.debug("notetype_template read");

            // get personal template related informaton
            console.debug("uuid" + uuid);
            console.debug("calling cachableCall2API_POST");
            return cachableCall2API_POST( uuid + "_creator_data", 10, "POST", server_url + URI_plugin_user_get_creatorlevel_note_properties, { creatorid: uuid } );


        }).then(function (result) {
            console.debug(result);

            note_properties = result;
            console.debug("note_properties");
            console.debug(note_properties);
            // if nothing was returned, use default

            if (note_properties == null) {
                // use default for note properties
                note_properties = {
                    "box_height": "250px",
                    "box_width": "350px",
                    "note_color": "#ffff00"
                };
            }
            return chrome.tabs.query({
                active: true,
                currentWindow: true
            });

        }).then(function (tabs) {
            console.debug(tabs);
            console.debug(tabs[0]);
            console.debug(tabs[0].id);
            tab_id = tabs[0].id;
            console.debug("tabs[0].id: " + tab_id);
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
            //       console.debug(response);
            //       if (!response.ok) {
            //           console.debug('API_URL_2 Fetch Error: ' + response.statusText);
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
                action: "createnote",
                sharedsecret: PinToSelectedHTML_sharedsecret,
                note_type: type,
                brand: brand,
                note_template: note_template,
                notetype_template: notetype_template,
                note_properties: note_properties,
                session: sessionToken,
                is_selection_text_connected: is_selection_text_connected,
                info: info,
                tab: tab
            };
            console.debug("sending message back to tab: ");
            console.debug(msg);
            return chrome.tabs.sendMessage(tab_id, msg);
        }).then(function (res) {
            console.debug("###### pinYellowNote response " + JSON.stringify(res));

        });

    } catch (e) {
        console.debug(e);
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
    //console.debug("received from page: " + JSON.stringify(message));

    var tab_id = "";
    try {
        tab_id = sender.tab.id;

    } catch (e) {
        console.debug(e);
    }
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
            // keep this code around until all messgae formats have been migrated to the new format
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
                console.debug("action: toggleSlider")
                // get new value
                console.debug(message);
                console.debug(message.isSlidersEnabled);

                // enable sliders
                //if (message.isSlidersEnabled){
                console.debug("enable slid");
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
                console.debug(e);
            }
        } else if (action === "DELETEinjectIframeScript") {
            console.debug("action: injectIframeScript")
            chrome.scripting.executeScript({
                target: {
                    tabId: sender.tab.id,
                    frameIds: [sender.frameId]
                },
                files: ['./content_scripts/contentScriptForIframe.js']
            });

        } else if (action === "setSliderDefaultPosition") {
            // set slider default position
            // for new pages, or pages where no setting has been made, this is the default
            try {
                console.debug("action: setSliderDefaultPosition")
                // get new value
                console.debug(message);
                console.debug(message.setting);

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
                            console.debug("sending message to tab: " + tab.id);
                            chrome.tabs.sendMessage(tab.id, {
                                "action": "updateSliderPosition",
                                "defaultSliderPosition": message.setting,
                                "sharedsecret": sliderupdate_sharedsecret
                            });
                        } catch (e) {
                            console.debug(e);
                        }
                    }
                });

            } catch (e) {
                console.debug(e);
            }
        } else if (action === "activeateSubscriptionOnAllTabs") {
            console.debug("activeateSubscriptionOnAllTabs: subscription_details: " + JSON.stringify(message.subscription_details));

            // send message to all tabs to activate the subscription (look for any notes pertaning to the URL in question) on those tabs, if the slider position is set to 3


        } else if (action === "suspendSubscriptionOnAllTabs") {
            console.debug("suspendSubscriptionOnAllTabs: subscription_details: " + JSON.stringify(message.subscription_details));

            // send message to all tabs to suspend the subscription (remove any notes pertaning to the URL in question) from those tabs, if the slider position is set to 3


        } else if (action === "getSliderDefaultPosition") {
            console.debug("getSliderDefaultPosition: " + defaultSliderPosition)
            // Relay the state to all open tabs

            sendResponse({
                defaultSliderPosition: defaultSliderPosition
            });
            //return true;

        } else if (action === "whoami") {
            // return minimal current user information sufficient to check it a note is owned by the current user or not
            console.debug("whoami: ")
            // Relay the state to all open tabs

            sendResponse({
                creatorid: "dummy_value"
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

        } else if (action === "capturePage") {

            console.debug("browsersolutions calling: capturePage");

            console.debug(message);
            const url = message.url;
            const timeout = message.timeout;

            capturePageAsPng(url, timeout)
            .then(dataUrl => sendResponse({
                    dataUrl
                }))
            .catch(error => sendResponse({
                    error
                }));
            return true; // Keep the message channel open for async response


        } else if (action === "simple_url_lookup") {
            console.debug("simple_url_lookup " + JSON.stringify(message));
            // upen a tab and get a URL, then close the tab


            const url = message.message.url;
            console.debug(url);
            if (url == "") {
                sendResponse(null);
            } else {
                // the tab opening above is required to be able to invoke the "cookie jar"
                // Call to the cookie jar to collect any cookies pertaining to this URL.
                // this is essetial for authentication purposes. The cookies are needed to authenticate the user with the server.
                // session cookie are generallt set to SameSite = lax,
                // which means that they are not sent to the server when the url is being opened from inside an iframe
                logCookiesForUrl(url).then(function (cookies) {
                    console.debug(cookies);

                    // make a fetch to get the page content, using the cookies retieved above

                    return fetchContentWithCookies(url, cookies);
                    //return capturePageForEmbedingInIframe(url, cookies);

                    // run with capturing embeddings - suitable for sandboxing
                    //return capturePageAndProcess(url, cookies);

                }).then(content => {
                    //console.debug('Fetched web page content:', content);
                    sendResponse(content);
                })
                .catch(error => {
                    console.error('Error fetching content:', error);
                });

            }
            return true;
        } else if (action === "dismiss_note") {
            console.debug("dismiss_note " + JSON.stringify(message));
            // close a note and do not automatically reopen it (when the page is reloaded)
            // it can still be accessed from the notes panel
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

                    const close_details = {
                        noteid: message.message.noteid,
                        note_status: "dismissed"
                    };
                    console.debug(close_details);
                    // Set a timeout of 5 seconds (in milliseconds)
                    const timeout = setTimeout(() => {
                            controller.abort();
                        }, 5000);

                    const opts = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            [plugin_uuid_header_name]: ynInstallationUniqueId,
                            [plugin_session_header_name]: xYellownotesSession
                        },
                        body: JSON.stringify(close_details),
                        signal: signal

                    };
                    console.debug(opts);

                    return fetch(server_url + URI_plugin_user_update_subscribednote_status, opts);
                }).then(function (response) {
                    //                console.debug(response);
                    return response.json();
                }).then(function (data) {
                    // return the uuid assigned to this note
                    sendResponse(data);

                });
            } catch (e) {
                console.debug(e);
                sendResponse(null);

            }
            return true;

        } else if (action === "attach_to_current_tab") {
            /**some website replace the default browser context meny with one of their own creation (Spotify is an example)
             * This interferes with how Yellownotes operates. The context menu is replaced with a custom one, and the Yellownotes options are not available.
             * To address this limitation, there option to create a note from the context menu is also available from the browser action icon.
             *
             */
            console.debug("attach_to_current_tab");
            console.debug(message);
            console.debug(message.url);
            const url = message.url;
            const note_type = message.note_type;
            const psuedo_info = {
                pageUrl: url,
                selectionText: ""
            };

            const tab = {
                id: message.tab_id
            };

            pinYellowNote(psuedo_info, tab, 'yellownote', 'default', false, 'plainhtml');
            //pinYellowNote(psuedo_info, tab, 'yellownote', 'default');

            // close the connection to the calling popup immediately
            return false;

        } else if (action === "undismiss_note") {
            console.debug("undismiss_note " + JSON.stringify(message));
            // close a note and do not automatically reopen it (when the page is reloaded)
            // it can still be accessed from the notes panel
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

                    const close_details = {
                        noteid: message.message.noteid,
                        note_status: "unread"
                    };
                    console.debug(close_details);
                    // Set a timeout of 5 seconds (in milliseconds)
                    const timeout = setTimeout(() => {
                            controller.abort();
                        }, 5000);

                    const opts = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            [plugin_uuid_header_name]: ynInstallationUniqueId,
                            [plugin_session_header_name]: xYellownotesSession
                        },
                        body: JSON.stringify(close_details),
                        signal: signal

                    };
                    console.debug(opts);

                    return fetch(server_url + URI_plugin_user_update_subscribednote_status, opts);
                }).then(function (response) {
                    //                console.debug(response);
                    return response.json();
                }).then(function (data) {
                    // return the uuid assigned to this note
                    sendResponse(data);

                });
            } catch (e) {
                console.debug(e);
                sendResponse(null);

            }
            return true;
        } else if (action === "getDistributionLists") {
            console.debug("getDistributionLists")
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
                    //                console.debug(response);
                    return response.json();
                }).then(function (data) {
                    // return the uuid assigned to this note
                    sendResponse(data);

                });
            } catch (e) {
                console.debug(e);
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

        } else if (action == 'get_note_creator_info') {
            console.debug("request: get_note_creator_info");
            console.debug(message.message.coords);
            // determined the identity of the user, then lookup the template toue and the note properties, and return it all to the onctent script


            var result_msg = {
                note_properties: "",
                note_template: "",
                coords: {},
                dataUrl: "",
                sessiontoken: ""
            };
            var session_uuid = "";
            var sessiontoken = "";

            chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]).then(function (result) {
                ynInstallationUniqueId = result[plugin_uuid_header_name];
                xYellownotesSession = result[plugin_session_header_name];
                installationUniqueId = result[plugin_uuid_header_name];
                sessiontoken = result[plugin_session_header_name];
                result_msg.sessiontoken = sessiontoken;
                console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);
                console.debug("xYellownotesSession: " + xYellownotesSession);
                console.debug("installationUniqueId: " + installationUniqueId);
                console.debug("sessiontoken: " + sessiontoken);
                session_uuid = getUuid(sessiontoken);
                console.debug("session_uuid: " + session_uuid);
                if (session_uuid == null) {
                    session_uuid = "UNAUTHENTICATED";
                } else {}
                console.debug("session_uuid: " + session_uuid);

                console.debug("calling cachableCall2API_POST");
                return cachableCall2API_POST( session_uuid + "_creator_data", 10, "POST", server_url + URI_plugin_user_get_creatorlevel_note_properties, { creatorid: session_uuid } );
                
            }).then(creatorData => {
                console.debug(creatorData);
                result_msg.note_properties = creatorData;
                const brand = "default";
                return getTemplate(brand, "yellownote");
            }).then(template => {

                console.debug(template);
                result_msg.note_template = template;
                console.debug(result_msg);
                sendResponse(result_msg);

            });

        } else if (action == 'create_capture_note') {
            console.debug("request: create_capture_note");

            console.debug(message.message.coords);
            // determined the identity of the user, then lookup the template toue and the note properties, and return it all to the onctent script


            var result_msg = {
                note_properties: "",
                note_template: "",
                coords: {},
                dataUrl: "",
                sessiontoken: ""
            };
            var session_uuid = "";
            var sessiontoken = "";
            var captureddata;

            result_msg.coords = message.message.coords;

            captureTab()
            .then(function (dataUrl) {
                console.debug("dataUrl: ");
                console.debug(dataUrl);
                result_msg.dataUrl = dataUrl;
                // captureddata = dataUrl;
                return chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]);
            }).then(function (result) {
                ynInstallationUniqueId = result[plugin_uuid_header_name];
                xYellownotesSession = result[plugin_session_header_name];
                installationUniqueId = result[plugin_uuid_header_name];
                sessiontoken = result[plugin_session_header_name];
                result_msg.sessiontoken = sessiontoken;
                console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);
                console.debug("xYellownotesSession: " + xYellownotesSession);
                console.debug("installationUniqueId: " + installationUniqueId);
                console.debug("sessiontoken: " + sessiontoken);
                session_uuid = getUuid(sessiontoken);
                console.debug("session_uuid: " + session_uuid);
                if (session_uuid == null) {
                    session_uuid = "UNAUTHENTICATED";
                } else {}
                console.debug("session_uuid: " + session_uuid);


                console.debug("calling cachableCall2API_POST");
                return cachableCall2API_POST( session_uuid + "_creator_data", 10, "POST", server_url + URI_plugin_user_get_creatorlevel_note_properties, { creatorid: session_uuid } );

            }).then(creatorData => {
                console.debug(creatorData);
                result_msg.note_properties = creatorData;
                const brand = "default";
                return getTemplate(brand, "yellownote");
            }).then(template => {

                console.debug(template);
                result_msg.note_template = template;
                console.debug(result_msg);
                sendResponse(result_msg);

            });

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
                //                console.debug(response);
                return response.json();
            }).then(function (data) {
                // return the uuid assigned to this note
                sendResponse(data);

            });
            return true;
        } else if (action == 'show_all_sliders') {
            console.debug("request: show_all_sliders");
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
            console.debug("request: close_all_sliders");

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
            console.debug("request: store_current_slider_value_for_tab");
            console.debug("request: store_current_slider_value_for_tab: " + JSON.stringify(message));
            console.debug(sender);
            console.debug(sender.tab.id);
            console.debug(in_memory_tab_settings);
            // in_memory_tab_settings["sender.tab.id"] = [ "true", sender.url,"6" ];

            //  console.debug(in_memory_tab_settings);
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
                console.debug(response);
                // send notification to all pages to update this note
                return chrome.tabs.sendMessage(sender.tab.id, {
                    sharedsecret: "qwertyui",
                    action: "update_single_note_on_page",
                    uuid: uuid

                });
            }).then(function (res) {
                //                  console.debug(data);
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
                console.debug(data);
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
            var template;
            const brand = message.brand;

            var note_type = message.note_type;
            // ignore notetype, there is only one template for now - yellownote
            note_type = "yellownote";
            // check of there is a cached copy of the template
            const cacheKey = "template_" + brand + "_" + note_type;
            const cachetimeout = 10;
            getCachedData(cacheKey, cachetimeout).then(function (data) {
                //console.debug("cache data: " + data);
                if (data != null) {
                    console.debug("cache hit");
                    sendResponse(data);
                } else {
                    console.debug("cache miss");
                    // get the template from further afield
                    getTemplate(brand, note_type).then(function (result) {
                       template = result;
                        //console.debug(template);

                        // ignore this function being async, it is not needed to wait for the cache to be updated
                        cacheData(cacheKey, template);
                        sendResponse(template);

                    });
                }
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
        } else if (action == 'get_notetype_template') {

            console.debug("action: get_notetype_template");
            const brand = message.brand;
            console.debug(message);
            console.debug("calling getNotetypeTemplate");
            getNotetypeTemplate(message.note_type).then(function (result) {
                // console.debug(result);
                sendResponse(result);
            });

            return true;
        } else if (action == 'get_my_distribution_lists') {
            console.debug("request: get_my_distribution_lists");
            // if update is to disable the note, remove it from the in-memory store
            const cacheKey = URI_plugin_user_get_my_distribution_lists.replace(/\//g, "_");
            //const cacheKey = "cacheKey0002";

            console.debug("Cache key: " + cacheKey);
            const currentTime = Date.now();

            console.debug("currentTime: " + currentTime);
            const cachetimeout = 60;
            const endpoint = server_url + URI_plugin_user_get_my_distribution_lists;
            const protocol = "GET";

            // Accept data from cache if it is less than 60 seconds old
            // Make changes to this timeout when there is a procedure to empty the cache if the value has been updated.
            cachableCall2API_GET(cacheKey, cachetimeout, protocol, endpoint).then(function (data) {
                console.debug(data);
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
            console.debug(JSON.stringify(message.disable_details));

            const noteid = message.disable_details.noteid;
            const enabled_status = message.disable_details.enabled_status;
            
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
                        enabled_status: enabled_status
                    })
                };
                console.debug(JSON.stringify(opts));
                return fetch(server_url + URI_plugin_user_setstatus_yellownote, opts);
            }).then(function (response) {
                console.debug("response: " + JSON.stringify(   response));
                console.debug("notify tab to disable note with noteid: " + noteid);
                // send notification to all pages that this note should be removed from the page
                return chrome.tabs.sendMessage(sender.tab.id, {
                    sharedsecret: "qwertyui",
                    action: "disable_single_note",
                    noteid: noteid

                });
            }).then(function (res) {
                console.debug("response: " + JSON.stringify(res));
                sendResponse('{"response":"ok"}');

            }).catch(function (error) {
                console.debug("error: " + error);
                sendResponse('{"response":"error"}');
            });
            return true;
        } else if (action == 'single_note_enable') {
            console.debug("request: enable a single yellow note");
            console.debug(JSON.stringify(message));
            console.debug(JSON.stringify(message.message.enable_details));

            //const uuid = message.message.enable_details.uuid;
            const noteid = message.disable_details.noteid;
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
                        enabled_status: 1
                    })
                };
                console.debug(JSON.stringify(opts));
                return fetch(server_url + URI_plugin_user_setstatus_yellownote, opts);
            }).then(function (response) {

                sendResponse('{"response":"ok"}');

            });

        } else if (action == 'focusTab') {
            console.debug("action: focusTab");
            // Use the tab ID to focus the tab
            chrome.tabs.update(sender.tab.id, {
                active: true
            });

        } else if (action == 'gothere') {
            console.debug("#############################################");
            console.debug("action: gothere");
            console.debug(message);
            console.debug("#############################################");
            // lookup the details of the note in the database


            // open the url the note belongs to

            // place the note on the page

            // move focus to the note
            var use_this_tab;
            //console.debug(message.go_to_note_details);
            var datarow;
            const noteid = message.go_to_note_details.noteid;
            var note_type;

            // brand has not yet been implemented
            const brand = message.go_to_note_details.datarow.brand;
            const session_uuid = message.go_to_note_details.session_uuid;
            var creatorDetails;
            const note_data = message.go_to_note_details.datarow;
            var note_template = null;
            var note_obj;
            var notetype_template = null;
            // Is this note owned by the current user?
            // Assume so, buth check against the sessiontoken further down and oweverwrite this value if required
            var isOwner = true;

            const creatorid = message.go_to_note_details.datarow.creatorid;
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
                console.debug("calling fetch");
                return fetch(server_url + URI_plugin_user_get_an_authorized_note, opts);
            }).then(function (response) {
                console.debug(response);
                console.debug("######## ####### 0 ######### ######## #######");

                return response.json();
            }).then(function (data) {
                console.debug(data);
                datarow = data[0];
                // the API returns notes that the user may not own, so we need to mark them all accordingly
                // datarow.
                console.debug(datarow);
                note_obj = JSON.parse(datarow.json);
                note_type = note_obj.note_type;
                console.debug("note_type: " + note_type);
                // datarow.isowner = false;
                // open the url the note belongs to
                console.debug("######## ####### 1 ######### ######## #######");
                console.debug("calling openURLinTab");
                return openURLinTab(sender.tab, note_obj.url);
            }).then(function (res) {
                use_this_tab = res;
                console.debug(use_this_tab);
                console.debug("######## ####### 2 ######### ######## #######");

                console.debug("calling cachableCall2API_POST");
                return cachableCall2API_POST( creatorid + "_creator_data", 1, "POST", server_url + URI_plugin_user_get_creatorlevel_note_properties, { creatorid: creatorid } );

            }).then(function (response) {
                console.debug(response);
                creatorDetails = response;
                console.debug("session_uuid: " + session_uuid);
                console.debug("note creatorid: " + creatorDetails.uuid);
                console.debug("creatorid: " + creatorid);
                if (creatorid != session_uuid) {
                    isOwner = false;
                }
                console.debug("######## ####### 3 ######### ######## #######");
                console.debug("calling getTemplate");
                return getTemplate(brand, "yellownote");
            }).then(function (response) {
                note_template = response;
                console.debug("calling getNotetypeTemplate");
                return getNotetypeTemplate(note_type);
            }).then(function (result) {
                //console.debug(result);
                notetype_template = result;
                console.debug("notetype_template");

                //get current user id from the session token
                //const session_uuid = getUuid(xYellownotesSession);

                const note_data = JSON.parse(datarow.json)
                    // place the note on the page
                    //  return placeNoteOnTab(sender.tab, datarow.url, datarow.noteid, datarow, false, session_uuid);
                    // function placeNoteOnTab(tab, url, noteid, datarow, openNewTab, session_uuid)
                    //  return placeNoteOnTab(use_this_tab, datarow.url, datarow.noteid, datarow, false, session_uuid);
                    // calling this function in the note_handler script
                    //  placeStickyNote(request.note_data, request.note_template, request.creatorDetails, request.isOwner, false, true);
                    const msg = {
                    action: "placeYellowNoteOnPage",
                    sharedsecret: "secret1234",
                    datarow: datarow,
                    noteid: noteid,
                    session_uuid: session_uuid,
                    note_data: note_data,
                    note_template: note_template,
                    notetype_template: notetype_template,
                    creatorDetails: creatorDetails,
                    isOwner: isOwner
                }
                console.debug(msg);
                console.debug("######## ####### 4 ######### ######## #######");
                console.debug("calling chrome.tabs.sendMessage");
                return chrome.tabs.sendMessage(use_this_tab, msg);
            }).then(function (response) {
                console.debug(response);
                console.debug("######## ####### 5 ######### ######## #######");

                const msg = {
                    action: "moveFocusToNote",
                    sharedsecret: "secret1234",
                    noteid: noteid

                }
                //chrome.tabs.sendMessage(tabs[i].id, msg);
                console.debug(msg);
                console.debug("calling chrome.tabs.sendMessage");
                return chrome.tabs.sendMessage(tab_id, msg);

            }).then(function (response) {
                console.debug(response);
                console.debug("######## ####### 6 ######### ######## #######");
                sendResponse(response);
            }).catch(function (error) {
                console.debug(error);
                sendResponse(null);
            });
            return true;
        } else if (action == 'scroll_to_note') {
            /*
             * scroll to a note on a page -
             */
            console.debug("request: scroll_to_note");
            console.debug(message);
            console.debug(JSON.stringify(message));

            const datarow = message.message.scroll_to_note_details.datarow;
            console.debug(datarow);

            try {
                openUrlAndScrollToElement(sender.tab, datarows.url, datarow.noteid, datarow, false, null).then(function (res) {
                    console.debug("response: " + JSON.stringify(res));
                    sendResponse(res);
                });
            } catch (e) {
                console.debug(e);
                // try again, but with opening a fresh tab this time
                openUrlAndScrollToElement(sender.tab, datarow.url, datarow.noteid, datarow, true, null).then(function (res) {
                    console.debug("response: " + JSON.stringify(res));
                    sendResponse(res);
                });

            }
            //return true;
            //return true;

        } else if (action == 'get_authorized_note') {
            console.debug("get authorized note");
            console.debug(message);
            var session_uuid;
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
                session_uuid = getUuid(sessiontoken);
                console.debug("session_uuid: " + session_uuid);
                if (session_uuid == null) {
                    session_uuid = "UNAUTHENTICATED";
                } else {}
                console.debug("session_uuid: " + session_uuid);
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
                console.debug(opts);
                return fetch(server_url + URI_plugin_user_get_an_authorized_note, opts);
            }).then(function (response) {
                console.debug(response);
                if (!response.ok) {
                    console.debug("error: ", response.statusText);
                    throw new Error('Initial Fetch Error: ' + response.statusText);
                    //return null;
                    sendResponse(null);
                } else {
                    // examine each note and for each note creator lookup the note formating infomation for the creator of the note
                    // this is needed to display the note in the correct format


                    return response.json();
                }
            }).then(initialData => {
                // check if the returned data is defined

                if (initialData == undefined) {
                    console.debug("error: initialData is undefined");
                    sendResponse(null);
                } else {
                    console.debug(initialData);
                }
                console.debug(initialData);
                const promises = initialData.map(item => {
                        if (item.creatorid) {
                            console.debug("calling cachableCall2API_POST");
                            return cachableCall2API_POST( item.creatorid + "_creator_data", 10, "POST", server_url + URI_plugin_user_get_creatorlevel_note_properties, { creatorid: item.creatorid } ).then(creatorData => {
                                item.creatorDetails = creatorData;
                                item.creatorDetails2 = "creatorData2";
                            });
                        }
                        return Promise.resolve();
                    });
                console.debug(promises);
                return Promise.all(promises).then(() => initialData);
            })
            .then(function (data) {
                console.debug(data);
                console.debug("session_uuid: " + session_uuid);
                const msg = {
                    session_uuid: session_uuid,
                    data: data
                }
                console.debug(msg);
                sendResponse(msg);
            }).catch(function (error) {
                console.debug(error);
                sendResponse(null);
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
                console.debug(opts);
                return fetch(server_url + URI_plugin_user_get_subscribed_url_yellownotes, opts);
            }).then(function (response) {
                console.debug(response);
                if (!response.ok) {
                    throw new Error('Initial Fetch Error: ' + response.statusText);
                }
                // examine each note and for each note creator lookup the note formating infomation for the creator of the note
                // this is needed to display the note in the correct format

                return response.json();
            }).then(initialData => {
                console.debug(initialData);
                const promises = initialData.map(item => {
                        if (item.creatorid) {
                            console.debug("calling cachableCall2API_POST");
                            return cachableCall2API_POST( item.creatorid + "_creator_data", 10, "POST", server_url + URI_plugin_user_get_creatorlevel_note_properties, { creatorid: item.creatorid } ).then(creatorData => {
                                item.creatorDetails = creatorData;
                            });
                        }
                        return Promise.resolve();
                    });
                console.debug(promises);
                return Promise.all(promises).then(() => initialData);
            })
            .then(function (data) {
                console.debug(data);
                console.debug(JSON.stringify(data));

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
                console.debug(opts);
                return fetch(server_url + URI_plugin_user_get_all_url_yellownotes, opts);
            }).then(function (response) {
                //                console.debug(response);
                return response.json();
            }).then(function (data) {
                console.debug(data);
                sendResponse(data);

            });
            return true;
        } else if (action == 'get_own_applicable_stickynotes') {
            console.debug("get_own_applicable_stickynotes");
            //            console.debug("get all notes for " + message.message);
            console.debug("get all notes for " + message.message.url);
            const url = message.message.url;
            const note_type = message.message.note_type;

            var APIendpoint = server_url + URI_plugin_user_get_own_url_yellownotes;
            if (note_type == "selection_text") {
                APIendpoint = server_url + URI_plugin_user_get_own_url_yellownotes_with_selection_text;

            }

            // call out to database
            //  chrome.storage.local.set({xYellownotesSession: xSessionHeader.value}, () => {
            //console.debug('Yellownotes Value saved in local storage:', xSessionHeader.value);
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
                console.debug(opts);
                return fetch(APIendpoint, opts);
            }).then(function (response) {
                console.debug(response);
                if (!response.ok) {
                    throw new Error('Initial Fetch Error: ' + response.statusText);
                }
                // examine each note and for each note creator lookup the note formating infomation for the creator of the note
                // this is needed to display the note in the correct format
                return response.json();
            }).then(function (initialData) {
                notes = initialData;
                if (notes.length == undefined || notes.length == 0) {
                    console.debug(notes);
                    sendResponse(null);
                    return; // Properly exit the flow
                } else {
                    console.debug(notes.length);
                    console.debug(notes);
                    console.debug("calling cachableCall2API_POST");
                    return cachableCall2API_POST(notes[0].creatorid + "_creator_data", 10, "POST", server_url + URI_plugin_user_get_creatorlevel_note_properties, { creatorid: notes[0].creatorid });
                }
            }).then(function (creatordata) {
                if (!creatordata) return; // Exit if creatordata is undefined due to previous exit
                console.debug(creatordata);
                console.debug(JSON.stringify(creatordata));
                var resp = {};
                console.debug(notes);
                console.debug(Array.isArray(notes));
                resp.notes_found = notes;
                resp.creatorDetails = creatordata;
                console.debug(resp);
                console.debug(JSON.stringify(resp));
                sendResponse(resp);
            }).catch(function (error) {
                console.error(error);
                sendResponse(null); // Handle any errors in the promise chain
            });
        }
    } catch (e) {
        console.debug(e);
    }
    return true;
});

function cachableCall2API_GET(cacheKey, cachetimeout, protocol, endpoint) {
    console.debug("# cachableCall2API_GET.start");
    console.debug("cacheKey: " + cacheKey);
    console.debug("cachetimeout: " + cachetimeout);
    console.debug("protocol: " + protocol);
    console.debug("endpoint: " + endpoint);
    var ynInstallationUniqueId = "";
    var xYellownotesSession = "";
    var result_data = null;
    return new Promise((resolve, reject) => {
        getCachedData(cacheKey, cachetimeout).then(function (cachedResponse) {

            console.debug(cachedResponse);
            if (cachedResponse) {
                console.debug("Returning cached response on key: " + cacheKey);
                // break here
                resolve(cachedResponse);
                console.debug(" complete ");
                // break out of the promise chain
                return;
            } else {
                console.debug("No cached response on key: " + cacheKey);
            

            // proceed to make the request
            chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name])
            .then(function (result) {
                console.debug(result);
                ynInstallationUniqueId = result[plugin_uuid_header_name];
                xYellownotesSession = result[plugin_session_header_name];

               console.debug("Cache key: " + cacheKey);

                console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);
                console.debug("xYellownotesSession: " + xYellownotesSession);

                const opts = {
                method: protocol,
                headers: {
                    'Content-Type': 'application/json',
                    [plugin_uuid_header_name]: ynInstallationUniqueId,
                    [plugin_session_header_name]: xYellownotesSession
                },
                };
                console.debug("make fresh request: ");
                return fetch(endpoint, opts);
                })
                .then(function (response) {
            console.debug(response);

            return response.json();
                })
                .then(function (data) {
            console.debug(data);

            result_data = data;

            // insert into the cache
                return cacheData(cacheKey, result_data);
            // return chrome.storage.local.set({ cacheKey: requestCacheEntry });
                }).then(function (response) {
                console.debug(response);
                console.debug("result_data");
                console.debug(result_data);
                resolve(result_data);
                })
                .catch(function (error) {
                 console.error('Fetch error: ', error);
                });
            }
        });
    });

}

// Function to capture a page as a PNG image, convert it to Base64, and return the data URL
function capturePageAsPng(url, timeout) {
    console.debug('capturePageAsPng: Capturing page as PNG image:', url);
    return new Promise((resolve, reject) => {
        // Open a new tab with the specified URL
        chrome.tabs.create({
            url,
            active: false
        }, (tab) => {
            const tabId = tab.id;
            console.debug("tabId: " + tabId);

            // Wait for the specified timeout
            setTimeout(() => {
                // Capture the tab as a PNG image
                chrome.tabs.captureVisibleTab(tab.windowId, {
                    format: 'png'
                }, (dataUrl) => {
                    console.debug('capturePageAsPng: Captured page as PNG image:', dataUrl);
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError.message);
                        // Close the tab

                        chrome.tabs.remove(tabId);
                        return;
                    }
                    console.debug("resolve dataUrl");
                    // Resolve with the Base64 data URL
                    resolve(dataUrl);

                    // Close the tab
                    chrome.tabs.remove(tabId);
                });
            }, timeout);
        });
    });
}

function captureTab() {
    return new Promise((resolve, reject) => {
        chrome.tabs.captureVisibleTab(null, {
            format: 'png'
        }, dataUrl => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(dataUrl);
            }
        });
    });
}

function saveScreenshot(dataUrl) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({
            screenshot: dataUrl
        }, () => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                console.debug('Screenshot saved.');
                resolve(dataUrl);
            }
        });
    });
}

// Helper to cache data with a timestamp
function cacheData(key, data) {
    console.debug('cacheData: Caching data for key:', key);
    return new Promise((resolve, reject) => {
        const cachedData = {
            data: data,
            timestamp: new Date().getTime()
        };
        chrome.storage.local.set({
            [key]: cachedData
        }, function () {
            console.debug(`Data cached for key: ${key}`);
            resolve();
        });
    });
}

// Helper to get cached data , timeout in seconds
function getCachedData(key, cachetimeout) {
    console.debug('getCachedData: Getting cached data for key:', key, ", with timeout:", cachetimeout);
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get([key], function (result) {
                console.debug('getCachedData: Cached data:');
                console.debug(result);
                if (result[key]) {
                    console.debug(`cached data for key: ${key}`, result[key].timestamp);
                    console.debug("cached entry age (seconds): ", ((new Date().getTime() - result[key].timestamp)) / 1000);
                    console.debug(`cached entry age limit: < ${cachetimeout} seconds`);
                    console.debug("cached entry valid? " , ((new Date().getTime() - result[key].timestamp)) < cachetimeout * 1000);

                    // only accept data less than 3 hours old
                    //            if (result[key] && (new Date().getTime() - result[key].timestamp) < 3 * 3600 * 1000) {
                    // only accept data less than 10 seconds old
                    if (result[key] && (new Date().getTime() - result[key].timestamp) < cachetimeout * 1000) {
                       // console.debug(result[key].data);
                        resolve(result[key].data);
                    } else {
                        console.debug("return null");
                        resolve(null);
                    }
                } else {
                    console.debug("return null - cache miss");
                    resolve(null);
                }
            });
        } catch (e) {
            console.debug(e);
            reject(null);
        }
    });
}


/*
protocol: PUT, PATCH or POST
 */
function cachableCall2API_POST(cacheKey, cachetimeout, protocol, endpoint, msg_body) {
    console.debug("# cachableCall2API_POST.start");
    console.debug("cacheKey: " + cacheKey);
    console.debug("cachetimeout: " + cachetimeout);
    console.debug("protocol: " + protocol);
    console.debug("endpoint: " + endpoint);

    var ynInstallationUniqueId = "";
    var xYellownotesSession = "";
    var result_data = null;
    return new Promise((resolve, reject) => {
        getCachedData(cacheKey, cachetimeout).then(function (cachedResponse) {

            console.debug(cachedResponse);
            if (cachedResponse) {
                console.debug("Returning cached response on key: " + cacheKey);
                // break here
                resolve(cachedResponse);
                console.debug(" complete ");
                // break out of the promise chain
                return;
            } else {
                console.debug("No cached response on key: " + cacheKey);

                // proceed to make the request
                chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name])
                .then(function (result) {
                    console.debug(result);
                    ynInstallationUniqueId = result[plugin_uuid_header_name];
                    xYellownotesSession = result[plugin_session_header_name];

                    console.debug("Cache key: " + cacheKey);

                    console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);
                    console.debug("xYellownotesSession: " + xYellownotesSession);

                    const opts = {
                        method: protocol,
                        headers: {
                            'Content-Type': 'application/json',
                            [plugin_uuid_header_name]: ynInstallationUniqueId,
                            [plugin_session_header_name]: xYellownotesSession
                        },
                        body: JSON.stringify(msg_body)
                    };
                    console.debug("make fresh request: ");
                    return fetch(endpoint, opts);
                })
                .then(function (response) {
                    console.debug(response);
                    return response.json();
                })
                .then(function (data) {
                    console.debug(data);

                    result_data = data;

                    // insert into the cache
                    return cacheData(cacheKey, result_data);
                    // return chrome.storage.local.set({ cacheKey: requestCacheEntry });
                }).then(function (response) {
                    console.debug(response);
                    console.debug("result_data");
                    console.debug(result_data);
                    resolve(result_data);
                })
                .catch(function (error) {
                    console.error('Fetch error: ', error);
                });
            }
        });
    });

}



function fetchNewData(creatorId, cacheKey) {
    console.debug('fetchNewData: Fetching new data for creatorId:', creatorId);
    return chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name])
    .then(result => {
        const installationUniqueId = result[plugin_uuid_header_name];
        const sessionToken = result[plugin_session_header_name];

        const controller = new AbortController();
        setTimeout(() => controller.abort(), 8000);

        console.debug('fetchCreatorDataThroughAPI: Fetching new data from API');
        return fetch(server_url + '/api/v1.0/get_creatorlevel_note_properties', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [plugin_uuid_header_name]: installationUniqueId,
                [plugin_session_header_name]: sessionToken
            },
            signal: controller.signal,
            body: JSON.stringify({
                creatorid: creatorId
            })
        });
    })
    .then(response => {

        if (!response.ok) {
            console.debug(response);

            // if an invalid session token was sent, it should be removed from the local storage
            if (response.status == 401) {
                // compare the response body with the string "Invalid session token" to determine if the session token is invalid
                if (response.headers.get("session") == "DELETE_COOKIE") {
                    console.debug("Session token is invalid, remove it from local storage.");
                    chrome.storage.local.remove([plugin_session_header_name]);
                    // redirect to the front page returning the user to unauthenticated status.
                    // unauthenticated functionality will be in effect until the user authenticates
                    //window.location.href = "/pages/my_account.html";
                    throw new Error('logout');
                } else {
                    throw new Error('Network response was not ok');
                }
            } else {
                throw new Error('Network response was not ok');
            }
        } else {
            return response.json();
        }

    })
    .then(data => {
        console.debug('Caching data for', creatorId);
        return cacheData(cacheKey, data)
        .then(() => data);
    })
    .catch(error => {
        console.error("Error in fetchNewData:", error);
        throw error; // Propagate the error to maintain the integrity of the promise chain
    });
}

function focusOnNote(tab_id, noteid) {
    console.debug("focusOnNote: ");
    console.debug(tab_id);
    console.debug(noteid);
    return new Promise((resolve, reject) => {
        const msg = {
            action: "moveFocusToNote",
            sharedsecret: "secret1234",

            noteid: noteid

        }
        //chrome.tabs.sendMessage(tabs[i].id, msg);
        resolve(chrome.tabs.sendMessage(tab_id, msg));
    });

}

//  return placeNoteOnTab(sender.tab, datarow.url, datarow.noteid, datarow, false, session_uuid);
function placeNoteOnTab(tab, url, noteid, datarow, openNewTab, session_uuid) {
    console.debug("placeNoteOnTab: ");
    console.debug(datarow);
    console.debug(tab);
    console.debug(openNewTab);
    console.debug(session_uuid);

    const tab_id = tab.id;

    const msg = {
        action: "placeYellowNoteOnPage",
        sharedsecret: "secret1234",
        datarow: datarow,
        noteid: noteid,
        session_uuid: session_uuid
    }

    console.debug("Sending message to tab: " );
    console.debug(msg);

    return new Promise((resolve, reject) => {
        // Send the message and handle the promise
        chrome.tabs.query({}, function (tabs) {
            for (let i = 0; i < tabs.length; i++) {
                console.debug("Sending message to tab: " + tabs[i].id);
                chrome.tabs.sendMessage(tabs[i].id, msg);
            }
        });
        resolve(chrome.tabs.sendMessage(tab_id, msg));
    });
}

function openURLinTab(tab, url) {
    console.debug('openURLinTab: Opening url ' + url + ' in tab ' + tab + ' and scrolling to element with noteid ');
    console.debug(tab);
    const tab_id = tab.id;
    return new Promise((resolve, reject) => {
        try {
            chrome.tabs.update(tab_id, {
                url: url
            }, function (tab) {
                console.debug('Updated tab:', tab_id);
                // Ensure the tab is completely loaded before sending the message
                chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
                    if (tabId === tab_id && changeInfo.status === 'complete') {
                        chrome.tabs.onUpdated.removeListener(listener); // Remove listener once the tab is loaded
                        resolve(tab_id);

                    } else {
                        console.debug("tabId: " + tabId + " tab_id: " + tab_id + " changeInfo.status: " + changeInfo.status);
                        resolve(tab_id);
                    }
                });
            });
        } catch (e) {
            console.debug(e);
            reject(e);
        }
    });

}

function openUrlAndScrollToElement(tab, url, noteid, datarow, openNewTab, session_uuid) {
    console.debug('openUrlAndScrollToElement: Opening url ' + url + ' in tab ' + tab + ' and scrolling to element with noteid ' + noteid + " openNewTab: " + openNewTab + " session_uuid: " + session_uuid);
    console.debug(datarow);
    console.debug(tab);
    const tab_id = tab.id;
    const creatorid = datarow.creatorid;
    var notes = [datarow];
    // lookup creator information needed to render the note
    return new Promise((resolve, reject) => {
        cachableCall2API_POST( creatorid + "_creator_data", 10, "POST", server_url + URI_plugin_user_get_creatorlevel_note_properties, { creatorid: creatorid } )
        .then((creatordata) => {
            console.debug(creatordata);
            console.debug(JSON.stringify(creatordata));
            var resp = {
                notes_found: notes,
                creatorDetails: creatordata,
                session_uuid: session_uuid
            };
            console.debug(resp);

            // Search for already open tabs with the specified URL
            chrome.tabs.query({
                url: url
            }, function (tabs) {
                console.debug(tabs.length);
                console.debug(tabs);
                var rc;
                console.debug("currenturl: " + tab.url);
                if (tabs.length == 0 || openNewTab) {
                    // If no tabs with the URL are found, or openNewTab=true, create a new tab
                    console.debug("Nload in the the same tab");
                    // modify to open in the same place the at the gothere.html

                    //chrome.tabs.create({
                    //    url: url
                    //}, function (tab) {

                    chrome.tabs.update(tab_id, {
                        url: url
                    }, function (tab) {
                        console.debug('Updated tab:', tab.id);
                        // Ensure the tab is completely loaded before sending the message
                        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
                            if (tabId === tab.id && changeInfo.status === 'complete') {
                                chrome.tabs.onUpdated.removeListener(listener); // Remove listener once the tab is loaded
                                sendMessageToContentScript(tabId, resp, noteid, session_uuid)
                                .then(result => {
                                    console.debug('Result:', result); // This will log '0' for success or '1' for error
                                    resolve(`Message sent to new tab ${tab.id}`);
                                })
                                .catch(error => {
                                    console.error('Unexpected error:', error);
                                });
                            }
                        });
                    });

                } else {
                    // an existing tab with this url was found - try to use it.
                    try {
                        console.debug("An existing tab was found with this URL.");
                        //let tabId = tabs[0].id;
                        console.debug('Using existing tab:', tab_id);
                        //rc = sendMessageToContentScript(tab_id, resp, noteid, session_uuid);
                        sendMessageToContentScript(tab_id, resp, noteid, session_uuid)
                        .then(result => {
                            console.debug('Result:', result); // This will log '0' for success or '1' for error
                            // sending failed try opening in the current tab
                            // Query to get the current active tab
                            chrome.tabs.query({
                                active: true,
                                currentWindow: true
                            }, function (tabs) {
                                if (tabs.length > 0) {
                                    let activeTab = tabs[0];
                                    // Update the URL of the current active tab
                                    chrome.tabs.update(activeTab.id, {
                                        url: url
                                    }, tab => {
                                        console.debug("Tab updated with URL:", url);

                                        // Wait for the tab to finish loading the new URL
                                        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
                                            if (tabId === tab.id && changeInfo.status === 'complete') {
                                                // Remove the listener once the URL is loaded
                                                chrome.tabs.onUpdated.removeListener(listener);

                                                sendMessageToContentScript(tabId, resp, noteid, session_uuid)
                                                .then(result => {
                                                    console.debug('Result:', result); // This will log '0' for success or '1' for error
                                                    resolve(`Message sent to new tab ${tab.id}`);
                                                })
                                                .catch(error => {
                                                    console.error('Unexpected error:', error);
                                                });
                                            }
                                        });
                                    });
                                } else {
                                    console.error("No active tab found.");
                                }
                            });

                            resolve(`Message sent to new tab ${tab_id}`);
                        })
                        .catch(error => {
                            console.error('Unexpected error:', error);
                        });
                    } catch (e) {
                        console.debug(e);
                        reject(e);
                    }
                }

            });
        })
        .catch((error) => {
            reject(error);
        });
    });
}

function sendMessageToContentScript(tabId, resp, noteid, session_uuid) {
    console.debug('sendMessageToContentScript: Sending message to tab ' + tabId);
    const datarow = resp.notes_found[0];
    console.debug(datarow);

    const note = JSON.parse(datarow.json); // Assuming JSON.parse is necessary
    const creatorid = datarow.creatorid;
    const note_type = note.note_type;

    // Construct the message object
    const msg = {
        sharedsecret: "qwertyui",
        action: "create_and_scroll_to_note",
        notes: resp,
        noteid: noteid,
        note_type: note_type,
        creatorid: creatorid,
        session_uuid: session_uuid,
        node_obj: note // using parsed JSON directly
    };
    console.debug(msg);

    // Send the message and handle the promise
    return chrome.tabs.sendMessage(tabId, msg)
    .then(res => {
        console.debug("# response " + JSON.stringify(res));
        return 0; // success
    })
    .catch(error => {
        console.debug("# error " + JSON.stringify(error));
        // This error typically occurs when the tab is open but the plugin has been restarted.
        // The tab should be refreshed in this case, but as it is not the desired behavior, return 1
        return 1; // error or other undesirable situation
    });
}

function DELETEsendMessageToContentScript(tabId, data, noteId) {
    chrome.tabs.sendMessage(tabId, {
        data: data,
        noteId: noteId
    }, function (response) {
        console.debug('Response from content script:', response);
    });
}

function DELETE2sendMessageToContentScript(tabId, resp, noteid) {
    // Send a message to the content script in the given tab
    console.debug('sendMessageToContentScript: Sending message to tab ' + tabId);
    const datarow = resp.notes_found[0];
    console.debug(datarow);

    const node_obj = datarow.json;
    console.debug(node_obj);

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

    try {
        chrome.tabs.sendMessage(tabId, msg).then(function (res) {
            // read response
            console.debug("# response " + JSON.stringify(res));
            return 0;
        }).catch(function (error) {
            console.debug("# error " + JSON.stringify(error));
            /* this error usually occure when the tab is open byt the plugin has been restarted. The tab should in that case also be refreshed but this is not desired behavior.
            In this scenario the desired url is open fresh  in the current tab instead.
             */
            return 1;
            console.debug("# error " + JSON.stringify(error));

        });
    } catch (e) {
        console.debug(e);
        return 1;
    }

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
    console.debug('findTabsAndSendMessage: Sending message to tabs matching url ' + url + ':', message);
    return chrome.tabs.query({
        url: url
    })
    .then(tabs => {
        console.debug('Found tabs:', tabs);

        const promises = tabs.map(tab => {
                console.debug('Sending message to tab ' + tab.id + ':', message);
                return chrome.tabs.sendMessage(tab.id, message)
                .then(response => console.debug('Response from tab ' + tab.id + ':', response))
                .catch(error => console.error('Error sending message to tab ' + tab.id + ':', error));
            });
        return Promise.all(promises);
    })
    .catch(error => console.error('Error querying tabs:', error));
}

function createCookieHeader(cookies) {
    return cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
}
/*
call to collect a webpage
include relevant cookies that have been set for this URL earlier. This is essential for sites requiring authentication, as this information is stored in the cookies.

 */
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

function capturePageForEmbedingInIframe(url, cookieString) {
    const cookieHeader = createCookieHeader(cookieString);
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'GET',
            headers: {
                'Cookie': cookieString,
                'Content-Type': 'text/html'
            },
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok)
                throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
        })
        .then(html => inlineResources(html, url, cookieString))
        .then(inlineHtml => {
            console.debug('Captured and inlined resources for', url);
            console.debug(inlineHtml);
            const blob = new Blob([inlineHtml], {
                    type: 'text/html'
                });
            // const blobUrl = URL.createObjectURL(blob);
            const blobUrl = blobToDataURI(blob);

            resolve(inlineHtml);
        })
        .catch(error => {
            console.error('Failed to capture and inline resources:', error);
            reject(error);
        });
    });
}

function fetchResourceAsDataURI(url, cookieString) {
    console.debug("fetchResourceAsDataURI.start");
    console.debug('Fetching resource as data URI:', url);
    return fetch(url)
    .then(response => {
        if (!response.ok)
            throw new Error(`Network response was not ok for ${url}`);
        return response.blob();
    })
    .then(blob => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    });
}

function inlineResources(html, baseUrl, cookieString) {
    console.debug("inlineResources.start");
    console.debug('Inlining resources for', baseUrl);
    console.debug('Cookie string:', cookieString);
    console.debug('HTML:', html);
    // Regex to find image and link tags
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const cssRegex = /<link[^>]+href=["']([^"']+)["'][^>]*rel=["']stylesheet["'][^>]*>/gi;

    // Function to replace URL with data URI
    function replaceWithDataURL(original, url, cookieString) {
        console.debug("replaceWithDataURL.start");
        console.debug("original: " + original);
        console.debug('Replacing URL with data URI:', url);
        const fullUrl = new URL(url, baseUrl).href;
        return fetchResourceAsDataURI(fullUrl, cookieString)
        .then(dataUri => {
            console.debug('Incomming data URI:', dataUri);
            console.debug("replace ", original);
            console.debug("with ", original.replace(url, dataUri));
            console.debug("in ", html);
            const result = html.replace(original, original.replace(url, dataUri));
            console.debug("result: ", result);
            return result;
        })
        .catch(error => {
            console.error(`Failed to load resource ${fullUrl}:`, error);
            return html; // Return the original html if the fetch fails
        });
    }

    // Collect all promises from replacements
    const replacements = [];

    // Handle images
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
        replacements.push(replaceWithDataURL(match[0], match[1], cookieString));
    }

    // Handle CSS
    while ((match = cssRegex.exec(html)) !== null) {
        replacements.push(replaceWithDataURL(match[0], match[1], cookieString));
    }

    // Resolve all replacements
    return Promise.all(replacements).then(() => html);
}

function blobToDataURI(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function () {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function fetchResourceAsDataURI(url, cookieString) {
    console.debug("fetchResourceAsDataURI.start");
    return fetch(url, {
        headers: {
            'Cookie': cookieString
        }
    })
    .then(response => {
        if (!response.ok)
            throw new Error(`Network response was not ok for ${url}`);
        return response.blob();
    })
    .then(blob => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    });
}

function capturePageAndProcess(url, cookieString) {
    console.debug("capturePageAndProcess.start");
    console.debug(url);
    return fetch(url, {
        headers: {
            'Cookie': cookieString
        }
    })
    .then(response => {
        if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);
        return response.text();
    })
    .then(html => {
        const urlPattern = /<img src="([^"]+)"|<link rel="stylesheet" href="([^"]+)"/g;
        const replacements = [];
        let match;

        // Gather all resource URLs and their intended replacements
        while ((match = urlPattern.exec(html)) !== null) {
            const resourceUrl = match[1] || match[2]; // Depending on whether it's an img or link tag
            const absoluteUrl = new URL(resourceUrl, url).href; // Resolve relative URLs

            // Create a replacement promise
            const replacementPromise = fetchResourceAsDataURI(absoluteUrl, cookieString)
                .then(dataUri => {
                    return {
                        old: resourceUrl,
                        new: dataUri
                    };
                });

            replacements.push(replacementPromise);
        }

        return Promise.all(replacements).then(replacementsInfo => {
            // Replace all resource URLs with their corresponding data URIs
            replacementsInfo.forEach(replace => {
                html = html.replace(new RegExp(replace.old, 'g'), replace.new);
            });
            return html;
        });
    });
}

let cookiesInMemory = {};

/* #############################

Authentication to Yellow Notes Cloud infrastructure takes place here

 * pick up the session header set back from the login process in the www.yellowsnotes.cloud domain

 */

chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
    console.debug(details);
    console.debug(details.responseHeaders);
    console.debug("looking for " + plugin_session_header_name);
    const xSessionHeader = details.responseHeaders.find(header => header.name.toLowerCase() === plugin_session_header_name);
    console.debug('Possible Yellownotes session authentication header detected * * * * * *');
    if (xSessionHeader) {
        console.debug('Yellownotes session value:' + xSessionHeader.value);
        chrome.storage.local.set({
            [plugin_session_header_name]: xSessionHeader.value
        }, () => {
            console.debug('Yellownotes Value saved in local storage (on ', plugin_session_header_name, '): ', xSessionHeader.value);
        });
    }
}, {
    urls: ["*://www.yellownotes.cloud/*"]
},
    ["responseHeaders"]);

// effect the logout
chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
    // console.debug(details);
    // execute logout
    console.debug('Logout detected');
    chrome.storage.local.remove(
        [plugin_session_header_name], () => {
        console.debug('Yellownotes session token removed local storage:');
    });
}, {
    urls: ["*://www.yellownotes.cloud/logout_silent*"]
},
    ["responseHeaders"]);

function logHeaders(tabId, url) {
    console.debug('Listening for headers on tab:', tabId);
    chrome.webRequest.onBeforeSendHeaders.addListener(
        function (details) {
        console.debug('Headers received for tab:', details.tabId);
        if (details.tabId === tabId) {
            console.debug('Headers for tab:', details.requestHeaders);
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
            console.debug(`Created tab ${tab.id}`);
            // Log cookies for the URL
            //logCookiesForUrl(url);


            // Listen for a message from the content script
            chrome.runtime.onMessage.addListener(function listener(response, sender) {
                if (sender.tab.id === tab.id) {
                    console.debug('Content fetched: ', response.content);

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
    console.debug(`logCookiesForUrl.start Fetching cookies for ${url}`);
    return new Promise(function (resolve, reject) {
        // Retrieve cookies for the given URL
        chrome.cookies.getAll({
            url: url
        })
        .then(cookies => {
            // Log all cookies
            console.debug(`Cookies for ${url}:`, cookies);
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
        console.debug(JSON.stringify(result));
        const sessiontoken = result[plugin_session_header_name];
        console.debug(sessiontoken);
        console.debug("calling getTemplate");
        return getTemplate(brand, note_type);
    }).then(function (result) {
        //console.debug(result);

        template = result;
        //console.debug(template);

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
    console.debug("getTemplate(brand, note_type):   " + brand + " " + note_type);
    // lookup the template file
    console.debug(isUndefined(brand) || brand == null || brand == '' || brand == 'undefined');
    if (isUndefined(brand) || brand == null || brand == '' || brand == 'undefined') {
        brand = '';
    }

    //if (isUndefined(type) || type == null || type == '' || type == 'undefined') {
    //    type = 'yellownote';
    //}

    console.debug("getTemplate(brand, note_type): '" + "' '" + brand + "' '" + note_type + "'");

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
                console.debug("user has a brand: " + brand);

                // nothing found locally for the brand, try remote


                console.debug("looking for template file " + './templates/' + brand + '_yellownote_template.html locally');
                // look for template file in local filesystem
                fetch(chrome.runtime.getURL('./templates/' + brand +  '_yellownote_template.html')).then(function (response) {
                    // found the file locally, use it
                    console.debug("found the file locally, use it");
                    console.debug(response);
                    template = response.text();
                    console.debug(template);

                    resolve(template);
                }).catch(function (err) {
                    console.debug(err);
                    // tried and failed to find the file locally, try the server ( there will be a cache-lookup intercept)
                    console.debug("looking for template file " + server_url + '/template with params:');
                    const msg_obj = {

                        brand: brand,
                        note_type: note_type
                    }
                    console.debug(msg_obj);
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
                        console.debug(response);
                        console.debug(response.status);
                        template = response.text();
                        console.debug(template);
                        if (response.status != 200) {
                            // an error, look for default template file of the requested note type
                            console.debug('looking for template file ./templates/default_yellonwote_template.html');
                            fetch(chrome.runtime.getURL('./templates/default_yellonwote_template.html')).then(function (response) {
                                // found the file locally
                                console.debug(response);
                                template = response.text();
                                resolve(template);
                            }).catch(function (err) {
                                console.debug(err);
                                reject(err);
                            });
                        } else {
                            resolve(template);
                        }
                    }).catch(function (err) {
                        console.debug(err);
                        // no luck with the brand,  try the default
                        console.debug('looking for template file ./templates/default_yellonwote_template.html');
                        fetch(chrome.runtime.getURL('./templates/default_yellonwote_template.html')).then(function (response) {
                            // found the file locally
                            console.debug(response);
                            template = response.text();
                            resolve(template);
                        }).catch(function (err) {
                            console.debug(err);
                            resolve("");
                        });
                    });
                });
            }
        });
    });
}

/**
 * Get the type template file from the server
 */
function getNotetypeTemplate(note_type) {
    console.debug("getNotetypeTemplate(note_type): " + note_type);
    // lookup the template file

    // The notes are/can be branded. The brand is a feature for premium users.
    // The user can also be part of a brand/organization. If so, the notes are branded accordingly.

    // feature priority: brand over user. Check first if the user is part of a brand. If so, search for a template belonging to this brand first.
    // search order: local filesystem, remote database, default templates

    // If searches return nothing or fail, the default templates are used.


    return new Promise(function (resolve, reject) {

        var typetemplate;

        // no luck with the brand,  try the default
        console.debug('looking for template file ./templates/typetemplate_yellownote_' + note_type + '.html');
        fetch(chrome.runtime.getURL('./templates/typetemplate_yellownote_' + note_type + '.html')).then(function (response) {
            // found the file locally
            console.debug(response);
            typetemplate = response.text();
            resolve(typetemplate);
        }).catch(function (err) {
            console.debug(err);
            reject(err);
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
    console.debug(sessiontoken);

    const parsed = parseJwt(sessiontoken);
    const tokendata = getClaimsFromJwt(parsed, ["uuid"]);
    console.debug(tokendata);
    if (tokendata != null) {
        return uuid = tokendata.uuid;
    } else {
        return null;

    }
}

function parseJwt(token) {
    console.debug("2.parseJwt( " + token + " )");
    console.debug("2.parseJwt( " + (typeof token) + " )");
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        console.debug("2.parseJwt( " + base64 + " )");
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
        console.debug(jsonPayload);
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Invalid token:', e);
        return null;
    }
}

function getClaimsFromJwt(decodedToken, claimNames) {
    console.debug("getClaimsFromJwt( " + decodedToken + " )");
    console.debug(claimNames);
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
