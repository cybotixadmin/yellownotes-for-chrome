


//const browser_id = chrome.runtime.id;


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

// setup table items for sorting and filtering

// Locate all elements with the class "my-button"
const buttons = document.querySelectorAll('.sortableCol');
len = buttons.length;
for (var i = 0; i < buttons.length; i++) {
    //work with checkboxes[i]
    console.log(buttons[i]);
    // set column index number for each column
    buttons[i].setAttribute("colindex", i);
    buttons[i].addEventListener('click', function (event) {
        sortTa("dataTable",event);
    }, false);
}

// Locate all cells that are used for filtering of search results
const f_cells = document.getElementById("ownDistributionlistNotesTable").querySelectorAll("thead tr:nth-child(2) th");
console.log(f_cells);
len = f_cells.length;
for (var i = 0; i < f_cells.length; i++) {
    //work with regexp in cell
    console.log(f_cells[i]);
    // set column index number for each column
    f_cells[i].setAttribute("colindex", i);
    f_cells[i].addEventListener('input', function (event) {
        filterTableAllCols();
    }, false);
}

// Sort states for each column
const sortStates = {
    0: 'none', // None -> Ascending -> Descending -> None -> ...
    1: 'none'
};

function DELETEsortTa(event) {
    console.log("sortTa");
    console.log(event.target);
    sortTable("ownDistributionlistNotesTable", parseInt(event.target.parentNode.getAttribute("colindex"), 10));
}

