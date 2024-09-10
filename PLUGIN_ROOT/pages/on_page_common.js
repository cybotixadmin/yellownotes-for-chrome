const server_url = "https://api.yellownotes.cloud";

const plugin_uuid_header_name = "ynInstallationUniqueId";
// name of header containing session token
//const plugin_session_header_name = "xyellownotessessionjwt";

const plugin_remove_banner_uri = "/api/v1.0/delete_note_banner";

const silent_logout_url = "https://www.yellownotes.cloud/logout_silent";

const URI_plugin_user_get_my_feed_subscribers = '/api/v1.0/plugin_user_get_my_feed_subscribers';

const URI_plugin_user_setdistributionlist_yellownote = '/api/v1.0/plugin_user_setdistributionlist_yellownote';

const URI_plugin_user_get_distributionlists_by_creatorid = '/api/v1.0/plugin_user_get_distributionlists_by_creatorid';

const URI_plugin_user_savechanges_yellownote = '/api/v1.0/plugin_user_savechanges_yellownote';

const URI_plugin_user_delete_subscription = "/api/v1.0/plugin_user_delete_subscription";

const URI_plugin_user_delete_distribution_list = "/api/v1.0/plugin_user_delete_distribution_list";
const URI_plugin_user_get_distribution_list = "/api/v1.0/plugin_user_get_distribution_list";

const URI_plugin_user_update_own_distributionlist = "/api/v1.0/plugin_user_update_own_distribution_list";
const URI_plugin_user_get_all_agreements = "/api/plugin_user_get_all_data_agreements";
const URI_plugin_user_delete_data_agreement = "/api/plugin_user_delete_distribution_list";
const URI_plugin_user_add_subscription_v10 = "/api/v1.0/plugin_user_add_subscription";
const URI_plugin_user_set_agreement_active_status = "/api/v1.0/plugin_user_set_subscription_active_status";

const URI_plugin_user_set_all_subscriptions_active_status = "/api/v1.0/plugin_user_set_all_subscriptions_active_status";
const URI_plugin_user_set_subscription_active_status = "/api/v1.0/plugin_user_set_subscription_active_status";
const URI_plugin_user_set_self_subscription_active_status = "/api/v1.0/plugin_user_set_self_subscription_active_status";

const URI_plugin_user_set_subscription_application_status = "/api/v1.0/plugin_user_set_subscription_application_status";


const URI_plugin_user_get_statistics = "/api/v1.0/plugin_user_get_statistics";





const URI_plugin_user_get_my_subscriptions = "/api/v1.0/plugin_user_get_my_subscriptions";

const URI_plugin_user_set_distributionlist_active_status = "/api/plugin_user_set_distributionlist_active_status";
const URI_plugin_user_set_distributionlist_anonymous_allowed_status = "/api/plugin_user_set_distributionlist_anonymous_allowed_status";

const URI_plugin_user_set_distributionlist_browsing_allowed_status = "/api/plugin_user_set_distributionlist_browsing_allowed_status";

const URI_plugin_user_set_distributionlist_automatic_enrolment_status = "/api/plugin_user_set_distributionlist_automatic_enrolment_status";

const URI_plugin_user_deactivate_agreements = "/api/plugin_user_deactivate_distribution_list";
const URI_plugin_user_activate_agreements = "/api/plugin_user_activate_distribution_list";
const URI_plugin_user_get_my_distribution_lists = "/api/v1.0/plugin_user_get_my_distribution_lists";

const URI_plugin_user_download_data = "/api/v1.0/plugin_user_retrieve_all_data";

const URI_plugin_user_delete_all_data = "/api/v1.0/plugin_user_delete_all_data";
const URI_plugin_user_update_yellownote_creatorlevel_attributes = "/api/v1.0/update_creatorlevel_note_properties";

const URI_plugin_user_get_creatorlevel_note_properties = "/api/v1.0/get_creatorlevel_note_properties";

const URI_plugin_user_get_all_yellownotes = "/api/plugin_user_get_all_yellownotes";

const URI_plugin_user_get_all_subscribed_notes = "/api/v1.0/plugin_user_get_all_subscribed_notes";

const URI_plugin_user_get_own_yellownotes = "/api/v1.0/plugin_user_get_own_yellownotes";
const URI_plugin_user_delete_yellownote = "/api/v1.0/plugin_user_delete_yellownote";
const URI_plugin_user_set_note_active_status = "/api/v1.0/plugin_user_setstatus_yellownote";

const URI_plugin_user_get_active_feed_notes = "/api/v1.0/plugin_user_get_active_feed_notes";

const URI_plugin_user_get_abstracts_of_all_yellownotes = "/api/plugin_user_get_abstracts_of_all_yellownotes";

async function page_display_login_status() {
    console.debug("page_display_login_status()");
    //con
    var jwt = null;
    try {
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        console.debug(session);
        jwt = session[plugin_session_header_name];
        console.debug(jwt);
        var userid = null;
        userid = await get_username_from_sessiontoken(jwt);
    } catch (e) {
        console.debug(e);
 // assume the jwt is still valid
 const claimNames = ['userid'];
        const claims = getClaimsFromJwt(jwt, claimNames);

        console.debug(claims);
        userid = claims.userid;

    }

    console.debug("userid: " + userid);
    try {
        if (userid == null) {
            console.debug("Not logged in");
            console.debug(document.getElementById("login_status"));
            document.querySelectorAll('[name="login_status"]').forEach(element => {
                element.innerHTML = "Not logged in";
            });

        } else {
            document.querySelectorAll('[name="login_status"]').forEach(element => {
                element.innerHTML = "Logged in as " + userid;
            });

        }
    } catch (e) {
        console.error(e);
    }
}

async function is_authenticated() {
    console.debug("is_authenticated()");
    //con

    let session = await chrome.storage.local.get([plugin_session_header_name]);
    console.debug(session);
    console.debug(session[plugin_session_header_name]);
    var userid = null;
    try {
        userid = get_username_from_sessiontoken(session[plugin_session_header_name]);
    } catch (e) {
        console.error(e);
    }
    console.debug("userid: " + userid);
    if (userid == null) {
        return false;
    } else {
        return true;
    }
}

/**
 * this function exists in two forms, one for the GUI script and one for the content script
 *
 * This version is ment for the GUI scripts and in addition to removeing the noted from the page, also removes the table row the note is part of
 * @param {*} noteid
 */
function remove_noteid(noteid) {
    console.debug("remove_noteid(" + noteid + ")");

}

function cachableCall2API_GET(cacheKey, cachetimeout, protocol, endpoint) {
    if (cache_debug)  console.debug("# cachableCall2API_GET.start");
    if (cache_debug)  console.debug("cacheKey: " + cacheKey);
    if (cache_debug)  console.debug("cachetimeout: " + cachetimeout);
      console.debug("cacheKey: " + cacheKey);
     console.debug("cachetimeout: " + cachetimeout);
    if (cache_debug)  console.debug("protocol: " + protocol);
    if (cache_debug)  console.debug("endpoint: " + endpoint);
    var ynInstallationUniqueId = "";
    var xYellownotesSession = "";
    var result_data = null;
    return new Promise((resolve, reject) => {
        getCachedData(cacheKey, cachetimeout).then(function (cachedResponse) {

            if (cache_debug)   console.debug(cachedResponse);
            if (cachedResponse) {
                if (cache_debug)     console.debug("Returning cached response on key: " + cacheKey);
                // break here
                resolve(cachedResponse);
                if (cache_debug)   console.debug(" complete ");
                // break out of the promise chain
                return;
            } else {
                if (cache_debug) console.debug("No cached response on key: " + cacheKey);

                // proceed to make the request
                chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name])
                .then(function (result) {
                    if (cache_debug)   console.debug(result);
                    ynInstallationUniqueId = result[plugin_uuid_header_name];
                    xYellownotesSession = result[plugin_session_header_name];

                    if (cache_debug)  console.debug("Cache key: " + cacheKey);

                    if (cache_debug)  console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);
                    if (cache_debug)  console.debug("xYellownotesSession: " + xYellownotesSession);

                    const opts = {
                        method: protocol,
                        headers: {
                            'Content-Type': 'application/json',
                            [plugin_uuid_header_name]: ynInstallationUniqueId,
                            [plugin_session_header_name]: xYellownotesSession
                        },
                    };
                    if (cache_debug)   console.debug("make fresh request: ");
                    return fetch(endpoint, opts);
                })
                .then(function (response) {
                    if (cache_debug)   console.debug(response);

                    return response.json();
                })
                .then(function (data) {
                    if (cache_debug)   console.debug(data);

                    result_data = data;

                    // insert into the cache
                    return cacheData(cacheKey, result_data);
                    // return chrome.storage.local.set({ cacheKey: requestCacheEntry });
                }).then(function (response) {
                    if (cache_debug)   console.debug(response);
                    if (cache_debug)   console.debug("result_data");
                    if (cache_debug)  console.debug(result_data);
                    resolve(result_data);
                })
                .catch(function (error) {
                    console.error('Fetch error: ', error);
                });
            }
        });
    });

}

/*
protocol: PUT, PATCH or POST
 */
function cachableCall2API_POST(cacheKey, cachetimeout, protocol, endpoint, msg_body) {
    if (cache_debug)  console.debug("# cachableCall2API_POST.start");
    if (cache_debug) console.debug("cacheKey: " + cacheKey);
    if (cache_debug)  console.debug("cachetimeout: " + cachetimeout);
    if (cache_debug)  console.debug("protocol: " + protocol);
    if (cache_debug)  console.debug("endpoint: " + endpoint);

    var ynInstallationUniqueId = "";
    var xYellownotesSession = "";
    var result_data = null;
    return new Promise((resolve, reject) => {
        getCachedData(cacheKey, cachetimeout).then(function (cachedResponse) {

            if (cache_debug)   console.debug(cachedResponse);
            if (cachedResponse) {
                if (cache_debug)   console.debug("Returning cached response on key: " + cacheKey);
                // break here
                resolve(cachedResponse);
                if (cache_debug) console.debug(" complete ");
                // break out of the promise chain
                return;
            } else {
                if (cache_debug)  console.debug("No cached response on key: " + cacheKey);

                // proceed to make the request
                chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name])
                .then(function (result) {
                    if (cache_debug)  console.debug(result);
                    ynInstallationUniqueId = result[plugin_uuid_header_name];
                    xYellownotesSession = result[plugin_session_header_name];

                    if (cache_debug)  console.debug("Cache key: " + cacheKey);

                    if (cache_debug)  console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);
                    if (cache_debug)  console.debug("xYellownotesSession: " + xYellownotesSession);

                    const opts = {
                        method: protocol,
                        headers: {
                            'Content-Type': 'application/json',
                            [plugin_uuid_header_name]: ynInstallationUniqueId,
                            [plugin_session_header_name]: xYellownotesSession
                        },
                        body: JSON.stringify(msg_body)
                    };
                    if (cache_debug)  console.debug("make fresh request: ");
                    return fetch(endpoint, opts);
                })
                .then(function (response) {
                    if (cache_debug)  console.debug(response);
                    if (!response.ok) {
                        if (cache_debug)   console.debug(response);

                        // if an invalid session token was sent, it should be removed from the local storage
                        if (response.status == 401) {
                            // compare the response body with the string "Invalid session token" to determine if the session token is invalid
                            if (response.headers.get("session") == "DELETE_COOKIE") {
                                if (cache_debug)    console.debug("Session token is invalid, remove it from local storage.");
                                chrome.storage.local.remove([plugin_session_header_name]);
                                // redirect to the front page returning the user to unauthenticated status.
                                // unauthenticated functionality will be in effect until the user authenticates
                                window.location.href = "/pages/my_account.html";
                                reject('logout');
                            } else {
                                reject('Network response was not ok');
                            }
                        } else {
                            reject('Network response was not ok');
                        }
                    } else {
                        return response.json();
                    }
                })
                .then(function (data) {
                    if (cache_debug) console.debug(data);

                    result_data = data;

                    // insert into the cache
                    return cacheData(cacheKey, result_data);
                    // return chrome.storage.local.set({ cacheKey: requestCacheEntry });
                }).then(function (response) {
                    if (cache_debug)  console.debug(response);
                    if (cache_debug)  console.debug("result_data");
                    if (cache_debug)  console.debug(result_data);
                    resolve(result_data);
                })
                .catch(function (error) {
                    console.error('Fetch error: ', error);
                });
            }
        });
    });

}

