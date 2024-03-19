

// determine if the user is authneticted or not

chrome.storage.local.get(["xYellownotesSession"]).then( (session) => {  

  const userid = get_username_from_sessiontoken(session.xYellownotesSession);
console.debug(userid  );
if (userid == null) {
    document.getElementById("login_status").textContent = "Not logged in";
    document.getElementById("loginlogout").innerHTML =  '<a href="https://www.yellownotes.cloud/loginpage">login</a>' ;
  // populate the fragment pertaining to Yellow Notes more generally

    fetchAndDisplayStaticContent( "/fragments/yellownotes_fragment.html", "front_page").then(() => {});

}else {
  // populate the fragment pertaining the users account
  fetchAndDisplayStaticContent( "/fragments/account_information.html", "account_information").then(() => {});

}
}).catch( (error) => {} );
  

fetchAndDisplayStaticContent( "/fragments/sidebar_fragment.html", "sidebar").then(() => {   
    page_display_login_status();
    login_logout_action();
  
  });

