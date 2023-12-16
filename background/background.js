
console.debug("start with Yellow Sticky Notes");

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



//const server_url = "http://localhost:3002";
const server_url = "http://api.yellowstickynotes.online";

const URI_plugin_user_post_yellowstickynote = "/plugin_user_post_yellowstickynote";
const URI_plugin_user_update_yellowstickynote = "/plugin_user_update_yellowstickynote";
const URI_plugin_user_setstatus_yellowstickynote = "/plugin_user_setstatus_yellowstickynote";

const URI_plugin_user_get_all_url_yellowstickynotes = "/plugin_user_get_all_url_yellowstickynotes";
const URI_plugin_user_get_own_url_yellowstickynotes = "/plugin_user_get_own_url_yellowstickynotes";


const URI_plugin_user_delete_yellowstickynote = "/plugin_user_delete_yellowstickynote";

let salt;


const plugin_uuid_header_name = "ynInstallationUniqueId";

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
chrome.storage.local.get(['ynInstallationUniqueId'], function (result) {

    if (!result.ynInstallationUniqueId) {
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
        console.debug("ynInstallationUniqueId already set (" + result.ynInstallationUniqueId + ")");
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
function cacheData(url, data) {
    console.log("cacheData (" + url + ")");
    const cacheEntry = {
        data: data,
        timestamp: Date.now()
    };
    chrome.storage.local.set({
        [url]: cacheEntry
    }, () => {
        console.log(`Data cached for ${url}`);
    });
}

// Function to retrieve cached data
function getCachedData(url) {
    console.log("getCachedData (" + url + ")");
    return new Promise(resolve => {
        chrome.storage.local.get(url, result => {
            resolve(result[url]);
        });
    });
}

// Intercepting fetch requests
self.addEventListener('fetch', event => {
    console.log("fetch (" + event.request.url + ")");
    const url = event.request.url;

    if (matchesCachePattern(url)) {
        event.respondWith(
            getCachedData(url).then(cacheEntry => {
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

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
        isEnabled: true,
        defaultPosition: 1
    });
});

var in_memory_tab_settings = {};


// set up the context menu items here
chrome.contextMenus.create({
    id: "yellowstickynotes",
    title: "yellow stick notes",
    contexts: ["selection"]
});

chrome.contextMenus.create({
    id: "create-yellowstickynote",
    parentId: "yellowstickynotes",
    title: "attach yellow sticky-note to selection",
    contexts: ["selection"]
});

chrome.contextMenus.create({
    id: "lookup-yellow-stickynotes",
    parentId: "yellowstickynotes",
    title: "check for yellow sticky-notes",
    contexts: ["selection"]
});

// create the notes posting external content
chrome.contextMenus.create({
    id: "pin-content-note",
    parentId: "yellowstickynotes",
    title: "pin on other content here",
    contexts: ["selection"]
});
// branded notes
chrome.contextMenus.create({
    id: "pin-faktisk-note",
    parentId: "yellowstickynotes",
    title: "pin Faktisk content here",
    contexts: ["selection"]
});
chrome.contextMenus.create({
    id: "pin-klassekampen-note",
    parentId: "yellowstickynotes",
    title: "pin Klassekampen content here",
    contexts: ["selection"]
});
chrome.contextMenus.create({
    id: "pin-dagensneringsliv-note",
    parentId: "yellowstickynotes",
    title: "pin Dagens Næringsliv content here",
    contexts: ["selection"]
});

// to create blank stickynote on any page, not tied to a selection
chrome.contextMenus.create({
    id: "create-blankyellowstickynote",
    title: "create yellow sticky-note for page",
    contexts: ["all"]
});

// for access to admin page there is a separate listener
//chrome.browserAction.onClicked.addListener(() => {
//    // use this functionality to get a full tabpage
//    console.debug("chrome.browserAction.onClicked.addListener");
//    chrome.tabs.create({
//        url: "./pages/view_yellowstickynotes.html"
//    });
//    // can replace the above with a direct referal to this html in the manifest
//    // - but this would not provide a full tab-page
//    // "brower_action": {
//    // "default_popup": "navigate-collection.html"
//});

// in-memory variable
var in_memory_policies = {};
var show_sliders = true;
var defaultSliderPosition = 1;

// listener for messages from the content scripts or the admin pages
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

    console.debug("received from page:  message: " + JSON.stringify(message));

    try {
        var action = "";
    action = message.action;
    console.debug("action: " + action);

    try {
    if (message.stickynote.request ){
        
        action = message.stickynote.request ;
    }
}catch(f){
    console.debug(f);
}

        }catch(e){
            console.debug(e);
        }

        console.debug("action: " + action);
    var ynInstallationUniqueId = "";

    try {

        if (action === "toggleSlider") {
            try {
                console.log("toggleSlider")
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

        } else if (action === "simple_url_lookup") {

            // upen a tab and get a URL, then close the tab

            console.log("simple_url_lookup");
            const url = message.stickynote.url;
            console.log(url);
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

            return true;

        } else if (action === "getSliderStatus") {
            console.log("getSliderStatus")
            // Relay the state to all open tabs

            sendResponse({
                defaultSliderPosition: defaultSliderPosition
            });

        } else if (action === "getDistributionLists") {
            console.log("getDistributionLists")
            // Relay the state to all open tabs


            sendResponse({
                defaultSliderPosition: defaultSliderPosition
            });
            return true;
        } else if (action == "local_pages_intercept") {
            // redirect an external link to the GUI page
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
            chrome.storage.local.get(['ynInstallationUniqueId']).then(function (result) {
                ynInstallationUniqueId = result.ynInstallationUniqueId;
                console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);

                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'ynInstallationUniqueId': ynInstallationUniqueId
                    },
                    body: JSON.stringify(message.stickynote.create_details),
                };
                //        console.debug(opts);


                return fetch(server_url + URI_plugin_user_post_yellowstickynote, opts);
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

            // Query all tabs
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

            // Query all tabs
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

        } else if (action == 'single_update') {
            console.debug("request: update a single yellow note");
            // if update is to disable the note, remove it from the in-memory store


            console.debug(message.stickynote.update_details);
            chrome.storage.local.get(['ynInstallationUniqueId']).then(function (result) {
                ynInstallationUniqueId = result.ynInstallationUniqueId;
                console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);

                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'ynInstallationUniqueId': ynInstallationUniqueId
                    },
                    body: JSON.stringify(message.stickynote.update_details),
                };
                return fetch(server_url + URI_plugin_user_update_yellowstickynote, opts);
            }).then(function (response) {
                //                console.log(response);
                return response.json();
            }).then(function (data) {
                //                  console.log(data);
                sendResponse(data);

            });

        } else if (action == 'get_template') {

            console.debug("request: getTemplate");
            const brand = message.brand;
            getTemplate(brand).then(function (result) {
                console.debug(result);
                sendResponse(result);
            });

            return true;

        } else if (action == 'get_my_distribution_lists') {
            console.debug("request: get_my_distribution_lists");
            // if update is to disable the note, remove it from the in-memory store


            chrome.storage.local.get(['ynInstallationUniqueId']).then(function (result) {
                ynInstallationUniqueId = result.ynInstallationUniqueId;
                console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);

                const opts = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'ynInstallationUniqueId': ynInstallationUniqueId
                    },

                };
                return fetch(server_url + "/plugin_user_read_my_distribution_lists", opts);
            }).then(function (response) {
                //                console.log(response);
                return response.json();
            }).then(function (data) {
                //                  console.log(data);
                sendResponse(data);

            });

            return true;

        } else if (action == 'single_delete') {
            console.debug("request: delete a single yellow note");
            console.debug(JSON.stringify(message));
            console.debug(JSON.stringify(message.stickynote.delete_details));

            const uuid = message.stickynote.delete_details.uuid;
            chrome.storage.local.get(['ynInstallationUniqueId']).then(function (result) {
                ynInstallationUniqueId = result.ynInstallationUniqueId;
                console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);

                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'ynInstallationUniqueId': ynInstallationUniqueId
                    },
                    body: JSON.stringify({
                        uuid: uuid

                    })
                };
                console.debug(JSON.stringify(opts));
                return fetch(server_url + URI_plugin_user_setstatus_yellowstickynote, opts);
            }).then(function (response) {

                sendResponse('{"response":"ok"}');

            });

            //delete_note(message.stickynote.delete_details).then(function (res) {});
        } else if (action == 'single_disable') {
            console.debug("request: disable a single yellow note");
            console.debug(JSON.stringify(message));
            console.debug(JSON.stringify(message.stickynote.disable_details));

            const uuid = message.stickynote.disable_details.uuid;
            chrome.storage.local.get(['ynInstallationUniqueId']).then(function (result) {
                ynInstallationUniqueId = result.ynInstallationUniqueId;
                console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);

                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'ynInstallationUniqueId': ynInstallationUniqueId
                    },
                    body: JSON.stringify({
                        uuid: uuid,
                        status: "0"
                    })
                };
                console.debug(JSON.stringify(opts));
                return fetch(server_url + URI_plugin_user_setstatus_yellowstickynote, opts);
            }).then(function (response) {

                sendResponse('{"response":"ok"}');

            });
        } else if (action == 'single_enable') {
            console.debug("request: enable a single yellow note");
            console.debug(JSON.stringify(message));
            console.debug(JSON.stringify(message.stickynote.enable_details));

            const uuid = message.stickynote.enable_details.uuid;
            chrome.storage.local.get(['ynInstallationUniqueId']).then(function (result) {
                ynInstallationUniqueId = result.ynInstallationUniqueId;
                console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);

                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'ynInstallationUniqueId': ynInstallationUniqueId
                    },
                    body: JSON.stringify({
                        uuid: uuid,
                        status: "1"
                    })
                };
                console.debug(JSON.stringify(opts));
                return fetch(server_url + URI_plugin_user_enable_yellowstickynote, opts);
            }).then(function (response) {

                sendResponse('{"response":"ok"}');

            });

        } else if (action == 'lookup_stickynote_in_place') {
            console.debug("request: lookup a single yellow note exactly where it is located");

            // lookup the details of the note in the database
            var object_id = message.stickynote.stickynote_details.object_id;
            var note_object;
            var tab_id;
            loadFromIndexedDBbyIndex_async("sourceURLYellowNotesDB", "sourceURLYellowNotesStore", "uuid", object_id)
            .then(function (res) {
                console.debug(res);

                //var url = res.url;
                note_object = res;
                console.debug("###calling NavigateToSpecificStickynote.js");

                console.debug("### with delay");

                const sleep = function (ms) {
                    console.debug("ms:" + ms);
                    return new Promise(function (resolve, reject) {
                        console.debug("ms:" + ms);
                        return setTimeout(resolve, ms);
                    });
                }
                // Using Sleep,to let the note to be placed on the page first
                //console.debug('Now');
                return sleep(4000);

            }).then(function (res) {
                console.debug("### completed");

                // execute script in active tab
                // query for the one active tab
                return chrome.tabs.query({
                    active: true,
                    currentWindow: true
                });

            }).then(function (tabs) {
                // execute script on active tab
                console.debug("###### NavigateToSpecificStickynote response " + JSON.stringify(tabs));
                tab_id = tabs[0].id;
                console.debug(tab_id);
                // send message to the active tab
                var shared_secret_to_identify_background_js_to_content_script_NavigateToSpecificStickynote = "Glbx_marker3465";
                return chrome.tabs.sendMessage(tab_id, {
                    NavigateToSpecificStickynote: shared_secret_to_identify_background_js_to_content_script_NavigateToSpecificStickynote,
                    note_object: note_object
                });

            }).then(function (res) {
                console.debug(res);
                // send message to script
                sendResponse(res);
            });

        } else if (action == 'get_all_available_stickynotes') {
            console.debug("get all notes for " + message.stickynote.url);

            // loop up in the in-memory has hashtable_url

            var s_notes = {};

            s_notes = in_memory_policies["sourceURLYellowNotesDB_url_uuid"][message.stickynote.url];
            // console.debug("notes found: " + Object.keys(s_notes).length);

            console.debug("notes returned: " + JSON.stringify(s_notes));

            sendResponse(s_notes);

        } else if (action == 'get_all_applicable_stickynotes') {
            console.debug("get all notes for " + message.stickynote.url);
            const url = message.stickynote.url;
            // call out to database
            chrome.storage.local.get(['ynInstallationUniqueId']).then(function (result) {
                ynInstallationUniqueId = result.ynInstallationUniqueId;
                console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);

                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'ynInstallationUniqueId': ynInstallationUniqueId
                    },
                    body: JSON.stringify({
                        'url': url
                    }),
                };
                console.log(opts);
                return fetch(server_url + URI_plugin_user_get_all_url_yellowstickynotes, opts);
            }).then(function (response) {
                //                console.log(response);
                return response.json();
            }).then(function (data) {
                console.log(data);
                sendResponse(data);

            });


      
        } else if (action == 'get_own_applicable_stickynotes') {
            console.debug("get all notes for " + message.stickynote.url);
            const url = message.stickynote.url;
            // call out to database
            chrome.storage.local.get(['ynInstallationUniqueId']).then(function (result) {
                ynInstallationUniqueId = result.ynInstallationUniqueId;
                console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);

                const opts = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'ynInstallationUniqueId': ynInstallationUniqueId
                    },
                    body: JSON.stringify({
                        'url': url
                    }),
                };
                console.log(opts);
                return fetch(server_url + URI_plugin_user_get_own_url_yellowstickynotes, opts);
            }).then(function (response) {
                //                console.log(response);
                return response.json();
            }).then(function (data) {
                console.log(data);
                sendResponse(data);

            });
        }

    } catch (e) {
        console.debug(e);
    }
    return true;
});

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

