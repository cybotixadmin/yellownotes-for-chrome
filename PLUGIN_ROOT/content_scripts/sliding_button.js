const url = window.location.href.trim();
var slidertag = getSliderTag();
console.debug("browsersolutions" + "slidertag: " + slidertag);
console.debug("browsersolutions" + "url: " + url);

var default_position = 0;

chrome.storage.sync.get(["isSlidersEnabled", "defaultSliderPosition"], (settings) => {
    console.debug("Fetching extension settings.");
    console.debug(settings);

    default_position = settings.defaultSliderPosition;
    if (settings.isSlidersEnabled) {
        create_slider();
    } else {
        console.debug("Sliding button is disabled in the settings.");
    }
});




// get a unique reference for the URL
function getSliderTag() {
    const url = window.location.href.trim();
    var slidertag = ("slidertag_" + url).replace(/[\/:\.]/g, '');
    return slidertag;

}

function display_slider() {
    console.debug("browsersolutions:" + " display_slider");
    //is_slider_already_showning();
    const el = document.querySelector("#browsersolutions_frame");
    if (el) {
        console.debug("browsersolutions: " + "slider is already showning");
        return false;

        el.parentNode.removeChild(el);

    } else {
        console.debug("browsersolutions: " + "slider is not showning");
        create_slider()
    }
}

function setItem() {
    console.debug("set OK");
}

function onError(error) {
    console.debug(error);
}

function close_slider() {
    console.debug("browsersolutions: " + "close_slider");
    // is_slider_already_showning();
    const el = document.querySelector("#browsersolutions_frame");
    console.debug(el);
    if (el) {
        console.debug("browsersolutions: " + "slider is already showning");

        let paragraphs = document.querySelectorAll("#browsersolutions_frame");

        // Loop through the NodeList and change the color of each paragraph to blue
        paragraphs.forEach(function (paragraph) {
            paragraph.parentNode.removeChild(paragraph);
        });

    } else {
        console.debug("browsersolutions" + "slider is not showning");
        //return true;
    }
}


function create_slider() {
    console.debug("browsersolutions: create_slider");

    const rootElement = document.documentElement;
    // make a system default position, to be overridden by higher priority values
    var position = default_position;
    // chck if there is a position stored for this URL
    // store locally the button position for this URL
    console.debug("slidertag: " + slidertag);
    chrome.storage.local.get(["isSlidersEnabled", "defaultSliderPosition", slidertag]).then(function (data) {

        console.debug(JSON.stringify(data));

        try {
            // console.debug(JSON.stringify(data));

            if (!isUndefined(data[slidertag])) {

                console.debug(JSON.stringify(data[slidertag]));

                // first, check if there is a slider position value set for this URL
                //console.debug("--reading out position from local store: "+JSON.stringify(data.position));
                position = data[slidertag].position;
                console.debug("position: " + position);

                // Create frame
                create_frame(position);
            } else {
                chrome.runtime.sendMessage({
                    action: "getSliderDefaultPosition"

                }, function (response) {
                    console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
                    console.debug("setting position to: " + response.defaultSliderPosition);
                    position = response.defaultSliderPosition;
                     // Create frame
                create_frame(position);
                });
               

            }

        } catch (e) {
            console.debug(e);
            // if nothing specifically for this page is found, check with background for a general setting


            // send request back to background.js
            chrome.runtime.sendMessage({
                action: "getSliderDefaultPosition"

            }, function (response) {
                console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
                console.debug("setting position to: " + response.defaultSliderPosition);
                position = response.defaultSliderPosition;
                 // Create frame
                create_frame(position);
            });
        }
    });
}


function isUndefined(variable) {
    return typeof variable === 'undefined';
}

