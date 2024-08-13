
try{

const table_name ="ownDistributionlistNotesTable";

const filterStorageKey = table_name + "_rowFilters";

console.debug("calling updateFilterRow");
updateFilterRow(table_name, filterStorageKey);


// if there is a querystring parameter, lokk up distribution list spiecified by that parameter
var distributionlistid = getQueryStringParameter('distributionlistid');
if (distributionlistid) {
    console.debug(distributionlistid);

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




const table_columns_to_not_display_keyname = table_name + "_hide_columns";

// store in local the sorting and columns that the user has selected to sort on
const table_columns_sort_array_keyname = table_name + "_sort_columns";

// store in local the filters and columns that the user has selected to filter on
const table_columns_filter_array_keyname = table_name + "_filer_columns";

var column_list = ['createtime', 'lastmodifiedtime', 'note_type', 'feed', 'location', 'enabled_status', 'selection_text', 'message_display_text', 'actions'];
column_list = ['createtime' ];

// attach event listeners to the column toggle checkboxes
console.debug("calling addEventColumnToggleListeners");
addEventColumnToggleListeners(column_list, table_name);

//addEventColumnToggleListeners(['createtime', 'lastmodifiedtime', 'note_type','feed', 'location', 'selection_text', 'message_display_text', 'enabled_status', 'actions'], table_name);

// setup table items for sorting and filtering
setupTableFilteringAndSorting(table_name);

// set table visibility defaults
// make this sensitive to the size screen the user is using
var not_show_by_default_columns = [];

// check if not_show_by_default_columns has been set
const pagewidth = window.innerWidth;
console.debug("window.innerWidth: " + pagewidth);

if (pagewidth < 300) {
    not_show_by_default_columns = ["createtime", "lastmodifiedtime", "note_type", "feed", "selection_text", "enabled_status", "actions"];
} else if (pagewidth < 600) {
    not_show_by_default_columns = ["createtime", "note_type", "selection_text", "enabled_status", "actions"];

} else if (pagewidth < 1000) {
    not_show_by_default_columns = ["createtime", "note_type", "selection_text", "enabled_status", "actions"];
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


// being page customization

// get data about the distribution list and populate the page with it


in_html_macro_replace(distributionlistid);


// end page customization

// start populating data tables
console.debug("calling fetchData");
fetchData( table_name, getQueryStringParameter('distributionlistid')).then(() => {
    console.log("data fetched");

    
    // apply sorting and filtering to the table

    not_show_by_default_columns.forEach(column => {
        toggleColumn(column, false, table_name, table_columns_to_not_display_keyname);
        document.getElementById(`toggle-${column}`).checked = false;
    });

    console.debug("apply sorting");
    try {
        var sortStates = JSON.parse(localStorage.getItem(table_name + '_new_sortStates')) || [];
        console.debug("calling applyExistingSortTable");
        applyExistingSortTable(table_name, sortStates);
     
        
        console.debug("calling applyFilters");
        applyFilters(table_name);
   
    } catch (e) {
        console.error(e);
    }

});
//fetchSubscribers(getQueryStringParameter('distributionlistid'));

//traverse_text(document.documentElement);
console.debug("################################################");


}catch(error){
    console.error(error);
}
//console.debug(all_page_text);
//console.debug(textnode_map);


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


// Fetch data on page load

// Fetch data on page load


//    const response = await fetch(server_url + "/api/v1.0/plugin_user_get_all_own_distributionlist_notes", {


function fetchData(table_name, distributionlistid) {
    console.log("fetchData (" +table_name + ", " + distributionlistid + ")");
try{
    return new Promise(
        function (resolve, reject) {

            var ynInstallationUniqueId = "";
            var xYellownotesSession = "";
            var distributionlists;
            var data;
        
            chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]).then(function (result) {
                console.log(result);
                console.log(ynInstallationUniqueId);
                ynInstallationUniqueId = result[plugin_uuid_header_name];
                xYellownotesSession = result[plugin_session_header_name];
                console.log(ynInstallationUniqueId);
                console.log(xYellownotesSession);
                return fetch(server_url + "/api/v1.0/plugin_user_get_all_own_distributionlist_notes", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [plugin_uuid_header_name]: ynInstallationUniqueId,
                        [plugin_session_header_name]: xYellownotesSession,
                    },
                    body: JSON.stringify({
                        distributionlistid: distributionlistid
                }) });
            }).then(response => {
                if (!response.ok) {
                    console.log(response);
    
                    // if an invalid session token was sent, it should be removed from the local storage
                    if (response.status == 401) {
                        // compare the response body with the string "Invalid session token" to determine if the session token is invalid
                        if(response.headers.get("session") == "DELETE_COOKIE"){
                                console.log("Session token is invalid, remove it from local storage.");
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
                console.debug(data);
               
    
    
                // Get table body element
                const tableBody = document.querySelector('table[name="'+table_name+'"]').getElementsByTagName('tbody')[0];
                
        // Loop through data and populate the table
    data.forEach(row => {
        console.log(row);
        console.log(JSON.stringify(row));
        console.log(row.noteid);

        // Create new row
        const newRow = tableBody.insertRow();

        newRow.setAttribute('noteid', row.noteid);

        // Create cells and populate them with data
       
        const cell_lastmodifiedtime = newRow.insertCell(0);
        const cell_createtime = newRow.insertCell(1);
        const cell_note_type = newRow.insertCell(2);
        const cell_url = newRow.insertCell(3);
        const cell_selection_text = newRow.insertCell(4);
        const cell_message_text = newRow.insertCell(5);
        const cell_enabled_status = newRow.insertCell(6);
        const cell_distributionlist = newRow.insertCell(7);
        const cell_buttons = newRow.insertCell(8);
        const cell_distributionlistname = newRow.insertCell(9);
        // do not include a option for notes in this release
        //const cell_notes = newRow.insertCell(7);


        // parse the JSON of the note
        const obj = JSON.parse(row.json);
        console.log(obj);

       
        // last create timestamp
        try {
            cell_createtime.textContent = timestampstring2timestamp(row.createtime);
            cell_createtime.setAttribute('class', 'datetime');
        } catch (e) {
            console.debug(e);
        }
        cell_createtime.setAttribute('name', 'createtime');

        // last modified timestamp
        try {
            cell_lastmodifiedtime.textContent = timestampstring2timestamp(row.lastmodifiedtime);
        } catch (e) {
            console.debug(e);
        }
        cell_lastmodifiedtime.setAttribute('name', 'lastmodifiedtime');

        try {
            cell_note_type.textContent = obj.note_type;

        } catch (e) {
            console.log(e);
        }
        cell_note_type.setAttribute('name', 'note_type');
          
        // feed name
        try {
            cell_distributionlistname.textContent = row.distributionlistname;
        } catch (e) {
            console.debug(e);
        }

 // feed name
 try {
    cell_selection_text.textContent = obj.selection_text;
} catch (e) {
    console.debug(e);
}

// status
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
                  await setNoteActiveStatusByUUID(row.noteid, 1);
              } else {
                  await setNoteActiveStatusByUUID(row.noteid, 0);
                  //           await enable_note_with_noteid(row.noteid);
              }
          });
          cell_enabled_status.appendChild(suspendActButton);
          cell_enabled_status.setAttribute('class', 'checkbox');
          cell_enabled_status.setAttribute('name', 'enabled_status');
          

        // url where note is attached
        cell_url.textContent = obj.url;
        cell_url.setAttribute('class', 'url');
        cell_url.setAttribute('name', 'location');

        // display/message text
        cell_message_text.textContent = b64_to_utf8(obj.message_display_text);
        cell_message_text.setAttribute('class', 'text');
        cell_message_text.setAttribute('name', 'message_display_text');


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
    resolve('Data saved OK');
});
});
}catch (error) {
console.error(error);
}
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
       
        const cell_createtime = newRow.insertCell(0);
        const cell_lastmodifiedtime = newRow.insertCell(1);
        const cell_type = newRow.insertCell(2);
        const cell_name = newRow.insertCell(3);
        const cell_url = newRow.insertCell(4);
        const cell_selection_text = newRow.insertCell(5);
        const cell_message_display_text = newRow.insertCell(5);
        const cell_enabled_status = newRow.insertCell(6);
        const cell_feed = newRow.insertCell(7);
        const cell_actions = newRow.insertCell(8);
        // do not include a option for notes in this release
        //const cell_notes = newRow.insertCell(7);

        // parse the JSON of the note
        const obj = JSON.parse(row.json);
        console.log(obj);

       
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
            cell_type.textContent = obj.note_type;
            cell_type.setAttribute('name', 'note_type');

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
           cell_enabled_status.appendChild(suspendActButton);
           cell_enabled_status.setAttribute('class', 'checkbox');

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
        cell_message_display_text.textContent = b64_to_utf8(obj.message_display_text);

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

        cell_actions.appendChild(goThereButtonContainer);

        //cell_buttons.appendChild(goThereButton);

        // const cell8 = newRow.insertCell(6);

    });

}



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