// http://www.yellowstickynotes.online:3002/login 

const targetSessionCookieUrlPattern = '*://*.yellownotes.com/*'; // The URL pattern you want to monitor
let cookiesInMemory = {};

chrome.webRequest.onHeadersReceived.addListener(
  details => {
    console.log("details.responseHeaders");
    console.log("from: " + details.url);

    console.log(details.responseHeaders);
    //if (details.url.startsWith(targetSessionCookieUrlPattern)) {
      for (let header of details.responseHeaders) {
        console.log(header.name.toLowerCase()  );
        if (header.name.toLowerCase() === 'set-cookie') {
          // Store cookie in memory. This is a simple example; adapt as needed.
          cookiesInMemory[details.url] = header.value;
          console.log('Cookie stored:', header.value);
        }
      }
    //}
  },
  { urls: [targetSessionCookieUrlPattern] },
  ['responseHeaders']
);


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

// listener fro context menu clicks

chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.debug("chrome.contextMenus.onClicked.addListener:info:" + JSON.stringify(info));
    console.debug("chrome.contextMenus.onClicked.addListener:tab:" + JSON.stringify(tab));

    if (info.menuItemId === "create-yellowstickynote") {
        console.debug("# create-yellowstickynote");

        // use embeded as the content type. It captures more data some of which will not be used, but it more likely to be uniquely anchored.
        create_yellowstickynote(info, tab, 'anchor');

    } else if (info.menuItemId === "pin-content-note") {
        pinContentNote(info, tab, 'anchor', 'default');

    } else if (info.menuItemId === "pin-dagensneringsliv-note") {
        pinContentNote(info, tab, 'http_get_url', 'dagensneringsliv');

    } else if (info.menuItemId === "pin-klassekampen-note") {
        pinContentNote(info, tab, 'http_get_url', 'klassekampen.no');
    } else if (info.menuItemId === "pin-faktisk-note") {
        pinContentNote(info, tab, 'http_get_url', 'faktisk.no');

    } else if (info.menuItemId === "lookup-yellow-stickynotes") {
        lookup_yellowstickynotes(info, tab);

    } else if (info.menuItemId === "create-blankyellowstickynote") {
        console.debug("# create-blankyellowstickynote");
        create_blankyellowstickynote(info, tab);
    }
});

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

