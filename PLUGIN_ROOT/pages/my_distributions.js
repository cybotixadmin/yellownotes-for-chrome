
const table_name = "mydistributionlists";

const browser_id = chrome.runtime.id;

// check if the user is authenticated
checkSessionJWTValidity()
.then(isValid => {
    console.debug('JWT is valid:', isValid);
    if (isValid) {
        console.debug("JWT is valid - show menu accordingly");
        fetchAndDisplayStaticContent("../fragments/en_US/my_distributions_main.html", "my_distributions_main_text").then(() => {});
        fetchAndDisplayStaticContent("../fragments/en_US/my_distributions_top.html", "my_distributions_top_text").then(() => {});

        fetchAndDisplayStaticContent("../fragments/en_US/my_distributions_field_explanation.html", "my_distributions_field_explanations").then(() => {});

        const uuid = localStorage.getItem("creatorid");
        const replacements = {
            creatorid: uuid
        };
        fetchAndDisplayStaticContent("../fragments/en_US/sidebar_fragment_authenticated.html", "sidebar", replacements).then(() => {
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

const table_columns_to_not_display_keyname = table_name + "_hide_columns2";


const column_list =  ["name", "description",  "visibility", "restrictions",  "postcount", "subscriberscount", "createtime", "active_status","anonymous_allowed", "browsing_allowed", "automatic_enrolment" , "actions" ];


// which columns to display
// The users can decide which columns to display by ticking and unticking the checkboxes on a list of column names

document.getElementById('toggle-name').addEventListener('change', function () {
    toggleColumn('name', this.checked, table_name, table_columns_to_not_display_keyname);
});

document.getElementById('toggle-description').addEventListener('change', function () {
    toggleColumn('description', this.checked, table_name, table_columns_to_not_display_keyname);
});

document.getElementById('toggle-visibility').addEventListener('change', function () {
    toggleColumn('visibility', this.checked, table_name, table_columns_to_not_display_keyname);
});

document.getElementById('toggle-restrictions').addEventListener('change', function () {
    toggleColumn('restrictions', this.checked, table_name, table_columns_to_not_display_keyname);
});

document.getElementById('toggle-postcount').addEventListener('change', function () {
    toggleColumn('postcount', this.checked, table_name, table_columns_to_not_display_keyname);
});

document.getElementById('toggle-subscriberscount').addEventListener('change', function () {
    toggleColumn('subscriberscount', this.checked, table_name, table_columns_to_not_display_keyname);
});

document.getElementById('toggle-createtime').addEventListener('change', function () {
    toggleColumn('createtime', this.checked,table_name, table_columns_to_not_display_keyname);
});

document.getElementById('toggle-active_status').addEventListener('change', function () {
    toggleColumn('active_status', this.checked, table_name, table_columns_to_not_display_keyname);
});

document.getElementById('toggle-anonymous_allowed').addEventListener('change', function () {
    toggleColumn('anonymous_allowed', this.checked,table_name, table_columns_to_not_display_keyname);
});

document.getElementById('toggle-browsing_allowed').addEventListener('change', function () {
    toggleColumn('browsing_allowed', this.checked,table_name, table_columns_to_not_display_keyname);
});

document.getElementById('toggle-automatic_enrolment').addEventListener('change', function () {
    toggleColumn('automatic_enrolment', this.checked, table_name, table_columns_to_not_display_keyname);
});

document.getElementById('toggle-actions').addEventListener('change', function () {
    toggleColumn('actions', this.checked, table_name, table_columns_to_not_display_keyname);
});

document.getElementById('toggle-noteheader').addEventListener('change', function () {
    toggleColumn('noteheader', this.checked, table_name, table_columns_to_not_display_keyname);
});

// set table visibility defaults
// make this sensitive to the size screen the user is using

var not_show_by_default_columns = [];

// check if not_show_by_default_columns has been set
const pagewidth = window.innerWidth;
console.log("window.innerWidth: " + pagewidth);

if (pagewidth < 300) {
    not_show_by_default_columns = ["createtime", "restrictions", "actions"];
    console.debug("createtime", "restrictions", "actions");
} else if (pagewidth < 600) {
    not_show_by_default_columns = ["createtime", "restrictions"];
    console.debug("createtime", "restrictions");
} else if (pagewidth < 1000) {
    console.debug("createtime", "restrictions");
    not_show_by_default_columns = ["createtime", "restrictions"];
} else if (pagewidth < 1200) {

    not_show_by_default_columns = ["createtime", "restrictions"];
}

//
console.debug("not_show_by_default_columns: " + not_show_by_default_columns);
console.debug("table_columns_to_not_display_keyname: " + table_columns_to_not_display_keyname);
console.debug("calling getNotShowByDefaultColumns");
getNotShowByDefaultColumns_asynch(table_columns_to_not_display_keyname, not_show_by_default_columns).then(columns => {
    not_show_by_default_columns = columns;
    console.log(not_show_by_default_columns);
}).catch(error => {
    console.error('Error:', error);
});

// update the list of colmes and check/uncheck according to the list of columns to not display

//not_show_by_default_columns.forEach(column => {
//    console.debug("not show column: " + column);
//    toggleColumn(column, false,table_name, table_columns_to_not_display_keyname);
//    document.getElementById(`toggle-${column}`).checked = false;
//});


// call to database to get notes and place them in a table
console.debug("calling fetchData");
fetchData(not_show_by_default_columns)
.then(function (d) {
    console.log("toggle columns off by default");
    console.log(not_show_by_default_columns);
    not_show_by_default_columns.forEach(column => {
        toggleColumn(column, false, table_name, table_columns_to_not_display_keyname);
        document.getElementById(`toggle-${column}`).checked = false;
    });

// populate the column contaning a graphical  the note header
console.debug("calling processNodesWithAsyncFunction");
    processNodesWithAsyncFunction('div[name="noteheaderhtml"]');

});

// Function to use "fetch" to delete a data row
async function deleteDataRowByDistributionlistId(distributionlistid) {
    console.debug("deleteDataRowByDistributionlistId (" + distributionlistid + ")");
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";
        const message_body = JSON.stringify({
                distributionlistid: distributionlistid,
            }, );
        console.debug(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_delete_distribution_list, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
                    [plugin_session_header_name]: session[plugin_session_header_name],
                },
                body: message_body, // example IDs, replace as necessary
            });
        //console.debug(response);
        // Check for errors
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }else{

            // refresh the cache

            const cacheKey = URI_plugin_user_get_my_distribution_lists.replace(/\//g, "_");
          
    
            console.debug("Cache key: " + cacheKey);
         
    
           
            const cachetimeout = 0;
            const endpoint = server_url + URI_plugin_user_get_my_distribution_lists;
            const protocol = "GET";
    
            // Accept data from cache if it is less than 60 seconds old
            // Make changes to this timeout when there is a procedure to empty the cache if the value has been updated.
            console.debug("calling cachableCall2API_GET");
            cachableCall2API_GET(cacheKey, cachetimeout, protocol, endpoint)
            .then(function (data) {});
        }

        // Parse JSON data
        const data = await response.json();
    } catch (error) {
        console.error(error);
    }
}

// Function to use "fetch" to delete a data row
async function updateDataRowByUUID(distributionlistid) {
    console.debug("updateDataRowByUUID (" + distributionlistid + ")");
    try {

        const row = document.querySelector('tr[distributionlistid="' + distributionlistid + '"]');
        console.debug(row);
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";

        console.debug(row.querySelector('[name="anonymous_allowed"'));
        console.debug(row.querySelector('[name="anonymous_allowed"').textContent);
        console.debug(row.querySelector('[name="anonymous_allowed"').value);

        const checkbox = row.querySelector('[name="anonymous_allowed"').querySelector("input");
        console.debug(checkbox);
var anonymous_allowed = 0;
    if (checkbox.checked) {
        anonymous_allowed = 1;
    } else {
        anonymous_allowed = 0;
    }

    const browsing_checkbox = row.querySelector('[name="browsing_allowed"').querySelector("input");
    console.debug(browsing_checkbox);
var browsing_allowed = 0;
if (browsing_checkbox.checked) {
    browsing_allowed = 1;
} else {
    browsing_allowed = 0;
}

    var automatic_enrolment = 0;
    if (row.querySelector('[name="automatic_enrolment"').querySelector("input").checked) {
        automatic_enrolment = 1;
    } else {
        automatic_enrolment = 0;
    }

    var active = 0;
    if (row.querySelector('[name="active"').querySelector("input").checked) {
        active = 1;
    } else {
        active = 0;
    }

        const message_body = {
            distributionlistid: distributionlistid,
            name: row.querySelector('[name="name"').textContent,
            description: row.querySelector('[name="description"').textContent,
            visibility: row.querySelector('[name="visibility"]').querySelector("select").value,
            anonymous_allowed: anonymous_allowed,
            browsing_allowed: browsing_allowed,
            active: active,
            automatic_enrolment: automatic_enrolment,
            restrictions: row.querySelector('[name="restrictions"').textContent
        };

        console.debug(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_update_own_distributionlist, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
                    [plugin_session_header_name]: session[plugin_session_header_name],
                },
                body: JSON.stringify(message_body), // example IDs, replace as necessary
            });
        //console.debug(response);
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

// Function to use "fetch" to suspend a data agreement
async function deleteSubscriptionByUUID(subscriptionid) {
    console.debug("deleteSubscriptionByUUID (" + subscriptionid + ")");
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";
        const message_body = JSON.stringify({
                subscriptionid: subscriptionid
            });
        //console.debug(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_delete_subscription, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
                    [plugin_session_header_name]: session[plugin_session_header_name],
                },
                body: message_body, // example IDs, replace as necessary
            });
        //console.debug(response);
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

