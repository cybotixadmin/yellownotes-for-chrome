


//const browser_id = chrome.runtime.id;


// check if the user is authenticated
checkSessionJWTValidity()
.then(isValid => {
    console.log('JWT is valid:', isValid);
    if (isValid) {
        console.debug("JWT is valid - show menu accordingly");
        fetchAndDisplayStaticContent("../fragments/en_US/view_own_subscribers_page_main_text.html", "view_own_subscribers_page_main_text").then(() => {});

        fetchAndDisplayStaticContent("../fragments/en_US/view_own_subscribers_page_explanation.html", "view_own_subscribers_page_explanation").then(() => {});

        fetchAndDisplayStaticContent("../fragments/en_US/sidebar_fragment_authenticated.html", "sidebar").then(() => {
            //page_display_login_status();
            // login_logout_action();
        });

        page_display_login_status();
    } else {
        console.debug("JWT is not valid - show menu accordingly");

        fetchAndDisplayStaticContent("../fragments/en_US/sidebar_fragment_unauthenticated.html", "sidebar").then(() => {
            //page_display_login_status();
            //login_logout_action();

        });

        page_display_login_status();
    }

})
.catch(error => {
    console.error('Error:', error.message);
});

// name of key to be used in db
const table_columns_to_not_display_keyname = "view_own_sub_hide_columns";

// which columns to display
// The users can decide which columns to display

document.getElementById('toggle-name').addEventListener('change', function () {
    toggleColumn('name', this.checked, "subscribersTable", table_columns_to_not_display_keyname);
});

document.getElementById('toggle-email').addEventListener('change', function () {
    toggleColumn('email', this.checked, "subscribersTable", table_columns_to_not_display_keyname);
});

document.getElementById('toggle-distributionlistname').addEventListener('change', function () {
    toggleColumn('distributionlistname', this.checked, "subscribersTable", table_columns_to_not_display_keyname);
});

document.getElementById('toggle-status').addEventListener('change', function () {
    toggleColumn('status', this.checked, "subscribersTable", table_columns_to_not_display_keyname);
});
document.getElementById('toggle-subscribetime').addEventListener('change', function () {
    toggleColumn('subscribetime', this.checked, "subscribersTable", table_columns_to_not_display_keyname);
});

document.getElementById('toggle-active').addEventListener('change', function () {
    toggleColumn('active', this.checked, "subscribersTable", table_columns_to_not_display_keyname);
});

document.getElementById('toggle-actions').addEventListener('change', function () {
    toggleColumn('actions', this.checked, "subscribersTable", table_columns_to_not_display_keyname);
});


// set table visibility defaults
// make this sensitive to the size screen the user is using

var not_show_by_default_columns = [];

const pagewidth = window.innerWidth;
console.log("window.innerWidth: " + pagewidth);

if (pagewidth < 300) {
    not_show_by_default_columns = [ "status","subscribetime" ,"status","active"];
} else if (pagewidth < 600) {
    not_show_by_default_columns = [ "status" , "active"];

} else if (pagewidth < 1000) {
    not_show_by_default_columns = [];
}


