





//const browser_id = chrome.runtime.id;


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



// Function to use "fetch" to re-activate a data agreement
async function DELETEsetSubscriptionActiveStatusByUUID(subscriptionid, activestatus) {
    console.debug("setSubscriptionActiveStatusByUUID: " + subscriptionid + " activestatus: " + activestatus);
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


/**
 * Navigate to the page where the note is attached
 * 
 * Include all note information in the message
 * @param {*} url
 */
async function goThere(noteid, url, distributionlistid , datarow) {
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

function sortTa() {
    console.log("sortTa");
    console.log(event.target);
    sortTable("dataTable", event.target.getAttribute("colindex"));
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
        const month = int.substring(5, 7);
        const day = int.substring(8, 10);
        const hour = int.substring(11, 13);
        const minute = int.substring(14, 16);
        const second = int.substring(17, 19);

        var timestamp = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
        console.log("timestamp: " + timestamp);

        return timestamp;
    } catch (e) {
        console.log(e);
        return null;
    }
}

// Function to sort the table
function sortTable(table_id, columnIndex) {
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
    const table = document.getElementById('dataTable');
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
    console.log("fetchSubscribers");

    var ynInstallationUniqueId = "";
    var xYellownotesSession = "";

    let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
    let session = await chrome.storage.local.get([plugin_session_header_name]);

    ynInstallationUniqueId = plugin_uuid[plugin_uuid_header_name];
    xYellownotesSession = session[plugin_session_header_name];

    const msg = {
        distributionlistid: distributionlistid
    };
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
        reject(new Error('Network response was not ok'));
    }

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
        const cell_subscriptionid = newRow.insertCell(0);
        const cell_displayname = newRow.insertCell(1);
        const cell_subscribedate = newRow.insertCell(2);
        const cell_active = newRow.insertCell(3);
        const cell_status = newRow.insertCell(4);
        const cell_buttons = newRow.insertCell(5);
        // do not include a option for notes in this release
       
        try {
            cell_subscriptionid.textContent = row.subscriptionid;
            cell_subscriptionid.setAttribute('name', 'subscriptionid');
        } catch (e) {
            console.debug(e);
        }
      
        // name
        try {
            cell_subscribedate.textContent = integerstring2timestamp(row.subscribedate);
            cell_subscribedate.setAttribute('name', 'subscribedate');
        } catch (e) {
            console.debug(e);
        }

        try {
            cell_displayname.textContent = row.displayname;
            cell_displayname.setAttribute('name', 'displayname');
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

        try {
            cell_status.textContent = row.status;
            cell_status.setAttribute('name', 'status');
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
if (isValid){
    console.debug("JWT is valid - show menu accordingly");
    fetchAndDisplayStaticContent("../fragments/en_US/my_notes_page_header_authenticated.html", "my_notes_page_main_text").then(() => {});
    fetchAndDisplayStaticContent("../fragments/en_US/sidebar_fragment_authenticated.html", "sidebar").then(() => {
        //page_display_login_status();
       // login_logout_action();
      
      });
      
      page_display_login_status();

}else{
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