// Function to use "fetch" to suspend a data agreement
async function viewDistributionlist(distributionlistid) {
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";
        const message_body = JSON.stringify({
                distributionlistid: distributionlistid
            });
        //console.debug(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_get_distribution_list, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
                    [plugin_session_header_name]: session[plugin_session_header_name],
                },
                body: message_body, // example IDs, replace as necessary
            });
        //console.debug(response);
        // Check for errors
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // update the row in the table
        // Parse JSON data
        const data = await response.json();

        console.debug(data);
        console.debug(data[0]);

        //document.addEventListener('DOMContentLoaded', function() {
        // Find the element where the table will be added
        const container = document.getElementById('form');

        // Create the table
        const table = document.createElement('table');
        table.style.border = '1px solid black'; // Optional: style the table

        // Add rows and cells
        const row1 = table.insertRow();
        const cell1_1 = row1.insertCell(0);
        const cell1_2 = row1.insertCell(1);

        const row2 = table.insertRow();
        const cell2_1 = row2.insertCell(0);
        const cell2_2 = row2.insertCell(1);

        // Set non-editable cells
        cell1_1.textContent = 'Name';
        cell1_2.textContent = data[0].name;
        cell2_1.textContent = 'Description';
        cell2_2.textContent = data[0].description;

        // create teable for all members of this distribution list
        const row3 = table.insertRow();
        const cell3_1 = row3.insertCell();

        const member_table = document.createElement('table');
        member_table.style.border = '1px solid black'; // Optional: style the table

        const message_body2 = JSON.stringify({
                distributionlistid: distributionlistid
            });
        //console.debug(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const subscribersresponse = await fetch(
                server_url + "/api/v1.0/plugin_user_get_distribution_list_subscribers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
                    [plugin_session_header_name]: session[plugin_session_header_name],
                },
                body: message_body2, // example IDs, replace as necessary
            });
        //console.debug(response);
        // Check for errors
        if (!subscribersresponse.ok) {
            throw new Error(`HTTP error! status: ${subscribersresponse.status}`);
        }
        // update the row in the table
        // Parse JSON data
        const subscribersdata = await subscribersresponse.json();

        console.debug(subscribersdata);

        // Append the table to the container
        container.appendChild(table);

        const sub_table = document.createElement("table");

        subscribersdata.forEach((row) => {
            console.debug(row);
            // Create new row
            const newRow = sub_table.insertRow();
            // Create cells and populate them with data
            const cell1 = newRow.insertCell(0);
            const cell2 = newRow.insertCell(1);
            const cell3 = newRow.insertCell(2);
            const cell4 = newRow.insertCell(3);
            cell1.textContent = row.subscriptionid;
            cell2.textContent = row.userid;
            cell3.textContent = row.subscribedate;

            // originator: how or by whom the user was added to the distribution list
            cell4.textContent = row.originatorid;

            // Add delete button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "unsubscribe";
            deleteButton.classList.add("deleteBtn");
            deleteButton.onclick = function () {
                // Remove the row from the table
                newRow.remove();
                // call to API to delete row from data base
                deleteSubscriptionByUUID(row.subscriptionid);
            };

            const cell5 = newRow.insertCell(4);
            cell5.appendChild(deleteButton);

        });

        console.debug(sub_table);
        // Append the table to the container
        container.appendChild(sub_table);
        // add button to add a new subscriber
        // Add delete button
        const addSubscriberButton = document.createElement("button");
        addSubscriberButton.textContent = "add subscriber";
        addSubscriberButton.classList.add("addBtn");
        addSubscriberButton.onclick = function () {
            // call to API to delete row from data base
            add_subscriber(distributionlistid);

        };
        container.appendChild(addSubscriberButton);

    } catch (error) {
        console.error(error);
    }
}

