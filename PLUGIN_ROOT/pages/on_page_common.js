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


