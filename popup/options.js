// call to find out is the ceckbutton should be on or off
console.log("1.0.0 - options.js");
chrome.storage.sync.get(["isSlidersEnabled","defaultPosition"], (settings) => {
  console.log("1.0.0");
  console.log(settings);

  document.getElementById("isSlidersEnabled").checked = settings.isEnabled;

});


document.getElementById("isSlidersEnabled").addEventListener("change", () => {
  console.log("1.0.1 - setting checkbox");
    const isChecked = document.getElementById("isSlidersEnabled").checked;
    chrome.storage.sync.set({ isSlidersEnabled: isChecked });
  });
  
  document.getElementById("defaultPosition").addEventListener("change", () => {
    console.log("1.0.2");
    const position = parseInt(document.getElementById("defaultPosition").value);
    console.log(position)
    chrome.storage.sync.set({ defaultPosition: position });
  });
  
  chrome.storage.sync.get(["isSlidersEnabled", "defaultPosition"], (settings) => {
    console.log(settings);
    console.log("1.0.3");
    document.getElementById("isSlidersEnabled").checked = settings.isSlidersEnabled;
    document.getElementById("defaultPosition").value = settings.defaultPosition;
  });
  

  const checkbox = document.querySelector("#isSlidersEnabled");
console.log(checkbox);

checkbox.addEventListener("change", function(event) {
  console.log(event);
  console.log(event.target);
  
    chrome.runtime.sendMessage({ action: "toggleSlider", isSlidersEnabled: this.checked });
});

