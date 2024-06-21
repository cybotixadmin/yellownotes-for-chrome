



//const browser_id = chrome.runtime.id;


/**
 * this page takes parameters
 * 
 * required
 * distributionlistid: the id of the distribution list to be shown
 * 
 * The script renders a table with all notes in the distribution list and provides a "go there" button for each note
 * The distribution list is one the user does not own, but is a subscriber to
 * 
 * options
 * noteid: the id of the note for which a goto should be automatically triggered
 */


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
        sortTa(event);
    }, false);
}



// Locate all cells that are used for filtering of search results
const f_cells = document.getElementById("subcribedDistributionlistNotesTable").querySelectorAll("thead tr:nth-child(2) th");
console.log(f_cells);
len = f_cells.length;
for (var i = 0; i < f_cells.length; i++) {
    //work with regexp in cell
    console.log(f_cells[i]);
    // set column index number for each column
    f_cells[i].setAttribute("colindex", i);
    f_cells[i].addEventListener('input', function (event) {
        filterTableAllCols("dataTable");
    }, false);
}

// Sort states for each column
const sortStates = {
    0: 'none', // None -> Ascending -> Descending -> None -> ...
    1: 'none'
};



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

function DELETEintegerstring2timestamp(int) {
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


function DELETEsortTa(event) {
    console.log("sortTa()");
    console.log(event);
    console.log(event.target);
    console.log(event.target.parentNode);
    sortTable("subcribedDistributionlistNotesTable", parseInt( event.target.parentNode.getAttribute("colindex"), 10) );
}


// Function to sort the table
function DELETEsortTable(table_id, columnIndex) {
    console.log("sortTabl: " + columnIndex)
    console.log("sortTabl: " + table_id)
    const table = document.querySelector('[id="' + table_id + '"]');
console.log(table);
    let rows = Array.from(table.rows).slice(2); //  Ignore the header and filter rows
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
function filterTableAllCols() {
    console.log("filterTableAllCols");
    var table = document.getElementById("subcribedDistributionlistNotesTable");
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
    const table = document.getElementById('subcribedDistributionlistNotesTable');
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    console.debug(rows);
    console.log("filter column:" + columnIndex);
    console.log("filter value:" + filter);

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

// start populating data tables

fetchNotes(getQueryStringParameter('distributionlistid'));

async function fetchNotes(distributionlistid) {
    console.log("fetchNotes");

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
    const tableBody = document.getElementById('subcribedDistributionlistNotesTable').getElementsByTagName('tbody')[0];

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
            type_cell.setAttribute('name', 'note_type');

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




async function fetchNote(distributionlistid, noteid) {
    console.log("fetchNote");

    var ynInstallationUniqueId = "";
    var xYellownotesSession = "";

    let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
    let session = await chrome.storage.local.get([plugin_session_header_name]);

    ynInstallationUniqueId = plugin_uuid[plugin_uuid_header_name];
    xYellownotesSession = session[plugin_session_header_name];

    const msg = {
        distributionlistid: distributionlistid,
        noteid: noteid
    };
    const response = await fetch(server_url + "/api/v1.0/plugin_user_get_all_distributionlist_note", {
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
    const tableBody = document.getElementById('subcribedDistributionlistNotesTable').getElementsByTagName('tbody')[0];

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
            cell_createtime.setAttribute('class', 'datetime');
        } catch (e) {
            console.debug(e);
        }

        // last modified timestamp
        try {
            cell_lastmodifiedtime.textContent = integerstring2timestamp(row.lastmodifiedtime);
            cell_lastmodifiedtime.setAttribute('class', 'datetime');
        } catch (e) {
            console.debug(e);
        }

        try {
            type_cell.textContent = obj.note_type;
            type_cell.setAttribute('name', 'note_type');
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
        cell_url.setAttribute('name', 'url');
        cell_url.setAttribute('class', 'url');
        // display/message text
        cell_message_text.textContent = b64_to_utf8(obj.message_display_text);
        cell_message_text.setAttribute('class', 'text');

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
                actionButtonContainer.appendChild(goThereButtonContainer);


       // const goThereButtonContainer = document.createElement('div');
        //goThereButtonContainer.setAttribute('class', 'go_to_location_button');

    //    const goThereButton = document.createElement('img');
      //  goThereButton.src = "../icons/goto.icon.transparent.40x40.png";

        //goThereButton.alt = 'go there';

        //goThereButton.setAttribute('class', 'go_to_location_button');

        //   goThereButton.textContent = 'locate';
       // goThereButton.onclick = function () {
            // call to API to delete row from data base
        //    goThere(obj.url, row);
        //};

        //goThereButtonContainer.appendChild(goThereButton);
        cell_buttons.appendChild(goThereButtonContainer);

        //cell_buttons.appendChild(goThereButton);

        // const cell8 = newRow.insertCell(6);

    });

}




// create the URL that when clicked on adds the user to the distribution list
// append a redirecturi that redicts the the page showing the distribution list
// user is already a subscriber since this list is the one the user is viewing, so the subscribe redirect is not needed
function createNoteShareLink(datarow) {
    console.log("createNoteShareLink (datarow)");
    console.log(datarow);
  
    // link must make the user subscribe to the feed the note belongs to, before directing the user to the note.
    // if the feed/distributionlist allowd anonymous access, the unknown/unauthenticated user will be directed to the note directly after subscribing to the feed
  
    // first part of the URL is the one to invite the user to subscribe to the feed of which the note is a part
  
    // the second part is to redirect to displaying  the note in the location where it is attached (the "gothere" functionality)
  
    // noteid
    // distributionlistid
    // url
  
  
    const userid = "";
    console.log("go to url: " + datarow.url);
  
    const noteid = datarow.noteid;
  
    console.log("go lookup noteid: " + noteid);
  
    console.log(document.querySelector('tr[noteid="' + noteid + '"]'));
  
    const url = document.querySelector('tr[noteid="' + noteid + '"]').querySelector('[name="url"]').textContent.trim();
    console.log(url);
  
  
  
    var textToCopy;

        textToCopy = "https://www.yellownotes.cloud/pages/gothere.html?noteid=" + noteid;
    console.log(textToCopy);
  // place the url value in the clipboard
    //navigator.clipboard.writeText(textToCopy).then(() => {
    //    console.log('Invitation URL copied to clipboard: ' + textToCopy); 
    //}).catch(err => {
    //    console.error('Error in copying text: ', err);
    //});
    return textToCopy;
  }
  


var valid_noteid_regexp = /^[a-zA-Z0-9\-\.\_]{20,100}$/;




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
      
      //page_display_login_status();

}else{
    console.debug("JWT is not valid - show menu accordingly");
    fetchAndDisplayStaticContent("../fragments/en_US/my_notes_page_header_unauthenticated.html", "my_notes_page_main_text").then(() => {});
    fetchAndDisplayStaticContent("../fragments/en_US/sidebar_fragment_unauthenticated.html", "sidebar").then(() => {
        //page_display_login_status();
        //login_logout_action();
      
      });
      
      //page_display_login_status();
    }

  })
  .catch(error => {
      console.error('Error:', error.message);
  });