function create_frame(position) {
    try {
        console.debug("browsersolutions" + "create_frame with " + position);
        const frame = document.createElement("div");
        frame.id = "browsersolutions_frame"
        // delete any existing pre-existing frame
        try{
        document.getElementById(frame.id).remove();
        }catch(e){
            //console.debug(e);
        }
            frame.style.position = "fixed";
        frame.style.zIndex = "110000"; // Make sure the button is always on top  of other elements, but below button

        frame.style.top = "10px";
        frame.style.left = "10px";
        frame.style.width = "90px";
        frame.style.height = "30px";
        frame.style.padding = "0px";
        frame.style.margin = "0px";
        frame.style.minHeight = "30px";
       
        frame.style.borderWidth = "0px";
        frame.style.borderColor = "rgba(255, 255, 0, 1.0)";
        frame.style.backgroundColor = "rgba(255, 200, 0, 0.45)";
        const rootElement = document.documentElement;
        rootElement.appendChild(frame);

        console.debug("Frame created and appended to the page.");

        const button = document.createElement("button");
        button.id = "browsersolutions_button"
        // delete any existing pre-existing frame
     try{
           document.getElementById(button.id).remove();
    }catch(e){
        //console.debug(e);
    }
        button.style.position = "absolute";
        button.style.zIndex = "110010"; // Make sure the button is always on top  of other elements, but below button

        button.style.left = `${position * 30 - 30}px`;
        button.style.top = "0px";
        button.style.width = "30px";
        button.style.height = "30px";
        button.style.borderWidth = "0px";
        button.style.padding = "0px";
        button.style.margin = "0px";
        button.style.boxSizing = "border-box";
        button.style.minHeight = "30px";
        button.style.borderColor = "rgba(255, 255, 0, 1.0)";
        button.style.backgroundColor = "rgba(255, 255, 0, 0.7)";
        frame.appendChild(button);

        console.debug(`Button created at position ${position} and appended inside the frame.`);
      //  trigger page update event based on the slider position
      //  chrome.runtime.sendMessage({
      //      "message": {
      //          "action": "execute_notesupdate_on_page",
      //          "parameters": {
      //              "position": position
      //          }
      //      }
      //  }, function (response) {
      //      console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
      //  });


        // a local "function" where the position of the button is set in the visual frame
        const setButtonPosition = (position) => {
            console.debug(`Setting button to position ${position}.`);

            // store in the local memory the button position for this URL
            chrome.storage.local.set({
                [slidertag]: {
                    'position': position
                }
            }).then(setItem, onError);

            // move displayed button
            button.style.left = `${position * 30 - 30}px`;
            const event = new CustomEvent('buttonSlide', {
                    detail: {
                        position: position
                    }
                });
            button.dispatchEvent(event);
            return Promise.resolve(position);
        };

        // listen for "movement" of the slider button
        frame.addEventListener('click', (e) => {
            console.debug("Frame clicked.");

            const frameRect = frame.getBoundingClientRect();
            const clickedX = e.clientX - frameRect.left;

            if (clickedX < 30) {
                console.debug("Clicked in the 1st segment of the frame.");
                setButtonPosition(1).then(function (res) {
                    console.debug("setButtonPosition: " + res);
                    // Kick off the looking up of if there are any notes for this page
                    // This function is held in another content script
                    chrome.runtime.sendMessage({
                        "message": {
                            "action": "execute_notesupdate_on_page",
                            "parameters": {
                                "position": 1
                            }
                        }
                    }, function (response) {
                        console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
                        // finally, call "close" on the note
                    });
                    //case_handling(1);
                });
            } else if (clickedX < 60) {
                console.debug("Clicked in the 2nd segment of the frame.");
                setButtonPosition(2).then(function (res) {
                    console.debug("setButtonPosition: " + res);

                    // Kick off the looking up of if there are any notes for this page
                    // This function is held in another content script
                    chrome.runtime.sendMessage({
                        message: {
                            "action": "execute_notesupdate_on_page",
                            "parameters": {
                                "position": 2
                            }
                        }
                    }, function (response) {
                        console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
                        // finally, call "close" on the note
                    });
                    // case_handling(2);
                });
            } else {
                console.debug("Clicked in the 3rd segment of the frame.");
                setButtonPosition(3).then(function (res) {
                    console.debug("setButtonPosition: " + res);

                    // Kick off the looking up of if there are any notes for this page
                    // This function is held in another content script
                    chrome.runtime.sendMessage({
                        message: {
                            "action": "execute_notesupdate_on_page",
                            "parameters": {
                                "position": 3
                            }
                        }
                    }, function (response) {
                        console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
                        // finally, call "close" on the note
                    });
                   

                });

            }
        });

        document.addEventListener('buttonSlide', (e) => {
            console.debug('ButtonSlide event detected.', 'Button moved to position:', e.detail.position);
        });
    } catch (e) {
        console.debug(e);
    }
}

function updateSlider(request, sender, sendResponse) {

    // contenttype
    // permitted values: text, html, embeded, linked

    console.debug("request selected JSON(request): " + JSON.stringify(request));
    console.debug("request selected JSON(sender): " + JSON.stringify(sender));
    console.debug("request selected JSON(sendResponse): " + JSON.stringify(sendResponse));

    const sliderupdate_sharedsecret = "Glbx_marke346gewergr3465";
    const pos = request.defaultSliderPosition;

    return new Promise(function (resolve, reject) {
        console.debug("Promise start");

        // Use the represence of the dummy value "Glbx_marker" in the request as a
        // insecure "shared secret" to try to ensure only request from the
        // background.js are accepted.
        // This must be improved.
        try {

            console.debug("request.sharedsecret: " + request.sharedsecret);
            console.debug("request.sharedsecret: " + sliderupdate_sharedsecret);
            if (request.sharedsecret == sliderupdate_sharedsecret) {
                // a valid marker was included, proceed
                console.debug("a valid marker was included, proceed");
                        close_slider();
                        create_slider();
            } else {
                // no valid marker was included, reject
                console.debug("no valid marker was included, reject request");
                resolve("no valid marker was included, reject request");
            }
        } catch (e) {
            console.debug("error: " + e);
            resolve("error");
        }
    });
}



function listener(request, sender, sendResponse) {
    try{
    //console.debug("browsersolutions request: " + JSON.stringify(request));
    // check for a valid request
   
    //console.debug(request);
    //console.debug(request.action);

    if (!(isUndefined(request.slidershow))) {
        console.debug("browsersolutions show: " + JSON.stringify(request.slidershow));

        if (request.slidershow == "true" || request.slidershow == true) {
            create_slider();
            
        }else if (request.slidershow == "false" || request.slidershow == false) {
            close_slider();
     
          }


        return true;
    }else if (!(isUndefined(request.action))) {
        console.debug("browsersolutions show: " + request.action);


         if (request.action == "updateSliderPosition" ) {

            create_slider;
            close_slider();

            const pos = request.defaultSliderPosition;
            console.debug("browsersolutions updateSliderPosition: " + JSON.stringify(pos));
            updateSlider(request, sender, sendResponse).then(function (res) {
                console.debug(res);
                //close_slider();
                sendResponse({
                    success: true,
                    data: "value"
                });
        
            });
        }


        return true;
    }
    }catch(e){
 //   console.debug(e); 
    }
}

chrome.runtime.onMessage.addListener(listener);