// call to database to get notes and place them in a table
fetchData(getQueryStringParameter('distributionlistid'), not_show_by_default_columns).then(function (d) {
    console.debug("read notes complete");
    console.debug(d);

    // update the list of colmes and check/uncheck according to the list of columns to not display
    not_show_by_default_columns.forEach(column => {
        toggleColumn(column, false, "subscribersTable", table_columns_to_not_display_keyname);
        document.getElementById(`toggle-${column}`).checked = false;
    });

});

    function fetchData(distributionlistid, not_show_by_default_columns) {
        console.log("fetchData for distributionlistid: \"" + distributionlistid, "\" not_show_by_default_columns: " + not_show_by_default_columns);

        return new Promise(
            function (resolve, reject) {

            var ynInstallationUniqueId = "";
            var xYellownotesSession = "";

            chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]).then(function (result) {
                console.log(result);
                console.log(ynInstallationUniqueId);
                ynInstallationUniqueId = result[plugin_uuid_header_name];
                xYellownotesSession = result[plugin_session_header_name];
                console.log(ynInstallationUniqueId);
                console.log(xYellownotesSession);
                var msg = { distributionlistid: distributionlistid};
                if (distributionlistid == null) {
                    msg = {};
                }
                console.debug(msg);
                return fetch(server_url + URI_plugin_user_get_my_feed_subscribers, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [plugin_uuid_header_name]: ynInstallationUniqueId,
                        [plugin_session_header_name]: xYellownotesSession,
                    },
                    body: JSON.stringify(msg) // example IDs, replace as necessary, the body is used to retrieve the notes of other users, default is to retrieve the notes of the authenticated user
                });
            }).then(response => {
                if (!response.ok) {
                    console.log(response);

                    // if an invalid session token was sent, it should be removed from the local storage
                    if (response.status == 401) {
                        // compare the response body with the string "Invalid session token" to determine if the session token is invalid
                        if (response.headers.get("session") == "DELETE_COOKIE") {
                            console.log("Session token is invalid, remove it from local storage.");
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
            }).then(function (resp) {
                data = resp;
                return fetch(server_url + URI_plugin_user_get_my_distribution_lists, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        [plugin_uuid_header_name]: ynInstallationUniqueId,
                        [plugin_session_header_name]: xYellownotesSession,
                    },
                });
            }).then(response => {
                if (!response.ok) {
                    reject(new Error('Network response was not ok'));
                }
                return response.json();
            }).then(function (dist) {
                distributionListData = dist;

                console.log(distributionListData);

                console.log(data);

                var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
                console.log(utc);
                console.log(Date.now());
                var now = new Date;
                var utc_timestamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
                        now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
                console.log(utc_timestamp);
                console.log(new Date().toISOString());

                // Get table body element
                const tableBody = document.querySelector('table[name="subscribersTable"]').getElementsByTagName('tbody')[0];
                // Loop through data and populate the table
                data.forEach(row => {
                    console.log(row);
                    console.log(JSON.stringify(row));
                    console.log(row.subscriptionid);

                    // Create new row
                    const newRow = tableBody.insertRow();
                    newRow.setAttribute('subscriptionid', row.subscriptionid);
                    newRow.setAttribute('subscriberuuid', row.subscriberuuid);
                    newRow.setAttribute('distributionlistid', row.distributionlistid);
                    newRow.setAttribute('creatorid', row.creatorid);
                    // Create cells and populate them with data

                    const cell_displayname = newRow.insertCell(0);
                    const cell_email = newRow.insertCell(1);
                    const cell_distributionlistname = newRow.insertCell(2);
                    const cell_active = newRow.insertCell(3);
                    const cell_status = newRow.insertCell(4);
                    const cell_subscribedate = newRow.insertCell(5);
                    const cell_actions = newRow.insertCell(6);
                    // do not include a option for notes in this release
                    try {
                        cell_email.textContent = row.email;
                        cell_email.setAttribute('name', 'email');
                        cell_email.setAttribute('class', 'email');
                    } catch (e) {
                        console.debug(e);
                    }

                    // name
                    try {
                        cell_subscribedate.textContent = timestampstring2timestamp(row.subscribedate);
                        cell_subscribedate.setAttribute('name', 'subscribedate');
                        cell_subscribedate.setAttribute('class', 'datetime');
                    } catch (e) {
                        console.debug(e);
                    }

                    try {
                        cell_displayname.textContent = row.displayname;
                        cell_displayname.setAttribute('name', 'displayname');
                        cell_displayname.setAttribute('class', 'displayname');
                    } catch (e) {
                        console.debug(e);
                    }

                    try {
                        cell_distributionlistname.textContent = row.distributionlistname;
                        cell_distributionlistname.setAttribute('name', 'distributionlistname');
                        cell_distributionlistname.setAttribute('class', 'displayname');
                    } catch (e) {
                        console.debug(e);
                    }

                    // render a check box to enable/disable the note
                    const suspendActButton = document.createElement("span");
                    if (row.active == 1) {
                        // active
                        suspendActButton.innerHTML =
                            '<label><input type="checkbox" placeholder="Enter text" checked/><span></span></label>';
                    } else {
                        // deactivated
                        suspendActButton.innerHTML =
                            '<label><input type="checkbox" placeholder="Enter text" /><span></span></label>';
                    }

                    // Add classes using classList with error handling
                    const inputElement = suspendActButton.querySelector("input");
                    if (inputElement) {
                        inputElement.classList.add("input-class");
                    }

                    const labelElement = suspendActButton.querySelector("label");
                    if (labelElement) {
                        labelElement.classList.add("switch");
                    }
                    const spanElement = suspendActButton.querySelector("span");
                    if (spanElement) {
                        spanElement.classList.add("slider");
                    }
                    suspendActButton.addEventListener("change", async(e) => {
                        if (e.target.checked) {
                            //         await disable_note_with_noteid(row.noteid);
                            await setSubscriptionActiveStatusByUUID(row.subscriptionid, 1);
                        } else {
                            await setSubscriptionActiveStatusByUUID(row.subscriptionid, 0);
                            //           await enable_note_with_noteid(row.noteid);
                        }
                    });
                    cell_active.appendChild(suspendActButton);
                    cell_active.setAttribute('class', 'checkbox');
                    cell_active.setAttribute('name', 'active');

                    try {
                        cell_status.textContent = row.status;
                        cell_status.setAttribute('name', 'status');
                        cell_status.setAttribute('class', 'status');
                    } catch (e) {
                        console.debug(e);
                    }


                // Add button container
                const actionButtonContainer = document.createElement('div');
                actionButtonContainer.setAttribute('class', 'button-container');

                // Add delete button
                const deleteButtonContainer = document.createElement('div');
                deleteButtonContainer.setAttribute('class', 'delete_button');
                const deleteButton = document.createElement('img');
                deleteButton.src = "../icons/trash-can.transparent.40x40.png";
                deleteButton.alt = 'delete';
                deleteButton.setAttribute('class', 'delete_button');
                deleteButton.onclick = function () {
                    // Remove the row from the table
                    newRow.remove();
                    // call to API to delete row from data base
                    deleteSubscription(row.subscriptionid);
                };
                deleteButtonContainer.appendChild(deleteButton);
                actionButtonContainer.appendChild(deleteButtonContainer);

                // Add save/edit button

             
                // add enable/disable button
                const ableButton = document.createElement('button');

                if (row.status == "1" || row.status == 1) {
                    ableButton.setAttribute('name', 'disable');
                    ableButton.textContent = 'disable';
                    ableButton.onclick = function () {
                        // call to API to delete row from data base
                        disable_note_with_noteid(obj.noteid);
                    };
                } else {
                    ableButton.setAttribute('name', 'enable');
                    ableButton.textContent = 'enable';
                    ableButton.onclick = function () {
                        // call to API to delete row from data base
                        enable_note_with_noteid(obj.noteid);
                    };
                }
                cell_actions.appendChild(actionButtonContainer);
                cell_actions.setAttribute('name', 'actions');
                cell_actions.setAttribute('class', 'action-5');
                
                cell_actions.setAttribute('data-label', 'text');

                });
            });

        });
    }

