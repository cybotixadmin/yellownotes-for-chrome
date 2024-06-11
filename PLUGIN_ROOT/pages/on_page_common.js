const server_url = "https://api.yellownotes.cloud";

const plugin_uuid_header_name = "ynInstallationUniqueId";
// name of header containing session token
const plugin_session_header_name = "xyellownotessessionjwt";

const plugin_remove_banner_uri = "/api/v1.0/delete_note_banner";

const silent_logout_url = "https://www.yellownotes.cloud/logout_silent";


const URI_plugin_user_get_own_distributionlists = '/api/v1.0/plugin_user_get_my_distribution_lists';

const URI_plugin_user_setdistributionlist_yellownote = '/api/v1.0/plugin_user_setdistributionlist_yellownote';

const URI_plugin_user_savechanges_yellownote = '/api/v1.0/plugin_user_savechanges_yellownote';

const URI_plugin_user_delete_subscription = "/api/v1.0/plugin_user_delete_subscription";

const URI_plugin_user_set_subscription_active_status = "/api/v1.0/plugin_user_set_subscription_active_status";

const URI_plugin_user_delete_distribution_list = "/api/v1.0/plugin_user_delete_distribution_list";
const URI_plugin_user_get_distribution_list = "/api/v1.0/plugin_user_get_distribution_list";

const URI_plugin_user_update_own_distributionlist = "/api/v1.0/plugin_user_update_own_distribution_list";
const URI_plugin_user_get_all_agreements = "/api/plugin_user_get_all_data_agreements";
const URI_plugin_user_delete_data_agreement = "/api/plugin_user_delete_distribution_list";
const URI_plugin_user_add_subscription_v10 = "/api/v1.0/plugin_user_add_subscription";
const URI_plugin_user_set_agreement_active_status = "/api/v1.0/plugin_user_set_subscription_active_status";

const URI_plugin_user_set_all_subscriptions_active_status = "/api/v1.0/plugin_user_set_all_subscriptions_active_status";

const URI_plugin_user_get_my_subscriptions = "/api/v1.0/plugin_user_get_my_subscriptions";


const URI_plugin_user_set_distributionlist_active_status = "/api/plugin_user_set_distributionlist_active_status";
const URI_plugin_user_deactivate_agreements = "/api/plugin_user_deactivate_distribution_list";
const URI_plugin_user_activate_agreements = "/api/plugin_user_activate_distribution_list";
const URI_plugin_user_get_my_distribution_lists = "/api/v1.0/plugin_user_get_my_distribution_lists";

const URI_plugin_user_download_data = "/api/v1.0/plugin_user_retrieve_all_data";

const URI_plugin_user_delete_all_data = "/api/v1.0/plugin_user_delete_all_data";
const URI_plugin_user_update_yellownote_attributes = "/api/v1.0/update_note_properties";

const URI_plugin_user_get_all_yellownotes = "/api/plugin_user_get_all_yellownotes";


const URI_plugin_user_get_all_subscribed_notes =  "/api/v1.0/plugin_user_get_all_subscribed_notes";



const URI_plugin_user_get_own_yellownotes = "/api/v1.0/plugin_user_get_own_yellownotes";
const URI_plugin_user_delete_yellownote = "/api/v1.0/plugin_user_delete_yellownote";
const URI_plugin_user_set_note_active_status = "/api/v1.0/plugin_user_setstatus_yellownote";

const URI_plugin_user_get_active_feed_notes = "/api/v1.0/plugin_user_get_active_feed_notes";

const URI_plugin_user_get_abstracts_of_all_yellownotes = "/api/plugin_user_get_abstracts_of_all_yellownotes";