// Function to use "fetch" to re-activate a data agreement
async function activateByUUID(distributionlistid) {
    console.debug("activateByUUID " + distributionlistid);

    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";
        const message_body = JSON.stringify({
                distributionlistid: distributionlistid,
                active: 1,
            });
        //console.debug(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_set_distributionlist_active_status, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
                    [plugin_session_header_name]: session[plugin_session_header_name],
                },
                body: message_body, // example IDs, replace as necessary
            });
        //console.debug(response);
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

// Function to use "fetch" to re-activate a data agreement
async function deactivateByUUID(distributionlistid) {
    console.debug("deactivateByUUID" + distributionlistid);
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";
        const message_body = JSON.stringify({
                distributionlistid: distributionlistid,
                active: 0,
            });
        //console.debug(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_set_distributionlist_active_status, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
                    [plugin_session_header_name]: session[plugin_session_header_name],
                },
                body: message_body, // example IDs, replace as necessary
            });
        //console.debug(response);
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

// Function to use "fetch" to re-activate a data agreement
async function setAnonymousByUUID(distributionlistid, anonymous_allowed) {
    console.debug("setAnonymousByUUID" + distributionlistid, " anonymous_allowed: " + anonymous_allowed);
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);

        const message_body = JSON.stringify({
                distributionlistid: distributionlistid,
                anonymous_allowed: anonymous_allowed,
            });
        //console.debug(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_set_distributionlist_anonymous_allowed_status, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
                    [plugin_session_header_name]: session[plugin_session_header_name],
                },
                body: message_body, // example IDs, replace as necessary
            });
        //console.debug(response);
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


// Function to use 
async function setBrowsingByUUID(distributionlistid, browsing_allowed) {
    console.debug("setBrowsingByUUID" + distributionlistid, " browsing_allowed: " + browsing_allowed);
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);

        const message_body = JSON.stringify({
                distributionlistid: distributionlistid,
                browsing_allowed: browsing_allowed,
            });
        //console.debug(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_set_distributionlist_browsing_allowed_status, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
                    [plugin_session_header_name]: session[plugin_session_header_name],
                },
                body: message_body, // example IDs, replace as necessary
            });
        //console.debug(response);
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

// Function to use "fetch" to re-activate a data agreement
async function setAutomaticByUUID(distributionlistid, automatic_enrolment) {
    console.debug("setAutomaticByUUID" + distributionlistid, " automatic_enrolment: " + automatic_enrolment);
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);

        const message_body = JSON.stringify({
                distributionlistid: distributionlistid,
                automatic_enrolment: automatic_enrolment,
            });
        //console.debug(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_set_distributionlist_automatic_enrolment_status, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
                    [plugin_session_header_name]: session[plugin_session_header_name],
                },
                body: message_body, // example IDs, replace as necessary
            });
        //console.debug(response);
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

// Function to suspend all data agreements (not already suspended)
async function suspendAll() {
    console.debug("suspendAll");
    try {
        var message = {
            type: "suspendAllDataAgreements",
            agreement_details: {},
        };

        console.debug(message);
        // send save request back to background
        chrome.runtime.sendMessage(message, function (response) {
            console.debug(
                "message sent to backgroup.js with response: " +
                JSON.stringify(response));
            // finally, call "close" on the note
        });
    } catch (e) {
        console.error(e);
    }
}

// Function to activate all data agreements (not already active)
function activateAll() {
    console.debug("activateAll");
    try {}
    catch (e) {
        console.error(e);
    }
}

