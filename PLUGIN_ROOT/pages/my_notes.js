
// check if the user is authenticated
checkSessionJWTValidity()
.then(isValid => {
    console.debug('JWT is valid:', isValid);
    if (isValid) {
        console.debug("JWT is valid - show menu accordingly");
        fetchAndDisplayStaticContent("../fragments/en_US/my_notes_page_header_authenticated.html", "my_notes_page_main_text").then(() => {});
        fetchAndDisplayStaticContent("../fragments/en_US/my_notes_page_explanation.html", "my_notes_page_footer_text").then(() => {});
        const uuid = localStorage.getItem("creatorid");
        const replacements = {creatorid: uuid};
        fetchAndDisplayStaticContent("../fragments/en_US/sidebar_fragment_authenticated.html", "sidebar", replacements).then(() => {
            //page_display_login_status();
                // login_logout_action();
            });
    

        page_display_login_status();
    } else {
        console.debug("JWT is not valid - show menu accordingly");
        fetchAndDisplayStaticContent("../fragments/en_US/my_notes_page_header_unauthenticated.html", "my_notes_page_main_text").then(() => {});
        fetchAndDisplayStaticContent("../fragments/en_US/my_notes_page_explanation.html", "my_notes_page_footer_text").then(() => {});
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

// Example usage:
/*
checkSessionJWTValidity()
.then(isValid => {
console.debug('JWT is valid:', isValid);
})
.catch(error => {
console.error('Error:', error.message);
});
 */

const table_name = "myYellowNotesDataTable";
const filterStorageKey = table_name + "_rowFilters";

// update the filter in the filter row on the table. Loop through all the filters and update the filter row

console.debug("calling updateFilterRow");
updateFilterRow(table_name, filterStorageKey);

try {

    // setup special handling for creating correctly fomated filter for the filter boxes for columns containing dates
    //console.debug("calling setTimeRangeFilterDialog");
    //setTimeRangeFilterDialog("lastmodified-datetime-input");
    console.debug("calling setTimeRangeFilterDialog");

    setTimeRangeFilterDialog("createtime-datetime-input", "createtime-filter-dialog");

    setTimeRangeFilterDialog("lastmodifiedtime-datetime-input", "lastmodifiedtime-filter-dialog");

    // expand the textarea in the search filters
    //document.getElementById('createtime-datetime-input').addEventListener('input', function () {
    //    console.debug("createtime-datetime-input input modify");
    //    this.style.height = 'auto'; // Reset height to auto to calculate the new height
    //    this.style.height = this.scrollHeight + 'px'; // Set height to scrollHeight to expand the textarea
    //});

    //document.getElementById('createtime-datetime-input').addEventListener('change', function () {
    //    console.debug("createtime-datetime-input input modify");
    //    this.style.height = 'auto'; // Reset height to auto to calculate the new height
    //    this.style.height = this.scrollHeight + 'px'; // Set height to scrollHeight to expand the textarea
    //});

    // expand the textarea in the search filters
    document.getElementById('lastmodifiedtime-datetime-input').addEventListener('input', function () {
        console.debug("lastmodifiedtime-datetime-input input modify");
        this.style.height = 'auto'; // Reset height to auto to calculate the new height
        this.style.height = this.scrollHeight + 'px'; // Set height to scrollHeight to expand the textarea
    });

    document.getElementById('lastmodifiedtime-datetime-input').addEventListener('change', function () {
        console.debug("lastmodifiedtime-datetime-input change modify");
        this.style.height = 'auto'; // Reset height to auto to calculate the new height
        this.style.height = this.scrollHeight + 'px'; // Set height to scrollHeight to expand the textarea
    });

} catch (e) {
    console.error(e);
}

// which columns to display
// The users can decide which columns to display by ticking and unticking the checkboxes on a list of column names


const table_columns_to_not_display_keyname = table_name + "_hide_columns";

// store in local the sorting and columns that the user has selected to sort on
const table_columns_sort_array_keyname = table_name + "_sort_columns";

// store in local the filters and columns that the user has selected to filter on
const table_columns_filter_array_keyname = table_name + "_filer_columns";

const column_list = ['createtime', 'lastmodifiedtime', 'type', 'feed', 'location', 'enabled_status', 'selection_text', 'message_display_text', 'action', 'yellownote'];

// attach event listeners to the column toggle checkboxes
addEventColumnToggleListeners(column_list, table_name);




// setup table items for sorting and filtering
setupTableFilteringAndSorting(table_name);



// set table visibility defaults
// make this sensitive to the size screen the user is using

var not_show_by_default_columns = [];

// check if not_show_by_default_columns has been set
const pagewidth = window.innerWidth;
console.debug("window.innerWidth: " + pagewidth);

if (pagewidth < 300) {
    not_show_by_default_columns = ["createtime", "lastmodifiedtime", "type", "feed", "selection_text", "enabled_status", "action"];
} else if (pagewidth < 600) {
    not_show_by_default_columns = ["createtime", "type", "selection_text", "enabled_status", "action"];

} else if (pagewidth < 1000) {
    not_show_by_default_columns = ["createtime", "type", "selection_text", "enabled_status", "action"];
} else if (pagewidth < 1200) {
    not_show_by_default_columns = [];
}

console.debug("not_show_by_default_columns: " + not_show_by_default_columns);
console.debug("not_show_by_default_columns.length: " + not_show_by_default_columns.length);



  // check if the columns suppression has been set in memory, if not set it to the default, otherwise use the stored value
  getNotShowByDefaultColumns_asynch(table_columns_to_not_display_keyname, not_show_by_default_columns).then(columns => {
    not_show_by_default_columns = columns;
    console.log(not_show_by_default_columns);
}).catch(error => {
    console.error('Error:', error);
});




// check if the columns suppression has been set in memory, if not set it to the default, otherwise use the stored value
//console.debug("calling: getNotShowByDefaultColumns");
//not_show_by_default_columns = getNotShowByDefaultColumns(table_columns_to_not_display_keyname, not_show_by_default_columns);



console.debug("not_show_by_default_columns: " + not_show_by_default_columns);
console.debug("not_show_by_default_columns.length: " + not_show_by_default_columns.length);

// setut checkmarks for which columns to display and which to hide
//console.debug("calling: setColumnToggleMarks");
//setColumnToggleMarks(column_list, table_name, not_show_by_default_columns);

// hid the column headers that should not be shown
//console.debug("calling: hideColumns");
//not_show_by_default_columns.forEach(column => { hideColumn(column, false, table_name); });
     // update the list of columns and check/uncheck according to the list of columns to not display
     //not_show_by_default_columns.forEach(column => {
     //   toggleColumn(column, false,table_name, table_columns_to_not_display_keyname);
     //   document.getElementById(`toggle-${column}`).checked = false;
   // });


// create event listeners for the column toggle checkboxes
addEventColumnToggleListeners(column_list, table_name);



// call to database to get notes and place them in a table
fetchData(not_show_by_default_columns).then(function (d) {
    console.debug("read notes complete");
    console.debug(d);

    console.debug("not_show_by_default_columns: " + not_show_by_default_columns);
    console.debug(not_show_by_default_columns.length);


    not_show_by_default_columns.forEach(column => {
        toggleColumn(column, false, table_name, table_columns_to_not_display_keyname);
        document.getElementById(`toggle-${column}`).checked = false;
    });

    // update the list of columns and check/uncheck according to the list of columns to not display
    //not_show_by_default_columns.forEach(column => {
     //   console.debug("hide column: ", column);
     //   console.debug("calling: hideColumn");
        //toggleColumn(column, false, table_name, table_columns_to_not_display_keyname);
      //  hideColumn(column, false, table_name);
      //  document.getElementById(`toggle-${column}`).checked = false;

        // itterate through all entries in the yellownote column and reder as graphical yellow notes their contents

    //    const querySelector = 'tr td:nth-child(2)';

  //      console.debug("calling updateTableColumn");
   
   // });

});

// Function to use "fetch" to delete a data row
async function deleteSubscription(noteid) {
    try {

        const userid = "";
        console.debug("deleting: " + noteid);
        const message_body = '{ "noteid":"' + noteid + '" }';
        //console.debug(message_body);
        const installationUniqueId = (await chrome.storage.local.get([plugin_uuid_header_name]))[plugin_uuid_header_name];

        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);

        console.debug(installationUniqueId);
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
        console.debug(response);
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

async function goThere(datarow) {
    try {

        const userid = "";
        console.debug("go to url: " + datarow.url);

        console.debug("go lookup creatorid: " + datarow.creatorid);
        const noteid = datarow.noteid;

        console.debug("go lookup noteid: " + noteid);

        console.debug(document.querySelector('tr[noteid="' + noteid + '"]'));

        const url = document.querySelector('tr[noteid="' + noteid + '"]').querySelector('[name="url"]').textContent.trim();
        console.debug(document.querySelector('tr[noteid="' + noteid + '"]').querySelector('[name="url"]').textContent.trim());

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

// create the URL that when clicked on adds the user to the distribution list
// append a redirecturi that redicts the the page showing the distribution list

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
    var distributionlistid;
    try {

        distributionlistid = document.querySelector('tr[noteid="' + noteid + '"]').querySelector('[name="distributionlistid"]').value.trim();
        console.debug(distributionlistid);
        const redirectUri = encodeURIComponent("/pages/gothere.html?noteid=" + noteid);
        textToCopy = "https://www.yellownotes.cloud/pages/subscribe.html?add_distributionlistid=" + distributionlistid + "&redirecturi=" + redirectUri;
    } catch (e) {
        console.debug(e);
        textToCopy = "https://www.yellownotes.cloud/pages/gothere.html?noteid=" + noteid;
    }

    // place the url value in the clipboard
    // navigator.clipboard.writeText(textToCopy).then(() => {
    //     console.debug('Invitation URL copied to clipboard: ' + textToCopy);
    //}).catch(err => {
    //     console.error('Error in copying text: ', err);
    // });
    return textToCopy;
}

async function editNote(noteid) {
    try {

        const userid = "";
        console.debug("deleting: " + noteid);
        const message_body = '{ "noteid":"' + noteid + '" }';
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);

        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(server_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
                    [plugin_session_header_name]: session[plugin_session_header_name]
                },
                body: message_body // example IDs, replace as necessary
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


// Sort states for each column
//const sortStates = {
//    0: 'none', // None -> Ascending -> Descending -> None -> ...
//    1: 'none'
//};

// Fetch data on page load


function fetchData(not_show_by_default_columns) {
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
                return fetch(server_url + URI_plugin_user_get_own_yellownotes, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [plugin_uuid_header_name]: ynInstallationUniqueId,
                        [plugin_session_header_name]: xYellownotesSession,
                    },
                    body: JSON.stringify({}) // example IDs, replace as necessary, the body is used to retrieve the notes of other users, default is to retrieve the notes of the authenticated user
                });
            }).then(response => {
                if (!response.ok) {
                    console.debug(response);

                    // if an invalid session token was sent, it should be removed from the local storage
                    if (response.status == 401) {
                        // compare the response body with the string "Invalid session token" to determine if the session token is invalid
                        if (response.headers.get("session") == "DELETE_COOKIE") {
                            console.debug("Session token is invalid, remove it from local storage.");
                            chrome.storage.local.remove([plugin_session_header_name]);
                            // redirect to the front page returning the user to unauthenticated status.
                            // unauthenticated functionality will be in effect until the user authenticates
                            window.location.href = "/pages/my_account.html";
                            reject('logout');
                        } else {
                            reject('Network response was not ok');
                        }
                    } else {
                        reject('Network response was not ok');
                    }
                } else {
                    return response.json();
                }
            }).then(function (resp) {
                data = resp;
                console.debug("request: get_my_distribution_lists");
                // if update is to disable the note, remove it from the in-memory store
                const cacheKey = URI_plugin_user_get_my_distribution_lists.replace(/\//g, "_");

                console.debug("Cache key: " + cacheKey);
                const currentTime = Date.now();

                console.debug("currentTime: " + currentTime);
                const cachetimeout = 5;
                const endpoint = server_url + URI_plugin_user_get_my_distribution_lists;
                const protocol = "GET";

                // Accept data from cache if it is less than 60 seconds old
                // Make changes to this timeout when there is a procedure to empty the cache if the value has been updated.
                console.debug("calling cachableCall2API_GET");
                return cachableCall2API_GET(cacheKey, cachetimeout, protocol, endpoint);
            }).then(function (dist) {
                distributionListData = dist;

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

                    const cell_createtime = newRow.insertCell(0);
                    const cell_lastmodified = newRow.insertCell(1);
                    const type_cell = newRow.insertCell(2);
                    const cell_enabled_status = newRow.insertCell(3);
                    const cell_url = newRow.insertCell(4);
                    const cell_selection = newRow.insertCell(5);
                    const cell_message = newRow.insertCell(6);
                    const cell_actions = newRow.insertCell(7);
                    const cell_distributionlist = newRow.insertCell(8);
                    const cell_note = newRow.insertCell(9);

                    const obj = JSON.parse(row.json);
                    // key column - not to be displayed
                    // create timestamp - not to be dsiplayed either
                    try {
                        //console.debug(row.createtime);
                        //console.debug(/20/.test(row.createtime));
                        if (/2024/.test(row.createtime)) {
                           // console.debug("createtime is timestamp: " + row.createtime);
                            //console.debug("createtime: " + integerstring2timestamp(row.createtime));

                            cell_createtime.textContent = timestampstring2timestamp(row.createtime);
                            cell_createtime.setAttribute('class', 'datetime');
                        } else {

                          //  console.debug("createtime is integer: " + row.createtime)
                            cell_createtime.textContent = integerstring2timestamp(row.createtime);
                            cell_createtime.setAttribute('class', 'datetime');

                        }
                        cell_createtime.setAttribute('name', 'createtime');
                        // Adding data-label for mobile responsive
                        cell_createtime.setAttribute('data-label', 'createtime');

                        if (not_show_by_default_columns.indexOf("createtime") !== -1) {
                            cell_createtime.className = "hidden";
                        }


                    } catch (e) {
                        console.debug(e);
                    }
                    try {
                      //  console.debug(row.lastmodifiedtime);
                      //  console.debug(/2024/.test(row.lastmodifiedtime));
                        if (/2024/.test(row.lastmodifiedtime)) {
                            console.debug("lastmodifiedtime is timestamp: " + row.lastmodifiedtime);
                            cell_lastmodified.textContent = timestampstring2timestamp(row.lastmodifiedtime);
                            cell_lastmodified.setAttribute('class', 'datetime');
                        } else {
                            console.debug("lastmodifiedtime is integer: " + row.lastmodifiedtime)
                            cell_lastmodified.textContent = integerstring2timestamp(row.lastmodifiedtime);
                            cell_lastmodified.setAttribute('class', 'datetime');
                        }
                        if (not_show_by_default_columns.indexOf("lastmodifiedtime") !== -1) {
                            cell_lastmodified.className = "hidden";
                        }
                        cell_lastmodified.setAttribute('name', 'lastmodifiedtime');
                        // Adding data-label for mobile responsive
                        cell_lastmodified.setAttribute('data-label', 'lastmodified');

                    } catch (e) {
                        console.debug(e);
                    }

                    try {
                        type_cell.textContent = obj.note_type;
                        type_cell.setAttribute('name', 'note_type');
                        type_cell.setAttribute('class', 'compact');
                        if (not_show_by_default_columns.indexOf("note_type") !== -1) {
                            type_cell.className = "hidden";
                        }
                     
                    } catch (e) {
                        console.debug(e);
                    }

                    // render a check box to enable/disable the note
                    const suspendActButton = document.createElement("span");
                    if (row.enabled_status == 1) {
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
                            await setNoteEnabledStatusByUUID(row.noteid, 1);
                        } else {
                            await setNoteEnabledStatusByUUID(row.noteid, 0);
                            //           await enable_note_with_noteid(row.noteid);
                        }
                    });
                    cell_enabled_status.appendChild(suspendActButton);
                    cell_enabled_status.setAttribute('class', 'checkbox');
                    cell_enabled_status.setAttribute('name', 'enabled_status');

                    // where note is attached
                    //contenteditable="true"
                    cell_url.textContent = obj.url;
                    cell_url.setAttribute('contenteditable', 'true');
                    cell_url.setAttribute('data-label', 'url');
                    cell_url.setAttribute('name', 'url');
                    cell_url.setAttribute('class', 'url');
                    if (not_show_by_default_columns.indexOf("location") !== -1) {
                        cell_url.className = "hidden";
                    }
                    // selection
                    // contenteditable="true"
                    if (obj.note_type == "yellownote") {
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
                    if (not_show_by_default_columns.indexOf("selection_text") !== -1) {
                        cell_selection.className = "hidden";
                    }

                    // message payload
                    // contenteditable="true"
                    if (obj.note_type == "yellownote") {
                        try {
                            //      cell_message.textContent = b64_to_utf8(obj.message_display_text);

                           // console.debug(obj.message_display_text);

                            //cont1.querySelector('[name="message_display_text"]').replaceChildren(document.createTextNode(b64_to_utf8(note_object_data.message_display_text)));

                            cell_message.innerHTML = "<div>" + b64_to_utf8(obj.message_display_text) + "</div>";
                          //  console.debug(cell_message);

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
                       // console.debug(cell_message);

                        //cell_message.textContent = b64_to_utf8(obj.message_display_text);
                        cell_message.setAttribute('name', 'message_display_text');
                    }
                    cell_message.setAttribute('contenteditable', 'true');
                    cell_message.setAttribute('data-label', 'text');
                    cell_message.setAttribute('name', 'message_display_text');
                    cell_message.setAttribute('class', 'text');
                    if (not_show_by_default_columns.indexOf("message_display_text") !== -1) {
                        cell_message.className = "hidden";
                    }
                    // Create the dropdown list for the distribution list
                    console.debug("calling createDropdown");
                    const dropdown = createDropdown(distributionListData, row.distributionlistid);
                    console.debug(dropdown);
                    cell_distributionlist.appendChild(dropdown);
                    //cell_distributionlist.setAttribute('name', 'distributionlistid');
                    cell_distributionlist.firstChild.setAttribute('name', 'distributionlistid');
                    // cell7.textContent = 'yellownote=%7B%22url%22%3A%22file%3A%2F%2F%2FC%3A%2Ftemp%2F2.html%22%2C%22uuid%22%3A%22%22%2C%22message_display_text%22%3A%22something%22%2C%22selection_text%22%3A%22b71-4b02-87ee%22%2C%22posx%22%3A%22%22%2C%22posy%22%3A%22%22%2C%22box_width%22%3A%22250%22%2C%22box_height%22%3A%22250%22%7D=yellownote';
                    //cell7.setAttribute('style', 'height: 250px; width: 350px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;');


                    // create small table to contain the action buttons

                    // Add button container
                    const actionButtonContainer = document.createElement('div');
                    actionButtonContainer.setAttribute('class', 'button-container');

                    // Add delete button
                    const deleteButtonContainer = document.createElement('div');
                    deleteButtonContainer.setAttribute('class', 'delete_button');
                    const deleteButton = document.createElement('img');
                    deleteButton.src = "../icons/trash-can.transparent.40x40.png";
                    deleteButton.alt = 'delete';
                    deleteButton.setAttribute('class', 'delete_button');
                    deleteButton.onclick = function () {
                        // Remove the row from the table
                        newRow.remove();
                        // call to API to delete row from data base
                        delete_note_by_noteid(row.noteid);
                    };
                    deleteButtonContainer.appendChild(deleteButton);
                    actionButtonContainer.appendChild(deleteButtonContainer);

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
                    if (not_show_by_default_columns.indexOf("actions") !== -1) {
                        cell_actions.className = "hidden";
                    }

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
                    if (not_show_by_default_columns.indexOf("yellownote") !== -1) {
                        cell_note.className = "hidden";
                    }
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

var valid_noteid_regexp = /^[a-zA-Z0-9\-\.\_]{20,100}$/;

// Function to use "fetch" to re-activate a data agreement
async function setNoteEnabledStatusByUUID(noteid, enabled_status) {
    console.debug("setNoteEnabledStatusByUUID: " + noteid + " status: " + enabled_status);
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";
        const message_body = JSON.stringify({
                noteid: noteid,
                enabled_status: enabled_status,
            });
        //console.debug(message_body);

        // check if url is on http (and therefore not in the plugin GUI), which should not ordinarily be the case
        // if it is, then the note is not in the plugin GUI and the note in the table should not be updated
        // update the table of notes
        if (!isHttpUrl()) {
            console.debug("not a http url");
            // update the table of notes
            //  update_notes_table();
            const table_row = document.querySelector('tr[noteid="' + noteid + '"]');
            console.debug(table_row);
            const all_boxes = table_row.querySelectorAll('[name="enabled_status"][type="checkbox"]');
            console.debug(all_boxes);
            all_boxes.forEach(box => {
                console.debug(box);
                console.debug(enabled_status);
                if (enabled_status == 1) {
                    box.setAttribute("checked", "true");
                } else {

                    box.removeAttribute("checked");
                }
            });
        } else {
            // the note is on a page somewhere, nevermind about additional form updates
            console.debug("a http url");

        }

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

/**
 * save changes to the notes attachment url and content text ( or URL incase of webframe)
 * @param {
 * } noteid
 */
async function saveChanges(noteid, event) {
    console.debug("saveChanges: " + noteid);
    console.debug(event.target);
    console.debug(event.target.parentNode);

    const row_root = document.querySelector('tr[noteid="' + noteid + '"]');
    console.debug(row_root);
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);

        var content_url;
        var message_display_text;

        var selection_text;

        try {

            selection_text = utf8_to_b64(row_root.querySelector('[name="selection_text"]').textContent.trim());
        } catch (e) {
            console.debug(e);
        }
        const url = row_root.querySelector('[name="url"]').textContent;
        const note_type = row_root.querySelector('[name="note_type"]').textContent;

        var message_body;
        if (note_type == "webframe") {
            console.debug("webframe");
            try {
                content_url = row_root.querySelector('[name="message_display_text"]').textContent.trim();

            } catch (e) {
                console.debug(e);
            }
            message_body = JSON.stringify({
                    noteid: noteid,
                    note_type: note_type,
                    url: url,
                    content_url: content_url,
                });
        } else if (note_type == "capture_note") {}
        else {
            // yellownote

            try {
                message_display_text = row_root.querySelector('[name="message_display_text"]').innerHTML;

            } catch (e) {
                console.debug(e);
            }
            console.debug("message_display_text: " + message_display_text);
            const encoded_message_display_text = utf8_to_b64(message_display_text);

            const msg = {
                noteid: noteid,
                note_type: note_type,
                url: url,
                message_display_text: encoded_message_display_text,
                selection_text: selection_text
            }
            console.debug(msg);
            message_body = JSON.stringify(msg);
        }

        console.debug(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_savechanges_yellownote, {
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

async function setNoteDistributionlistId(noteid, distributionlistid) {
    console.debug("setNoteDistributionlistId: noteid: " + noteid + ", distributionlistid: " + distributionlistid);
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";
        const message_body = JSON.stringify({
                noteid: noteid,
                distributionlistid: distributionlistid,
            });

        const response = await fetch(
                server_url + URI_plugin_user_setdistributionlist_yellownote, {
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

function delete_note_by_noteid(noteid) {
    console.debug("delete_note_by_noteid.start");

    chrome.runtime.sendMessage({
        message: {
            "action": "single_note_delete",
            "delete_details": {
                "noteid": noteid
            }
        }
    }, function (response) {
        console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
        console.debug("message sent to backgroup.js with response code: " + response.statuscode);

    });
}

function disable_note_with_noteid(noteid) {
    console.debug("disable_note_with_noteid: " + noteid);
    console.debug(valid_noteid_regexp.test(noteid));
    if (valid_noteid_regexp.test(noteid)) {
        // send save request back to background
        chrome.runtime.sendMessage({
            message: {
                "action": "single_note_disable",
                "disable_details": {
                    "noteid": noteid,
                    "enabled": false
                }
            }
        }, function (response) {
            console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));

        });

    }
}

function enable_note_with_noteid(noteid) {
    console.debug("enable_note_with_noteid: " + noteid);
    console.debug(valid_noteid_regexp.test(noteid));
    if (valid_noteid_regexp.test(noteid)) {
        // send save request back to background
        chrome.runtime.sendMessage({
            message: {
                "action": "single_note_enable",
                "enable_details": {
                    "noteid": noteid
                }
            }
        }, function (response) {
            console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
        });
    }
}

if (is_authenticated()) {
    console.debug("user is authenticated - show menu accordingly");
    //page_display_login_status();
    // login_logout_action();

    //});

    page_display_login_status();

} else {
    console.debug("user is not authenticated - show menu accordingly");
    //page_display_login_status();
    //   login_logout_action();

    //});

    page_display_login_status();

}