function escapeRegex(text) {
    // Escapes the regular expression special characters in text except for '*' and '?'
    // '*' is converted to '.*' and '?' to '.'
    return text.replace(/[-[\]{}()+.,\\^$|#\s]/g, "\\$&")
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
}

// Function to extract claim from JWT
function extractClaimFromJWT(jwt, claimName) {
    // JWT consists of three parts separated by '.'
    const parts = jwt.split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
    }
    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    console.debug("payload");
    console.debug(payload);
    return payload[claimName];
}

// Procedure to check if JWT contains a claim "displayname" with valid length
function checkSessionJWTValidity() {
    return new Promise((resolve, reject) => {
        console.debug("checkSessionJWTValidity()", plugin_session_header_name);
        chrome.storage.local.get(plugin_session_header_name, (result) => {
            console.debug(result);
            const jwt = result[plugin_session_header_name];
            console.debug(jwt);
            if (jwt == "DELETED") {
                console.debug("No JWT found");
                resolve(false); // No JWT found

            } else if (!jwt) {
                console.debug("No JWT found");
                resolve(false); // No JWT found
            } else {
                try {
                    const displayName = extractClaimFromJWT(jwt, 'displayname');
                    const creatorid = extractClaimFromJWT(jwt, 'uuid');
                    
                    localStorage.setItem("creatorid", creatorid);
                    localStorage.setItem("displayName", displayName);

                    console.debug("displayname: " + displayName);
                    console.debug("creatorid: " + creatorid);
                    if (typeof displayName === 'string' && displayName.length > 4 && displayName.length < 100) {
                        resolve(true); // Valid display name found
                    } else {
                        resolve(false); // Invalid display name
                    }
                } catch (error) {
                    console.error(error);
                    resolve(false); // Error while extracting claim
                }
            }
        });
    });
}

async function logout() {

    // wipe the locate storage where the session token is stored
}

async function get_displayname_from_sessiontoken(token) {

    console.debug(token);

    try {

        // Example usage
        //const token = 'your_jwt_token'; // Replace with your JWT token
        const claimNames = ['displayname']; // Replace with the claims you want to extract
        const claims = getClaimsFromJwt(token, claimNames);

        console.debug(claims);
        return (claims.displayname);
    } catch (e) {
        console.error(e);
        return null;
    }
}

// call for a html file and inserts the content of this html fil into the DOM at the location of the element with the id dom_id

function DELETEfetchAndDisplayStaticContent(url, dom_id) {
    return new Promise((resolve, reject) => {
        console.debug("fetchAndDisplayStaticContent()");
        console.debug("place ", url);
        console.debug("on ", dom_id);

        try {
            // Security measure 1
            // only accept URLs matching a specific pattern - URLs pointing to a subset of local files
            const notespage = new RegExp(/^\.\.\/fragments\//);
            console.debug(notespage.test(url));
            if (notespage.test(url)) {
                fetch(url)
                .then(response => response.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');

                    console.debug(doc.body);

                    // Security measure 2
                    // Remove script tags
                    const scripts = doc.querySelectorAll('script');
                    scripts.forEach(script => script.remove());

                    console.debug(doc.body.querySelector('div'));
                    // Append the content to the DOM node with ID 'form'
                    const formElement = document.getElementById(dom_id);
                    console.debug(formElement);
                    if (formElement) {
                        formElement.appendChild(doc.body.querySelector('div'));
                        resolve(); // Resolve the promise here
                    } else {
                        console.error('Element with ID "' + dom_id + '" not found.');
                        reject('Element with ID "form" not found.'); // Reject the promise here
                    }
                })
                .catch(error => {
                    console.error('Error fetching and parsing content:', error);
                    reject(error); // Reject the promise on fetch error
                });
            } else {
                reject('Invalid URL'); // Reject the promise if URL does not match
            }
        } catch (e) {
            console.error(e);
            reject(e);
        }

    });
}




function in_html_macro_replace(distributionlists) {
    var ynInstallationUniqueId = "";
    var xYellownotesSession = "";
   // var distributionlists;
    var data;

    chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]).then(function (result) {
        console.log(result);
        console.log(ynInstallationUniqueId);
        ynInstallationUniqueId = result[plugin_uuid_header_name];
        xYellownotesSession = result[plugin_session_header_name];
        console.log(ynInstallationUniqueId);
        console.log(xYellownotesSession);
        return fetch(server_url + '/api/v1.0/plugin_user_get_public_distribution_list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [plugin_uuid_header_name]: ynInstallationUniqueId,
                [plugin_session_header_name]: xYellownotesSession,
            },
            body: JSON.stringify({
                distributionlistid: distributionlistid
            })
        });
    }).then(response => {
        if (!response.ok) {
            console.log(response);

            // if an invalid session token was sent, it should be removed from the local storage
            if (response.status == 401) {
            } else {
                reject('Network response was not ok');
            }
        } else {
            return response.json();
        }
    }).then(function (resp) {
        data = resp;
        console.debug(data[0]);
        console.debug("calling substituteAttributes");
        substituteAttributes(data[0]);

    });
}


function substituteAttributes(data) {
    console.debug("substituteAttributes().start");
    console.debug(data);
    // Get the HTML content as a string
    let htmlContent = document.documentElement.innerHTML;
//console.debug(htmlContent);
    // Loop through each key-value pair in the data object
    for (const [key, value] of Object.entries(data)) {
        console.debug(key);
        // Create a placeholder string in the form of $$attribute$
        const placeholder = `\\$\\$${key}\\$`;

        console.debug(placeholder);
        // Replace all occurrences of the placeholder with the value
        const regex = new RegExp(placeholder, 'g');
        htmlContent = htmlContent.replace(regex, value);
    }

    // Update the HTML content with the substituted values
    document.documentElement.innerHTML = htmlContent;
}


// call for a html file and inserts the content of this html fil into the DOM at the location of the element with the id dom_id

