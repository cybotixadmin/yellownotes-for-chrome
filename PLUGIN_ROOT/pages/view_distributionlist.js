


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

        console.debug("go to url: " + datarow.url);
        console.debug("go lookup noteid: " + datarow.noteid);

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


const table_name = "subcribedDistributionlistNotesTable";



// which columns to display
// The users can decide which columns to display


const table_columns_to_not_display_keyname = table_name+"_hide_columns";

// store in local the sorting and columns that the user has selected to sort on
const table_columns_sort_array_keyname = table_name+"_sort_columns";

// store in local the filters and columns that the user has selected to filter on
const table_columns_filter_array_keyname = table_name+"_filer_columns";


addEventColumnToggleListeners(['createtime','lastmodifiedtime','note_type','feed','url', 'selected_text','message_text', 'action','yellownote'], table_name);


// set table visibility defaults
// make this sensitive to the size screen the user is using


var not_show_by_default_columns = [];

// check if not_show_by_default_columns has been set
const pagewidth = window.innerWidth;
console.debug("window.innerWidth: " + pagewidth);

if (pagewidth < 300) {
    not_show_by_default_columns = ["createtime", "lastmodifiedtime", "note_type", "feed", "url", "selected_text", "message_text", "action"];
} else if (pagewidth < 600) {
    not_show_by_default_columns = ["createtime", "lastmodifiedtime", "selected_text", "message_text", "action"];

} else if (pagewidth < 1000) {
    not_show_by_default_columns = ["createtime", "selected_text", "message_text", "action"];
} else if (pagewidth < 1200) {
    not_show_by_default_columns = [];
}

console.debug("not_show_by_default_columns");
console.debug(not_show_by_default_columns);

// check if the columns suppression has been set in memory, if not set it to the default, otherwise use the stored value
getNotShowByDefaultColumns(table_columns_to_not_display_keyname, not_show_by_default_columns).then(columns => {
    not_show_by_default_columns = columns;
    console.debug(not_show_by_default_columns);
}).catch(error => {
    console.error('Error:', error);
});

// call to database to get notes and place them in a table
fetchData( getQueryStringParameter('distributionlistid'), not_show_by_default_columns).then(function (d) {
    console.debug("read notes complete");
    console.debug(d);

    // update the list of colmes and check/uncheck according to the list of columns to not display
    console.debug("not_show_by_default_columns");
    console.debug(not_show_by_default_columns);

    not_show_by_default_columns.forEach(column => {
        try{
        console.debug("hide column: ", column);
        toggleColumn(column, false, table_name, table_columns_to_not_display_keyname);
        document.getElementById(`toggle-${column}`).checked = false;

        // itterate through all entries in the yellownote column and reder as graphical yellow notes their contents

        const querySelector = 'tr td:nth-child(2)';

        console.debug("calling updateTableColumn");
        // Call the updateTableColumn function
        updateTableColumn(querySelector, processCellValue).then((note_root) => {
            console.debug('All table cells have been processed and updated.');
            console.debug(note_root);
        }).catch(error => {
            console.error('Error processing table cells:', error);
        });
    }catch(e){
        console.debug(e);}


    });
});