async function page_display_login_status() {
    console.log("display_login_status()");
    //con
    try{
    let session = await chrome.storage.local.get([plugin_session_header_name]);
    console.debug(session);
    console.debug(session[plugin_session_header_name]);
    var userid = null;

   
        userid = await get_username_from_sessiontoken(session[plugin_session_header_name]);
    } catch (e) {
        console.error(e);
    }
    
    console.debug("userid: " + userid);
    try{
    if (userid == null) {
        console.log("Not logged in");
        console.log(document.getElementById("login_status"));
        document.querySelectorAll('[name="login_status"]').forEach(element => {
          element.innerHTML = "Not logged in";
        });
        
    } else {
      document.querySelectorAll('[name="login_status"]').forEach(element => {
        element.innerHTML = "Logged in as " + userid;
      });
      
    }
} catch (e) {
    console.error(e);
}
}

async function is_authenticated() {
    console.log("is_authenticated()");
    //con

    let session = await chrome.storage.local.get([plugin_session_header_name]);
    console.debug(session);
    console.debug(session[plugin_session_header_name]);
    var userid = null;
    try{
    userid = get_username_from_sessiontoken(session[plugin_session_header_name]);
    } catch (e) {
        console.error(e);
    }
    console.debug("userid: " + userid);
    if (userid == null) {
        return false;
    } else {
        return true;
    }
}


function escapeRegex(text) {
  // Escapes the regular expression special characters in text except for '*' and '?'
  // '*' is converted to '.*' and '?' to '.'
  return text.replace(/[-[\]{}()+.,\\^$|#\s]/g, "\\$&")
  .replace(/\*/g, '.*')
  .replace(/\?/g, '.');
}

// Function to extract claim from JWT
function extractClaimFromJWT(jwt, claimName) {
  // JWT consists of three parts separated by '.'
  const parts = jwt.split('.');
  if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
  }
  // Decode the payload (second part)
  const payload = JSON.parse(atob(parts[1]));
  console.debug("payload");
  console.debug(payload);
  return payload[claimName];
}

// Procedure to check if JWT contains a claim "displayname" with valid length
function checkSessionJWTValidity() {
  return new Promise((resolve, reject) => {
    console.log("checkSessionJWTValidity()", plugin_session_header_name);
      chrome.storage.local.get(plugin_session_header_name, (result) => {
        console.log(result);
          const jwt = result[plugin_session_header_name];
console.debug(jwt);
if (jwt == "DELETED") {
  console.log("No JWT found");
  resolve(false); // No JWT found

}else if (!jwt) {
            console.log("No JWT found");
              resolve(false); // No JWT found
          } else {
              try {
                  const displayName = extractClaimFromJWT(jwt, 'displayname');
                  console.debug("displayname: " + displayName);
                  if (typeof displayName === 'string' && displayName.length > 4 && displayName.length < 100) {
                      resolve(true); // Valid display name found
                  } else {
                      resolve(false); // Invalid display name
                  }
              } catch (error) {
                console.error(error);
                resolve(false); // Error while extracting claim
              }
          }
      });
  });
}




async function logout() {
   
    // wipe the locate storage where the session token is stored
}



async function get_displayname_from_sessiontoken(token) {


  console.log(token);

  try{
  
  // Example usage
  //const token = 'your_jwt_token'; // Replace with your JWT token
  const claimNames = ['displayname']; // Replace with the claims you want to extract
  const claims = getClaimsFromJwt(token, claimNames);
  
  console.log(claims);
    return (claims.displayname);   
    }
    catch (e) {
        console.error(e);
        return null;
    }
  }


// call for a html faile and inserts the content of this html fil into the DOM at the location of the element with the id dom_id

function fetchAndDisplayStaticContent(url, dom_id) {
    return new Promise((resolve, reject) => {
      console.log("fetchAndDisplayStaticContent()");
      console.log(url);
      console.log(dom_id);
  
      try{
      // Security measure 1
      // only accept URLs matching a specific pattern - URLs pointing to a subset of local files
      const notespage = new RegExp(/^\.\.\/fragments\//);
      console.debug(notespage.test(url));
      if (notespage.test(url)) {
        fetch(url)
          .then(response => response.text())
          .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
  
            console.log(doc.body);
  
            // Security measure 2
            // Remove script tags
            const scripts = doc.querySelectorAll('script');
            scripts.forEach(script => script.remove());
  
            console.debug(doc.body.querySelector('div'));
            // Append the content to the DOM node with ID 'form'
            const formElement = document.getElementById(dom_id);
            if (formElement) {
              formElement.appendChild(doc.body.querySelector('div'));
              resolve(); // Resolve the promise here
            } else {
              console.error('Element with ID "form" not found.');
              reject('Element with ID "form" not found.'); // Reject the promise here
            }
          })
          .catch(error => {
            console.error('Error fetching and parsing content:', error);
            reject(error); // Reject the promise on fetch error
          });
      } else {
        reject('Invalid URL'); // Reject the promise if URL does not match
      }
    } catch (e) {
      console.error(e);
      reject(e);
    }

    });
  }



  async function login_logout_action() {
    console.log("login_logout_action()");
    //con

    let session = await chrome.storage.local.get([plugin_session_header_name]);
    var userid = null;
console.debug(session);
try{
 userid = await get_username_from_sessiontoken(session[plugin_session_header_name]);
} catch (e) {
    console.error(e);
    userid = null;
}

    console.debug("userid: " + userid);
    if (userid == null) {
      document.querySelectorAll('[name="login_status"]').forEach(element => {
        element.textContent = "Not logged in";
      });
        document.getElementById("loginlogout").innerHTML =  '<a href="https://www.yellownotes.cloud/loginpage">login</a>' ;
    } else if (userid == "DELETED") {
      document.querySelectorAll('[name="login_status"]').forEach(element => {
        element.textContent = "Not logged in";
      });
        document.getElementById("loginlogout").innerHTML =  '<a href="https://www.yellownotes.cloud/loginpage">login</a>' ;
    } else {
//        document.getElementById("login_status").innerHtml = 'Logged in as: <br\><div style="font-size: 0.5em">' + userid + "</div>";

document.querySelectorAll('[name="login_status"]').forEach(element => {
  element.textContent = userid;
  element.style["font-size"] = "1.0em";

});
        document.getElementById("loginlogout").innerHTML =  '<a href="https://www.yellownotes.cloud/logout_silent">logout</a>' ;
    }
}




