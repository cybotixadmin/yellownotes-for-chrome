


// check if the user is authenticated
checkSessionJWTValidity()
.then(isValid => {
    console.debug('JWT is valid:', isValid);
    if (isValid) {
        console.debug("JWT is valid - show menu accordingly");
        fetchAndDisplayStaticContent("../fragments/en_US/my_account_page_header_authenticated.html", "my_account_page_main_text").then(() => {});
        fetchAndDisplayStaticContent("../fragments/en_US/sidebar_fragment_authenticated.html", "sidebar").then(() => {
            //page_display_login_status();
            // login_logout_action();


            downloadButton = document.getElementById('downloadAllButton');
            downloadButton.onclick = function () {
                // call to API to download from data base
                downloadAllData();
            };

            deleteAllButton = document.getElementById('deleteAllButton');
            deleteAllButton.onclick = function () {
                // call to API to delete from data base
                deleteAllData();
                logout();

            };

        });

        page_display_login_status();

    } else {
        console.debug("JWT is not valid - show menu accordingly");
        fetchAndDisplayStaticContent("../fragments/en_US/my_account_page_header_unauthenticated.html", "my_account_page_main_text").then(() => {});
        fetchAndDisplayStaticContent("../fragments/en_US/sidebar_fragment_unauthenticated.html", "sidebar").then(() => {
            //page_display_login_status();
            //login_logout_action();


            downloadButton = document.getElementById('downloadAllButton');
            downloadButton.onclick = function () {
                // call to API to download from data base
                downloadAllData();
            };

            deleteAllButton = document.getElementById('deleteAllButton');
            deleteAllButton.onclick = function () {
                // call to API to delete from data base
                deleteAllData();
                logout();

            };

        });

        page_display_login_status();
    }

})
.catch(error => {
    console.error('Error:', error.message);
});

// determine if the user is authneticted or not


async function downloadAllData() {

    try {

        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);

        fetch(server_url + URI_plugin_user_download_data, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
                [plugin_session_header_name]: session[plugin_session_header_name],
            },
        })
        .then(response => response.blob()) // Convert the response to a blob
        .then(blob => {
            // Create a new link element
            let link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'filename.json'; // Set the file name for download

            // Append to the page and click it to trigger the download
            document.body.appendChild(link);
            link.click();

            // Clean up and remove the link
            document.body.removeChild(link);
            window.URL.revokeObjectURL(link.href);
        });

    } catch (error) {
        console.error('Error:', error);
    }

}

async function deleteAllData() {

    try {

        let plugin_uuid = await chrome.storage.local.get([plugin_uuid_header_name]);
        let session = await chrome.storage.local.get([plugin_session_header_name]);

        fetch(server_url + URI_plugin_user_delete_all_data, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                [plugin_uuid_header_name]: plugin_uuid[plugin_uuid_header_name],
                [plugin_session_header_name]: session[plugin_session_header_name],
            },
        })
        .then(response => response.blob()) // Convert the response to a blob
        .then(blob => {
            // Create a new link element
            let link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'filename.json'; // Set the file name for download

            // Append to the page and click it to trigger the download
            document.body.appendChild(link);
            link.click();

            // Clean up and remove the link
            document.body.removeChild(link);
            window.URL.revokeObjectURL(link.href);
        });

    } catch (error) {
        console.error('Error:', error);
    }

}