function fetchAndDisplayStaticContent(url, dom_id, replacements) {
    console.debug("fetchAndDisplayStaticContent().start");
    return new Promise((resolve, reject) => {
        console.debug("place ", url);
        console.debug("on ", dom_id);
        console.debug("wih replacements ", replacements);

        try {
            // Security measure 1
            // only accept URLs matching a specific pattern - URLs pointing to a subset of local files
            const notespage = new RegExp(/^\.\.\/fragments\//);
            console.debug(notespage.test(url));
            if (notespage.test(url)) {
                fetch(url)
                .then(response => response.text())
                .then(html => {
                    const parser = new DOMParser();
                    var new_text = html;
                    if (replacements != null && replacements != undefined){ 
                        new_text = replacePatterns(html, replacements);
                        //console.debug(new_text);
     
                    }else{
     
                    }

                    const doc = parser.parseFromString(new_text, 'text/html');

                    console.debug(doc.body);

                    // Security measure 2
                    // Remove script tags
                    const scripts = doc.querySelectorAll('script');
                    scripts.forEach(script => script.remove());

                    console.debug(doc.body.querySelector('div'));
                    // Append the content to the DOM node with ID 'form'
                    const formElement = document.getElementById(dom_id);
                    console.debug(formElement);
                    if (formElement) {
                        formElement.appendChild(doc.body.querySelector('div'));
                        resolve(); // Resolve the promise here
                    } else {
                        console.error('Element with ID "' + dom_id + '" not found.');
                        reject('Element with ID "form" not found.'); // Reject the promise here
                    }
                })
                .catch(error => {
                    console.error('Error fetching and parsing content:', error);
                    reject(error); // Reject the promise on fetch error
                });
            } else {
                reject('Invalid URL'); // Reject the promise if URL does not match
            }
        } catch (e) {
            console.error(e);
            reject(e);
        }

    });
}

// use this to substitute values in a text string
// the text string is searched for the pattern $$key$ and replaced with the value of the key in the replacements object
// the replacements object is a key-value pair object
function replacePatterns(text, replacements) {
    // Loop through each key-value pair in the replacements object
    for (const [key, value] of Object.entries(replacements)) {
      // Create a regex pattern to match $$key$
      const pattern = new RegExp(`\\$\\$${key}\\$`, 'g');
      // Replace all occurrences of the pattern with the value
      text = text.replace(pattern, value);
    }
    return text;
  }

async function login_logout_action() {
    console.debug("login_logout_action()");
    //con

    let session = await chrome.storage.local.get([plugin_session_header_name]);
    var userid = null;
    console.debug(session);
    try {
        userid = await get_username_from_sessiontoken(session[plugin_session_header_name]);
    } catch (e) {
        console.error(e);
        userid = null;
    }

    console.debug("userid: " + userid);
    if (userid == null) {
        document.querySelectorAll('[name="login_status"]').forEach(element => {
            element.textContent = "Not logged in";
        });
        document.getElementById("loginlogout").innerHTML = '<a href="https://www.yellownotes.cloud/loginpage">login</a>';
    } else if (userid == "DELETED") {
        document.querySelectorAll('[name="login_status"]').forEach(element => {
            element.textContent = "Not logged in";
        });
        document.getElementById("loginlogout").innerHTML = '<a href="https://www.yellownotes.cloud/loginpage">login</a>';
    } else {
        //        document.getElementById("login_status").innerHtml = 'Logged in as: <br\><div style="font-size: 0.5em">' + userid + "</div>";

        document.querySelectorAll('[name="login_status"]').forEach(element => {
            element.textContent = userid;
            element.style["font-size"] = "1.0em";

        });
        document.getElementById("loginlogout").innerHTML = '<a href="https://www.yellownotes.cloud/logout_silent">logout</a>';
    }
}

function getElementPosition(element) {
    if (!element || !element.parentNode) {
        throw new Error("Invalid element or element has no parent");
    }

    let position = 0;
    let currentElement = element;
    while (currentElement.previousElementSibling) {
        position++;
        currentElement = currentElement.previousElementSibling;
    }
    return position;
}

function timestampstring2timestamp(str) {
    console.debug("timestampstring2timestamp: " + str);
    try {
        const year = str.substring(0, 4);
        const month = str.substring(5, 7);
        const day = str.substring(8, 10);
        const hour = str.substring(11, 13);
        const minute = str.substring(14, 16);
        const second = str.substring(17, 19);
        //    var timestamp = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second + "";
        var timestamp = year + "-" + month + "-" + day + " " + hour + ":" + minute;
        console.debug("timestamp: " + timestamp);

        return timestamp;
    } catch (e) {
        console.debug(e);
        return null;
    }
}

function integerstring2timestamp(int) {
    console.debug("integerstring2timestamp: " + int);
    try {
        const year = int.substring(0, 4);
        const month = int.substring(5, 6);
        const day = int.substring(8, 9);
        const hour = int.substring(8, 9);
        const minute = int.substring(10, 11);
        const second = int.substring(12, 13);

        var timestamp = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
        console.debug("timestamp: " + timestamp);

        return timestamp;
    } catch (e) {
        console.debug(e);
        return null;
    }
}

function sortTa(table_name, event) {
    if (function_call_debuging)  console.debug("sortTa().start");
    // console.debug(event);
    // console.debug(event.target);
    // console.debug(event.target.parentNode);
    // console.debug( getElementPosition(event.target.parentNode));
    sortTable(table_name, getElementPosition(event.target.parentNode));
}

// Function to sort the table
function sortTable(table_name, columnIndex) {
    if (function_call_debuging) console.debug("sortTable.start");
    if (function_call_debuging)  console.debug("columnIndex: " + columnIndex);
    if (function_call_debuging)  console.debug("sortTable: " + table_name);

    /*
    sortStates is an array that is preserved inlocalmemory and contains the sort order for up to three columns

    sortStates = [
    sortState = {
    columnIndex: 0,
    sortOrder: 'asc'
    },
    sortState = {
    columnIndex: 1,
    sortOrder: 'desc'
    },
    sortState = {
    columnIndex: 2,
    sortOrder: 'none'
    }
    ]

     */

    const table = document.querySelector('table[name="' + table_name + '"]');
    if (sort_debug) console.debug(table);
    if (sort_debug) console.debug(table.rows);

    let rows = Array.from(table.rows).slice(2); // Ignore the two header rows
    if (sort_debug) console.debug(rows);
    const row_count = rows.length ;
    if (sort_debug) console.debug("row count: " + row_count);

    // Get sort states from local storage or initialize if not present
    let sortStates = JSON.parse(localStorage.getItem(table_name + '_sortStates')) || [];

    var new_sortStates = JSON.parse(localStorage.getItem(table_name + '_new_sortStates')) || [];

    if (sort_debug) console.debug("Initial sortStates: ", JSON.stringify(sortStates));

    // Check if the column is sortable
    const headerCell = table.rows[0].cells[columnIndex];
    if (!headerCell.querySelector("span")) {
        if (sort_debug) console.debug("Column is not sortable.");
        return;
    }
    if (sort_debug) console.debug(headerCell);
    if (sort_debug) console.debug(headerCell.querySelector("span"));
    if (sort_debug) console.debug(headerCell.querySelector("span").textContent);
    const currentSortSymbol = headerCell.querySelector("span").textContent;
    var currentSortDirection = "";
    if (sort_debug)  console.debug("currentSortSymbol: ", currentSortSymbol);
    // update the sort state on the current column
    if (currentSortSymbol === "▶") {
        currentSortDirection = "none";
        if (sort_debug)   console.debug("setting sortorder for current column to: " + currentSortDirection);
        //headerCell.querySelector("span").textContent = "▲";
    } else if (currentSortSymbol === "▲") {
        currentSortDirection = "asc";
        if (sort_debug)   console.debug("setting sortorder for current column to: " + currentSortDirection);
        //headerCell.querySelector("span").textContent = "▼";
    } else {
        currentSortDirection = "desc";
        if (sort_debug)   console.debug("setting sortorder for current column to: " + currentSortDirection);
        //headerCell.querySelector("span").textContent = "▶";
    }

    // clicking on the sort icon will toggle the sort order
    // depending on the current setting, set the new sort order - and update the icon accordinly
    var primarySortOrder = "";
    if (currentSortDirection === 'asc') {
        primarySortOrder = 'desc';
    } else if (currentSortDirection === 'desc') {
        primarySortOrder = 'none';

    } else {
        primarySortOrder = 'asc';
    }
    // the sort order has been (refreshed)set, now update the icon
    console.debug("primarySortOrder: ", primarySortOrder);
    console.debug(headerCell.querySelector("span"));
    if (primarySortOrder === 'asc') {
        if (sort_debug)  console.debug("▲");
        // headerCell.querySelector("span").innerHTML = "▲";
    } else if (primarySortOrder === 'desc') {
        // headerCell.querySelector("span").textContent = "▼";
        if (sort_debug)  console.debug("▼");

    } else {
        if (sort_debug) console.debug("--");
        try {
            if (sort_debug)  console.debug(table.rows[0].cells[columnIndex].querySelector("span").textContent);
            //   table.rows[0].cells[columnIndex].querySelector("span").textContent = "▶";
            if (sort_debug)  console.debug(table.rows[0].cells[columnIndex].querySelector("span").textContent);
            // headerCell.querySelector("span").innerHTML = "▶";
            if (sort_debug)   console.debug(table.rows[0].cells[columnIndex].querySelector("span").textContent);
        } catch (e) {
            console.error(e);
        }
    }
    // update the sort icon
    headerCell.querySelector("span").textContent = primarySortOrder === 'asc' ? "▲" : primarySortOrder === 'desc' ? "▼" : "▶";

    // if the current sort column is updates to asc or desc add it to the list of current sort columns.
    // if it is not on the list already, and if it is already on the list, remove the previous entry

    //console.debug("sortStates: ", sortStates);
    //console.debug("new_sortStates: ", new_sortStates);
    //console.debug("is current column index present in sortStates: ", new_sortStates.some(sortState => sortState.columnIndex === columnIndex));
    // if current column is present in the sortStates array, remove it
    // this is the way to remove all sorting - by setting the sort order to none on any column that has it set to asc or desc
    if (new_sortStates.some(sortState => sortState.columnIndex === columnIndex)) {
        new_sortStates = new_sortStates.filter(entry => entry.columnIndex !== columnIndex);
    }
    // if the current column is set to asc or desc, add it to the top of the list
    if (primarySortOrder !== 'none') {
        new_sortStates.unshift({
            columnIndex: columnIndex,
            sortOrder: primarySortOrder
        });
    }
    // Ensure we only keep the top 1 of entries
    // this has been created to be able to surt on multipl columns, but the functionality is not yet fully implemented
    if (new_sortStates.length > 1 ){
        new_sortStates = new_sortStates.slice(0, 1);
    }
    if (sort_debug) console.debug(new_sortStates);

    if (sort_debug) console.debug("col count: ", table.rows[0].cells.length);
    // refresh the sort icons across all columns to fit with the values in the new_sortStates array, and setting any columns not mention to the detault value of "▶" no sorting
 try{
        console.debug(table.rows[0]);
     // loop across the columns and set and reset the sort icon for each column
    for (let i = 0; i < table.rows[0].cells.length; i++) {
        //console.debug("setting sort icon for column: ", i);0
        const cell = table.rows[0].cells[i];
        const span = cell.querySelector("span");
        if (span) {
            const sortState = new_sortStates.find(entry => entry.columnIndex === i);
            if (sortState) {
                span.textContent = sortState.sortOrder === 'asc' ? "▲" : "▼";
            } else {
               // console.debug("setting default sort icon for column: ", i);
                span.textContent = "▶";
            }
        }
    }
 }catch(h){
console.error(h);
    }
    localStorage.setItem(table_name + '_new_sortStates', JSON.stringify(new_sortStates));

    const isColumnIndexPresent = new_sortStates.some(sortState => sortState.columnIndex === 4);

    // Function to get cell value based on sort type
    function getCellValue(row, columnIndex, sortType) {
        const cell = row.cells[columnIndex];
        if (sortType === "selectCaseExact") {
            return cell.querySelector('select').value;
        }else if (sortType === "stringCaseIgnore") {
            return cell.innerText.toLowerCase();

        }
        return cell.innerText;
    }
    // Itterate through all entries in the new_sortStates array and sort the table accordingly
    // Start with the last entry in the array, and work your way to the first entry. The first entry being the last sort column added and must have the highest priority sort (meaning the last sort )
    // The last entry in the array is the first sort column added , and not yet bumped, and must have the lowest priority sort (meaning the first sort)

    let sortedRows;
console.debug("new_sortStates count: ", new_sortStates.length);
    for (let i = new_sortStates.length - 1; i >= 0; i--) {
        const sortState = new_sortStates[i];
        if (sort_debug) console.debug("sortState: ", sortState);
        const columnIndex = sortState.columnIndex;
        const sortOrder = sortState.sortOrder;
        if (sort_debug) console.debug("columnIndex: ", columnIndex);
        if (sort_debug)  console.debug("sortOrder: ", sortOrder);

        // type of sort - default is case-sensitive alphabetical
        if (sort_debug)  console.debug(rows);
        if (sort_debug)  console.debug(new_sortStates);

        // Perform sorting based on sort states
        sortedRows = rows.sort((rowA, rowB) => {
                for (let entry of new_sortStates) {
                    console.debug(entry);
                    const sortType = table.rows[0].cells[entry.columnIndex].getAttribute("sort_type") || "stringCaseExact";
                    const cellA = getCellValue(rowA, entry.columnIndex, sortType);
                    const cellB = getCellValue(rowB, entry.columnIndex, sortType);
                    if (sort_debug)  console.debug("sortType: " +sortType + " " + cellA + " " + cellB);
                    let comparison = 0;
                    if (sortType === "stringCaseExact") {
                        comparison = cellA.localeCompare(cellB);
                        if (sort_debug)  console.debug("comparison: " + comparison);
                    } else if (sortType === "stringCaseIgnore") {
                        comparison = cellA.toLowerCase().localeCompare(cellB.toLowerCase());
                    } else if (sortType === "selectCaseExact") {
                        comparison = cellA.localeCompare(cellB);
                    } else {
                        comparison = cellA.localeCompare(cellB);
                    }

                    if (comparison !== 0) {
                        return entry.sortOrder === 'asc' ? comparison : -comparison;
                    }
                }
                return 0; // If all compared columns are equal
            });

        if (new_sortStates.find(entry => entry.columnIndex === columnIndex).sortOrder === 'desc') {
            sortedRows.reverse();
        }

        if (sort_debug)  console.debug(sortedRows);

        // Remove existing rows (excluding the two header rows)
        while (table.rows.length > 2) {
            table.deleteRow(2);
        }

        // Append sorted rows
        const tbody = table.getElementsByTagName('tbody')[0];
        sortedRows.forEach(row => tbody.appendChild(row));
    }

}

// Function to sort the table based on previously set sort states
// this is essential functionality for the table to look the way the user last left it
// In most cases the user will noly see the yellownotes column and the other columns where the sorted values are more visible, will not be seen.
// To change the default sort the user must make the columns visible, add sorting to them, and then hide them again
function applyExistingSortTable(table_name, new_sortStates) {
   if (function_call_debuging) console.debug("applyExistingSortTable.start");
   if (function_call_debuging)  console.debug("sortTable: " + table_name);

    const table = document.querySelector('table[name="' + table_name + '"]');
    if (sort_debug)  console.debug(table);

    let rows = Array.from(table.rows).slice(2); // Ignore the header rows
    const row_count = table.rows.length - 2;
    if (sort_debug)  console.debug("row count: " + row_count);

    // refresh the sort icons across all columns to fit with the values in the new_sortStates array, and setting any columns not mention to the detault value of "▶" no sorting
    for (let i = 0; i < table.rows[0].cells.length; i++) {
        if (sort_debug)  console.debug("setting sort icon for column: ", i);
        const cell = table.rows[0].cells[i];
        const span = cell.querySelector("span");
        if (span) {
            const sortState = new_sortStates.find(entry => entry.columnIndex === i);
            if (sortState) {
                span.textContent = sortState.sortOrder === 'asc' ? "▲" : "▼";
            } else {
                if(cache_debug)  console.debug("setting default sort icon for column: ", i);
                span.textContent = "▶";
            }
        }
    }

    // Itterate through all entries in the new_sortStates array and sort the table accordingly
    // Start with the last entry in the array, and work your way to the first entry. The first entry being the last sort column added and must have the highest priority sort (meaning the last sort )
    // The last entry in the array is the first sort column added , and not yet bumped, and must have the lowest priority sort (meaning the first sort)

    let sortedRows;

    for (let i = new_sortStates.length - 1; i >= 0; i--) {
        const sortState = new_sortStates[i];
        if (sort_debug)  console.debug("sortState: ", sortState);
        const columnIndex = sortState.columnIndex;
        const sortOrder = sortState.sortOrder;
        if (sort_debug)  console.debug("columnIndex: ", columnIndex);
        if (sort_debug)  console.debug("sortOrder: ", sortOrder);

        // type of sort - default is case-sensitive alphabetical

        // Function to get cell value based on sort type
        function getCellValue(row, columnIndex, sortType) {
            const cell = row.cells[columnIndex];
            if (sortType === "selectCaseExact") {
                return cell.querySelector('select').value;
            }
            return cell.innerText;
        }
        // Perform sorting based on sort states
        sortedRows = rows.sort((rowA, rowB) => {
                for (let entry of new_sortStates) {
                    const sortType = table.rows[0].cells[entry.columnIndex].getAttribute("sort_type") || "stringCaseExact";
                    const cellA = getCellValue(rowA, entry.columnIndex, sortType);
                    const cellB = getCellValue(rowB, entry.columnIndex, sortType);

                    let comparison = 0;
                    if (sortType === "stringCaseExact") {
                        comparison = cellA.localeCompare(cellB);
                    } else if (sortType === "stringCaseIgnore") {
                        comparison = cellA.toLowerCase().localeCompare(cellB.toLowerCase());
                    } else if (sortType === "selectCaseExact") {
                        comparison = cellA.localeCompare(cellB);
                    } else {
                        comparison = cellA.localeCompare(cellB);
                    }

                    if (comparison !== 0) {
                        return entry.sortOrder === 'asc' ? comparison : -comparison;
                    }
                }
                return 0; // If all compared columns are equal
            });

        if (new_sortStates.find(entry => entry.columnIndex === columnIndex).sortOrder === 'desc') {
            sortedRows.reverse();
        }

        // Remove existing rows (excluding the two header rows)
        while (table.rows.length > 2) {
            table.deleteRow(2);
        }

        // Append sorted rows
        const tbody = table.getElementsByTagName('tbody')[0];
        sortedRows.forEach(row => tbody.appendChild(row));
    }

}



// read the  filter from local memory ond place them in the filter row of the table
function updateFilterRow(tableName, filterStorageKey) {
   if(function_call_debuging) console.debug("updateFilterRow.start");
    var table = document.querySelector('table[name="' + tableName + '"]');
    var filtersCols = table.querySelector('tr[name="filter_row"]').querySelectorAll('input, select, textarea');
    console.debug(filtersCols);
    var rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
    filters = JSON.parse(localStorage.getItem(filterStorageKey)) || [];
    console.debug(JSON.stringify(filters));
    // Loop through each filter and place any value found, in the corresponding filter cell
    for (var i = 0; i < filters.length; i++) {
        console.debug(filters[i]);
        if (filters[i]) {
        
        if (filters[i].filterValue) {
            console.debug("filterValue ("+i+")", filters[i].filterValue);
            // set the filter value in the columnIndex column of the filter row in the input of select element
            console.debug(table.querySelector('tr[name="filter_row"]').querySelectorAll('th')[filters[i].columnIndex].querySelector('input, select, textarea'));
            table.querySelector('tr[name="filter_row"]').querySelectorAll('th')[filters[i].columnIndex].querySelector('input, select, textarea').value = filters[i].filterValue; 
    //        filtersCols[filters[i].columnIndex].value = filters[i].filterValue;
        }else{
           // console.debug("no filter value");
        }
        }
    }
}

/*
apply all filters simmultaneously

TO DO. add a swith where the user can chose between whilecard and regexp filters (wildcard default)
and chose to have the filters to be caseinsensitive or not (caseinsensitive default) or not (casesensitive default)
 */

function triggerFilters(table_name) {
   if(function_call_debuging) console.debug("triggerFilters.start");
   if(function_call_debuging) console.debug("table_name: " + table_name);
    try {

        const filterStorageKey = table_name + "_rowFilters";
        console.debug("filterStorageKey: " + filterStorageKey);
      
        console.debug("calling readFiltersFromTable");
        const filters = readFiltersFromTable(table_name);

        // Store the filter settings in local storage
        console.debug("store filters in local storage");
        console.debug("filters: ", JSON.stringify(filters));
        localStorage.setItem(filterStorageKey, JSON.stringify(filters));
        //console.debug(localStorage.getItem(filterStorageKey));
        console.debug("calling applyFilters");
        applyFilters(table_name);

    } catch (e) {
        console.error(e);
    }
}




function readFiltersFromTable(table_name) {
    if (function_call_debuging) console.debug("readFiltersFromTable.start");
    if (function_call_debuging) console.debug("table_name: " + table_name);
    const table = document.querySelector('table[name="' + table_name + '"]');
    //    const filterRow = table.rows[1]; // Second row for filters
    const filterRow = table.querySelector('tr[name="filter_row"]');; // Second row for filters
    if (filter_debug) console.debug(filterRow);
    const filters = [];
    // Read filters from the second row
    for (let i = 0; i < filterRow.cells.length; i++) {
        const cell = filterRow.cells[i];
        //console.debug(cell);
        if (cell.classList.contains("filterableCol")) {
            const filterType = cell.getAttribute("filter_type") || "stringCaseExact";
            if (filter_debug) console.debug("filterType: " + filterType);
            var filterValue = cell.querySelector("input, textarea") ? cell.querySelector("input, textarea").value : "";
            // use the selected from a select element if it is present, and not null
            if (cell.querySelector("select")) {
                filterValue = cell.querySelector("select").value;
            }

            if (filter_debug) console.debug("filterValue: ");
            if (filter_debug)  console.debug(filterValue);
            

            filters.push({
                columnIndex: i,
                filterValue,
                filterType
            });
        } else {
            filters.push(null);
        }
    }
    return filters;
}

// Function to check if a row matches a filter
function matchesFilter(cellValue, filterValue, filterType) {
    if (filter_debug)  console.debug("matchesFilter: cellValue: " + cellValue + " filterValue: " + filterValue + " filterType: " + filterType);
    try {
      if (filter_debug) console.debug("1.0.2");
        if (filterValue === "")
            return true; // No filter applied

        switch (filterType) {
        case "stringCaseExact":
            if (filter_debug) console.debug("1.0.2");
            return (cellValue.indexOf(filterValue) > -1);
        case "stringCaseIgnore":
            if (filter_debug)  console.debug("1.0.2");
            return (cellValue.toLowerCase().indexOf(filterValue.toLowerCase()) > -1);
        case "selectList":
            if (filter_debug) console.debug("1.0.5");
                return (cellValue.toLowerCase().indexOf(filterValue.toLowerCase()) > -1);
        case "checkBox":
                    if (filter_debug) console.debug("1.0.6.0 checkBox");
                    return (( cellValue === true && filterValue === "true") || (cellValue === false && filterValue === "false"));
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
        case "wildcardCaseExactMatch":
            if (filter_debug) console.debug("1.0.2");
            const regexPattern = "^" + filterValue.replace(/\*/g, ".*").replace(/\?/g, ".") + "$";
            return new RegExp(regexPattern).test(cellValue);
        case "regexMatch":
            if (filter_debug) console.debug("1.0.2");
            return new RegExp(filterValue).test(cellValue);
        case "integerNumericRange":
            const intCellValue = parseInt(cellValue, 10);
            if (filterValue.includes("-")) {
                const[min, max] = filterValue.split("-").map(Number);
                if (!isNaN(min) && !isNaN(max)) {
                    return intCellValue >= min && intCellValue <= max;
                } else if (!isNaN(min)) {
                    return intCellValue >= min;
                } else if (!isNaN(max)) {
                    return intCellValue <= max;
                }
            }
            break;
        case "decimalNumericRange":
            if (filter_debug) console.debug("1.0.2");
            const decCellValue = parseFloat(cellValue);
            if (filterValue.includes("-")) {
                const[min, max] = filterValue.split("-").map(Number);
                if (!isNaN(min) && !isNaN(max)) {
                    return decCellValue >= min && decCellValue <= max;
                } else if (!isNaN(min)) {
                    return decCellValue >= min;
                } else if (!isNaN(max)) {
                    return decCellValue <= max;
                }

            }
            break;

        case "datetimeRange":
            if (filter_debug)  console.debug("1.0.2");
            if (filter_debug)  console.debug("calling apply_filter_datetimeRange(cellValue, filterValue)");
            return apply_filter_datetimeRange(cellValue, filterValue);
            break;
        default:
            console.debug("default filter type");
            return true;
        }
        return false;
    } catch (e) {
        console.error(e);
    }
}

function apply_filter_datetimeRange(cellValue, filterValue) {
    const filter_debug = false;
    if (filter_debug) console.debug("apply_filter_datetimeRange.start");
    if (filter_debug) console.debug("cellValue: " + cellValue);
    if (filter_debug) console.debug("filterValue: " + filterValue);
    const dateCellValue = new Date(cellValue);
    if (filter_debug) console.debug(dateCellValue);
    //console.debug((/from .*to */.test(filterValue)));
    /* depending on the filter value, the filter can be a timestamp, a time range, or a time range counting backwards from now

    alt 1
    after 2024-05-20 08:42 and before 2024-07-20 20:40

    alt 2
    after 2024-05-20 20:42 and before Now

    alt 3
    after 2024-06-20 20:42 and for 3 days

    alt 4
    from 3 hrs before to now
    from 1 month before to Now

    alt 5
    from 3 days before to 2024-06-20 20:42
    from 1 month before to 2024-06-20 20:42

    alt 6
    after 2024-07-20 20:42

    alt 7
    before 2024-07-20 20:42

    alt 8
    before Now
    (formally allowed, but is meaningless)
     */

    //  pick the correct processing based on the structure of the filter value

    if (/after  *2.* and  *before  *2/.test(filterValue)) {
        if (filter_debug)  console.debug("Filter alternative 1:  after 2024-05-20 08:42 and before 2024-06-20 20:40");
        if (filter_debug) console.debug(filterValue.match(/after  *(2.*)  *(and before)  *(2.*[0-9 \.\:]*)/));
        if (filter_debug) console.debug(filterValue.match(/after  *(2.*)  *(and before)  *(2.*[0-9 \.\:]*)/)[1].trim());
        if (filter_debug) console.debug(filterValue.match(/after  *(2.*)  *(and before)  *(2.*[0-9 \.\:]*)/)[3].trim());

        const startDate = new Date(filterValue.match(/after  *(2.*)  *(and before)  *(2.*[0-9 \.\:]*)/)[1].trim());
        const endDate = new Date(filterValue.match(/after  *(2.*)  *(and before)  *(2.*[0-9 \.\:]*)/)[3].trim());
        const tsDate = new Date(cellValue);

        return tsDate >= startDate && tsDate <= endDate;
    } else if (/after *and  *before  *[Nn]ow/.test(filterValue)) {
        if (filter_debug) console.debug("Filter alternative 2: after 2024-05-20 20:42 and before Now");
        if (filter_debug) console.debug(filterValue.match(/after  *(2.*)  *and  *before/));
        const startDate = new Date(filterValue.match(/after  *(2.*)  *and  *before/)[1].trim());
        const tsDate = new Date(cellValue);

        return tsDate >= startDate;

    } else if (/after  *2.* and  *for/.test(filterValue)) {

        if (filter_debug) console.debug("Filter alternative 3: after 2024-06-20 20:42 and for 3 days");

        function parseDate(dateString) {
            return new Date(dateString.replace(" ", "T"));
        }

        function addDuration(date, duration, unit) {
            const newDate = new Date(date);
            switch (unit) {
            case 'days':
            case 'day':
                newDate.setDate(newDate.getDate() + duration);
                break;
            case 'months':
            case 'month':
                newDate.setMonth(newDate.getMonth() + duration);
                break;
            case 'hours':
            case 'hour':
                newDate.setHours(newDate.getHours() + duration);
                break;
            }
            return newDate;
        }

        function extractDates(filter) {
            const regexFromFor = /after\s([0-9-:\s]+)\sand\sfor\s(\d+)\s(\w+)/i;
            const regexFromUntil = /after\s([0-9-:\s]+)\sand\suntil\s([0-9-:\s]+)/i;

            let match = filter.match(regexFromFor);

            if (match) {
                const[, startDateString, duration, unit] = match;
                const startDate = parseDate(startDateString.trim());
                const endDate = addDuration(startDate, parseInt(duration), unit.toLowerCase());
                return {
                    startDate,
                    endDate
                };
            }

            match = filter.match(regexFromUntil);

            if (match) {
                const[, startDateString, endDateString] = match;
                const startDate = parseDate(startDateString.trim());
                const endDate = parseDate(endDateString.trim());
                return {
                    startDate,
                    endDate
                };
            } else {
                throw new Error("Invalid filter format");
            }
        }

        function isTimestampInRange(filter, timestamp) {
            const {
                startDate,
                endDate
            } = extractDates(filter);
            const tsDate = new Date(timestamp);

            return tsDate >= startDate && tsDate <= endDate;
        }

        console.debug(isTimestampInRange(filterValue, cellValue));
        return isTimestampInRange(filterValue, cellValue);

    } else if (/from  *.*before .*(to|until)  *[Nn]ow/.test(filterValue)) {
        if (filter_debug)  console.debug("Filter alternative 4: from 3 days before and (to|until) Now");
        function parseRelativeDate(relativeString) {
            const regex = /(\d+)\s(days|day|months|month|hrs|hr|hours|hour)\s(before|to)/i;
            const match = relativeString.match(regex);

            if (match) {
                const value = parseInt(match[1]);
                const unit = match[2].toLowerCase();
                const date = new Date();

                switch (unit) {
                case 'days':
                case 'day':
                    date.setDate(date.getDate() - value);
                    break;
                case 'months':
                case 'month':
                    date.setMonth(date.getMonth() - value);
                    break;
                case 'hrs':
                case 'hr':
                case 'hours':
                case 'hour':
                    date.setHours(date.getHours() - value);
                    break;
                }

                return date;
            } else {
                throw new Error("Invalid relative date format");
            }
        }

        function extractDates(filter) {
            const regex = /from\s(.+)\sand\s(until|to)\s(now)/i;
            const match = filter.match(regex);

            if (match) {
                const[, relativeDateString, untilNow] = match;
                const startDate = parseRelativeDate(relativeDateString.trim());
                const endDate = new Date(); // Now

                return {
                    startDate,
                    endDate
                };
            } else {
                throw new Error("Invalid filter format");
            }
        }

        function isTimestampInRange(filter, timestamp) {
            const {
                startDate,
                endDate
            } = extractDates(filter);
            const tsDate = new Date(timestamp);

            return tsDate >= startDate && tsDate <= endDate;
        }

        if (filter_debug) console.debug(`Filter: ${filterValue.toLowerCase()}, Timestamp: ${cellValue.toLowerCase()}, Result: ${isTimestampInRange(filterValue.toLowerCase(), cellValue.toLowerCase())}`);
        return isTimestampInRange(filterValue.toLowerCase(), cellValue.toLowerCase());

    } else if (/from  *.* before  *(and  *to|to)/.test(filterValue)) {
        if (filter_debug) console.debug("Filter alternative 5: from 3 days before to 2024-06-20 20:42");

        function parseRelativeDate(relativeString, endDate) {
            const regex = /(\d+)\s(days|day|months|month|hrs|hr|hours|hour)\sbefore/i;
            const match = relativeString.match(regex);

            if (match) {
                const value = parseInt(match[1]);
                const unit = match[2].toLowerCase();
                const date = new Date(endDate);

                switch (unit) {
                case 'days':
                case 'day':
                    date.setDate(date.getDate() - value);
                    break;
                case 'months':
                case 'month':
                    date.setMonth(date.getMonth() - value);
                    break;
                case 'hrs':
                case 'hr':
                case 'hours':
                case 'hour':
                    date.setHours(date.getHours() - value);
                    break;
                }

                return date;
            } else {
                throw new Error("Invalid relative date format");
            }
        }

        function extractDates(filter) {
            const regex = /from\s(.+)\sto\s([0-9-:\s]+)/i;
            const match = filter.match(regex);

            if (match) {
                const[, relativeDateString, endDateString] = match;
                const endDate = new Date(endDateString.trim());
                const startDate = parseRelativeDate(relativeDateString.trim(), endDate);
                return {
                    startDate,
                    endDate
                };
            } else {
                throw new Error("Invalid filter format");
            }
        }

        function isTimestampInRange(filter, timestamp) {
            const {
                startDate,
                endDate
            } = extractDates(filter);
            const tsDate = new Date(timestamp);

            return tsDate >= startDate && tsDate <= endDate;
        }

        if (filter_debug) console.log(`Filter: ${filterValue.toLowerCase()}, Timestamp: ${cellValue.toLowerCase()}, Result: ${isTimestampInRange(filterValue.toLowerCase(), cellValue.toLowerCase())}`);
        return isTimestampInRange(filterValue.toLowerCase(), cellValue.toLowerCase());

    } else if (/after  *2/.test(filterValue)) {
        if (filter_debug) console.debug("Filter alternative 6: after 2024-06-20 20:42");
        function parseDate(dateString) {
            return new Date(dateString.replace(" ", "T"));
        }

        function extractDates(filter) {
            const regex = /after\s([0-9-:\s]+)/i;
            const match = filter.match(regex);

            if (match) {
                const startDateString = match[1].trim();
                const startDate = parseDate(startDateString);
                return {
                    startDate
                };
            } else {
                throw new Error("Invalid filter format");
            }
        }

        function isTimestampInRange(filter, timestamp) {
            const {
                startDate
            } = extractDates(filter);
            const tsDate = new Date(timestamp);

            return tsDate >= startDate;
        }

        console.log(`Filter: ${filterValue}, Timestamp: ${cellValue}, Result: ${isTimestampInRange(filterValue.toLowerCase(), cellValue.toLowerCase())}`);

        return isTimestampInRange(filterValue.toLowerCase(), cellValue.toLowerCase());

    } else if (/before  *2/.test(filterValue.toLowerCase())) {
        if (filter_debug) console.debug("Filter alternative 7: before 2024-06-20 20:42");
        function parseDate(dateString) {
            return new Date(dateString.replace(" ", "T"));
        }

        function extractDates(filter) {
            const regex = /before\s([0-9-:\s]+)/i;
            const match = filter.match(regex);

            if (match) {
                const endDateString = match[1].trim();
                const endDate = parseDate(endDateString);
                return {
                    endDate
                };
            } else {
                throw new Error("Invalid filter format");
            }
        }

        function isTimestampInRange(filter, timestamp) {
            const {
                endDate
            } = extractDates(filter);
            const tsDate = new Date(timestamp);

            return tsDate < endDate;
        }

        if (filter_debug)  console.log(`Filter: ${filterValue}, Timestamp: ${cellValue}, Result: ${isTimestampInRange(filterValue, cellValue)}`);

        return isTimestampInRange(filterValue, cellValue);
    } else if (/before  *[Nn]ow/.test(filterValue)) {
        if (filter_debug) console.debug("Filter alternative 8: before Now");
        // Note: this alternative is meaningless
        return true;

    } else{
        if (filter_debug) console.debug("no filter alternative match, accept the data by default");
        return true;
    
    }

}

function applyFilters(table_name) {
  if (filter_debug)   console.debug("applyFilters.start");
  if (filter_debug)  console.debug("table_name: " + table_name);
    try {

        if (filter_debug) console.debug("calling readFiltersFromTable");
        const filters = readFiltersFromTable(table_name);
        if (filter_debug) console.debug("filters: " + JSON.stringify(filters));
        const table = document.querySelector('table[name="' + table_name + '"]');

        // Filter the table rows
        if (filter_debug) console.debug("row count: ", table.rows.length);
        // step through all data rows and determinf if each of them matches the union of the all the filters
        for (let i = 2; i < table.rows.length; i++) { // Start from the third row
            const row = table.rows[i];
            let isRowVisible = true;

            // step through all filter and check if the row matches all of them
            filters.forEach((filter, index) => {
                if (filter_debug)  console.debug("filter: ", filter);
                if (filter_debug)  console.debug("index: ", index);
                if (filter_debug)  console.debug("isRowVisible: ", isRowVisible);
                if (filter && isRowVisible) {
                    var cellValue = row.cells[index].innerText;
                    if (filter.filterType == "checkBox") { 
                        //console.debug("checkBox filter");
                        // if the filter is a checkbox, the value is the value of the checkbox
                        cellValue = row.cells[index].querySelector('input[type="checkbox"]').checked;
                     }
                    if (filter_debug)  console.debug("cellValue: ", cellValue);
                    if (filter_debug)  console.debug("calling: matchesFilter ", filter.filterValue);
                    if (!matchesFilter(cellValue, filter.filterValue, filter.filterType)) {
                        //console.debug("Hiding row " + i);
                        isRowVisible = false;
                    } else {
                        //console.debug("Showing row " + i);
                    }
                }
            });
            row.style.display = isRowVisible ? "" : "none";
        }
    } catch (e) {
        console.error(e);
    }
}

function parseDate(dateString) {
    if (dateString === 'Now') {
        return new Date();
    }

    const regex = /(\d+)(?:\s(months|days|hrs|hr|minutes|minute)\sago)/;
    const match = regex.exec(dateString);

    if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];
        const date = new Date();

        switch (unit) {
        case 'months':
            date.setMonth(date.getMonth() - value);
            break;
        case 'days':
            date.setDate(date.getDate() - value);
            break;
        case 'hrs':
        case 'hr':
            date.setHours(date.getHours() - value);
            break;
        case 'minutes':
        case 'minute':
            date.setMinutes(date.getMinutes() - value);
            break;
        }

        return date;
    }
    return new Date(dateString);
}

