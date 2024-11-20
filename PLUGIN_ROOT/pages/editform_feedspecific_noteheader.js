 // start code for note header customization


 let imageDataUrl = "";

 // Event listeners for dynamic updating of the preview
 console.debug("adding event listeners");
 console.log(document.querySelector('[id="text_content"]'));

 document.querySelector('[id="text_content"]').addEventListener("input", updatePreview);
 document.querySelector('[id="font-size"]').addEventListener("change", updatePreview);
 document.querySelector('[id="font-color"]').addEventListener("change", updatePreview);
 document.querySelector('[id="bg-color"]').addEventListener("change", updatePreview);
 document.querySelector('[id="font-family"]').addEventListener("change", updatePreview);
 document.querySelector('[id="image-position"]').addEventListener("change", updatePreview);
 document.querySelector('[id="image-upload"]').addEventListener("change", updateImage);
 


 function attachEventlistener2Editform(){
    console.debug("attachEventlistener2Editform.start");
    // Event listeners for dynamic updating of the preview

    document.querySelector('[id="text_content"]').addEventListener("input", updatePreview);
    document.querySelector('[id="font-size"]').addEventListener("change", updatePreview);
    document.querySelector('[id="font-color"]').addEventListener("change", updatePreview);
    document.querySelector('[id="bg-color"]').addEventListener("change", updatePreview);
    document.querySelector('[id="font-family"]').addEventListener("change", updatePreview);
    document.querySelector('[id="image-position"]').addEventListener("change", updatePreview);
    document.querySelector('[id="image-upload"]').addEventListener("change", updateImage);
        
 // Save button
 console.log(document.querySelector('[id="save-noteheader-btn"]'));
 document.querySelector('[id="save-noteheader-btn"]').addEventListener("click", async () => {
    console.debug("save-noteheader-btn.click");

    var ynInstallationUniqueId = "";
    var xYellownotesSession = "";
   // var distributionlists;
    var data;

    chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name]).then(function (result) {
        console.log(result);
        console.log(ynInstallationUniqueId);
        ynInstallationUniqueId = result[plugin_uuid_header_name];
        xYellownotesSession = result[plugin_session_header_name];

    const previewCell = document.querySelector('[id="noteheader-preview-cell"]');
    console.log(previewCell);
    const htmlContent = pruneWhitespace(previewCell.innerHTML);
      // Prune redundant whitespace

      console.log(htmlContent);
  
    //const distributionlistid = "7de551c1-d903-34cd-c9bf-a4451de99fc5";
    // the variable distributionlistid is set in view_own_distributionlist.js 

    fetch("https://api.yellownotes.cloud/api/v1.0/plugin_user_update_distribution_list_noteheader", {
        method: "POST",
        headers: { "Content-Type": "application/json",
            [plugin_uuid_header_name]: ynInstallationUniqueId,
            [plugin_session_header_name]: xYellownotesSession,
         },
         body: JSON.stringify({ "distributionlistid": distributionlistid, "html": htmlContent })
        })
        .then(response => {
          if (response.ok) {
            alert("HTML content saved successfully!");
          } else {
            return response.text().then(error => {
              throw new Error("Failed to save content: " + error);
            });
          }
        })
        .catch(error => {
          //alert(error.message);
        });

    
  });
});
 }


// Function to prune redundant whitespace from HTML
function pruneWhitespace(html) {
    return html
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();                        
  }


 function updatePreview() {
     console.debug("updatePreview.start");
   const textContent = document.querySelector('[id="text_content"]').value;
   const fontSize = document.querySelector('[id="font-size"]').value;
   const fontColor = document.querySelector('[id="font-color"]').value;
   const bgColor = document.querySelector('[id="bg-color"]').value;
   const fontFamily = document.querySelector('[id="font-family"]').value;
   const imagePosition = document.querySelector('[id="image-position"]').value;
   
   var imageDataUrl = document.querySelector('[id="distributionlist_icon"]').getAttribute("src");
   
   const previewCell = document.querySelector('[id="noteheader-preview-cell"]');
 console.log(previewCell);
console.log("imagePosition: " + imagePosition); 
   if (imagePosition == "left") {
    previewCell.innerHTML = `
    <div placeholder="root" style="display: flex; align-items: center; justify-content: "flex-start"};">
      ${imageDataUrl ? `<img name="feed_icon" src="${imageDataUrl}" style="height: 50px; width: auto; margin-right: 8px;">` : ""}
      <span>${textContent}</span>
    </div>
  `;
    } else {
   previewCell.innerHTML = `
     <div placeholder="root" style="display: flex; align-items: center; justify-content: "flex-end"};">
       <span>${textContent}</span>
       ${imageDataUrl ? `<img name="feed_icon" src="${imageDataUrl}" style="height: 50px; width: auto; margin-left: 8px;">` : ""}
     </div>
   `;
    }
   const preview = previewCell.querySelector('[ placeholder="root"]');
   console.log(preview);
   preview.style.fontSize = fontSize;
   preview.style.color = fontColor;
   preview.style.backgroundColor = bgColor;
   preview.style.fontFamily = fontFamily;
   preview.removeAttribute("placeholder");
  

}


 function updateImage() {
    console.debug("updateImage.start");
   const imageInput = document.getElementById("image-upload");
   
   if (imageInput.files && imageInput.files[0]) {
     const imageFile = imageInput.files[0];
     if (imageFile.size > 50000) {  // Ensure the image is within size limits
       alert("Image size must be less than 50KB.");
       return;
     }
     toDataURL(imageFile).then(dataUrl => {
       imageDataUrl = dataUrl;
       // insert the image into the page
       document.querySelector('[id="distributionlist_icon"]').setAttribute("src", imageDataUrl);
       updatePreview();
     });
   }
 }
 
 function toDataURL(file) {
   return new Promise((resolve, reject) => {
     const reader = new FileReader();
     reader.onloadend = () => resolve(reader.result);
     reader.onerror = reject;
     reader.readAsDataURL(file);
   });
 }
   
   // end code for note header customization
 