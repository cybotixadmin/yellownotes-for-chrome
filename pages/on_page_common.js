

async function page_display_login_status() {
    console.log("display_login_status()");
    //con

    let session = await chrome.storage.local.get(["yellownotes_session"]);
    console.debug(session);
    var userid = null;

    try{
        userid = await get_username_from_sessiontoken(session.yellownotes_session);
    } catch (e) {
        console.error(e);
    }
    
    console.debug("userid: " + userid);
    try{
    if (userid == null) {
        console.log("Not logged in");
        console.log(document.getElementById("login_status"));
        document.getElementById("login_status").innerHTML = "Not logged in";
    } else {
        document.getElementById("login_status").innerHTML = "Logged in as " + userid;
    }
} catch (e) {
    console.error(e);
}
}

async function logout() {
   
    // wipe the locate storage where the session token is stored
}

// the session token is not completed as yet
async function get_username_from_sessiontoken(token) {
    
    return (JSON.parse(token)).userid;   
   
}

async function get_displayname_from_sessiontoken(token) {

  return (JSON.parse(token)).displayname;

}


function fetchAndDisplayStaticContent(url, dom_id) {
    return new Promise((resolve, reject) => {
      console.log("fetchAndDisplayStaticContent()");
      console.log(url);
  
      // Security measure 1
      // only accept URLs matching a specific pattern - URLs pointing to a subset of local files
      const notespage = new RegExp(/^\/fragments\//);
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
  
  
            console.log(doc.body.querySelector('div'));
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
    });
  }



  async function login_logout_action() {
    console.log("login_logout_action()");
    //con

    let session = await chrome.storage.local.get(["yellownotes_session"]);
    var userid = null;
console.debug(session);
try{
 userid = await get_username_from_sessiontoken(session.yellownotes_session);
} catch (e) {
    console.error(e);
    userid = null;
}

    console.debug("userid: " + userid);
    if (userid == null) {
        document.getElementById("login_status").textContent = "Not logged in";
        document.getElementById("loginlogout").innerHTML =  '<a href="https://www.yellownotes.cloud/loginpage">login</a>' ;
    } else if (userid == "DELETED") {
        document.getElementById("login_status").textContent = "Not logged in";
        document.getElementById("loginlogout").innerHTML =  '<a href="https://www.yellownotes.cloud/loginpage">login</a>' ;
    } else {
//        document.getElementById("login_status").innerHtml = 'Logged in as: <br\><div style="font-size: 0.5em">' + userid + "</div>";
document.getElementById("login_status").textContent =  userid ;

       const d = document.getElementById("login_status");
       console.log(d  );
        d.style["font-size"] = "1.0em";
        document.getElementById("loginlogout").innerHTML =  '<a href="https://www.yellownotes.cloud/logout_silent">logout</a>' ;
    }
}

  
// the session token is not completed as yet
function get_username_from_sessiontoken(token) {
console.log("get_username_from_sessiontoken()");
console.log(token);
console.log(JSON.parse(token));  
  try{
  return (JSON.parse(token)).userid;   
  }
  catch (e) {
      console.error(e);
      return null;
  }
}