function filterTimestamp(filter, timestamp) {
    const[part1, part2] = filter.toLowerCase().split('and').map(s => s.trim());
    const tsDate = new Date(timestamp);
    let startDate = null;
    let endDate = null;

    if (part1.startsWith('from')) {
        startDate = parseDate(part1.replace('from', '').trim());
    } else if (part1.startsWith('before')) {
        endDate = parseDate(part1.replace('before', '').trim());
    } else if (part1.startsWith('after')) {
        startDate = parseDate(part1.replace('after', '').trim());
    }

    if (part2) {
        if (part2.startsWith('until')) {
            endDate = parseDate(part2.replace('until', '').trim());
        } else if (part2.startsWith('for')) {
            const value = parseInt(part2.replace('for', '').trim());
            const unit = part2.split(' ')[2].trim();
            endDate = new Date(startDate);

            switch (unit) {
            case 'months':
                endDate.setMonth(startDate.getMonth() + value);
                break;
            case 'days':
                endDate.setDate(startDate.getDate() + value);
                break;
            case 'hrs':
            case 'hr':
                endDate.setHours(startDate.getHours() + value);
                break;
            case 'minutes':
            case 'minute':
                endDate.setMinutes(startDate.getMinutes() + value);
                break;
            }
        }
    }

    if (startDate && tsDate < startDate) {
        return false;
    }

    if (endDate && tsDate > endDate) {
        return false;
    }

    return true;
}

