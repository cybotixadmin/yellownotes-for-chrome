


// check if the user is authenticated
checkSessionJWTValidity()
.then(isValid => {
    console.log('session JWT is valid:', isValid);
    if (isValid) {
        console.debug("JWT is valid - show menu accordingly");
        fetchAndDisplayStaticContent("../fragments/en_US/subscribed_notes_page_header_authenticated.html", "subscribed_notes_page_main_text").then(() => {});

        fetchAndDisplayStaticContent("../fragments/en_US/subscribed_notes_page_explanation.html", "subscribed_notes_page_footer_text").then(() => {});

        fetchAndDisplayStaticContent("../fragments/en_US/sidebar_fragment_authenticated.html", "sidebar").then(() => {
            //page_display_login_status();
            // login_logout_action();

        });
        page_display_login_status();
    } else {
        console.debug("JWT is not valid - show menu accordingly");
        fetchAndDisplayStaticContent("../fragments/en_US/subscribed_notes_page_header_unauthenticated.html", "subscribed_notes_page_main_text").then(() => {});
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




const table_columns_to_not_display_keyname = "subscribed_notes_hide_columns1";




document.getElementById('toggle-createtime').addEventListener('change', function () {
    toggleColumn('createtime', this.checked,"dataTable", table_columns_to_not_display_keyname );
});

document.getElementById('toggle-lastmodifiedtime').addEventListener('change', function () {
    toggleColumn('lastmodifiedtime', this.checked,"dataTable", table_columns_to_not_display_keyname );
});

document.getElementById('toggle-type').addEventListener('change', function () {
    toggleColumn('type', this.checked,"dataTable", table_columns_to_not_display_keyname );
});

document.getElementById('toggle-feed').addEventListener('change', function () {
    toggleColumn('feed', this.checked,"dataTable", table_columns_to_not_display_keyname );
});
document.getElementById('toggle-location').addEventListener('change', function () {
    toggleColumn('location', this.checked,"dataTable", table_columns_to_not_display_keyname );
});

document.getElementById('toggle-selection_text').addEventListener('change', function () {
    toggleColumn('selection_text', this.checked,"dataTable", table_columns_to_not_display_keyname );
});

document.getElementById('toggle-message').addEventListener('change', function () {
    toggleColumn('message', this.checked,"dataTable", table_columns_to_not_display_keyname );
});



document.getElementById('toggle-status').addEventListener('change', function () {
    toggleColumn('status', this.checked,"dataTable", table_columns_to_not_display_keyname );
});

document.getElementById('toggle-action').addEventListener('change', function () {
    toggleColumn('action', this.checked,"dataTable", table_columns_to_not_display_keyname );
});



document.getElementById('toggle-yellownote').addEventListener('change', function () {
    toggleColumn('yellownote', this.checked,"dataTable", table_columns_to_not_display_keyname );
});

// set table visibility defaults
// make this sensitive to the size screen the user is using


var not_show_by_default_columns = [];

const pagewidth = window.innerWidth;
console.log("window.innerWidth: " + pagewidth);

// the space available is sufficiently narrow, show only the yellownote column 
if (pagewidth < 300) {
    not_show_by_default_columns = ["createtime", "modifilastmodifiedtimeed", "type", "selection_text", "status", "action" ];
}else if (pagewidth < 600) {
    not_show_by_default_columns = ["lastmodifiedtime", "type", "status", "action"];
}else if (pagewidth < 800) {
    not_show_by_default_columns = ["lastmodifiedtime","action"];
}else  {
    not_show_by_default_columns = [];
}


// 
getNotShowByDefaultColumns(table_columns_to_not_display_keyname, not_show_by_default_columns).then(columns => {
    not_show_by_default_columns = columns;
    console.log(not_show_by_default_columns);
}).catch(error => {
    console.error('Error:', error);
});






fetchData(not_show_by_default_columns).then(() => {
    console.log("toggle columns off by default");
    console.log(not_show_by_default_columns);
    not_show_by_default_columns.forEach(column => {
        toggleColumn(column, false, "dataTable" , table_columns_to_not_display_keyname);
        document.getElementById(`toggle-${column}`).checked = false;
    });
    });




function DELETEtoggleColumn(columnName, isChecked) {
    console.log("toggleColumn: " + columnName + " isChecked: " + isChecked);
   // var table = document.getElementById("dataTable");
    var table = document.querySelector('table[name="dataTable"]');
    // find out which column has the name columnName
    //console.log(table);
    var col = table.querySelector('[name = "' + columnName + '"]');
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
  
           // console.log(row);
           // console.log(row.cells[columnIndex].classList);
            row.cells[columnIndex].classList.remove("hidden");
        });
  
    }
  
  }

