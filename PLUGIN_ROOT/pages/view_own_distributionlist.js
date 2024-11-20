
try {

    const table_name = "ownDistributionlistNotesTable";

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
            try {
                console.debug("JWT is valid - show menu accordingly");
                fetchAndDisplayStaticContent("../fragments/en_US/view_own_distributionlist_main_text.html", "view_own_distributionlist_main_text").then(() => {});

                fetchAndDisplayStaticContent("../fragments/en_US/note_header_customization_start_text.html", "note_header_customization_start_text").then(() => {});

                fetchAndDisplayStaticContent("../fragments/en_US/note_header_customization_end_text.html", "note_header_customization_end_text").then(() => {});

                const uuid = localStorage.getItem("creatorid");
                const replacements = {
                    creatorid: uuid
                };
                fetchAndDisplayStaticContent("../fragments/en_US/sidebar_fragment_authenticated.html", "sidebar", replacements).then(() => {
                    //page_display_login_status();
                    // login_logout_action();
                });

                page_display_login_status();
            } catch (error) {
                console.error(error);
            }
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
    column_list = ['createtime'];

    //addEventColumnToggleListeners(['createtime', 'lastmodifiedtime', 'note_type','feed', 'location', 'selection_text', 'message_display_text', 'enabled_status', 'actions'], table_name);

    // setup table items for sorting and filtering
    setupTableFilteringAndSorting(table_name);

    // set table visibility defaults
    // make this sensitive to the size screen the user is using
    var not_show_by_default_columns = [];

    // check if not_show_by_default_columns has been set
    const pagewidth = window.innerWidth;
    console.debug("window.innerWidth: " + pagewidth);

    document.getElementById(`toggle-createtime`).addEventListener('change', function () {
        toggleColumn("createtime", this.checked, tableName, table_columns_to_not_display_keyname);
    });

    // attach event listeners to the column toggle checkboxes
    console.debug("calling addEventColumnToggleListeners");
    addEventColumnToggleListeners(column_list, table_name);

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

    console.debug("calling in_html_macro_replace");
    in_html_macro_replace(distributionlistid);

    // start populate the field in the note header editor with the relevant data from the distribution list

    var ynInstallationUniqueId = "";
    var xYellownotesSession = "";
    // var distributionlists;
    var data;

    chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]).then(function (result) {
        console.log(result);
        console.log(ynInstallationUniqueId);
        ynInstallationUniqueId = result[plugin_uuid_header_name];
        xYellownotesSession = result[plugin_session_header_name];
        console.log(ynInstallationUniqueId);
        console.log(xYellownotesSession);
        return fetch(server_url + '/api/v1.0/plugin_user_get_distribution_list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [plugin_uuid_header_name]: ynInstallationUniqueId,
                [plugin_session_header_name]: xYellownotesSession,
            },
            body: JSON.stringify({
                distributionlistid: distributionlistid
            })
        });
    }).then(response => {
        if (!response.ok) {
            console.log(response);

            // if an invalid session token was sent, it should be removed from the local storage
            if (response.status == 401) {}
            else {
                reject('Network response was not ok');
            }
        } else {
            return response.json();
        }
    }).then(function (resp) {
        data = resp;
        console.debug(data[0]);
        var noteheaderhtml = data[0].noteheader_html;
        console.log(noteheaderhtml);
        // update the note header edit form with the data from the distribution list

        // step throug hthe fields in the note header and update the form with the data from the distribution list
        // locate font-family in the note header and set the value to the font-family from the distribution list

        // the returned ata looks like <td id="noteheader-preview-cell" style="font-size: 10px; color: rgb(0, 0, 0); background-color: rgb(255, 255, 0); font-family: Arial;"><div style="display: flex; align-items: center; justify-content: flex-start;"><span>awdas</span></div></td>
        // the font-family is the last attribute in the style attribute
        //extract the font-family from the noteheaderhtml

        try {
            var font_family = noteheaderhtml.match(/font-family:([^;]+);/)[1];
            console.debug(font_family);
            // set the font-family in the note header edit form
            document.querySelector('[id="font-family"]').value = font_family;
        } catch (e) {
            console.error(e);
        }
        try {
            // background color
            var bg_color = noteheaderhtml.match(/background-color:([^;]+);/)[1];
            console.debug(bg_color);
            document.querySelector('[id="bg-color"]').value = rgbToHex(bg_color);
        } catch (e) {
            console.error(e);
        }

        try {
            // font color
            var font_color = noteheaderhtml.match(/color:([^;]+);/)[1];
            console.debug(font_color);
            document.querySelector('[id="font-color"]').value = rgbToHex(font_color);
        } catch (e) {
            console.error(e);
        }

        try {
            // font size option list preselect the font size

            console.debug(noteheaderhtml.match(/font-size:([^;]+);/));
            var font_size = noteheaderhtml.match(/font-size:([^;]+);/)[1];
            console.debug(font_size);

            const selectElement = document.querySelector('[id="font-size"]');
            console.debug(selectElement);
            if (selectElement) {
                // search for option value that matches the font size
                const options = selectElement.querySelectorAll('option');
                console.debug(options);
                for (let i = 0; i < options.length; i++) {
                    console.debug(options[i].value, " ", font_size);
                    if (options[i].value.trim == font_size.trim) {
                        // set the selected index to the index of the option that matches the font size
                        options[i].setAttribute('selected', 'selected');
                        console.debug(options[i]);
                        //selectElement.selectedIndex = i;
                        //break;
                    } else {}

                }
            }
        } catch (e) {
            console.error(e);
        }

     


        try {
            // font family option list preselect the font family
            console.debug(noteheaderhtml.match(/font-family:([^;]+);/));
            var font_family = noteheaderhtml.match(/font-family:([^;]+);/)[1];
            console.debug(font_family);

            const selectElement = document.querySelector('[id="font-family"]');
            console.debug(selectElement);
            if (selectElement) {
                // search for option value that matches the font size
                const options = selectElement.querySelectorAll('option');
                console.debug(options);
                for (let i = 0; i < options.length; i++) {
                    console.debug(options[i].value);
                    if (options[i].value.trim === font_family.trim) {
                        // set the selected index to the index of the option that matches the font size
                        options[i].setAttribute('selected', 'selected');
                        console.debug(options[i]);
                        //selectElement.selectedIndex = i;
                        //break;
                    }
                }

            }
        } catch (e) {
            console.error(e);
        }

        try {
        // image position
        var image_position = noteheaderhtml.match(/justify-content:([^;]+);/)[1];
        console.debug(image_position);
        //document.querySelector('[id="image-position"]').value = image_position;
        const positionElement = document.querySelector('[id="image-position"]');
        console.debug(positionElement);
        if (positionElement) {
            // search for option value that matches the font size
            const options = positionElement.querySelectorAll('option');
            console.debug(options);
            for (let i = 0; i < options.length; i++) {
                console.debug(options[i].value);
                if (options[i].value.trim === image_position.trim) {
                    // set the selected index to the index of the option that matches the font size
                    options[i].setAttribute('selected', 'selected');
                    console.debug(options[i]);
                    //selectElement.selectedIndex = i;
                    //break;
                }
            }

        }

    } catch (e) {
        console.error(e);
    }

        try {
            // text

            var text_content = noteheaderhtml.match(/<span>([^<]+)<\/span>/)[1];
            console.debug(text_content);

            document.querySelector('[id="text_content"]').setAttribute("value",  text_content);

        } catch (e) {
            console.error(e);
        }

        try {

            // image
        console.log(noteheaderhtml);
            var image_content = noteheaderhtml.match(/img *name=\"feed_icon\" *src=\"([^\"]+)\"/)[1];
            console.debug(image_content);
            // place the image retirende from the API into the form
            document.querySelector('[id="distributionlist_icon"]').setAttribute("src", image_content);
           // console.log( document.querySelector('[name="distributionlist_icon"]') );
            //document.querySelector('[name="distributionlist_icon"]').setAttribute("src", image_content);


        } catch (e) {
            console.error(e);
        }

        // console.debug("calling substituteAttributes");
        // use macro substituion on the page. The data object is a key-value pair object
        // replacing strong on the page with values from the data object (the distributionlist)
        //substituteAttributes(data[0]);

        
 const targetNode = document.querySelector('[id="noteheader-preview-cell"]');
 console.debug(targetNode);
 if (targetNode) {
    targetNode.innerHTML = noteheaderhtml;

    
} else {
    console.error('No DOM element with name attribute "test01" found');
}

    });

    /// end populate


    // end page customization

    // start populating data tables
    console.debug("calling fetchData");
    fetchData(table_name, getQueryStringParameter('distributionlistid')).then(() => {
        console.log("data fetched");

        // update the note header edit form with the data from the distribution list


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

        console.debug("adding updatePreview");
        console.debug("calling attachEventlistener2Editform");
        attachEventlistener2Editform();

    });
   
    //traverse_text(document.documentElement);
    console.debug("################################################");

} catch (error) {
    console.error(error);
}
//console.debug(all_page_text);
//console.debug(textnode_map);


