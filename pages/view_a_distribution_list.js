


const URI_plugin_user_get_own_yellownotes = "/api/v1.0/plugin_user_get_own_yellownotes";
const URI_plugin_user_delete_yellownote = "/api/v1.0/plugin_user_delete_yellownote";
const URI_plugin_user_set_note_active_status = "/api/plugin_user_setstatus_yellownote";

const URI_plugin_user_get_active_feed_notes = "/api/v1.0/plugin_user_get_active_feed_notes";

const URI_plugin_user_get_abstracts_of_all_yellownotes = "/api/plugin_user_get_abstracts_of_all_yellownotes";

//const browser_id = chrome.runtime.id;


const url = window.location.href.trim();
console.log(url);
console.log(url.replace(/.*distributionlistid=/, ""));
// accept the submitted value for the distribution list id


// Function to use "fetch" to delete a data row
async function deleteDataRow(noteid) {
    try {

        const userid = "";
        console.log("deleting: " + noteid);
        const message_body = '{ "noteid":"' + noteid + '" }';
        //console.log(message_body);
        const installationUniqueId = (await chrome.storage.local.get([plugin_uuid_header_name]))[plugin_uuid_header_name];

        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);

        console.log(installationUniqueId);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(server_url + URI_plugin_user_delete_yellownote, {
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
async function goThere(url, datarow) {
    try {

        
        console.log("go to url: " + datarow.url);
        console.log("go lookup noteid: " + datarow.noteid);

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


async function fetchData(distributionlistid) {
    console.log("fetchData");

    var ynInstallationUniqueId = "";
    var xYellownotesSession = "";

    let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
    let session = await chrome.storage.local.get([plugin_session_header_name]);

    ynInstallationUniqueId = plugin_uuid[plugin_uuid_header_name];
    xYellownotesSession = session[plugin_session_header_name];

    const msg = {
        distributionlistid: distributionlistid
    };
    const response = await fetch(server_url + "/api/v1.0/plugin_user_get_all_subscribed_notes", {
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
    const tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];

    // Loop through data and populate the table
    data.forEach(row => {
        console.log(row);
        console.log(JSON.stringify(row));
        console.log(row.noteid);

        // Create new row
        const newRow = tableBody.insertRow();

        // Create cells and populate them with data
        const cell1 = newRow.insertCell(0);
        const cell_lastmodifiedtime = newRow.insertCell(1);
        const cell_createtime = newRow.insertCell(2);
        const type_cell = newRow.insertCell(3);
        const cell_name = newRow.insertCell(4);
        const cell_url = newRow.insertCell(5);
        const cell_message_text = newRow.insertCell(6);
        const cell_buttons = newRow.insertCell(7);
        // do not include a option for notes in this release
        //const cell_notes = newRow.insertCell(7);


        // parse the JSON of the note
        const obj = JSON.parse(row.json);
        console.log(obj);

        cell1.textContent = row.noteid;
        // last create timestamp
        try {
            cell_createtime.textContent = integerstring2timestamp(row.createtime);
        } catch (e) {
            console.debug(e);
        }

        // last modified timestamp
        try {
            cell_lastmodifiedtime.textContent = integerstring2timestamp(row.lastmodifiedtime);
        } catch (e) {
            console.debug(e);
        }

        try {
            type_cell.textContent = obj.note_type;

        } catch (e) {
            console.log(e);
        }

        // name
        try {
            cell_name.textContent = row.distributionlistname;
        } catch (e) {
            console.debug(e);
        }

        // url where note is attached
        cell_url.textContent = obj.url;

        // display/message text
        cell_message_text.textContent = b64_to_utf8(obj.message_display_text);

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


        const goThereButtonContainer = document.createElement('div');
        goThereButtonContainer.setAttribute('class', 'go_to_location_button');

        const goThereButton = document.createElement('img');
        goThereButton.src = "../icons/goto.icon.transparent.40x40.png";

        goThereButton.alt = 'go there';

        goThereButton.setAttribute('class', 'go_to_location_button');

        //   goThereButton.textContent = 'locate';
        goThereButton.onclick = function () {
            // call to API to delete row from data base
            goThere(obj.url, row);
        };

        goThereButtonContainer.appendChild(goThereButton);
        cell_buttons.appendChild(goThereButtonContainer);

        //cell_buttons.appendChild(goThereButton);

        // const cell8 = newRow.insertCell(6);

    });

}


var valid_noteid_regexp = /^[a-zA-Z0-9\-\.\_]{20,100}$/;

// Function to use "fetch" to re-activate a data agreement
async function setNoteActiveStatusByUUID(noteid, status) {
    console.debug("setNoteActiveStatusByUUID: " + noteid + " status: " + status);
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";
        const message_body = JSON.stringify({
                noteid: noteid,
                status: status,
            });
        //console.log(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_set_note_active_status, {
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



fetchData(getQueryStringParameter('distributionlistid'));

//traverse_text(document.documentElement);
console.debug("################################################");
//console.debug(all_page_text);
//console.debug(textnode_map);


var doc = window.document;

var root_node = doc.documentElement;
console.debug(root_node);

// start analyzing the DOM (the page/document)

var note_template = null;
// collect the template, for later use
fetch(chrome.runtime.getURL('./templates/default_yellownote_template.html')).
then((response) => response.text())
.then((html) => {
    //console.debug(html);
    //note_template_html = html;
    //const note_template = document.createElement('div');
    // container.innerHTML = html;
    note_template = safeParseInnerHTML(html, 'div');
    console.log("browsersolutions " + note_template);
    console.debug(note_template);

    //console.debug("browsersolutions url: " + url);
    replaceLink(root_node, note_template);

});

// if there is a querystring parameter, lokk up distribution list spiecified by that parameter
var distValue = getQueryStringParameter('distributionlistid');
if (distValue) {
    console.debug(distValue);

}

fetchAndDisplayStaticContent("/fragments/sidebar_fragment.html", "sidebar").then(() => {
    page_display_login_status();

});