function filterTableAllColsBACKUP(table_name) {
    console.debug("filterTableAllCols.start (" + table_name + ")  ");

    console.debug(getElementPosition(event.target.parentNode));

    var table = document.querySelector('table[name="' + table_name + '"]');
    console.debug(table);
    // collect all possible filters
    var filtersCols = table.querySelectorAll("thead > tr:nth-child(2) > th[filterableCol]");
    var rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");

    console.debug(filtersCols);

    // Loop through each filter of the table, for every row
    for (var i = 0; i < rows.length; i++) {
        ///  for (var i = 0; i < 1; i++) {
        var showRow = true;
        console.debug("########## row number: ", i, " ##########");
        console.debug(rows[i]);

        // check each cell of the row gainst the corresponding filter for the column, if any has been set
        for (var j = 0; j < filtersCols.length; j++) {

            // multiple types of filers are supported
            const filterType = filtersCols[j].getAttribute("filtertype");
            console.debug("column number  ", j, " filter type: ", filterType);

            //          if (filtersCols[j].tagName == "SELECT" && filtersCols[j].getAttribute("filtertype") == "checkedmatch") {
            if (filterType == "checkedmatch") {
                console.debug("match type: checkedmatch");
                // filter on whether or not a checkbox has been checked
                // is there a filter value set ?

                // which column is the filter for ?
                const col = getElementPosition(filtersCols[j]);
                console.debug("filter on col: ", col);

                var comparingCol = filtersCols[j].parentNode.getAttribute("colindex");
                console.debug(getElementPosition(filtersCols[j]));
                console.debug(getElementPosition(filtersCols[j].parentNode));
                console.debug(getElementPosition(filtersCols[j].parentNode.parentNode));

                var cell = rows[i].getElementsByTagName("td")[j];
                console.debug(cell);
                if (cell) {
                    //console.debug(cell.querySelector('input[type="checkbox"]'));
                    var isChecked = cell.querySelector('input[type="checkbox"]').checked;
                    //console.debug("isChecked: " + isChecked);
                    var filterValue = filtersCols[j].value;
                    console.debug("filterValue: " + filterValue + " isChecked: " + isChecked);
                    if (filterValue === "active" && !isChecked ||
                        filterValue === "inactive" && isChecked) {
                        console.debug("# hide this row");
                        showRow = false;
                        break; // Exit the loop if any filter condition fails, there is no need to check the remaining filters for this row
                    } else {
                        console.debug("# show this row");
                    }
                }
            } else if (filtersCols[j].value && filterType == "selectmatch") {
                console.debug("match type: selectmatch");
                // filter on whether or not a checkbox has been checked


                // which column is the filter for ?
                const col = getElementPosition(filtersCols[j]);
                console.debug("filter on col: ", col);

                var cell = rows[i].getElementsByTagName("td")[j];
                console.debug(cell);
                if (cell) {
                    console.debug(cell.getElementsByTagName("select"));

                    var selectElement = cell.getElementsByTagName("select")[0];
                    var selectedText = selectElement.options[selectElement.selectedIndex].text;

                    // Log the selected text to the console or return it from the function
                    console.debug('Currently selected text:', selectedText);

                    console.debug(cell.getElementsByTagName("select")[0].value);
                    //var isChecked = cell.querySelector('input[type="checkbox"]').checked;
                    //console.debug("isChecked: " + isChecked);
                    var filterValue = filtersCols[j].value;
                    console.debug("filterValue: " + filterValue + " selectedText: " + selectedText);

                    var regex = new RegExp(escapeRegex(filterValue), "i");
                    console.debug("Is cell content \"" + cell.textContent.trim() + '" matching regex: ' + regex);
                    // Test the regex against the cell content - if a match, keep the row visible
                    if (regex.test(selectedText.trim())) {
                        console.debug("# show this row")
                    } else {
                        console.debug("# hide this row");
                        showRow = false;
                        break; // Exit the loop if any filter condition fails, there is no need to check the remaining filters for this row
                    }
                }

            } else {
                console.debug("match type: default match: wildcard match: " + filtersCols[j].value);
                try {
                    // which column is the filter for ?
                    // there may be fewer filters than columns
                    const col = getElementPosition(filtersCols[j]);
                    console.debug("filter on col: ", col);

                    filterValue = filtersCols[j].querySelector("[filterContent]").value;
                    console.debug("filter with value: ", filterValue);

                    // Only process the filter if a value has been entered for it
                    if (filterValue) {
                        
                        var cell = rows[i].getElementsByTagName("td")[col];
                        console.debug(cell);
                        if (cell) {
                            //var filterValue = filtersCols[j].value;
                            var regex = new RegExp(escapeRegex(filterValue), "i");
                            console.debug("is cell content \"" + cell.textContent.trim() + '" matching regex: ' + regex);
                            // Test the regex against the cell content
                            if (regex.test(cell.textContent.trim())) {
                                console.debug("# show this row")
                            } else {
                                console.debug("# hide this row");
                                showRow = false;
                                break; // Exit the loop if any filter condition fails, there is no need to check the remaining filters for this row
                            }
                        }
                    } else {
                        console.debug("no filter value");
                    }
                } catch (e) {
                    console.debug(e);
                }
            }
        }
        // Show or hide the row based on the filter results
        rows[i].style.display = showRow ? "" : "none";
    }
}

// call to the API to determine authentication status
function getStatusValue(url, header1, value1, header2, value2) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'GET',
            headers: {
                [header1]: value1,
                [header2]: value2
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.status) {
                resolve(data.status);
            } else {
                reject(new Error('Status object not found in the response'));
            }
        })
        .catch(error => {
            reject(error);
        });
    });
}

// the session token is not completed as yet
function DELETEget_username_from_sessiontoken(token) {

    console.debug("get_username_from_sessiontoken()");
    console.debug(token);

    if (token == null) {
        return null;
    } else {
        try {

            // Example usage
            //const token = 'your_jwt_token'; // Replace with your JWT token
            const claimNames = ['userid', 'brand']; // Replace with the claims you want to extract
            const claims = getClaimsFromJwt(token, claimNames);

            console.debug(claims);
            return (claims.userid);
        } catch (e) {
            console.error(e);
            return null;
        }
    }
}

function safeParseInnerHTML(rawHTML, targetElementName) {

    // list of acceptable html tags

    // list of unacceptable html tags
    const unaccep = ["script"];

    unaccep.forEach(function (item, index) {
        console.debug(item);
    });

    const container = document.createElement(targetElementName);
    // Populate it with the raw HTML content
    container.innerHTML = rawHTML;

    return container;
}

function utf8_to_b64(str) {
    console.debug("utf8_to_b64(" + str + ")");
    try {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
                return String.fromCharCode('0x' + p1);
            }));
    } catch (e) {
        console.error(e);
        return null;
    }
}

