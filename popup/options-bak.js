const isEnabledElement = document.getElementById("isEnabled");
const defaultPositionElement = document.getElementById("defaultPosition");
console.debug(defaultPositionElement);

// Load saved options
browser.storage.local.get(["isEnabled", "defaultPosition"], function (data) {
    console.debug("browsersolutions" + "load saved options: " + JSON.stringify(data));

  isEnabledElement.checked = data.isEnabled;
  defaultPositionElement.value = data.defaultPosition;
});

// Save options
isEnabledElement.addEventListener('change', function (event) {
    console.debug("browsersolutions" + "save options:"+ isEnabledElement.checked);
    browser.storage.local.set({ isEnabled: isEnabledElement.checked });
});


if (defaultPositionElement) {
    

defaultPositionElement.addEventListener('change', function (event) {
    console.debug("browsersolutions" + "save options:"+ defaultPositionElement.value);
    browser.storage.local.set({ defaultPosition: defaultPositionElement.value });
//}).then(function(data) {
 //   console.debug("browsersolutions" + "status: " + JSON.stringify(data));
//
//    return browser.storage.local.get(["isEnabled", "defaultPosition"]);
//}).then(function(data) {
//    console.debug("browsersolutions" + "load saved options: " + JSON.stringify(data));

});

} else {
    console.error('Element not found!');
}


document.getElementById('closeSlidersButton').addEventListener('click', function(event) {
    const msg = {
        stickynote:
        {request: 'close_all_sliders'}
    };
    browser.runtime.sendMessage(msg);
});

// Listen to the custom event and handle it
document.addEventListener('buttonSlide', function(e) {
    console.log('Button has moved to position:', e.detail.position);
});

document.getElementById('showSlidersButton').addEventListener('click', function(event) {
    const msg = {
        stickynote:
        {request: 'show_all_sliders'}
    };
    browser.runtime.sendMessage(msg);
});



