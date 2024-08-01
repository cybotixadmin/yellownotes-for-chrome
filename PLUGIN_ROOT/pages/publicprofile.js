

// check if the user is authenticated
checkSessionJWTValidity()
.then(isValid => {
    console.debug('JWT is valid:', isValid);
    if (isValid) {
        console.debug("JWT is valid - show menu accordingly");
        fetchAndDisplayStaticContent("../fragments/en_US/publicprofile_main_text.html", "publicprofile_main_text").then(() => {});
        const uuid = localStorage.getItem("creatorid");
        const replacements = {creatorid: uuid};
        fetchAndDisplayStaticContent("../fragments/en_US/sidebar_fragment_authenticated.html", "sidebar", replacements).then(() => {
        //page_display_login_status();
            // login_logout_action();
        });

        page_display_login_status();
    } else {
        console.debug("JWT is not valid - show menu accordingly");
        fetchAndDisplayStaticContent("../fragments/en_US/publicprofile_main_text.html", "publicprofile_main_text").then(() => {});
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

// the API has security mechanism in place the screen the value for undesirable content
try {
    const creatorid = getQueryStringParameter("creatorid");
    if (creatorid) {
        console.debug("creatorid parameter found ");
        // lookup the creatorid in the database(/API)


    } else {}
} catch (e) {
    console.error(e);
}

const table_name = "creatorsPublicDistributionlistsTable";

const table_columns_to_not_display_keyname = "creator_distributionlists_hide_columns2";

// which columns to display
// The users can decide which columns to display by ticking and unticking the checkboxes on a list of column names

//document.getElementById('toggle-name').addEventListener('change', function () {
//    toggleColumn('name', this.checked,"distributionsTable", table_columns_to_not_display_keyname);
//});

//document.getElementById('toggle-description').addEventListener('change', function () {
//    toggleColumn('description', this.checked,"distributionsTable", table_columns_to_not_display_keyname);
//});


// set table visibility defaults
// make this sensitive to the size screen the user is using

var not_show_by_default_columns = [];

// check if not_show_by_default_columns has been set
const pagewidth = window.innerWidth;
console.debug("window.innerWidth: " + pagewidth);

if (pagewidth < 300) {
    not_show_by_default_columns = ["created", "restrictions", "actions"];
    console.debug("created", "restrictions", "actions");
} else {

    not_show_by_default_columns = [];
}

// call to database to get notes and place them in a table
console.debug("calling fetchFeeds");
fetchFeeds(getQueryStringParameter('creatorid'), table_name, not_show_by_default_columns)
.then(function (d) {
    console.debug("toggle columns off by default");
    console.debug(not_show_by_default_columns);
    not_show_by_default_columns.forEach(column => {
        toggleColumn(column, false, "distributionsTable", table_columns_to_not_display_keyname);
        document.getElementById(`toggle-${column}`).checked = false;
    });

});



// Fetch data on page load
console.debug("calling fetchCreatorInfo");
fetchCreatorInfo(getQueryStringParameter('creatorid'))
.then(function (d) {
    console.debug(".....");
    
    
    
});






function fetchFeeds(creatorid, table_name, not_show_by_default_columns) {
    console.debug("fetchFeeds.start");
    console.debug(creatorid);
    console.debug(table_name);

    try {
        return new Promise(
            function (resolve, reject) {
            var ynInstallationUniqueId = "";
            var xYellownotesSession = "";
            var distributionlists;
            var data;
            //const installationUniqueId = (await chrome.storage.local.get([plugin_uuid_header_name]))[plugin_uuid_header_name];


            chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]).then(function (result) {
                console.debug(result);
                console.debug(ynInstallationUniqueId);
                ynInstallationUniqueId = result[plugin_uuid_header_name];
                xYellownotesSession = result[plugin_session_header_name];
                console.debug(ynInstallationUniqueId);
                console.debug(xYellownotesSession);
                return fetch(server_url + "/api/v1.0/plugin_user_get_distributionlists_by_creatorid", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [plugin_uuid_header_name]: ynInstallationUniqueId,
                        [plugin_session_header_name]: xYellownotesSession,
                    },
                    body: JSON.stringify({
                        creatorid: creatorid
                    }) // example IDs, replace as necessary, the body is used to retrieve the notes of other users, default is to retrieve the notes of the authenticated user
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

                    // Create new row
                    const newRow = tableBody.insertRow();
                    newRow.setAttribute('distributionlistid', row.distributionlistid);

                    // Create cells and populate them with data

                    const cell_distributionlist_name = newRow.insertCell(0);
                    const cell_distributionlist_description = newRow.insertCell(1);
                    const cell_actions = newRow.insertCell(2);

                    // make cell contatns link to chrome-extension://icamjmkjpboaampbflplghamhbfhfnia/pages/view_distributionlist.html?distributionlistid=30c175f0-3c40-7e70-ad59-e4fac4d394b6

                    try {
                        const dist_link = document.createElement('a');
                        dist_link.href = "/pages/view_distributionlist.html?distributionlistid=" + row.distributionlistid;
                        dist_link.textContent = row.name;
                        cell_distributionlist_name.appendChild(dist_link);
                        cell_distributionlist_name.setAttribute('name', 'distributionlist_name');
                        cell_distributionlist_name.setAttribute('class', 'displayname');
                    } catch (e) {
                        console.debug(e);
                    }
                    try {
                        cell_distributionlist_description.textContent = row.description;
                        cell_distributionlist_description.setAttribute('name', 'distributionlist_description');
                        cell_distributionlist_description.setAttribute('class', 'displayname');
                    } catch (e) {
                        console.debug(e);
                    }

                    // create small table to contain the action buttons

                    // Add button container
                    const actionButtonContainer = document.createElement('div');
                    actionButtonContainer.setAttribute('class', 'button-container');

                    // Add subscribe button
                    const subscribeButtonContainer = document.createElement('div');
                    subscribeButtonContainer.setAttribute('class', 'go_to_location_button');
                    const subscribe_link = document.createElement('a');

                    subscribe_link.href = "/pages/subscribe.html?subscribe=" + row.distributionlistid;
                    subscribe_link.target = "_blank";
                    subscribe_link.name = "subscribe_distributionlistid";
                    subscribe_link.textContent = 'subscribe';

                    //const subscribeButton = document.createElement('img');
                    //subscribeButton.src = "../icons/goto.icon.transparent.40x40.png";
                    //subscribeButton.alt = 'go there';
                    //subscribeButton.setAttribute('class', 'go_to_location_button');
                    //goThereButton.onclick = function () {
                    //    goThere(row);
                    //};
                    //subscribe_link.appendChild(subscribeButton);
                    subscribeButtonContainer.appendChild(subscribe_link);
                    actionButtonContainer.appendChild(subscribeButtonContainer);

                    // Add unsubscribe button
                    const unsubscribeButtonContainer = document.createElement('div');
                    unsubscribeButtonContainer.setAttribute('class', 'go_to_location_button');
                    const unsubscribe_link = document.createElement('a');

                    unsubscribe_link.href = "/pages/subscribe.html?unsubscribe=" + row.distributionlistid;
                    unsubscribe_link.target = "_blank";
                    unsubscribe_link.name = "unsubscribe_distributionlistid";
                    unsubscribe_link.textContent = 'unsubscribe';
                    // const unsubscribeButton = document.createElement('img');
                    // unsubscribeButton.src = "../icons/NOT_FOUND.40x40.png";
                    // unsubscribeButton.alt = 'unsubscribe';
                    // unsubscribeButton.setAttribute('class', 'go_to_location_button');
                    //goThereButton.onclick = function () {
                    //    goThere(row);
                    //};
                    // unsubscribe_link.appendChild(unsubscribeButton);
                    unsubscribeButtonContainer.appendChild(unsubscribe_link);
                    actionButtonContainer.appendChild(unsubscribeButtonContainer);

                    // Add suspend button


                    const suspendButtonContainer = document.createElement('div');
                    suspendButtonContainer.setAttribute('class', 'go_to_location_button');
                    const suspend_link = document.createElement('a');

                    suspend_link.href = "/pages/subscribe.html?suspend=" + row.distributionlistid;
                    suspend_link.target = "_blank";
                    suspend_link.name = "suspend_distributionlistid";

                    const suspendButton = document.createElement('img');
                    suspendButton.src = "../icons/pause.40.png";
                    suspendButton.alt = 'go there';
                    suspendButton.setAttribute('class', 'go_to_location_button');
                    //goThereButton.onclick = function () {
                    //    goThere(row);
                    //};
                    suspend_link.appendChild(suspendButton);
                    suspendButtonContainer.appendChild(suspend_link);
                    actionButtonContainer.appendChild(suspendButtonContainer);

                    // Add activate button


                    const activateButtonContainer = document.createElement('div');
                    activateButtonContainer.setAttribute('class', 'go_to_location_button');
                    const activate_link = document.createElement('a');

                    activate_link.href = "/pages/subscribe.html?activate=" + row.distributionlistid;
                    activate_link.target = "_blank";
                    activate_link.name = "activate_distributionlistid";

                    const activateButton = document.createElement('img');
                    activateButton.src = "../icons/unpause.40.png";
                    activateButton.alt = 'go there';
                    activateButton.setAttribute('class', 'activate_button');
                    //goThereButton.onclick = function () {
                    //    goThere(row);
                    //};
                    activate_link.appendChild(activateButton);
                    activateButtonContainer.appendChild(activate_link);
                    actionButtonContainer.appendChild(activateButtonContainer);

                    // add enable/disable this subscription button (if user is a subscriber)
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

                });
                resolve('Data saved OK');
            });
        });
    } catch (error) {
        console.error(error);
    }
}

