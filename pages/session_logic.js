
/* check if the user is login or not.
 And display login and logot links accordingly

 If the user is logine, display the users name.
*/


display_login_status();

async function display_login_status() {
    console.log("display_login_status()");
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

async function logout() {
   
    // wipe the locate storage where the session token is stored


}

// the session token is not completed as yet
async function get_username_from_sessiontoken(token) {
    
    return (JSON.parse(token)).userid;   
    
}