function b64_to_utf8(str) {
    console.debug("b64_to_utf8(" + str + ")");
    try {
        return decodeURIComponent(Array.prototype.map.call(atob(str), function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
    } catch (e) {
        console.error(e);
        return null;
    }
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

function parseJwt(token) {
    console.debug("parseJwt(" + token + ") ");

    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Invalid token:', e);
        return null;
    }
}

/*
// Example usage
const token = 'your_jwt_token'; // Replace with your JWT token
const claimNames = ['sub', 'email']; // Replace with the claims you want to extract
const claims = getClaimsFromJwt(token, claimNames);
console.debug(claims);
 */
function getClaimsFromJwt(token, claimNames) {
    const decodedToken = parseJwt(token);
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

function getNotShowByDefaultColumns(key, defaultValue) {
    console.debug("getNotShowByDefaultColumns: " + key  );
    console.debug(defaultValue);
  try{
    let value = localStorage.getItem(key);
            console.debug("reading (from key " + key + "): " + value);
            console.debug(value);
            if (value === null) {
                console.debug("setting the default value of which columns should be hidden.");
                // Apply the default value if nothing have been set
                localStorage.setItem(key, JSON.stringify(defaultValue));

                value = JSON.stringify(defaultValue);
                console.debug("setting: " + value);
            }
            console.debug("returning: " + value);
            // Parse the value to return as an array
            return JSON.parse(value);
        } catch (error) {
            return defaultValue;
        }
}


function getNotShowByDefaultColumns_asynch(key, defaultValue) {
    console.debug("getNotShowByDefaultColumns: " + key + " " + defaultValue);
    return new Promise((resolve, reject) => {
        try {
            //const key = 'name_not_show_by_default_columns';
            let value = localStorage.getItem(key);
            console.debug("reading (from key " + key + "): " + value);
            console.debug(value);
            if (value === null) {
                console.debug("setting the default value of which columns should be hidden.");
                // Apply the default value if nothing have been set
                localStorage.setItem(key, JSON.stringify(defaultValue));

                value = JSON.stringify(defaultValue);
                console.debug("setting: " + value);
            }
            console.debug("returning: " + value);
            // Parse the value to return as an array
            resolve(JSON.parse(value));
        } catch (error) {
            reject(error);
        }
    });
}


/*
 * use by the procedure that persis which columns are to be display in tables
 *
 */
function modifyNotShowByDefaultColumns(value, action, key) {
    console.debug("modifyNotShowByDefaultColumns: value=" + value + " action=" + action + " key=" + key);
    return new Promise((resolve, reject) => {
        try {
            //const key = 'name_not_show_by_default_columns';
            let storedValue = localStorage.getItem(key);

            if (storedValue === null) {
                // Initialize with an empty array if not set
                storedValue = [];
            } else {
                storedValue = JSON.parse(storedValue);
            }
            console.debug("reading: " + storedValue);
            if (action === "set") {
                // Add the value if it's not already present
                if (!storedValue.includes(value)) {
                    storedValue.push(value);
                    console.debug("setting new: " + storedValue);
                    console.debug(storedValue);
                    localStorage.setItem(key, JSON.stringify(storedValue));
                }
            } else if (action === "unset") {
                // Remove the value if it is present
                const index = storedValue.indexOf(value);
                if (index !== -1) {
                    storedValue.splice(index, 1);
                    console.debug("setting new: " + storedValue);
                    console.debug(storedValue);
                    localStorage.setItem(key, JSON.stringify(storedValue));
                }
            }
            console.debug(storedValue);
            resolve(storedValue);
        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
}


// create the URL that when clicked on adds the user to the distribution list
// append a redirecturi that redicts the the page showing the distribution list

function createNoteShareLink(datarow) {
    console.debug("createNoteShareLink (datarow)");
    console.debug(datarow);

    // link must make the user subscribe to the feed the note belongs to, before directing the user to the note.
    // if the feed/distributionlist allowd anonymous access, the unknown/unauthenticated user will be directed to the note directly after subscribing to the feed

    // first part of the URL is the one to invite the user to subscribe to the feed of which the note is a part

    // the second part is to redirect to displaying  the note in the location where it is attached (the "gothere" functionality)

    // noteid
    // distributionlistid
    // url


    const userid = "";
    console.debug("go to url: " + datarow.url);

    const noteid = datarow.noteid;

    console.debug("go lookup noteid: " + noteid);

    console.debug(document.querySelector('tr[noteid="' + noteid + '"]'));

    const url = document.querySelector('tr[noteid="' + noteid + '"]').querySelector('[name="url"]').textContent.trim();
    console.debug(url);

    var textToCopy;
    var distributionlistid;
    try {

        distributionlistid = document.querySelector('tr[noteid="' + noteid + '"]').querySelector('[name="distributionlistid"]').value.trim();
        console.debug(distributionlistid);
        const redirectUri = encodeURIComponent("/pages/gothere.html?noteid=" + noteid);
        textToCopy = "https://www.yellownotes.cloud/pages/subscribe.html?add_feedid=" + distributionlistid + "&redirecturi=" + redirectUri;
    } catch (e) {
        console.debug(e);
        textToCopy = "https://www.yellownotes.cloud/pages/gothere.html?noteid=" + noteid;
    }

    // place the url value in the clipboard
    // navigator.clipboard.writeText(textToCopy).then(() => {
    //     console.debug('Invitation URL copied to clipboard: ' + textToCopy);
    //}).catch(err => {
    //     console.error('Error in copying text: ', err);
    // });
    return textToCopy;
}


// create the URL that when clicked on adds the user to the distribution list
// append a redirecturi that redicts the the page showing the distribution list

function createShareableGoThereLink(noteid, distributionlistid) {
    console.debug("createShareableGoThereLink (datarow)");
    console.debug(noteid);

    // link must make the user subscribe to the feed the note belongs to, before directing the user to the note.
    // if the feed/distributionlist allowd anonymous access, the unknown/unauthenticated user will be directed to the note directly after subscribing to the feed

    // first part of the URL is the one to invite the user to subscribe to the feed of which the note is a part

    // the second part is to redirect to displaying  the note in the location where it is attached (the "gothere" functionality)

    // noteid
    // distributionlistid
    // url

var textToCopy
   
    try {

        const redirectUri = encodeURIComponent("/pages/gothere.html?noteid=" + noteid);
        textToCopy = "https://www.yellownotes.cloud/pages/subscribe.html?add_feedid=" + distributionlistid + "&redirecturi=" + redirectUri;
    } catch (e) {
        console.debug(e);
        textToCopy = "https://www.yellownotes.cloud/pages/gothere.html?noteid=" + noteid;
    }

    // place the url value in the clipboard
    // navigator.clipboard.writeText(textToCopy).then(() => {
    //     console.debug('Invitation URL copied to clipboard: ' + textToCopy);
    //}).catch(err => {
    //     console.error('Error in copying text: ', err);
    // });
    return textToCopy;
}


function toggleColumn(columnName, isChecked, tableName, table_columns_to_not_display_keyname) {
    console.debug("toggleColumn.start: " + columnName + " isChecked: " + isChecked, " in table name=" + tableName + " with local storage keyname: " + table_columns_to_not_display_keyname);
    //var table = document.getElementById("dataTable");
    var table = document.querySelector('table[name="' + tableName + '"]');
    // find out which column (and index) that has the name columnName
    var col = table.querySelector('thead tr:nth-child(1)').querySelector('[name = "' + columnName + '"]');
    console.debug(col);
    const columnIndex = getElementPosition(col);
    console.debug("column to hide:", columnIndex);
    if (!isChecked) {
        modifyNotShowByDefaultColumns(columnName, 'set', table_columns_to_not_display_keyname).then(updatedArray => {
            //console.debug(updatedArray);
        }).catch(error => {
            console.error('Error:', error);
        });
        // carryout the hiding of the column, based on the column index value using the "hidden" class
        table.querySelectorAll(':scope > * > tr').forEach(row => {
            //console.debug(row);
            try {
              //  console.debug(row.cells[columnIndex].classList);
                row.cells[columnIndex].classList.add("hidden");
            } catch (e) {
                row.cells[columnIndex].class = "hidden";
                console.error(e);
            }
        });
        //hideColumn(columnName, true, tableName);

    } else {
        // To remove a value from the supression list
        modifyNotShowByDefaultColumns(columnName, 'unset', table_columns_to_not_display_keyname).then(updatedArray => {
           // console.debug(updatedArray);
        }).catch(error => {
            console.error('Error:', error);
        });
       // carryout the un-hiding of the column, based on the column index value removing the "hidden" class
       table.querySelectorAll(':scope > * > tr').forEach(row => {
        //console.debug(row);
        try {
            //console.debug(row.cells[columnIndex].classList);
            row.cells[columnIndex].classList.remove("hidden");
        } catch (e) {
            //row.cells[columnIndex].class = "hidden";
            console.error(e);
        }
    });
    }

}


function hideColumn(columnName, hide, tableName) {
    console.debug("hideColumn.start: " + columnName + " isChecked: " + hide, " in table name=" + tableName  );
    //var table = document.getElementById("dataTable");
    var table = document.querySelector('table[name="' + tableName + '"]');
    // find out which column has the name columnName

    var col = table.querySelector('thead tr:nth-child(1)').querySelector('[name = "' + columnName + '"]');
    console.debug(col);
    const columnIndex = getElementPosition(col);
    console.debug("column to hide:", columnIndex);
    if (hide) {
            //console.debug(updatedArray);
        // loop over all rows and hide this column
        table.querySelectorAll('tr[selectablecol="true"]').forEach(row => {
            console.debug(row);
            try {
                console.debug(row.cells[columnIndex].classList);

                row.cells[columnIndex].classList.add("hidden");
            } catch (e) {
                row.cells[columnIndex].class = "hidden";
                console.error(e);
            }
            // add column to supression list
            console.debug("hidden column: " + columnName);

        });

    } else {
        table.querySelectorAll('tr[selectablecol="true"]').forEach(row => {

            //  console.debug(row);
            // console.debug(row.cells[columnIndex].classList);
            row.cells[columnIndex].classList.remove("hidden");

        });

    }

}



/**
 *  setup special handling for creating correctly fomated filter for the filter boxes for columns contianing dates
 *
 *
 * The filter is meant to apear human-readable, and the user should be able to enter a date or a time range in the filter box. But typing in directly is also possible.
 *
 * Alt 1: From timestamp to timestamp

 * Syntax
 * from <timestamp> and until <timestamp>
 *
 * Example
 * from 2024-05-20 20:42 and until 2024-06-20 20:42
 *
 *
 * Alt 2: From timestamp to Now
 *
 * Syntax
 * from <timestamp> and until Now
 *
 * Example
 * from 2024-06-20 20:42 and until Now

 *
 * Alt 3: From timestamp and a duration forwards
 *
 * Syntax
 * from <timestamp> and until <integer> <unit of time> forwards
 *
 * Example
 * from 2024-06-20 20:42 and until 3 days forwards
 *
 *
 * Alt 4: For a period of time forward to Now
 *
 * Syntax
 * from <integer> <unit of time> ago and until Now
 *
 * Example
 * from 3 days ago and until Now
 *
 * Alt 5: For a period of time forward to timestamp
 *
 * Syntax
 * from <integer> <unit of time> ago and until <timestamp>
 *
 * Example
 * from 3 days ago and until 2024-06-20 20:42
 *
 *

 * @param {
 * } input_field_id
 */
function setTimeRangeFilterDialog(input_field_id, dialog_id) {
    if (filter_debug) console.debug("setTimeRangeFilterDialog.start (" + input_field_id + ", " + dialog_id + ")");
    const inputField = document.getElementById(input_field_id);
    const dialog = document.getElementById(dialog_id);
    if (filter_debug) console.debug(dialog);
    //console.debug(dialog.outerHTML);
    const closeIcon = dialog.querySelector('.close');
    if (filter_debug) console.debug(closeIcon);
    const okButton = dialog.querySelector('[name="ok-button"]');
    if (filter_debug) console.debug(okButton);
    const fromSpecificTimeRadio = dialog.querySelector('[id_name="from-specific-time-radio"]');
    if (filter_debug) console.debug(fromSpecificTimeRadio);
    const fromLengthOfTimeRadio = dialog.querySelector('[id_name="from-length-of-time-radio"]');
    const toSpecificTimeRadio = dialog.querySelector('[id_name="to-specific-time-radio"]');
    const toLengthOfTimeRadio = dialog.querySelector('[id_name="to-length-of-time-radio"]');
    const toNowRadio = dialog.querySelector('[id_name="to-now-radio"]');
    const fromSpecificTime = dialog.querySelector('[name="from-specific-time"]');
    var fromLengthOfTime = dialog.querySelector('[name="from-length-of-time"]');
    var toSpecificTime = dialog.querySelector('[name="to-specific-time"]');
    var toLengthOfTime = dialog.querySelector('[name="to-length-of-time"]');
    var fromDatetime = dialog.querySelector('[name="from-datetime"]');
    var toDatetime = dialog.querySelector('[name="to-datetime"]');
    var fromHour = dialog.querySelector('[name="from-hour"]');
    var fromMinute = dialog.querySelector('[name="from-minute"]');
    var fromIntervalNumber = dialog.querySelector('[name="from-interval-number"]');
    var fromIntervalUnit = dialog.querySelector('[name="from-interval-unit"]');
    var toHour = dialog.querySelector('[name="to-hour"]');
    var toMinute = dialog.querySelector('[name="to-minute"]');
    var toIntervalNumber = dialog.querySelector('[name="to-interval-number"]');
    var toIntervalUnit = dialog.querySelector('[name="to-interval-unit"]');

    const getCurrentDatetime = () => {
        const now = new Date();
        return now.toISOString().slice(0, -1);
    };

    // pre-clear all fields

    //toLengthOfTime = "";
    //toIntervalNumber = "";
    toIntervalUnit = "";
    //fromIntervalNumber = "";
    //fromIntervalUnit = "";

    /* parse the input value and map to the various fields of the dialog

    alt 1
    after 2024-05-20 08:42 and before 2024-07-20 20:40

    alt 2
    after 2024-05-20 20:42 and before Now

    alt 3
    after 2024-06-20 20:42 and for 3 days

    alt 4
    from 3 hrs before and to now
    from 1 month before and to Now

    alt 5
    from 3 days before and to 2024-06-20 20:42
    from 1 month before and to 2024-06-20 20:42

    alt 6
    after 2024-07-20 20:42

    alt 7
    before 2024-07-20 20:42

    alt 8
    before Now

     */
    const parseInputValue = (value) => {
        console.debug("parseInputValue.start");
        //if (value.includes(' and ')) {

        console.debug("value: " + value);
        // divide into from and to values
        var[fromValue, toValue] = value.split(' and ');
        console.debug("fromValue: " + fromValue + " toValue: " + toValue);
        var fromDurationNumeric,
        fromDurationUnit,
        toDurationNumeric,
        toDurationUnit;
        var fromYear,
        fromMonth,
        fromDay,
        fromHour,
        fromMinute,
        toYear,
        toMonth,
        toDay,
        toHour,
        toMinute;

        // process the from-values
        // from value start with either from or after
        // if it begins with "from" the values is a time span
        // if it begins with "after" it is a timetamp

        if (value.includes('from ')) {
            if (filter_debug) console.debug("fromValue: " + fromValue);
            // is a time span
            // alt 4, alt 5
            try {
                // does it end in a timestamp or in "Now"
                if (fromValue.includes('before')) {
                    [fromValue, toValue] = value.split(' before ');
                    console.debug("fromValue: " + fromValue + " toValue: " + toValue);
                    // from duration

                    fromSpecificTimeRadio.checked = false;
                    fromLengthOfTimeRadio.checked = true;

                    //toLengthOfTimeRadio.checked = true;
                    // does the to-part of the filter end in a timestamp or in a "Now"

                    if (toValue.toLowerCase().includes(' now')) {
                        // timeinterval to now
                        // now simply means having no ending timestamp
                        // populate the form with the values
                        //fromDatetime.value = fromValue;
                        //toDatetime.value = '';
                        fromDatetime.value = fromValue;
                        toDatetime.value = '';

                        fromDurationNumeric = parseInt(fromValue.match(/from (.*)(hr|day|month)[s]*/)[1].trim(), 10);
                        fromDurationUnit = fromValue.match(/from (.*)(hr|day|month)[s]*/)[2].trim();
                        // place the values in to the dialog form
                        console.debug(dialog);
                        dialog.querySelector('[name="from-interval-unit"]').querySelector('option[value="' + fromDurationUnit + '"]').selected = true;
                        dialog.querySelector('[name="from-interval-number"]').value = fromDurationNumeric;

                        toSpecificTimeRadio.checked = false;
                        toLengthOfTimeRadio.checked = false;
                        toNowRadio.checked = true;
    

                    } else {
                        // time-interval to actual timestamp
                        fromDurationNumeric = parseInt(fromValue.match(/from (.*)(hr|day|month)[s]*/)[1].trim(), 10);
                        fromDurationUnit = fromValue.match(/from (.*)(hr|day|month)[s]*/)[2].trim();
                        // place the values in to the dialog form
                        dialog.querySelector('[name="from-interval-unit"]').querySelector('option[value="' + fromDurationUnit + '"]').selected = true;
                        dialog.querySelector('[name="from-interval-number"]').value = fromDurationNumeric;

                        const toTimestamp = toValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/);
                        if (filter_debug)  console.debug(toTimestamp);
                        toYear = parseInt(toValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[1], 10);
                        toMonth = parseInt(toValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[2], 10);
                        toDay = parseInt(toValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[3], 10);
                        toHour = parseInt(toValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[4], 10);
                        toMinute = parseInt(toValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[5], 10);
                        console.debug("toYear: " + toYear + " toMonth: " + toMonth + " toDay: " + toDay + " toHour: " + toHour + " toMinute: " + toMinute);

                        const t = formatDatetimeForInput(new Date(toYear, toMonth - 1, toDay, toHour, toMinute));
                        if (filter_debug) console.debug(t);
                        toDatetime.value = t ? new Date(t).toISOString().slice(0, -1) : '';

                        toSpecificTimeRadio.checked = true;
                        toLengthOfTimeRadio.checked = false;
                        toNowRadio.checked = false;

                    }

                    //console.debug(fromValue.match(/from (.*)(hr|day|month)[s]* before.*/));
                    //fromDurationNumeric = parseInt(fromValue.match(/from (.*)(hr|day|month)[s]* before.*/)[1].trim(), 10);
                    //fromDurationUnit = fromValue.match(/from (.*)(hr|day|month)[s]* before.*/)[2].trim();
                    // place the values in to the dialog form
                    //fromHour.value = fromDurationNumeric;
                    //console.debug("fromDurationNumeric: " + fromDurationNumeric + " fromDurationUnit: " + fromDurationUnit);
                    //document.getElementById("from-interval-unit").querySelector('option[value="' + fromDurationUnit + '"]').selected = true;
                    //document.getElementById("from-interval-number").value = fromDurationNumeric;
                    //console.debug(fromIntervalNumber);
                    //console.debug(fromDurationNumeric);
                    //fromIntervalNumber.value = fromDurationNumeric;

                } else {
                    // error: all "from" contanining values should also contain "before"
                    if (filter_debug) console.error("Error: all 'from' contanining values should also contain 'before'");
                    // from timestamp
                    fromYear = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[1], 10);
                    fromMonth = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[2], 10);
                    fromDay = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[3], 10);
                    fromHour = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[4], 10);
                    fromMinute = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[5], 10);
                    fromValue = fromValue.replace('from ', '');
                }
            } catch (e) {
                console.error(e);
            }
        } else if (value.includes('after ')) {
            // from timestamp
            fromSpecificTimeRadio.checked = true;
            fromLengthOfTimeRadio.checked = false;

            [fromValue, toValue] = value.split(' and ');
            console.debug("fromValue: " + fromValue + " toValue: " + toValue);

            // an "after" must be follow by a timestamp, which leaves four different options for
            /*

            alt 1
            after 2024-05-20 08:42 and before 2024-07-20 20:40

            alt 2
            after 2024-05-20 20:42 and before Now

            alt 3
            after 2024-06-20 20:42 and for 3 days

            alt 6
            after 2024-07-20 20:42
             */
            console.debug("1.4.2");
            try {
                if (filter_debug) console.debug(" input_field_ide: " + input_field_id);
                // alt 1:  after 2024-05-20 08:42 and before 2024-07-20 20:40
                if (/before  *\d{4}-\d{2}-\d{2}/.test(toValue)) {
                    if (filter_debug)  console.debug("alt 1:  after 2024-05-20 08:42 and before 2024-07-20 20:40");
                    const toTimestamp = toValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/);
                    if (filter_debug)  console.debug(toTimestamp);
                    toYear = parseInt(toValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[1], 10);
                    toMonth = parseInt(toValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[2], 10);
                    toDay = parseInt(toValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[3], 10);
                    toHour = parseInt(toValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[4], 10);
                    toMinute = parseInt(toValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[5], 10);
                    console.debug("toYear: " + toYear + " toMonth: " + toMonth + " toDay: " + toDay + " toHour: " + toHour + " toMinute: " + toMinute);

                    toSpecificTimeRadio.checked = true;

                    const t = formatDatetimeForInput(new Date(toYear, toMonth - 1, toDay, toHour, toMinute));
                    if (filter_debug)  console.debug(t);
                    toDatetime.value = t ? new Date(t).toISOString().slice(0, -1) : '';

                    const fromTimestamp = fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/);
                    if (filter_debug)   console.debug(fromTimestamp);
                    fromYear = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[1], 10);
                    fromMonth = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[2], 10);
                    fromDay = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[3], 10);
                    fromHour = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[4], 10);
                    fromMinute = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[5], 10);
                    if (filter_debug)   console.debug("fromYear: " + fromYear + " fromMonth: " + fromMonth + " fromDay: " + fromDay + " fromHour: " + fromHour + " fromMinute: " + fromMinute);
                    const t2 = formatDatetimeForInput(new Date(fromYear, fromMonth - 1, fromDay, fromHour, fromMinute));
                    if (filter_debug) console.debug(t2);
                    //toDatetime.value = t ? new Date(t).toISOString().slice(0, -1) : '';
                    fromDatetime.value = t2 ? new Date(t2).toISOString().slice(0, -1) : '';

                    // alt 2 after 2024-05-20 20:42 and before Now
                } else if (/before  *[Nn][Oo][Ww]/.test(toValue)) {
                    if (filter_debug) console.debug("alt 2: after 2024-05-20 20:42 and before Now");

                    toSpecificTimeRadio.checked = true;
                    const fromTimestamp = fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/);
                    if (filter_debug)  console.debug(fromTimestamp);
                    fromYear = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[1], 10);
                    fromMonth = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[2], 10);
                    fromDay = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[3], 10);
                    fromHour = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[4], 10);
                    fromMinute = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[5], 10);
                    if (filter_debug)  console.debug("fromYear: " + fromYear + " fromMonth: " + fromMonth + " fromDay: " + fromDay + " fromHour: " + fromHour + " fromMinute: " + fromMinute);
                    const t2 = formatDatetimeForInput(new Date(fromYear, fromMonth - 1, fromDay, fromHour, fromMinute));
                    if (filter_debug)  console.debug(t2);
                    //toDatetime.value = t ? new Date(t).toISOString().slice(0, -1) : '';
                    fromDatetime.value = t2 ? new Date(t2).toISOString().slice(0, -1) : '';

                    // alt 3 after 2024-06-20 20:42 and for 3 days
                } else if (/for /.test(toValue)) {
                    if (filter_debug)  console.debug("alt 3: after 2024-06-20 20:42 and for 5 days");

                    toSpecificTimeRadio.checked = false;
                    toLengthOfTimeRadio.checked = true;

                    const fromTimestamp = fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/);
                    if (filter_debug) console.debug(fromTimestamp);
                    fromYear = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[1], 10);
                    fromMonth = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[2], 10);
                    fromDay = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[3], 10);
                    fromHour = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[4], 10);
                    fromMinute = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[5], 10);
                    if (filter_debug) console.debug("fromYear: " + fromYear + " fromMonth: " + fromMonth + " fromDay: " + fromDay + " fromHour: " + fromHour + " fromMinute: " + fromMinute);
                    const t2 = formatDatetimeForInput(new Date(fromYear, fromMonth - 1, fromDay, fromHour, fromMinute));
                    if (filter_debug) console.debug(t2);
                    //toDatetime.value = t ? new Date(t).toISOString().slice(0, -1) : '';
                    fromDatetime.value = t2 ? new Date(t2).toISOString().slice(0, -1) : '';

                    // compute the end date pased on the length of the interval added to thet starting timestamp
                    toDurationNumeric = parseInt(toValue.match(/for ([0-9 ]*)(hr|day|month)[s]*/)[1].trim(), 10);
                    toDurationUnit = toValue.match(/for ([0-9 ]*)(hr|day|month)[s]*/)[2].trim();
                    // place the values in to the dialog form
                    //fromHour.value = fromDurationNumeric;
                    if (filter_debug) console.debug("toDurationNumeric: " + toDurationNumeric + " toDurationUnit: " + toDurationUnit);
                    if (filter_debug) console.debug(document.getElementById("to-interval-unit").querySelector('option[value="' + toDurationUnit + '"]'));

                    document.getElementById("to-interval-unit").querySelector('option[value="' + toDurationUnit + '"]').selected = true;
                    document.getElementById("to-interval-number").value = toDurationNumeric;

                    // alt 6: after 2024-07-20 20:42
                } else if (/after *2/.test(fromValue)) {
                    if (filter_debug) console.debug("alt 6, after 2024-07-20 20:42");
                    if (filter_debug)  console.debug("after a timestamp");

                    toSpecificTimeRadio.checked = false;
                    toLengthOfTimeRadio.checked = false;

                    const fromTimestamp = fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/);
                    if (filter_debug)  console.debug(fromTimestamp);
                    fromYear = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[1], 10);
                    fromMonth = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[2], 10);
                    fromDay = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[3], 10);
                    fromHour = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[4], 10);
                    fromMinute = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[5], 10);
                    if (filter_debug)  console.debug("fromYear: " + fromYear + " fromMonth: " + fromMonth + " fromDay: " + fromDay + " fromHour: " + fromHour + " fromMinute: " + fromMinute);
                    const t2 = formatDatetimeForInput(new Date(fromYear, fromMonth - 1, fromDay, fromHour, fromMinute));
                    if (filter_debug)  console.debug(t2);
                    //toDatetime.value = t ? new Date(t).toISOString().slice(0, -1) : '';
                    fromDatetime.value = t2 ? new Date(t2).toISOString().slice(0, -1) : '';

                } else {
                    if (filter_debug)  console.debug("Error: unknown format of the filter");

                }
            } catch (e) {
                console.error(e);
            }

        } else if (fromValue.includes("before ")) {
            if (filter_debug)  console.debug("alt 7, before 2024-07-20 20:42");
            if (filter_debug) console.debug("after a timestamp");

            fromSpecificTimeRadio.checked = false;
            fromLengthOfTimeRadio.checked = false;

            toSpecificTimeRadio.checked = true;
            toLengthOfTimeRadio.checked = false;
            toNowRadio.checked = false;
            const toTimestamp = fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/);
            if (filter_debug)  console.debug(toTimestamp);
            toYear = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[1], 10);
            toMonth = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[2], 10);
            toDay = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[3], 10);
            toHour = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[4], 10);
            toMinute = parseInt(fromValue.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)[5], 10);
            if (filter_debug)  console.debug("toYear: " + toYear + " toMonth: " + toMonth + " toDay: " + toDay + " toHour: " + toHour + " toMinute: " + toMinute);

            const t = formatDatetimeForInput(new Date(toYear, toMonth - 1, toDay, toHour, toMinute));
            if (filter_debug)  console.debug(t);
            toDatetime.value = t ? new Date(t).toISOString().slice(0, -1) : '';

        }

        return {
            from: fromValue.trim() || '',
            to: toValue || '',

        };
        //}
        return {
            from: '',
            to: ''
        };
    };

    const formatDatetimeForInput = (datetime) => {
        return new Date(datetime).toISOString().slice(0, 16).replace('T', ' ');
    };
    if (filter_debug) console.debug(" input_field_ide: " + input_field_id);

    const showDialog = () => {
        if (filter_debug) console.debug('showDialog.start');
        try {
            const currentValue = document.getElementById(input_field_id).value;
            if (filter_debug) console.debug(" input_field_ide: " + input_field_id);
            if (filter_debug) console.debug('Current value:', currentValue);
            // read the current values in the input field, and place those, if any, in the form.
            if (filter_debug)  console.debug("calling parseInputValue");
            const parsedValues = parseInputValue(currentValue);
            if (filter_debug)  console.debug('Parsed values:', JSON.stringify(parsedValues));

            // Extract the values from the parsed values
            const {
                fromDurationNumeric,
                fromDurationUnit,
                toDurationNumeric,
                toDurationUnit
            } = parsedValues;
            const {
                fromYear,
                fromMonth,
                fromDay,
                fromHour,
                fromMinute,
                toYear,
                toMonth,
                toDay,
                toHour,
                toMinute
            } = parsedValues;

            updateFromMode();
            updateToMode();

            dialog.style.display = 'block';
        } catch (e) {
            console.error(e);
        }
    };

    const closeDialog = () => {
        dialog.style.display = 'none';
        // remove event handler from the ok button
        //console.debug("remove event handler from okButton");
        //okButton.removeEventListener('click', handleOk);
        //okButton.removeEventListener('touchend', handleOk);
    };

    // close the dialog if the user clicks outside of it

    // NOTE: make some adjustments here to account for time zones

    function handleOk(cellnodeid) {
        if (filter_debug)   console.debug('handleOk.start');
        try {
            let fromValue = fromDatetime.value;
            let toValue = toDatetime.value;
            if (filter_debug)   console.debug(cellnodeid);
            if (filter_debug)  console.debug(input_field_id);
            //const fromHourValue = fromHour.value;
            //const fromMinuteValue = fromMinute.value;
            const fromIntervalValue = fromIntervalNumber.value;
            const fromIntervalUnitValue = fromIntervalUnit.value;
            //const toHourValue = toHour.value;
            //const toMinuteValue = toMinute.value;
            const toIntervalValue = toIntervalNumber.value;
            const toIntervalUnitValue = toIntervalUnit.value;
            // assemble the new filter string
            let result = '';
            // starting at a specified timestamp
            if (fromSpecificTimeRadio.checked) {
                //fromValue = adjustDatetimeWithTime(fromValue, fromHourValue, fromMinuteValue);
                if (fromValue) {
                    result += "from " + formatDatetimeForInput(fromValue);
                }
            } else if (fromIntervalValue) {
                // an interval of time into the past
                console.debug("fromIntervalValue: " + fromIntervalValue);
                if (fromIntervalValue == 1) {
                    result += "from " + `${fromIntervalValue} ${fromIntervalUnitValue} before`;
                } else {
                    result += "from " + `${fromIntervalValue} ${fromIntervalUnitValue}s before`;
                }
            } else {
                if (filter_debug)  console.debug("no 'from' value set");
            }

            if (toNowRadio.checked) {
                // to Now
                result += " and to Now";

            }else if (toSpecificTimeRadio.checked) {
                console.debug("toSpecificTimeRadio.checked");
                //toValue = adjustDatetimeWithTime(toValue, toHourValue, toMinuteValue);
                if (toValue) {
                    result += (result ? ' and to ' : '') + formatDatetimeForInput(toValue);
                } else {
                    console.debug("no 'to' value set");
                    result += " and to Now";
                }
            } else if (toIntervalValue) {
                console.debug("toIntervalValue: " + toIntervalValue);
                result += ` and ${toIntervalValue} ${toIntervalUnitValue}`;
            } else {
                if (filter_debug)   console.debug("no 'to' value set");
            }

            if (filter_debug)  console.debug('Result:', result);
            // write the result to the input field
            if (filter_debug)  console.debug("input_field_id: " + input_field_id);
            if (filter_debug) console.debug("previous: " + document.getElementById(input_field_id).value);
            document.getElementById(input_field_id).value = result;
            if (filter_debug) console.debug("new: " + document.getElementById(input_field_id).value);
            
            // Dispatch a custom event to indicate the input field has been updated
            //const event = new Event('inputUpdated');
            //document.getElementById(input_field_id).dispatchEvent(event);
            if (filter_debug) console.debug("calling closeDialog");
            closeDialog();
            // trigger the filtering process (and save changes to the filter to local storage)
            //console.debug("calling applyFilters");
            //applyFilters(table_name);
            
            if (filter_debug)  console.debug("calling triggerFilters");
            triggerFilters(table_name);

        } catch (e) {
            console.error(e);
        }

    };

    const adjustDatetimeWithTime = (datetime, hours, minutes) => {
        if (datetime) {
            const date = new Date(datetime);
            if (hours !== '' && minutes !== '') {
                date.setHours(hours);
                date.setMinutes(minutes);
                return date.toISOString().slice(0, -1);
            }
        }
        return datetime;
    };

    const updateFromMode = () => {
        if (filter_debug) console.debug('updateFromMode.start');
        try {
            if (fromSpecificTimeRadio.checked) {
                fromSpecificTime.style.display = 'block';
                fromLengthOfTime.style.display = 'none';
            } else {
                fromSpecificTime.style.display = 'none';
                fromLengthOfTime.style.display = 'block';
            }
        } catch (e) {
            console.error(e);
        }
    };

    const updateToMode = () => {
        if (filter_debug)  console.debug('updateToMode.start');
        try {
            if (toSpecificTimeRadio.checked) {
                toSpecificTime.style.display = 'block';
                toLengthOfTime.style.display = 'none';
            } else if (toLengthOfTimeRadio.checked) {
                toSpecificTime.style.display = 'none';
                toLengthOfTime.style.display = 'block';
            }else{
                // "Now" is checked
                toSpecificTime.style.display = 'none';
                toLengthOfTime.style.display = 'none';

            }
        } catch (e) {
            console.error(e);
        }
    };

    if (filter_debug)  console.debug("calling fromSpecificTimeRadio");
    if (filter_debug)  console.debug(fromSpecificTimeRadio);
    fromSpecificTimeRadio.addEventListener('change', updateFromMode);
    if (filter_debug) console.debug("calling updateFromMode");
    fromLengthOfTimeRadio.addEventListener('change', updateFromMode);
    if (filter_debug) console.debug("calling updateToMode");
    toSpecificTimeRadio.addEventListener('change', updateToMode);
    if (filter_debug) console.debug("calling updateToMode");
    toLengthOfTimeRadio.addEventListener('change', updateToMode);
    toNowRadio.addEventListener('change', updateToMode);
    if (filter_debug)  console.debug(document.getElementById(input_field_id));
    document.getElementById(input_field_id).addEventListener('click', showDialog);
    document.getElementById(input_field_id).addEventListener('touchend', showDialog);
    if (filter_debug)  console.debug("calling addEventlistener closeDialog");
    closeIcon.addEventListener('click', closeDialog);
    closeIcon.addEventListener('touchend', closeDialog);
    if (filter_debug)   console.debug("calling addEventlistener handleOk");
    if (filter_debug) console.debug(okButton);

    okButton.addEventListener('click', function () {
        if (filter_debug)  console.debug("click event, calling handleOk");
        handleOk(input_field_id);
    });

    okButton.addEventListener('touchend', function () {
        if (filter_debug)  console.debug("touchend event, calling handleOk");
        handleOk(input_field_id);
    });
    //okButton.addEventListener('touchend', handleOk());


    // Close the dialog if clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target == dialog) {
            closeDialog();
        }
    });

    window.addEventListener('touchend', (event) => {
        if (event.target == dialog) {
            closeDialog();
        }
    });

    // Add an event listener for the custom 'inputUpdated' event
    document.getElementById(input_field_id).addEventListener('inputUpdated', () => {
        if (filter_debug)  console.log('Input field updated:', document.getElementById(input_field_id).value);
    });
}


