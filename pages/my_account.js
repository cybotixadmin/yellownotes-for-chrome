
const URI_plugin_user_download_data = "/api/v1.0/plugin_user_retrieve_all_data";

const URI_plugin_user_delete_all_data = "/api/v1.0/plugin_user_delete_all_data";

// determine if the user is authneticted or not

chrome.storage.local.get([plugin_session_header_name ]).then( (session) => {  
  console.debug(session);

  console.debug(session[plugin_session_header_name]);


  const userid = get_username_from_sessiontoken(session[plugin_session_header_name]);
console.debug(userid  );
if (userid == null) {
    document.getElementById("login_status").textContent = "Not logged in";
    document.getElementById("loginlogout").innerHTML =  '<a href="https://www.yellownotes.cloud/loginpage">login</a>' ;
  // populate the fragment pertaining to Yellow Notes more generally

    fetchAndDisplayStaticContent( "/fragments/yellownotes_fragment.html", "front_page").then(() => {});

}else {
  // populate the fragment pertaining the users account
  fetchAndDisplayStaticContent( "/fragments/account_information.html", "account_information").then(() => {

    // Locate the element using querySelector
var element = document.querySelector('#username');

// Check if the element exists to avoid null reference errors
if (element) {
    // Insert text into the element
    element.textContent = userid;
    // Or use innerHTML if you need to insert HTML content
    // element.innerHTML = 'This is the <strong>new</strong> text!';
}

  });

}
}).catch( (error) => {} );
  

fetchAndDisplayStaticContent( "/fragments/sidebar_fragment.html", "sidebar").then(() => {   
    page_display_login_status();
    login_logout_action();
  
  });

  downloadButton = document.getElementById('downloadAllButton');
  downloadButton.onclick = function () {
    // call to API to download from data base
    downloadAllData();
};

deleteAllButton = document.getElementById('deleteAllButton');
deleteAllButton.onclick = function () {
  // call to API to delete from data base
  deleteAllData();
};


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

  }catch (error) {
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

  }catch (error) {
    console.error('Error:', error);
  } 

}