function fetchData(not_show_by_default_columns) {
    console.debug("fetchData.start");
    console.debug(not_show_by_default_columns);
    return new Promise(
        function (resolve, reject) {
        var ynInstallationUniqueId = "";
        var xYellownotesSession = "";
        var distributionlists;
        var data;
        //const installationUniqueId = (await chrome.storage.local.get([plugin_uuid_header_name]))[plugin_uuid_header_name];
        console.debug("request: get_my_distribution_lists");
        // if update is to disable the note, remove it from the in-memory store
        const cacheKey = URI_plugin_user_get_my_distribution_lists.replace(/\//g, "_");
        //const cacheKey = "cacheKey0002";

        console.debug("Cache key: " + cacheKey);
        const currentTime = Date.now();

        console.debug("currentTime: " + currentTime);
        const cachetimeout = 10;
        const endpoint = server_url + URI_plugin_user_get_my_distribution_lists;
        const protocol = "GET";

        // Accept data from cache if it is less than 60 seconds old
        // Make changes to this timeout when there is a procedure to empty the cache if the value has been updated.
        console.debug("calling cachableCall2API_GET");
        cachableCall2API_GET(cacheKey, cachetimeout, protocol, endpoint)
        .then(function (data) {

            console.log(data);

            var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
            console.log(utc);
            console.log(Date.now());
            var now = new Date;
            var utc_timestamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
                    now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
            console.log(utc_timestamp);
            console.log(new Date().toISOString());
            console.debug(data);
            // Get table body element
            const tableBody = document
                .querySelector('table[name="' + table_name + '"]')
                .getElementsByTagName("tbody")[0];

            console.debug(tableBody);
            // loop through the existing table and delete all rowsnewTableRow2
            console.debug(tableBody.rows);
            console.debug(tableBody.rows.length);
            var list = tableBody.rows;
            try {
                if (tableBody.rows.length) {
                    for (var li = list.length - 1; li >= 0; li--) {
                        list[li].remove();
                    }
                }
            } catch (e) {
                console.error(e);
            }
            // Loop through data and (re-)populate the table with the results returned from the API
            data.forEach(rowData => {

                // Create new row
                newTableRow(rowData, tableBody, not_show_by_default_columns);

            });

            resolve('Data saved OK');
        });
    });
}

// setup table items for sorting and filtering
setupTableFilteringAndSorting(table_name);

// Sort states for each column
const sortStates = {
    0: "none", // None -> Ascending -> Descending -> None -> ...
    1: "none",
};

function newTableRow(rowData, tableBody, not_show_by_default_columns) {
    console.debug(rowData);
    const newRow = tableBody.insertRow();
    newRow.setAttribute("distributionlistid", rowData.distributionlistid);
    newRow.setAttribute('selectablecol', "true");
    // Create cells and populate them with data
    const cell_name = newRow.insertCell(0);
    const cell_description = newRow.insertCell(1);
    const cell_visibility = newRow.insertCell(2);
    const cell_restrictions = newRow.insertCell(3);
    const cell_postcount = newRow.insertCell(4);
    const cell_subscribercount = newRow.insertCell(5);
    const cell_createtime = newRow.insertCell(6);
    const cell_active_status = newRow.insertCell(7);
    const cell_anonymous_allowed = newRow.insertCell(8);
    const cell_browsing_allowed = newRow.insertCell(9);
    const cell_automatic_enrolment = newRow.insertCell(10);
    const cell_actions = newRow.insertCell(11);
    const cell_noteheader = newRow.insertCell(12);
    // name
    cell_name.textContent = rowData.name;
    cell_name.setAttribute("name", "name");
    cell_name.setAttribute("class", "displayname");
    cell_name.setAttribute("contenteditable", "true");
    if (not_show_by_default_columns.includes("name")) {
        cell_visibility.classList.add('hidden');

    }

    // description
    cell_description.textContent = rowData.description;
    cell_description.setAttribute("name", "description");
    cell_description.setAttribute("contenteditable", "true");
    cell_description.setAttribute("class", "displayname");
    if (not_show_by_default_columns.includes("description")) {
        cell_visibility.classList.add('hidden');
    }

    // Create a dropdown for the visibility
    const visibilityDropdown = document.createElement('select');
    const options = ['PUBLIC', 'PRIVATE', 'INCOGNITO'];

    options.forEach(optionValue => {
        const option = document.createElement('option');
        option.value = optionValue;
        option.textContent = optionValue;
        visibilityDropdown.appendChild(option);
    });

    // Set the selected value
    visibilityDropdown.value = rowData.visibility || 'PUBLIC';

    // Add dropdown to the table cell
    //const visibilityCell = newRow.insertCell(5);
    cell_visibility.appendChild(visibilityDropdown);
    cell_visibility.setAttribute("name", "visibility");
    cell_visibility.setAttribute("class", "compact");
    if (not_show_by_default_columns.includes("visibility")) {
        cell_visibility.classList.add('hidden');

    }

    // restrictions
    cell_restrictions.textContent = rowData.restrictions;
    cell_restrictions.setAttribute("name", "restrictions");

    cell_postcount.setAttribute("class", "text");

    if (not_show_by_default_columns.includes("restrictions")) {
        cell_subscribercount.classList.add('hidden');

    }

    // post count
    cell_postcount.textContent = rowData.postcount;
    cell_postcount.setAttribute("class", "compact number");
    cell_postcount.setAttribute("name", "postcount");

    if (not_show_by_default_columns.includes("postcount")) {
        cell_subscribercount.classList.add('hidden');

    }
    // subscriber count
    cell_subscribercount.textContent = rowData.subscriberscount;
    cell_subscribercount.setAttribute("class", "compact number");
    cell_subscribercount.setAttribute("name", "subscriberscount");

    if (not_show_by_default_columns.includes("subscriberscount")) {
        cell_subscribercount.classList.add('hidden');

    }

    // time of creation
    cell_createtime.setAttribute("value", "createdtime");
    cell_createtime.setAttribute("name", "createdtime");
    cell_createtime.setAttribute("class", "datetime");
    console.debug(rowData.createdtime);
    cell_createtime.textContent = reformatTimestamp(rowData.createdtime);
    if (not_show_by_default_columns.includes("created")) {
        cell_createtime.classList.add('hidden');

    }


    //Suspend/Active check switch
    const suspendActButton = document.createElement("span");
    if (rowData.active == 1) {
        // active
        suspendActButton.innerHTML =
            '<label><input type="checkbox" placeholder="active" checked/><span></span></label>';
    } else {
        // deactivated
        suspendActButton.innerHTML =
            '<label><input type="checkbox" placeholder="active" /><span></span></label>';
    }

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
    suspendActButton.addEventListener("change", async (e) => {
        if (e.target.checked) {
            await activateByUUID(rowData.distributionlistid);
        } else {
            await deactivateByUUID(rowData.distributionlistid);
        }
    });
    cell_active_status.appendChild(suspendActButton);
    cell_active_status.setAttribute("class", "checkbox");
    cell_active_status.setAttribute("name", "active");
    if (not_show_by_default_columns.includes("active")) {
        cell_active_status.classList.add('hidden');

    }

    //anonymous enrolment allowed check switch
    const anonActButton = document.createElement("span");
    if (rowData.anonymous_allowed == 1) {
        // active
        anonActButton.innerHTML =
            '<label><input type="checkbox" placeholder="active" checked/><span></span></label>';
    } else {
        // deactivated
        anonActButton.innerHTML =
            '<label><input type="checkbox" placeholder="active" /><span></span></label>';
    }

  


    const anonInputElement = anonActButton.querySelector("input");
    if (anonInputElement) {
        anonInputElement.classList.add("input-class");
    }

    const anonLabelElement = anonActButton.querySelector("label");
    if (anonLabelElement) {
        anonLabelElement.classList.add("switch");
    }
    const anonSpanElement = anonActButton.querySelector("span");
    if (anonSpanElement) {
        anonSpanElement.classList.add("slider");
    }
    anonActButton.addEventListener("change", async (e) => {
        if (e.target.checked) {
            await setAnonymousByUUID(rowData.distributionlistid, 1);
        } else {
            await setAnonymousByUUID(rowData.distributionlistid, 0);
        }
    });
    cell_anonymous_allowed.appendChild(anonActButton);
    cell_anonymous_allowed.setAttribute("name", "anonymous_allowed");
    cell_anonymous_allowed.setAttribute("class", "checkbox");

    //
    console.debug("automatic enrolment: " + rowData.automatic_enrolment);
    console.debug(rowData.automatic_enrolment == 1);

    //automatic enrolment check switch
    const autoActButton = document.createElement("span");
    if (rowData.automatic_enrolment == 1) {
        // active
        autoActButton.innerHTML =
            '<label><input type="checkbox" placeholder="active" checked/><span></span></label>';
    } else {
        // deactivated
        autoActButton.innerHTML =
            '<label><input type="checkbox" placeholder="active" /><span></span></label>';
    }

    const autoInputElement = autoActButton.querySelector("input");
    if (autoInputElement) {
        autoInputElement.classList.add("input-class");
    }

    const autoLabelElement = autoActButton.querySelector("label");
    if (autoLabelElement) {
        autoLabelElement.classList.add("switch");
    }
    const autoSpanElement = autoActButton.querySelector("span");
    if (autoSpanElement) {
        autoSpanElement.classList.add("slider");
    }
    autoActButton.addEventListener("change", async (e) => {
        if (e.target.checked) {
            await setAutomaticByUUID(rowData.distributionlistid, 1);
        } else {
            await setAutomaticByUUID(rowData.distributionlistid, 0);
        }
    });
    cell_automatic_enrolment.appendChild(autoActButton);
    cell_automatic_enrolment.setAttribute("class", "checkbox");
    cell_automatic_enrolment.setAttribute("name", "automatic_enrolment");


      //browsing allowed check switch
      const browsingActButton = document.createElement("span");
      if (rowData.automatic_enrolment == 1) {
          // active
          browsingActButton.innerHTML =
              '<label><input type="checkbox" placeholder="active" checked/><span></span></label>';
      } else {
          // deactivated
          browsingActButton.innerHTML =
              '<label><input type="checkbox" placeholder="active" /><span></span></label>';
      }
  
      const browseInputElement = browsingActButton.querySelector("input");
      if (browseInputElement) {
          browseInputElement.classList.add("input-class");
      }
  
      const browseLabelElement = browsingActButton.querySelector("label");
      if (browseLabelElement) {
          browseLabelElement.classList.add("switch");
      }
      const browseSpanElement = browsingActButton.querySelector("span");
      if (browseSpanElement) {
        browseSpanElement.classList.add("slider");
      }
      browsingActButton.addEventListener("change", async (e) => {
          if (e.target.checked) {
              await setBrowsingByUUID(rowData.distributionlistid, 1);
          } else {
              await setBrowsingByUUID(rowData.distributionlistid, 0);
          }
      });
      cell_browsing_allowed.appendChild(browsingActButton);
      cell_browsing_allowed.setAttribute("class", "checkbox");
      cell_browsing_allowed.setAttribute("name", "browsing_allowed");
  


    //
    // action buttons
    //
    // Add delete button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("deleteBtn");
    deleteButton.onclick = function () {
        // Remove the row from the table
        newRow.remove();
        // call to API to delete row from data base
        deleteDataRowByDistributionlistId(rowData.distributionlistid);
    };

    // Add View Notes button
    //const viewNotesButton = document.createElement("button");
    //viewNotesButton.textContent = "View";
    //viewNotesButton.classList.add("viewBtn");
    // viewNotesButton.onclick = function () {
    // call to API to delete row from data base
    //     viewDistributionlist(rowData.distributionlistid);
    // };
    const viewNotesButton = document.createElement("a");
    viewNotesButton.classList.add("viewBtn");
    //viewNotesButton.innerHTML =  '<a href="/api/v1.0/plugin_user_get_all_distributionlist_notes?distributionlistid' + rowData.distributionlistid + '"><button>View</button></a>'
    viewNotesButton.innerHTML = '<a href="/pages/view_own_distributionlist.html?distributionlistid=' + rowData.distributionlistid + '"><button>Notes</button></a>';

    // Add View subscribers button
    //const viewNotesButton = document.createElement("button");
    //viewNotesButton.textContent = "View";
    //viewNotesButton.classList.add("viewBtn");
    // viewNotesButton.onclick = function () {
    // call to API to delete row from data base
    //     viewDistributionlist(rowData.distributionlistid);
    // };
    const viewSubscribersButton = document.createElement("a");
    viewSubscribersButton.classList.add("viewBtn");
    //viewNotesButton.innerHTML =  '<a href="/api/v1.0/plugin_user_get_all_distributionlist_notes?distributionlistid' + rowData.distributionlistid + '"><button>View</button></a>'
    viewSubscribersButton.innerHTML = '<a href="/pages/view_own_subscribers.html?distributionlistid=' + rowData.distributionlistid + '"><button>Subscribers</button></a>';

    // Add save button
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.classList.add("deleteBtn");
    saveButton.onclick = function () {
        // call to API to save row to data base
        console.debug("calling updateDataRowByUUID");
        updateDataRowByUUID(rowData.distributionlistid);
    };

    // Add create invite button
    const createInviteButton = document.createElement("button");

    // title="Click to copy the invitation URL to your clipboard"
    createInviteButton.title = "Click to create an invition to subscribe link, and copy it to the clipboard";
    createInviteButton.textContent = "Invite";
    createInviteButton.classList.add("deleteBtn");
    createInviteButton.onclick = function () {
        // call to API to save row to data base
        createOpenInvitation(rowData.distributionlistid);
    };

    cell_actions.appendChild(viewNotesButton);
    cell_actions.appendChild(viewSubscribersButton);
    cell_actions.appendChild(deleteButton);
    cell_actions.appendChild(saveButton);
    cell_actions.appendChild(createInviteButton);
    cell_actions.setAttribute("class", "action-5");


    // Add container for displaying the note header
    const noteheaderContainer = document.createElement("div");
    noteheaderContainer.classList.add("noteheader2");
    noteheaderContainer.setAttribute("name", "noteheaderhtml");
    noteheaderContainer.textContent = "Delete";
    const noteheaderLink = document.createElement("a");

    noteheaderLink.appendChild(noteheaderContainer);
    noteheaderLink.setAttribute("href", "/pages/view_own_distributionlist.html?distributionlistid=" + rowData.distributionlistid );
    
    cell_noteheader.appendChild(noteheaderLink);
    

  //  viewNotesButton.innerHTML = '<a href="/pages/view_own_distributionlist.html?distributionlistid=' + rowData.distributionlistid + '"><button>Notes</button></a>';


}

/**
 * Execute a promisified function on each DOM node returned by querySelectorAll
 * and insert the result as a child of that node.
 * 
 * @param {string} selector - The CSS selector to query the DOM nodes.
 * @param {Function} asyncFunction - A promisified function that takes a DOM node as input
 *                                    and returns a promise resolving to a value.
 */
 function processNodesWithAsyncFunction(selector, asyncFunction) {
    console.debug("processNodesWithAsyncFunction.start");
    console.debug("selector: ", selector);
    //console.debug("asyncFunction: ", asyncFunction);
    // Select all DOM nodes matching the given selector
    const nodes = document.querySelectorAll(selector);

        // Process each node
        nodes.forEach((node) => {
            console.debug("node: ", node);
            console.debug(node);
            console.debug(node.parentElement);
            console.debug(node.parentElement.parentElement);
            console.debug(node.parentElement.parentElement.parentElement);
            console.debug(node.parentElement.parentElement.parentElement.getAttribute("distributionlistid"));
            distributionlistid = node.parentElement.parentElement.parentElement.getAttribute("distributionlistid");
            // Execute the async function and handle the result with `.then` and `.catch`
            setNoteHeader(node, distributionlistid)
                .then((result) => {
                    // Create a text node or use the result as an element
                    const childNode = document.createTextNode(result);

                    const noteheaderLink = document.createElement("a");
                    noteheaderLink.appendChild(childNode);
                    noteheaderLink.setAttribute("href", "/pages/view_own_distributionlist.html?distributionlistid=" + distributionlistid );
                    // Append the result as a child of the current DOM node
                    //node.appendChild(noteheaderLink);
                    node.appendChild(noteheaderLink);
                })
                .catch((error) => {
                    console.error(`Error processing node: ${node}`, error);
                });
        });
}



// create the URL that when clicked on adds the user to the distribution list
// append a redirecturi that redicts the the page showing the distribution list

function setNoteHeader(node, distributionlistid) {
    console.debug("netNoteHeader (" + node + ")");


   

    // create a small window/form to add a new distribution list
    return new Promise((resolve, reject) => {
// call to background to get the noteheaderhtml for the selected distribution list
const msg = {
    "action": "get_noteheaderhtml",
    "distributionlistid": distributionlistid,
    "creatorid": "creatorid"
};
console.debug(msg);

chrome.runtime.sendMessage(msg, function (response) {
    console.debug("message sent");
    console.debug(response);
    console.debug(response.noteheader_html);
    // update the note header with the new note header
    node.innerHTML = response.noteheader_html;
    // update the note object root DOM node with the distribution list id
    //note_root.setAttribute("distributionlistid", distributionlistid);


    
    
});
});

}

// create the URL that when clicked on adds the user to the distribution list
// append a redirecturi that redicts the the page showing the distribution list

function createOpenInvitation(distributionlistid) {
    console.debug("createOpenInvitation (" + distributionlistid + ")");
    // create a small window/form to add a new distribution list


}

function prettyFormatTimestamp(timestamp) {
    const date = new Date(timestamp);
    //const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',  timeZoneName: 'short' };
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZoneName: 'short'
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
}

function filterTable_a() {
    //  console.debug("filterTable_a " );

    filterTable(event.target);
}

function filterTable(colheader) {
    const columnIndex = colheader.parentNode.getAttribute("colindex");
    //console.debug(colheader);
    console.debug("filter on col: " + columnIndex);
    //const input = colheader;
    const filter = colheader.value.toUpperCase();
    const table = document.getElementById("dataTable");
    const rows = table
        .getElementsByTagName("tbody")[0]
        .getElementsByTagName("tr");
    //console.debug("filter column:" + columnIndex);
    //console.debug("filter value:" + filter);

    for (let i = 0; i < rows.length; i++) {
        const cell = rows[i].getElementsByTagName("td")[columnIndex];
        //console.debug(cell);
        if (cell) {
            const content = cell.innerText || cell.textContent;
            if (new RegExp(filter, "i").test(content)) {
                //        console.debug("not sho");
                rows[i].style.display = "";
            } else {
                rows[i].style.display = "none";
            }
        }
    }
}

// Fetch data on page load
//fetchData();


document
.getElementById("distributionsActivateAllButton")
.addEventListener("click", async function () {
    activateAllDistributions();
});

document
.getElementById("distributionsSuspendAllButton")
.addEventListener("click", function () {
    deactivateAllDistributions();
});

document
.getElementById("distributionsAddButton")
.addEventListener("click", function () {
    add_distribution();
});

async function add_distribution() {
    console.debug("add_distribution");
    // create a small window/form to add a new distribution list

    var tableHTML = '<table name="new_distributionlist" class="formTable" border="1">';

    // Add table headers
    //  tableHTML += '<tr><th>Name</th><th>Age</th><th>City</th></tr>';

    // Add a few rows of sample data
    tableHTML += '<tr><td>Name</td><td class="editabletext" id="createdistributionname" contenteditable="true" style="border: 1px solid black;">Enter a name</td></tr>';
    tableHTML += '<tr><td>Description</td><td class="editabletext" id="createdistributiondescription" contenteditable="true" style="border: 1px solid black;">Enter a description</td></tr>';
    //tableHTML += '<tr><td>Visibility</td><td style="border: 1px solid black;">Enter a description</td></tr>';

    // Add new row with dropdown in the second cell
    tableHTML += '<tr>';
    tableHTML += '<td>Visibility of this feed: \nTo anyone ("PUBLIC") \nonly to subscribers("PRIVATE")</td>'; // First cell
    tableHTML += '<td style="border: 1px solid black;">'; // Start second cell
    tableHTML += '<select id="visibilityDropdown">>';
    tableHTML += '<option value="PUBLIC" selected>PUBLIC</option>';
    tableHTML += '<option value="PRIVATE">PRIVATE</option>';
    //tableHTML += '<option value="OPEN">OPEN</option>';
    tableHTML += '</select>';
    tableHTML += '</td>'; // End second cell
    tableHTML += '</tr>';

    // Close the table tag
    tableHTML += '</table>';

    // Insert the table into the 'form' element
    document.getElementById('form').innerHTML = tableHTML;

    document.getElementById('createdistributionname').addEventListener('click', function () {
        console.debug("click");
        if (this.textContent === 'Enter a name') {
            this.textContent = '';
        }
    });

    document.getElementById('createdistributiondescription').addEventListener('click', function () {
        if (this.textContent === 'Enter a description') {
            this.textContent = '';
        }
    });

    //document.addEventListener('DOMContentLoaded', function() {
    // Find the element where the table will be added
    const container = document.getElementById('form');

    // create button to send data on new distributionlist/feed to API
    const button = document.createElement('button');
    button.id = 'addform_button';
    button.setAttribute("style", "align: middle;");
    button.textContent = 'Submit';
    container.appendChild(button);
    console.debug(container);

    // Find the button and add an event listener
    const createDistributionlistButton = document.getElementById('addform_button');

    createDistributionlistButton.addEventListener('click', function () {
        console.debug("createDistributionlistButton clicked");
        // Extract data from table
        //const table = document.querySelector('#form table');
        console.debug(document.getElementById('form'));
        console.debug(document.getElementById('form').getElementsByTagName('table')[0]);
        const table = document.getElementById('form').getElementsByTagName('table')[0];
        console.debug(table);
        console.debug(table.rows[0]);
        // const id = table.rows[1].cells[1].textContent; // Get text from second cell of the first row
        // const name = table.rows[1].cells[1].textContent; // Get text from second cell of the first row

        //    const description = table.rows[2].cells[1].textContent; // Get text from second cell of the second row
        console.debug(document.getElementById('createdistributionname'));
        const name = document.getElementById('createdistributionname').textContent;

        //      const description = table.rows[2].cells[1].textContent; // Get text from second cell of the second row
        const description = document.getElementById('createdistributiondescription').textContent;

        const visibility = document.getElementById('visibilityDropdown').value; // Get text from second cell of the second row

        console.debug("name: " + name);
        console.debug("description: " + description);

        var ynInstallationUniqueId = "";
        var xYellownotesSession = "";

        if (name != "Enter a name" && description != "Enter a description") {

            chrome.storage.local.get([plugin_uuid_header_name]).then(
                function (result) {
                ynInstallationUniqueId = result[plugin_uuid_header_name];
                console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);
                return chrome.storage.local.get([plugin_session_header_name]);
            }).then(function (result) {
                xYellownotesSession = result[plugin_session_header_name];
                console.debug("xYellownotesSession: " + xYellownotesSession);

                // let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);

                // let session = await chrome.storage.local.get([plugin_session_header_name]);

                // Fetch data from web service (replace with your actual API endpoint)

                const msg = {
                    "name": name,
                    "description": description,
                    "visibility": visibility
                }
                console.debug(msg);
                // Send data using fetch
                return fetch('https://api.yellownotes.cloud/api/v1.0/plugin_user_create_distributionlist', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [plugin_uuid_header_name]: ynInstallationUniqueId,
                        [plugin_session_header_name]: xYellownotesSession,
                    },
                    body: JSON.stringify(msg)
                });
            })
            .then(response => response.json())
            .then(function (data) {
                console.debug('Success:', data);

                // update the list of distribution lists with the one just created
                // append the new row to the table of existing distributions lists
                // const dataTable = document.querySelector('table[name="dataTable"]');
                const tableBody = document
                    .querySelector('table[name="'+table_name+'"]')
                    .getElementsByTagName("tbody")[0];
                data.subscriberscount = 0;
                data.postcount = 0;

                newTableRow(data, tableBody, not_show_by_default_columns);
              

// remove the form 
// name="new_distributionlist"
document.querySelector('table.formTable').remove();

                // Usage: Pass the ID of the parent element to cleanup
                removeAllChildren('form');

// call to refresh the cache 
const cacheKey = URI_plugin_user_get_my_distribution_lists.replace(/\//g, "_");
//const cacheKey = "cacheKey0002";

console.debug("Cache key: " + cacheKey);
//const currentTime = Date.now();

//console.debug("currentTime: " + currentTime);
const cachetimeout = 0;
const endpoint = server_url + URI_plugin_user_get_my_distribution_lists;
const protocol = "GET";

// set cache timeout to 0 to ensure the API-call is made and the data in the cache is completely refreshed
// Make changes to this timeout when there is a procedure to empty the cache if the value has been updated.
return cachableCall2API_GET(cacheKey, cachetimeout, protocol, endpoint);
            }).then(function (data) {
    console.debug(data);
    





            }).catch((error) => console.error('Error:', error));

        } else {
            alert("Please enter a name and a description");
        }
    });

    // create button to cancel distributionlist/feed to API
    const buttoncancel = document.createElement('button');
    buttoncancel.id = 'cancelform_button';
    buttoncancel.setAttribute("style", "align: middle;");
    buttoncancel.textContent = 'Cancel';
    container.appendChild(buttoncancel);
    console.debug(container);

    // Find the button and add an event listener
    const cancelDataButton = document.getElementById('cancelform_button');

    cancelDataButton.addEventListener('click', function () {
        // cancel button clicked
        console.debug("cancel button clicked");
        document.querySelector('table.formTable').remove();
        document.querySelector('#cancelform_button').remove();
        document.querySelector('#addform_button').remove();

    });

}