function addEventColumnToggleListeners(wordList, tableName) {
    console.debug("addEventColumnToggleListeners.start");
    console.debug(wordList);
    console.debug(tableName);
    try{
    wordList.forEach(word => {
        console.debug(word);
        console.debug(document.getElementById(`toggle-${word}`));
        document.getElementById(`toggle-${word}`).addEventListener('change', function () {
            toggleColumn(word, this.checked, tableName, table_columns_to_not_display_keyname);
        });
    });
}catch(e){
    console.error(e);
}
}



function setColumnToggleMarks(wordList, tableName, unchecked) {
    console.debug("setColumnToggleMarks.start");
    console.debug(wordList);
    console.debug(tableName);
    wordList.forEach(word => {
        console.debug(word);
        const node = document.getElementById(`toggle-${word}`);
        console.debug(node);
    
// set this node as checked if the node is not in the list of columns to not display
if (unchecked.includes(word)) {
    console.debug("unchecked " + word);

    node.removeAttribute('checked');
    }else{

    console.debug("checked " + word);

        //node.checked = !unchecked.includes(word);
        node.setAttribute('checked', 'checked');
        //node.removeAttribute('checked');

    //node.setAttribute('checked', 'checked');
}
        //document.getElementById(`toggle-${word}`).addEventListener('change', function () {
       //     toggleColumn(word, this.checked, tableName, table_columns_to_not_display_keyname);
       // });
    });
}