function create_blankyellowstickynote(info, tab) {
    // contenttype
    // permitted values: text, html, embeded, linked

    console.debug("create_blankyellowstickynote(info,tab)");

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
        files: ["./content_scripts/CreateBlankYellowStickyNote.js"],
    }).then(function (result) {
        // send message to the active tab
        return chrome.tabs.sendMessage(tab_id, {
            createBlankYellowStickyNote: background_to_createBlankYellowStickyNote_sharedsecret,
            info: info,
            tab: tab

        });
    }).then(function (res) {
        // read response
        console.debug("# response " + JSON.stringify(res));
    });
}

function create_yellowstickynote(info, tab, contenttype) {
    // contenttype
    // permitted values: text, html, embeded, linked

    // call back out to the content script to get the selected html - and other parts of the page -and create the not object

    // Should the user later click "save" The event handler for the save-event in the content script will then call back to the background script to save the note to the database.


    console.debug("create_yellowstickynote(info," + contenttype + ")");

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
    var tab_id = "";

    console.debug("###calling NoteSelectedHTML.js for contenttype=" + contenttype);

    // execute script in active tab
    // chrome.tabs.executeScript({
    //     file: "NoteSelectedHTML.js",
    //     allFrames: true
    // }).then(function (result) {
    //     console.debug("background.js:onExecuted: result: " + JSON.stringify(result));
    // query for the one active tab
    //   return chrome.tabs.query({
    //        active: true,
    //         currentWindow: true
    //      });
    // }).then(function (tabs) {
    //      console.debug("###### GetSelectedHTML response " + JSON.stringify(tabs));
    // send message to the active tab
    tab_id = tab.id;
    var shared_secret_to_identify_background_js_to_content_script_NoteSelectedHTML = "Glbx_marker6";

    //        var background_to_NoteSelectedHTML_sharedsecret = "Glbx_marker61";

    chrome.tabs.sendMessage(tab.id, {
        NoteSelectedHTML: shared_secret_to_identify_background_js_to_content_script_NoteSelectedHTML,
        contenttype: contenttype,
        selectionText: selectionText
        // });
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
    if (brand == '') {
        brand = 'default';
    }

    // lookup the template file

    var template;
    

    getTemplate(brand).then(function (result) {
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
            NoteSelectedHTML: shared_secret_to_identify_background_js_to_content_script_NoteSelectedHTML,
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


function getTemplate(brand) {

    // lookup the template file
    return new Promise(function (resolve, reject) {

        var template;
        var ynInstallationUniqueId;

        chrome.storage.local.get(['ynInstallationUniqueId']).then(function (ins) {
            ynInstallationUniqueId = ins.ynInstallationUniqueId;

            // first: look for the template file in the filesystem templates directory
            // The template files are stored in the templates directory and have the "_template.html" file suffix

            console.log("looking for template file " + './templates/' + brand + '_template.html');
            fetch(chrome.runtime.getURL('./templates/' + brand + '_template.html')).then(function (response) {
                // found the file locally
                console.log(response);
                template = response.text();
                resolve(template);
            }).catch(function (err) {
                console.log(err);
                // files to file the file locally, try the server ( there will be a cache-lookup intercept)
                fetch(server_url + '/template?referenceKey=' + brand, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'Content-Type: text/html',
                        [plugin_uuid_header_name]: ynInstallationUniqueId
                        // Add any other necessary headers
                    },

                }).then(function (response) {
                    // found the template on the server (or cache)
                    console.log(response);
                    console.log(response.status);
                    if (response.status != 200) {
                        // an error, go for default
                        fetch(chrome.runtime.getURL('./templates/default_template.html')).then(function (response) {
                            // found the file locally
                            console.log(response);
                            template = response.text();
                            resolve(template);
                        }).catch(function (err) {
                            console.log(err);
                            reject(err);
                        });
    
                    }else{
                    template = response.text();
                    console.log(template);
                    resolve(template);
                    }
                }).catch(function (err) {
                    console.log(err);
                    // no luck with the brand,  try the default

                    fetch(chrome.runtime.getURL('./templates/default_template.html')).then(function (response) {
						// found the file locally
						console.log(response);
						template = response.text();
						resolve(template);
					}).catch(function (err) {
						reject(err);
					});
				});
            });
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