function reformatTimestamp(originalTimestamp) {
    console.debug("reformatTimestamp");
    console.debug(originalTimestamp);

    let[date, time1, rest] = originalTimestamp.split(/[T\.]/);
    console.debug(date);
    console.debug(time1);
    console.debug(rest);

    return (date + " " + time1);

    // Replace month names with numbers and adjust format
    const months = {
        Jan: '01',
        Feb: '02',
        Mar: '03',
        Apr: '04',
        May: '05',
        Jun: '06',
        Jul: '07',
        Aug: '08',
        Sep: '09',
        Oct: '10',
        Nov: '11',
        Dec: '12'
    };
    let[month, day, year, time] = originalTimestamp.split(/[\s,]+/);
    console.debug(month);
    console.debug(day);
    console.debug(year);
    console.debug(time);

    month = months[month];

    // Adjust for 24-hour time format
    let[hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);

    if (hours === 24) {
        hours = 0;
        // Increment the day, noting that this won't handle month/year boundaries correctly
        day = parseInt(day, 10) + 1;
    }

    // Ensure two-digit format for day and hours
    day = day.toString().padStart(2, '0');
    hours = hours.toString().padStart(2, '0');

    // Combine into new format
    return `${year}-${month}-${day} ${hours}:${minutes.toString().padStart(2, '0')}:00`;
}

