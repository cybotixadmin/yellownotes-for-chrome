


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


// which columns to display
// The users can decide which columns to display

document.getElementById('toggle-created').addEventListener('change', function () {
    toggleColumn('created', this.checked, "dataTable");
});

document.getElementById('toggle-modified').addEventListener('change', function () {
    toggleColumn('modified', this.checked, "dataTable";
});

document.getElementById('toggle-type').addEventListener('change', function () {
    toggleColumn('type', this.checked, "dataTable");
});

document.getElementById('toggle-feed').addEventListener('change', function () {
    toggleColumn('feed', this.checked, "dataTable");
});
document.getElementById('toggle-message').addEventListener('change', function () {
    toggleColumn('message', this.checked, "dataTable");
});

document.getElementById('toggle-selected').addEventListener('change', function () {
    toggleColumn('selected', this.checked, "dataTable");
});

document.getElementById('toggle-active').addEventListener('change', function () {
    toggleColumn('active', this.checked, "dataTable");
});

document.getElementById('toggle-action').addEventListener('change', function () {
    toggleColumn('action', this.checked, "dataTable");
});

document.getElementById('toggle-location').addEventListener('change', function () {
    toggleColumn('location', this.checked, "dataTable");
});




function toggleColumn(columnName, isChecked) {
    console.log("toggleColumn: " + columnName + " isChecked: " + isChecked);
    var table = document.querySelector('table[name = "dataTable"]');
    // find out which column has the name columnName
    console.log(table);
    // thead tr:nth-child(2)
    var col = table.querySelector('thead tr:nth-child(1)').querySelector('[name = "' + columnName + '"]');
    console.log(col);
    const columnIndex = getElementPosition(col);
    console.log(getElementPosition(col));
  
    if (!isChecked) {
        table.querySelectorAll('tr').forEach(row => {
            // console.log(row);
            // console.log(row.cells[columnIndex].classList);
  
            row.cells[columnIndex].classList.add("hidden");
        });
  
    } else {
        table.querySelectorAll('tr').forEach(row => {
  
            //console.log(row);
            //console.log(row.cells[columnIndex].classList);
            row.cells[columnIndex].classList.remove("hidden");
        });
  
    }
  
   
  }

// set table visibility defaults
// make this sensitive to the size screen the user is using

var not_show_by_default_columns = [];

const pagewidth = window.innerWidth;
console.log("window.innerWidth: " + pagewidth);

if (pagewidth < 300) { 
    not_show_by_default_columns = ["created", "modified", "type", "feed", "selected", "active", "action" ];
}else if (pagewidth < 600) {
    not_show_by_default_columns = ["created", "type", "selected", "active", "action"];

}else if (pagewidth < 1000) {
    not_show_by_default_columns = ["created",  "type", "selected", "active", "action"];
} else if (pagewidth < 1200) {
    not_show_by_default_columns = [];
}

// Function to use "fetch" to delete a data row
async function deleteDataRow(subscriptionid) {
    console.log("deleteDataRow: " + subscriptionid);
    try {

        const userid = "";
        console.log("deleting: " + subscriptionid);
        const message_body = '{ "subscriptionid":"' + subscriptionid + '" }';
        //console.log(message_body);
        const installationUniqueId = (await chrome.storage.local.get([plugin_uuid_header_name]))[plugin_uuid_header_name];

        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);

        const sub = document.querySelector(`tr[subscriptionid="${subscriptionid}"]`);
        console.log(sub);
        sub.remove();

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

// Locate all elements with the class "my-button"
const buttons = document.querySelectorAll('.sortableCol');
len = buttons.length;
for (var i = 0; i < buttons.length; i++) {
    //work with checkboxes[i]
    console.log(buttons[i]);
    // set column index number for each column
    buttons[i].setAttribute("colindex", i);
    buttons[i].addEventListener('click', function (event) {
        sortTa();
    }, false);
}

// Locate all cells that are used for filtering of search results
const f_cells = document.querySelectorAll('.filterableCol');
console.log(f_cells);
len = f_cells.length;
for (var i = 0; i < f_cells.length; i++) {
    //work with regexp in cell
    console.log(f_cells[i]);
    // set column index number for each column
    f_cells[i].setAttribute("colindex", i);
    f_cells[i].addEventListener('input', function (event) {
        filterTable_a();
    }, false);
}

// Sort states for each column
const sortStates = {
    0: 'none', // None -> Ascending -> Descending -> None -> ...
    1: 'none'
};

function DELETEsortTa() {
    console.log("sortTa");
    console.log(event.target);
    sortTable("dataTable", event.target.getAttribute("colindex"));
}


// Function to sort the table
function DELETEsortTable(table_id, columnIndex) {
    console.log("sortable: " + columnIndex)
    const table = document.getElementById(table_id);

    let rows = Array.from(table.rows).slice(1); // Ignore the header
    let sortedRows;

    // Toggle sort state for the column
    if (sortStates[columnIndex] === 'none' || sortStates[columnIndex] === 'desc') {
        sortStates[columnIndex] = 'asc';
    } else {
        sortStates[columnIndex] = 'desc';
    }
    console.log(sortStates[columnIndex]);

    // Sort based on the selected column and sort state
    // Consider options for different types of sorting here.
    if (columnIndex === 0) {
        sortedRows = rows.sort((a, b) => {
                return Number(a.cells[columnIndex].innerText) - Number(b.cells[columnIndex].innerText);
            });
    } else {
        sortedRows = rows.sort((a, b) => a.cells[columnIndex].innerText.localeCompare(b.cells[columnIndex].innerText));
    }
    console.log(sortStates[columnIndex]);
    if (sortStates[columnIndex] === 'desc') {
        sortedRows.reverse();
    }

    console.log(sortedRows);
    // Remove existing rows
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // Append sorted rows
    const tbody = table.getElementsByTagName('tbody')[0];
    sortedRows.forEach(row => tbody.appendChild(row));
}

function filterTable_a() {
    //  console.log("filterTable_a " );

    filterTable(event.target);
}

function filterTable(colheader) {
    const columnIndex = colheader.parentNode.getAttribute("colindex");
    //console.log(colheader);
    console.log("filter on col: " + columnIndex)
    //const input = colheader;
    const filter = colheader.value.toUpperCase();
    var table = document.querySelector('table[name = "dataTable"]');

    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    //console.log("filter column:" + columnIndex);
    //console.log("filter value:" + filter);

    for (let i = 0; i < rows.length; i++) {
        const cell = rows[i].getElementsByTagName('td')[columnIndex];
        //console.log(cell);
        if (cell) {
            const content = cell.innerText || cell.textContent;
            if (new RegExp(filter, 'i').test(content)) {
                //        console.log("not sho");
                rows[i].style.display = '';
            } else {
                rows[i].style.display = 'none';
            }
        }
    }
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
        return(new Error('Network response was not ok'));
    }else{

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
            deleteDataRow(row.subscriptionid);
        };

        cell_buttons.appendChild(removeButton);

    });
    }
}

// start populating data tables

//fetchData(getQueryStringParameter('distributionlistid'));
fetchSubscribers(getQueryStringParameter('distributionlistid'));

//traverse_text(document.documentElement);
console.debug("################################################");
//console.debug(all_page_text);
//console.debug(textnode_map);


// check if the user is authenticated
checkSessionJWTValidity()
.then(isValid => {
    console.log('JWT is valid:', isValid);
    if (isValid) {
        console.debug("JWT is valid - show menu accordingly");
        fetchAndDisplayStaticContent("../fragments/en_US/my_notes_page_header_authenticated.html", "my_notes_page_main_text").then(() => {});
        fetchAndDisplayStaticContent("../fragments/en_US/sidebar_fragment_authenticated.html", "sidebar").then(() => {
            //page_display_login_status();
            // login_logout_action();

        });

        page_display_login_status();

    } else {
        console.debug("JWT is not valid - show menu accordingly");
        fetchAndDisplayStaticContent("../fragments/en_US/my_notes_page_header_unauthenticated.html", "my_notes_page_main_text").then(() => {});
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
