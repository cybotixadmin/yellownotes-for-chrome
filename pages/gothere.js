/**
 * This script intercept cliks to links that should be redirected to /pages/ hosted on the plugin
 *
 */
console.log("Browsersolutions: gotheret.js loaded");

console.log(window.location.href);


    console.log("redirect to go to note")

    // first check if user is authorized for note
    const noteid = getQueryStringParameter('noteid');
    console.debug(noteid);
    chrome.runtime.sendMessage({
        action: "get_authorized_note",
        noteid: noteid

    }).then(function (note_data) {
        console.log("note_data");
        console.log(note_data);
        datarow = note_data[0];
        console.log(datarow);
        const note_obj = JSON.parse(datarow.json);
        console.log(note_obj);
        const note_type = note_obj.note_type;

        // brand not yet implemented
        const brand = "default";

   

 const url = datarow.url;
        // issue a http redirect to open the URL in another browser tab
        //window.open(url, '_blank').focus();
        // add functionality to scroll to the note in question
        // invoke the background script to scroll to the note in question
        return chrome.runtime.sendMessage({
            message: {
                action: "scroll_to_note",
                scroll_to_note_details: {
                    datarow: datarow,
                    url: url

                }
            }
        });
    }).then(  function (response) {
            console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
            // finally, call "close" on the note
            //  try{
            //  	close_note(event);
            //  }catch(g){console.debug(g);}

        });


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


  
function listener(request, sender, sendResponse) {

    try {
        console.debug("browsersolutions request: ");
        console.debug(request);
        console.debug(request.info);
        console.debug(request.tab);
        console.debug(request.action);
        console.debug(request.sharedsecret);



    } catch (e) {
        console.debug(e);
    }
   
   
}