async function add_subscriber(distributionlistid) {
    console.debug("add_subscriber to " + distributionlistid);
    // create a small window/form to add a new distribution list


    //document.addEventListener('DOMContentLoaded', function() {
    // Find the element where the table will be added
    const container = document.getElementById('form');

    // Create the table
    const table = document.createElement('table');
    table.style.border = '1px solid black'; // Optional: style the table

    // Add rows and cells
    const row1 = table.insertRow();
    const cell1_1 = row1.insertCell();
    const cell1_2 = row1.insertCell();

    // Set non-editable cells
    cell1_1.textContent = 'Name';
    //cell2_1.textContent = 'Description';

    // Set editable cells with placeholder text
    cell1_2.contentEditable = true;
    cell1_2.style.border = '1px solid black'; // Optional: style the cell
    cell1_2.textContent = 'Enter an email address';
    cell1_2.addEventListener('click', function () {
        if (this.textContent === 'Enter an email address') {
            this.textContent = '';
        }
    });

    // Append the table to the container
    container.appendChild(table);

    // create button to send data to API
    const button = document.createElement('button');
    button.id = 'new-subscriber';
    button.setAttribute('style', 'left: 200px;');
    button.textContent = 'add';
    container.appendChild(button);
    console.debug(container);

    // Find the button and add an event listener
    const sendDataButton = document.getElementById('new-subscriber');

    sendDataButton.addEventListener('click', function () {
        // Extract data from table
        //const table1 = document.querySelector('#table-container table');
        const email = table.rows[0].cells[1].textContent; // Get text from second cell of the first row
        //const description = table.rows[1].cells[1].textContent; // Get text from second cell of the second row

        var ynInstallationUniqueId = "";
        var xYellownotesSession = "";
        const msg = {
            "email": email,
            "distributionlistid": distributionlistid

        }
        console.debug(msg);
        chrome.storage.local.get([plugin_uuid_header_name]).then(
            function (result) {
            ynInstallationUniqueId = result[plugin_uuid_header_name];
            console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);
            return chrome.storage.local.get([plugin_session_header_name]);
        }).then(function (result) {
            xYellownotesSession = result[plugin_session_header_name];
            console.debug("xYellownotesSession: " + xYellownotesSession);

            // let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);

            // let session = await chrome.storage.local.get([plugin_session_header_name]);

            // Fetch data from web service (replace with your actual API endpoint)

            // Send data using fetch
            return fetch('https://api.yellownotes.cloud/api/plugin_user_add_distribution_list_subscriber', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [plugin_uuid_header_name]: ynInstallationUniqueId,
                    [plugin_session_header_name]: xYellownotesSession,
                },
                body: JSON.stringify(msg)
            });
        })
        .then(response => response.json())
        .then(function (data) {
            console.debug('Success:', data);
            // Usage: Pass the ID of the parent element to cleanup
            removeAllChildren('form');

        }).catch((error) => console.error('Error:', error));
    });

}

