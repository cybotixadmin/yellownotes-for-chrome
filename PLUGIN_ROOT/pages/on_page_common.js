const server_url = "https://api.yellownotes.cloud";

const plugin_uuid_header_name = "ynInstallationUniqueId";
// name of header containing session token
const plugin_session_header_name = "xyellownotessessionjwt";

const plugin_remove_banner_uri = "/api/v1.0/delete_note_banner";

const silent_logout_url = "https://www.yellownotes.cloud/logout_silent";

const URI_plugin_user_get_own_distributionlists = '/api/v1.0/plugin_user_get_my_distribution_lists';

const URI_plugin_user_get_my_feed_subscribers = '/api/v1.0/plugin_user_get_my_feed_subscribers';

const URI_plugin_user_setdistributionlist_yellownote = '/api/v1.0/plugin_user_setdistributionlist_yellownote';

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

const URI_plugin_user_get_my_subscriptions = "/api/v1.0/plugin_user_get_my_subscriptions";

const URI_plugin_user_set_distributionlist_active_status = "/api/plugin_user_set_distributionlist_active_status";
const URI_plugin_user_set_distributionlist_anonymous_allowed_status = "/api/plugin_user_set_distributionlist_anonymous_allowed_status";
const URI_plugin_user_set_distributionlist_automatic_enrolment_status = "/api/plugin_user_set_distributionlist_automatic_enrolment_status";



const URI_plugin_user_deactivate_agreements = "/api/plugin_user_deactivate_distribution_list";
const URI_plugin_user_activate_agreements = "/api/plugin_user_activate_distribution_list";
const URI_plugin_user_get_my_distribution_lists = "/api/v1.0/plugin_user_get_my_distribution_lists";

const URI_plugin_user_download_data = "/api/v1.0/plugin_user_retrieve_all_data";

const URI_plugin_user_delete_all_data = "/api/v1.0/plugin_user_delete_all_data";
const URI_plugin_user_update_yellownote_attributes = "/api/v1.0/update_note_properties";

const URI_plugin_user_get_all_yellownotes = "/api/plugin_user_get_all_yellownotes";

const URI_plugin_user_get_all_subscribed_notes = "/api/v1.0/plugin_user_get_all_subscribed_notes";

const URI_plugin_user_get_own_yellownotes = "/api/v1.0/plugin_user_get_own_yellownotes";
const URI_plugin_user_delete_yellownote = "/api/v1.0/plugin_user_delete_yellownote";
const URI_plugin_user_set_note_active_status = "/api/v1.0/plugin_user_setstatus_yellownote";

const URI_plugin_user_get_active_feed_notes = "/api/v1.0/plugin_user_get_active_feed_notes";

const URI_plugin_user_get_abstracts_of_all_yellownotes = "/api/plugin_user_get_abstracts_of_all_yellownotes";

const note_owners_control_bar_height = 23;


