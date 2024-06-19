// call to find out if the slide button options should be "checked" or "unchecked""
console.log("1.0.0 - popup.js");
chrome.storage.sync.get(["isSlidersEnabled", "defaultSliderPosition"], (settings) => {
    console.log("1.0.0");
    console.log(settings);

    document.getElementById("isSlidersEnabled").checked = settings.isEnabled;

});

document.getElementById("isSlidersEnabled").addEventListener("change", () => {
    console.log("1.0.1 - setting checkbox");
    const isChecked = document.getElementById("isSlidersEnabled").checked;
    chrome.storage.sync.set({
        isSlidersEnabled: isChecked
    });
});

document.getElementById("defaultSliderPosition").addEventListener("change", () => {
    console.log("1.0.2");
    const position = parseInt(document.getElementById("defaultSliderPosition").value);
    console.log(position)
    chrome.storage.sync.set({
        defaultSliderPosition: position
    });
});

chrome.storage.sync.get(["isSlidersEnabled", "defaultSliderPosition"], (settings) => {
    console.log(settings);
    console.log("1.0.3");
    document.getElementById("isSlidersEnabled").checked = settings.isSlidersEnabled;
    document.getElementById("defaultSliderPosition").value = settings.defaultSliderPosition;
});

const checkbox = document.querySelector("#isSlidersEnabled");
console.log(checkbox);

checkbox.addEventListener("change", function (event) {
    console.log(event);
    console.log(event.target);

    chrome.runtime.sendMessage({
        action: "toggleSlider",
        isSlidersEnabled: this.checked
    });
});

// manage the options list

// find out which value on the list should be pre-selected
// the value is stored in the local storage


chrome.storage.sync.get(['defaultSliderPosition'], function (result) {
  if (result.hasOwnProperty('defaultSliderPosition')) {
      // If the value exists in storage, update the variable
      defaultSliderPosition = result['defaultSliderPosition'];
      console.log('Value retrieved from storage:', defaultSliderPosition);
 

if (defaultSliderPosition == 1) {
    // pre-select the first option
    document.querySelector('#option_nothing').classList.add('enlarged-font');
} else if (defaultSliderPosition == 2) {
    // pre-select the second option
    document.querySelector('#option_own_notes_only').classList.add('enlarged-font');
} else if (defaultSliderPosition == 3) {
    // pre-select the third option
    document.querySelector('#option_all_notes').classList.add('enlarged-font');
} else {
}  

document.querySelector('#option_nothing').addEventListener('click', () => {
    console.log("option_nothing selected");
    chrome.runtime.sendMessage({
        action: "setSliderDefaultPosition",
        setting: 1
    });
    // send message to background that this is the new default for all new pages, and all pages where there is no value specifically set.

    try {
        // Remove enlarged font from all items
        var myList = event.target.parentNode.querySelectorAll('li');
        for (var i = 0; i < myList.length; i++) {
            myList[i].classList.remove('enlarged-font');
//            myList[i].classList.remove('clicked');
        }
    } catch (e) {
        console.log(e);

    }
    // add large font to clicked item
    event.target.classList.add('enlarged-font');

    // add the "clicked" class to clicked item
  //  event.target.classList.add('clicked');
});


document.querySelector('#option_own_notes_only').addEventListener('click', () => {
    console.log("option_own_notes_only selected");
    chrome.runtime.sendMessage({
        action: "setSliderDefaultPosition",
        setting: "2"
    });
    // send message to background that this is the new default for all new pages, and all pages where there is no value specifically set.
    try {
        // Remove enlarged font from all items
        var myList = event.target.parentNode.querySelectorAll('li');
        for (var i = 0; i < myList.length; i++) {
            myList[i].classList.remove('enlarged-font');
        }
    } catch (e) {
        console.log(e);

    }
    // add large font to clicked item
    event.target.classList.add('enlarged-font');

});

document.querySelector('#option_all_notes').addEventListener('click', () => {
    console.log("option_all_notes selected");
    chrome.runtime.sendMessage({
        action: "setSliderDefaultPosition",
        setting: 3
    });
    // send message to background that this is the new default for all new pages, and all pages where there is no value specifically set.
    try {
        // Remove enlarged font from all items
        var myList = event.target.parentNode.querySelectorAll('li');
        for (var i = 0; i < myList.length; i++) {
            myList[i].classList.remove('enlarged-font');
        }
    } catch (e) {
        console.log(e);

    }
    // add large font to clicked item
    event.target.classList.add('enlarged-font');

});

document.querySelector('#attach_note_to_current_tab').addEventListener('click', () => {
    console.log("attach_note_to_currenttab selected");
    var url = window.location.href;
    console.debug("to url: " , url);
    getCurrentTabUrl().then((url) => {
        console.debug("to url: " , url);
        return chrome.runtime.sendMessage({
        action: "attach_to_current_tab",
        note_type: "yellownote",
        url: url
        });
        
    }).then((response) => {
        console.log(response);

        // send message to background that this is the new default for all new pages, and all pages where there is no value specifically set.
  
    
        });
    });

} else {}
});

document.querySelectorAll('#defaultSliderPosition li').forEach(item => {
    item.addEventListener('mouseover', () => {
        // Additional JavaScript actions on mouseover, if needed
    });
    item.addEventListener('mouseout', () => {
        // Additional JavaScript actions on mouseout, if needed
    });
});



function getCurrentTabUrl() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                var activeTab = tabs[0];
                var activeTabUrl = activeTab.url;
                resolve(activeTabUrl);
            }
        });
    });
}