function fetchData(distributionlistid, not_show_by_default_columns) {
        console.debug("fetchData");
        try {
            return new Promise(
                function (resolve, reject) {
                var ynInstallationUniqueId = "";
                var xYellownotesSession = "";
                var distributionlists;
                var data;

                chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]).then(function (result) {
                    console.debug(result);
                    console.debug(ynInstallationUniqueId);
                    ynInstallationUniqueId = result[plugin_uuid_header_name];
                    xYellownotesSession = result[plugin_session_header_name];
                    console.debug(ynInstallationUniqueId);
                    console.debug(xYellownotesSession);

                    const msg = {
                        distributionlistid: distributionlistid
                    };
                    console.debug(msg);
                    return cachableCall2API_POST( distributionlistid + "_all_yellownotes_data", 30, "POST", server_url + "/api/v1.0/plugin_user_get_all_distributionlist_notes", msg );


              
                }).then(function (data) {
                    distributionListData = data;

                    console.debug(distributionListData);

                    console.debug(data);

                    var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
                    console.debug(utc);
                    console.debug(Date.now());
                    var now = new Date;
                    var utc_timestamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
                            now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
                    console.debug(utc_timestamp);
                    console.debug(new Date().toISOString());

                    // Get table body element
                    const tableBody = document.querySelector('table[name="' + table_name + '"]').getElementsByTagName('tbody')[0];
                    // Loop through data and populate the table
                    data.forEach(row => {
                        console.debug(row);
                        console.debug(row.json);
                        const note_obj = JSON.parse(row.json);
                        console.debug(JSON.stringify(row));
                        console.debug(row.noteid);
                        note_obj.creatorid = row.creatorid;
                        console.debug(note_obj);

                        // Create new row
                        const newRow = tableBody.insertRow();
                        newRow.setAttribute('noteid', row.noteid);
                        newRow.setAttribute('selectablecol', "true");

                        // Create cells and populate them with data

                        const cell_note = newRow.insertCell(0);
                        const cell_createtime = newRow.insertCell(1);
                        const cell_lastmodified = newRow.insertCell(2);
                        const type_cell = newRow.insertCell(3);
                        const cell_feed = newRow.insertCell(4);
                        const cell_url = newRow.insertCell(5);
                        const cell_selection = newRow.insertCell(6);
                        const cell_message = newRow.insertCell(7);
                        const cell_actions = newRow.insertCell(8);
                       
                        const obj = JSON.parse(row.json);
                        // key column - not to be displayed
                        // create timestamp - not to be dsiplayed either
                        try {
                            console.debug(row.createtime);
                            console.debug(/20/.test(row.createtime));
                            if (/2024/.test(row.createtime)) {
                                console.debug("createtime is timestamp: " + row.createtime);
                                //console.debug("createtime: " + integerstring2timestamp(row.createtime));

                                cell_createtime.textContent = timestampstring2timestamp(row.createtime);
                                cell_createtime.setAttribute('class', 'datetime');
                            } else {

                                console.debug("createtime is integer: " + row.createtime)
                                cell_createtime.textContent = integerstring2timestamp(row.createtime);
                                cell_createtime.setAttribute('class', 'datetime');

                            }
                            // Adding data-label for mobile responsive
                            cell_createtime.setAttribute('data-label', 'createtime');
                            cell_createtime.setAttribute('name', 'createtime');

                        } catch (e) {
                            console.debug(e);
                        }
                        try {
                            console.debug(row.lastmodifiedtime);
                            console.debug(/2024/.test(row.lastmodifiedtime));
                            if (/2024/.test(row.lastmodifiedtime)) {
                                console.debug("lastmodifiedtime is timestamp: " + row.lastmodifiedtime);
                                cell_lastmodified.textContent = timestampstring2timestamp(row.lastmodifiedtime);
                                cell_lastmodified.setAttribute('class', 'datetime');
                            } else {
                                console.debug("lastmodifiedtime is integer: " + row.lastmodifiedtime)
                                cell_lastmodified.textContent = integerstring2timestamp(row.lastmodifiedtime);
                                cell_lastmodified.setAttribute('class', 'datetime');
                            }
                            // Adding data-label for mobile responsive
                            cell_lastmodified.setAttribute('data-label', 'lastmodified');
                            cell_lastmodified.setAttribute('name', 'lastmodifiedtime');

                        } catch (e) {
                            console.debug(e);
                        }

                        try {
                            type_cell.textContent = obj.note_type;
                            type_cell.setAttribute('name', 'note_type');
                            type_cell.setAttribute('class', 'compact');
                        } catch (e) {
                            console.debug(e);
                        }

                       


                        // where note is attached
                        //contenteditable="true"
                        cell_url.textContent = obj.url;
                        cell_url.setAttribute('contenteditable', 'true');
                        cell_url.setAttribute('data-label', 'url');
                        cell_url.setAttribute('name', 'url');
                        cell_url.setAttribute('class', 'url');

                        // selection text
                        // contenteditable="true"
                        if (obj.note_type == "plaintext") {
                            cell_selection.textContent = b64_to_utf8(obj.selection_text);
                            cell_selection.setAttribute('name', 'selection_text');
                        } else if (obj.note_type == "webframe") {
                            cell_selection.textContent = (obj.content_url);
                            cell_selection.setAttribute('name', 'content_url');
                        } else {
                            // default - will revisit this later (L.R.)
                            cell_selection.textContent = b64_to_utf8(obj.selection_text);
                            cell_selection.setAttribute('name', 'selection_text');
                        }
                        cell_selection.setAttribute('contenteditable', 'true');
                        cell_selection.setAttribute('data-label', 'text');
                        cell_selection.setAttribute('name', 'selection_text');
                        cell_selection.setAttribute('class', 'text');

                        // message payload
                        // contenteditable="true"
                        if (obj.note_type == "yellownote") {
                            try {
                                //      cell_message.textContent = b64_to_utf8(obj.message_display_text);

                                console.debug(obj.message_display_text);

                                //cont1.querySelector('[name="message_display_text"]').replaceChildren(document.createTextNode(b64_to_utf8(note_object_data.message_display_text)));

                                cell_message.innerHTML = "<div>" + b64_to_utf8(obj.message_display_text) + "</div>";
                                console.debug(cell_message);

                                //cell_message.textContent = b64_to_utf8(obj.message_display_text);

                                cell_message.setAttribute('name', 'message_display_text');
                            } catch (e) {
                                console.debug(e);
                            }
                        } else if (obj.note_type == "webframe") {
                            cell_message.textContent = (obj.content_url);
                            cell_message.setAttribute('name', 'content_url');
                        } else {

                            cell_message.innerHTML = b64_to_utf8(obj.message_display_text);
                            console.debug(cell_message);

                            //cell_message.textContent = b64_to_utf8(obj.message_display_text);
                           
                        }
                        cell_message.setAttribute('contenteditable', 'true');
                        cell_message.setAttribute('data-label', 'text');
                        cell_message.setAttribute('name', 'message_text');
                        cell_message.setAttribute('class', 'text');

                     
                        

                        // create small table to contain the action buttons

                        // Add button container
                        const actionButtonContainer = document.createElement('div');
                        actionButtonContainer.setAttribute('class', 'button-container');

                      //  // Add delete button
                      //  const deleteButtonContainer = document.createElement('div');
                      //  deleteButtonContainer.setAttribute('class', 'delete_button');
                      //  const deleteButton = document.createElement('img');
                      //  deleteButton.src = "../icons/trash-can.transparent.40x40.png";
                      //  deleteButton.alt = 'delete';
                      //  deleteButton.setAttribute('class', 'delete_button');
                      //  deleteButton.onclick = function () {
                      //      // Remove the row from the table
                      //      newRow.remove();
                      //      // call to API to delete row from data base
                      //      delete_note_by_noteid(row.noteid);
                      //  };
                      //  deleteButtonContainer.appendChild(deleteButton);
                      //  actionButtonContainer.appendChild(deleteButtonContainer);

                        // Add save/edit button


                        // Add save button
                        const saveButtonContainer = document.createElement('div');
                        saveButtonContainer.setAttribute('class', 'save_button');
                        const saveButton = document.createElement('img');
                        saveButton.src = "../icons/floppy-disk.svg";
                        saveButton.alt = 'save';
                        saveButton.setAttribute('class', 'save_button');
                        saveButton.onclick = function (event) {

                            console.debug(event.target.parentNode);
                            console.debug(event.target.parentNode.parentNode);
                            console.debug(event.target.parentNode.parentNode.firstChild.textContent);

                            // call to API to save changes to data base
                            saveChanges(row.noteid, event);
                        };
                        saveButtonContainer.appendChild(saveButton);
                        actionButtonContainer.appendChild(saveButtonContainer);

                        // Add location "go there" button
                        const goThereButtonContainer = document.createElement('div');
                        goThereButtonContainer.setAttribute('class', 'go_to_location_button');
                        const link = document.createElement('a');
                        console.debug(row);
                        const u = createNoteShareLink(row);
                        console.debug(u);
                        link.href = u;
                        link.target = "_blank";
                        link.name = "go_to_note";

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

                        // button to create a link to this note that can be shared with others - subsume this functionaility into the "goto" button

                        //const shareButtonContainer = document.createElement('div');
                        //shareButtonContainer.setAttribute('class', 'share_button');
                        //const shareButton = document.createElement('img');
                        //shareButton.src = "../icons/share.40.png";
                        //shareButton.style = "height: 20px; width: 20px;";
                        //shareButton.alt = 'share';
                        //shareButton.setAttribute('class', 'share_button');
                        //shareButton.onclick = function () {
                        //    createNoteShareLink(row);
                        //};
                        //shareButtonContainer.appendChild(shareButton);
                        //actionButtonContainer.appendChild(shareButtonContainer);

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
                        cell_actions.setAttribute('name', 'action');
                        cell_actions.setAttribute('class', 'action-5');
                        cell_actions.setAttribute('data-label', 'text');

                        /*
                        cell_note field contains the note in graphical form, the way it will be seen in "the field" on web pages.
                        The purpose of this cell/column is that if all the other columns are de-selected by the user, the remaining column will look like a feed of notes^.
                        Much like any other newsfeed.

                        The difference is that with the YellowNotes tool the user can filter their feed by the columns that are not displayed.
                         */

                        //cell_note.textContent =  row.json;
                        cell_note.setAttribute('name', 'yellownote');
                        //cell_note.setAttribute('rendering', 'json');
                        cell_note.setAttribute('class', 'yellownote');

                        console.debug("calling createYellowNoteFromNoteDataObject");
                        createYellowNoteFromNoteDataObject(note_obj, true, false).then(function (note_root) {
                            console.debug(note_root);
                            // make certain redaction from the note that should not be shown in feed-mode
                            const note_table = note_root.querySelector('table[name="whole_note_table"]');
                            note_table.removeAttribute("style");
                            // but set the sizing for the note to be displayed in the table
                            note_root.querySelector('table[name="whole_note_table"]').setAttribute("style", "height: " + note_root.getAttribute("box_height") + "; width: " + note_root.getAttribute("box_width"));

                            note_root.setAttribute("style", "position: absolute; top: 0px; left: 0px");

                            // add the completed graphical yellownote to the table cell
                            const inserted = cell_note.appendChild(note_root);
                            //console.debug(inserted.outerHTML);
                            // make the cell size large enough to contain the note
                            cell_note.setAttribute("style", "height: " + (parseInt(note_root.getAttribute("box_height")) + parseInt(note_owners_control_bar_height)) + "px" + "; width: 250px;");
                            console.debug("calling attachEventlistenersToYellowStickynote");
                            attachEventlistenersToYellowStickynote(inserted, true, false);
                        });

                    });
                    resolve('Data saved OK');
                });
            });
        } catch (error) {
            console.error(error);
        }
    }

    // setup table items for sorting and filtering