function getElementPosition(element) {
  if (!element || !element.parentNode) {
      throw new Error("Invalid element or element has no parent");
  }

  let position = 0;
  let currentElement = element;

  while (currentElement.previousElementSibling) {
      position++;
      currentElement = currentElement.previousElementSibling;
  }

  return position;
}


function timestampstring2timestamp(str) {
  console.log("timestampstring2timestamp: " + str);
  try {
      const year = str.substring(0, 4);
      const month = str.substring(5, 7);
      const day = str.substring(8, 10);
      const hour = str.substring(11, 13);
      const minute = str.substring(14, 16);
      const second = str.substring(17, 19);
      //    var timestamp = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second + "";
      var timestamp = year + "-" + month + "-" + day + " " + hour + ":" + minute;
      console.log("timestamp: " + timestamp);

      return timestamp;
  } catch (e) {
      console.log(e);
      return null;
  }
}

function integerstring2timestamp(int) {
  console.log("integerstring2timestamp: " + int);
  try {
      const year = int.substring(0, 4);
      const month = int.substring(5, 6);
      const day = int.substring(8, 9);
      const hour = int.substring(8, 9);
      const minute = int.substring(10, 11);
      const second = int.substring(12, 13);

      var timestamp = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
      console.log("timestamp: " + timestamp);

      return timestamp;
  } catch (e) {
      console.log(e);
      return null;
  }
}


function sortTa(event) {
  console.log("sortTa()");
  console.log(event);
  console.log(event.target);
  console.log(event.target.parentNode);
  console.log( getElementPosition(event.target.parentNode));
  sortTable("dataTable", getElementPosition(event.target.parentNode));
}