function setupTableFilteringAndSorting(table_name) {
    console.debug("setupTableFilteringAndSorting.start (" + table_name + ")");

    // Locate all elements with the class "sortableCol"
    const buttons = document.querySelector('table[name="' + table_name + '"]').querySelectorAll('.sortableCol');
    len = buttons.length;
    for (var i = 0; i < buttons.length; i++) {
        //work with checkboxes[i]
        console.debug(buttons[i]);
        // set column index number for each column
        //buttons[i].setAttribute("colindex", i);
        buttons[i].addEventListener('click', function (event) {
            sortTa(table_name, event);
        }, false);
    }

    // Locate all cells that are used for filtering of search results
    const f_cells = document.querySelector('table[name="' + table_name + '"]').querySelectorAll("thead tr:nth-child(2) th");
    //console.debug(f_cells);
    len = f_cells.length;
    for (var i = 0; i < f_cells.length; i++) {
        //work with regexp in cell
        //console.debug(f_cells[i]);
        // set column index number for each column
        // f_cells[i].setAttribute("colindex", i);
        f_cells[i].addEventListener('input', function (event) {
            //filterTableAllCols(table_name);
          //  console.debug("calling triggerFilters");
            triggerFilters(table_name);
        }, false);
        f_cells[i].addEventListener('change', function (event) {
            //filterTableAllCols(table_name);
            console.debug("calling triggerFilters");
            triggerFilters(table_name);
        }, false);
    }
}

/*
 * recursively go down the DOM tree below the specified node
 *
 */
function replaceLink(node, note_template) {
    try {
        // console.debug("# replaceLink");
        //console.debug(node);

        if (node) {

            // recursively call to analyse child nodes

            for (var i = 0; i < node.childNodes.length; i++) {
                //console.debug("call childnodes");
                try {
                    replaceLink(node.childNodes[i], note_template);
                } catch (f) {}
            }

            /*
             * Node.ELEMENT_NODE 	1 	An Element node like <p> or <div>.
            Node.ATTRIBUTE_NODE 	2 	An Attribute of an Element.
            Node.TEXT_NODE 	3 	The actual Text inside an Element or Attr.
            Node.CDATA_SECTION_NODE 	4 	A CDATASection, such as <!CDATA[[ … ]]>.
            Node.PROCESSING_INSTRUCTION_NODE 	7 	A ProcessingInstruction of an XML document, such as <?xml-stylesheet … ?>.
            Node.COMMENT_NODE 	8 	A Comment node, such as <!-- … -->.
            Node.DOCUMENT_NODE 	9 	A Document node.
            Node.DOCUMENT_TYPE_NODE 	10 	A DocumentType node, such as <!DOCTYPE html>.
            Node.DOCUMENT_FRAGMENT_NODE 	11 	A DocumentFragment node.
             *
             */

            if (node.nodeType == Node.ELEMENT_NODE || node.nodeType == Node.DOCUMENT_NODE) {
                // console.debug("1.0.1");

                // exclude elements with invisible text nodes
                //  if (ignore(node)) {
                //      return
                //  }
            }

            // if this node is a textnode, look for the
            if (node.nodeType === Node.TEXT_NODE) {
                // check for visibility


                // apply regexp identifying yellownote

                // exclude elements with invisible text nodes

                // ignore any textnode that is not at least xx characters long
                if (node.textContent.length >= 150) {

                    //console.debug("look for sticky note in (" + node.nodeType + "): " + node.textContent);
                    // regexp to match begining and end of a stickynote serialization. The regex pattern is such that multiple note objects may be matched.
                    var yellownote_regexp = new RegExp(/yellownote=.*=yellownote/);

                    if (yellownote_regexp.test(node.textContent)) {
                        console.debug("HIT");
                        // carry out yellow sticky note presentation on this textnode

                        showStickyNote(node, note_template);

                    }

                }
            }
        }
    } catch (e) {
        console.debug(e);
    }

}