async function page_display_login_status() {
    console.log("display_login_status()");
    //con
    try {
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        console.debug(session);
        console.debug(session[plugin_session_header_name]);
        var userid = null;

        userid = await get_username_from_sessiontoken(session[plugin_session_header_name]);
    } catch (e) {
        console.error(e);
    }

    console.debug("userid: " + userid);
    try {
        if (userid == null) {
            console.log("Not logged in");
            console.log(document.getElementById("login_status"));
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
    console.log("is_authenticated()");
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

            console.log(cachedResponse);
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
        console.log("checkSessionJWTValidity()", plugin_session_header_name);
        chrome.storage.local.get(plugin_session_header_name, (result) => {
            console.log(result);
            const jwt = result[plugin_session_header_name];
            console.debug(jwt);
            if (jwt == "DELETED") {
                console.log("No JWT found");
                resolve(false); // No JWT found

            } else if (!jwt) {
                console.log("No JWT found");
                resolve(false); // No JWT found
            } else {
                try {
                    const displayName = extractClaimFromJWT(jwt, 'displayname');
                    console.debug("displayname: " + displayName);
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

    console.log(token);

    try {

        // Example usage
        //const token = 'your_jwt_token'; // Replace with your JWT token
        const claimNames = ['displayname']; // Replace with the claims you want to extract
        const claims = getClaimsFromJwt(token, claimNames);

        console.log(claims);
        return (claims.displayname);
    } catch (e) {
        console.error(e);
        return null;
    }
}

// call for a html faile and inserts the content of this html fil into the DOM at the location of the element with the id dom_id

function fetchAndDisplayStaticContent(url, dom_id) {
    return new Promise((resolve, reject) => {
        console.log("fetchAndDisplayStaticContent()");
        console.log("place ", url);
        console.log("on ", dom_id);

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

                    console.log(doc.body);

                    // Security measure 2
                    // Remove script tags
                    const scripts = doc.querySelectorAll('script');
                    scripts.forEach(script => script.remove());

                    console.debug(doc.body.querySelector('div'));
                    // Append the content to the DOM node with ID 'form'
                    const formElement = document.getElementById(dom_id);
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

async function login_logout_action() {
    console.log("login_logout_action()");
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
    console.log("timestampstring2timestamp: " + str);
    try {
        const year = str.substring(0, 4);
        const month = str.substring(5, 7);
        const day = str.substring(8, 10);
        const hour = str.substring(11, 13);
        const minute = str.substring(14, 16);
        const second = str.substring(17, 19);
        //    var timestamp = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second + "";
        var timestamp = year + "-" + month + "-" + day + " " + hour + ":" + minute;
        console.log("timestamp: " + timestamp);

        return timestamp;
    } catch (e) {
        console.log(e);
        return null;
    }
}

function integerstring2timestamp(int) {
    console.log("integerstring2timestamp: " + int);
    try {
        const year = int.substring(0, 4);
        const month = int.substring(5, 6);
        const day = int.substring(8, 9);
        const hour = int.substring(8, 9);
        const minute = int.substring(10, 11);
        const second = int.substring(12, 13);

        var timestamp = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
        console.log("timestamp: " + timestamp);

        return timestamp;
    } catch (e) {
        console.log(e);
        return null;
    }
}

function sortTa(table_name, event) {
    console.debug("sortTa().start");
    // console.log(event);
    // console.log(event.target);
    // console.log(event.target.parentNode);
    // console.log( getElementPosition(event.target.parentNode));
    sortTable(table_name, getElementPosition(event.target.parentNode));
}

// Function to sort the table
function sortTable(table_name, columnIndex) {
    console.log("sortTable.start");
    console.log("columnIndex: " + columnIndex)
    console.log("sortTabl: " + table_name)
    const table = document.querySelector('table[name="' + table_name + '"]');
    console.log(table);
    let rows = Array.from(table.rows).slice(2); // Ignore the header rows
    let sortedRows;
    const row_count = table.rows.length - 2;
    console.log("row count: " + row_count);

    // Toggle sort state for the column (asceding or decending sort)
    try {
        console.log(table.rows[0].cells[columnIndex]);
        console.log(table.rows[0].cells[columnIndex].querySelector("span").textContent);
        console.log(table.rows[1].cells[columnIndex]);
    } catch (e) {
        console.log(e);
    }
    if (sortStates[columnIndex] === 'none' || sortStates[columnIndex] === 'desc') {
        sortStates[columnIndex] = 'asc';
        table.rows[0].cells[columnIndex].querySelector("span").textContent = "▲";
    } else {
        sortStates[columnIndex] = 'desc';
        table.rows[0].cells[columnIndex].querySelector("span").textContent = "▼";
    }
    var sortOrder = sortStates[columnIndex];
    console.log("sortOrder: " + sortOrder);

    // type of sort - default is case-sensitive alphabetical
    var sort_type = "stringCaseExact";
    try {
        if (table.rows[0].cells[columnIndex].hasAttribute("sort_type")) {
            sort_type = table.rows[0].cells[columnIndex].getAttribute("sort_type");
        }
    } catch (e) {
        console.log(e);
    }
    // Sort based on the selected column and sort state
    // Consider options for different types of sorting here.

    if (sort_type == "stringCaseExact") {

        sortedRows = rows.sort((a, b) => a.cells[columnIndex].innerText.localeCompare(b.cells[columnIndex].innerText));
    } else if (sort_type == "stringCaseIgnore") {

        sortedRows = rows.sort((a, b) => a.cells[columnIndex].innerText.toLowerCase().localeCompare(b.cells[columnIndex].innerText.toLowerCase()));

    } else if (sort_type == "selectCaseExact") {
        // console.log("selectCaseExact");


        sortedRows = rows.sort((rowA, rowB) => {
                const cellA = rowA.cells[columnIndex].querySelector('select').value;
                const cellB = rowB.cells[columnIndex].querySelector('select').value;

                return cellA.localeCompare(cellB);
            });

    } else {
        console.log("default sort");
        sortedRows = rows.sort((a, b) => a.cells[columnIndex].innerText.localeCompare(b.cells[columnIndex].innerText));
    }

    if (sortOrder === 'desc') {
        sortedRows.reverse();
    }

    // Remove existing rows (excluding the two header rows)
    while (table.rows.length > 3) {
        table.deleteRow(3);
    }

    // Append sorted rows
    const tbody = table.getElementsByTagName('tbody')[0];
    sortedRows.forEach(row => tbody.appendChild(row));
}

/*
apply all filters simmultaneously

TO DO. add a swith where the user can chose between whilecard and regexp filters (wildcard default)
and chose to have the filters to be caseinsensitive or not (caseinsensitive default) or not (casesensitive default)
 */
function filterTableAllCols(table_name) {
    console.log("filterTableAllCols.start (" + table_name + ")  ");

    console.debug(getElementPosition(event.target.parentNode));

    var table = document.querySelector('table[name="' + table_name + '"]');
    console.log(table);
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
            //console.log(j + " ##########");
            //const filterValue = filtersCols[j].querySelector("[filterContent]").value;
            //console.debug("column number  ", j, " filter type: ", filtersCols[j].getAttribute("filtertype"), "  with filter value: ", filtersCols[j].value);
            //console.log(filtersCols[j]);
            //console.log(filtersCols[j].value);
            //console.debug(filtersCols[j].tagName);
            //console.debug(filtersCols[j].tagName == "SELECT");
            //console.debug(filtersCols[j].getAttribute("filtertype") == "checkedmatch");
            //console.debug(filtersCols[j].tagName == "SELECT" && filtersCols[j].getAttribute("filtertype") == "checkedmatch");
            //console.log(j + ": " + filtersCols[j].parentNode.getAttribute("colindex"));

            // multiple types of filers are supported
const filterType = filtersCols[j].getAttribute("filtertype");
console.debug("column number  ", j, " filter type: ", filterType);
            
  //          if (filtersCols[j].tagName == "SELECT" && filtersCols[j].getAttribute("filtertype") == "checkedmatch") {
              if (filterType  == "checkedmatch" ) {
                console.log("match type: checkedmatch");
                // filter on whether or not a checkbox has been checked
                // is there a filter value set ?
                
                // which column is the filter for ?
                const col = getElementPosition(filtersCols[j]);
                console.debug("filter on col: ", col );
                
                
                var comparingCol = filtersCols[j].parentNode.getAttribute("colindex");
                console.debug(getElementPosition(filtersCols[j]));
                console.debug(getElementPosition(filtersCols[j].parentNode));
                console.debug(getElementPosition(filtersCols[j].parentNode.parentNode));
              
                var cell = rows[i].getElementsByTagName("td")[j];
                console.debug(cell);
                if (cell) {
                    //console.log(cell.querySelector('input[type="checkbox"]'));
                    var isChecked = cell.querySelector('input[type="checkbox"]').checked;
                    //console.log("isChecked: " + isChecked);
                    var filterValue = filtersCols[j].value;
                    console.log("filterValue: " + filterValue + " isChecked: " + isChecked);
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
                console.log("match type: selectmatch");
                // filter on whether or not a checkbox has been checked

 
                // which column is the filter for ?
                const col = getElementPosition(filtersCols[j]);
                console.debug("filter on col: " ,col);

                var cell = rows[i].getElementsByTagName("td")[j];
                console.debug(cell);
                if (cell) {
                    console.log(cell.getElementsByTagName("select"));

                    var selectElement = cell.getElementsByTagName("select")[0];
                    var selectedText = selectElement.options[selectElement.selectedIndex].text;

                    // Log the selected text to the console or return it from the function
                    console.log('Currently selected text:', selectedText);

                    console.log(cell.getElementsByTagName("select")[0].value);
                    //var isChecked = cell.querySelector('input[type="checkbox"]').checked;
                    //console.log("isChecked: " + isChecked);
                    var filterValue = filtersCols[j].value;
                    console.log("filterValue: " + filterValue + " selectedText: " + selectedText);

                    var regex = new RegExp(escapeRegex(filterValue), "i");
                    console.log("Is cell content \"" + cell.textContent.trim() + '" matching regex: ' + regex);
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
                console.log("match type: default match: wildcard match: " + filtersCols[j].value);
                try {
                   // which column is the filter for ?
                   // there may be fewer filters than columns
                const col = getElementPosition(filtersCols[j]);
                console.debug("filter on col: " , col);

                 filterValue = filtersCols[j].querySelector("[filterContent]").value;
                console.debug("filter with value: " , filterValue);

                // Only process the filter if a value has been entered for it
                    if (filterValue) { 
                        //var comparingCol = filtersCols[j].parentNode.getAttribute("colindex");
                        
                        var cell = rows[i].getElementsByTagName("td")[col];
                        console.debug(cell);
                        if (cell) {
                            //var filterValue = filtersCols[j].value;
                            var regex = new RegExp(escapeRegex(filterValue), "i");
                            console.log("is cell content \"" + cell.textContent.trim() + '" matching regex: ' + regex);
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
                    console.log(e);
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

// Example usage:
const url = 'https://example.com/api/data';
const header1 = 'Authorization';
const value1 = 'Bearer your_token';
const header2 = 'Content-Type';
const value2 = 'application/json';

//getStatusValue(url, header1, value1, header2, value2)
// .then(status => {
//     console.log('Status:', status);
// })
// .catch(error => {
//     console.error('Error:', error.message);
// });


// the session token is not completed as yet
function get_username_from_sessiontoken(token) {

    console.log("get_username_from_sessiontoken()");
    console.log(token);

    if (token == null) {
        return null;
    } else {
        try {

            // Example usage
            //const token = 'your_jwt_token'; // Replace with your JWT token
            const claimNames = ['userid', 'brand']; // Replace with the claims you want to extract
            const claims = getClaimsFromJwt(token, claimNames);

            console.log(claims);
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
        console.log(item);
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
    console.log("parseJwt(" + token + ") ");

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
console.log(claims);
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
    console.log("getNotShowByDefaultColumns: " + key + " " + defaultValue);
    return new Promise((resolve, reject) => {
        try {
            //const key = 'name_not_show_by_default_columns';
            let value = localStorage.getItem(key);
            console.debug("reading (from key "+ key +"): " + value);
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
    console.log("modifyNotShowByDefaultColumns: value=" + value + " action=" + action + " key=" + key);
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

function toggleColumn(columnName, isChecked, tableName, table_columns_to_not_display_keyname) {
    console.log("toggleColumn.start: " + columnName + " isChecked: " + isChecked, " in table name="+ tableName + " with local storage keyname: " + table_columns_to_not_display_keyname);
    //var table = document.getElementById("dataTable");
    var table = document.querySelector('table[name="' + tableName + '"]');
    // find out which column has the name columnName
    console.log(table);
    // thead tr:nth-child(2)
    var col = table.querySelector('thead tr:nth-child(1)').querySelector('[name = "' + columnName + '"]');
    console.log(col);
    const columnIndex = getElementPosition(col);
    console.log("column to hide:",  columnIndex);
    if (!isChecked) {
        modifyNotShowByDefaultColumns(columnName, 'set', table_columns_to_not_display_keyname).then(updatedArray => {
            //console.log(updatedArray);
        }).catch(error => {
            console.error('Error:', error);
        });
        // loop over all rows and hide this column
    table.querySelectorAll('tr[selectablecol="true"]').forEach(row => {
             console.log(row);
             console.log(row.cells[columnIndex].classList);

            row.cells[columnIndex].classList.add("hidden");

            // add column to supression list
            console.debug("hidden column: " + columnName);

           

        });

    } else {
         // To remove a value from the supression list
         modifyNotShowByDefaultColumns(columnName, 'unset', table_columns_to_not_display_keyname).then(updatedArray => {
            console.log(updatedArray);
        }).catch(error => {
            console.error('Error:', error);
        });
        table.querySelectorAll('tr[selectablecol="true"]').forEach(row => {

            console.debug(row);
            console.debug(row.cells[columnIndex].classList);
            row.cells[columnIndex].classList.remove("hidden");

           

        });

    }

}

function setupTableFilteringAndSorting(table_name) {
    console.debug("setupTableFilteringAndSorting.start (" + table_name + ")");

    // Locate all elements with the class "sortableCol"
    const buttons = document.querySelector('table[name="' + table_name + '"]').querySelectorAll('.sortableCol');
    len = buttons.length;
    for (var i = 0; i < buttons.length; i++) {
        //work with checkboxes[i]
        console.log(buttons[i]);
        // set column index number for each column
        //buttons[i].setAttribute("colindex", i);
        buttons[i].addEventListener('click', function (event) {
            sortTa(table_name, event);
        }, false);
    }

    // Locate all cells that are used for filtering of search results
    const f_cells = document.querySelector('table[name="' + table_name + '"]').querySelectorAll("thead tr:nth-child(2) th");
    console.log(f_cells);
    len = f_cells.length;
    for (var i = 0; i < f_cells.length; i++) {
        //work with regexp in cell
        console.log(f_cells[i]);
        // set column index number for each column
        // f_cells[i].setAttribute("colindex", i);
        f_cells[i].addEventListener('input', function (event) {
            filterTableAllCols(table_name);
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