// Function to sort the table
function sortTable(table_id, columnIndex) {
  console.log("sortTable.start");
  console.log("columnIndex: " + columnIndex)
  console.log("sortTabl: " + table_id)
  const table = document.querySelector('[id="' + table_id + '"]');
  console.log(table);
  let rows = Array.from(table.rows).slice(2); // Ignore the header rows
  let sortedRows;
  const row_count = table.rows.length - 2;
  console.log("row count: " + row_count);

  // Toggle sort state for the column (asceding or decending sort)
  try{
      console.log(table.rows[0].cells[columnIndex]);
      console.log(table.rows[0].cells[columnIndex].querySelector("span").textContent);
console.log(table.rows[1].cells[columnIndex]);
  }catch(e){
      console.log(e);
  }
  if (sortStates[columnIndex] === 'none' || sortStates[columnIndex] === 'desc') {
      sortStates[columnIndex] = 'asc';
      table.rows[0].cells[columnIndex].querySelector("span").textContent = "▲";
  } else {
      sortStates[columnIndex] = 'desc';
      table.rows[0].cells[columnIndex].querySelector("span").textContent = "▼";
  }
  var sortOrder = sortStates[columnIndex];
  console.log("sortOrder: " + sortOrder);

  // type of sort - default is case-sensitive alphabetical
var sort_type="stringCaseExact";
try{
if (table.rows[0].cells[columnIndex].hasAttribute("sort_type")) {
  sort_type = table.rows[0].cells[columnIndex].getAttribute("sort_type");
}
}catch(e){
  console.log(e);
}
  // Sort based on the selected column and sort state
  // Consider options for different types of sorting here.

if (sort_type == "stringCaseExact") {

      sortedRows = rows.sort((a, b) => a.cells[columnIndex].innerText.localeCompare(b.cells[columnIndex].innerText));
} else if (sort_type == "stringCaseIgnore") {

      sortedRows = rows.sort((a, b) => a.cells[columnIndex].innerText.toLowerCase().localeCompare(b.cells[columnIndex].innerText.toLowerCase()));

} else if (sort_type == "selectCaseExact") {
 // console.log("selectCaseExact");
   

    sortedRows = rows.sort((rowA, rowB) => {
      const cellA = rowA.cells[columnIndex].querySelector('select').value;
      const cellB = rowB.cells[columnIndex].querySelector('select').value;

      return cellA.localeCompare(cellB);
  });


}else {
  console.log("default sort");
  sortedRows = rows.sort((a, b) => a.cells[columnIndex].innerText.localeCompare(b.cells[columnIndex].innerText));
}
  
  
  if (sortOrder === 'desc') {
      sortedRows.reverse();
  }

  // Remove existing rows (excluding the two header rows)
  while (table.rows.length > 3) {
      table.deleteRow(3);
  }

  // Append sorted rows
  const tbody = table.getElementsByTagName('tbody')[0];
  sortedRows.forEach(row => tbody.appendChild(row));
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

  //console.debug(filtersCols);

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
          //console.log(filtersCols[j].value);
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
              //console.log(cell);
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
          } else if (filtersCols[j].value && filtersCols[j].getAttribute("filtertype") == "selectmatch") {
              console.log("selectmatch");
              // filter on whether or not a checkbox has been checked
              var comparingCol = filtersCols[j].parentNode.getAttribute("colindex");
              console.log("filter on col: " + comparingCol)
              var cell = rows[i].getElementsByTagName("td")[comparingCol];
              console.log(cell);
              if (cell) {
                  console.log(cell.getElementsByTagName("select"));

                  var selectElement = cell.getElementsByTagName("select")[0];
                  var selectedText = selectElement.options[selectElement.selectedIndex].text;

                  // Log the selected text to the console or return it from the function
                  console.log('Currently selected text:', selectedText);

                  console.log(cell.getElementsByTagName("select")[0].value);
                  //var isChecked = cell.querySelector('input[type="checkbox"]').checked;
                  //console.log("isChecked: " + isChecked);
                  var filterValue = filtersCols[j].value;
                  console.log("filterValue: " + filterValue + " selectedText: " + selectedText);

                  var regex = new RegExp(escapeRegex(filterValue), "i");
                  //console.log("is cell content " + cell.textContent.trim() + ' matching regex: ' + regex);
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
                      //console.log("filter on col: " + comparingCol)
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


// call to the API to determine authentication status
function getStatusValue(url, header1, value1, header2, value2) {
  return new Promise((resolve, reject) => {
      fetch(url, {
          method: 'GET',
          headers: {
              [header1]: value1,
              [header2]: value2
          }
      })
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .then(data => {
          if (data && data.status) {
              resolve(data.status);
          } else {
              reject(new Error('Status object not found in the response'));
          }
      })
      .catch(error => {
          reject(error);
      });
  });
}



// Example usage:
const url = 'https://example.com/api/data';
const header1 = 'Authorization';
const value1 = 'Bearer your_token';
const header2 = 'Content-Type';
const value2 = 'application/json';

//getStatusValue(url, header1, value1, header2, value2)
 // .then(status => {
 //     console.log('Status:', status);
 // })
 // .catch(error => {
 //     console.error('Error:', error.message);
 // });



// the session token is not completed as yet
function get_username_from_sessiontoken(token) {

  
console.log("get_username_from_sessiontoken()");
console.log(token);

if (token == null) {
    return null;
}else{
try{

// Example usage
//const token = 'your_jwt_token'; // Replace with your JWT token
const claimNames = ['userid', 'brand']; // Replace with the claims you want to extract
const claims = getClaimsFromJwt(token, claimNames);

console.log(claims);
  return (claims.userid);   
  }
  catch (e) {
      console.error(e);
      return null;
  }
}
}


function safeParseInnerHTML(rawHTML, targetElementName) {

  // list of acceptable html tags


  // list of unacceptable html tags
  const unaccep = ["script"];

  unaccep.forEach(function (item, index) {
      console.log(item);
  });

  const container = document.createElement(targetElementName);
  // Populate it with the raw HTML content
  container.innerHTML = rawHTML;

  return container;
}

function utf8_to_b64(str) {
  console.debug("utf8_to_b64("+str+")");
  try {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
      return String.fromCharCode('0x' + p1);
  }));
  } catch (e) {
    console.error(e);
    return null;
  }
}