async function fetchCreatorInfo(creatorid) {
    console.debug("fetchNote");

    var ynInstallationUniqueId = "";
    var xYellownotesSession = "";

    let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
    let session = await chrome.storage.local.get([plugin_session_header_name]);

    ynInstallationUniqueId = plugin_uuid[plugin_uuid_header_name];
    xYellownotesSession = session[plugin_session_header_name];

    const msg = {
        creatorid: creatorid
    };
    const response = await fetch(server_url + "/api/v1.0/get_creator_profile", {
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
    console.debug(data);
    /* Parse JSON data
// search through the DOM tree for all elements with the attribute "yn_dbfield"
// It contains two words, separated by a comma. 
The first is the name of the field in the JSON data, the second is the name of the attribute in the found DOM node where the data should be placed.  

*/
const att_yn_dbfield = document.querySelectorAll('[yn_dbfield]');
    console.debug(att_yn_dbfield);
    att_yn_dbfield.forEach(element => {
        const field = element.getAttribute('yn_dbfield');
        const json_field_name = field.split(',')[0];
        const attribute_name = field.split(',')[1];
        element.setAttribute(attribute_name, data[json_field_name]);
    });
    /* Parse JSON data
// search through the DOM tree for all elements with the attribute "yn_dbfield"
// It contains two words, separated by a comma. 
The first is the name of the field in the JSON data,
-- consider adding options for cerating complete DOM elements here  

*/

    const elem_yn_dbfields = document.querySelectorAll('yn_dbfield');
    console.debug(elem_yn_dbfields);
    elem_yn_dbfields.forEach(element => {
        const field = element.getAttribute('yn_dbfield');
        const json_field_name = field.split(',')[0];
        const elemement_name = field.split(',')[1];
        /// create a new element and replace the old one
        const new_element = document.createElement(elemement_name);
        //new_element.textContent(data[json_field_name]);
        //element.replaceWith(new_element);
        element.parentNode.replaceChildren(document.createTextNode(data[json_field_name]));
        //var insertedNode = element.parentNode.insertBefore(new_element, element);
//        element.textContent(data[json_field_name]);
    });



    

}