async function remove_subscriber(subscriptionid, distributionlistid) {
    console.debug("remove_subscriber");
    // create a small window/form to add a new distribution list

    //document.addEventListener('DOMContentLoaded', function() {
    // Find the element where the table will be added
    const container = document.getElementById('form');

    // Create the table
    const table = document.createElement('table');
    table.style.border = '1px solid black'; // Optional: style the table

    // Add rows and cells
    const row1 = table.insertRow();
    const cell1_1 = row1.insertCell();
    const cell1_2 = row1.insertCell();

    // Set non-editable cells
    cell1_1.textContent = 'Name';
    //cell2_1.textContent = 'Description';

    // Set editable cells with placeholder text
    cell1_2.contentEditable = true;
    cell1_2.style.border = '1px solid black'; // Optional: style the cell
    cell1_2.textContent = 'Enter a name';
    cell1_2.addEventListener('click', function () {
        if (this.textContent === 'Enter an email address') {
            this.textContent = '';
        }
    });

    // Append the table to the container
    container.appendChild(table);

    // create button to send data to API
    const button = document.createElement('button');
    button.id = 'send-data';
    button.textContent = 'add subscriber';
    container.appendChild(button);
    console.debug(container);

    // Find the button and add an event listener
    const sendDataButton = document.getElementById('send-data');

    sendDataButton.addEventListener('click', function () {
        // Extract data from table
        //const table1 = document.querySelector('#table-container table');
        const email = table.rows[0].cells[1].textContent; // Get text from second cell of the first row
        //const description = table.rows[1].cells[1].textContent; // Get text from second cell of the second row

        var ynInstallationUniqueId = "";
        var xYellownotesSession = "";

        chrome.storage.local.get([plugin_uuid_header_name]).then(
            function (result) {
            ynInstallationUniqueId = result[plugin_uuid_header_name];
            console.debug("ynInstallationUniqueId: " + ynInstallationUniqueId);
            return chrome.storage.local.get([plugin_session_header_name]);
        }).then(function (result) {
            xYellownotesSession = result[plugin_session_header_name];
            console.debug("xYellownotesSession: " + xYellownotesSession);

            // let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);

            // let session = await chrome.storage.local.get([plugin_session_header_name]);

            // Fetch data from web service (replace with your actual API endpoint)

            // Send data using fetch
            return fetch('https://api.yellownotes.cloud/api/plugin_user_delete_subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [plugin_uuid_header_name]: ynInstallationUniqueId,
                    [plugin_session_header_name]: xYellownotesSession,
                },
                body: JSON.stringify({
                    "subscriptionid": subscriptionid,
                    "distributionlistid": distributionlistid

                })
            });
        })
        .then(response => response.json())
        .then(function (data) {
            console.debug('Success:', data);
            // Usage: Pass the ID of the parent element to cleanup
            removeAllChildren('form');

        }).catch((error) => console.error('Error:', error));
    });
}

