let button;
let frame
// show the slider by default
var isEnabled = true;
var defaultPosition = 1;
var sliderPoistion;


/**
 * Should the slider be shown, and if so, what position should it be set to.
 * 
 * the boolean isEnabled is set to true by script default. This means that the slider will be shown.
 * This can be overriden by the background - so check with background script if the slider should be shown or not.
 * 
 */

// check if there is a position set for this url
const url = window.location.href.trim();
var slidertag = "slidertag_" + url;
console.log("browsersolutions" + "url: " + url);

// Get the isEnabled and defaultPosition values from storage
// first check if there is a value set for the current page.
// If not, use the default values.
browser.storage.local.get(["isEnabled", "defaultPosition", "slidertag"], (data) => {
    console.log("browsersolutions" + JSON.stringify(data));
    // set meaningful default if there is no information in the storage
    if (data.isEnabled === undefined) {
        console.log("browsersolutions" + "set isEnabled by default to " + isEnabled);
        browser.storage.local.set({
            isEnabled: isEnabled
        });
    } else {
        isEnabled = data.isEnabled;
    }
    if (data.defaultPosition === undefined) {
        console.log("browsersolutions" + "set defaultPosition by default to " + defaultPosition);
        //defaultPosition = 1;
        browser.storage.local.set({
            defaultPosition: defaultPosition
        });
    } else {
        defaultPosition = data.defaultPosition;
    }
    if (data.slidertag === undefined) {
        console.log("browsersolutions" + "set slidertag to default " + defaultPosition);
        slidertag = defaultPosition;
        browser.storage.local.set({
            slidertag: slidertag
        });
    }

});

// Send message to background, which would tell the background which tab/pape this script is running on


// Set the position in the background script

var msg = {
    stickynote: {
        "request": "get_current_tabid"
    }
};

console.log("browsersolutions " + JSON.stringify(msg));

// at load time, check if slider should be created
//var shouldCreateSlider = false;
console.log( "isEnabled: " + isEnabled);
if (isEnabled) {
    create_slider();
}

browser.runtime.sendMessage(msg).then(function (currentTabId) {
    console.debug("browsersolutions" + "message sent to backgroup.js with response: " + JSON.stringify(currentTabId));

    console.log("browsersolutions" + "currentTabId: " + currentTabId);
    console.log(currentTabId);

    browser.storage.local.get(["isEnabled", "defaultPosition"]).then(function (data) {
        console.log(data);
        if (data.isEnabled) {

            const tabSettings = data[currentTabId] || {};
            console.log(tabSettings);
            
            var position = 2;
            // Create frame
            create_frame(position);

        }
    });
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'close_slider') {
        // Do something with the message data
        console.log(message.data);
        close_slider();
    } else if (message.action === 'show_slider') {
        // Do something with the message data
        console.log(message.data);
        display_slider();
    }
});

function display_slider() {
    console.log("browsersolutions" + "display_slider");
    //is_slider_already_showning();
    const el = document.querySelector("#browsersolutions_frame");
    if (el) {
        console.log("browsersolutions" + "slider is already showning");
        return false;

        el.parentNode.removeChild(el);

    } else {
        console.log("browsersolutions" + "slider is not showning");
        create_slider()
    }

}

function close_slider() {
    console.log("browsersolutions" + "close_slider");
    // is_slider_already_showning();
    const el = document.querySelector("#browsersolutions_frame");
    console.log(el);
    if (el) {
        console.log("browsersolutions" + "slider is already showning");

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

function create_frame(position) {
  try{
  frame = document.createElement("div");
  frame.id = "browsersolutions_frame"
      frame.style.position = "fixed";
  frame.style.zIndex = "900"; // Make sure the button is always on top  of other elements, but below button
  frame.style.top = "10px";
  frame.style.left = "10px";
  frame.style.width = "90px"; // Enough width to fit the button in all positions
  frame.style.height = "30px"; // Adjust to the height of the button
  frame.style.backgroundColor = "rgba(255, 0, 0, 0.2)"; // Semi-transparent red color
  frame.style.border = "2px solid black"; // Frame border

  // Create button
  button = document.createElement("button");
  button.style.position = "absolute";
  button.style.zIndex = "1000"; // Make sure the button is always on top  of other elements
  button.style.left = `${position * 30 - 30}px`; // Adjusted for frame's position
  button.style.top = "0px"; // Top of the frame
  button.style.width = "30px";
  button.style.height = "30px";
  button.style.backgroundColor = "rgba(0, 0, 255, 0.5)"; // Semi-transparent blue color
  button.innerText = "";
  frame.appendChild(button);
  const rootElement = document.documentElement;
  rootElement.appendChild(frame);

  button.onclick = () => {
      console.log("browsersolutions" + "button clicked");
      let leftPosition = parseInt(button.style.left, 10);
      if (leftPosition === 30) {
          button.style.left = '60px';
      } else if (leftPosition === 60) {
          button.style.left = '10px';
      } else {
          button.style.left = '30px';
      }
  };
// Sliding functionality
const slideButton = () => {
console.log("browsersolutions" + "button clicked");
let leftPosition = parseInt(button.style.left, 10);
let newPosition;

if (leftPosition === 0) {
button.style.left = '30px';
newPosition = 2;
} else if (leftPosition === 30) {
button.style.left = '60px';
newPosition = 3;
} else {
button.style.left = '0px';
newPosition = 1;
}

// Dispatching the custom event
const event = new CustomEvent('buttonSlide', { detail: { position: newPosition } });
button.dispatchEvent(event);
};

button.addEventListener('click', slideButton);
button.addEventListener('touchend', slideButton);
  } catch (e) {
    console.log("browsersolutions" + "error: " + e);
  }
}

function create_slider() {
    console.log("browsersolutions" + "create_slider");
   
                const rootElement = document.documentElement;
                var position = 2;
                // Create frame
                create_frame(position);
               
            
           
        
   

}