//const browser_id = chrome.runtime.id;

function rgbToHex(rgb) {
    console.debug("rgbToHex: " + rgb);
    // Extract the numeric values from the "rgb(r, g, b)" format
    const rgbValues = rgb.match(/\d+/g);
    if (!rgbValues || rgbValues.length !== 3) {
        throw new Error("Invalid RGB format. Expected format: rgb(r, g, b)");
    }

    // Convert each value to hexadecimal and pad with zeroes if necessary
    const[r, g, b] = rgbValues.map(num => {
            const hex = parseInt(num).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        });

    // Return the concatenated result in "#rrggbb" format
    return `#${r}${g}${b}`;
}



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
    console.log("fetchData (" + table_name + ", " + distributionlistid + ")");
    try {
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
                    })
                });
            }).then(response => {
                if (!response.ok) {
                    console.log(response);

                    // if an invalid session token was sent, it should be removed from the local storage
                    if (response.status == 401) {
                        // compare the response body with the string "Invalid session token" to determine if the session token is invalid
                        if (response.headers.get("session") == "DELETE_COOKIE") {
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
                const tableBody = document.querySelector('table[name="' + table_name + '"]').getElementsByTagName('tbody')[0];

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

                    try {
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

                    try {

                        const redirectUri = encodeURIComponent("/pages/gothere.html?noteid=" + row.noteid);
                        shareable_url.setAttribute('href', "https://www.yellownotes.cloud/pages/subscribe.html?add_feedid=" + distributionlistid + "&redirecturi=" + redirectUri);
                    } catch (e) {
                        console.debug(e);
                        shareable_url.setAttribute('href', "https://www.yellownotes.cloud/pages/gothere.html?noteid=" + row.noteid);
                    }

                    shareable_url.setAttribute('target', '_blank');
                    shareable_url.appendChild(goThereButton);

                    cell_buttons.appendChild(shareable_url);

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

        goto_url = "";
        console.log(goto_url);
        link.href = goto_url;
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