function removeAllChildren(parentElementId) {
    console.debug("removeAllChildren");
    // Get the parent element by its ID
    const parent = document.getElementById(parentElementId);

    // Continue removing the first child as long as the parent has a child node
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

async function activateAllDistributions() {
    console.debug("activateAllDistributions");
    try {

        // update the form to show the new state of the subscriptions

        const checkboxes = document.getElementById('dataTable').querySelectorAll('input[type="checkbox"]');
        console.debug(checkboxes);
        // Iterate over the checkboxes and uncheck them
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });

        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);

        let session = await chrome.storage.local.get([plugin_session_header_name]);

        const headers = {
            "Content-Type": "application/json",
            [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
            [plugin_session_header_name]: session[plugin_session_header_name],
        };
        const body = JSON.stringify({
                "active": 1
            });

        const response = await fetch(
                server_url + '/api/v1.0/plugin_user_set_all_distributionlist_active_status', {
                method: "POST",
                headers,
                body,
            });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.debug(error);
    }
}

async function deactivateAllDistributions() {
    console.debug("deactivateAllDistributions");
    try {

        // update the form to show the new state of the subscriptions

        const checkboxes = document.getElementById('dataTable').querySelectorAll('input[type="checkbox"]');
        console.debug(checkboxes);
        // Iterate over the checkboxes and uncheck them
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const headers = {
            "Content-Type": "application/json",
            [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
            [plugin_session_header_name]: session[plugin_session_header_name],
        };
        const body = JSON.stringify({
                "active": 0
            });
        const response = await fetch(
                server_url + '/api/v1.0/plugin_user_set_all_distributionlist_active_status', {
                method: "POST",
                headers,
                body,
            });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.debug(error);
    }
}

function extractAgreementIds() {
    const table = document.getElementById("dataTable");
    const rows = table.getElementsByTagName("tbody")[0].rows;
    const agreementIds = [];

    for (let i = 0; i < rows.length; i++) {
        const agreementId = rows[i].cells[0].textContent;
        agreementIds.push({
            agreementid: agreementId
        });
    }

    return agreementIds;
}
