


const browser_id = chrome.runtime.id;




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




// Function to use "fetch" to delete a data row
async function deleteDataRowByDistributionlistId(distributionlistid) {
    console.log("deleteDataRowByDistributionlistId");
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";
        const message_body = JSON.stringify({
                distributionlistid: distributionlistid,
            }, );
        console.log(message_body);
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
        //console.log(response);
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

// Function to use "fetch" to delete a data row
async function updateDataRowByUUID(distributionlistid) {
    console.log("updateDataRowByUUID (" + distributionlistid + ")");
    try {

        const row = document.querySelector('tr[distributionlistid="' + distributionlistid + '"]');
        console.debug(row);
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";

        const message_body = {
            distributionlistid: distributionlistid,
            name: row.querySelector('[name="name"').textContent,
            description: row.querySelector('[name="description"').textContent,
            visibility: row.querySelector('[name="visibility"]').querySelector("select").value

        };

        console.log(message_body);
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
        //console.log(response);
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
    console.log("deleteSubscriptionByUUID (" + subscriptionid + ")");
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";
        const message_body = JSON.stringify({
                subscriptionid: subscriptionid
            });
        //console.log(message_body);
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

// Function to use "fetch" to suspend a data agreement
async function viewDistributionlist(distributionlistid) {
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";
        const message_body = JSON.stringify({
                distributionlistid: distributionlistid
            });
        //console.log(message_body);
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
        //console.log(response);
        // Check for errors
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // update the row in the table
        // Parse JSON data
        const data = await response.json();

        console.log(data);
        console.log(data[0]);

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
        //console.log(message_body);
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
        //console.log(response);
        // Check for errors
        if (!subscribersresponse.ok) {
            throw new Error(`HTTP error! status: ${subscribersresponse.status}`);
        }
        // update the row in the table
        // Parse JSON data
        const subscribersdata = await subscribersresponse.json();

        console.log(subscribersdata);

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

        console.log(sub_table);
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
    console.log("activateByUUID " + distributionlistid);

    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";
        const message_body = JSON.stringify({
                distributionlistid: distributionlistid,
                active: 1,
            });
        //console.log(message_body);
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

// Function to use "fetch" to re-activate a data agreement
async function deactivateByUUID(distributionlistid) {
    console.log("deactivateByUUID" + distributionlistid);
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";
        const message_body = JSON.stringify({
                distributionlistid: distributionlistid,
                active: 0,
            });
        //console.log(message_body);
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

// Function to suspend all data agreements (not already suspended)
async function suspendAll() {
    console.log("suspendAll");
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
    console.log("activateAll");
    try {}
    catch (e) {
        console.error(e);
    }
}

// Function to fetch data and populate the table
async function fetchData() {
    console.log("fetchData");
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);

        // Fetch data from web service (replace with your actual API endpoint)

        const headers = {
            "Content-Type": "application/json",
            [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
            [plugin_session_header_name]: session[plugin_session_header_name],
        };
        //const body = JSON.stringify(payload);

        const response = await fetch(
                server_url + URI_plugin_user_get_my_distribution_lists, {
                method: "GET",
                headers,
            });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse JSON data
        // const data = await response.json();


        // send save request back to background
        //chrome.runtime.sendMessage({
        //    request: "getDistributionLists"
        //}).then(function (response) {
        //    console.log(response);


        var utc = new Date().toJSON().slice(0, 10).replace(/-/g, "/");
        console.log(utc);
        console.log(Date.now());
        var now = new Date();
        var utc_timestamp = Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate(),
                now.getUTCHours(),
                now.getUTCMinutes(),
                now.getUTCSeconds(),
                now.getUTCMilliseconds());
        console.log(utc_timestamp);
        console.log(new Date().toISOString());

        // Parse JSON data
        const data = await response.json();
        console.log(data);
        // Get table body element
        const tableBody = document
            .getElementById("dataTable")
            .getElementsByTagName("tbody")[0];

        console.log(tableBody);
        // loop through the existing table and delete all rowsnewTableRow2
        console.log(tableBody.rows);
        console.log(tableBody.rows.length);
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
        data.forEach((row) => {
            // Create new row
            newTableRow2(tableBody, row);
        });
    } catch (error) {
        console.error(error);
    }
}

function newTableRow2(tableBody, rowData) {
    console.log("newTableRow2");
    console.log(rowData);
    const newRow = tableBody.insertRow();
    newRow.setAttribute("distributionlistid", rowData.distributionlistid);
    // Create cells and populate them with data
    const cell1 = newRow.insertCell(0);
    cell1.textContent = rowData.distributionlistid;

    const cell2 = newRow.insertCell(1);
    cell2.textContent = rowData.name;
    cell2.setAttribute("name", "name");
    cell2.setAttribute("contenteditable", "true");

    const cell3 = newRow.insertCell(2);
    cell3.textContent = rowData.description;
    cell3.setAttribute("name", "description");
    cell3.setAttribute("contenteditable", "true");

    const cell4 = newRow.insertCell(3);

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
    cell4.appendChild(visibilityDropdown);
    cell4.setAttribute("name", "visibility");

    const cell5 = newRow.insertCell(4);
    cell5.textContent = rowData.restrictions;

    const cell9 = newRow.insertCell(5);
    cell9.textContent = rowData.postcount;

    const cell11 = newRow.insertCell(6);
    cell11.textContent = rowData.subscriberscount;

    const cell10 = newRow.insertCell(7);
    // set the genuine value of the field in an attribute
    cell10.setAttribute("value", "createdtime");
console.log(rowData.createdtime);    
    cell10.textContent = reformatTimestamp(rowData.createdtime);


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
    const cell8 = newRow.insertCell(8);
    cell8.appendChild(suspendActButton);

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

    viewNotesButton.innerHTML =  '<a href="/pages/view_own_distributionlist.html?distributionlistid=' + rowData.distributionlistid + '"><button>Notes</button></a>' 

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

    viewSubscribersButton.innerHTML =  '<a href="/pages/view_own_subscribers.html?distributionlistid=' + rowData.distributionlistid + '"><button>Subscribers</button></a>' 

    // Add save button
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.classList.add("deleteBtn");
    saveButton.onclick = function () {
        // call to API to save row to data base
        updateDataRowByUUID(rowData.distributionlistid);
    };

    // Add create invite button
    const createInviteButton = document.createElement("button");

   // title="Click to copy the invitation URL to your clipboard"
    createInviteButton.title = "Click to create an invition to subscribe link, and copy it the clipboard";
    createInviteButton.textContent = "Invite";
    createInviteButton.classList.add("deleteBtn");
    createInviteButton.onclick = function () {
        // call to API to save row to data base
        createOpenInvitation(rowData.distributionlistid);
    };



    const cell7 = newRow.insertCell(9);
    cell7.appendChild(viewNotesButton);
    cell7.appendChild(viewSubscribersButton);
    cell7.appendChild(deleteButton);
    cell7.appendChild(saveButton);
    cell7.appendChild(createInviteButton);
    
}





// Locate all elements with the class "my-button"
const buttons = document.querySelectorAll(".sortableCol");
//len = buttons.length;
for (var i = 0; i < buttons.length; i++) {
    //work with checkboxes[i]
    console.log(buttons[i]);
    // set column index number for each column
    buttons[i].setAttribute("colindex", i);
    buttons[i].addEventListener(
        "click",
        function (event) {
        sortTa();
    },
        false);
}

// Locate all cells that are used for filtering of search results
const f_cells = document.querySelectorAll(".filterableCol");
console.log(f_cells);
//len = f_cells.length;
for (var i = 0; i < f_cells.length; i++) {
    //work with regexp in cell
    console.log(f_cells[i]);
    // set column index number for each column
    f_cells[i].setAttribute("colindex", i);
    f_cells[i].addEventListener(
        "input",
        function (event) {
        filterTable_a();
    },
        false);
}

// Sort states for each column
const sortStates = {
    0: "none", // None -> Ascending -> Descending -> None -> ...
    1: "none",
};


// create the URL that when clicked on adds the user to the distribution list
// append a redirecturi that redicts the the page showing the distribution list

function createOpenInvitation(distributionlistid) {
    console.log("createOpenInvitation ("+distributionlistid+")");
    // create a small window/form to add a new distribution list


}

function sortTa() {
    sortTable(event.target);
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

// Function to sort the table
function sortTable(colheader) {
    const columnIndex = colheader.parentNode.getAttribute("colindex");
    console.log("sortable: " + columnIndex, colheader);

    const table = document.getElementById("dataTable");

    let rows = Array.from(table.rows).slice(1); // Ignore the header
    let sortedRows;

    // Toggle sort state for the column
    if (
        sortStates[columnIndex] === "none" ||
        sortStates[columnIndex] === "desc") {
        sortStates[columnIndex] = "asc";
    } else {
        sortStates[columnIndex] = "desc";
    }

    // Sort based on the selected column and sort state
    // Consider options for different types of sorting here.
    if (columnIndex === 0) {
        sortedRows = rows.sort((a, b) => {
                return (
                    Number(a.cells[columnIndex].innerText) -
                    Number(b.cells[columnIndex].innerText));
            });
    } else {
        sortedRows = rows.sort((a, b) =>
                a.cells[columnIndex].innerText.localeCompare(
                    b.cells[columnIndex].innerText));
    }

    if (sortStates[columnIndex] === "desc") {
        sortedRows.reverse();
    }

    console.log(sortedRows);
    // Remove existing rows
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // Append sorted rows
    const tbody = table.getElementsByTagName("tbody")[0];
    sortedRows.forEach((row) => tbody.appendChild(row));
}

function filterTable_a() {
    //  console.log("filterTable_a " );

    filterTable(event.target);
}

function filterTable(colheader) {
    const columnIndex = colheader.parentNode.getAttribute("colindex");
    //console.log(colheader);
    console.log("filter on col: " + columnIndex);
    //const input = colheader;
    const filter = colheader.value.toUpperCase();
    const table = document.getElementById("dataTable");
    const rows = table
        .getElementsByTagName("tbody")[0]
        .getElementsByTagName("tr");
    //console.log("filter column:" + columnIndex);
    //console.log("filter value:" + filter);

    for (let i = 0; i < rows.length; i++) {
        const cell = rows[i].getElementsByTagName("td")[columnIndex];
        //console.log(cell);
        if (cell) {
            const content = cell.innerText || cell.textContent;
            if (new RegExp(filter, "i").test(content)) {
                //        console.log("not sho");
                rows[i].style.display = "";
            } else {
                rows[i].style.display = "none";
            }
        }
    }
}

// Fetch data on page load
fetchData();


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
    console.log("add_distribution");
    // create a small window/form to add a new distribution list

    var tableHTML = '<table class="formTable" border="1">';

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
        console.log("click");
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
    console.log(container);

    // Find the button and add an event listener
    const createDistributionlistButton = document.getElementById('addform_button');

    createDistributionlistButton.addEventListener('click', function () {
        console.log("createDistributionlistButton clicked");
        // Extract data from table
        //const table = document.querySelector('#form table');
        console.log(document.getElementById('form'));
        console.log(document.getElementById('form').getElementsByTagName('table')[0]);
        const table = document.getElementById('form').getElementsByTagName('table')[0];
        console.log(table);
        console.log(table.rows[0]);
        // const id = table.rows[1].cells[1].textContent; // Get text from second cell of the first row
        // const name = table.rows[1].cells[1].textContent; // Get text from second cell of the first row

        //    const description = table.rows[2].cells[1].textContent; // Get text from second cell of the second row
        console.log(document.getElementById('createdistributionname'));
        const name = document.getElementById('createdistributionname').textContent;

        //      const description = table.rows[2].cells[1].textContent; // Get text from second cell of the second row
        const description = document.getElementById('createdistributiondescription').textContent;

        const visibility = document.getElementById('visibilityDropdown').value; // Get text from second cell of the second row

        console.log("name: " + name);
        console.log("description: " + description);

        var ynInstallationUniqueId = "";
        var xYellownotesSession = "";

        if (name != "Enter a name" && description != "Enter a description") {

            chrome.storage.local.get([plugin_uuid_header_name]).then(
                function (result) {
                ynInstallationUniqueId = result[plugin_uuid_header_name];
                console.log("ynInstallationUniqueId: " + ynInstallationUniqueId);
                return chrome.storage.local.get([plugin_session_header_name]);
            }).then(function (result) {
                xYellownotesSession = result[plugin_session_header_name];
                console.log("xYellownotesSession: " + xYellownotesSession);

                // let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);

                // let session = await chrome.storage.local.get([plugin_session_header_name]);

                // Fetch data from web service (replace with your actual API endpoint)

                const msg = {
                    "name": name,
                    "description": description,
                    "visibility": visibility
                }
                console.log(msg);
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
                console.log('Success:', data);

                // update the list of distribution lists with the one just created
                // append the new row to the table of existing distributions lists
                const dataTable = document.getElementById('dataTable');
data.subscriberscount = 0;
data.postcount = 0;

                newTableRow2(dataTable, data);
 //               const newRow1 = dataTable.insertRow();

   //             var rowHTML = '<tr>';
     //           rowHTML += '<td>' + data.distributionlistid + '</td>';
       
     //rowHTML += '<td>' + data.name + '</td>';
       //         rowHTML += '<td id="distributiondescription" contenteditable="true" style="border: 1px solid black;">' + data.description + '</td>';
         //       rowHTML += '<td>' + data.visibility + '</td>';
         //       rowHTML += '<td>' + data.restrictions + '</td>';
         //       rowHTML += '<td></td>';
         //       rowHTML += '</tr>';
         //       newRow1.innerHTML = rowHTML;

                // Usage: Pass the ID of the parent element to cleanup
                removeAllChildren('form');

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
    console.log(container);

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
    console.log("reformatTimestamp");
    console.log(originalTimestamp);

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
    console.log("add_subscriber to " + distributionlistid);
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
    console.log(container);

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
        console.log(msg);
        chrome.storage.local.get([plugin_uuid_header_name]).then(
            function (result) {
            ynInstallationUniqueId = result[plugin_uuid_header_name];
            console.log("ynInstallationUniqueId: " + ynInstallationUniqueId);
            return chrome.storage.local.get([plugin_session_header_name]);
        }).then(function (result) {
            xYellownotesSession = result[plugin_session_header_name];
            console.log("xYellownotesSession: " + xYellownotesSession);

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
            console.log('Success:', data);
            // Usage: Pass the ID of the parent element to cleanup
            removeAllChildren('form');

        }).catch((error) => console.error('Error:', error));
    });

}


async function remove_subscriber(subscriptionid, distributionlistid) {
    console.log("remove_subscriber");
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
    console.log(container);

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
            console.log("ynInstallationUniqueId: " + ynInstallationUniqueId);
            return chrome.storage.local.get([plugin_session_header_name]);
        }).then(function (result) {
            xYellownotesSession = result[plugin_session_header_name];
            console.log("xYellownotesSession: " + xYellownotesSession);

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
            console.log('Success:', data);
            // Usage: Pass the ID of the parent element to cleanup
            removeAllChildren('form');

        }).catch((error) => console.error('Error:', error));
    });
}

function removeAllChildren(parentElementId) {
    console.log("removeAllChildren");
    // Get the parent element by its ID
    const parent = document.getElementById(parentElementId);

    // Continue removing the first child as long as the parent has a child node
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

async function activateAllDistributions() {
    console.log("activateAllDistributions");
    try {

         // update the form to show the new state of the subscriptions

         const checkboxes = document.getElementById('dataTable').querySelectorAll('input[type="checkbox"]');
         console.log(checkboxes);
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
        const body = JSON.stringify({"active":1});

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
        console.log(error);
    }
}

async function deactivateAllDistributions() {
    console.log("deactivateAllDistributions");
    try {

 // update the form to show the new state of the subscriptions

 const checkboxes = document.getElementById('dataTable').querySelectorAll('input[type="checkbox"]');
 console.log(checkboxes);
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
        const body = JSON.stringify({"active":0});
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
        console.log(error);
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