function b64_to_utf8(str) {
  console.debug("b64_to_utf8("+str+")");
  try{
  return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}catch(e){
  console.error(e);
  return null;
}
}


 // Function to get the value of the 'dist' query string parameter
 function getQueryStringParameter(param) {
  var queryString = window.location.search.substring(1);
  var queryParams = queryString.split('&');

  for (var i = 0; i < queryParams.length; i++) {
      var pair = queryParams[i].split('=');
      if (pair[0] == param) {
          return decodeURIComponent(pair[1]);
      }
  }
  return null;
}

function parseJwt(token) {
  console.log("parseJwt("+token+") ");

  try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
  } catch (e) {
      console.error('Invalid token:', e);
      return null;
  }
}


/*

// Example usage
const token = 'your_jwt_token'; // Replace with your JWT token
const claimNames = ['sub', 'email']; // Replace with the claims you want to extract
const claims = getClaimsFromJwt(token, claimNames);

console.log(claims);

*/
function getClaimsFromJwt(token, claimNames) {
  const decodedToken = parseJwt(token);
  if (!decodedToken) return null;

  let claims = {};
  claimNames.forEach(claimName => {
      if (decodedToken.hasOwnProperty(claimName)) {
          claims[claimName] = decodedToken[claimName];
      }
  });
  return claims;
}


