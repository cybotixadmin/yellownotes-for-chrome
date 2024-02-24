



display_login_status();

async function display_login_status() {
    console.log("display_login_status()");
    //con

    let session = await chrome.storage.local.get(["yellownotes_session"]);

const userid = await get_username_from_sessiontoken(session.yellownotes_session);

    
    console.debug("userid: " + userid);
    if (userid == null) {
        document.getElementById("login_status").innerHTML = "Not logged in";
    } else {
        document.getElementById("login_status").innerHTML = "Logged in as " + userid;
    }
}

async function logout() {
   
    // wipe the locate storage where the session token is stored


}
// the session token is not completed as yet
async function get_username_from_sessiontoken(token) {
    
    return (JSON.parse(token)).userid;   
    
}