


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

document.getElementById('toggle-created').addEventListener('change', function () {
    toggleColumn('created', this.checked);
});

document.getElementById('toggle-modified').addEventListener('change', function () {
    toggleColumn('modified', this.checked);
});

document.getElementById('toggle-type').addEventListener('change', function () {
    toggleColumn('type', this.checked);
});

document.getElementById('toggle-feed').addEventListener('change', function () {
    toggleColumn('feed', this.checked);
});
document.getElementById('toggle-message').addEventListener('change', function () {
    toggleColumn('message', this.checked);
});
document.getElementById('toggle-action').addEventListener('change', function () {
    toggleColumn('action', this.checked);
});

document.getElementById('toggle-location').addEventListener('change', function () {
    toggleColumn('location', this.checked);
});



function toggleColumn(columnName, isChecked) {
    console.log("toggleColumn: " + columnName + " isChecked: " + isChecked);
    var table = document.getElementById("dataTable");
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
async function deleteDataRow(uuid) {
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

/**
 * Navigate to the page where the note is attached
 * @param {*} url
 */

async function goThere(datarow) {
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

// setup table items for sorting and filtering

// Locate all elements with the class "sortableCol"
const buttons = document.getElementById("dataTable").querySelectorAll('.sortableCol');
len = buttons.length;
for (var i = 0; i < buttons.length; i++) {
    //work with checkboxes[i]
    //console.log(buttons[i]);
    // set column index number for each column
    buttons[i].setAttribute("colindex", i);
    buttons[i].addEventListener('click', function (event) {
        sortTa(event);
    }, false);
}

// Locate all cells that are used for filtering of search results
const f_cells = document.getElementById("dataTable").querySelectorAll("thead tr:nth-child(2) th");
console.log(f_cells);
len = f_cells.length;
for (var i = 0; i < f_cells.length; i++) {
    //work with regexp in cell
    //console.log(f_cells[i]);
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

// Fetch data on page load

function fetchData(not_show_by_default_columns) {
    console.log("fetchData");
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
                const tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];

                // Loop through data and populate the table
                data.forEach(row => {
                    console.log(row);
                    console.log(JSON.stringify(row));
                    
                    // Create new row
                    const newRow = tableBody.insertRow();

                    // Create cells and populate them with data
                    const cell1 = newRow.insertCell(0);
                    const cell_createtime = newRow.insertCell(1);
                    const cell_lastmodifiedtime = newRow.insertCell(2);
                    const type_cell = newRow.insertCell(3);
                    const cell_name = newRow.insertCell(4);
                    const cell_url = newRow.insertCell(5);
                    const cell_message_text = newRow.insertCell(6);
                    const cell_buttons = newRow.insertCell(7);

                    // parse the JSON of the note
                    const obj = JSON.parse(row.json);
                    console.log(obj);

                    cell1.textContent = row.uuid;

                    // last create timestamp
                    try {
                        cell_createtime.textContent = timestampstring2timestamp(row.createtime);
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
                        if (not_show_by_default_columns.indexOf("modified") !== -1) {
                            cell_lastmodifiedtime.className = "hidden";
                       
                        }
                    } catch (e) {
                        console.debug(e);
                    }

                    // type
                    try {
                        type_cell.textContent = obj.note_type;
                        if (not_show_by_default_columns.indexOf("type") !== -1) {
                            type_cell.className = "hidden";
                        }
                    } catch (e) {
                        console.log(e);
                    }

                    // name
                    try {
                        cell_name.textContent = row.distributionlistname;
                        if (not_show_by_default_columns.indexOf("feed") !== -1) {
                            cell_name.className = "hidden";
                        }
                    } catch (e) {
                        console.debug(e);
                    }

                    // url where note is attached
                    cell_url.textContent = obj.url;
                    if (not_show_by_default_columns.indexOf("location") !== -1) {
                        cell_url.className = "hidden";
                    }

                    // display/message text
                    // this message is a clickable link to the note

                    cell_message_text.textContent = b64_to_utf8(obj.message_display_text);
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

                    // buttons
                    const goThereButtonContainer = document.createElement('div');
                    goThereButtonContainer.className = 'go_to_location_button';

                    const goThereButton = document.createElement('img');
                    goThereButton.src = "../icons/goto.icon.transparent.40x40.png";
                    goThereButton.alt = 'go there';
                    goThereButton.className = 'go_to_location_button';

                    goThereButton.onclick = function () {
                        goThere(row);
                    };

                    goThereButtonContainer.appendChild(goThereButton);
                    cell_buttons.appendChild(goThereButtonContainer);
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
function filterTableAllCols() {
    console.log("filterTableAllCols");
    var table = document.getElementById("dataTable");
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

/*
 * recursively go down the DOM tree below the specified node
 *
 */
function DELreplaceLink(node, note_template) {
    try {
        console.debug("# replaceLink");
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

// set table visibility defaults
// make this sensitive to the size screen the user is using


var not_show_by_default_columns = [];

const pagewidth = window.innerWidth;
console.log("window.innerWidth: " + pagewidth);

if (pagewidth < 300) {
    not_show_by_default_columns = ["created", "modified", "type", "feed",  "action" ];
}else if (pagewidth < 600) {
    not_show_by_default_columns = ["created", "type",  "action"];
}else if (pagewidth < 800) {
    not_show_by_default_columns = ["action"];
}else  {
    not_show_by_default_columns = ["action"];
}

fetchData(not_show_by_default_columns).then(() => {
    console.log("toggle columns off by default");
    console.log(not_show_by_default_columns);
    not_show_by_default_columns.forEach(column => {
        toggleColumn(column, false);
        document.getElementById(`toggle-${column}`).checked = false;
    });
    });