// Function to use "fetch" to delete a data row
async function deleteSubscription(subscriptionid) {
    console.log("deleteSubscription: " + subscriptionid);
    try {

        const userid = "";
        console.log("deleting: " + subscriptionid);
        const message_body = '{ "subscriptionid":"' + subscriptionid + '" }';
        //console.log(message_body);
        const installationUniqueId = (await chrome.storage.local.get([plugin_uuid_header_name]))[plugin_uuid_header_name];

        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        

        console.log(installationUniqueId);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(server_url + URI_plugin_user_delete_subscription, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
                    [plugin_session_header_name]: session[plugin_session_header_name],
                },
                body: message_body // example IDs, replace as necessary
            });
        console.log(response);
        // Check for errors
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse JSON data
        const data = await response.json();

    } catch (error) {
        console.error(error);
    }
}

// seto event handler for sorting and filtering
setupTableFilteringAndSorting("subscribersTable");

/**
 * Navigate to the page where the note is attached
 *
 * Include all note information in the message
 * @param {*} url
 */
async function goThere(noteid, url, distributionlistid, datarow) {
    try {

        console.log("go to url: " + url);
        console.log("go lookup noteid: " + noteid);

        // issue a http redirect to open the URL in another browser tab
        //window.open(url, '_blank').focus();
        // add functionality to scroll to the note in question
        // invoke the background script to scroll to the note in question
        chrome.runtime.sendMessage({
            message: {
                action: "scroll_to_note",
                scroll_to_note_details: {
                    noteid: noteid,
                    url: url,
                    datarow: datarow

                }
            }
        }, function (response) {
            console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
            // finally, call "close" on the note
            //  try{
            //  	close_note(event);
            //  }catch(g){console.debug(g);}
        });

    } catch (error) {
        console.error(error);
    }
}



// Sort states for each column
const sortStates = {
    0: 'none', // None -> Ascending -> Descending -> None -> ...
    1: 'none'
};


function filterTable_a() {
    //  console.log("filterTable_a " );

    filterTable(event.target);
}


// Fetch data on page load

// Fetch data on page load

var valid_noteid_regexp = /^[a-zA-Z0-9\-\.\_]{20,100}$/;

// Function to use "fetch" to re-activate a data agreement
async function setSubscriptionActiveStatusByUUID(subscriptionid, activestatus) {
    console.debug("setSubscriptionActiveStatusByUUID: " + subscriptionid + " status: " + activestatus);
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";
        const message_body = JSON.stringify({
                subscriptionid: subscriptionid,
                activestatus: activestatus,
            });
        //console.log(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_set_subscription_active_status, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
                    [plugin_session_header_name]: session[plugin_session_header_name],
                },
                body: message_body, // example IDs, replace as necessary
            });
        //console.log(response);
        // Check for errors
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // update the row in the table

        // Parse JSON data
        const data = await response.json();
    } catch (error) {
        console.error(error);
    }
}

