

// check if the user is authenticated
checkSessionJWTValidity()
.then(isValid => {
    console.debug('JWT is valid:', isValid);
    if (isValid) {
        console.debug("JWT is valid - show menu accordingly");
        fetchAndDisplayStaticContent("../fragments/en_US/publicprofile_main_text.html", "publicprofile_main_text").then(() => {});
        const uuid = localStorage.getItem("creatorid");
        const replacements = {
            creatorid: uuid
        };
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

const table_columns_to_not_display_keyname = table_name + "_hide_columns";

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
            var current_subscriptions;
            var data;
            //const installationUniqueId = (await chrome.storage.local.get([plugin_uuid_header_name]))[plugin_uuid_header_name];


            chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]).then(function (result) {
                console.debug(result);
                console.debug(ynInstallationUniqueId);
                ynInstallationUniqueId = result[plugin_uuid_header_name];
                xYellownotesSession = result[plugin_session_header_name];
                console.debug(ynInstallationUniqueId);
                console.debug(xYellownotesSession);
                // get distribution lists made by the profile
                return fetch(server_url + URI_plugin_user_get_distributionlists_by_creatorid, {
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

                // get subscriptions by current user
                return fetch(server_url + URI_plugin_user_get_my_subscriptions, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        [plugin_uuid_header_name]: ynInstallationUniqueId,
                        [plugin_session_header_name]: xYellownotesSession,
                    },
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
                current_subscriptions = resp;
                console.debug(current_subscriptions);

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
                    const cell_postcount = newRow.insertCell(2);
                    const cell_subscriberscount = newRow.insertCell(3);
                    const cell_createdtime = newRow.insertCell(4);
                    const cell_anonymous_allowed = newRow.insertCell(5);
                    const cell_actions = newRow.insertCell(6);

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

                    try {
                        cell_postcount.textContent = row.postcount;
                        cell_postcount.setAttribute('data-label', 'postcount');
                        cell_postcount.setAttribute('name', 'postcount');
                        cell_postcount.setAttribute('class', 'url');
                    } catch (e) {
                        console.debug(e);
                    }
                    try {
                        cell_subscriberscount.textContent = row.subscriberscount;
                        cell_subscriberscount.setAttribute('data-label', 'subscriberscount');
                        cell_subscriberscount.setAttribute('name', 'subscriberscount');
                        cell_subscriberscount.setAttribute('class', 'url');
                    } catch (e) {
                        console.debug(e);
                    }

                    // allow anonymous subscribers

                    try {
                        if (row.anonymous_allowed == "1" || row.anonymous_allowed == 1) {
                            cell_anonymous_allowed.textContent = "yes";
                        } else {
                            cell_anonymous_allowed.textContent = "no";
                        }

                        cell_anonymous_allowed.setAttribute('data-label', 'anonymous_allowed');
                        cell_anonymous_allowed.setAttribute('name', 'anonymous_allowed');
                        cell_anonymous_allowed.setAttribute('class', 'url');
                    } catch (e) {
                        console.debug(e);
                    }

                    // time the feed was created

                    try {
                        cell_createdtime.textContent = row.createdtime;
                        cell_createdtime.setAttribute('data-label', 'createdtime');
                        cell_createdtime.setAttribute('name', 'createdtime');
                        cell_createdtime.setAttribute('class', 'timestamp');
                    } catch (e) {
                        console.debug(e);
                    }

                    // create small table to contain the action buttons
// create buttons for all possible action, and then select which ones are to be made visible depending on circumstances



                    // Add button container
                    const actionButtonContainer = document.createElement('div');
                    actionButtonContainer.setAttribute('class', 'button-container');

                    // add all buttons
                    // Add subscribe button
                    console.debug("Add subscribe button");

                    const subscribeButtonContainer = document.createElement('div');
                    subscribeButtonContainer.setAttribute('class', 'go_to_location_button');
                    subscribeButtonContainer.setAttribute('name', 'subscribe');
                    // button
                    const subscribeButton = document.createElement('img');
                    subscribeButton.src = "../icons/unpause.40.png";
                    subscribeButton.alt = 'subscribe';
                    subscribeButton.setAttribute('class', 'activate_button');
                    subscribeButton.onclick = function () {
                        addSubscription(row.distributionlistid);
                    };
                    subscribeButtonContainer.appendChild(subscribeButton);

                    // text
                    // create text node an append it to the button
                    const subscribeButtonText = document.createTextNode("subscribe");
                    subscribeButtonText.onclick = function () {
                        addSubscription(row.distributionlistid);
                    };
                    subscribeButtonContainer.appendChild(subscribeButtonText);

                    actionButtonContainer.appendChild(subscribeButtonContainer);
                    // activate
                    console.debug("Add activate button");
                    const activateButtonContainer = document.createElement('div');
                    activateButtonContainer.setAttribute('class', 'go_to_location_button');
                    activateButtonContainer.setAttribute('name', 'resume');
                    // button
                    const activateButton = document.createElement('img');
                    activateButton.src = "../icons/unpause.40.png";
                    activateButton.alt = 'resume';
                    activateButton.setAttribute('class', 'activate_button');
                    activateButton.onclick = function () {
                        activateSubscription(subscription_status_for_this_distributionlist.subscriptionid, row.distributionlistid );
                    };
                    activateButtonContainer.appendChild(activateButton);

                    // text
                    // create text node an append it to the button
                    const activateButtonText = document.createTextNode("resume");
                    activateButtonText.onclick = function () {
                        console.debug("activateSubscription: " + subscription_status_for_this_distributionlist.subscriptionid);
                        activateSubscription(subscription_status_for_this_distributionlist.subscriptionid,row.distributionlistid );
                    };
                    activateButtonContainer.appendChild(activateButtonText);

                    actionButtonContainer.appendChild(activateButtonContainer);

                    // Add unsubscribe button
                    console.debug("Add unsubscribe button");

                    const unsubscribeButtonContainer = document.createElement('div');
                    unsubscribeButtonContainer.setAttribute('class', 'go_to_location_button');
                    unsubscribeButtonContainer.setAttribute('name', 'unsubscribe');

                    // unsubscribe button
                    const unsubscribeButton = document.createElement('img');
                    unsubscribeButton.src = "../icons/stop.40.png";
                    unsubscribeButton.alt = 'unsubscribe';
                    unsubscribeButton.setAttribute('class', 'activate_button');
                    unsubscribeButton.onclick = function () {
                        deleteSubscription(subscription_status_for_this_distributionlist.subscriptionid, row.distributionlistid);
                    };
                    unsubscribeButtonContainer.appendChild(unsubscribeButton);
                    // text
                    // create text node an append it to the button
                    const unsubscribeButtonText = document.createTextNode("Unsubscribe");
                    unsubscribeButtonText.onclick = function () {
                        deleteSubscription(subscription_status_for_this_distributionlist.subscriptionid, row.distributionlistid);
                    };
                    unsubscribeButtonContainer.appendChild(unsubscribeButtonText);

                    actionButtonContainer.appendChild(unsubscribeButtonContainer);


                        // Add deactivate button
                        console.debug("Add deactivate button");
                        const deactivateButtonContainer = document.createElement('div');
                        deactivateButtonContainer.setAttribute('class', 'go_to_location_button');
                        deactivateButtonContainer.setAttribute('name', 'suspend');
                        // button
                        const deactivateButton = document.createElement('img');
                        deactivateButton.src = "../icons/pause.40.png";
                        deactivateButton.alt = 'suspend';
                        deactivateButton.setAttribute('class', 'activate_button');
                        deactivateButton.onclick = function () {
                            deactivateSubscription(subscription_status_for_this_distributionlist.subscriptionid,row.distributionlistid );
                        };
                        deactivateButtonContainer.appendChild(deactivateButton);
                        // text
                        // create text node an append it to the button
                        const deactivateButtonText = document.createTextNode("suspend");
                        deactivateButtonText.onclick = function () {
                            deactivateSubscription(subscription_status_for_this_distributionlist.subscriptionid,row.distributionlistid );
                        };
                        deactivateButtonContainer.appendChild(deactivateButtonText);

                        actionButtonContainer.appendChild(deactivateButtonContainer);


                    // check if user is a subscriber to this distribution list
                    //if not, add subscribe button
                    function findActiveByDistributionListId(subscriptions, distributionListId) {
                        console.debug("findActiveByDistributionListId, find " + distributionListId);
                        for (const subscription of subscriptions) {
                            if (subscription.distributionlistid === distributionListId) {
                                return {
                                    active: subscription.active,
                                    subscriptionid: subscription.subscriptionid
                                };
                            }
                        }
                        return null;
                    }
                    const subscription_status_for_this_distributionlist = findActiveByDistributionListId(current_subscriptions, row.distributionlistid);
                    console.debug("subscription_status_for_this_distributionlist: " + subscription_status_for_this_distributionlist);
                    console.debug("subscription_status_for_this_distributionlist: " + JSON.stringify(subscription_status_for_this_distributionlist));

                    cell_actions.appendChild(actionButtonContainer);
                    cell_actions.setAttribute('name', 'action');
                    cell_actions.setAttribute('class', 'action-5');
                    cell_actions.setAttribute('data-label', 'text');

                    if (subscription_status_for_this_distributionlist == null) {
                        // The user has no subscription for this distribution list
                        // make "subscribe" button visible
                        console.debug("3.3.4");
                        console.debug(actionButtonContainer.querySelector('[name="subscribe"]'));
                        console.debug(actionButtonContainer.querySelector('[name="subscribe"]').style);
                        actionButtonContainer.querySelector('[name="subscribe"]').style.display = 'block';
                        actionButtonContainer.querySelector('[name="unsubscribe"]').style.display = 'none';
                        actionButtonContainer.querySelector('[name="suspend"]').style.display = 'none';
                        actionButtonContainer.querySelector('[name="resume"]').style.display = 'none';

                       
                    } else if (subscription_status_for_this_distributionlist.active == 0 || subscription_status_for_this_distributionlist.active == "0") {
                        // The user has a subscription for this distribution list, but it is suspended
                        console.debug("3.3.5");
                        
                        // record the subscriptionid in the row 
                        newRow.setAttribute('subscriptionid', subscription_status_for_this_distributionlist.subscriptionid);

                        // Add unsubscribe button
                        console.debug("Add unsubscribe button");

                        // Add activate button
                        actionButtonContainer.querySelector('[name="subscribe"]').style.display = 'none';
                        actionButtonContainer.querySelector('[name="unsubscribe"]').style.display = 'block';
                        actionButtonContainer.querySelector('[name="suspend"]').style.display = 'none';
                        actionButtonContainer.querySelector('[name="resume"]').style.display = 'block';
                       

                    } else {
                        // The user has a subscription for this distribution list, and it is active
                        console.debug("3.3.46");
                       // record the subscriptionid in the row 
                       newRow.setAttribute('subscriptionid', subscription_status_for_this_distributionlist.subscriptionid);

                        // Add unsubscribe button
                        actionButtonContainer.querySelector('[name="subscribe"]').style.display = 'none';
                        actionButtonContainer.querySelector('[name="unsubscribe"]').style.display = 'block';
                        actionButtonContainer.querySelector('[name="suspend"]').style.display = 'block';
                        actionButtonContainer.querySelector('[name="resume"]').style.display = 'none';
                

                    }

                   

                });
                resolve('Data saved OK');
            });
        });
    } catch (error) {
        console.error(error);
    }
}