function DELETEtimestampstring2timestamp(str) {
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

function DETETEintegerstring2timestamp(int) {
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
function DELETEsortTable(table_id, columnIndex) {
    console.log("sortable: " + columnIndex)
    const table = document.getElementById(table_id);

    let rows = Array.from(table.rows).slice(2); // Ignore the header and filter rows
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
    while (table.rows.length > 2) {
        table.deleteRow(2);
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
function DELETEfilterTableAllCols() {
    console.log("filterTableAllCols");
    var table = document.getElementById("ownDistributionlistNotesTable");
    var filtersCols = table.querySelectorAll("thead > tr:nth-child(2) > th > input, select");
    var rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");

    //console.debug(filtersCols);

    // Loop through each row of the table
    for (var i = 0; i < rows.length; i++) {
        ///  for (var i = 0; i < 1; i++) {
        var showRow = true;
        // console.debug(rows[i]);
        // check each cell against the corresponding filter for the column, if any
        for (var j = 0; j < filtersCols.length; j++) {
            //console.log(j + " ##########");
            //            console.log(j);
            //console.log(filtersCols[j]);
            //console.log(filtersCols[j].value);
            //console.debug(filtersCols[j].tagName);
            //console.debug(filtersCols[j].tagName == "SELECT");
            //console.debug(filtersCols[j].getAttribute("filtertype") == "checkedmatch");
            //console.debug(filtersCols[j].tagName == "SELECT" && filtersCols[j].getAttribute("filtertype") == "checkedmatch");
            //console.log(j + ": " + filtersCols[j].parentNode.getAttribute("colindex"));

            if (filtersCols[j].tagName == "SELECT" && filtersCols[j].getAttribute("filtertype") == "checkedmatch") {
                // filter on whether or not a checkbox has been checked
                var comparingCol = filtersCols[j].parentNode.getAttribute("colindex");
                //console.log("filter on col: " + comparingCol)
                var cell = rows[i].getElementsByTagName("td")[comparingCol];
                //console.log(cell);
                if (cell) {
                    //console.log(cell.querySelector('input[type="checkbox"]'));
                    var isChecked = cell.querySelector('input[type="checkbox"]').checked;
                    //console.log("isChecked: " + isChecked);
                    var filterValue = filtersCols[j].value;
                    //console.log("filterValue: " + filterValue + " isChecked: " + isChecked);
                    if (filterValue === "active" && !isChecked ||
                        filterValue === "inactive" && isChecked) {
                        showRow = false;
                        break; // Exit the loop if any filter condition fails, there is no need to check the remaining filters for this row
                    }
                }
            } else if (filtersCols[j].value && filtersCols[j].getAttribute("filtertype") == "selectmatch") {
                console.log("selectmatch");
                // filter on whether or not a checkbox has been checked
                var comparingCol = filtersCols[j].parentNode.getAttribute("colindex");
                console.log("filter on col: " + comparingCol)
                var cell = rows[i].getElementsByTagName("td")[comparingCol];
                console.log(cell);
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
                    //console.log("is cell content " + cell.textContent.trim() + ' matching regex: ' + regex);
                    // Test the regex against the cell content
                    if (!regex.test(selectedText.trim())) {
                        showRow = false;
                        break; // Exit the loop if any filter condition fails, there is no need to check the remaining filters for this row
                    }
                }

            } else {

                try {
                    if (filtersCols[j].value) { // Only process filters with a value
                        var comparingCol = filtersCols[j].parentNode.getAttribute("colindex");
                        //console.log("filter on col: " + comparingCol)
                        var cell = rows[i].getElementsByTagName("td")[comparingCol];
                        if (cell) {
                            var filterValue = filtersCols[j].value;
                            var regex = new RegExp(escapeRegex(filterValue), "i");
                            //console.log("is cell content " + cell.textContent.trim() + ' matching regex: ' + regex);
                            // Test the regex against the cell content
                            if (!regex.test(cell.textContent.trim())) {
                                showRow = false;
                                break; // Exit the loop if any filter condition fails, there is no need to check the remaining filters for this row
                            }
                        }

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
    const table = document.getElementById('ownDistributionlistNotesTable');
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
    console.log("fetchData (" + distributionlistid + ")");

    var ynInstallationUniqueId = "";
    var xYellownotesSession = "";

    let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
    let session = await chrome.storage.local.get([plugin_session_header_name]);

    ynInstallationUniqueId = plugin_uuid[plugin_uuid_header_name];
    xYellownotesSession = session[plugin_session_header_name];

    const msg = {
        distributionlistid: distributionlistid
    };
    const response = await fetch(server_url + "/api/v1.0/plugin_user_get_all_own_distributionlist_notes", {
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
    const tableBody = document.getElementById('ownDistributionlistNotesTable').getElementsByTagName('tbody')[0];

    // Loop through data and populate the table
    data.forEach(row => {
        console.log(row);
        console.log(JSON.stringify(row));
        console.log(row.noteid);

        // Create new row
        const newRow = tableBody.insertRow();

        newRow.setAttribute('noteid', row.noteid);

        // Create cells and populate them with data
        const cell1 = newRow.insertCell(0);
        const cell_lastmodifiedtime = newRow.insertCell(1);
        const cell_createtime = newRow.insertCell(2);
        const type_cell = newRow.insertCell(3);
        const cell_name = newRow.insertCell(4);
        const cell_url = newRow.insertCell(5);
        const cell_message_text = newRow.insertCell(6);
        const cell_status = newRow.insertCell(7);
        const cell_buttons = newRow.insertCell(8);
        const cell_distributionlist = newRow.insertCell(9);
        // do not include a option for notes in this release
        //const cell_notes = newRow.insertCell(7);


        // parse the JSON of the note
        const obj = JSON.parse(row.json);
        console.log(obj);

        cell1.textContent = row.noteid;
        // last create timestamp
        try {
            cell_createtime.textContent = integerstring2timestamp(row.createtime);
            cell_createtime.setAttribute('class', 'datetime');
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

// status
          // render a check box to enable/disable the note
          const suspendActButton = document.createElement("span");
          if (row.status == 1) {
              // active
              suspendActButton.innerHTML =
                  '<label><input type="checkbox" class="checkbox" placeholder="Enter text" checked/><span></span></label>';
          } else {
              // deactivated
              suspendActButton.innerHTML =
                  '<label><input type="checkbox" class="checkbox" placeholder="Enter text" /><span></span></label>';
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
                  await setNoteActiveStatusByUUID(row.noteid, 1);
              } else {
                  await setNoteActiveStatusByUUID(row.noteid, 0);
                  //           await enable_note_with_noteid(row.noteid);
              }
          });
          cell_status.appendChild(suspendActButton);
          cell_status.setAttribute('class', 'checkbox');


        // url where note is attached
        cell_url.textContent = obj.url;
        cell_url.setAttribute('class', 'url');

        // display/message text
        cell_message_text.textContent = b64_to_utf8(obj.message_display_text);
        cell_message_text.setAttribute('class', 'text');


       try  {
         cell_distributionlist.textContent = row.distributionlistname;
        //cell_distributionlist.firstChild.setAttribute('name', 'distributionlistid');
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


        const goThereButtonContainer = document.createElement('div');
        goThereButtonContainer.setAttribute('class', 'go_to_location_button');

        const goThereButton = document.createElement('img');
        goThereButton.src = "../icons/goto.icon.transparent.40x40.png";
        goThereButton.setAttribute('height', '25px');

        goThereButton.alt = 'go there';

        goThereButton.setAttribute('class', 'go_to_location_button');

        //   goThereButton.textContent = 'locate';
        // goThereButton.onclick = function () {
        //     // call to API to delete row from data base
        //     goThere(row.noteid, row.url, distributionlistid, row);
        // };

        //goThereButtonContainer.appendChild(goThereButton);
        //cell_buttons.appendChild(goThereButtonContainer);

        // add a "shareable" link to note
        var shareable_url = document.createElement('a');
        shareable_url.setAttribute('href', 'https://www.yellownotes.cloud/pages/gothere.html?noteid=' + row.noteid); // Set href to '#' or an appropriate URL

        shareable_url.appendChild(goThereButton);

        cell_buttons.appendChild(shareable_url);

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
                enabled_status: status,
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
    const response = await fetch(server_url + "/api/v1.0/plugin_user_get_all_distributionlist_notes", {
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
        console.log(row.noteid);

        // Create new row
        const newRow = tableBody.insertRow();
        newRow.setAttribute('noteid', row.noteid);
        // Create cells and populate them with data
        const cell1 = newRow.insertCell(0);
        const cell_lastmodifiedtime = newRow.insertCell(1);
        const cell_createtime = newRow.insertCell(2);
        const type_cell = newRow.insertCell(3);
        const cell_name = newRow.insertCell(4);
        const cell_url = newRow.insertCell(5);
        const cell_message_text = newRow.insertCell(6);
        const cell_status = newRow.insertCell(7);
        const cell_buttons = newRow.insertCell(8);
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
            type_cell.setAttribute('name', 'note_type');

        } catch (e) {
            console.log(e);
        }

        try {
           // render a check box to enable/disable the note
           const suspendActButton = document.createElement("span");
           if (row.status == 1) {
               // active
               suspendActButton.innerHTML =
                   '<label><input type="checkbox" class="checkbox" placeholder="Enter text" checked/><span></span></label>';
           } else {
               // deactivated
               suspendActButton.innerHTML =
                   '<label><input type="checkbox" class="checkbox" placeholder="Enter text" /><span></span></label>';
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
                   await setNoteActiveStatusByUUID(row.noteid, 1);
               } else {
                   await setNoteActiveStatusByUUID(row.noteid, 0);
                   //           await enable_note_with_noteid(row.noteid);
               }
           });
           cell_status.appendChild(suspendActButton);
           cell_status.setAttribute('class', 'checkbox');

        } catch (e) {
            console.log(e);
        }

        // name
        try {
            cell_name.textContent = row.distributionlistname;
            cell_name.setAttribute('name', 'distributionlistname');
        } catch (e) {
            console.debug(e);
        }

        // url where note is attached
        cell_url.textContent = obj.url;
        cell_url.setAttribute('name', 'url');
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

        // Add location "go there" button
        const goThereButtonContainer = document.createElement('div');
        goThereButtonContainer.setAttribute('class', 'go_to_location_button');
        const link = document.createElement('a');
        console.log(row);
        const u = createNoteShareLink(row);
        console.log(u);
        link.href = u;
        link.target = "_blank";
        const goThereButton = document.createElement('img');
        goThereButton.src = "../icons/goto.icon.transparent.40x40.png";
        goThereButton.alt = 'go there';
        goThereButton.setAttribute('class', 'go_to_location_button');
        //goThereButton.onclick = function () {
        //    goThere(row);
        //};
        link.appendChild(goThereButton);
        goThereButtonContainer.appendChild(link);

        cell_buttons.appendChild(goThereButtonContainer);

        //cell_buttons.appendChild(goThereButton);

        // const cell8 = newRow.insertCell(6);

    });

}


// start populating data tables

fetchData(getQueryStringParameter('distributionlistid'));
//fetchSubscribers(getQueryStringParameter('distributionlistid'));

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

// check if the user is authenticated
checkSessionJWTValidity()
.then(isValid => {
    console.log('JWT is valid:', isValid);
    if (isValid) {
        console.debug("JWT is valid - show menu accordingly");
        fetchAndDisplayStaticContent("../fragments/en_US/view_own_distributionlist_main_text.html", "view_own_distributionlist_main_text").then(() => {});
        const uuid = localStorage.getItem("creatorid");
        const replacements = {creatorid: uuid};
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