async function fetchSubscribers(distributionlistid) {
    console.log("fetchSubscribers for distributionlistid: " + distributionlistid);

    var ynInstallationUniqueId = "";
    var xYellownotesSession = "";

    let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
    let session = await chrome.storage.local.get([plugin_session_header_name]);

    ynInstallationUniqueId = plugin_uuid[plugin_uuid_header_name];
    xYellownotesSession = session[plugin_session_header_name];

    var msg = {
        distributionlistid: distributionlistid
    };
    if (distributionlistid == null) {
        msg = {};
    }
    const response = await fetch(server_url + "/api/v1.0/plugin_user_get_my_feed_subscribers", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [plugin_uuid_header_name]: ynInstallationUniqueId,
                [plugin_session_header_name]: xYellownotesSession,
            },
            body: JSON.stringify(msg)
        });

    if (!response.ok) {
        return (new Error('Network response was not ok'));
    } else {

        const data = await response.json();
        // Parse JSON data

        console.log(data);

        var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
        console.log(utc);
        console.log(Date.now());
        var now = new Date;
        var utc_timestamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
                now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
        console.log(utc_timestamp);
        console.log(new Date().toISOString());

        // Get table body element
        const tableBody = document.getElementById('subscribersTable').getElementsByTagName('tbody')[0];

        // Loop through data and populate the table
        data.forEach(row => {
            console.log(row);
            console.log(JSON.stringify(row));
            console.log(row.subscriptionid);

            // Create new row
            const newRow = tableBody.insertRow();
            newRow.setAttribute('subscriptionid', row.subscriptionid);
            newRow.setAttribute('selectablecol', "true");
            // Create cells and populate them with data

            const cell_displayname = newRow.insertCell(0);
            const cell_email = newRow.insertCell(1);
            const cell_subscribedate = newRow.insertCell(2);
            const cell_active = newRow.insertCell(3);
            const cell_status = newRow.insertCell(4);
            const cell_distributionlistname = newRow.insertCell(5);
            const cell_buttons = newRow.insertCell(5);
            // do not include a option for notes in this release

            try {
                cell_email.textContent = row.email;
                cell_email.setAttribute('name', 'email');
                cell_email.setAttribute('class', 'email');
            } catch (e) {
                console.debug(e);
            }

            // name
            try {
                cell_subscribedate.textContent = integerstring2timestamp(row.subscribedate);
                cell_subscribedate.setAttribute('name', 'subscribedate');
                cell_subscribedate.setAttribute('class', 'datetime');
            } catch (e) {
                console.debug(e);
            }

            try {
                cell_displayname.textContent = row.displayname;
                cell_displayname.setAttribute('name', 'displayname');
                cell_displayname.setAttribute('class', 'displayname');
            } catch (e) {
                console.debug(e);
            }

            // render a check box to enable/disable the note
            const suspendActButton = document.createElement("span");
            if (row.active == 1) {
                // active
                suspendActButton.innerHTML =
                    '<label><input type="checkbox" placeholder="Enter text" checked/><span></span></label>';
            } else {
                // deactivated
                suspendActButton.innerHTML =
                    '<label><input type="checkbox" placeholder="Enter text" /><span></span></label>';
            }

            // Add classes using classList with error handling
            const inputElement = suspendActButton.querySelector("input");
            if (inputElement) {
                inputElement.classList.add("input-class");
            }

            const labelElement = suspendActButton.querySelector("label");
            if (labelElement) {
                labelElement.classList.add("switch");
            }
            const spanElement = suspendActButton.querySelector("span");
            if (spanElement) {
                spanElement.classList.add("slider");
            }
            suspendActButton.addEventListener("change", async(e) => {
                if (e.target.checked) {
                    //         await disable_note_with_noteid(row.noteid);
                    await setSubscriptionActiveStatusByUUID(row.subscriptionid, 1);
                } else {
                    await setSubscriptionActiveStatusByUUID(row.subscriptionid, 0);
                    //           await enable_note_with_noteid(row.noteid);
                }
            });
            cell_active.appendChild(suspendActButton);
            cell_active.setAttribute('class', 'checkbox');

            try {
                cell_status.textContent = row.status;
                cell_status.setAttribute('name', 'status');
                cell_status.setAttribute('class', 'status');
            } catch (e) {
                console.debug(e);
            }

            // buttons
            // Add delete button
            /*
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = function () {
            // Remove the row from the table
            newRow.remove();
            // call to API to delete row from data base
            deleteDataRow(row.uuid);
            };
            cell_buttons.appendChild(deleteButton);
             */
            // Add location "go there" button

            // Add remove button
            const removeButton = document.createElement("button");
            removeButton.textContent = "delete";
            removeButton.classList.add("deleteBtn");
            removeButton.onclick = function () {
                // call to API to save row to data base
                deleteSubscription(row.subscriptionid);
            };

            cell_buttons.appendChild(removeButton);

        });
    }
}

// start populating data tables

//traverse_text(document.documentElement);
console.debug("################################################");
//console.debug(all_page_text);
//console.debug(textnode_map);

