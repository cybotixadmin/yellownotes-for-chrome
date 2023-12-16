const url = window.location.href.trim();
var slidertag = getSliderTag();
console.log("browsersolutions" + "slidertag: " + slidertag);
console.log("browsersolutions" + "url: " + url);

var default_position = 1;

chrome.storage.sync.get(["isSlidersEnabled", "defaultPosition"], (settings) => {
    console.log("Fetching extension settings.");

    if (settings.isSlidersEnabled) {
        create_slider();
    } else {
        console.log("Sliding button is disabled in the settings.");
    }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log(message.slidershow);

    console.log("browsersolutions show: " + JSON.stringify(message.slidershow));

    if (message.slidershow) {
        display_slider();

    } else {
        close_slider();

    }
});


// get a unique reference for the URL
function getSliderTag(){
    const url = window.location.href.trim();
    var slidertag = ("slidertag_" + url).replace(/[\/:\.]/g, '');
    return slidertag;

}


function display_slider() {
    console.log("browsersolutions:" + " display_slider");
    //is_slider_already_showning();
    const el = document.querySelector("#browsersolutions_frame");
    if (el) {
        console.log("browsersolutions: " + "slider is already showning");
        return false;

        el.parentNode.removeChild(el);

    } else {
        console.log("browsersolutions: " + "slider is not showning");
        create_slider()
    }
}

function setItem() {
    console.log("set OK");
}

function onError(error) {
    console.log(error);
}

function close_slider() {
    console.log("browsersolutions: " + "close_slider");
    // is_slider_already_showning();
    const el = document.querySelector("#browsersolutions_frame");
    console.log(el);
    if (el) {
        console.log("browsersolutions: " + "slider is already showning");

        let paragraphs = document.querySelectorAll("#browsersolutions_frame");

        // Loop through the NodeList and change the color of each paragraph to blue
        paragraphs.forEach(function (paragraph) {
            paragraph.parentNode.removeChild(paragraph);
        });

    } else {
        console.log("browsersolutions" + "slider is not showning");
        //return true;
    }

}

function create_slider() {
    console.log("browsersolutions: create_slider");

    const rootElement = document.documentElement;
    // make a system default position, to be overridden by higher priority values
    var position = default_position;
    // chck if there is a position stored for this URL
    // store locally the button position for this URL
    console.log("slidertag: " + slidertag);
    chrome.storage.local.get().then(function (data) {
        try {
           // console.log(JSON.stringify(data));
            console.log(JSON.stringify(data[slidertag].position));

            //console.log("--reading out position from local store: "+JSON.stringify(data.position));
            position = data[slidertag].position;
            // Create frame
            create_frame(position);
        } catch (e) {
            console.log(e);
            // if nothing specifically for this page is found, check with background for a general setting


            // send request back to background.js
            chrome.runtime.sendMessage({
                stickynote: {
                    "request": "getSliderStatus"

                }
            }, function (response) {
                console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
                console.log("setting position to: " + response.defaultSliderPosition);
                position = response.defaultSliderPosition;

            });

            // Create frame
            create_frame(position);

        }

    });

}

function create_frame(position) {
    try {
        const frame = document.createElement("div");
        frame.id = "browsersolutions_frame"
            frame.style.position = "fixed";
        frame.style.zIndex = "900"; // Make sure the button is always on top  of other elements, but below button

        frame.style.top = "10px";
        frame.style.left = "10px";
        frame.style.width = "90px";
        frame.style.height = "30px";
        frame.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
        const rootElement = document.documentElement;
        rootElement.appendChild(frame);

        console.log("Frame created and appended to the page.");

        const button = document.createElement("button");
        button.style.position = "absolute";
        frame.style.zIndex = "901"; // Make sure the button is always on top  of other elements, but below button

        button.style.left = `${position * 30 - 30}px`;
        button.style.top = "0px";
        button.style.width = "30px";
        button.style.height = "30px";
        button.style.backgroundColor = "rgba(0, 0, 255, 0.5)";
        frame.appendChild(button);
        console.log(`Button created at position ${position} and appended inside the frame.`);

        const setButtonPosition = (position) => {
            console.log(`Setting button to position ${position}.`);

            // store locally the button position for this URL
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
        };

        // sliten for "movement" of the slider button
        frame.addEventListener('click', (e) => {
            console.log("Frame clicked.");

            const frameRect = frame.getBoundingClientRect();
            const clickedX = e.clientX - frameRect.left;

            if (clickedX < 30) {
                console.log("Clicked in the 1st segment of the frame.");
                setButtonPosition(1);
                // remove all notes from the page
                // This function is held in another content script

document.querySelectorAll('div[type="yellowstickynote"]').forEach(function (a) {
    console.log("removing a note" + a);
    a.parentNode.removeChild(a);
});

            } else if (clickedX < 60) {
                console.log("Clicked in the 2nd segment of the frame.");
                setButtonPosition(2);
                getNotes("2");
            } else {
                console.log("Clicked in the 3rd segment of the frame.");
                setButtonPosition(3);
                // Kick off the looking up of if there are any notes for this page
                // This function is held in another content script
                getNotes("3");


            }
        });

        document.addEventListener('buttonSlide', (e) => {
            console.log('ButtonSlide event detected.', 'Button moved to position:', e.detail.position);
        });
    } catch (e) {
        console.log(e);
    }

}