//const browser_id = chrome.runtime.id;

// Function to use "fetch" to delete a data row
async function deleteSubscription(uuid) {
    try {

        const userid = "";
        console.log("deleting: " + uuid);
        const message_body = '{ "uuid":"' + uuid + '" }';
        //console.log(message_body);
        const installationUniqueId = (await chrome.storage.local.get([plugin_uuid_header_name]))[plugin_uuid_header_name];

        console.log(installationUniqueId);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(server_url + URI_plugin_user_delete_yellownote, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [plugin_uuid_header_name]: installationUniqueId
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



async function unPause(datarow) {
    try {
        const userid = "";
        console.log("unPause: " + datarow.url);
        console.log("go lookup creatorid: " + datarow.creatorid);
        const noteid = datarow.noteid;
       
        // invoke the background script to unblock the note in question
        chrome.runtime.sendMessage({
            message: {
                action: "undismiss_note",
                noteid: noteid
            }
        }, function (response) {
            console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
            // update the status of the note in the table directly
            document.querySelector('tr[noteid="' + noteid + '"]').querySelector('[name="note_status"]').textContent = "unread";
        });
    } catch (error) {
       document.querySelector('tr[noteid="' + noteid + '"]').querySelector('[name="note_status"]').textContent = "unread";
        console.error(error);
    }
}




/**
 * Navigate to the page where the note is attached
 * @param {*} url
 */


async function goThere(datarow) {
    try {

        const userid = "";
        console.log("go to url: " + datarow.url);

        console.log("go lookup creatorid: " + datarow.creatorid);
        const noteid = datarow.noteid;

        console.log("go lookup noteid: " + noteid);

        console.log(document.querySelector('tr[noteid="' + noteid + '"]'));

        const url = document.querySelector('tr[noteid="' + noteid + '"]').querySelector('[name="url"]').textContent.trim();
        console.log(document.querySelector('tr[noteid="' + noteid + '"]').querySelector('[name="url"]').textContent.trim());

        // lookup the target url in the table (the user may have changed it !)


        // issue a http redirect to open the URL in another browser tab
        //window.open(url, '_blank').focus();
        // add functionality to scroll to the note in question
        // invoke the background script to scroll to the note in question
        chrome.runtime.sendMessage({
            message: {
                action: "scroll_to_note",
                scroll_to_note_details: {
                    datarow: datarow,
                    url: url

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



async function DISABLEgoThere(datarow) {
    try {

        const userid = "";
        console.log("go to url: " + datarow.url);
        console.log("go lookup noteid: " + datarow.noteid);
        console.log("go lookup creatorid: " + datarow.creatorid);

        // issue a http redirect to open the URL in another browser tab
        //window.open(url, '_blank').focus();
        // add functionality to scroll to the note in question
        // invoke the background script to scroll to the note in question
        chrome.runtime.sendMessage({
            message: {
                action: "scroll_to_note",
                scroll_to_note_details: {
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

/**
 * Open the note for editing
 * @param {*} uuid
 */

async function editNote(uuid) {
    try {

        const userid = "";
        console.log("deleting: " + uuid);
        const message_body = '{ "uuid":"' + uuid + '" }';
        //console.log(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(server_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: message_body // example IDs, replace as necessary
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

//
// setup table event listeners for sorting and filtering

// setup table items for sorting and filtering
setupTableFilteringAndSorting("dataTable");


// Sort states for each column
const sortStates = {
    0: 'none', // None -> Ascending -> Descending -> None -> ...
    1: 'none'
};

// Fetch data on page load

function fetchData(not_show_by_default_columns) {
    console.log("fetchData.start");
    console.log(not_show_by_default_columns);
    return new Promise(function (resolve, reject) {
        chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name])
            .then(function (result) {
                console.log(result);
               const ynInstallationUniqueId = result[plugin_uuid_header_name];
               const  xYellownotesSession = result[plugin_session_header_name];
                console.log(ynInstallationUniqueId);
                console.log(xYellownotesSession);

                return fetch(server_url + URI_plugin_user_get_all_subscribed_notes, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        [plugin_uuid_header_name]: ynInstallationUniqueId,
                        [plugin_session_header_name]: xYellownotesSession,
                    },
                });
            })
            .then(response => {
                if (!response.ok) {
                    if (response.status == 401 && response.headers.get("session") == "DELETE_COOKIE") {
                        console.log("Session token is invalid, remove it from local storage.");
                        chrome.storage.local.remove([plugin_session_header_name], function() {
                            // Redirect to the front page
                            window.location.href = "/pages/my_account.html";
                        });
                        return reject('logout');
                    } else {
                        return reject('Network response was not ok');
                    }
                } else {
                    return response.json();
                }
            })
            .then(function (resp) {
                if (!resp) return; // In case the previous rejection doesn't return a response
                data = resp;
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
                const tableBody = document.querySelector('table[name="dataTable"]').getElementsByTagName('tbody')[0];

                // Loop through data and populate the table
                data.forEach(row => {
                    console.log(row);
                    console.log(JSON.stringify(row));
                    
                    // Create new row
                    const newRow = tableBody.insertRow();
                    newRow.setAttribute("noteid", row.noteid);
                    newRow.setAttribute("distributionlistid", row.distributionlistid);
                    newRow.setAttribute('selectablecol', "true");
                    // Create cells and populate them with data
                 
                    const cell_createtime = newRow.insertCell(0);
                    const cell_lastmodifiedtime = newRow.insertCell(1);
                    const type_cell = newRow.insertCell(2);
                    const cell_name = newRow.insertCell(3);
                    const cell_url = newRow.insertCell(4);
                    const cell_selection_text = newRow.insertCell(5);
                    const cell_message_text = newRow.insertCell(6);
                    const cell_status = newRow.insertCell(7);
                    const cell_buttons = newRow.insertCell(8);
                    const cell_note = newRow.insertCell(9);
                    // parse the JSON of the note
                    const note_obj = JSON.parse(row.json);
                    console.log(note_obj);

                   
                    // last create timestamp
                    try {
                        cell_createtime.textContent = timestampstring2timestamp(row.createtime);
                        cell_createtime.setAttribute('name', 'createtime');
                        if (not_show_by_default_columns.indexOf("created") !== -1) {
                            cell_createtime.className = "hidden";
                        }else{
                            console.log("show created");
                        }
                    } catch (e) {
                        console.debug(e);
                    }
                   
                    

                    // last modified timestamp
                    try {
                        cell_lastmodifiedtime.textContent = timestampstring2timestamp(row.lastmodifiedtime);
                        cell_lastmodifiedtime.setAttribute('name', 'lastmodifiedtime');
                        if (not_show_by_default_columns.indexOf("lastmodifiedtime") !== -1) {
                            cell_lastmodifiedtime.className = "hidden";
                       
                        }
                    } catch (e) {
                        console.debug(e);
                    }

                    // type
                    try {
                        type_cell.textContent = note_obj.note_type;
                        type_cell.setAttribute('name', 'note_type');
                        if (not_show_by_default_columns.indexOf("type") !== -1) {
                            type_cell.className = "hidden";
                        }
                    } catch (e) {
                        console.log(e);
                    }

                    // name
                    try {
                        cell_name.textContent = row.distributionlistname;
                        cell_name.setAttribute('name', 'distributionlistname');
                        if (not_show_by_default_columns.indexOf("feed") !== -1) {
                            cell_name.className = "hidden";
                        }
                    } catch (e) {
                        console.debug(e);
                    }

                    // url where note is attached
                    cell_url.textContent = note_obj.url;
                    cell_url.setAttribute('name', 'url');
                    cell_url.innerHTML = '<a href="/pages/gothere.html?noteid='+row.noteid+'" target="_blank">' + note_obj.url + '</a>';
                    if (not_show_by_default_columns.indexOf("location") !== -1) {
                        cell_url.className = "hidden";
                    }

                      // display/selected text text
                    // this message is a clickable link to the note

                    cell_selection_text.textContent = b64_to_utf8(note_obj.selection_text);
                      // Create the link element
                      //const link = document.createElement('a');
                      //link.href = 'http://somewhere.com/attr?parameter=value';
                      //link.textContent = 'go there to collect';
                      // Add the link to the cell
                     // cell_message_text.appendChild(link);
                      // Add onclick event to the cell to redirect to the link's href
                     // cell_message_text.addEventListener('click', function() {
                    //    window.location.href = "";
                   // });
                    console.log(not_show_by_default_columns.indexOf("selection_text"));
                    cell_selection_text.onclick = function () {
                        goThere(row);
                    };
                    if (not_show_by_default_columns.indexOf("selection_text") !== -1) {
                        cell_selection_text.className = "hidden";
                    }


                    // display/message text
                    // this message is a clickable link to the note

                    cell_message_text.textContent = b64_to_utf8(note_obj.message_display_text);
                      // Create the link element
                      //const link = document.createElement('a');
                      //link.href = 'http://somewhere.com/attr?parameter=value';
                      //link.textContent = 'go there to collect';
                      // Add the link to the cell
                     // cell_message_text.appendChild(link);
                      // Add onclick event to the cell to redirect to the link's href
                     // cell_message_text.addEventListener('click', function() {
                    //    window.location.href = "";
                   // });
                    console.log(not_show_by_default_columns.indexOf("message"));
                    cell_message_text.onclick = function () {
                        goThere(row);
                    };
                    if (not_show_by_default_columns.indexOf("message") !== -1) {
                        cell_message_text.className = "hidden";
                    }

  // type
  try {
    cell_status.textContent = row.note_status;
    cell_status.setAttribute('name', 'note_status');
    if (not_show_by_default_columns.indexOf("type") !== -1) {
        cell_status.className = "hidden";
    }
} catch (e) {
    console.log(e);
}

                    // buttons
                     // Add button container
                const actionButtonContainer = document.createElement('div');
                actionButtonContainer.setAttribute('class', 'button-container');

                    const goThereButtonContainer = document.createElement('div');
                    goThereButtonContainer.className = 'go_to_location_button';
                    const goThereButton = document.createElement('img');
                    goThereButton.src = "../icons/goto.icon.transparent.40x40.png";
                    goThereButton.alt = 'go there';
                    goThereButton.height = "25";
                    goThereButton.className = 'go_to_location_button';
                    goThereButton.onclick = function () {
                        goThere(row);
                    };
                    goThereButtonContainer.appendChild(goThereButton);

                    actionButtonContainer.appendChild(goThereButtonContainer);

                    const unPauseButtonContainer = document.createElement('div');
                    unPauseButtonContainer.className = 'unpause_button';
                    const unPauseButton = document.createElement('img');
                    unPauseButton.src = "../icons/unpause.40.png";
                    unPauseButton.height = "25";
                    unPauseButton.alt = 'go there';
                    unPauseButton.className = 'unpause_button';
                    unPauseButton.onclick = function () {
                        unPause(row);
                    };
                    unPauseButtonContainer.appendChild(unPauseButton);
                    actionButtonContainer.appendChild(unPauseButtonContainer);



                    cell_buttons.appendChild(actionButtonContainer);

        
/* cell_note contains the note in graphical form
 the purpose of this cell is that if all the other columns are de-selected by the user, the remaining column will look like a feed of notes^. 
 Much like any other newsfeed.
 The differece is that the user can filter feed by the columns that are not displayed.
*/


                //cell_note.textContent =  row.json;
                cell_note.setAttribute('name', 'yellownote');
                //cell_note.setAttribute('rendering', 'json');
                cell_note.setAttribute('class', 'yellownote');
                
                console.debug("calling createYellowNoteFromNoteDataObject");
                createYellowNoteFromNoteDataObject(note_obj, false, false ).then(function(note){
                    console.debug(note);
                     // make certain redaction from the note that should not bee shown in feed-mode
                const note_table = note.querySelector('table[name="whole_note_table"]');
                note_table.removeAttribute("style");
                    // add the completed graphical yellownote to the table cell
const inserted = cell_note.appendChild(note);
// make the cell size large enough to contain the note
                    cell_note.setAttribute("style", "height: 280px; width: 250px;");
                    console.debug("calling attachEventlistenersToYellowStickynote");
                    attachEventlistenersToYellowStickynote(inserted , false, false);
                });



                });

                resolve(data);
            })
            .catch(error => {
                console.error('Error:', error);
                reject(error);
            });
    });
}

/*
apply all filters simmultaneously

TO DO. add a swith where the user can chose between whilecard and regexp filters (wildcard default)
and chose to have the filters to be caseinsensitive or not (caseinsensitive default) or not (casesensitive default)
 */
function DELETEfilterTableAllCols() {
    console.log("filterTableAllCols");
    var table = document.querySelector('table[name="' + tableName + '"]');
    var filtersCols = table.querySelectorAll("thead > tr:nth-child(2) > th > input, select");
    var rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");

    console.debug(filtersCols);

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
            console.log(filtersCols[j].value);
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
                console.log(cell);
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
            } else {

                try {
                    if (filtersCols[j].value) { // Only process filters with a value
                        var comparingCol = filtersCols[j].parentNode.getAttribute("colindex");
                        console.log("filter on col: " + comparingCol)
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

function escapeRegex(text) {
    // Escapes the regular expression special characters in text except for '*' and '?'
    // '*' is converted to '.*' and '?' to '.'
    return text.replace(/[-[\]{}()+.,\\^$|#\s]/g, "\\$&")
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
}

var valid_noteid_regexp = /^[a-zA-Z0-9\-\.\_]{20,100}$/;

function disable_note_with_noteid(noteid) {
    console.debug("disable_note_with_noteid: " + noteid);

    console.debug(valid_noteid_regexp.test(noteid));
    if (valid_noteid_regexp.test(noteid)) {
        // send save request back to background
        chrome.runtime.sendMessage({
            stickynote: {
                "request": "single_disable",
                "disable_details": {
                    "noteid": noteid
                }
            }
        }, function (response) {
            console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
            // finally, call "close" on the note
            //  try{
            //  	close_note(event);
            //  }catch(g){console.debug(g);}

        });
    }
}

function enable_note_with_noteid(noteid) {
    console.debug("enable_note_with_noteid: " + noteid);

    console.debug(valid_noteid_regexp.test(noteid));
    if (valid_noteid_regexp.test(noteid)) {
        // send save request back to background
        chrome.runtime.sendMessage({
            stickynote: {
                "request": "single_enable",
                "enable_details": {
                    "noteid": noteid
                }
            }
        }, function (response) {
            console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
            // finally, call "close" on the note
            //  try{
            //  	close_note(event);
            //  }catch(g){console.debug(g);}

        });

    }
}