// setup table items for sorting and filtering
setupTableFilteringAndSorting(table_name);


// Sort states for each column
const sortStates = {
    0: 'none', // None -> Ascending -> Descending -> None -> ...
    1: 'none'
};




    /*
    apply all filters simmultaneously

    TO DO. add a swith where the user can chose between whilecard and regexp filters (wildcard default)
    and chose to have the filters to be caseinsensitive or not (caseinsensitive default) or not (casesensitive default)
     */
    function DELETEfilterTableAllCols() {
        console.debug("filterTableAllCols");
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
                //console.debug(j + " ##########");
                //            console.debug(j);
                //console.debug(filtersCols[j]);
                //console.debug(filtersCols[j].value);
                //console.debug(filtersCols[j].tagName);
                //console.debug(filtersCols[j].tagName == "SELECT");
                //console.debug(filtersCols[j].getAttribute("filtertype") == "checkedmatch");
                //console.debug(filtersCols[j].tagName == "SELECT" && filtersCols[j].getAttribute("filtertype") == "checkedmatch");
                //console.debug(j + ": " + filtersCols[j].parentNode.getAttribute("colindex"));

                if (filtersCols[j].tagName == "SELECT" && filtersCols[j].getAttribute("filtertype") == "checkedmatch") {
                    // filter on whether or not a checkbox has been checked
                    var comparingCol = filtersCols[j].parentNode.getAttribute("colindex");
                    //console.debug("filter on col: " + comparingCol)
                    var cell = rows[i].getElementsByTagName("td")[comparingCol];
                    //console.debug(cell);
                    if (cell) {
                        //console.debug(cell.querySelector('input[type="checkbox"]'));
                        var isChecked = cell.querySelector('input[type="checkbox"]').checked;
                        //console.debug("isChecked: " + isChecked);
                        var filterValue = filtersCols[j].value;
                        //console.debug("filterValue: " + filterValue + " isChecked: " + isChecked);
                        if (filterValue === "active" && !isChecked ||
                            filterValue === "inactive" && isChecked) {
                            showRow = false;
                            break; // Exit the loop if any filter condition fails, there is no need to check the remaining filters for this row
                        }
                    }
                } else if (filtersCols[j].value && filtersCols[j].getAttribute("filtertype") == "selectmatch") {
                    console.debug("selectmatch");
                    // filter on whether or not a checkbox has been checked
                    var comparingCol = filtersCols[j].parentNode.getAttribute("colindex");
                    console.debug("filter on col: " + comparingCol)
                    var cell = rows[i].getElementsByTagName("td")[comparingCol];
                    console.debug(cell);
                    if (cell) {
                        console.debug(cell.getElementsByTagName("select"));

                        var selectElement = cell.getElementsByTagName("select")[0];
                        var selectedText = selectElement.options[selectElement.selectedIndex].text;

                        // Log the selected text to the console or return it from the function
                        console.debug('Currently selected text:', selectedText);

                        console.debug(cell.getElementsByTagName("select")[0].value);
                        //var isChecked = cell.querySelector('input[type="checkbox"]').checked;
                        //console.debug("isChecked: " + isChecked);
                        var filterValue = filtersCols[j].value;
                        console.debug("filterValue: " + filterValue + " selectedText: " + selectedText);

                        var regex = new RegExp(escapeRegex(filterValue), "i");
                        //console.debug("is cell content " + cell.textContent.trim() + ' matching regex: ' + regex);
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
                            //console.debug("filter on col: " + comparingCol)
                            var cell = rows[i].getElementsByTagName("td")[comparingCol];
                            if (cell) {
                                var filterValue = filtersCols[j].value;
                                var regex = new RegExp(escapeRegex(filterValue), "i");
                                //console.debug("is cell content " + cell.textContent.trim() + ' matching regex: ' + regex);
                                // Test the regex against the cell content
                                if (!regex.test(cell.textContent.trim())) {
                                    showRow = false;
                                    break; // Exit the loop if any filter condition fails, there is no need to check the remaining filters for this row
                                }
                            }

                        }
                    } catch (e) {
                        console.debug(e);
                    }

                }
            }
            // Show or hide the row based on the filter results
            rows[i].style.display = showRow ? "" : "none";
        }
    }

    function DELETEfilterTable_a() {
        //  console.debug("filterTable_a " );
        filterTable(event.target);
    }

    function DELETEfilterTable(colheader) {
        const columnIndex = colheader.parentNode.getAttribute("colindex");
        //console.debug(colheader);
        console.debug("filter on col: " + columnIndex)
        //const input = colheader;
        const filter = colheader.value.toUpperCase();
        const table = document.getElementById('subcribedDistributionlistNotesTable');
        const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
        console.debug(rows);
        console.debug("filter column:" + columnIndex);
        console.debug("filter value:" + filter);

        for (let i = 0; i < rows.length; i++) {
            const cell = rows[i].getElementsByTagName('td')[columnIndex];
            //console.debug(cell);
            if (cell) {
                const content = cell.innerText || cell.textContent;
                if (new RegExp(filter, 'i').test(content)) {
                    //        console.debug("not sho");
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

    //fetchNotes(getQueryStringParameter('distributionlistid'));

    async function DELETEfetchNotes(distributionlistid) {
        console.debug("fetchNotes");

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

        console.debug(data);

        var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
        console.debug(utc);
        console.debug(Date.now());
        var now = new Date;
        var utc_timestamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
                now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
        console.debug(utc_timestamp);
        console.debug(new Date().toISOString());

        // Get table body element
        const tableBody = document.getElementById('subcribedDistributionlistNotesTable').getElementsByTagName('tbody')[0];

        // Loop through data and populate the table
        data.forEach(row => {
            console.debug(row);
            console.debug(JSON.stringify(row));
            console.debug(row.noteid);

            // Create new row
            const newRow = tableBody.insertRow();
            //newRow.setAttribute('selectablecol', "true");
            newRow.setAttribute('noteid', row.noteid);
            // Create cells and populate them with data

            const cell_createtime = newRow.insertCell(0);
            const cell_lastmodifiedtime = newRow.insertCell(1);
            const type_cell = newRow.insertCell(2);
            const cell_name = newRow.insertCell(3);
            const cell_url = newRow.insertCell(4);
            const cell_message_text = newRow.insertCell(5);
            const cell_buttons = newRow.insertCell(6);
            const cell_note = newRow.insertCell(7);

            // parse the JSON of the note
            const obj = JSON.parse(row.json);
            console.debug(obj);

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
                console.debug(e);
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
            console.debug(row);
            const u = createNoteShareLink(row);
            console.debug(u);
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
        console.debug("fetchNote");

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

        console.debug(data);

        var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
        console.debug(utc);
        console.debug(Date.now());
        var now = new Date;
        var utc_timestamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
                now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
        console.debug(utc_timestamp);
        console.debug(new Date().toISOString());

        // Get table body element
        const tableBody = document.getElementById('subcribedDistributionlistNotesTable').getElementsByTagName('tbody')[0];

        // Loop through data and populate the table
        data.forEach(row => {
            console.debug(row);
            console.debug(JSON.stringify(row));
            console.debug(row.noteid);

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
            console.debug(obj);

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
                console.debug(e);
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
            console.debug(row);
            const u = createNoteShareLink(row);
            console.debug(u);
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
        console.debug("createNoteShareLink (datarow)");
        console.debug(datarow);

        // link must make the user subscribe to the feed the note belongs to, before directing the user to the note.
        // if the feed/distributionlist allowd anonymous access, the unknown/unauthenticated user will be directed to the note directly after subscribing to the feed

        // first part of the URL is the one to invite the user to subscribe to the feed of which the note is a part

        // the second part is to redirect to displaying  the note in the location where it is attached (the "gothere" functionality)

        // noteid
        // distributionlistid
        // url


        const userid = "";
        console.debug("go to url: " + datarow.url);

        const noteid = datarow.noteid;

        console.debug("go lookup noteid: " + noteid);

        console.debug(document.querySelector('tr[noteid="' + noteid + '"]'));

        const url = document.querySelector('tr[noteid="' + noteid + '"]').querySelector('[name="url"]').textContent.trim();
        console.debug(url);

        var textToCopy;

        textToCopy = "https://www.yellownotes.cloud/pages/gothere.html?noteid=" + noteid;
        console.debug(textToCopy);
        // place the url value in the clipboard
        //navigator.clipboard.writeText(textToCopy).then(() => {
        //    console.debug('Invitation URL copied to clipboard: ' + textToCopy);
        //}).catch(err => {
        //    console.error('Error in copying text: ', err);
        //});
        return textToCopy;
    }

    var valid_noteid_regexp = /^[a-zA-Z0-9\-\.\_]{20,100}$/;

    // check if the user is authenticated
    checkSessionJWTValidity()
    .then(isValid => {
        console.debug('JWT is valid:', isValid);
        if (isValid) {
            console.debug("JWT is valid - show menu accordingly");
            fetchAndDisplayStaticContent("../fragments/en_US/my_notes_page_header_authenticated.html", "my_notes_page_main_text").then(() => {});
            const uuid = localStorage.getItem("creatorid");
            const replacements = {creatorid: uuid};
            fetchAndDisplayStaticContent("../fragments/en_US/sidebar_fragment_authenticated.html", "sidebar", replacements).then(() => {
                //page_display_login_status();
                    // login_logout_action();
                });
        

            //page_display_login_status();

        } else {
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