// Function to use "fetch" to delete a data row
async function deactivateSubscription(subscriptionid, distributionlistid) {
    try {

        const userid = "";
        console.debug("deactivateSubscription: " + subscriptionid);
        const message_body = '{ "subscriptionid":"' + subscriptionid + '", "activestatus": 0 }';
        //console.debug(message_body);
        const installationUniqueId = (await chrome.storage.local.get([plugin_uuid_header_name]))[plugin_uuid_header_name];

        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);

        console.debug(installationUniqueId);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(server_url + '/api/v1.0/plugin_user_set_subscription_active_status', {
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
        }else{

        }
        const row = document.querySelector('tr[distributionlistid="'+distributionlistid+'"]');

        row.querySelector('[name="subscribe"]').style.display = 'none';
        row.querySelector('[name="unsubscribe"]').style.display = 'block';
        row.querySelector('[name="suspend"]').style.display = 'none';
        row.querySelector('[name="resume"]').style.display = 'block';



        // Parse JSON data
        const data = await response.json();

    } catch (error) {
        console.error(error);
    }
}

// Function to use "fetch" to delete a data row
async function activateSubscription(subscriptionid, distributionlistid) {
    try {

        const userid = "";
        console.debug("activateSubscription: " + subscriptionid);
        const message_body = '{ "subscriptionid":"' + subscriptionid + '", "activestatus": 1 }';
        //console.debug(message_body);
        const installationUniqueId = (await chrome.storage.local.get([plugin_uuid_header_name]))[plugin_uuid_header_name];

        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);

        console.debug(installationUniqueId);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(server_url + '/api/v1.0/plugin_user_set_subscription_active_status', {
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
        }else{
            const row = document.querySelector('tr[distributionlistid="'+distributionlistid+'"]');
console.debug(row);
            row.querySelector('[name="subscribe"]').style.display = 'none';
            row.querySelector('[name="unsubscribe"]').style.display = 'block';
            row.querySelector('[name="suspend"]').style.display = 'block';
            row.querySelector('[name="resume"]').style.display = 'none';
    
        }

        // Parse JSON data
        const data = await response.json();

    } catch (error) {
        console.error(error);
    }
}

