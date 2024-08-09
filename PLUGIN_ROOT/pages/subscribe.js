

const browser_id = chrome.runtime.id;

console.debug("browser_id: ", browser_id);
//console.log(url.replace(/.*add_distributionlistid=/, ""));
// accept the submitted value for the distribution list id
// the API has security mechanism in place the screen the value for undesirable content
try {
    if (getQueryStringParameter("add_distributionlistid")) {
        console.debug("add_distributionlistid parameter found ");

        addSubscriptionByUUIDinBackground(getQueryStringParameter("add_distributionlistid")).then(function (data) {

            // it a post action URL has been prescribed using the quertstring parameter "redirecturi", then redirect to that URL now
            uri = getQueryStringParameter("redirecturi");
            console.debug("redirect to ", uri);
            if (uri) {
                // Redirect to a new URL - do not present a page
                window.location.href = uri;
            } else {
                // no redirect URL has been prescribed, so redirecto to my_subscriptions page
                window.location.href = "/pages/my_subscriptions.html";
                
            }
        }).catch(function (error) {
            console.error(error);
        }
        );
    }else{
        uri = getQueryStringParameter("redirecturi");
        console.debug("redirect to ", uri);
        if (uri) {
            // Redirect to a new URL - do not present a page
            window.location.href = uri;
        } else {
            // no redirect URL has been prescribed, so just proceed with presenting the page
            //render_page();
        }
    }
} catch (e) {
    console.error(e);
}



// Function to use "fetch" to delete a data row
function addSubscriptionByUUIDinBackground(distributionlistid) {
    return new Promise(async(resolve, reject) => {
        console.log("addSubscriptionByUUIDinBackground (" + distributionlistid + ")");
        try {
            console.log("addSubscriptionByUUIDinBackground");
            //let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
            let plugin_uuid = await new Promise(resolve => {
                    chrome.storage.local.get([plugin_uuid_header_name], result => {
                        resolve(result[plugin_uuid_header_name] || null);
                    });
                });
            console.log("plugin_uuid: ", plugin_uuid);
            var session = "null";
            try {
                session = await new Promise(resolve => {
                        chrome.storage.local.get([plugin_session_header_name], result => {
                            resolve(result[plugin_session_header_name] || null);
                        });
                    });
            } catch (e) {
                console.error(e);
            }
            console.log("session: ", session);

            const userid = "";
            const message_body = JSON.stringify({
                    distributionlistid: distributionlistid,
                });
            console.log(message_body);
            fetch(server_url + URI_plugin_user_add_subscription_v10, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    [plugin_uuid_header_name]: plugin_uuid,
                    [plugin_session_header_name]: session,
                },
                body: message_body, // example IDs, replace as necessary
            })
            .then(response => {
                // Check for errors
               // if (!response.ok) {
               //     throw new Error(`HTTP error! status: ${response.status}`);
               // }
                // Parse JSON data
                return response.json();
            })
            .then(data => {
                // Handle parsed JSON data
                console.log("completed with: " + JSON.stringify(data));
                resolve(data);
            })
            .catch(error => {
                // Handle errors
                console.error(error);
            });

        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
}


// Function to use "fetch" to suspend a data agreement
async function addSubscriptionByUUID(distributionlistid, feed_data) {
    console.debug("addSubscriptionByUUID.start");
    console.debug(distributionlistid);
    console.debug(feed_data);
    try {
        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);
        const userid = "";
        const message_body = JSON.stringify({
                distributionlistid: distributionlistid
            });
        //console.log(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(
                server_url + URI_plugin_user_add_subscription_v10, {
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
        // update the row in the table of current subscriptions
        // Parse JSON data
        const data = await response.json();
        console.log(data);
        // Get table body element
        const tableBody = document
            .getElementById("dataTable")
            .getElementsByTagName("tbody")[0];

        console.log(tableBody);
        // add new row to table in the GUI to make the update appear immediate to the user
        // Create new row
        console.log("addSubscriptionTableRow");
        console.log(tableBody);
        console.log(feed_data);
        console.log(data);
        // copy a value that generated at the server and returned in the response to the API call that create the subscription
        feed_data.subscriptionid = data.subscriptionid;
        feed_data.subscribedate = data.subscribedate;

        addSubscriptionTableRow(tableBody, feed_data)

        // Start process to update all open tabs with new subscription
        //
        try {
            var message = {
                action: "activeateSubscriptionOnAllTabs",
                subscription_details: feed_data,
            };

            console.debug(message);
            // send save request back to background
            chrome.runtime.sendMessage(message, function (response) {
                console.debug(
                    "message sent to backgroup.js with response: " +
                    JSON.stringify(response));
                // finally, call "close" on the note
            });
        } catch (e) {
            console.error(e);
        }

    } catch (error) {
        console.error(error);
    }
}


