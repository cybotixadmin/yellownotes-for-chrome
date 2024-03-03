
const server_url = "https://api.yellownotes.cloud";


const plugin_uuid_header_name = "ynInstallationUniqueId";
const plugin_session_header_name = "yellownotes_session";


var frame = document.getElementById('frame');

// Function to load content into the frame using fetch
async function loadFrameContent() {
console.log("loadFrameContent");
    let session = await chrome.storage.local.get(["yellownotes_session"]);

    const userid = await get_username_from_sessiontoken(session.yellownotes_session);
const trype = "webframe";
    // Send save request back to background to pickup the note template
    const action = "get_" + type + "_template";
    console.log("action: " + action,
    "userid: " + userid);
    sendMessageWithPromise({
        "action": action,
        "userid": userid
    }).then(htmlContent => {
       
        var framenote_template = safeParseInnerHTML(htmlContent, 'div');
        // note_template = JSON.parse(html);
        console.log(framenote_template);
        console.log(frame_root);
        var frame_root = document.getElementById(type+'frameContainer');
        console.log(frame_root);
        frame_root.appendChild(framenote_template);
console.log(frame_root);
        frame_root.querySelector('img[name="brand_logo"]').addEventListener('click', function () {
            document.getElementById(type+'fileInput').click();
        });

        document.getElementById(type+'fileInput').addEventListener('change', function (event) {
            var file = event.target.files[0];
            console.log("fileInput change event");

            // Check if file is selected
            if (file) {
                // Validate file type and size
                if ((file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/gif") && file.size <= 100000) {
                    var reader = new FileReader();
                    console.log("3.2.0");
                    reader.onloadend = function () {
                        var base64data = reader.result;
                        console.log(base64data);
                        //document.getElementById('clickableImage').src = base64data;
                        var img2 = document.getElementById(type+'fileInput').querySelector('img[name="brand_logo"]');
                        if (img2) {
                            // prefix with "data:image/png;base64,"
                            img2.src = base64data;
                            console.log(img2);
                        } else {
                            console.error('No image tag found with name="brand_logo"');
                        }

                    };
                    reader.readAsDataURL(file);

                } else {
                    alert('File must be a PNG, JPG, JPEG, or GIF and less than 100KB in size.');
                }

            }
        });

    })
    .catch(error => {
        console.error('Error loading content:', error);
    });
}


// Function to load content into the frame using fetch
async function loadYellownoteContent() {
console.log("loadYellownoteContent");
    const trype = "yellownote";
    let session = await chrome.storage.local.get(["yellownotes_session"]);

    const userid = await get_username_from_sessiontoken(session.yellownotes_session);

    // Send save request back to background to pickup the note template
    const action = "get_" + type + "_template";
    console.log("action: " + action,
    "userid: " + userid);
    sendMessageWithPromise({
        "action": action,
        "userid": userid
    }).then(htmlContent => {
       
        var framenote_template = safeParseInnerHTML(htmlContent, 'div');
        // note_template = JSON.parse(html);
        console.log(framenote_template);
        console.log(frame_root);
        var frame_root = document.getElementById(type+'frameContainer');
        console.log(frame_root);
        frame_root.appendChild(framenote_template);
console.log(frame_root);
        frame_root.querySelector('img[name="brand_logo"]').addEventListener('click', function () {
            document.getElementById(type+'fileInput').click();
        });

        document.getElementById(type+'fileInput').addEventListener('change', function (event) {
            var file = event.target.files[0];
            console.log("fileInput change event");

            // Check if file is selected
            if (file) {
                // Validate file type and size
                if ((file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/gif") && file.size <= 100000) {
                    var reader = new FileReader();
                    console.log("3.2.0");
                    reader.onloadend = function () {
                        var base64data = reader.result;
                        console.log(base64data);
                        //document.getElementById('clickableImage').src = base64data;
                        var img2 = document.getElementById(type+'fileInput').querySelector('img[name="brand_logo"]');
                        if (img2) {
                            // prefix with "data:image/png;base64,"
                            img2.src = base64data;
                            console.log(img2);
                        } else {
                            console.error('No image tag found with name="brand_logo"');
                        }

                    };
                    reader.readAsDataURL(file);

                } else {
                    alert('File must be a PNG, JPG, JPEG, or GIF and less than 100KB in size.');
                }

            }
        });

    })
    .catch(error => {
        console.error('Error loading content:', error);
    });
}

// Load frame content from web service
//loadYellownoteContent();

loadFrameContent();


const type = "webframe";
document.getElementById(type+'colorPicker').addEventListener('change', function (e) {
    console.log(type  + " colorPicker change event");
    console.log(e.target.value);
    var table = document.getElementById(type+'frameContainer').querySelector('table[class="whole_note_table"]');

    console.log(table);
    console.log(table.style);

    table.style.backgroundColor = e.target.value;
    console.log(table);
    // var table = document.querySelector('table[class="whole_note_table"]');

    var elements = table.querySelectorAll('table[class="whole_note_table"],  tr ');

    // To iterate over the NodeList
    elements.forEach(function (element) {
        console.log(element); // Do something with each element
        element.style.backgroundColor = e.target.value;
    });
});

document.addEventListener('DOMContentLoaded', function () {
    var frame = document.getElementById('frame');
    // Load frame content
    // ...

   
});



// the session token is not completed as yet
async function get_username_from_sessiontoken(token) {
    
    return (JSON.parse(token)).userid;   
    
}


 function get_brand_from_sessiontoken(token) {
    
    try {
        return (JSON.parse(token)).brand;   
    } catch (error) {
        return "default";
    }

    
}


 async function save_setup (type) {
    console.log(document.getElementById(type+'saveButton'));
    document.getElementById(type+'saveButton').addEventListener('click', async function () {
        console.log(type+"saveButton click event");
        // Get content from frame
        console.log(type+'frameContainer');
        console.log(document.getElementById(type+'frameContainer'));
        console.log(document.getElementById(type+'frameContainer').querySelector('table.whole_note_table'));
//        console.log(document.getElementById(type+'frameContainer').querySelector('div').querySelector('div'));

        
        var content = document.getElementById(type+'frameContainer').querySelector('table.whole_note_table').outerHTML;
        console.log(content);
        console.log(btoa(content));

        let plugin_uuid = await chrome.storage.local.get(["ynInstallationUniqueId"]);
        let session = await chrome.storage.local.get(["yellownotes_session"]);

        const userid = await get_username_from_sessiontoken(session.yellownotes_session);
        // look up brand in the user session object // not implemented as yet
        const brand = get_brand_from_sessiontoken(session.yellownotes_session);
    const msg = {
        type: "webframe",
        userid: userid,
        templatefile: btoa(content),
        brand: brand
    }
        // Send content via HTTP POST
        // ...
        const message_body = JSON.stringify(msg);

        const response = await fetch(
            server_url + "/api/upload_template", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                [plugin_uuid_header_name]: plugin_uuid.ynInstallationUniqueId,
                [plugin_session_header_name]: session.yellownotes_session,
            },
            body: message_body, // example IDs, replace as necessary
        });
    //console.log(response);
    // Check for errors
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse JSON data
    const data = await response.json();

    });
}




save_setup ("webframe");
//save_setup ("webframe");


// Function to send a message and return a promise
function sendMessageWithPromise(message) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, response => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(response);
            }
        });
    });
}

function safeParseInnerHTML(rawHTML, targetElementName) {

    // list of acceptable html tags


    // list of unacceptable html tags
    const unaccep = ["script"];

    unaccep.forEach(function (item, index) {
        console.log(item);
    });

    const container = document.createElement(targetElementName);
    // Populate it with the raw HTML content
    container.innerHTML = rawHTML;

    return container;
}