// Function to use "fetch" to delete a data row
async function deleteSubscription(subscriptionid, distributionlistid) {
    try {

        const userid = "";
        console.debug("deleteSubscription: " + subscriptionid);
        console.debug("distributionlistid: " + distributionlistid);
        const message_body = '{ "subscriptionid":"' + subscriptionid + '"}';
        //console.debug(message_body);
        const installationUniqueId = (await chrome.storage.local.get([plugin_uuid_header_name]))[plugin_uuid_header_name];

        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);

        console.debug(installationUniqueId);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(server_url + '/api/v1.0/plugin_user_delete_subscription', {
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
        }else{
            const row = document.querySelector('tr[distributionlistid="'+distributionlistid +'"]');
            console.debug(row);
            row.querySelector('[name="subscribe"]').style.display = 'block';
            row.querySelector('[name="unsubscribe"]').style.display = 'none';
            row.querySelector('[name="suspend"]').style.display = 'none';
            row.querySelector('[name="resume"]').style.display = 'none';
    
              // remove the subscriptionid from the row 
              row.removeAttribute('subscriptionid');


        }

        // Parse JSON data
        const data = await response.json();

    } catch (error) {
        console.error(error);
    }
}

// Function to use "fetch" to delete a data row
async function addSubscription(distributionlistid) {
    try {

        const userid = "";
        console.debug("addSubscription: " + distributionlistid);
        const message_body = '{ "distributionlistid":"' + distributionlistid + '"}';
        //console.debug(message_body);
        const installationUniqueId = (await chrome.storage.local.get([plugin_uuid_header_name]))[plugin_uuid_header_name];

        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);

        console.debug(installationUniqueId);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(server_url + '/api/v1.0/plugin_user_add_subscription', {
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
        }else{
            const row = document.querySelector('tr[distributionlistid="'+distributionlistid+'"]');
console.debug(row);
            row.querySelector('[name="subscribe"]').style.display = 'none';
            row.querySelector('[name="unsubscribe"]').style.display = 'block';
            row.querySelector('[name="suspend"]').style.display = 'block';
            row.querySelector('[name="resume"]').style.display = 'none';
    
        }

        // Parse JSON data
        const data = await response.json();

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
