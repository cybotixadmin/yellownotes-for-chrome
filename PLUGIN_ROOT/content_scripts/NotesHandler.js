
// enable debugging on calls to functions
const function_call_debuging = true;

const plugin_session_header_name = "xyellownotessessionjwt";

let startX, startY, endX, endY;
const overlay = document.createElement('div');
document.documentElement.appendChild(overlay);
overlay.style.position = 'fixed';
overlay.style.border = '3px solid rgba(255, 255, 0, 0.75)'; // Yellow border
overlay.style.zIndex = '10001';
overlay.style.pointerEvents = 'none';
overlay.style.display = 'none';

const messageBox = document.createElement('div');

var mouseX, mouseY;
// Attach the event listener to the document to make the mouse coordinates available to the extension
// in order to correctly place notes
document.addEventListener('mousemove', (event) => {
    // console.debug("mousemove detected");
    // console.debug(event);
    //  console.debug(event.target);

    // Extract the x and y coordinates of the mouse cursor
    mouseX = event.clientX + window.scrollX;
    mouseY = event.clientY + window.scrollY

        //console.debug(mouseX, mouseY ); // For demonstration purposes

});

// Attach event listener to the contextmenu event on the document
document.addEventListener('contextmenu', function (event) {
    // Capture mouse position when right-click occurs
    var mouseX = event.clientX;
    var mouseY = event.clientY;

    // Store or process the mouse position as needed
    console.debug('Mouse position - X:', mouseX, 'Y:', mouseY);

    // You can perform additional actions here, such as displaying a custom context menu

    // Delay the appearance of the default context menu
    setTimeout(function () {
        // Allow the default context menu to appear after a short delay
    }, 0);
});

document.addEventListener('oncontextmenu ', (event) => {
    console.debug("oncontextmenu detected at " + mouseX + " " + mouseY);
    // keep the current cursor postion

    var mouseX = event.clientX;
    var mouseY = event.clientY;

    // Store or process the mouse position as needed
    console.debug('oncontextmenu Mouse position - X:', mouseX, 'Y:', mouseY);

    // You can perform additional actions here, such as displaying a custom context menu

    // Delay the appearance of the default context menu
    setTimeout(function () {
        // Allow the default context menu to appear after a short delay
    }, 0);

});

var clickX, clickY;
function logPosition(event) {
    console.debug("click detected: " + event.button);
    if (event.button === 2) {
        console.debug("right click detected");
        clickX = event.clientX + window.scrollX;
        clickY = event.clientY + window.scrollY;
        const cursorPosition = {
            x: event.clientX + window.scrollX,
            y: event.clientY + window.scrollY
        };
        console.debug(cursorPosition);
    } else {
        console.debug("not a right click");

    }
}

// set a global variable on DOM being fully loaded
var DOMfullyLoaded = false;
document.addEventListener('DOMContentLoaded', function () {
    console.debug('###########################');
    console.debug('DOM fully loaded and parsed');
    console.debug('###########################');
    DOMfullyLoaded = true;
    //scan_page();
    console.debug("calling getSliderPosition: ");
    getSliderPosition().then(function (position) {
        console.debug("position: " + position);
        // Your code here
    });
    // Your code here
});

// set a global variable to keep track of the page being fully loaded
var pageFullyLoaded = false;
/*
// set a listener for when the page is completely loaded, and then call the function to scan the page
// and call for any yellownotes that may be applicable to the page
 */
// only attach this event listeners to pages where the url has protocol http, https or file
if (window.location.protocol == "http:" || window.location.protocol == "https:" || window.location.protocol == "file:") {
    console.debug("attaching event listener for page fully loaded");

    window.addEventListener('load', function () {
        console.debug('###########################');
        console.debug('Page fully loaded');
        console.debug('###########################');
        pageFullyLoaded = true;
        // only scan the page if required beacuse some yellownotes need it (becasue they are attached to text)
        scan_page();
        console.debug(whole_page_text);
        console.debug("calling getSliderPosition: ");
        getSliderPosition()
        .then(function (position) {
            console.debug("position: " + position);
            return new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({
                    message: {
                        "action": "execute_notesupdate_on_page",
                        "parameters": {
                            "position": position
                        }
                    }
                }, function (response) {
                    console.debug("3.2.5. message sent to background.js with response: " + JSON.stringify(response));
                    resolve();
                });
            });
        })
        .then(function () {
            console.debug("3.2.6. page update completed - delay 2 seconds before proceeding with further actions if any.");
            // Add a 2-second delay before proceeding
            return delay(2000);
        })
        .then(function () {
            // Code to execute after the delay
            console.debug("3.2.7. 2-second delay completed, now proceeding with further actions if any.");
            // Here you can add any further actions that need to be executed after the delay
            console.debug("position: " + position);
            return textnote_update(position);
        })
        .then(function () {
            console.debug("3.2.9. page update completed ");

        })
        .catch(function (error) {
            console.error("An error occurred: " + error);
        });

    });
}

/*
this function carried out the updates to which notes are shown on the page.
The function is called from the local script
 */
function textnote_update(position) {
    if(function_call_debuging)  console.debug("textnote_update.start: " + position);

    return new Promise((resolve, reject) => {
        // chose which function to proceed with
        var shared_secret_to_identify_background_js_to_content_script_NoteSelectedHTML = "Glbx_marker6";
        // console.debug("request0: " + request.action);

        // const position = request.position;
        console.debug("update_notes_on_page, position: " + position);

        if (position == 1 || position == "1") {
            // close all notes on this page - not needed but may be included later
            //console.debug("browsersolutions: " + "close all notes on this page");
            //removeAllNotes();
            resolve(true);
        } else if (position == 2 || position == "2") {
            // close all notes on this page that are not the users' own

            // check for own notes pertaining to this URL
            console.debug("browsersolutions: " + "check for own notes pertaining to this URL");
            getOwnNotes("selection_text");
            //removeSubscribedNotes();
            resolve(true);

            checkValueAndTriggerFunction();

        } else if (position == 3 || position == "3") {
            // get all in-scope notes for this page

            console.debug("browsersolutions: " + "get all in-scope notes for this page");

            getOwnNotes("selection_text");
            getSubscribedNotes("selection_text");
            resolve(true);

        }

    });

    // noteSelectedHTML(request, sender, sendResponse).then(function (res) {
    //       console.debug(res);

    //});

}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



function isUndefined(variable) {
    return typeof variable === 'undefined';
}
// get a unique reference for the URL
var slidertag = getSliderTag();

function getSliderTag() {
    const url = window.location.href.trim();
    var slidertag = ("slidertag_" + url).replace(/[\/:\.]/g, '');
    return slidertag;

}

function getSliderPosition() {
    if(function_call_debuging) console.debug("slidertag: " + slidertag);
    return new Promise((resolve, reject) => {
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
                    resolve(position);

                } else {
                    chrome.runtime.sendMessage({
                        action: "getSliderDefaultPosition"

                    }, function (response) {
                        console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
                        console.debug("setting position to: " + response.defaultSliderPosition);
                        position = response.defaultSliderPosition;
                        console.debug("position: " + position);
                        resolve(position);

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
                    console.debug("position: " + position);
                    resolve(position);
                });
            }
        });
    });

}

document.addEventListener('click', logPosition);

document.addEventListener('touchstart', (event) => {
    console.debug("touch detected: " + event.touches[0].clientX + " " + event.touches[0].clientY);
    if (event.touches.length > 0) {
        logPosition(event.touches[0]);
    }
});

document.addEventListener('touchend', (event) => {
    if (event.touches.length > 0) {
        logPosition(event.touches[0]);
    }
});

/*
Listener for request from background.js
 */
function listener(request, sender, sendResponse) {

    try {
        if(function_call_debuging)  console.debug("request: ");
        if(function_call_debuging)  console.debug(request);
        if(function_call_debuging)  console.debug(request.info);
        if(function_call_debuging)  console.debug(request.tab);
        if(function_call_debuging) console.debug("request.action: ", request.action);
        //console.debug(request.sharedsecret);

        if (!(isUndefined(request.sharedsecret)) && !(isUndefined(request.action))) {

            console.debug("request action: " + request.action);
            // chose which function to proceed with
            // try {
            //    console.debug("selection text: " + request.action.info.selectionText);
            //} catch (e) {
            //    console.error(e);
            // }
            scan_page();
            // has page been scanned ?
            if (!page_scanned) {

                // } else {
                // Carry out scan
                console.debug("browsersolutions call scan_page");
                scan_page();
                page_scanned = true;
            } else {
                console.debug("browsersolutions page already scanned");
                console.debug("textnode_map size: " + textnode_map.length);
            }

            if (request.action === "getPageContent") {
                console.debug("getPageContent");
                capturePageContent(request.url)
                .then(content => {
                    sendResponse({
                        content
                    });
                })
                .catch(error => {
                    console.error("Error capturing page content:", error);
                    sendResponse({
                        error: error.message
                    });
                });
                // Indicate that we want to send a response asynchronously
                return true;
            } else if (request.action == "createnote") {
                // call to create a universal yellownote
                console.debug("calling: create_universal_yellownote");
                create_universal_yellownote(request.info, request.note_type, request.note_template, request.notetype_template, request.note_properties, request.session, request.is_selection_text_connected);

                sendResponse({
                    success: true,
                    data: "value"
                });
                return true;

            } else if (request.action == "createnoteDISABLE") {
                // call to create a yellow note
                console.debug("browsersolutions calling: create_newstickynote_node(...)");
                create_newstickynote_node(request.info, request.note_type, request.note_template, request.notetype_template, request.note_properties, request.session);

                sendResponse({
                    success: true,
                    data: "value"
                });
                return true;
            } else if (request.action == "placeYellowNoteOnPage") {
                console.debug("placeYellowNoteOnPage");
                console.debug(request);

                console.debug("request.session_uuid: " + request.session_uuid);
                console.debug("request.creatorDetails.uuid: " + request.creatorDetails.uuid);
                // if the session id is different fro mthe uuid of the note creator, then the note is not the user's own
                var isOwner = true;
                if (request.session_uuid == request.creatorDetails.uuid) {
                    isOwner = true;
                } else {
                    isOwner = false;
                }
                request.isOwner = isOwner;
                //var cont1 = create_yellownote_DOM(request.note_template, request.notetype_template , "canvas", true, true)
                //console.debug(cont1);
                // check if not is already on the page. If so, move focus to it
                if (isNoteOnPage(request.noteid)) {
                    console.debug("yellownote is already on page");
                    // move focus to note
                    moveFocusToNote(request.noteid);
                } else {
                    console.debug("yellownote is NOT already on page");
                    // call the function that will place the note on the page
                    var note_template = safeParseInnerHTML(request.note_template, 'div');
                    var notetype_template = safeParseInnerHTML(request.notetype_template, 'div');
                    console.debug("calling placeStickyNote");
                    placeStickyNote(request.note_data, request.note_template, request.notetype_template, request.creatorDetails, request.isOwner, false, true)
                    .then(function (res) {
                        console.debug(res);
                        sendResponse({
                            success: true,
                            data: "value"
                        });
                    });
                }
                return true;
            } else if (request.action == "moveFocusToNote") {
                console.debug("calling moveFocusToNote");
                moveFocusToNote(request.noteid).then(function (res) {
                    console.debug(res);
                    sendResponse({
                        success: true,
                    });
                });
                return true;
            } else if (request.action == "initiateSelection") {
                /*
                 * selecting an area of the screen to capture
                 */
                initiateScreenSelection();
                return true;
            } else if (request.action == "update_notes_on_page") {
                console.debug("update_notes_on_page");
                // check if note is on page
                console.debug("isNoteOnPage(" + request.noteid + "): ", isNoteOnPage(request.noteid));

                // chose which function to proceed with
                var shared_secret_to_identify_background_js_to_content_script_NoteSelectedHTML = "Glbx_marker6";
                console.debug("request0: " + request.action);

                if (request.action == "update_notes_on_page") {

                    console.debug("update_notes_on_page, position: " + request.position);

                    page_update(request, sender, sendResponse).then(function (res) {
                        sendResponse({
                            success: true,
                            data: "value"
                        });
                    });
                } else {
                    sendResponse({
                        success: false,
                        data: "value"
                    });
                }
                return true;
            } else if (request.action == "update_single_note_on_page") {
                console.debug("update note with noteid: " + request.noteid);
                // not implemented yet
            } else if (request.action == "disable_single_note") {

                console.debug("disable note with noteid: " + request.noteid);
                // not implemented yet

                // remove the note from the page
                remove_noteid(request.noteid);
                sendResponse({
                    success: false,
                    data: "value"
                });
                return true;

            } else if (request.action == "scroll_to_note") {
                const noteid = request.noteid;
                console.debug("scroll to note with noteid: " + noteid);

                // Find the element by its ID
                const note_root = document.querySelectorAll('[type="yellownote"][noteid="' + noteid + '"]')[0];
                const element = note_root.querySelector('table[name="whole_note_table"]');
                // Check if the element exists
                if (element) {
                    // Scroll the element into view
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                } else {
                    console.debug('Element not found: ' + elementId);
                }
                return true;
            } else if (request.action == "create_and_scroll_to_note") {
                console.debug("create_and_scroll_to_note");
                const noteid = request.noteid;
                console.debug(request);
                console.debug("scroll to note with noteid: " + noteid);
                const notes = request.notes;
                console.debug(notes);
                const note_creatorid = notes.notes_found[0].creatorid;
                const note_type = request.note_type
                    const note_data = JSON.parse(notes.notes_found[0].json);
                const creatorDetails = notes.creatorDetails;
                console.debug("creatorDetails: ");
                console.debug(creatorDetails);
                // make sure the note is there
                const isNewNote = false;

                var selection_text;
                console.debug("calling: scan_page");
                scan_page();
                // console.debug(whole_page_text);
                // console.debug(textnode_map);
                try {
                    selection_text = b64_to_utf8(note_data.selection_text);
                } catch (e) {
                    selection_text = "";
                }
                console.debug("selection_text: " + selection_text);
                // collectec distributionlist id from the note metadata and place it inside the note data object
                note_data.distributionlistid = notes.notes_found[0].distributionlistid;

                // change this to compare authenticated user with creatorid inside note data
                console.debug("note_creatorid: " + note_creatorid);
                console.debug("note_data: creatorid: ", note_data.creatorid);
                console.debug("session_uuid: " + notes.session_uuid);

                var isOwner = true;
                if (notes.session_uuid == note_creatorid) {
                    isOwner = true;
                } else {
                    isOwner = false;
                }

                const moveFocus = true;
                var promiseArray = [];
                if (isNoteOnPage(noteid)) {
                    console.debug("browsersolutions note IS already on page");
                    // move focus to note
                    moveFocusToNote(noteid);
                } else {
                    console.debug("browsersolutions note IS NOT already on page");
                    // has page been scanned ?
                    if (!page_scanned) {

                        // } else {
                        // Carry out scan
                        console.debug("browsersolutions call scan_page");

                        scan_page();
                        page_scanned = true;

                    }
                    // what brand should be used for the note. Set default it nothing else is applicable for this user (this is the user's own notes)
                    var brand = "default";
                    chrome.storage.local.get([plugin_session_header_name]).then(function (session) {
                        brand = get_brand_from_sessiontoken(session[plugin_session_header_name]);
                        if (isUndefined(brand) || brand == null || brand == '' || brand == 'undefined') {
                            brand = "default";
                        }
                        // Collect template
                        console.debug("collect template based on brand (" + brand + "), note type (" + note_type + ")");
                        let promise = new Promise((resolve, reject) => {
                                chrome.runtime.sendMessage({
                                    action: "get_template",
                                    brand: brand,
                                    note_type: note_type
                                }).then(function (response) {
                                    //console.debug("browsersolutions message sent to background.js with response: " + JSON.stringify(response));
                                    const html_note_template = response;
                                    // console.debug("browsersolutions note_template: " + note_template);
                                    //console.debug("browsersolutions resolve");
                                    //var template = safeParseInnerHTML(note_template, 'div');
                                    console.debug("calling placeStickyNote");
                                    placeStickyNote(note_data, html_note_template, html_notetype_template, creatorDetails, isOwner, isNewNote, true).then(function (res) {
                                        console.debug(res);
                                    });
                                    resolve({
                                        note_data,
                                        note_template
                                    });
                                }).catch(reject);
                            });

                        console.debug("notes to be placed: " + promiseArray.length);
                        promiseArray.push(promise);
                        console.debug("notes to be placed: " + promiseArray.length);
                    });
                }
                return true;
            } else if (request.action == "remove_single_note") {
                console.debug("remove note with noteid: " + request.noteid);
                console.debug("browsersolutions calling: remove_noteid");
                remove_noteid(request.noteid);
                sendResponse({
                    success: false,
                    data: "value"
                });
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } catch (e) {
        console.error(e);
    }
}

chrome.runtime.onMessage.addListener(listener);

function initiateScreenSelection() {
    if(function_call_debuging) console.debug("initiateSelection");
    showMessage("Click and drag to select the area for capture.");

    document.addEventListener('mousedown', startSelection);

    console.debug(overlay);

    function showMessage(text) {
        if(function_call_debuging)  console.debug("showMessage");
        const messageBox = document.createElement('div');
        messageBox.style.position = 'absolute';
        messageBox.style.top = '10%';
        messageBox.style.left = '50%';
        messageBox.style.transform = 'translate(-50%, -50%)';
        messageBox.style.padding = '10px';
        messageBox.style.background = 'white';
        messageBox.style.border = '3px solid yellow';
        messageBox.style.zIndex = '10000';
        messageBox.style.display = 'none'; // Initially hidden
        document.body.appendChild(messageBox);
        messageBox.textContent = text;
        messageBox.style.display = 'block'; // Show the message
    }

    function startSelection(event) {
        if(function_call_debuging)  console.debug('Selection started');
        startX = event.pageX;
        startY = event.pageY;

        overlay.style.left = `${startX}px`;
        overlay.style.top = `${startY}px`;
        overlay.style.width = '0px';
        overlay.style.height = '0px';
        overlay.style.display = 'block';

        messageBox.style.display = 'none'; // Hide the message once selection starts

        document.addEventListener('mousemove', expandSelection);
        document.addEventListener('mouseup', endSelection);
    }

    function expandSelection(event) {
        if(function_call_debuging)  console.debug('Expanding selection');
        const currentX = event.pageX;
        const currentY = event.pageY;
        const width = currentX - startX;
        const height = currentY - startY;

        overlay.style.width = `${Math.abs(width)}px`;
        overlay.style.height = `${Math.abs(height)}px`;
        overlay.style.left = `${Math.min(startX, currentX)}px`;
        overlay.style.top = `${Math.min(startY, currentY)}px`;
    }

    function endSelection(event) {
        if(function_call_debuging)  console.debug("Selection ended");
        endX = event.pageX;
        endY = event.pageY;
        document.removeEventListener('mousemove', expandSelection);
        document.removeEventListener('mouseup', endSelection);
        // Capture the selection and process the data
        captureAndProcessSelection(startX, startY, endX, endY);
    }

    function captureAndProcessSelection(x1, y1, x2, y2) {
        console.debug('Capturing and processing selection');
        var datauri;
        console.debug(x1, y1, x2, y2);
        // Placeholder for capturing and processing logic
        const captureData = {
            x1,
            y1,
            x2,
            y2
        }; // Simulated capture data
        var linkedContentUniqueid = "";
        processData(captureData)
        .then(function (processedData) {
            console.debug(processedData);
            datauri = processedData;
            return displayTable(processedData, x1, y1);
        })
        .then(function (id) {
            linkedContentUniqueid = id;
            console.debug("linkedContentUniqueid: " + linkedContentUniqueid);
            // call out to get information about the note over
            const request_msg = {
                message: {
                    "action": "get_note_creator_info"
                }
            };
            console.debug("request to background: ");

            console.debug(request_msg);

            return chrome.runtime.sendMessage(request_msg);

        }).then(function (response) {
            console.debug("message sent to backgroup.js with response: ");
            console.debug(response);
            // call out to create the note
            const note_obj = {};
            var note_template = safeParseInnerHTML(response.note_template, 'div');
            create_stickynote_node(note_obj, note_template, null, response.note_properties, true, true).then(function (res) {
                console.debug("message sent to backgroup.js with response: ");

                // link in the captured image
                res.linkedContentUniqueid = linkedContentUniqueid;
                console.debug(res);
                //
                console.debug("calling: size_and_place_note_based_on_coordinates");
                const newGloveboxNode = size_and_place_note_based_on_coordinates(res, note_obj, creatorDetails, true, true);

                newGloveboxNode.linkedContentUniqueid = linkedContentUniqueid;
                // newGloveboxNode.setAttribute("linkedContentUniqueid", linkedContentUniqueid);
                newGloveboxNode.querySelector('input[type="hidden"][name="captured_image_datauri"]').replaceChildren(document.createTextNode(datauri));

                newGloveboxNode.setAttribute("note_type", "capture_note");
                console.debug("browsersolutions: calling: attachEventlistenersToYellowStickynote");
                attachEventlistenersToYellowStickynote(newGloveboxNode);
                // make some parts visible and other not visible
                console.debug("browsersolutions: makeEditButtonsVisible");
                console.debug("calling setComponentVisibility");
                setComponentVisibility(newGloveboxNode, ",new,.*normalsized");
                newGloveboxNode.setAttribute("button_arrangment", "rw");

                // internal scrolling for webframes
                // Make the stickynote draggable:
                //makeDragable(newGloveboxNode);
                //console.debug("calling makeResizeable");
                //makeResizeable(newGloveboxNode);
                console.debug("calling makeDragAndResize");
                makeDragAndResize(newGloveboxNode, true, true, true);
            });

        })
        .catch(error => console.error("Error processing data:", error));
    }

    function processData(data) {
        console.debug("Processing data...");
        // Simulate processing data and return a promise
        console.debug(data);
        // Send save request back to background to get the required information for creting a blank sticky note
        // Stickynotes are always enabled when created.
        var resp;
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                message: {
                    "action": "create_capture_note",
                    coords: data
                }
            }).then(function (response) {
                resp = response;
                console.debug("message sent to backgroup.js with response: ");
                console.debug(resp);

                // call the function that will crop the image
                return cropImage(resp.dataUrl, data);
            }).then(function (croppedImage) {
                console.debug(croppedImage);
                resolve(croppedImage);
                // update the with the just cropped image
                //   resp.dataUrl = croppedImage;
                //    console.debug(resp);
                // call the function that will set which part of the note will be displayed
                // setComponentVisibility(note_root, ",rw,.*normalsized,");
                //  attachEventlistenersToYellowStickynote(note_root);
            });

        });
    }

    function displayTable(data, x, y) {
        if(function_call_debuging)  console.debug("Displaying table...");
        // Diplay the captured image data on page overlaying the original
        const capturedImageFrameTable = document.createElement('table');
        capturedImageFrameTable.style.position = 'fixed';
        capturedImageFrameTable.style.left = `${x}px`;
        capturedImageFrameTable.style.top = `${y}px`;
        capturedImageFrameTable.style.zIndex = '10001';
        capturedImageFrameTable.innerHTML = `<tr><td>${data.result}</td></tr>`; // Simplified table content


        // give the captured image a visible frame
        // asign the frame a uniqu value to be able to remove it later
        let guid = () => {
            let s4 = () => {
                return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
            };
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        };
        const linkedContentUniqueid = guid();

        return linkedContentUniqueid;
        capturedImageFrameTable.linkedContentUniqueid = linkedContentUniqueid;

        resp.linkedContentUniqueid = linkedContentUniqueid;
        // call the function that will create the note
        console.debug("calling create_newstickynote_node");
        create_newstickynote_node(resp, "capture_note", resp.note_template, resp.note_properties, resp.sessiontoken);

        document.body.appendChild(capturedImageFrameTable);
    }
}

function capturePageContent() {
    if(function_call_debuging) console.debug("capturePageContent.start");
    return new Promise((resolve, reject) => {
        try {
            // Serialize the entire document's HTML
            const htmlContent = document.documentElement.outerHTML;
            resolve(htmlContent);
        } catch (error) {
            reject(error);
        }
    });
}

function capturePageForIframe(url) {
    if(function_call_debuging)  console.debug("capturePageForIframe.start");
    return fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch the URL. Status: ${response.status}`);
        }
        return response.text();
    })
    .then(htmlContent => {
        // Create a Blob from the HTML content
        const blob = new Blob([htmlContent], {
                type: 'text/html'
            });

        // Create a URL for the Blob
        const blobUrl = URL.createObjectURL(blob);

        // Create an iframe
        const iframe = document.createElement('iframe');

        // Set the sandbox attribute for security
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');

        // Set the src attribute to the Blob URL
        iframe.src = blobUrl;

        // Append the iframe to the body (or any other element)
        document.body.appendChild(iframe);

        // Return the Blob URL
        return blobUrl;
    })
    .catch(error => {
        console.error('Error capturing page:', error);
        throw error;
    });
}

/* creates DOM object of the stick note */
function create_universal_yellownote(info, note_type, html_note_template, html_notetype_template, creatorDetails, session, is_selection_text_connected) {

    if(function_call_debuging)  console.debug("create_universal_yellownote.start");
    if(function_call_debuging) console.debug("info:");
    if(function_call_debuging)  console.debug(info);
    if(function_call_debuging) console.debug("note_type: " + note_type);
    if(function_call_debuging) console.debug("is_selection_text_connected: " + is_selection_text_connected);
    // override
    //note_type= "yellownote";


    console.debug("note_properties: ");
    console.debug(creatorDetails);

    const isOwner = true;
    const isNewNote = true;

    /*
    #############################

    Create the note DOM object

     */

    // the root of the note object
    //var note_root = document.createElement('container');

    // var fullURLToCSS = chrome.runtime.getURL("css/yellownote.css");

    // insert the overall note template

    // var note_template = safeParseInnerHTML(html_note_template, 'div');
    // note_template = JSON.parse(html);
    //console.debug(note_template);

    //note_root.setAttribute("class", "yellownotecontainer");
    //note_root.setAttribute("note_type", note_type);
    //note_root.setAttribute("button_arrangment", 'new');

    //note_root.setAttribute("isOwner", isOwner);
    //note_root.setAttribute("isNewNote", isNewNote);

    //note_root.appendChild(note_template);

    var note_root;
    // create the basic outline of the note
    if(function_call_debuging) console.debug("calling: create_yellownote_DOM");
    create_yellownote_DOM(html_note_template, html_notetype_template, note_type, isOwner, isNewNote).
    then(function (response) {
        note_root = response;
        console.debug(note_root);

                /*

        give the note the correct size

        customization of note
        height, width, color, position, etc

        Priority is given to the note-specific object data,
        if not set, parameter specified for the note creator is used;
        If not set, parameter specfied for the brand the creator is part of, is used;
        if not set, the default values are used
        Default values are specified in the template itself
         */

        console.debug(note_root);

        var box_width = default_box_width; // set default value, override with more specific values if available
        // attempt to read size parameters from the note object
        if (creatorDetails.box_width != undefined) {
            console.debug("creator's note_properties has box_width, use it " + creatorDetails.box_width);
            box_width = creatorDetails.box_width;
        } else {
            // brand-level not implemted yet
        }
        note_root.setAttribute("box_width", box_width);

        var box_height = default_box_height; // set default value, override with more specific values if available
        // attempt to read size parameters from the note object
        if (creatorDetails.box_height) {
            console.debug("creator's note_properties has box_height, use it " + creatorDetails.box_height);
            box_height = creatorDetails.box_height;
        } else {
            // brand-level not implemted yet
        }
        note_root.setAttribute("box_height", box_height);

        // set the note_type as selected on the note_type drop-down menu
        note_root.querySelector('select[name="select_notetype"]').value = note_type;

        // update the body of the note which is different for each note type
        if(function_call_debuging) console.debug("calling: updateNoteMiddleBar");
        updateNoteMiddleBar(html_notetype_template, note_root);

        /*
        #####################################

        populate the note DOM with data values
         */

        // create the note object data with suitable initial values for some fields
        var note_object_data = {}
        console.debug("creatorDetails: ");
        console.debug(creatorDetails);
        var userid = "";
        console.debug("session: ");
        console.debug(session);
        // console.debug("selection text: " + info.selectionText);


        var selection_text = "";
        if (is_selection_text_connected) {
            console.debug(info.selectionText);
            console.debug(info.selectionText == undefined);

            try {
                if (!info.selectionText == undefined) {
                    if (info.selectionText != "" && info.selectionText != null) {
                        selection_text = info.selectionText;
                    }
                }
            } catch (e) {
                console.error(e);
            }

            if (selection_text != '') {
                note_root.querySelector('input[type="hidden"][name="selection_text"]').replaceChildren(document.createTextNode(note_object_data.selection_text));
                note_root.querySelector('input[type="hidden"][name="encoded_selection_text"]').replaceChildren(document.createTextNode(utf8_to_b64(note_object_data.selection_text)));
            } else {
                note_root.querySelector('input[type="hidden"][name="selection_text"]').replaceChildren(document.createTextNode(""));
                note_root.querySelector('input[type="hidden"][name="encoded_selection_text"]').replaceChildren(document.createTextNode(""));
            }
        }
        try {

            note_object_data.url = window.location.href;

            if (typeof note_object_data.enabled != undefined) {
                note_object_data.enabled = "true"
            } else {
                // default value if undefined, is enabled(=true)
                note_object_data.enabled = "true"
            }
        } catch (e) {
            console.error(e);
        }
        const note_table = note_root.querySelector('[name="whole_note_table"]');

        console.debug("note_object_data: " + JSON.stringify(note_object_data));

        try {
            // itterate through the data container object in the not and populate them with values from the note_object_data
            // capture local url
            note_root.querySelector('input[type="hidden"][name="url"]').replaceChildren(document.createTextNode(note_object_data.url));
            if (typeof note_object_data.enabled != undefined) {
                note_root.querySelector('input[type="hidden"][name="enabled"]').replaceChildren(document.createTextNode(note_object_data.enabled));
            } else {
                // default value if undefined, is enabled(=true)
                note_root.querySelector('input[type="hidden"][name="enabled"]').replaceChildren(document.createTextNode("true"));
            }
        } catch (e) {
            console.error(e);
        }


        // give the note color
        var highlight_background = "rgb(" + hexToRGB(note_color) + ", 0.25)";

        // what color to use for the note
        var note_color = "#ffff00"; // set default value, override with more specific values if available
        // attempt to read size parameters from the note properties of the creator
        if (creatorDetails.note_color) {
            note_color = creatorDetails.note_color
                console.debug("creator's note_properties has note_color, use it " + note_color);

        } else {
            // brand-level not implemted yet
        }
        //var box_background = "rgb(" + hexToRGB(note_color) + ", 0.7)";
        //console.debug("box_background" + box_background);

        // show/hide elements based on the ower and editing


        // place the note on the page
        console.debug("mouseX: " + mouseX);
        console.debug("mouseY: " + mouseY);

        // place the note there the cursor is placed
        note_root.setAttribute("posx", mouseX + "px");
        note_root.setAttribute("posy", mouseY + "px");

        console.debug("selection_text: " + selection_text);
        console.debug(selection_text);
        console.debug((!isUndefined(selection_text)));
        console.debug(selection_text != null);
        console.debug(selection_text != '');
        // uuid to connect to image inserted (for capture_note)
        var linkedContentUniqueid = "";
        // uuid to connect to the part fo the document that has been highlighted
        var highlightuniqueid = "";

        // is selection_text set ?
        note_object_data.selection_text = selection_text;
        if (selection_text != '') {
            // Usage: Call this function with the text you want to highlight
            console.debug("selection_text: " + selection_text);
            console.debug(selection_text);
            if(function_call_debuging)  console.debug("calling highlightTextOccurrences");

            highlightuniqueid = highlightTextOccurrences_old(selection_text, highlight_background);

            console.debug("Highlights added with ID: ", highlightuniqueid);
            console.debug(document.querySelector('[data-highlight-id="' + highlightuniqueid + '"]'));
            // only include the highlight id with the note object if it is not null
            //if (!isUndefined(highlightuniqueid) && highlightuniqueid != null && highlightuniqueid != '') {
            note_object_data.highlightuniqueid = highlightuniqueid;
            note_root.setAttribute("highlightuniqueid", highlightuniqueid);
            //}


            //note_object_data.message_display_text = selection_text;
        } else {
            // no selection_text
            console.debug("selection_text is not set or is blank: ");

        }
        console.debug("highlightuniqueid: ", highlightuniqueid);

       if(function_call_debuging) console.debug("calling createNoteHeader");
        createNoteHeader(note_object_data, note_root, creatorDetails, isOwner, isNewNote);

        if(function_call_debuging) console.debug("calling createNoteFooter");
        createNoteFooter(note_object_data, note_root, creatorDetails, isOwner, isNewNote).then(function (res) {
            console.debug(res);

            try {
                // set the note_type as selected on the note_type drop-down menu
                const noteTypeSelect = note_root.querySelector('select[name="select_notetype"]');
                console.debug(noteTypeSelect);
                const option_shown = noteTypeSelect.querySelector('option[value="' + note_type + '"]');
                console.debug(option_shown);
                option_shown.setAttribute("selected", "selected");
            } catch (e) {
                console.error(e);
            }
            // set background color of the note
            setNoteColor(creatorDetails, note_root);

            // set sizing
            //console.debug("calling update_note_internal_size");
            //update_note_internal_size(note_root);

            //console.debug("calling highlightTextOccurrences_old")
            //highlightuniqueid = highlightTextOccurrences_old(selection_text, highlight_background);
            //console.debug("highlightuniqueid", highlightuniqueid)

            //console.debug("calling getSelectionTextDOMPosition")
            if (DOM_debug)  console.debug(note_root.outerHTML);

            var doc = window.document;
            var doc_root = doc.documentElement;
            //console.debug(doc_root);

            const insertedNode = doc_root.insertBefore(note_root, doc_root.firstChild);

            if (DOM_debug) console.debug(insertedNode.outerHTML);
            // attach event listeners to buttons and icons

            noteTypeSpecificActions(note_type, insertedNode, info, isOwner, isNewNote);
            //insertedNode.setAttribute("isOwner: ", isOwner);
            //insertedNode.setAttribute("isNewNote: ", isNewNote);
            console.debug("highlightuniqueid: ", highlightuniqueid);
            if (highlightuniqueid && highlightuniqueid !== "0") {
                // selection text was matched in the document
                // place note next to where the text is highlighted


                console.debug("calling size_and_place_note_based_on_texthighlight");
                size_and_place_note_based_on_texthighlight(insertedNode, note_object_data, isOwner, isNewNote);

                insertedNode.setAttribute("highlightuniqueid", highlightuniqueid);
                console.debug(insertedNode);
                console.debug("calling size_and_place_note_based_on_texthighlight");
                size_and_place_note_based_on_texthighlight(insertedNode, note_object_data, creatorDetails, isOwner, isNewNote);

            } else {
                // selection text was not matched in the document, or there is no selection text
                console.debug("selection text was not matched in the document, or there is no selection text");

                // move to the default location on the screen if all else fails
                //inserted.setAttribute("posx", 50);
                //inserted.setAttribute("posy", 50);
                //insertedNode.querySelector('[name="whole_note_table"]').style.left = insertedNode.getAttribute("posx");
                //insertedNode.querySelector('[name="whole_note_table"]').style.top = insertedNode.getAttribute("posy");
                console.debug("calling size_and_place_note_based_on_coordinates");
                size_and_place_note_based_on_coordinates(insertedNode, note_object_data, creatorDetails, isOwner, isNewNote);

            }
            // set the flag that contral which button are shown
            insertedNode.setAttribute("button_arrangment", 'new');

            // call the function that will set which part of the note will be displayed
            console.debug("calling setComponentVisibility");
            setComponentVisibility(insertedNode, ",new,.*normalsized,");

            console.debug("calling noteTypeSpecificActions");
            noteTypeSpecificActions(insertedNode.getAttribute("note_type"), note_root, null, isOwner, isNewNote);

            // move to the default location on the screen if all else fails

            // width
           // console.debug("setting box:width: " + insertedNode.getAttribute("box_width"));
           // if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
           // setCSSAttributeOnNamedElement(insertedNode, 'whole_note_table', 'width', parseInt(insertedNode.getAttribute("box_width"), 10) + "px");
           // // height
           // console.debug("setting box_height: " + insertedNode.getAttribute("box_height"));
           // // since this is a new note, the height is padded by the control/bottom bar

            //if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
        //setCSSAttributeOnNamedElement(insertedNode, 'whole_note_table', 'height', (parseInt(insertedNode.getAttribute("box_height")) + note_owners_control_bar_height) + "px");

            // place focus
            try {
                insertedNode.querySelector('[focus="true"]').focus();
            } catch (e) {
                console.debug(e);
            }

            // call the function that will set which part of the note will be displayed
            //console.debug("calling setComponentVisibility");
            //setComponentVisibility(insertedNode, ",new,.*normalsized,");

            // call the function that set sizing for note-internal compoents
            //console.debug("calling: update_note_internal_size");
            //update_note_internal_size(insertedNode);

            // call the function that will make the note draggable
            //console.debug("calling: makeDragable");
            //makeDragable(insertedNode);

            //console.debug("calling: makeResizeable");
            //makeResizeable(insertedNode);
            console.debug("calling: makeDragAndResize");
            makeDragAndResize(insertedNode, isOwner, isNewNote, true);

            console.debug(insertedNode);
            // attach eventlisteners to the note

            // call the function that will make the note resizeable
            // console.debug("browsersolutions: makeResizeable");

            console.debug("browsersolutions: calling dropdownlist_add_option");
            dropdownlist_add_option(insertedNode, "", "", "");

            // attach eventlisteners to the note ( common to all types of notes)
            attachEventlistenersToYellowStickynote(insertedNode);

            // place focus on the new yellownote
            try {
                if (insertedNode.querySelector('[focus="true"]')) {
                    insertedNode.querySelector('[focus="true"]').focus();
                }
            } catch (e) {
                console.error(e);
            }
        });
        return;

    });
}

function noteTypeSpecificActions(note_type, insertedNode, info, isOwner, isNewNote) {
    if(function_call_debuging) console.debug("calling note type-specific procedures");
    if(function_call_debuging) console.debug("note_type: " + note_type);
    if(function_call_debuging)  console.debug(insertedNode);
    if (DOM_debug) console.debug(insertedNode.outerHTML);
    if(function_call_debuging) console.debug(info);
    if(function_call_debuging) console.debug(isOwner);
    if(function_call_debuging) console.debug(isNewNote);
    if (note_type == "plaintext") {
        // make the message in the textarea touch-n-go
        if(function_call_debuging)  console.debug("calling preparePlainNote");

        preparePlainNote(insertedNode, isOwner, isNewNote);
    } else if (note_type == "plainhtml") {
        if(function_call_debuging)  console.debug("calling preparePlainNote");

        // make the message in the textarea touch-n-go
        preparePlainNote(insertedNode, isOwner, isNewNote);
    } else if (note_type == "yellownote") {
        if(function_call_debuging)  console.debug("calling preparePlainNote");

        // make the message in the textarea touch-n-go
        preparePlainNote(insertedNode, isOwner, isNewNote);
    } else if (note_type == "capture_note") {
        if(function_call_debuging)  console.debug("calling prepareCaptureNote");

        prepareCaptureNote(insertedNode, info, isOwner, isNewNote);
    } else if (note_type == "canvas") {
        if(function_call_debuging)  console.debug("calling prepareWebframeNote");
        prepareCanvasNoteForDrawing(insertedNode, isOwner, isNewNote);
    } else if (note_type == "webframe") {
        if(function_call_debuging)  console.debug("calling prepareWebframeNote");
        prepareWebframeNote(insertedNode, isOwner, isNewNote);
        //
    }
}

function prepareWebframeNote(insertedNode, isOwner, isNewNote){

    if(function_call_debuging) console.debug("prepareWebframeNote.start");

    // set eventlistener on load button

    try {
        const myload_url = (event) => {
            console.debug("myload_url");
            console.debug("calling load_url");
            load_url(event);
            event.stopPropagation();
        };
        // load_url

        var allGoTo1_14 = insertedNode.querySelectorAll('[js_action="load_url"]');
        console.debug(allGoTo1_14);
        for (var i = 0; i < allGoTo1_14.length; i++) {
            allGoTo1_14[i].removeEventListener("click", myload_url);
            allGoTo1_14[i].addEventListener("click", myload_url);
        }

    } catch (e) {
        console.error(e);
    }




}

function prepareCaptureNote(node_root, info) {
    if(function_call_debuging) console.debug("prepareCaptureNote.start");

    // place the note on the orignal capture coordinates
    node_root.setAttribute("posx", info.coords.x1 + "px");
    node_root.setAttribute("posy", info.coords.y1 + "px");
    const img = new Image();
    img.src = info.dataUrl;
    img.style.position = 'fixed';
    img.style.left = overlay.style.left;
    img.style.top = overlay.style.top;
    img.style.width = overlay.style.width;
    img.style.height = overlay.style.height;
    img.style.border = '3px solid yellow';
    img.style.zIndex = '10000';
    console.debug(img);
    // Add a close icon
    const closeIcon = document.createElement('div');
    closeIcon.textContent = '✖'; // Simple text close icon
    closeIcon.style.position = 'absolute';
    closeIcon.style.top = '-3';
    closeIcon.style.right = '-3';
    closeIcon.style.cursor = 'pointer';
    closeIcon.style.zIndex = '10001';
    closeIcon.addEventListener('click', function () {
        console.debug("removing overlay image frame");
        document.documentElement.removeChild(img);
    });

    img.appendChild(closeIcon);
    const ins = document.documentElement.appendChild(img);
    console.debug(ins);
}

function preparePlainNote(node_root, isOwner, isNewNote) {
    if(function_call_debuging) console.debug("preparePlainNote.start");
    if(function_call_debuging) console.debug(node_root);
    if(function_call_debuging) console.debug(isOwner);
    if(function_call_debuging) console.debug(isNewNote);
    try {

        // if the note is new, there should be aplace holder message that vanishes when the user starts typing
        if (isNewNote){
        const textarea = node_root.querySelector('[name="message_display_text"]');
        console.debug(textarea);
        console.debug(textarea.textContent);
        
        // Set initial placeholder text that should vanish when typing begins
        const placeholderText = "write your notes here..";
        textarea.innerHTML = "<div>" + placeholderText + "</div>";

        console.debug(textarea.textContent);
        
        // Attach a focus event listener to remove the text as soon as the textarea gains focus
        textarea.addEventListener('focus', function () {
            console.debug("focus");
            if (textarea.value === placeholderText) {
                textarea.value = '';
            }
        });

        textarea.addEventListener('keydown', (event) => {
            console.log('Key pressed:', event.key);
        });

        // Attach an input event listener to handle the case where the user starts typing
        textarea.addEventListener('input', function () {
            console.debug("input");
            if (textarea.value === '') {
                textarea.value = placeholderText;
            }
        });

        // Attach a blur event to reset placeholder if nothing is typed
        textarea.addEventListener('blur', function () {
            console.debug("blur");

            if (textarea.value === '') {
                textarea.value = placeholderText;
            }
        });
     }
        console.debug("preparePlainNote.end");
    } catch (e) {
        console.error(e);
    }
}

function prepareFrameNote(node_root,  isOwner, isNewNote) {
    if(function_call_debuging) console.debug("prepareFrameNote.start");
    try {}
    catch (e) {
        console.error(e);
    }
}

// call this when the note note type is selected
function updateNoteMiddleBar(html_notetype_template, node_root) {
    if(function_call_debuging) console.debug("updateNoteMiddleBar.start");
    //console.debug(html_notetype_template);
    if(function_call_debuging) console.debug(node_root);
    console.debug(node_root.querySelector('[name]'));
    var notetype_template = safeParseInnerHTML(html_notetype_template, 'div');
    console.debug(notetype_template);
    const nodeToReplace = node_root.querySelector('[name="whole_note_middlebar"]');
    console.debug(nodeToReplace);
    const middle_bar = notetype_template.querySelector('tr[name="whole_note_middlebar"]');
    console.debug(middle_bar);
    //var importedContent = node_root.importNode(middle_bar.documentElement, true);
    //nodeToReplace.parentNode.replaceChild(importedContent, nodeToReplace);
    //nodeToReplace.parentNode.appendChild(middle_bar);
    nodeToReplace.parentNode.insertBefore(middle_bar, nodeToReplace.nextSibling);

    nodeToReplace.remove();

    if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
    setCSSAttributeOnNamedElement(node_root, "whole_note_middlebar", "top", parseInt(frame_note_top_bar_height,10) + 'px');

    console.debug(node_root);
    console.debug("updateNoteMiddleBar.end");
}

function cropImage(base64Image, coords, scale = window.devicePixelRatio) {
    return new Promise((resolve, reject) => {
        // Create an Image element
        const img = new Image();
        img.onload = () => {
            // Create a canvas element
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Calculate the scaled coordinates
            const scaledX1 = coords.x1 * scale;
            const scaledY1 = coords.y1 * scale;
            const scaledWidth = (coords.x2 - coords.x1) * scale;
            const scaledHeight = (coords.y2 - coords.y1) * scale;

            // Set canvas size to the desired crop size (scaled)
            canvas.width = scaledWidth;
            canvas.height = scaledHeight;

            // Draw the image on the canvas, cropped and scaled
            ctx.drawImage(
                img,
                scaledX1, scaledY1, // Start clipping
                scaledWidth, scaledHeight, // Width and height of clipped image
                0, 0, // Place the image at the top left corner of the canvas
                scaledWidth, scaledHeight // Size of the image to use
            );

            // Convert the canvas content into a data URL
            const croppedImageDataURL = canvas.toDataURL("image/png");
            resolve(croppedImageDataURL);
        };

        img.onerror = () => {
            reject(new Error('Failed to load the image for cropping.'));
        };

        // Set the source of the image to the data URL
        img.src = base64Image;
    });
}

/* creates DOM object of the stick note */
function create_newstickynote_node(info, note_type, html, notetype_template, note_properties, session) {

    console.debug("# create_newstickynote_node.start");
    console.debug("info:");
    console.debug(info);

    const isOwner = true;
    const isNewNote = true;
    // create the note object data with suitable initial values for some fields
    var note_object_data = {}
    console.debug("note_properties: ");
    console.debug(note_properties);
    var userid = "";
    console.debug("session: ");
    console.debug(session);
    // console.debug("selection text: " + info.selectionText);

    try {

        // https://www.geeksforgeeks.org/how-to-call-promise-inside-another-promise-in-javascript/

        note_object_data.url = window.location.href;

        if (typeof note_object_data.enabled != undefined) {
            note_object_data.enabled = "true"
        } else {
            // default value if undefined, is enabled(=true)
            note_object_data.enabled = "true"
        }
    } catch (e) {
        console.error(e);
    }

    // render template into a complete note object (with values)

    var node_root = document.createElement('container');

    // var fullURLToCSS = chrome.runtime.getURL("css/yellownote.css");

    var note_template = safeParseInnerHTML(html, 'div');
    // note_template = JSON.parse(html);
    console.debug(note_template);

    node_root.setAttribute("class", "yellownotecontainer");
    node_root.setAttribute("note_type", note_type);
    node_root.setAttribute("button_arrangment", 'new');

    node_root.setAttribute("isOwner", isOwner);
    node_root.setAttribute("isNewNote", isNewNote);

    const note_table = note_template.querySelector('[name="whole_note_table"]');
    //console.debug(note_table);
    /*
    customization of note
    height, width, color, position, etc

    Priority is given to the note-specific object data,
    if not set, parameter specified for the note creator is used;
    If not set, parameter specfied for the brand the creator is part of, is used;
    if not set, the default values are used
    Default values are specified in the template itself
     */

    var box_width = default_box_width; // set default value, override with more specific values if available
    // attempt to read size parameters from the note object
    if (note_table.hasAttribute("box_width")) {
        console.debug("note_table has box_width, use it ");
        box_width = note_table.getAttribute("box_width");
    } else if (note_properties.box_width != undefined) {
        console.debug("creator's note_properties has box_width, use it " + note_properties.box_width);
        box_width = note_properties.box_width;
    } else {
        // brand-level not implemted yet
    }
    node_root.setAttribute("box_width", box_width);

    var box_height = default_box_height; // set default value, override with more specific values if available
    // attempt to read size parameters from the note object
    if (note_table.hasAttribute("box_height")) {
        console.debug("note_table has box_height, use it");
        box_height = note_table.getAttribute("box_height");
    } else if (note_properties.box_height) {
        console.debug("creator's note_properties has box_height, use it " + note_properties.box_height);
        box_height = note_properties.box_height;
    } else {
        // brand-level not implemted yet
    }
    node_root.setAttribute("box_height", box_height);
    //note_table.st

    // what color to use for the note
    var note_color = "#ffff00"; // set default value, override with more specific values if available
    // attempt to read size parameters from the note properties of the creator
    if (note_properties.note_color) {
        note_color = note_properties.note_color
            console.debug("creator's note_properties has note_color, use it " + note_color);

    } else {
        // brand-level not implemted yet
    }
    var box_background = "rgb(" + hexToRGB(note_color) + ", 0.7)";
    console.debug("box_background" + box_background);

    var highlight_background = "rgb(" + hexToRGB(note_color) + ", 0.25)";

    /* where on the page is the note going to be placed ?

    If the not contains coordinates, use them. If not, use the cursor position
     */

    console.debug("mouseX: " + mouseX);
    console.debug("mouseY: " + mouseY);
    var selection_text = "";
    console.debug(info.selectionText);
    console.debug(info.selectionText == undefined);

    try {
        if (!info.selectionText == undefined) {
            if (info.selectionText != "" && info.selectionText != null) {
                selection_text = info.selectionText;
            }
        }
    } catch (e) {
        console.error(e);
    }
    // place the note there the cursor is placed
    node_root.setAttribute("posx", mouseX + "px");
    node_root.setAttribute("posy", mouseY + "px");

    console.debug("selection_text: " + selection_text);
    console.debug(selection_text);
    console.debug((!isUndefined(selection_text)));
    console.debug(selection_text != null);
    console.debug(selection_text != '');
    // uuid to connect to image inserted (for capture_note)
    var linkedContentUniqueid = "";
    // uuid to connect to the part fo the document that has been highlighted
    var highlightuniqueid = "";

    // is selection_text set ?
    note_object_data.selection_text = selection_text;
    if (selection_text != '') {
        // Usage: Call this function with the text you want to highlight
        console.debug("selection_text: " + selection_text);
        console.debug(selection_text);
        console.debug("calling highlightTextOccurrences");

        highlightuniqueid = highlightTextOccurrences_old(selection_text, highlight_background);

        console.debug("Highlights added with ID: ", highlightuniqueid);
        console.debug(document.querySelector('[data-highlight-id="' + highlightuniqueid + '"]'));
        // only include the highlight id with the note object if it is not null
        //if (!isUndefined(highlightuniqueid) && highlightuniqueid != null && highlightuniqueid != '') {
        note_object_data.highlightuniqueid = highlightuniqueid;
        node_root.setAttribute("highlightuniqueid", highlightuniqueid);
        //}


        //note_object_data.message_display_text = selection_text;
    } else {
        // no selection_text
        console.debug("selection_text is not set or is blank: ");

    }
    console.debug("highlightuniqueid: ", highlightuniqueid);

    console.debug("note_object_data: " + JSON.stringify(note_object_data));

    node_root.appendChild(note_template);
    try {
        // itterate through the data container object in the not and populate them with values from the note_object_data

        node_root.querySelector('input[type="hidden"][name="selection_text"]').replaceChildren(document.createTextNode(note_object_data.selection_text));

        if (selection_text != '') {
            node_root.querySelector('input[type="hidden"][name="encoded_selection_text"]').replaceChildren(document.createTextNode(utf8_to_b64(note_object_data.selection_text)));
        } else {
            node_root.querySelector('input[type="hidden"][name="encoded_selection_text"]').replaceChildren(document.createTextNode(""));
        }

        // capture local url
        node_root.querySelector('input[type="hidden"][name="url"]').replaceChildren(document.createTextNode(note_object_data.url));

        if (typeof note_object_data.enabled != undefined) {
            node_root.querySelector('input[type="hidden"][name="enabled"]').replaceChildren(document.createTextNode(note_object_data.enabled));
        } else {
            // default value if undefined, is enabled(=true)
            node_root.querySelector('input[type="hidden"][name="enabled"]').replaceChildren(document.createTextNode("true"));
        }
    } catch (e) {
        console.error(e);

    }

    console.debug("calling createNoteHeader");
    createNoteHeader(note_object_data, node_root, note_properties, isOwner, isNewNote).then(function (res) {
        console.debug(res);

        // set background color of the note
        setBackground(box_background, node_root);

        // set sizing
        console.debug("calling update_note_internal_size");
        update_note_internal_size(node_root);

        // attach event listeners to buttons and icons
        //attachEventlistenersToYellowStickynote(node_root);

        if (note_type == "yellownoteDISABLE") {
            // make the message in the textarea touch-n-go
            try {
                // Grab the textarea element
                const textarea = node_root.querySelector('[name="message_display_text"]');
                console.debug(textarea);
                // Set initial placeholder text that should vanish when typing begins
                const placeholderText = "write your note here..";
                textarea.innerHTML = "<div>" + placeholderText + "</div>";

                // Attach a focus event listener to remove the text as soon as the textarea gains focus
                textarea.addEventListener('focus', function () {
                    if (textarea.value === placeholderText) {
                        textarea.value = '';
                    }
                });

                // Attach an input event listener to handle the case where the user starts typing
                textarea.addEventListener('input', function () {
                    if (textarea.value === '') {
                        textarea.value = placeholderText;
                    }
                });

                // Attach a blur event to reset placeholder if nothing is typed
                textarea.addEventListener('blur', function () {
                    if (textarea.value === '') {
                        textarea.value = placeholderText;
                    }
                });

            } catch (e) {
                console.error(e);
            }
        } else if (note_type == "capture_note") {
            console.debug("capture_note");

            // place the note on the orignal capture coordinates

            node_root.setAttribute("posx", info.coords.x1 + "px");
            node_root.setAttribute("posy", info.coords.y1 + "px");
            const img = new Image();
            img.src = info.dataUrl;
            img.style.position = 'fixed';
            img.style.left = overlay.style.left;
            img.style.top = overlay.style.top;
            img.style.width = overlay.style.width;
            img.style.height = overlay.style.height;
            img.style.border = '3px solid yellow';
            img.style.zIndex = '10000';
            console.debug(img);
            // Add a close icon
            const closeIcon = document.createElement('div');
            closeIcon.textContent = '✖'; // Simple text close icon
            closeIcon.style.position = 'absolute';
            closeIcon.style.top = '-3';
            closeIcon.style.right = '-3';
            closeIcon.style.cursor = 'pointer';
            closeIcon.style.zIndex = '10001';
            closeIcon.addEventListener('click', function () {
                console.debug("removing overlay image frame");
                document.documentElement.removeChild(img);
            });

            img.appendChild(closeIcon);
            const ins = document.documentElement.appendChild(img);
            console.debug(ins);
        } else if (note_type == "webframe") {
            console.debug("webframe");
            //
        } else if (note_type == "canvas") {
            console.debug("canvas");

            // attach sepcific event listeners to the canvas note
            prepareCanvasNote(node_root);

            //

        }

        //console.debug("calling highlightTextOccurrences_old")
        //highlightuniqueid = highlightTextOccurrences_old(selection_text, highlight_background);
        //console.debug("highlightuniqueid", highlightuniqueid)

        //console.debug("calling getSelectionTextDOMPosition")
        console.debug(node_root);

        var doc = window.document;
        var doc_root = doc.documentElement;
        //console.debug(doc_root);

        const insertedNode = doc_root.insertBefore(node_root, doc_root.firstChild);

        console.debug(insertedNode);

        //insertedNode.setAttribute("isOwner: ", isOwner);
        //insertedNode.setAttribute("isNewNote: ", isNewNote);
        console.debug("highlightuniqueid: ", highlightuniqueid);
        if (highlightuniqueid && highlightuniqueid !== "0") {
            // selection text was matched in the document
            // place note next to where the text is highlighted


            console.debug("calling size_and_place_note_based_on_texthighlight");
            size_and_place_note_based_on_texthighlight(insertedNode, note_object_data, isOwner, isNewNote);

            // set the flag that contral which button are shown
            insertedNode.setAttribute("button_arrangment", 'new');

            insertedNode.setAttribute("highlightuniqueid", highlightuniqueid);
            console.debug(insertedNode);
            // call the function that will set which part of the note will be displayed
            console.debug("calling setComponentVisibility");
            setComponentVisibility(insertedNode, ",new,.*normalsized,");

            // call the function that will make the note draggable
            console.debug("calling: makeDragAndResize");
            makeDragAndResize(insertedNode, isOwner, isNewNote, true);

            // attach eventlisteners to the note
            attachEventlistenersToYellowStickynote(insertedNode, isOwner, isNewNote);

            // move to the default location on the screen if all else fails
            //inserted.setAttribute("posx", 50);
            //inserted.setAttribute("posy", 50);
            //insertedNode.querySelector('[name="whole_note_table"]').style.left = insertedNode.getAttribute("posx");
            //insertedNode.querySelector('[name="whole_note_table"]').style.top = insertedNode.getAttribute("posy");
            // width
            console.debug("setting box:width: " + insertedNode.getAttribute("box_width"));
            insertedNode.querySelector('[name="whole_note_table"]').style.width = insertedNode.getAttribute("box_width");

            // height


            console.debug("setting box_height: " + insertedNode.getAttribute("box_height"));
            // since this is a new note, the height is padded by the control bar

            if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
            setCSSAttributeOnNamedElement(insertedNode, 'whole_note_table', 'height', (parseInt(insertedNode.getAttribute("box_height")) + note_owners_control_bar_height) + "px");
                
            // call the function that will make the note resizeable
            // console.debug("browsersolutions: makeResizeable");
            // makeResizeable(inserted);
            console.debug("browsersolutions: calling dropdownlist_add_option");
            dropdownlist_add_option(insertedNode, "", "", "");

            // place focus
            try {
                insertedNode.querySelector('[focus="true"]').focus();
            } catch (e) {
                console.debug(e);
            }

        } else {
            // selection text was not matched in the document, or there is no selection text
            console.debug("selection text was not matched in the document, or there is no selection text");

            // move to the default location on the screen if all else fails
            //inserted.setAttribute("posx", 50);
            //inserted.setAttribute("posy", 50);
            //insertedNode.querySelector('[name="whole_note_table"]').style.left = insertedNode.getAttribute("posx");
            //insertedNode.querySelector('[name="whole_note_table"]').style.top = insertedNode.getAttribute("posy");

        }

        // call the function that will set which part of the note will be displayed
        console.debug("calling setComponentVisibility");
        setComponentVisibility(insertedNode, ",new,.*normalsized,");

        // call the function that will make the note draggable
        console.debug("browsersolutions: makeDragAndResize");
        makeDragAndResize(insertedNode, isOwner, isNewNote, true);

        console.debug(insertedNode);
        // attach eventlisteners to the note
        attachEventlistenersToYellowStickynote(insertedNode);

        // call the function that will make the note resizeable
        // console.debug("browsersolutions: makeResizeable");
        // makeResizeable(inserted);
        console.debug("browsersolutions: calling dropdownlist_add_option");
        dropdownlist_add_option(insertedNode, "", "", "");

        // place focus on the new yellownote
        try {
            insertedNode.querySelector('[focus="true"]').focus();
        } catch (e) {
            console.error(e);
        }

    }).catch(function (err) {
        console.error(err);
    });

}

function save_new_note(event) {
    console.debug("# save_new_note.start (event)");
    console.debug(event);

    // save note to database
    try {
        // get the table node that is the root of the note data.

        var note_root = getYellowStickyNoteRoot(event.target);
        console.debug(note_root);

        // get note type which will determine which fields to read
        const note_type = note_root.getAttribute("note_type");
        console.debug("note_type: " + note_type);
        // var note_table = event.target.parentNode.parentNode.parentNode;
        // console.debug(note_table);
        console.debug(note_root.querySelectorAll('input[name="selection_text"]').length);
        console.debug(note_root.querySelector('input[name="selection_text"]').textContent.trim());

        var selection_text = "";
        try {
            selection_text = note_root.querySelectorAll('input[name="selection_text"]')[0].textContent.trim();
        } catch (e) {
            // set default, current timestamp
            selection_text = ""
        }
        if (note_root.querySelector('input[name="selection_text"]').textContent.trim() == undefined) {
            console.debug("selection_text is undefined");
            selection_text = "";
        }
        console.debug(selection_text);

        var url = "";
        try {
            url = window.location.href;
            //url = note_root.querySelectorAll('input[name="url"]')[0].textContent.trim();
        } catch (e) {
            // set default, local url

        }

        // new notes do not have a noteid and it one does it is not a new note
        var noteid = null;
        console.debug("noteid: " + noteid);
        try {
            noteid = note_root.querySelector('input[name="noteid"]').textContent.trim();
        } catch (e) {}
        console.debug("noteid: " + noteid);
        // only proceed if there is no noteid set - this note should not be created in this function
        if (noteid == null || noteid == "" || noteid == undefined || noteid == "undefined") {

            var distributionlistid;
            try {
                distributionlistid = note_root.querySelector('[name="distributionlistdropdown"]').value;
                console.debug('Selected distributionlistid:', distributionlistid);

                // update the note object root DOM node with the distribution list id
                note_root.setAttribute("distributionlistid", distributionlistid);

                // update the goto-link (can't be done since the noteID not yet finalized  )
                // var goto_link = note_root.querySelector('[name="goto_notetarget_link"]');
                // goto_link.setAttribute("href", "https://www.yellownotes.cloud/pages/subscribe.html?add_distributionlistid=" + distributionlistid + "&redirecturi=%2Fpages%2Fgothere.html%3Fnoteid%3D" + noteid);


            } catch (e) {
                console.error(e);
            }

            var message_display_text = "";
            try {
                message_display_text = note_root.querySelector('[name="message_display_text"]').innerHTML;

            } catch (e) {
                console.debug(e);
            }

            var enabled = "";
            try {
                enabled = note_root.querySelectorAll('input[name="enabled"]')[0].textContent.trim();
            } catch (e) {
                // set default
                console.debug(e);
                enabled = true;
            }

            var canvas_uri = "";
            if (note_type == "canvas") {
                var canvas;
                try {
                    canvas = note_root.querySelector('[name="canvas"]');
                    console.debug(canvas);
                    canvas_uri = canvas.toDataURL('image/png');
                    console.debug(canvas_uri);
                } catch (e) {
                    console.debug(e);
                }
            }
            // update lastmodified timestamp every time
            var lastmodifiedtime = getCurrentTimestamp();

            // read out position parameters
            console.debug(note_root);
            var posx = note_root.getAttribute("posx");
            if (posx == null || posx == undefined) {
                posx = "0px";
            }
            var posy = note_root.getAttribute("posy");
            if (posy == null || posy == undefined) {
                posy = "0px";
            }
            var box_height = note_root.getAttribute("box_height");
            if (box_height == null || box_height == undefined) {
                box_height = default_box_height;
            }
            var box_width = note_root.getAttribute("box_width");
            if (box_width == null || box_width == undefined) {
                box_width = default_box_width;
            }

            console.debug("posy: " + posy);

            console.debug("message_display_text: " + message_display_text);
            console.debug("url: " + url);

            console.debug("selection_text: " + selection_text);
            console.debug("canvas_uri: " + canvas_uri);
            var base64data = utf8_to_b64(selection_text);
            //console.debug(utf8_to_b64(selection_text));

            var json_create = {
                message_display_text: utf8_to_b64(message_display_text),
                selection_text: base64data,
                canvas_uri: canvas_uri,
                url: url,
                enabled_status: 1,
                distributionlistid: distributionlistid,
                note_type: note_type,
                posx: posx,
                posy: posy,
                box_width: box_width,
                box_height: box_height
            };

            var captured_image_datauri = "";
            if (note_type == "webframe") {
                // capture the scroll position of the iframe
                var framenote_scroll_x = note_root.querySelector('[name="fakeiframe"]').scrollLeft.toString();
                if (framenote_scroll_x == null || framenote_scroll_x == undefined) {
                    framenote_scroll_x = 0;
                }
                json_create.framenote_scroll_x = framenote_scroll_x;
                var framenote_scroll_y = note_root.querySelector('[name="fakeiframe"]').scrollTop.toString();
                if (framenote_scroll_y == null || framenote_scroll_y == undefined) {
                    framenote_scroll_y = 0;
                }
                json_create.framenote_scroll_y = framenote_scroll_y;
            } else if (note_type == "capture_note") {
                // get the image data

                try {
                    captured_image_datauri = note_root.querySelectorAll('[name="captured_image_datauri"]')[0].textContent.trim();
                    //console.debug("captured_image_datauri: " + captured_image_datauri);
                    json_create.captured_image_datauri = captured_image_datauri;
                } catch (e) {
                    console.error(e);
                }
            }
            console.debug(JSON.stringify(json_create));

            // Send save request back to background
            // Stickynotes are always enabled when created.

            const save_new_msg = {
                message: {
                    "action": "single_create",
                    "create_details": json_create
                }
            }
            console.debug("save_new_msg:");
            console.debug(save_new_msg);

            chrome.runtime.sendMessage(save_new_msg, function (response) {
                console.debug("message sent to backgroup.js with response: ");
                console.debug(response);

                // read the noteid assigned to this note that returned from the API service
                var noteid = response.noteid;
                console.debug("noteid: " + noteid);

                note_root.querySelector('input[type="hidden"][name="noteid"]').replaceChildren(document.createTextNode(noteid));
                note_root.setAttribute("noteid", noteid);
                distributionlistid = note_root.getAttribute("distributionlistid");
                // update the goto-link (can be done since the noteID is now known  )
                var goto_link = note_root.querySelector('[name="goto_notetarget_link"]');
                goto_link.setAttribute("href", "https://www.yellownotes.cloud/pages/subscribe.html?add_feedid=" + distributionlistid + "&redirecturi=%2Fpages%2Fgothere.html%3Fnoteid%3D" + noteid);

                // call the function that will set which part of the note will be displayed
                setComponentVisibility(note_root, ",rw,.*normalsized,");

                attachEventlistenersToYellowStickynote(note_root);

            });
        } else {
            console.debug("browsersolutions noteid has already been set - not creating new note, and potentially a conflict");
        }
    } catch (e) {
        console.error(e);
    }
}

function dropdownlist_add_option(node_root, dropdownlist, option_text, option_value) {
    console.debug("# dropdownlist_add_option");
    console.debug(node_root);
    try {
        // check if the template contains a dropdown list, if so populate it with the available distribution lists
        const dl_container = node_root.querySelector('[name="distributionlistdropdowncontainer"]');
        console.debug(dl_container);
        //dl_container.replaceChildren(document.createTextNode("loading..."));
// remove the existing select elements from the list
        const selectElement = dl_container.querySelectorAll('option');
        console.debug(selectElement);
        if (selectElement) {
            selectElement.remove();
        }

        console.debug("calling get_distributionlist");
        get_distributionlist().then(function (response) {
            console.debug("get_distributionlist message sent to background.js with response: " + JSON.stringify(response));
            const selectElement = node_root.querySelector('[name="distributionlistdropdown"]');
            // const selectElement = node_root.getElementById('distributionlistdropdown');
            console.debug(selectElement);
            // create the option to have no discribution (this is the default)
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'do not share';
            selectElement.appendChild(option);

            response.forEach(item => {
                console.debug(item);
                const option = document.createElement('option');
                option.value = item.distributionlistid;
                option.textContent = `${item.name} ${item.description}`;
                selectElement.appendChild(option);
            });
            console.debug(selectElement);
            dl_container.appendChild(selectElement);
            console.debug(dl_container.outerHTML);
        });
    } catch (e) {
        console.error(e);
    }
}

function createDistributionlistDropdown(node_root, dropdownlist, option_text, option_value) {
    // create DOM object of the distribution list dropdown
    console.debug("# createDistributionlistDropdown");
    console.debug(node_root);
    console.debug(dropdownlist);
    console.debug(option_text);

    // check if the tempate contains a dropdown list, if so pupulate it with the available distribution lists
    const dl_container = node_root.querySelector('[name="distributionlistdropdowncontainer"]');
    console.debug(dl_container);
    dl_container.replaceChildren(document.createTextNode("loading..."));

    // 	<select name="distributionlistdropdown" style="max-width: 100px; font-size: 1.0rem; padding: 0px; background: rgba(255, 255, 255, 0.8);"></select>
    const dl = document.createElement('select');
    dl.setAttribute("name", "distributionlistdropdown");
    dl.setAttribute("style", "max-width: 100px; font-size: 1.0rem; padding: 0px; background: rgb(255, 255, 255, 0.8);");
    dl_container.appendChild(dl);

}

function haveValidXYPositons(node_root) {
    return true

}


function getXYPositionOfDOMElement(element) {
    console.debug("getXYPositionofDOMElement");
    console.debug("mouseX: ", mouseX, " mouseY: ", mouseY);
    // Get the position of the element
    const rect = element.getBoundingClientRect();
    const t = rect.top;
    const l = rect.left;
    const scroll_x = window.scrollX;
    const scroll_y = window.scrollY;
    console.debug("t: ", t, " l:", l, " scroll_x:", scroll_x, " scroll_y:", scroll_y);
    // Coordinates
    const top = t + scroll_y;
    const left = l + scroll_x;
    const out = {
        left: l,
        top: t,
        posx: mouseX,
        posy: mouseY
    };
    console.debug(out);
    return out;
}

function highlightTextOccurrences_old(selection_text, rgbcolor) {
    console.debug("highlightTextOccurrences_old with ", rgbcolor);
    // Generate a unique ID for this operation
    var uniqueId = 'highlight-' + Date.now();

    let startNode = null;
    let endNode = null;
    let startPos = -1;
    let endPos = -1;
    let found = false;

    console.debug("calling: getDOMplacement");
    // find where in the DOM the selection text is found (if at all)
    var {
        selection_matched_in_document,
        start_range_node,
        start_offset,
        end_range_node,
        end_offset,
        textnodelist
    } = getDOMplacement(selection_text);

    console.debug("selection_matched_in_document: " + selection_matched_in_document);
    console.debug("browsersolutions: start_range_node: ");
    console.debug(start_range_node);
    console.debug("start_offset: " + start_offset);
    console.debug(end_range_node);
    console.debug("end_offset: " + end_offset);
    console.debug(textnodelist);
    //console.debug("browsersolutions: nodesAreIdentical:" + nodesAreIdentical(start_range_node, end_range_node));


    if (start_range_node == null) {
        // No match. return nothing
        uniqueId = "";
    } else {

        let seqNum = 1;
        var nodecount = textnodelist.length;
        console.debug("nodecount: " + nodecount);

        if (nodecount == 0) {
            // also no match. return nothing
            uniqueId = "";
            // one one node
        } else if (nodecount == 1) {
            // the text to highlight is inside one node
            const textContent = start_range_node.nodeValue;
            console.debug(textContent);
            // Split the text node
            const firstPart = textContent.slice(0, start_offset);
            console.debug("first part: ", firstPart);
            const to_highlight_text = textContent.slice(start_offset, end_offset);
            console.debug("highlight part: ", to_highlight_text);
            const thirdPart = textContent.slice(end_offset);
            console.debug("last part: ", thirdPart);

            const firstSpan = document.createElement('span');
            firstSpan.textContent = firstPart;

            const secondSpan = document.createElement('span');
            // Create the highlight element
            const highlight = document.createElement('mark');
            highlight.textContent = to_highlight_text;
            highlight.style.backgroundColor = rgbcolor;
            highlight.setAttribute('data-highlight-id', uniqueId);
            highlight.setAttribute('data-sequence-number', seqNum++);

            // Append the highlight to the span and replace the text node with the span
            secondSpan.appendChild(highlight);
            // shrink the node to contain only the text that should not be highlighted
            start_range_node.textContent = firstPart;

            // append the node with highlights
            if (start_range_node.nextSibling) {
                start_range_node.parentNode.insertBefore(secondSpan, start_range_node.nextSibling);
            } else {
                start_range_node.parentNode.appendChild(secondSpan);
            }

            // append the node with the remaining text
            const thirdSpan = document.createElement('span');
            thirdSpan.textContent = thirdPart;
            if (start_range_node.nextSibling) {
                start_range_node.parentNode.insertBefore(thirdSpan, secondSpan.nextSibling);
            } else {
                start_range_node.parentNode.appendChild(thirdSpan);
            }

        } else if (nodecount == 2) {
            // two nodes

            // first node
            var n = 0;
            //console.debug(start_range_node);
            const secondSpan = document.createElement('span');
            const textContent = start_range_node.nodeValue;
            //console.debug(textContent);
            // Split the text node
            const unhighligt_remainder = textContent.slice(0, start_offset);
            console.debug("unhighlighted: ", unhighligt_remainder);
            const to_highlight_text = textContent.slice(start_offset);
            console.debug("highlighted part: ", to_highlight_text);

            const firstSpan = document.createElement('span');
            firstSpan.textContent = unhighligt_remainder;

            // Create the highlight element
            const highlight = document.createElement('mark');
            highlight.textContent = to_highlight_text;
            highlight.style.backgroundColor = rgbcolor;
            highlight.setAttribute('data-highlight-id', uniqueId);
            highlight.setAttribute('data-sequence-number', seqNum++);

            // Append the highlight to the span and replace the text node with the span
            secondSpan.appendChild(highlight);
            start_range_node.textContent = unhighligt_remainder;

            if (start_range_node.nextSibling) {
                start_range_node.parentNode.insertBefore(secondSpan, start_range_node.nextSibling);
            } else {
                start_range_node.parentNode.appendChild(secondSpan);
            }

            // second node
            // last node
            //console.debug(textnodelist);
            //console.debug("last node: ", n);
            n--;
            // console.debug(textnodelist[n]);
            // console.debug(textnodelist[n].parentNode);
            //console.debug("end_offset: ", end_offset);
            //console.debug(end_range_node);
            //console.debug(end_range_node.parentNode);
            //const secondSpan2  = document.createElement('span');
            const firstSpan2 = document.createElement('span');
            const textContent2 = end_range_node.nodeValue;
            //console.debug(textContent2);
            // Split the text node
            const firstPart2 = textContent2.slice(0, end_offset);
            console.debug("highlighted part: ", firstPart2);
            //const secondPart2 = textContent2.slice(end_offset);
            //console.debug(secondPart2);

            //secondSpan2.textContent = secondPart2;

            // Create the highlight element
            const highlight2 = document.createElement('mark');
            highlight2.textContent = firstPart2;
            highlight2.style.backgroundColor = rgbcolor;
            highlight2.setAttribute('data-highlight-id', uniqueId);
            highlight2.setAttribute('data-sequence-number', seqNum++);

            // Append the highlight to the span and replace the text node with the span
            firstSpan2.appendChild(highlight2);
            //console.debug(firstSpan2);
            //console.debug(secondSpan2);
            const remainder2 = textContent2.substring(end_offset);
            console.debug("unhighlighted remainder", remainder2);
            end_range_node.textContent = remainder2;
            //end_range_node.parentNode.replaceChild(secondSpan2, end_range_node);
            end_range_node.parentNode.insertBefore(firstSpan2, end_range_node);

        } else {

            // three or more nodes


            // first node
            var n = 0;
            //console.debug(start_range_node);
            const secondSpan = document.createElement('span');
            const textContent = start_range_node.nodeValue;
            //console.debug(textContent);
            // Split the text node
            const unhighligt_remainder = textContent.slice(0, start_offset);
            //console.debug(firstPart);
            const to_highlight_text = textContent.slice(start_offset);
            //console.debug(secondPart);

            const firstSpan = document.createElement('span');
            firstSpan.textContent = unhighligt_remainder;

            // Create the highlight element
            const highlight = document.createElement('mark');
            highlight.textContent = to_highlight_text;
            highlight.style.backgroundColor = rgbcolor;
            highlight.setAttribute('data-highlight-id', uniqueId);
            highlight.setAttribute('data-sequence-number', seqNum++);

            // Append the highlight to the span and replace the text node with the span
            secondSpan.appendChild(highlight);
            start_range_node.textContent = unhighligt_remainder;

            if (start_range_node.nextSibling) {
                start_range_node.parentNode.insertBefore(secondSpan, start_range_node.nextSibling);
            } else {
                start_range_node.parentNode.appendChild(secondSpan);
            }

            // "middle" nodes

            for (var i = 1; i < (nodecount - 1); i++) {
                n++;
                console.debug("middle node: ", n);
                console.debug(textnodelist);
                console.debug(textnodelist[i]);
                console.debug(textnodelist[i].parentNode);
                // check if this textnode has the same parent and the previous text node
                console.debug(nodesAreIdentical(textnodelist[i - 1], textnodelist[i]));
                if (nodesAreIdentical(textnodelist[i - 1], textnodelist[i])) {
                    // textnodelist[i].remove();
                    // delete textnodelist[i];
                    textnodelist.splice(i, 1);
                    i--;
                    n--;
                } else {
                    addHighlighting(textnodelist[i], seqNum++);
                }
            }

            // last node
            //console.debug(textnodelist);
            //console.debug("last node: ", n);
            n--;
            // console.debug(textnodelist[n]);
            // console.debug(textnodelist[n].parentNode);
            //console.debug("end_offset: ", end_offset);
            //console.debug(end_range_node);
            //console.debug(end_range_node.parentNode);
            //const secondSpan2  = document.createElement('span');
            const firstSpan2 = document.createElement('span');
            const textContent2 = end_range_node.nodeValue;
            //console.debug(textContent2);
            // Split the text node
            const firstPart2 = textContent2.slice(0, end_offset);
            //console.debug(firstPart2);
            //const secondPart2 = textContent2.slice(end_offset);
            //console.debug(secondPart2);

            //secondSpan2.textContent = secondPart2;

            // Create the highlight element
            const highlight2 = document.createElement('mark');
            highlight2.textContent = firstPart2;
            highlight2.style.backgroundColor = rgbcolor;
            highlight2.setAttribute('data-highlight-id', uniqueId);
            highlight2.setAttribute('data-sequence-number', seqNum++);

            // Append the highlight to the span and replace the text node with the span
            firstSpan2.appendChild(highlight2);
            //console.debug(firstSpan2);
            //console.debug(secondSpan2);
            const remainder2 = textContent2.substring(end_offset);
            //console.debug(remainder2);
            end_range_node.textContent = remainder2;
            //end_range_node.parentNode.replaceChild(secondSpan2, end_range_node);
            end_range_node.parentNode.insertBefore(firstSpan2, end_range_node);

        }

        textnodelist.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== '') {
                // Create a span element to wrap the text node
                //addHighlighting(node, seqNum++);
            }
        });

        // get the position of the selection text in the document
        // console.debug("calling getSelectionTextDOMPosition: ");
        // const one = getSelectionTextDOMPosition(selection_text);
        //  console.debug(one);

        // get a list of nodes that contain the selection text

        // wrap each node in a span with a unique id and a sequence number


        return uniqueId;

        function addHighlighting(node, count) {
            const span = document.createElement('span');
            const textContent = node.nodeValue;

            // Create the highlight element
            const highlight = document.createElement('mark');
            highlight.textContent = textContent;
            highlight.style.backgroundColor = rgbcolor;
            highlight.setAttribute('data-highlight-id', uniqueId);
            highlight.setAttribute('data-sequence-number', count);

            // Append the highlight to the span and replace the text node with the span
            span.appendChild(highlight);
            node.parentNode.replaceChild(span, node);
        }
    }
}

function DELETEhighlightTextOccurrences(text, rgbcolor) {
    console.debug("highlightTextOccurrences with ", rgbcolor);
    // Generate a unique ID for this operation
    const uniqueId = 'highlight-' + Date.now();

    // Escape special characters for use in a regular expression
    const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    console.debug(escapedText);

    // Create a regular expression to match the text ignoring whitespace
    const regex = new RegExp(escapedText.replace(/\s+/g, '\\s*'), 'i'); // Match first occurrence only

    console.debug(regex);

    let startNode = null;
    let endNode = null;
    let startPos = -1;
    let endPos = -1;
    let found = false;

    function highlightNode(node, seqNum = 1) {
        if (found)
            return seqNum;

        if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== '') {
            const textContent = node.nodeValue;
            const match = regex.exec(textContent);

            if (match) {
                const span = document.createElement('span');
                const beforeText = textContent.slice(0, match.index);
                const matchedText = match[0];
                const afterText = textContent.slice(match.index + matchedText.length);

                span.appendChild(document.createTextNode(beforeText));

                const highlight = document.createElement('mark');
                highlight.textContent = matchedText;
                highlight.style.backgroundColor = rgbcolor;
                highlight.setAttribute('data-highlight-id', uniqueId);
                highlight.setAttribute('data-sequence-number', seqNum++);
                span.appendChild(highlight);

                span.appendChild(document.createTextNode(afterText));
                node.parentNode.replaceChild(span, node);

                startNode = node;
                endNode = node;
                startPos = match.index;
                endPos = match.index + matchedText.length;

                found = true;
                return seqNum;
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            let children = Array.from(node.childNodes);
            for (let child of children) {
                seqNum = highlightNode(child, seqNum);
                if (found)
                    break;
            }
        }
        return seqNum;
    }

    function handleTextSpanningNodes(node, seqNum = 1) {
        let textBuffer = '';
        const nodesToHighlight = [];

        function collectTextNodes(currentNode) {
            if (currentNode.nodeType === Node.TEXT_NODE && currentNode.nodeValue.trim() !== '') {
                textBuffer += currentNode.nodeValue;
                nodesToHighlight.push(currentNode);
            } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
                currentNode.childNodes.forEach(child => {
                    collectTextNodes(child);
                });
            }
        }

        collectTextNodes(node);

        const match = regex.exec(textBuffer);
        if (match) {
            let remainingLength = match[0].length;
            let startIdx = match.index;

            for (let i = 0; i < nodesToHighlight.length; i++) {
                const textNode = nodesToHighlight[i];
                const nodeValueLength = textNode.nodeValue.length;

                if (startIdx < nodeValueLength) {
                    const span = document.createElement('span');
                    let part = document.createTextNode(textNode.nodeValue.slice(0, startIdx));
                    span.appendChild(part);
                    while (remainingLength > 0 && i < nodesToHighlight.length) {
                        const nodePart = nodesToHighlight[i];
                        const partLength = nodePart.nodeValue.length;
                        const highlightPart = document.createElement('mark');

                        if (remainingLength <= partLength - startIdx) {
                            highlightPart.textContent = nodePart.nodeValue.slice(startIdx, startIdx + remainingLength);
                            highlightPart.style.backgroundColor = rgbcolor;
                            highlightPart.setAttribute('data-highlight-id', uniqueId);
                            highlightPart.setAttribute('data-sequence-number', seqNum++);
                            span.appendChild(highlightPart);

                            const remainingPart = document.createTextNode(nodePart.nodeValue.slice(startIdx + remainingLength));
                            span.appendChild(remainingPart);

                            nodePart.nodeValue = ''; // Clear the processed part

                            startNode = nodesToHighlight[0];
                            endNode = nodePart;
                            startPos = match.index;
                            endPos = match.index + match[0].length;

                            found = true;
                            break;
                        } else {
                            highlightPart.textContent = nodePart.nodeValue.slice(startIdx);
                            highlightPart.style.backgroundColor = rgbcolor;
                            highlightPart.setAttribute('data-highlight-id', uniqueId);
                            highlightPart.setAttribute('data-sequence-number', seqNum++);
                            span.appendChild(highlightPart);

                            remainingLength -= (partLength - startIdx);
                            startIdx = 0;
                            nodePart.nodeValue = ''; // Clear the processed part
                        }

                        i++;
                    }

                    textNode.parentNode.replaceChild(span, textNode);
                } else {
                    startIdx -= nodeValueLength;
                }
            }
        }
    }

    handleTextSpanningNodes(document.body);
    console.debug(startNode);
    console.debug(startPos);
    console.debug(endNode);
    console.debug(endPos);
    //return { uniqueId, startNode, endNode, startPos, endPos };
    return uniqueId;
}

function DELETEhighlightTextOccurrences3(text, rgbcolor) {
    console.debug("highlightTextOccurrences with ", rgbcolor);
    console.debug("highlightTextOccurrences in ", text);
    // Generate a unique ID for this operation
    const uniqueId = 'highlight-' + Date.now();

    // Escape special characters for use in a regular expression
    const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    console.debug(escapedText);

    // Create a regular expression to match the text ignoring whitespace
    const regex = new RegExp(escapedText.replace(/\s+/g, '\\s*'), 'gi');

    console.debug(regex);

    // Function to recursively search text nodes and highlight text

    function highlightNode(node, seqNum = 1) {
        if (node.nodeType === Node.TEXT_NODE) {
            var m = 0;
            let remainingText = node.nodeValue.replace(/\s+/g, ' ');
            let match;
            const span = document.createElement('span');
            let lastIdx = 0;
            while ((match = regex.exec(remainingText)) !== null) {
                console.debug("m=", m);
                m++;
                const beforeText = remainingText.slice(0, match.index);
                const matchedText = match[0];
                const afterText = remainingText.slice(match.index + matchedText.length);

                span.appendChild(document.createTextNode(beforeText));

                const highlight = document.createElement('mark');
                highlight.textContent = matchedText;
                highlight.style.backgroundColor = rgbcolor;
                highlight.setAttribute('data-highlight-id', uniqueId);
                highlight.setAttribute('data-sequence-number', seqNum++);
                span.appendChild(highlight);

                remainingText = afterText;
                regex.lastIndex = 0; // Reset the regex index for the next match
            }

            span.appendChild(document.createTextNode(remainingText));
            node.parentNode.replaceChild(span, node);

            return seqNum;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            let children = Array.from(node.childNodes);
            children.forEach(child => {
                seqNum = highlightNode(child, seqNum);
            });
        }
        return seqNum;
    }

    function handleTextSpanningNodes(node, seqNum = 1) {
        let textBuffer = '';
        const nodesToHighlight = [];

        function collectTextNodes(currentNode) {
            if (currentNode.nodeType === Node.TEXT_NODE) {
                textBuffer += currentNode.nodeValue.replace(/\s+/g, ' ');
                nodesToHighlight.push(currentNode);
            } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
                currentNode.childNodes.forEach(child => {
                    collectTextNodes(child);
                });
            }
        }

        collectTextNodes(node);
        console.debug(textBuffer);

        let match;
        let k = 0;
        while ((match = regex.exec(textBuffer)) !== null) {
            console.debug("k=", k);
            k++;
            console.debug(match[0]);
            let remainingLength = match[0].length;
            let startIdx = match.index;
            let j = 0;
            for (let i = 0; i < nodesToHighlight.length; i++) {
                console.debug("j=", j);
                j++;
                const textNode = nodesToHighlight[i];
                console.debug(textNode);
                const nodeValueLength = textNode.nodeValue.replace(/\s+/g, ' ').length;
                console.debug("nodeValueLength=", nodeValueLength);
                if (startIdx < nodeValueLength) {
                    const span = document.createElement('span');
                    let part = document.createTextNode(textNode.nodeValue.slice(0, startIdx));
                    span.appendChild(part);
                    while (remainingLength > 0 && i < nodesToHighlight.length) {
                        const nodePart = nodesToHighlight[i];
                        console.debug(nodePart);
                        console.debug((new RegExp(/^\s+$/)).test(nodePart));
                        console.debug(nodePart.nodeValue);
                        console.debug((new RegExp(/^\s+$/)).test(nodePart.nodeValue));
                        if (!(new RegExp(/^\s+$/)).test(nodePart.nodeValue)) {
                            // if (nodePart.nodeValue === null) {
                            const partLength = nodePart.nodeValue.replace(/\s+/g, ' ').length;
                            const highlightPart = document.createElement('mark');

                            if (remainingLength <= partLength - startIdx) {
                                highlightPart.textContent = nodePart.nodeValue.slice(startIdx, startIdx + remainingLength);
                                highlightPart.style.backgroundColor = rgbcolor;
                                highlightPart.setAttribute('data-highlight-id', uniqueId);
                                highlightPart.setAttribute('data-sequence-number', seqNum++);
                                span.appendChild(highlightPart);

                                const remainingPart = document.createTextNode(nodePart.nodeValue.slice(startIdx + remainingLength));
                                span.appendChild(remainingPart);

                                nodePart.nodeValue = ''; // Clear the processed part
                                break;
                            } else {
                                highlightPart.textContent = nodePart.nodeValue.slice(startIdx);
                                highlightPart.style.backgroundColor = rgbcolor;
                                highlightPart.setAttribute('data-highlight-id', uniqueId);
                                highlightPart.setAttribute('data-sequence-number', seqNum++);
                                span.appendChild(highlightPart);

                                remainingLength -= (partLength - startIdx);
                                startIdx = 0;
                                nodePart.nodeValue = ''; // Clear the processed part
                            }
                        } else {
                            console.debug("nodePart.nodeValue is null");
                        }
                        i++;
                    }

                    textNode.parentNode.replaceChild(span, textNode);
                } else {
                    startIdx -= nodeValueLength;
                }
            }
        }
    }

    handleTextSpanningNodes(document.body);
    return uniqueId;
}

function DELETEhighlightTextOccurrences_backup(text, rgbcolor) {
    console.debug("highlightTextOccurrences with ", rgbcolor);
    // Generate a unique ID for this operation
    const uniqueId = 'highlight-' + Date.now();

    // Escape special characters for use in a regular expression
    const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    console.debug(escapedText);
    // Create a regular expression to match the text
    const regex = new RegExp(escapedText, 'gi');

    console.debug(regex);
    // Function to recursively search text nodes and highlight text
    function highlightNode(node, seqNum = 1) {
        if (node.nodeType === Node.TEXT_NODE) {
            const matches = [...node.nodeValue.matchAll(regex)];
            //console.debug(matches);
            if (matches.length > 0) {
                const span = document.createElement('span');
                let lastIdx = 0;
                matches.forEach(match => {
                    span.appendChild(document.createTextNode(node.nodeValue.slice(lastIdx, match.index)));
                    const highlight = document.createElement('mark');
                    highlight.textContent = match[0];
                    highlight.style.backgroundColor = rgbcolor;
                    highlight.setAttribute('data-highlight-id', uniqueId);
                    highlight.setAttribute('data-sequence-number', seqNum++);
                    span.appendChild(highlight);
                    lastIdx = match.index + match[0].length;
                });
                span.appendChild(document.createTextNode(node.nodeValue.slice(lastIdx)));
                console.debug(span);
                node.parentNode.replaceChild(span, node);
                return seqNum;
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            let children = Array.from(node.childNodes);
            children.forEach(child => {
                seqNum = highlightNode(child, seqNum);
            });
        }
        return seqNum;
    }

    highlightNode(document.body);
    return uniqueId;
}

function removeHighlighting(uniqueId) {
    const highlights = document.querySelectorAll(`[data-highlight-id="${uniqueId}"]`);
    highlights.forEach(highlight => {
        const parent = highlight.parentNode;
        parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        parent.normalize();
    });
}

function removeHighlighting_DELETE(uniqueId) {
    // Select all highlighted elements with the unique ID
    try {
        const highlightedElements = document.querySelectorAll(`[data-highlight-id='${uniqueId}']`);
        console.debug(highlightedElements);
        highlightedElements.forEach(element => {
            // Create a text node with the original text
            const textNode = document.createTextNode(element.textContent);

            // Replace the highlighted element with the text node
            element.parentNode.replaceChild(textNode, element);

            // If the parent was a span created for highlighting, and now only contains text, unwrap it
            if (element.parentNode.nodeName === 'SPAN' && element.parentNode.childNodes.length === 1) {
                const parent = element.parentNode;
                while (parent.firstChild) {
                    parent.parentNode.insertBefore(parent.firstChild, parent);
                }
                parent.parentNode.removeChild(parent);
            }
        });
    } catch (e) {
        console.debug(e);
    }
}

// the session token is not completed as yet
function get_username_from_sessiontoken(token) {

    //    return (JSON.parse(token)).userid;

    const userid = extractClaimFromJWT(token, "userid");

    return userid;

}

function get_displayname_from_sessiontoken(token) {

    return extractClaimFromJWT(token, "displayname");
    //    return (JSON.parse(token)).displayname;

}

function utf8_to_b64(str) {
    try {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
                return String.fromCharCode('0x' + p1);
            }));
    } catch (e) {
        console.error(e);
        return "";
    }
}

function b64_to_utf8(str) {
    try {
        return decodeURIComponent(Array.prototype.map.call(atob(str), function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
    } catch (e) {
        console.error(e);
        return "";
    }
}

/*
this function carried out the updates to which notes are shown on the page.
This script is called from the background script and the listener is in this content script
 */
function page_update(request, sender, sendResponse) {
    console.debug("browsersolutions request: " + JSON.stringify(request));

    return new Promise((resolve, reject) => {
        // chose which function to proceed with
        var shared_secret_to_identify_background_js_to_content_script_NoteSelectedHTML = "Glbx_marker6";
        console.debug("request0: " + request.action);

        const position = request.position;
        console.debug("update_notes_on_page, position: " + position);

        if (position == 1 || position == "1") {
            // close all notes on this page
            console.debug("browsersolutions: " + "close all notes on this page");
            removeAllNotes();
            resolve();
        } else if (position == 2 || position == "2") {
            // close all notes on this page that are not the users' own

            // check for own notes pertaining to this URL
            console.debug("browsersolutions: " + "check for own notes pertaining to this URL");
            getOwnNotes("all");
            removeSubscribedNotes();
            resolve(true);

            checkValueAndTriggerFunction();

        } else if (position == 3 || position == "3") {
            // get all in-scope notes for this page

            console.debug("browsersolutions: " + "get all in-scope notes for this page");

            getOwnNotes("all");
            getSubscribedNotes("all");
            resolve(true);

        }

    });

    // noteSelectedHTML(request, sender, sendResponse).then(function (res) {
    //       console.debug(res);

    //});

}

function checkValueAndTriggerFunction() {
    console.debug("browsersolutions #checkValueAndTriggerFunction");
    // Define your regex pattern here
    const regexPattern = /.*/; // Replace with your actual pattern

    // Retrieve the value from chrome.storage.sync
    chrome.storage.sync.get(['setNoteFocusTo'], function (result) {
        console.debug(result);
        if (result.setNoteFocusTo && regexPattern.test(result.setNoteFocusTo)) {
            // If the value is set and matches the regex, call the desired function
            moveFocusToNote(result.setNoteFocusTo);
            // wipe the value


        } else {
            console.debug('Value is not set or does not match the regex');
        }
    });
}

function removeSubscribedNotes() {
    console.debug("removeSubscribedNotes");
    // remove not not belonging to this user

    console.debug(document.querySelectorAll('container[class="yellownotecontainer"] , div[class="yellownotecontainer"]'));

    document.querySelectorAll('container[class="yellownotecontainer"] , div[class="yellownotecontainer"]').forEach(function (a) {
        // check if this is user's own note or not
        console.debug("removing a note" + a);
        remove_note(a);
    });

}

function removeAllNotes() {
    console.debug("removeAllNotes");
    console.debug(document.querySelectorAll('container[class="yellownotecontainer"] , div[class="yellownotecontainer"]'));

    document.querySelectorAll('container[class="yellownotecontainer"] , div[class="yellownotecontainer"]').forEach(function (a) {
        // check if this is user's own note or not
        console.debug("removing a note" + a);
        remove_note(a);
    });

}

function remove_noteid(noteid) {
    console.debug("# remove_noteid (" + noteid + ")");
    //    var note_root = document.querySelectorAll('[type="yellownote"]')[0];

    // is there any highlighting to clear ?


    console.debug(document.querySelectorAll('[class][note_type][noteid="' + noteid + '"]')[0]);
    console.debug(document.querySelectorAll('[note_type][noteid="' + noteid + '"]')[0]);
    console.debug(document.querySelectorAll('[noteid="' + noteid + '"]')[0]);
    var note_root = document.querySelectorAll('[class][note_type][noteid="' + noteid + '"]')[0];
    console.debug(note_root);
    //if (note_root != null || note_root != undefined) {
    remove_note(note_root);

    //}
}

function remove_note(noteroot) {
    console.debug("browsersolutions #remove_note");
    console.debug(noteroot);
    try {
        //console.debug(noteroot.highlightuniqueid);
        //console.debug( noteroot.getAttribute("highlightuniqueid"));
        //console.debug( noteroot.ge);
        console.debug(noteroot.getAttribute("note_type"));
        try {
            const highlightuniqueid = noteroot.getAttribute("highlightuniqueid");
            console.debug("clearing hightlight with id: ", highlightuniqueid);
            removeHighlighting(highlightuniqueid);
        } catch (e) {
            console.debug(e);
        }
        // Usage
        if (noteroot.getAttribute("note_type") == "webframe") {

            removeAllIframes(noteroot);
        }
        // if (noteroot == null || noteroot == undefined) {
        //     console.debug("no valid input");

        // } else {
        // console.debug(noteroot);

        try {
            //unmark_selection_text(noteroot);
        } catch (f) {
            console.error(f);
        }

        console.debug("closing...");
        console.debug(noteroot);
        noteroot.parentNode.removeChild(noteroot);

        var noteid = noteroot.getAttribute("noteid");
        //console.debug();

        // call to background.js to record the note as read/dismissed - only for notes that are not new
        chrome.runtime.sendMessage({
            message: {
                "action": "dismiss_note",
                "noteid": noteid,
                "enabled": false

            }
        }, function (response) {
            console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
            // finally, call "close" on the note
            //  try{
            //  	close_note(event);
            //  }catch(g){console.debug(g);}
            //remove_noteid(noteid);
        });
        //}

    } catch (e) {
        console.error(e);
    }
}

function removeAllIframes(noteroot) {
    console.debug("removeAllIframes");
    try {
        var iframes = noteroot.querySelectorAll('iframe');
        console.debug(iframes);
        iframes.forEach(function (iframe) {
            if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
            }
        });

        console.debug(iframes.length + ' iframes removed');
    } catch (e) {
        console.error(e);
    }
}

function getOwnNotes(note_type) {
    console.debug("getOwnNotes.start");
    var notes_found;
    var note_template_html;
    var note_template;
    const isOwner = true;
    const isNewNote = false;
    var url = window.location.href.trim();
    var msg;

    // check for own notes pertaining to this URL
    msg = {
        message: {
            "action": "get_own_applicable_stickynotes",
            "url": url,
            "note_type": note_type
        }
    }
    console.debug("browsersolutions " + JSON.stringify(msg));
    chrome.runtime.sendMessage(msg).then(function (response) {
        console.debug("browsersolutions" + "message sent to backgroup.js with response: ");
        console.debug(response);
        if (response != null) {
            notes_found = response.notes_found;
            console.debug("notes_found");
            console.debug(notes_found);
            creatorDetails = response.creatorDetails;

            // how many notes came back ?
            //console.debug("browsersolutions, notes found: " + notes_found.length);
            console.debug(response);
            if (Object.keys(response).length > 0) {

                console.debug("browsersolutions notes found: " + Object.keys(response).length);

                // loop through all notes and place them on page
                var i = 0;
                var promiseArray = [];

                notes_found.forEach(function (note) {
                    i++;
                    console.debug("browsersolutions " + "##### " + i + " ##########################");
                    //console.debug("browsersolutions " + note);
                    //var value = notes_found[key];
                    console.debug(note);
                    //console.debug("browsersolutions " + (note.json));
                    const note_data = JSON.parse(note.json);
                    console.debug(note_data);
                    // iteration code
                    // is the note already in place ?

                    var brand = "";
                    if (note_data.hasOwnProperty('brand')) {
                        brand = note_data.brand;
                    } else {
                        note_data.brand = "";
                        brand = "";
                    }
                    console.debug("browsersolutions brand of note: " + note_data.brand);

                    // examine the note data to see if it has a distribution list.
                    // This information in not contined inside the node oject itself but is maintained in a separate database field
                    if (note.hasOwnProperty('distributionlistid')) {
                        note_data.distributionlistid = note.distributionlistid;

                    } else {
                        // make sure to wipe any distribution list id that may have been set before, inside the note object
                        try {
                            delete note_data.distributionlistid
                        } catch (e) {
                            console.error(e);
                        }
                    }
                    if (note.hasOwnProperty('distributionlistname')) {
                        note_data.distributionlistname = note.distributionlistname;

                    } else {
                        // make sure to wipe any distributionlist name that may have been set before, inside the note object
                        try {
                            delete note_data.distributionlistname
                        } catch (e) {
                            console.error(e);
                        }
                    }

                    // determine what type of note this is
                    var note_type;
                    if (note_data.hasOwnProperty('note_type')) {
                        note_type = note_data.note_type;
                    } else if (note_data.hasOwnProperty('type')) {
                        note_type = note_data.type;

                        // check what other attribute which present my indicate note type
                    } else if (note_data.hasOwnProperty('content_url')) {
                        note_data.note_type = "webframe";
                        note_type = "webframe";
                    } else {
                        // set the default to be yellownote
                        note_data.note_type = "yellownote";
                        note_type = "yellownote";
                    }
                    console.debug(note_data);
                    console.debug("browsersolutions note_type of note: " + note_type);
                    note_data.note_type = note_type;
                    // creatorid of note - this is returned from the database as metadata on the note object.
                    // Insert it into the note data object
                    if (note.hasOwnProperty('creatorid')) {
                        note_data.creatorid = note.creatorid;

                        // check what other attribute which present my indicate note type

                    }
                    if (note.hasOwnProperty('displayname')) {
                        note_data.displayname = note.displayname;

                        // check what other attribute which present my indicate note type

                    }

                    if (isNoteOnPage(note_data.noteid)) {
                        console.debug("browsersolutions note IS already on page");
                    } else {
                        console.debug("browsersolutions note IS NOT already on page");
                        // has page been scanned ?
                        if (!page_scanned) {

                            // } else {
                            // Carry out scan
                            console.debug("browsersolutions call scan_page");
                            scan_page();
                            page_scanned = true;
                        } else {
                            console.debug("browsersolutions page already scanned");
                            console.debug("textnode_map size: " + textnode_map.length);
                        }
                        // what brand should be used for the note. Set default it nothing else is applicable for this user (this is the user's own notes)
                        var brand = "default";
                        chrome.storage.local.get([plugin_session_header_name]).then(function (session) {
                            brand = get_brand_from_sessiontoken(session[plugin_session_header_name]);
                            if (isUndefined(brand) || brand == null || brand == '' || brand == 'undefined') {
                                brand = "default";

                            }
                            // Collect template
                            console.debug("collect template based on brand (" + brand + "), note type (" + note_data.note_type + ")");
                            let promise = new Promise((resolve, reject) => {
                                    var html_note_template;
                                    var html_notetype_template;

                                    chrome.runtime.sendMessage({
                                        action: "get_template",
                                        brand: brand,
                                        note_type: note_type

                                    }).then(function (response) {
                                        html_note_template = response;
                                        console.debug("calling getNotetypeTemplate");

                                        return chrome.runtime.sendMessage({
                                            action: "get_notetype_template",
                                            brand: brand,
                                            note_type: note_type

                                        });

                                    }).then(function (response) {
                                        html_notetype_template = response;

                                        console.debug("calling placeStickyNote");
                                        placeStickyNote(note_data, html_note_template, html_notetype_template, creatorDetails, isOwner, isNewNote, false).then(function (res) {
                                            console.debug(res);
                                        });
                                        resolve({
                                            note_data,
                                            note_template: html_note_template
                                        });
                                    }).catch(reject);
                                });

                            console.debug("notes to be placed: " + promiseArray.length);
                            promiseArray.push(promise);
                            console.debug("notes to be placed: " + promiseArray.length);
                        });
                    }
                    console.debug("notes to be placed: " + promiseArray.length);
                });
                console.debug("notes to be placed: " + promiseArray.length);

                // loop through the list of all notes found, and place them on the page
                Promise.all(promiseArray).then(results => {
                    results.forEach(result => {
                        //console.debug(result.note_template);
                        // var note_template = safeParseInnerHTML(result.note_template, 'div');

                        console.debug("calling placeStickyNote");
                        placeStickyNote(result.note_data, result.note_template, result.notetype_template, creatorDetails, isOwner, isNewNote, false).then(function (res) {
                            console.debug(res);
                        });
                    });
                }).catch(error => {
                    console.error("An error occurred: ", error);
                });
            } else {
                console.debug("browsersolutions no notes found");
                // terminate here
            }
        } else {
            console.debug("browsersolutions no notes found");
            // terminate here
        }
    });
}

function getCurrentTimestamp() {

    // compute current timestamp
    var today = new Date();

    var YYYY = today.getFullYear();
    var MM = (today.getMonth() + 1);
    var DD = (today.getDate() + 1);

    if (MM < 10) {
        MM = "0" + MM;
    }

    if (DD < 10) {
        DD = "0" + DD;
    }

    var HH = (today.getHours() + 1);

    if (HH < 10) {
        HH = "0" + HH;
    }

    var mm = (today.getMinutes() + 1);

    if (mm < 10) {
        mm = "0" + mm;
    }

    var ss = (today.getSeconds() + 1);

    if (ss < 10) {
        ss = "0" + ss;
    }

    var dateTime = YYYY + MM + DD + HH + mm + ss;

    //console.debug(dateTime);
    return dateTime;
}

function unmark_selection_text(sticky_note_node) {
    console.debug("# unmark_selection_text");
    // unmark the selection text
    try {
        var marked = sticky_note_node.nextSibling;
        if (marked != null) {
            console.debug(marked);

            // iterate through all child noed and place them prior to this node

            console.debug(marked.childNodes.length)
            for (var i = 0; i < marked.childNodes.length; i++) {
                console.debug(marked.childNodes[i]);

                var insertedNode = marked.parentNode.insertBefore(marked.childNodes[i], marked);

            }
            // remove the span node enveloping the selection text and giving it a highlight.
            marked.remove();
        }
    } catch (e) {
        console.debug(e);
    }
}

function getSubscribedNotes(note_type) {
    console.debug("browsersolutions getSubscribedNotes noteAudience: ");
    var notes_found;
    var note_template_html;
    var note_template;
    const isOwner = false;
    const isNewNote = false;
    var url = window.location.href.trim();

    // check for own notes pertaining to this URL
    const msg = {
        message: {
            "action": "get_url_subscribed_yellownotes",
            "url": url,
            "note_type": note_type
        }
    }

    console.debug("browsersolutions " + JSON.stringify(msg));
    chrome.runtime.sendMessage(msg).then(function (response) {
        console.debug("browsersolutions" + "message sent to backgroup.js with response: ");
        console.debug((response));
        notes_found = response;

        var brand = "";

        var displayname = "";

        // how many notes came back ?
        //console.debug("browsersolutions, notes found: " + notes_found.length);

        if (Object.keys(response).length > 0) {

            console.debug("browsersolutions notes found: " + Object.keys(response).length);

            // loop through all notes and place them on page
            var i = 0;
            var promiseArray = [];

            notes_found.forEach(function (note) {
                i++;
                console.debug("browsersolutions " + "##### " + i + " ##########################");
                console.debug(note);
                //var value = notes_found[key];
                //console.debug(note);
                //console.debug("browsersolutions " + (note.json));
                const note_data = JSON.parse(note.json);
                console.debug("note_data:");
                console.debug(note_data);
                // iteration code
                // is the note already in place ?
                try {
                    if (note_data.hasOwnProperty('brand')) {
                        brand = note_data.brand;
                        console.debug("browsersolutions brand of note: " + note_data.brand);

                    } else {
                        note_data.brand = "default";
                        brand = "default";
                    }
                    var creatorDetails;
                    try {
                        creatorDetails = note.creatorDetails;
                        // is there a displayname attached to the note data ?
                        if (note_data.hasOwnProperty('displayname')) {
                            displayname = note_data.displayname;
                            console.debug("browsersolutions displayname of note: " + note_data.displayname);

                        } else {
                            // is there a displayname attached to the user profile (also included in the creatorDetails child-object) ?

                            console.debug(creatorDetails);
                            console.debug(creatorDetails.displayname);
                            if (creatorDetails.hasOwnProperty('displayname')) {
                                note_data.displayname = creatorDetails.displayname;
                                //displayname = creatorDetails.displayname;
                            } else {
                                //note_data.displayname = creatorDetails.displayname;

                            }

                        }

                        if (note.hasOwnProperty('creatordisplayname')) {
                            note_data.displayname = note.creatordisplayname;

                        }

                        // is there a banner image ?
                        var banner_image = "";
                        if (creatorDetails.hasOwnProperty('banner_image')) {
                            banner_image = creatorDetails.banner_image;
                            console.debug("browsersolutions banner_image of note: " + banner_image);
                        }
                    } catch (e) {
                        console.debug(e);
                    }

                    if (note.hasOwnProperty('distributionlistname')) {
                        //const distlist_name = note.distributionlistname;
                        console.debug("browsersolutions distributionlist of note: " + note.distributionlistname);
                        // include the name of the distribution list the note came from in the note data
                        note_data.distributionlistname = note.distributionlistname;
                    }
                    // examine the note data to see if it has a distribution list.
                    // This information in not contined inside the node oject itself but is maintained in a separate database field
                    if (note.hasOwnProperty('distributionlistid')) {
                        note_data.distributionlistid = note.distributionlistid;

                    } else {
                        // make sure to wipe any distribution list id that may have been set before, inside the note object
                        try {
                            delete note_data.distributionlistid
                        } catch (e) {
                            console.error(e);
                        }
                    }

                    const creatorid = note.creatorid;
                    console.debug("browsersolutions creatorid of note: " + creatorid);
                    // include the name of the creatorid the note came from in the note data
                    note_data.creatorid = creatorid;

                    // determine what type of note this is
                    var note_type;
                    if (note_data.hasOwnProperty('note_type')) {
                        note_type = note_data.note_type;

                        // check what other attribute which present my indicate note type
                    } else if (note_data.hasOwnProperty('content_url')) {
                        note_data.note_type = "webframe";
                        note_type = "webframe";
                    } else {
                        // set the default to be yellownote
                        note_data.note_type = "yellownote";
                        note_type = "yellownote";
                    }
                    console.debug(note_data);
                    console.debug("browsersolutions note_type of note: " + note_type);
                } catch (e) {
                    console.error(e);
                }
                if (isNoteOnPage(note_data.noteid)) {
                    console.debug("browsersolutions note IS already on page");
                } else {
                    console.debug("browsersolutions note IS NOT already on page");
                    // has page been scanned ?
                    if (!page_scanned) {

                        // } else {
                        // Carry out scan
                        console.debug("browsersolutions call scan_page");

                        scan_page();
                        page_scanned = true;

                    } else {
                        console.debug("browsersolutions page already scanned");
                        console.debug("textnode_map size: " + textnode_map.length);
                    }
                    // what brand should be used for the note. Set default it nothing else is applicable for this user (this is the user's own notes)
                    var brand = "default";
                    chrome.storage.local.get([plugin_session_header_name]).then(function (session) {
                        brand = get_brand_from_sessiontoken(session[plugin_session_header_name]);
                        if (isUndefined(brand) || brand == null || brand == '' || brand == 'undefined') {
                            brand = "default";

                        }
                        // Collect template
                        console.debug("collect template based on brand (" + brand + "), note type (" + note_type + ")");
                        let promise = new Promise((resolve, reject) => {
                                var html_note_template;
                                var html_notetype_template;

                                const get_template_msg = {
                                    action: "get_template",
                                    brand: brand,
                                    note_type: note_type
                                }
                                console.debug("get_template_msg: ", JSON.stringify(get_template_msg));
                                chrome.runtime.sendMessage(get_template_msg).then(function (response) {
                                    html_note_template = response;
                                    console.debug("html_note_template.length: ", html_note_template.length);
                                    console.debug("html_note_template: ");
                                    console.debug(html_note_template);
                                    console.debug("calling getNotetypeTemplate");

                                    const msg = {
                                        action: "get_notetype_template",
                                        brand: brand,
                                        note_type: note_type

                                    }
                                    console.debug("msg: ", JSON.stringify(msg));

                                    return chrome.runtime.sendMessage(msg);

                                }).then(function (response) {
                                    html_notetype_template = response;
                                    console.debug("html_notetype_template.length: ", html_notetype_template.length);
                                    console.debug("html_notetype_template: ");
                                    console.debug(html_notetype_template);
                                    //console.debug("browsersolutions resolve");
                                    //var template = safeParseInnerHTML(html_note_template, 'div');
                                    console.debug("calling placeStickyNote");
                                    placeStickyNote(note_data, html_note_template, html_notetype_template, note.creatorDetails, isOwner, isNewNote, false).then(function (res) {
                                        console.debug(res);
                                    });
                                    resolve({
                                        note_data,
                                        html_note_template
                                    });
                                }).catch(reject);
                            });

                        console.debug("notes to be placed: " + promiseArray.length);
                        promiseArray.push(promise);
                        console.debug("notes to be placed: " + promiseArray.length);
                    });

                }
                console.debug("notes to be placed: " + promiseArray.length);

            });
            console.debug("notes to be placed: " + promiseArray.length);

            // loop through the list of all notes found, and place them on the page
            Promise.all(promiseArray).then(results => {
                results.forEach(result => {
                    console.debug(result);
                    // var note_template = safeParseInnerHTML(result.note_template, 'div');
                    // Call procedure that places the notes in thep age with the isOwner flag set to false, since these notes belong to others.
                    // The practical effect of this is to remove all buttons to perform edit-actions on the note, such as edit, delete, etc.
                    console.debug("calling placeStickyNote");
                    placeStickyNote(result.note_data, result.note_template, result.notetype_template, note.creatorDetails, isOwner, isNewNote, false).then(function (res) {
                        console.debug(res);
                    });
                });
            }).catch(error => {
                console.error("An error occurred: ", error);
            });

        } else {
            console.debug("browsersolutions no notes found");
            // terminate here
        }

    });
}

var page_scanned = false;

function getAllNotes() {
    console.debug("browsersolutions getAllNotes noteAudience: ");
    var notes_found;
    var note_template_html;
    var note_template;

    const isOwner = false;
    const isNewNote = false;

    var url = window.location.href.trim();

    // check for own notes pertaining to this URL
    const msg = {
        message: {
            "action": "get_all_available_yellownotes",
            "url": url
        }
    }

    console.debug("browsersolutions " + JSON.stringify(msg));
    chrome.runtime.sendMessage(msg).then(function (response) {
        console.debug("browsersolutions" + "message sent to backgroup.js with response: " + JSON.stringify(response));
        notes_found = response.data;
        creatorDetails = response.creatorDetails;
        // how many notes came back ?
        //console.debug("browsersolutions, notes found: " + notes_found.length);
        console.debug(notes_found);
        if (Object.keys(notes_found).length > 0) {

            console.debug("browsersolutions notes found: " + Object.keys(notes_found).length);

            // loop through all notes and place them on page
            var i = 0;
            var promiseArray = [];

            notes_found.forEach(function (note) {
                i++;
                console.debug("browsersolutions " + "##### " + i + " ##########################");
                //console.debug("browsersolutions " + note);
                //var value = notes_found[key];
                //console.debug(note);
                //console.debug("browsersolutions " + (note.json));
                const note_data = JSON.parse(note.json);
                console.debug(note_data);
                // iteration code
                // is the note already in place ?

                var brand = "";
                if (note_data.hasOwnProperty('brand')) {
                    brand = note_data.brand;
                } else {
                    note_data.brand = "";
                    brand = "";
                }
                console.debug("browsersolutions brand of note: " + note_data.brand);
                // examine the note data to see if it has a distribution list.
                // This information in not contined inside the node oject itself but is maintained in a separate database field
                if (note.hasOwnProperty('distributionlistid')) {
                    note_data.distributionlistid = note.distributionlistid;

                } else {
                    // make sure to wipe any distribution list id that may have been set before, inside the note object
                    try {
                        delete note_data.distributionlistid
                    } catch (e) {
                        console.error(e);
                    }
                }

                // determine what type of note this is
                var note_type;
                if (note_data.hasOwnProperty('note_type')) {
                    note_type = note_data.note_type;

                    // check what other attribute which present my indicate note type
                } else if (note_data.hasOwnProperty('content_url')) {
                    note_data.note_type = "webframe";
                    note_type = "webframe";
                } else {
                    // set the default to be yellownote
                    note_data.note_type = "yellownote";
                    note_type = "yellownote";
                }
                console.debug(note_data);
                console.debug("browsersolutions note_type of note: " + note_type);

                if (isNoteOnPage(note_data.noteid)) {
                    console.debug("browsersolutions note IS already on page");
                    // move focus
                } else {
                    console.debug("browsersolutions note IS NOT already on page");
                    // has page been scanned ?
                    if (!page_scanned) {

                        // } else {
                        // Carry out scan
                        console.debug("browsersolutions call scan_page");

                        scan_page();
                        page_scanned = true;

                    }
                    // what brand should be used for the note. Set default it nothing else is applicable for this user (this is the user's own notes)
                    var brand = "default";
                    chrome.storage.local.get([plugin_session_header_name]).then(function (session) {
                        brand = get_brand_from_sessiontoken(session[plugin_session_header_name]);
                        if (isUndefined(brand) || brand == null || brand == '' || brand == 'undefined') {
                            brand = "default";
                        }
                        // Collect template
                        console.debug("collect template based on brand (" + brand + "), note type (" + note_type + ")");
                        let promise = new Promise((resolve, reject) => {
                                var html_note_template;
                                var html_notetype_template;

                                chrome.runtime.sendMessage({
                                    action: "get_template",
                                    brand: brand,
                                    note_type: note_type

                                }).then(function (response) {
                                    html_note_template = response;
                                    console.debug("calling getNotetypeTemplate");

                                    return chrome.runtime.sendMessage({
                                        action: "get_notetype_template",
                                        brand: brand,
                                        note_type: note_type

                                    });

                                }).then(function (response) {
                                    html_notetype_template = response;
                                    // console.debug("browsersolutions resolve");
                                    // var template = safeParseInnerHTML(html_note_template, 'div');
                                    console.debug("calling placeStickyNote");
                                    placeStickyNote(note_data, html_note_template, html_notetype_template, creatorDetails, isOwner, isNewNote, false).then(function (res) {
                                        console.debug(res);
                                    });
                                    resolve({
                                        note_data,
                                        note_template
                                    });
                                }).catch(reject);
                            });

                        console.debug("notes to be placed: " + promiseArray.length);
                        promiseArray.push(promise);
                        console.debug("notes to be placed: " + promiseArray.length);
                    });

                }
                console.debug("notes to be placed: " + promiseArray.length);

            });
            console.debug("notes to be placed: " + promiseArray.length);

            // loop through the list of all notes found, and place them on the page
            Promise.all(promiseArray).then(results => {
                results.forEach(result => {
                    //console.debug(result.note_template);
                    //var note_template = safeParseInnerHTML(result.note_template, 'div');
                    console.debug("calling placeStickyNote");
                    placeStickyNote(result.note_data, result.note_template, result.notetype_template, creatorDetails, isOwner, isNewNote, false).then(function (res) {
                        console.debug(res);
                    });
                });
            }).catch(error => {
                console.error("An error occurred: ", error);
            });
        } else {
            console.debug("browsersolutions no notes found");
            // terminate here
        }
    });
}


/*
note_obj contains the data that populated the note

note_template contains the html making up the DOM tree of the note, including all styling and graphical elements.
There are no external references; The note is self contained.


First attempt to use the selction text in the note to place the note in the document. If there are no selection text, use the coordinates in the note to place the note. If there are no coordinates, place the note on top of the page.

note_obj
note_template
creatorDetails
isOwner         boolean
isNewNote       boolean
moveFocus       boolean     If set to true, move the focus to this note
 * */

function placeStickyNote(note_obj, html_note_template, html_notetype_template, creatorDetails, isOwner, isNewNote, moveFocus) {
    console.debug("placeStickyNote.start");
    // contenttype
    // permitted values: text, html, embeded, linked
    if(function_call_debuging)  console.debug("note_obj:");
    if(function_call_debuging)  console.debug(note_obj);
    if(function_call_debuging)  console.debug("html_note_template.length: ", html_note_template.length);

    //console.debug(html_note_template);
    if(function_call_debuging)  console.debug("html_notetype_template.length: ", html_notetype_template.length);

    //console.debug(html_notetype_template);

    if(function_call_debuging)  console.debug("creatorDetails:");
    if(function_call_debuging) console.debug(creatorDetails);
    if(function_call_debuging)  console.debug("isOwner: ", isOwner);
    if(function_call_debuging)  console.debug("isNewNote: ", isNewNote);
    if(function_call_debuging)  console.debug("moveFocus: ", moveFocus);

    return new Promise(function (resolve, reject) {
        // first , check if the note is already on the page
        if (isNoteOnPage(note_obj.noteid)) {
            console.debug("browsersolutions: note IS already on page");
            // move focus ?
            if (moveFocus) {
                // move focus to this note
                console.debug("call moveFocusToNote");
                moveFocusToNote(note_obj.noteid);
                resolve("focused");
            }
        } else {

            // set a default background color for the note selection highlighting
            var highlight_background = "rgb(255, 255, 0, 0.25)";
            if (creatorDetails.hasOwnProperty('note_color')) {

                highlight_background = "rgb(" + hexToRGB(creatorDetails.note_color) + ", 0.25)";
            } else {}
            // create the note object, populated with data

            /* determine where on the page the note goes

            Check in the following order
            1. Does the note have a selectiontext string and is this string on the page? If so place the note next to this selection
            2. Does the note have coordinates, if use use them
            3. Use the cursor position

             */
            //var out = getSelectionTextPosition(note_obj);

            console.debug(note_obj);

            if (typeof note_obj == 'undefined') {
                // nothing to do
                reject();
            } else {
                // if noe note, just use cursor position
                if (isNewNote) {
                    console.debug("browsersolutions: newnote=" + isNewNote);
                } else {
                    console.debug(note_obj);

                    // use the selection text to place the note, but ignore selections shorter than 3 characters
                    if (note_obj.selection_text != undefined && note_obj.selection_text != null && note_obj.selection_text.length > 3) {

                        console.debug("browsersolutions: attempt selection text macthing");
                        // check if note contains position coordinates/parameters. If so, try to use them to place the note.

                        console.debug(note_obj);
                        //var background_to_NoteSelectedHTML_sharedsecret = "Glbx_marker6";

                        // Use the presence of the dummy value "Glbx_marker" in the request as a
                        // insecure "shared secret" to try to ensure only request from the
                        // background.js are accepted.
                        // This must be improved.
                        try {

                            var doc = window.document,
                            body = doc.body,
                            selection,
                            range,
                            bodyText;

                            console.debug(doc);
                            console.debug("browsersolutions: " + doc.nodeName);
                            // root
                            var root_node = doc.documentElement;
                            //console.debug(root_node);

                            whole_page_text = "";
                            // traverse document for all visible text
                            traverse(doc.documentElement);
                            console.debug("################################################");
                            // console.debug("browsersolutions: " +whole_page_text);
                            // console.debug("browsersolutions: " +textnode_map);

                            // console.debug("browsersolutions: " +whole_page_text.replace(/\s/g, ""));
                            //console.debug(selectionText.replace(/\s/g,""));
                            // remove all whitespace before making attempt to place selection inside larger text


                            console.debug("note: " + JSON.stringify(note_obj));
                            // locate where this note goes.
                            var noteid = note_obj.noteid;
                            // var obj = JSON.parse(note_obj.json);
                            // Create Base64 Object
                            console.debug(note_obj);

                            // check if note is already on page
                            console.debug("isNoteOnPage: " + isNoteOnPage(noteid) + "");
                            if (!isNoteOnPage(noteid)) {
                                // Decode the String containing the selection text
                                console.debug("selection_text: " + note_obj.selection_text);
                                var selection_text = "";
                                try {
                                    if (!isUndefined(note_obj.selection_text) && note_obj.selection_text != "" || note_obj.selection_text != null) {
                                        if (isNewNote) {
                                            selection_text = note_obj.selection_text;
                                        } else {
                                            // for existing notes, the selection text has been base64 encoded before storage
                                            selection_text = b64_to_utf8(note_obj.selection_text);
                                        }
                                        console.debug("browsersolutions: selection_text: " + selection_text);
                                        //console.debug("calling: getDOMplacement");
                                        // fiund where in the DOM the selection text is found (if at all)
                                        //  var {
                                        //      selection_matched_in_document,
                                        //      start_range_node,
                                        //      start_offset,
                                        //      end_range_node,
                                        //      end_offset,
                                        //      textnodelist
                                        //  } = getDOMplacement(selection_text, note_obj);

                                        //console.debug("selection_matched_in_document: " + selection_matched_in_document);
                                        //console.debug("browsersolutions: start_range_node");
                                        //console.debug(start_range_node);
                                        //console.debug("start_offset: " + start_offset);
                                        //console.debug(end_range_node);
                                        //console.debug("end_offset: " + end_offset);
                                        //console.debug(textnodelist  );
                                        //console.debug("browsersolutions: nodesAreIdentical:" + nodesAreIdentical(start_range_node, end_range_node));
                                        //console.debug (findNodesBetween(start_range_node, end_range_node));

                                        // if the selection text that should be use to anchor the note in the document found, switch to using the coordinates contained in the note
                                    } else {
                                        console.debug("browsersolutions: no selection text");
                                        //selection_matched_in_document = false;
                                    }
                                } catch (e) {
                                    console.error(e);
                                    console.debug("browsersolutions: no selection text");
                                    //selection_matched_in_document = false;
                                }

                                var highlightuniqueid = "0";
                                console.debug("selection_text: " + selection_text);
                                // attempt to locate and highlight the selected text in the document
                                if (!isUndefined(selection_text) && selection_text != null && selection_text != '') {
                                    // Usage: Call this function with the text you want to highlight

                                    console.debug(selection_text);
                                    console.debug("calling highlightTextOccurrences");
                                    //console.debug(textnodelist  );

                                    highlightuniqueid = highlightTextOccurrences_old(selection_text, highlight_background);
                                    console.debug("Highlights added with ID: ", highlightuniqueid);
                                    console.debug(document.querySelector('[data-highlight-id="' + highlightuniqueid + '"]'));

                                    // only include the highlight id with the note object if it is not null
                                    //if (!isUndefined(highlightuniqueid) && highlightuniqueid != null && highlightuniqueid != '') {
                                    // note_object_data.highlightuniqueid = highlightuniqueid;
                                    //}
                                }
                                // if the text was found in the document, the highlightuniqueid will be set to a value other than "0"
                                if (highlightuniqueid !== "0" && highlightuniqueid !== "" && highlightuniqueid !== null && highlightuniqueid !== undefined) {

                                    console.debug("browsersolutions: selection_matched_in_document: true");

                                    //console.debug(start_range_node.textContent);
                                    //let original_start_range_node_textcontent = start_range_node.textContent;
                                    //console.debug("browsersolutions: start_range_node start_offset " + start_offset);
                                    //console.debug("browsersolutions: start_range_node total text length: " + start_range_node.textContent.length);

                                    //console.debug("browsersolutions: end_range_node");
                                    //console.debug(end_range_node.textContent);
                                    //console.debug("browsersolutions: end_range_node end_offset " + end_offset);
                                    //console.debug("browsersolutions: end_range_node total text length: " + end_range_node.textContent.length);
                                    //console.debug("browsersolutions: nodesAreIdentical:" + nodesAreIdentical(start_range_node, end_range_node));

                                    // create the yellow note, later attach it to the right location in the DOM
                                    console.debug("browsersolutions: calling: create_stickynote_node");
                                    console.debug(note_obj);
                                    create_stickynote_node(note_obj, html_note_template, html_notetype_template, creatorDetails, isOwner, isNewNote).then(function (response) {
                                        var newGloveboxNode = response;

                                        // connect the note to the selection text
                                        newGloveboxNode.setAttribute("highlightuniqueid", highlightuniqueid);
                                        console.debug(newGloveboxNode);
                                        console.debug("browsersolutions: calling: size_and_place_note_based_on_texthighlight");
                                        size_and_place_note_based_on_texthighlight(newGloveboxNode, note_obj, isOwner, isNewNote);
                                        console.debug("browsersolutions: calling: attachEventlistenersToYellowStickynote");
                                        attachEventlistenersToYellowStickynote(newGloveboxNode);
                                        // make some parts visible and other not visible
                                        if (isOwner) { // if the note is the user's own note, then make the edit buttons visible
                                            console.debug("browsersolutions: makeEditButtonsVisible");
                                            console.debug("calling setComponentVisibility");
                                            setComponentVisibility(newGloveboxNode, ",rw,.*normalsized");
                                            // store with the note which buttons are to be shown
                                            newGloveboxNode.setAttribute("button_arrangment", "rw")

                                        } else {
                                            console.debug("browsersolutions: makeEditButtonsInvisible");
                                            setComponentVisibility(newGloveboxNode, ",ro,.*normalsized");
                                            // store with the note which buttons are to be shown
                                            newGloveboxNode.setAttribute("button_arrangment", "ro")
                                        }

                                        if (note_obj.hasOwnProperty('distributionlistid')) {
                                            newGloveboxNode.setAttribute("distributionlistid", note_obj.distributionlistid);

                                        }

                                        // Make the stickynote draggable:
                                        console.debug("calling: makeDragAndResize");
                                        makeDragAndResize(newGloveboxNode, isOwner, isNewNote, false);
                                        if (moveFocus) {
                                            moveFocusToNote(noteid);
                                        }
                                        resolve();
                                    });

                                } else {
                                    // the selection text was not found in the document...
                                    // look for coordinates in the note
                                    console.debug("browsersolutions: selection text not found in doc, using coordinates instead");
                                    try {

                                        console.debug("browsersolutions: " + "note posx: " + note_obj.posx);
                                        console.debug("browsersolutions: " + "note posy: " + note_obj.posy);

                                        // check if note contains position coordinates/parameters. If so, try to use them to place the note

                                        var posx = "";
                                        posx = note_obj.posx;

                                        var posy = "";
                                        posy = note_obj.posy;

                                        console.debug("browsersolutions: " + "using posx:" + posx + " posy:" + posy);
                                        console.debug("browsersolutions: " + valid_stickynote_position_coordinate_regexp.test(posx));
                                        console.debug("browsersolutions: " + valid_stickynote_position_coordinate_regexp.test(posy));

                                        try {
                                            console.debug("browsersolutions: " + "calling create_stickynote_node");
                                            create_stickynote_node(note_obj, html_note_template, html_notetype_template, creatorDetails, isOwner, isNewNote).then(function (newGloveboxNode) {
                                                console.debug(newGloveboxNode);
                                                console.debug("calling size_and_place_note_based_on_coordinates");
                                                size_and_place_note_based_on_coordinates(newGloveboxNode, note_obj, creatorDetails, isOwner, isNewNote);

                                                console.debug("calling setComponentVisibility");
                                                if (isOwner) {
                                                    setComponentVisibility(newGloveboxNode, ",rw,.*normalsized,");
                                                    newGloveboxNode.setAttribute("button_arrangment", "rw")
                                                } else {
                                                    setComponentVisibility(newGloveboxNode, ",ro,.*normalsized,");
                                                    newGloveboxNode.setAttribute("button_arrangment", "ro")
                                                }
                                                if (note_obj.hasOwnProperty('distributionlistid')) {
                                                    newGloveboxNode.setAttribute("distributionlistid", note_obj.distributionlistid);
                                                }
                                                console.debug("calling attachEventlistenersToYellowStickynote");
                                                attachEventlistenersToYellowStickynote(newGloveboxNode);

                                                console.debug("calling makeDragAndResize");
                                                makeDragAndResize(newGloveboxNode, isOwner, isNewNote, false);

                                                if (isOwner) {
                                                    console.debug(newGloveboxNode);
                                                    newGloveboxNode.setAttribute("isOwner", "true");
                                                } else {
                                                    newGloveboxNode.setAttribute("isOwner", "false");
                                                }
                                                console.debug("######################################################");

                                                if (moveFocus) {
                                                    moveFocusToNote(noteid);
                                                }
                                                resolve(newGloveboxNode);
                                                // Make the stickynote draggable:
                                                //console.debug("calling makeDraggable");
                                                //makeDraggable(newGloveboxNode, newGloveboxNode.querySelector("[name='topbar_filler']"));
                                            });
                                        } catch (e) {
                                            console.debug("browsersolutions " + e);
                                        }
                                    } catch (e) {
                                        console.debug(e);
                                    }
                                }
                            } else {
                                console.debug("note (notedid=" + noteid + ") is already on page: ");
                                resolve("note (notedid=" + noteid + ") is already on page: ");
                            }
                        } catch (e) {
                            console.debug(e);
                            reject(e);
                        }

                    } else {
                        // if no selection_text, only position co-ordinates can place the note

                        try {
                            console.debug("calling: create_stickynote_node");
                            create_stickynote_node(note_obj, html_note_template, html_notetype_template, creatorDetails, isOwner, isNewNote).then(function (response) {
                                var newGloveboxNode = response;

                                console.debug(newGloveboxNode);
                                console.debug("calling: size_and_place_note_based_on_coordinates");
                                size_and_place_note_based_on_coordinates(newGloveboxNode, note_obj, creatorDetails, isOwner, isNewNote);
                                console.debug("calling: attachEventlistenersToYellowStickynote");
                                attachEventlistenersToYellowStickynote(newGloveboxNode);
                                // make some parts visible and other not visible
                                if (isOwner) { // if the note is the user's own note, then make the edit buttons visible
                                    console.debug("browsersolutions: makeEditButtonsVisible");
                                    console.debug("calling setComponentVisibility");
                                    setComponentVisibility(newGloveboxNode, ",rw,.*normalsized");
                                    newGloveboxNode.setAttribute("button_arrangment", "rw");
                                } else {
                                    console.debug("browsersolutions: makeEditButtonsInvisible");
                                    setComponentVisibility(newGloveboxNode, ",ro,.*normalsized");
                                    newGloveboxNode.setAttribute("button_arrangment", "ro");
                                }

                                // internal scrolling for webframes

                                // Make the stickynote draggable:
                                console.debug("calling makeDragAndResize");
                                //makeDragable(newGloveboxNode);
                                //console.debug("calling makeResizeable");
                                // makeResizeable(newGloveboxNode);
                                makeDragAndResize(newGloveboxNode, isOwner, isNewNote, false);
                                resolve(newGloveboxNode);
                            });
                        } catch (e) {
                            console.debug("browsersolutions " + e);
                        }

                    }

                    resolve("1.1");
                }
            }
        }
    });
}

function moveFocusToNote(noteid) {
    if(function_call_debuging) console.debug("moveFocusToNote (" + noteid + ")");

    console.debug("The current URL is:", window.location.href);

    // // Send a message to the background script
    // chrome.runtime.sendMessage({
    //    action: "focusTab"
    //});
    try {

        return new Promise((resolve, reject) => {
            console.debug(isNoteOnPage(noteid));

            // Find the element by its ID
            const note_root = document.querySelectorAll('[noteid="' + noteid + '"]')[0];
            console.debug(note_root);
            if (note_root != null) {
                const element = note_root.querySelector('table[name="whole_note_table"]');
                // Check if the element exists
                console.debug(element);
                if (element) {

                    // Scroll the element into view
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                    resolve(true);
                } else {
                    console.debug('Element not found: ' + elementId);
                    // sendResponse({
                    //     success: true,
                    //     data: "value"
                    // });
                    resolve(true);
                }

            } else {
                console.debug("browsersolutions: note not found");
                resolve(false);
            }

        });

    } catch (f) {
        console.debug(f);
    }
}

// hold onto some code that spans multiple text nodes
function one(note_obj, note_template, isOwner, isNewNote) {

    if (nodesAreIdentical(start_range_node, end_range_node)) {
        console.debug("browsersolutions: " + "start_range_node and end_range_node are identical");
        //start_offset = 10;
        //end_offset = 20;

        // highlight the text the note is tied to (it any)
        //
        console.debug("browsersolutions: start_range_node length=" + start_range_node.length);
        //console.debug("browsersolutions: start_range_node textContent=" + start_range_node.textContent);
        //console.debug(start_range_node);
        console.debug("browsersolutions: start_range_node start offset " + start_offset);

        console.debug("browsersolutions: end_range_node length=" + end_range_node.length);
        //console.debug("browsersolutions: end_range_node textContent=" + end_range_node.textContent);
        //console.debug(end_range_node);
        console.debug("browsersolutions: end_range_node offset " + end_offset);
        let notedRange = document.createRange();
        notedRange.setStart(start_range_node, start_offset);
        notedRange.setEnd(end_range_node, end_offset);

        // create a range to contain the selection specified in the stickynote
        console.debug("browsersolutions: new notedRange");
        console.debug(notedRange);
        console.debug("browsersolutions: range.toString: " + notedRange.toString());

        // make highlighting of the selected text pertaining to the sticky note
        var color = "#ffffcc";

        // Link the span to the note by setting the "to_note" attribute to the noteid of the note
        // newly created notes do not have a noteid yet, in which case, use ""
        var note_id = note_obj.noteid;

        mark2.setAttribute("style", "background-color: " + color + ";");
        mark2.setAttribute("to_note", "" + note_id + "");

        notedRange.surroundContents(mark2);
        console.debug(notedRange);
        console.debug(mark2);
        //it2.appendChild(newGloveboxNode);
        // start_range_node.textContent = original_start_range_node_textcontent.substring(0, start_offset);

        // insert the sticky note document into the main DOM just before the highlighted selection

        // insert the sticky note node immediately before the selection text it "links" too.

        insertedNode = mark2.parentNode.insertBefore(newGloveboxNode, mark2);
        // shift the inserted node slightly to the right, to make the highlighted text more visible

        increaseVerticalDistanceUsingTop(mark2, insertedNode);

        // Shrink text content in the textnode where the selection begins,
        // to no longer incldue the selected text (which has been copied into the span)

        //console.debug("browsersolutions " + start_range_node.textContent);
        //start_range_node.textContent = original_start_range_node_textcontent.substring(0, start_offset);
        //console.debug("browsersolutions " + start_range_node.textContent);

        // shrik the text content in the textnode where the selection ends, to exclude the selected text


    } else {
        // the selection spans multiple DOM nodes

        // create a "span" for each node separately, and link them to the note

        //start_offset = 10;
        //end_offset = 20;
        //console.debug("browsersolutions: start_range_node length=" + start_range_node.length);
        //console.debug(start_range_node);
        //console.debug("browsersolutions: start_range_node start offset " + start_offset);
        //console.debug("browsersolutions: insertedNode at root");
        //const rootElement = document.documentElement; // For <html> as root
        //const insertedNode2 = rootElement.appendChild(newGloveboxNode)
        //     console.debug(insertedNode2);
        //console.debug("browsersolutions: end_range_node length=" + end_range_node.length);
        //console.debug(end_range_node);
        //console.debug("browsersolutions: end_range_node offset " + end_offset);
        let notedRange = document.createRange();
        notedRange.setStart(start_range_node, start_offset);
        notedRange.setEnd(end_range_node, end_offset);

        // create a range to contain the selection specified in the stickynote
        console.debug("browsersolutions: new notedRange");
        console.debug(notedRange);
        console.debug("browsersolutions " + notedRange.toString());

        var spanNodesBetween = findNodesBetween(start_range_node, end_range_node);
        console.debug("browsersolutions: spanNodesBetween");
        console.debug(spanNodesBetween);

        // make highlighting of the selected text pertaining to the sticky note
        var color = "#ffffcc";

        // Link the span to the note by setting the "to_note" attribute to the noteid of the note
        // newly created notes do not have a noteid yet, in which case, use ""
        var note_id = note_obj.noteid;

        var mark2 = document.createElement('span');
        mark2.setAttribute("style", "background-color: " + color + ";");
        mark2.setAttribute("to_note", "" + note_id + "");
        let notedRange2 = document.createRange();
        console.debug(notedRange2);
        console.debug("browsersolutions: start_range_node");
        console.debug(start_range_node.textContent);
        notedRange2.setStart(start_range_node, 4);
        notedRange2.setEnd(start_range_node, 15);
        console.debug(notedRange2);
        notedRange2.surroundContents(mark2);
        console.debug(notedRange2);
        console.debug(notedRange2.textContent);
        //it2.appendChild(newGloveboxNode);
        // start_range_node.textContent = original_start_range_node_textcontent.substring(0, start_offset);

        // insert the sticky note document into the main DOM just before the highlighted selection

        // insert the sticky note node immediately before the selection text it links too.
        console.debug(start_range_node.parentNode);
        insertedNode = start_range_node.parentNode.insertBefore(newGloveboxNode, start_range_node);
    }
    console.debug(insertedNode);

}

/*
 * returns integer

 * @param {*} input
 * @param {*} fallback
 * @param {*} lowerLimit
 * @param {*} upperLimit
 * @returns
 */

function processBoxParameterInput(input, fallback, lowerLimit, upperLimit) {
    if(function_call_debuging) console.debug("browsersolutions: " + "# processBoxParameterInput");
    if(function_call_debuging) console.debug(input);
    if(function_call_debuging) console.debug(fallback);
    if(function_call_debuging) console.debug(lowerLimit);
    if(function_call_debuging) console.debug(upperLimit);

    let number;

    if (typeof input === 'string') {
        number = Number(input);
        if (isNaN(number)) {
            return fallback;
        }
    } else if (typeof input === 'number') {
        number = input;
    } else {
        return fallback;
    }

    if (Number.isInteger(number) && number >= lowerLimit && number <= upperLimit) {
        return number;
    } else {
        return fallback;
    }
}

function collectVisibleText(element) {
    let text = '';

    // Function to determine if an element is visible
    function isVisible(elem) {
        const style = window.getComputedStyle(elem);
        return style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    }

    // Recursive function to visit each node and collect text
    function visitNode(node) {
        // Check if the node is a text node and its parent is visible
        if (node.nodeType === Node.TEXT_NODE && isVisible(node.parentNode)) {
            text += node.textContent.trim() + ' ';
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Recursively visit each child node
            Array.from(node.childNodes).forEach(visitNode);
        }
    }

    // Start recursion on the specified element
    visitNode(element);

    return text;
}

/*
function to look through the text of the document to locate where the selection string fits in

Taking account of the fact that selction may spand multiple DOM node, the function return both the DOM node the text starts inside of,
and the one it ends inside of. As well as the character position of the start and endpoint in those node

 */
function getDOMposition(selection_text) {

    console.debug("getDOMposition.start, locate in the body of the document the selection text: \"" + selection_text + "\"");
    var textnodelist = [];
    try {

        if (selection_text !== undefined && selection_text.length > 0) {

            // start
            var start_range_node;
            var start_offset = 0;
            // end
            var end_range_node;
            var end_offset = 0;

            // compact the section text to enable white space-agnostic matching
            var selection_text_compact = selection_text.replace(/\s/g, "");
            console.debug("look for selection_text_compact: " + selection_text_compact);
            console.debug("in whole_page_text: " + whole_page_text);
            var start_pos = whole_page_text.replace(/\s/g, "").indexOf(selection_text_compact);

            console.debug("text match start pos: " + start_pos);
            // textnode_map contains the text nodes of the document, and the position (start and stop) of the text node in the document
            // step through the array of all text nodes to find the one that contains the start position

            // if start_pos is "-! it means the selection text was not found in the page text at all, and we can just skip this next step
            if (start_pos !== -1) {
                var i = 0,
                j = 0;
                try {
                    // put a cap on max nodes / array entries to examine
                    while (i < textnode_map.length && i < 5000) {
                        // console.debug(i + " " + textnode_map[i][0] + " " + textnode_map[i][1]);
                        //console.debug(textnode_map[i]);

                        j = i;
                        // first occurrence the start pos, capture the node and exit the iteration
                        if ((textnode_map[i][0] <= start_pos) && (start_pos <= textnode_map[i][1])) {
                            // textnode_map[i][0];
                            console.debug("browsersolutions hit!");
                            // Now the DOM node where the selection begins to match, has been found
                            start_range_node = textnode_map[i][2];
                            // How far out in the textnode does the selection actually begin (on compacted text, so only approx.)
                            //start_offset = start_pos - textnode_map[i][0];
                            console.debug(i + " " + textnode_map[i][0]);
                            // break out of iteration
                            i = 10000000;

                            // if the selection is fully contained inside the start node..
                            var indexofSelection = start_range_node.textContent.indexOf(selection_text);
                            console.debug("browsersolutions indexOfSelection (a '-1' means the match spans multiple nodes): " + indexofSelection);

                            if (indexofSelection > 0) {
                                // selection is fully contained inside start node
                                // start offset  is where the match begins
                                start_offset = indexofSelection;
                            } else {
                                // selection spans outside the start node
                                // The selection text will have some whitespace characters removed (line breaks, and tabs)
                                // to be able to make a match, the text must also have these replace with a single space (ascii 20)
                                // also multiple repeated shapce characters must be collapsed into just one.

                                console.debug("browsersolutions #determine overlap between")
                                //console.debug(selection_text.replace(/\W/g, ""));
                                //console.debug(selection_text.replace(/\w/g, ""));
                                console.debug(align_characterspace(selection_text));
                                console.debug("browsersolutions #and")
                                //console.debug(start_range_node.textContent.replace(/\W/g, ""))
                                //console.debug(start_range_node.textContent.replace(/\w/g, ""))
                                console.debug(start_range_node.textContent)
                                console.debug(align_characterspace(start_range_node.textContent))

                                var lcs = longest_common_substring(align_characterspace(selection_text), align_characterspace(start_range_node.textContent));
                                //console.debug(lcs);
                                console.debug("browsersolutions #found common section: " + lcs);
                                // look for the startOffset by frying the find where the overlaping piece fit.
                                start_offset = align_characterspace(start_range_node.textContent).indexOf(lcs);
                                console.debug("browsersolutions start_offset" + start_offset);
                            }
                        }
                        i++;
                    }
                } catch (e) {
                    console.error(e);
                }

                console.debug(start_range_node);
                console.debug(start_offset);
                // start_range_node now contains the DOM node where the selection range begins
                // add start node to output list
                //textnodelist.push(start_range_node);
                //console.debug(textnodelist);
                // find end node
                var end_pos = start_pos + selection_text.replace(/\s/g, "").length;
                console.debug("end pos: " + end_pos);
                // Step through the array of all text nodes to find the one that contains the end pos

                // When iterating though all textnodes, Start where left off when looking for start node
                try {
                    // put a cap on max nodes / array entries to examine
                    while (j < textnode_map.length && j < 5000) {
                        console.debug(j + " " + textnode_map[j][0] + " " + textnode_map[j][1]);
                        console.debug(textnode_map[j][2]);
                        console.debug((textnode_map[j][2]).parentNode);
                        textnodelist.push(textnode_map[j][2]);
                        console.debug(textnodelist);
                        // first occurrence the start pos, capture the node and exit the iteration
                        if ((textnode_map[j][0] <= end_pos) && (end_pos <= textnode_map[j][1])) {
                            //                	textnode_map[i][0];
                            end_range_node = textnode_map[j][2];
                            // who far from the begining of the textnode does the selection actually end (compacted text, so only approx.)

                            // match selection text on the text node and find the end of the overlap
                            // the selection text will in general begin prior to the text node and the textnode may match only a piece at the end of the selection

                            // find overlap of selection_text and endnode text
                            console.debug("determine overlap between");
                            const normalized_selection_text = align_characterspace(selection_text);
                            console.debug(normalized_selection_text);
                            console.debug("and");
                            const normalized_end_node_text = align_characterspace(end_range_node.textContent);
                            console.debug(normalized_end_node_text);
                            var lcs = longest_common_substring(normalized_selection_text, normalized_end_node_text);

                            console.debug("overlap is: " + lcs);
                            // compute where in the end node the match actually ends
                            // this will be the end of the section where the endnode and the selection text overlaps
                            //var indexofSelection = normalized_end_node_text.indexOf(normalized_selection_text);
                            var indexInSelection = normalized_end_node_text.indexOf(lcs);
                            console.debug(indexInSelection);

                            if (indexInSelection > 0) {
                                // if the selection text IS contained inside the
                                // the end offset is the start of the overlap match plus the length of it.
                                end_offset = indexInSelection + lcs.length;
                                console.debug(lcs.length);
                                console.debug(selection_text.length);
                            } else {

                                // If the selection text is NOT contained inside the end node
                                // the length of the common match is the end offset point in the endnode
                                end_offset = lcs.length;
                            }

                            //end_offset = textnode_map[j][1] - end_pos;
                            //console.debug(i + " " + textnode_map[i][0]);
                            // break out of iteration
                            j = 10000000;
                        }
                        j++;
                    }
                } catch (e) {
                    console.error(e);
                }
                const selection_matched_in_document = true;
                console.debug("browsersolutions: start_range_node");
                console.debug(start_range_node);
                console.debug(start_range_node.parentNode);
                console.debug("browsersolutions: start_offset");
                console.debug(start_offset);
                console.debug("browsersolutions: end_range_node");
                console.debug(end_range_node);
                console.debug(end_range_node.parentNode);
                console.debug("browsersolutions: end_offset");
                console.debug(end_offset);
                console.debug("textnodelist");
                console.debug(textnodelist);

                return {
                    selection_matched_in_document,
                    start_range_node,
                    start_offset,
                    end_range_node,
                    end_offset,
                    textnodelist
                }
            } else {
                // selection(text) was not found in the body text
                return null;
            }
        } else {
            return null;
        }

    } catch (e) {
        console.error(e);
        return;
    }

}

/* align whitespace */
function align_characterspace(one) {
    var two;
    return one.replace(/[\n\r\t]/g, " ").replace(/  */g, " ").replace(/[\)\?]/g, "");

}

function longest_common_substring(lcstest_raw, lcstarget_raw) {
    // ")" not supported
    //console.debug(lcstest_raw);
    //console.debug(lcstarget_raw);

    // remove some characters that would screw-up the matching if they are present
    var lcstest = lcstest_raw.replace(/[\)\?]/g, "");
    var lcstarget = lcstarget_raw.replace(/[\)\?]/g, "");

    //console.debug(lcstest);
    //console.debug(lcstarget);

    matchfound = 0
        lsclen = lcstest.length
        for (lcsi = 0; lcsi < lcstest.length; lcsi++) {
            lscos = 0
                for (lcsj = 0; lcsj < lcsi + 1; lcsj++) {
                    re = new RegExp("(?:.{" + lscos + "})(.{" + lsclen + "})", "i");
                    temp = re.test(lcstest);
                    re = new RegExp('(' + RegExp.$1 + ')', 'i');
                    if (re.test(lcstarget)) {
                        matchfound = 1;
                        result = RegExp.$1;
                        break;
                    }
                    lscos = lscos + 1;
                }
                if (matchfound == 1) {
                    return result;
                    break;
                }
                lsclen = lsclen - 1;
        }
        result = "";
    return result;
}

function replaceNoteType(note_root, new_note_type, isOwner, isNewNote) {
    console.debug("replaceNoteType.start");

    console.debug(note_root);
    console.debug(new_note_type);

    return new Promise(function (resolve, reject) {

        // get the note type select element
        const noteTypeSelect = note_root.querySelector('select[name="select_notetype"]');
        console.debug(noteTypeSelect);
        chrome.runtime.sendMessage({
            action: 'get_notetype_template',
            note_type: new_note_type
        }).then(function (response) {
            if (chrome.runtime.lastError) {
                resolve(reject(chrome.runtime.lastError));
            }
            console.debug(response);
            note_root.setAttribute("note_type", new_note_type);
            console.debug("calling updateNoteMiddleBar");
            console.debug(note_root);
            updateNoteMiddleBar(response, note_root);
            console.debug("calling updateNoteMiddleBar.done");
            console.debug("calling update_note_internal_size");
            update_note_internal_size(note_root);
            console.debug("calling noteTypeSpecificActions");
            noteTypeSpecificActions(new_note_type, note_root, null, isOwner, isNewNote);
            resolve(true);
        });

    });

}

function load_url(event) {
    if(function_call_debuging) console.debug("load_url");
    if(function_call_debuging)  console.debug(event);
    if(function_call_debuging) console.debug(event.target.parentNode);
    // get the root node of the note
    var note_root = getYellowStickyNoteRoot(event.target.parentNode);
    console.debug(note_root);
    return new Promise(function (resolve, reject) {
        console.debug(note_root.querySelector('input[name="urlInput"]'));
        const url = note_root.querySelector('input[name="urlInput"]').value;

        console.debug("#### perform url lookup on " + url);
        //console.debug(cont1);

        // check for content_url for notes that collect content from elsewhere
        try {
            //cont1.querySelector('input[name="urlInput"]').value = note_object_data.content_url;

            // start the process of looking up the content
            var content_iframe = note_root.querySelector('[name="contentframe"]');
            console.debug("content_iframe: ");
            console.debug(content_iframe);
            var resp;
            // send message to background serviceworker and it will lookup the URL. This is to bypass any CORS issues
            // Send save request back to background
            // Stickynotes are always enabled when created.
            console.debug("remote url: " + url);
            var msg;
            msg = {
                message: {
                    "action": "capturePage",
                    "url": url
                }
            };
            // capture the page as a static PNG image - the safe option
            msg = {
                action: 'capturePage',
                url: url,
                timeout: 4
            };
            msg = {
                message: {
                    "action": "simple_url_lookup",
                    "url": url
                }
            };
            console.debug(msg);

            chrome.runtime.sendMessage({ action: "captureTabAsPNG", url: url }, function(response) {
                if (response && response.dataUri) {
                  // Display the captured image
                 // document.getElementById("screenshot").src = response.dataUri;
            
                  // Optionally, you can use the data URI for other purposes
                  console.log(response.dataUri);
                }
              });

            if(function_call_debuging)  console.debug("sendmessage to background.js" + msg);
            chrome.runtime.sendMessage(msg).then(function (response) {
                resp = response;
                if(function_call_debuging)  console.debug("message sent to backgroup.js with response: " + response);
                // render content of the iframe based on returned data
                //console.debug(getYellowStickyNoteRoot(event.target));
                if(function_call_debuging) console.debug("calling setContentInIframe");
                setContentIntoIframe(content_iframe, response, "html");

                //set scroll position
                // the webframe is a window to another webpage. typically this target page is much larger than the note.
                // it is therefore convenient to be able to scroll to the desired position on the target page and show only the "selected" part.
                // a pair of coordinates captures the scroll position of the webframe
                // The parameters framenote_scroll_x and framenote_scroll_y are used to store the scroll position of the webframe
                var framenote_scroll_x = 0;
                try {
                    if (note_root.framenote_scroll_x !== undefined) {
                        framenote_scroll_x = note_root.framenote_scroll_x;
                        cont1.setAttribute("framenote_scroll_x", framenote_scroll_x);
                    }
                } catch (e) {
                    console.debug(e);
                }
                var framenote_scroll_y = 0;
                try {
                    if (note_root.framenote_scroll_y !== undefined) {
                        framenote_scroll_y = note_root.framenote_scroll_y;
                        cont1.setAttribute("framenote_scroll_y", framenote_scroll_y);
                    }
                } catch (e) {
                    console.debug(e);
                }
                console.debug("framescrollPosition: ", framenote_scroll_x, framenote_scroll_y);

                resolve(response);
            });

        } catch (e) {
            console.error(e);
        }
    });
}

function increaseVerticalDistanceUsingTop(element1, element2) {
    // Ensure that both elements are valid DOM elements
    if (!(element1 instanceof HTMLElement) || !(element2 instanceof HTMLElement)) {
        console.error("Invalid input: both arguments must be DOM elements.");
        return;
    }

    // Function to get the current top value or default to 0 if not set
    function getTopValue(element) {
        const top = window.getComputedStyle(element).top;
        return top !== 'auto' ? parseInt(top, 10) : 0;
    }

    // Get the current top value of the second element
    let topValue = getTopValue(element1);
    console.debug("browsersolutions: " + "topValue: " + topValue);

    // Increase the top value of the second element by 20px
    topValue += 120;

    console.debug("browsersolutions: " + "topValue: " + element2.style.top);

    // Apply the new top value
    element2.style.top = `${topValue}px`;
}

function nodesAreIdentical(node1, node2) {
    if(function_call_debuging)  console.debug("#nodesAreIdentical.start");
    if(function_call_debuging)  console.debug(node1);
    if(function_call_debuging) console.debug(node2);
    // Check if node types are the same
    if (node1.nodeType !== node2.nodeType)
        return false;

    // If they are element nodes, check the tag name
    if (node1.nodeType === Node.ELEMENT_NODE && node1.tagName !== node2.tagName)
        return false;

    // If they have different text content (for text nodes)
    if (node1.nodeType === Node.TEXT_NODE && node1.textContent !== node2.textContent)
        return false;

    // Check attributes
    if (node1.attributes && node2.attributes) {
        if (node1.attributes.length !== node2.attributes.length)
            return false;
        for (let i = 0; i < node1.attributes.length; i++) {
            const attr1 = node1.attributes[i];
            const attr2 = node2.getAttribute(attr1.name);
            if (attr1.value !== attr2)
                return false;
        }
    }

    // Check children nodes recursively
    const children1 = node1.childNodes;
    const children2 = node2.childNodes;
    if (children1.length !== children2.length)
        return false;
    for (let i = 0; i < children1.length; i++) {
        if (!nodesAreIdentical(children1[i], children2[i]))
            return false;
    }

    return true;
}

function getDOMplacement(selection_text) {
    if(function_call_debuging)  console.debug("getDOMplacement.start");
    var selection_matched_in_document = false;

    // start
    var start_range_node = null;
    var start_offset = 0;
    var textnodelist = [];
    // end
    var end_range_node = null;
    var end_offset = 0;
    if (selection_text !== undefined && selection_text.length > 0) {

        // scan page if it has not been done already
        // add a time check to avoid scanning the page too often

        //        if (whole_page_text === "") {
        console.debug("call scan page)=");
        scan_page();
        //      }


        //var message_display_text = note_obj.message_display_text;

        var msg = {};

        // using the position of the start of the selection text within the whole text, determine the start node where the selection begins
        // try to match the selection text to the text in the document
        console.debug("getDOMposition: " + "selection_text: " + selection_text);
        var one = getDOMposition(selection_text);
        console.debug("getDOMposition output: ");
        console.debug(one);
        // Now the starting node for the selection is found, as well as the end node (and character offset within the nodes)
        if (one === undefined || one === null) {
            console.debug("browsersolutions: " + "This is undefined");
            // not place to in the page to attach the note to. place it on top of the page
            //start_range_node = document.querySelector(':root');
            //start_offset = 0;
            // end
            //end_range_node = start_range_node;
            //end_offset = 0;
        } else {
            console.debug("browsersolutions: " + JSON.stringify(one));
            if (one.start_range_node === undefined) {
                console.debug("browsersolutions: unable to locate the selection text");
                // if the selection text in the note is not matchable on the page, something that will be a common occurence on dynamic sites, place the note on top of the page
                //start_range_node = null;
                //start_offset = 0;
                // end
                //end_range_node = start_range_node;
                //end_offset = 0;
            } else {
                selection_matched_in_document = true;
                start_range_node = one.start_range_node;
                end_range_node = one.end_range_node;
                start_offset = one.start_offset;
                end_offset = one.end_offset;
                textnodelist = one.textnodelist;
            }
        }
    } else {
        // No text selected in the note that can anchor the palcement of the note to the page. Place the note on top of the page
        //start_range_node = document.querySelector(':root');
        //start_offset = 0;
        // end
        //end_range_node = start_range_node;
        // end_offset = 0;
    }
    console.debug("start_range_node");
    console.debug(start_range_node);
    console.debug("end_range_node");
    console.debug(end_range_node);
    console.debug(textnodelist);
    return {
        selection_matched_in_document,
        start_range_node,
        start_offset,
        end_range_node,
        end_offset,
        textnodelist
    };
}

function findNodesBetween(startNode, endNode) {
    let nodes = [];
    let node = startNode;

    nodes.push(startNode);
    // Function to traverse the DOM
    const traverseDOM = (node) => {
        // Skip if the node is the end node
        if (node === endNode) {
            return false;
        }

        // Add the node if it's not the start node
        // if (node !== startNode) {
        nodes.push(node);
        // }

        // Check all child nodes
        let child = node.firstChild;
        while (child) {
            if (!traverseDOM(child)) {
                return false; // Stop if we reached the end node
            }
            child = child.nextSibling;
        }

        return true;
    };

    // Start traversing from the next node
    if (node) {
        node = node.nextSibling;
        while (node) {
            if (!traverseDOM(node)) {
                break;
            }
            node = node.nextSibling;
        }
    }

    return nodes;
}

// the session token is not completed as yet
function get_brand_from_sessiontoken(token) {
    try {
        return (JSON.parse(token)).brand;
    } catch (error) {
        return "default";
    }
}

// scan all the text on the page, with a view to later making a pattern match with the selected text contained in the note
function scan_page() {
    if(function_call_debuging)  console.debug("#scan_page.start");
    var doc = window.document,
    body = doc.body,
    selection,
    range,
    bodyText;
    //  console.debug(doc);
    //   console.debug(doc.nodeName);
    // root
    //var root_node = doc.documentElement;

    // reset the global variables that contain the document structure (for use in other functions)
    whole_page_text = "";
    textnode_map = [];
    //console.debug("1.2.0");

    // exec traversal
    var rc = traverse(doc.documentElement);
    //  The data describing the text structure of the document is now populated into textnode_map
    //console.debug("browsersolutions "+rc);

    console.debug("whole_page_text length: ", whole_page_text.length);
    //
    //console.debug(whole_page_text);

    // contain node object and the position within overall text (white space removed)

    console.debug(textnode_map);
    console.debug("textnode_map size: " + textnode_map.length);

}

// scan all the text on the page, with a view to later making a pattern match with the selected text contained in the note
function scan_page_new() {
    if(function_call_debuging)  console.debug("#scan_page.start");
    var doc = window.document,
    body = doc.body,
    selection,
    range,
    bodyText;
    //  console.debug(doc);
    //   console.debug(doc.nodeName);
    // root
    //var root_node = doc.documentElement;


    // Usage example
    //const rootElement = document.body; // Replace with the desired root element
    const result = extractTextAndNodes(doc.documentElement);
    console.debug(result);

    console.debug('PAGE_TEXT:', result.PAGE_TEXT);
    console.debug('DOC_ARR:', result.DOC_ARR);
    //console.debug(DOC_ARR);


    // reset the global variables that contain the document structure (for use in other functions)
    whole_page_text = result.PAGE_TEXT;
    textnode_map = [];
    //console.debug("1.2.0");

    // exec traversal
    // var rc = traverse(doc.documentElement);
    //  The data describing the text structure of the document is now populated into textnode_map
    //console.debug("browsersolutions "+rc);

    console.debug("whole_page_text length: ", whole_page_text.length);
    //
    console.debug(whole_page_text);

    // contain node object and the position within overall text (white space removed)

    console.debug(textnode_map);
    console.debug("textnode_map size: " + textnode_map.length);

}

function extractTextAndNodes(inputNode) {
    let PAGE_TEXT = '';
    let DOC_ARR = [];

    function traverse(node) {
        // Only process element and text nodes
        console.debug('Node tag:', node.tagName);
        console.debug('Node type:', node.nodeType);
        console.debug('node.childNodes:', node.childNodes);

        if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
            // Get the text content of the node
            const nodeText = node.textContent.trim(); // Use trim to remove any leading/trailing whitespace

            if (nodeText) {
                // Get the length of PAGE_TEXT before concatenation
                const startIndex = PAGE_TEXT.length;

                // Concatenate the text content to PAGE_TEXT
                PAGE_TEXT += nodeText;

                // Calculate the end index after concatenation
                const endIndex = PAGE_TEXT.length;

                // Get the tag name of the parent node
                const parentTagName = node.parentNode ? node.parentNode.tagName : null;

                // Create NODE_ARR array and push it to DOC_ARR
                const NODE_ARR = [startIndex, endIndex, node, parentTagName, nodeText];
                DOC_ARR.push(NODE_ARR);
            }

            // Recursively traverse child nodes
            node.childNodes.forEach(child => traverse(child));

            // Traverse the shadow DOM if it exists
            if (node.shadowRoot) {
                console.debug('Shadow DOM detected:', node);
                traverse(node.shadowRoot);
            }

            // Traverse the content of iframes if they exist and are accessible

            if (node.tagName === 'IFRAME') {
                console.debug('IFRAME detected:', node);
                try {
                    const iframeDoc = node.contentDocument || node.contentWindow.document;
                    if (iframeDoc) {
                        traverse(iframeDoc.body);
                    }
                } catch (e) {
                    console.error('Could not access iframe content:', e);
                }
            }
        }
    }

    // Start the traversal from the input node
    traverse(inputNode);

    // Return the results
    return {
        PAGE_TEXT: PAGE_TEXT,
        DOC_ARR: DOC_ARR
    };
} //

// create a node array of all text nodes present in the document, in document order
function traverse(elm) {
    // produce a string of all test concatenated
    //var text_str = "";
    // Produce an array of all nodes
    //console.debug("#traverse");
    // console.debug(elm);
    //  console.debug(elm.nodeType);
    //console.debug(elm.childNodes);

    if (elm.nodeType == Node.ELEMENT_NODE || elm.nodeType == Node.DOCUMENT_NODE) {
        //console.debug("1.0.1");

        // exclude elements with invisible text nodes
        if (isExcluded(elm)) {
            return
        }

        for (var i = 0; i < elm.childNodes.length; i++) {
            // recursively call to traverse
            traverse(elm.childNodes[i]);

        }

    } else if (elm.nodeType == Node.TEXT_NODE) {
        //  console.debug("1.0.2");
        // exclude text node consisting of only spaces
        if (elm.nodeValue.trim() == "") {
            return
        }

        // elm.nodeValue , here is visible text we need.
        // console.debug(elm.parentNode.tagName);
        //  console.debug(elm.nodeValue);
        var start_position = whole_page_text.length;
        whole_page_text = whole_page_text + elm.nodeValue.replace(/\s/g, "");
        var end_position = whole_page_text.length;
        textnode_map.push([start_position, end_position, elm, elm.parentNode.tagName]);
    }
    return [whole_page_text, textnode_map];

}

function isExcluded(elm) {
    //	console.debug("isExcluded")
    //	console.debug(elm );
    //	console.debug("elm.tagName: " + elm.tagName );
    //	console.debug("elm.tagName: " + elm.tagName.toUpperCase() );
    //    if (elm.tagName.toUpperCase() == "STYLE") {
    //        return true;
    //    }
    const one = elm.tagName.toUpperCase();
    if (one == "STYLE") {
        return true;
    } else if (one == "SCRIPT") {
        return true;
    } else if (one == "NOSCRIPT") {
        return true;
        // }else     if (one == "IFRAME") {
        //     return true;
        // }else     if (one == "OBJECT") {
        //     return true;
    }
    return false
}


function setContentIntoIframe(iframe, content, dataformat) {
    if(function_call_debuging) console.debug("# setContentIntoIframe.start");
    if(function_call_debuging) console.debug(iframe);
    if(function_call_debuging) console.debug(content);
    if(function_call_debuging) console.debug(dataformat);
// dataformat is either "png" or "html"
if (dataformat === 'png') {

    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(content);
    iframe.contentWindow.document.close();
  

} else if (dataformat === 'html') {
    //const iframe = document.getElementById(iframeId);
    if (iframe) {
      //  iframe.srcdoc = content; // Using srcdoc to set the content

         // Write the fetched HTML into the iframe
  iframe.contentWindow.document.open();
  iframe.contentWindow.document.write(content);
  iframe.contentWindow.document.close();

    } else {
        console.error('Iframe not found');
    }
}
}


/*
a note is minimized by changing the visibility of some parts of the note DOM tree
 */

function minimize_note(event) {
    if(function_call_debuging) console.debug("browsersolutions #minimize note");
    event.stopPropagation();
    const note = getYellowStickyNoteRoot(event.target);
    if(function_call_debuging) console.debug(note);

    // set flag to indicate note does not have it's "regular" size and should not have its size properties updated
    note.setAttribute('sizeproperties', "frozen");
    note.setAttribute('size', 'frozen');
    // determine if this is a brand new note, a note owned by the current user, or a nother the current user is subscribing to
    // this will have bearign on which button are to be displayed in the note footer

    console.debug("calling setComponentVisibility");
    setComponentVisibility(note, ",rw,.*minimized");
    //console.debug("calling attachEventlistenersToYellowStickynote");
    //attachEventlistenersToYellowStickynote(note);

    // set new size for note to be minimized
    if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
    setCSSAttributeOnNamedElement(note, 'whole_note_table', 'height', "26px");
            

    return;
    // step through all DOM nodes in the node and set to not visible, the ones that should not be displayed when the note is minimized.
    // only nodes with minimized="display" should be displayed when the note is minimized.
    // Select all elements in the DOM
    const allElements = note.querySelectorAll('[ minimized="notvisible" ]');
    // Iterate over the selected elements
    allElements.forEach(function (element) {
        // If the element does not have the attribute with the given value, set display to 'none'
        console.debug(element);
        element.style.display = 'none';
        console.debug("element has minimized attribute set to visible" + element);

    });

    // shrink the size of the note

    note.querySelector('table[name="whole_note_table"]').style.height = "30px";

    // replace the minimize icon, with the maximize one

    // get the minimize button
    const minimize_icon = note.querySelector('td[js_action="minimize_note"]');

    console.debug(minimize_icon);
    // swap event handler
    const myminimize_note = (event) => {
        minimize_note(event);
        event.stopPropagation();
    };

    const myrightsize_note = (event) => {
        rightsize_note(event);
        event.stopPropagation();
    };

    var td = document.createElement('td');
    td.setAttribute("js_action", "rightsize_note");
    td.setAttribute("class", "icon");
    //var textnode = document.createTextNode("max");
    //td.appendChild(textnode);

    var img = document.createElement('img');
    img.setAttribute("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAHYYAAB2GAV2iE4EAAABrSURBVFhH7dixCoAgFEDRZ0v//7m2WKAF5RR38A33wEPHi+JiaS1aJLaNNS0DqfSB0yMpZWwWuXpevGLKQMpAykDKQMpAykDKQMpAykDKQMpAykDqCay1z2rfDq/4r/3oc0t/gv5RUwYyESdp8RUPFGMofQAAAABJRU5ErkJggg==");
    img.setAttribute("alt", "max");
    img.setAttribute("style", "padding: 0px; height: 20px; width: 20px;");
    td.appendChild(img);

    minimize_icon.parentNode.insertBefore(td, minimize_icon.nextSibling);

    //minimize_icon.removeEventListener("click", myminimize_note);
    td.addEventListener("click", myrightsize_note);
    td.style.zIndex = '130';

    minimize_icon.parentNode.removeChild(minimize_icon);

    //console.debug(event);
}

function maximize_note(event) {
    // not yet implemented
    if(function_call_debuging)  console.debug("browsersolutions #maximize note");
    // set flag to indicate note does not have it's "regular" size and should not have its size properties updated
    note.setAttribute("sizeproperties", "frozen");
    const button_arrangment = note.getAttribute("button_arrangment");

    event.stopPropagation();

}

function rightsize_note(event) {
    event.stopPropagation();

    if(function_call_debuging) console.debug("browsersolutions #expand note to normal size");
    const note = getYellowStickyNoteRoot(event.target);
    console.debug(note);

    // set flag to indicate notehas it's "regular" size and its size properties can not be updated
    note.setAttribute("sizeproperties", "free");

    const button_arrangment = note.getAttribute("button_arrangment");

    console.debug("calling setComponentVisibility with button_arrangement: " + button_arrangment);
    setComponentVisibility(note, "," + button_arrangment + ",.*normalsized");
    //console.debug("calling attachEventlistenersToYellowStickynote");
    //attachEventlistenersToYellowStickynote(note);

    // restore original size for note to be minimized
    const original_height = note.getAttribute("box_height");
    if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );

    setCSSAttributeOnNamedElement(note, 'whole_note_table', 'height', original_height);
        
    

    return;

    const allElements = note.querySelectorAll('[ minimized="notvisible" ]');
    // Iterate over the selected elements
    allElements.forEach(function (element) {
        // If the element does not have the attribute with the given value, set display to 'none'
        // if (element.getAttribute('minimized') === "notvisible") {
        console.debug(element);
        element.style.display = 'inherit';
        console.debug("element has minimized attribute set to visible" + element);

        //}else{
        // }
    });

    // shrink the size of the note

    note.querySelector('table[name="whole_note_table"]').style.height = "250px";

    // get the rigtsize button
    const rigtsize_icon = note.querySelector('td[js_action="rightsize_note"]');
    console.debug(rigtsize_icon);

    var td = document.createElement('td');
    td.setAttribute("js_action", "minimize_note");
    td.setAttribute("class", "icon");

    //var textnode = document.createTextNode("min");
    //td.appendChild(textnode);
    var img = document.createElement('img');
    img.setAttribute("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAdhgAAHYYBXaITgQAAAJFJREFUWEftjjEKwDAMxPz/F2dLBaGTti5VoWAJo+lmby4MdiyBHUtgxxLYsQR2LIEdS2DHEtixBHYsgR1LYMcS2LEEdiyBHUtgxxLYsQR2LIEdS2DHEtixBHYsgR1LYMcS2LEEdiyBHUtgxxLYsQR2LIEdS2DHEvg8ax1m3uXe8Q98yncHVsGOJbBjCezYYfYFZAOuYDgLc3IAAAAASUVORK5CYII=");
    img.setAttribute("alt", "min");
    img.setAttribute("style", "padding: 0px; height: 20px; width: 20px;");
    td.appendChild(img);

    rigtsize_icon.parentNode.insertBefore(td, rigtsize_icon.nextSibling);

    const myminimize_note = (event) => {
        minimize_note(event);
        event.stopPropagation();
    };
    td.addEventListener("click", myminimize_note);
    td.style.zIndex = '130';

    rigtsize_icon.parentNode.removeChild(rigtsize_icon);
}

function close_note(event) {
    if(function_call_debuging) console.debug("# close yellownote (event)");
    // stop clicking anything behind the button
    event.stopPropagation();
    event.preventDefault();

    // call to kill the yellow note window

    // loop upwards from the target nodes to locate the root node for the sticky note

    const stickynote_rootnode = getYellowStickyNoteRoot(event.target);

    try {
        remove_note(stickynote_rootnode);

    } catch (e) {
        console.error(e);
    }
}

function close_noteid(noteid) {
    if(function_call_debuging) console.debug("# close yellownote: " + noteid);

    // loop upwards from the target nodes to locate the root node for the sticky note
    var note_root = document.querySelectorAll('[class][note_type][noteid="' + noteid + '"]')[0];
    console.debug(note_root);
    if (note_root == undefined) {
        try {
            remove_note(note_root);

            // Send mesage to backend to report the note closed/dismissed and record this in the database
            // The note will then note be automcatically reopened when the page is reloaded

            chrome.runtime.sendMessage({
                message: {
                    "action": "dismiss_note",
                    "noteid": noteid,
                    "enabled": false

                }
            }, function (response) {
                console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
                // finally, call "close" on the note
                //  try{
                //  	close_note(event);
                //  }catch(g){console.debug(g);}
                //remove_noteid(noteid);
            });

        } catch (e) {
            console.error(e);
        }
    }
}

// for subscribers: make the note no longer appear in context (only in the own subscriptions page)
function dismiss_note(event) {
    if(function_call_debuging) console.debug("# dismiss yellownote (event)");
    // stop clicking anything behind the button
    event.stopPropagation();
    event.preventDefault();

    // call to kill the yellow note window

    // loop upwards from the target nodes to locate the root node for the sticky note

    const stickynote_rootnode = getYellowStickyNoteRoot(event.target);

    try {
        var noteid = stickynote_rootnode.getAttribute("noteid");
        //console.debug();

        // call to background.js to record the note as read/dismissed - only for notes that are not new
        chrome.runtime.sendMessage({
            message: {
                "action": "dismiss_note",
                "noteid": noteid,
                "enabled": false

            }
        }, function (response) {
            console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
            // finally, call "close" on the note
            //  try{
            //  	close_note(event);
            //  }catch(g){console.debug(g);}
            remove_noteid(noteid);
        });

    } catch (e) {
        console.error(e);
    }
}

// contain node object and the position within overall text (white space removed)
var textnode_map = [];

// Usage
//const rawHTML = '<div><p>Safe content.</p><script>alert("XSS");</script></div>';
//const targetElement = document.getElementById('target-element');
//safeInjectHTML(rawHTML, targetElement);


function safeParseInnerHTML(rawHTML, targetElementName) {
    if(function_call_debuging) console.debug("# safeParseInnerHTML.start");
    // list of acceptable html tags


    // list of unacceptable html tags
    const unaccep = ["script"];

    unaccep.forEach(function (item, index) {
        console.debug(item);
    });

    const container = document.createElement(targetElementName);
    // Populate it with the raw HTML content
    //console.debug(rawHTML);
    container.innerHTML = rawHTML;
    console.debug(container);
    return container;
}

function makeDragAndResize(note, isOwner, isNewNote, isEditing) {
    if(function_call_debuging) console.debug("# makeDragAndResize.start");
    if(function_call_debuging)  console.debug("isOwner: " + isOwner);
    if(function_call_debuging) console.debug("isNewNote: " + isNewNote);
    if(function_call_debuging) console.debug("isEditing: " + isEditing);

    // set usefull defaults if the values are not set in the function call
    if (isOwner == null) {
        console.debug("isOwner is null");
        isOwner = false;
        console.debug("isOwner (default): " + isOwner);
    }
    if (isNewNote == null) {
        console.debug("isNewNote is null");
        isNewNote = true;
        console.debug("isNewNote (default): " + isNewNote);
    }
    if (isEditing == null) {
        console.debug("isEditing is null");
        if (isNewNote) {
            // new notes are allways in editing mode
            isEditing = true;
            console.debug("isEditing (default): " + isEditing);
        } else {
            if (isOwner) {
                // if the note is not new, it can still be in editing mode if the user is also the owner
                isEditing = true;
                console.debug("isEditing (default): " + isEditing);
            } else {
                isEditing = false;
                console.debug("isEditing (default): " + isEditing);
            }
        }
    }

    // which parts of the note is usable for dragging is affected by wether or not the note is in editing mode


    //document.addEventListener('DOMContentLoaded', function() {
    //const tableContainer = document.getElementById('tableContainer');

    // the margin within which the user can resize the note by dragging the edges
    const resizeBorderMargin = 5;

    let isDragging = false,
    isResizing = false;
    let startX,
    startY,
    startWidth,
    startHeight,
    startMiddleHeight,
    topBarFillerWidth,
    posx,
    posy;

    // note in editing mode should not have the drag-event handler on the middle bar (which is used for editing)
    const tableContainer = note.querySelector('[name="whole_note_table"]');

    // tableContainer.addEventListener('mousedown', startAction);
    // tableContainer.addEventListener('touchstart', startAction, {
    //     passive: false
    // });
    if (isEditing) {
        const topRow = note.querySelector('[name="whole_note_topbar"]');
        topRow.addEventListener('mousedown', startAction);
        topRow.addEventListener('touchstart', startAction, {
            passive: false
        });

        const middleRow = note.querySelector('tr[name="whole_note_middlebar"]');
        middleRow.removeEventListener('mousedown', startAction);
        middleRow.removeEventListener('touchstart', startAction, {
            passive: false
        });

        const bottomRow = note.querySelector('[name="whole_note_bottombar"]');
        bottomRow.addEventListener('mousedown', startAction);
        bottomRow.addEventListener('touchstart', startAction, {
            passive: false
        });
    } else {

        const topRow = note.querySelector('tr[name="whole_note_topbar"]');
        topRow.addEventListener('mousedown', startAction);
        topRow.addEventListener('touchstart', startAction, {
            passive: false
        });

        const middleRow = note.querySelector('tr[name="whole_note_middlebar"]');
        middleRow.addEventListener('mousedown', startAction);
        middleRow.addEventListener('touchstart', startAction, {
            passive: false
        });
        const bottomRow = note.querySelector('tr[name="whole_note_bottombar"]');
        bottomRow.addEventListener('mousedown', startAction);
        bottomRow.addEventListener('touchstart', startAction, {
            passive: false
        });

    }

    function startAction(e) {
        if(function_call_debuging)  console.debug("# startAction");

        // if this is on top of any buttons of drop down lists, in which case allow other events to take place

        console.debug(e);
        console.debug(e.target.tagName);

        if (e.target.tagName === 'SELECT' || e.target.tagName === 'OPTION') {
            console.debug("on top of a drop down list");
            // allow action on the drop down list
        } else if (e.target.tagName === 'TEXTAREA') {
            console.debug("on top of textarea");
            // allow action on the drop down list
        } else if (e.target.tagName === 'IMG') {
            // the click was on an image inside the note
            // is the image was an icon that has an action connection to it, then disallow the drag action
            console.debug("on top of an image");
            console.debug(e.target);
            console.debug(e.target.hasAttribute("js_action"));
            console.debug(e.target.getAttribute("js_action"));
        } else if (e.target.tagName === 'DIV' && e.target.getAttribute("name") === 'message_display_text') {
            // allow default action on the input field
            console.debug("allow default action on message_display_text field");

        } else if (e.target.tagName === 'INPUT') {
            // allow default action on the input field
        } else {
            // no action on the note
            // prevent action "behind" the note
            e.preventDefault();

        }

        //           e.stopPropagation();
        // add eventlisteners to terminate dragging/resizing
        document.addEventListener('mouseup', stopAction);
        document.addEventListener('touchend', stopAction);

        const rect = tableContainer.getBoundingClientRect();
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        startWidth = rect.width;
        startHeight = rect.height;
        startLeft = tableContainer.offsetLeft;
        startTop = tableContainer.offsetTop;

        const regex = /\d+/;
        const h = tableContainer.querySelector('[name="whole_note_middlebar"]').style.height;
        const resulth = h.match(regex);
        const number_h = resulth ? parseInt(resulth[0], 10) : null;
        startMiddleHeight = number_h;
        console.debug("startMiddleHeight: " + startMiddleHeight);

        console.debug(tableContainer.querySelector('[name="topbar_filler"]'));
        const w = tableContainer.querySelector('[name="topbar_filler"]').style.width;
        const resultw = w.match(regex);
        const number_w = resultw ? parseInt(resultw[0], 10) : null;
        topBarFillerWidth = number_w;
        console.debug("topBarFillerWidth: " + topBarFillerWidth);

        // Check if the action is near the border (within set number of px)
        // Check if the action is near any edge (within 5px)
        const nearLeftEdge = startX - rect.left <= 5;
        const nearTopEdge = startY - rect.top <= 5;
        const nearRightEdge = rect.right - startX <= 5;
        const nearBottomEdge = rect.bottom - startY <= 5;

        if (nearRightEdge || nearBottomEdge || nearLeftEdge || nearTopEdge) {
            // Start resizing
            console.debug("# start resizing");
            isResizing = true;
            tableContainer.addEventListener('mousemove', resize);
            tableContainer.addEventListener('touchmove', resize, {
                passive: false
            });
        } else {
            // Start dragging
            console.debug("# start dragging");
            isDragging = true;
            tableContainer.addEventListener('mousemove', drag);
            tableContainer.addEventListener('touchmove', drag, {
                passive: false
            });
        }

    }

    function drag(e) {
        if(function_call_debuging) console.debug("# drag: " + isDragging);
        if (isDragging) {
            const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            const dx = currentX - startX;
            const dy = currentY - startY;
            posx = tableContainer.offsetLeft + dx
                tableContainer.style.left = (tableContainer.offsetLeft + dx) + 'px';
            posy = tableContainer.offsetTop + dy
                tableContainer.style.top = (tableContainer.offsetTop + dy) + 'px';
            startX = currentX;
            startY = currentY;
        }
    }

    function resize(e) {
        if(function_call_debuging) console.debug("# resize: " + isResizing);
        if (isResizing) {
            const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            const dx = currentX - startX;
            const dy = currentY - startY;

            console.debug(topBarFillerWidth);
            console.debug(currentX);
            console.debug(startX);

            console.debug("topBarFillerWidth: " + (topBarFillerWidth + currentX - startX) + 'px');
            // update the width of the filler that padds out the top bar enough to place the icons over in the right corner
            tableContainer.querySelector('[name="topbar_filler"]').style.width = (topBarFillerWidth + currentX - startX) + 'px';
            console.debug("startMiddleHeight: " + (startMiddleHeight + currentY - startY) + 'px');

            tableContainer.querySelector('[name="whole_note_middlebar"]').style.height = (startMiddleHeight + currentY - startY) + 'px';

            if (startX - tableContainer.offsetLeft <= 5) {
                tableContainer.style.width = (startWidth - dx) + 'px';
                tableContainer.style.left = (startLeft + dx) + 'px';
            } else {
                tableContainer.style.width = (startWidth + dx) + 'px';
            }

            if (startY - tableContainer.offsetTop <= 5) {
                tableContainer.style.height = (startHeight - dy) + 'px';
                tableContainer.style.top = (startTop + dy) + 'px';
            } else {
                tableContainer.style.height = (startHeight + dy) + 'px';
            }
        }
    }

    function stopAction() {
        if(function_call_debuging) console.debug("# stopAction.start");
        isDragging = false;
        isResizing = false;

        // update the note object internal structure with the new size information
        //console.debug("startMiddleHeight: " +  (startMiddleHeight + currentY - startY) + 'px');

        console.debug(note);
        console.debug(posx);
        console.debug(posy);
        //console.debug(note);
        // store the new position coordinates with root node of the note object
        if (!isUndefined(posx) && !isUndefined(posy)) {
            console.debug("update the position properties of the note root node");
            note.setAttribute("posx", posx + "px");
            note.setAttribute("posy", posy + "px");

        } {
            console.debug("do NOT update the position properties of the note object, as there are no new values.");
        }

        // whole_note_middlebar


        // store the new size information in the note object

        console.debug("sizeproperties: " + note.getAttribute("sizeproperties"));
        if (note.getAttribute("sizeproperties") === "frozen") {
            console.debug("do NOT update the size properties of the note object, as it is frozen.");
        } else {

            console.debug("free to update the size properties of the note object");

            //console.debug(note);
            //console.debug(note.querySelector('[name="box_width"]'));
            const regex = /\d+/;
            const w = tableContainer.style.width;
            const resultw = w.match(regex);
            const number_w = resultw ? parseInt(resultw[0], 10) : null;
            //console.debug(number_w);
            note.setAttribute("box_width", number_w + "px");
            const h = tableContainer.style.height;
            const resulth = h.match(regex);
            const number_h = resulth ? parseInt(resulth[0], 10) : null;
            console.debug("box_height: " + number_h);
            note.setAttribute("box_height", number_h + "px");
            // update the message field height to track the note expasion
            //var message_field = note.querySelector('[name="message_display_text"]');
            //console.debug(message_field);
            console.debug("calling update_note_internal_size");
            update_note_internal_size(note);

            tableContainer.removeEventListener('mousemove', drag);
            tableContainer.removeEventListener('touchmove', drag);
            tableContainer.removeEventListener('mousemove', resize);
            tableContainer.removeEventListener('touchmove', resize);
            document.removeEventListener('mouseup', stopAction);
            document.removeEventListener('touchend', stopAction);
        }
        //});

    }

}

function DELETEmakeDragable(note) {
    console.debug("# makeDragable.start");

    //document.addEventListener('DOMContentLoaded', function() {
    //const tableContainer = document.getElementById('tableContainer');

    // the margin within which the user can resize the note by dragging the edges
    const resizeBorderMargin = 5;

    /**
     * not the hole notw can be used for dragging the note
     *
     */
    const tableContainer = note.querySelector('[name="whole_note_table"]');

    //tableContainer.addEventListener('mousedown', startAction);
    //tableContainer.addEventListener('touchstart', startAction, {
    //    passive: false
    //});

    const topRow = note.querySelector('[name="whole_note_topbar"]');
    topRow.addEventListener('mousedown', startAction);
    topRow.addEventListener('touchstart', startAction, {
        passive: false
    });

    // add eventlisteners to terminate dragging/resizing
    topRow.addEventListener('mouseup', stopAction);
    topRow.addEventListener('touchend', stopAction);

    const bottomRow = note.querySelector('[name="whole_note_bottombar"]');
    bottomRow.addEventListener('mousedown', startAction);
    bottomRow.addEventListener('touchstart', startAction, {
        passive: false
    });

    // add eventlisteners to terminate dragging/resizing
    document.addEventListener('mouseup', stopAction);
    document.addEventListener('touchend', stopAction);

    let isDragging = false,
    isResizing = false;
    let startX,
    startY,
    startWidth,
    startHeight,
    startMiddleHeight,
    topBarFillerWidth,
    posx,
    posy;

    function startAction(e) {
        console.debug("# startAction");

        // if this is on top of any buttons of drop down lists, in which case allow other events to take place

        console.debug(e);
        console.debug(e.target.tagName);
        console.debug(e.target);

        if (e.target.tagName === 'SELECT' || e.target.tagName === 'OPTION') {
            console.debug("on top of a drop down list");
            // allow action on the drop down list
        } else if (e.target.tagName === 'TEXTAREA') {
            console.debug("on top of textarea");
            // allow action on the drop down list
        } else if (e.target.tagName === 'CANVAS') {
            console.debug("on top of convas");
            // allow action on the drop down list
        } else if (e.target.tagName === 'IMG') {
            // the click was on an image inside the note
            // is the image was an icon that has an action connection to it, then disallow the drag action
            console.debug("on top of an image");
            console.debug(e.target);
            console.debug(e.target.hasAttribute("js_action"));
            console.debug(e.target.getAttribute("js_action"));

        } else if (e.target.tagName === 'INPUT') {
            // allow default action on the input field
        } else if (e.target.tagName === 'DIV' && e.target.getAttribute("name") === 'message_display_text') {
            // allow default action on the input field
            console.debug("allow default action on message_display_text field");
        } else {
            // no action on the note
            // prevent action "behind" the note
            e.preventDefault();

        }

        // check if the cursor is on any part of the note that should be draggable (for instance: the canvas element)
        const noDrag = false;

        if (e.target.tagName === 'CANVAS') {
            console.debug("on top of convas, do not drag (this limitation for note owner only ?)");
            noDrag = true;
        }
        //           e.stopPropagation();
        // add eventlisteners to terminate dragging/resizing
        //document.addEventListener('mouseup', stopAction);
        //document.addEventListener('touchend', stopAction);

        const rect = tableContainer.getBoundingClientRect();
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        startWidth = rect.width;
        startHeight = rect.height;
        startLeft = tableContainer.offsetLeft;
        startTop = tableContainer.offsetTop;

        const regex = /\d+/;
        const h = tableContainer.querySelector('[name="whole_note_middlebar"]').style.height;
        const resulth = h.match(regex);
        const number_h = resulth ? parseInt(resulth[0], 10) : null;
        startMiddleHeight = number_h;
        console.debug("startMiddleHeight: " + startMiddleHeight);

        console.debug(tableContainer.querySelector('[name="topbar_filler"]'));
        const w = tableContainer.querySelector('[name="topbar_filler"]').style.width;
        const resultw = w.match(regex);
        const number_w = resultw ? parseInt(resultw[0], 10) : null;
        topBarFillerWidth = number_w;
        console.debug("topBarFillerWidth: " + topBarFillerWidth);

        // Check if the action is near the border (within set number of px)
        // Check if the action is near any edge (within 5px)
        const nearLeftEdge = startX - rect.left <= 5;
        const nearTopEdge = startY - rect.top <= 5;
        const nearRightEdge = rect.right - startX <= 5;
        const nearBottomEdge = rect.bottom - startY <= 5;

        //  if (nearRightEdge || nearBottomEdge || nearLeftEdge || nearTopEdge) {
        //      // Start resizing
        //      console.debug("# start resizing");
        //       isResizing = true;
        //       tableContainer.addEventListener('mousemove', resize);
        //       tableContainer.addEventListener('touchmove', resize, {
        //           passive: false
        //       });
        //   } else {
        if (!noDrag) {
            // Start dragging
            console.debug("# start dragging");
            isDragging = true;
            tableContainer.addEventListener('mousemove', drag);
            tableContainer.addEventListener('touchmove', drag, {
                passive: false
            });
        }
        //   }

    }

    function drag(e) {
        console.debug("# drag: " + isDragging);
        if (isDragging) {
            const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            const dx = currentX - startX;
            const dy = currentY - startY;
            posx = tableContainer.offsetLeft + dx
                tableContainer.style.left = (tableContainer.offsetLeft + dx) + 'px';
            posy = tableContainer.offsetTop + dy
                tableContainer.style.top = (tableContainer.offsetTop + dy) + 'px';
            startX = currentX;
            startY = currentY;
        }
    }

    function resize(e) {
        console.debug("# resize: " + isResizing);
        if (isResizing) {
            const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            const dx = currentX - startX;
            const dy = currentY - startY;

            console.debug(topBarFillerWidth);
            console.debug(currentX);
            console.debug(startX);

            console.debug("topBarFillerWidth: " + (topBarFillerWidth + currentX - startX) + 'px');
            // update the width of the filler that padds out the top bar enough to place the icons over in the right corner
            tableContainer.querySelector('[name="topbar_filler"]').style.width = (topBarFillerWidth + currentX - startX) + 'px';
            console.debug("startMiddleHeight: " + (startMiddleHeight + currentY - startY) + 'px');

            tableContainer.querySelector('[name="whole_note_middlebar"]').style.height = (startMiddleHeight + currentY - startY) + 'px';

            if (startX - tableContainer.offsetLeft <= 5) {
                tableContainer.style.width = (startWidth - dx) + 'px';
                tableContainer.style.left = (startLeft + dx) + 'px';
            } else {
                tableContainer.style.width = (startWidth + dx) + 'px';
            }

            if (startY - tableContainer.offsetTop <= 5) {
                tableContainer.style.height = (startHeight - dy) + 'px';
                tableContainer.style.top = (startTop + dy) + 'px';
            } else {
                tableContainer.style.height = (startHeight + dy) + 'px';
            }
        }
    }

    function stopAction() {
        isDragging = false;
        isResizing = false;

        // update the note object internal structure with the new size information
        //console.debug("startMiddleHeight: " +  (startMiddleHeight + currentY - startY) + 'px');

        console.debug(note);
        console.debug(posx);
        console.debug(posy);
        //console.debug(note);
        // store the new position coordinates with root node of the note object
        if (!isUndefined(posx) && !isUndefined(posy)) {
            console.debug("update the position properties of the note root node");
            note.setAttribute("posx", posx + "px");
            note.setAttribute("posy", posy + "px");

        } {
            console.debug("do NOT update the position properties of the note object, as there are no new values.");
        }

        // whole_note_middlebar


        // store the new size information in the note object

        console.debug("sizeproperties: " + note.getAttribute("sizeproperties"));
        if (note.getAttribute("sizeproperties") === "frozen") {
            console.debug("do NOT update the size properties of the note object, as it is frozen.");
        } else {

            console.debug("free to update the size properties of the note object");

            //console.debug(note);
            //console.debug(note.querySelector('[name="box_width"]'));
            const regex = /\d+/;
            const w = tableContainer.style.width;
            const resultw = w.match(regex);
            const number_w = resultw ? parseInt(resultw[0], 10) : null;
            //console.debug(number_w);
            note.setAttribute("box_width", number_w + "px");
            const h = tableContainer.style.height;
            const resulth = h.match(regex);
            const number_h = resulth ? parseInt(resulth[0], 10) : null;
            console.debug("box_height: " + number_h);
            note.setAttribute("box_height", number_h + "px");

            tableContainer.removeEventListener('mousemove', drag);
            tableContainer.removeEventListener('touchmove', drag);
            tableContainer.removeEventListener('mousemove', resize);
            tableContainer.removeEventListener('touchmove', resize);
            document.removeEventListener('mouseup', stopAction);
            document.removeEventListener('touchend', stopAction);
        }
        //});

    }

}

/**
 *
 * @param {*} note
 *
 * set event handler that lets the user rezie the node by dragging the edges
 */
function DELETEmakeResizeable(note) {
    console.debug("# makeResizeable.start");

    //document.addEventListener('DOMContentLoaded', function() {
    //const tableContainer = document.getElementById('tableContainer');

    // the margin within which the user can resize the note by dragging the edges
    const resizeBorderMargin = 5;

    const tableContainer = note.querySelector('[name="whole_note_table"]');
    //console.debug(tableContainer);
    let isDragging = false,
    isResizing = false;
    let startX,
    startY,
    startWidth,
    startHeight,
    startMiddleHeight,
    topBarFillerWidth,
    posx,
    posy;

    tableContainer.addEventListener('mousedown', startAction);
    tableContainer.addEventListener('touchstart', startAction, {
        passive: false
    });

    function startAction(e) {
        console.debug("# startAction");

        // if this is on top of any buttons of drop down lists, in which case allow other events to take place

        console.debug(e);
        console.debug(e.target.tagName);
        console.debug(e.target);
        console.debug(e.target.getAttribute("name"));
        // in the case of canvas notes, the user should be able to draw on the canvas, and not drag the note when doing so

        if (e.target.tagName === 'SELECT' || e.target.tagName === 'OPTION') {
            console.debug("on top of a drop down list");
            // allow action on the drop down list
        } else if (e.target.tagName === 'CANVAS') {
            console.debug("on top of canvas");

        } else if (e.target.tagName === 'TEXTAREA') {
            console.debug("on top of textarea");
            // allow action on the drop down list
        } else if (e.target.tagName === 'IMG') {
            // the click was on an image inside the note
            // is the image was an icon that has an action connection to it, then disallow the drag action
            console.debug("on top of an image");
            console.debug(e.target);
            console.debug(e.target.hasAttribute("js_action"));
            console.debug(e.target.getAttribute("js_action"));
        } else if (e.target.tagName === 'DIV' && e.target.getAttribute("name") === 'message_display_text') {
            // allow default action on the input field
            console.debug("allow default action on message_display_text field");

        } else if (e.target.tagName === 'INPUT') {
            // allow default action on the input field
            console.debug("allow default action on input field");
        } else {
            // no action on the note
            // prevent action "behind" the note
            console.debug("no action on the note- revent action 'behind' the note");
            e.preventDefault();

        }

        //           e.stopPropagation();
        // add eventlisteners to terminate dragging/resizing
        document.addEventListener('mouseup', stopAction);
        document.addEventListener('touchend', stopAction);

        const rect = tableContainer.getBoundingClientRect();
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        startWidth = rect.width;
        startHeight = rect.height;
        startLeft = tableContainer.offsetLeft;
        startTop = tableContainer.offsetTop;

        const regex = /\d+/;
        const h = tableContainer.querySelector('[name="whole_note_middlebar"]').style.height;
        const resulth = h.match(regex);
        const number_h = resulth ? parseInt(resulth[0], 10) : null;
        startMiddleHeight = number_h;
        console.debug("startMiddleHeight: " + startMiddleHeight);

        console.debug(tableContainer.querySelector('[name="topbar_filler"]'));
        const w = tableContainer.querySelector('[name="topbar_filler"]').style.width;
        const resultw = w.match(regex);
        const number_w = resultw ? parseInt(resultw[0], 10) : null;
        topBarFillerWidth = number_w;
        console.debug("topBarFillerWidth: " + topBarFillerWidth);

        // Check if the action is near the border (within set number of px)
        // Check if the action is near any edge (within 5px)
        const nearLeftEdge = startX - rect.left <= 5;
        const nearTopEdge = startY - rect.top <= 5;
        const nearRightEdge = rect.right - startX <= 5;
        const nearBottomEdge = rect.bottom - startY <= 5;

        if (nearRightEdge || nearBottomEdge || nearLeftEdge || nearTopEdge) {
            // Start resizing
            console.debug("# start resizing");
            isResizing = true;
            tableContainer.addEventListener('mousemove', resize);
            tableContainer.addEventListener('touchmove', resize, {
                passive: false
            });
            //} else {
            //  // Start dragging
            //   console.debug("# start dragging");
            //   isDragging = true;
            //tableContainer.addEventListener('mousemove', drag);
            //tableContainer.addEventListener('touchmove', drag, {
            //    passive: false
            //});
        }

    }

    function drag(e) {
        console.debug("# drag: " + isDragging);
        if (isDragging) {
            const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            const dx = currentX - startX;
            const dy = currentY - startY;
            posx = tableContainer.offsetLeft + dx
                tableContainer.style.left = (tableContainer.offsetLeft + dx) + 'px';
            posy = tableContainer.offsetTop + dy
                tableContainer.style.top = (tableContainer.offsetTop + dy) + 'px';
            startX = currentX;
            startY = currentY;
        }
    }

    function resize(e) {
        console.debug("# resize: " + isResizing);
        if (isResizing) {
            const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            const dx = currentX - startX;
            const dy = currentY - startY;

            console.debug(topBarFillerWidth);
            console.debug(currentX);
            console.debug(startX);

            console.debug("topBarFillerWidth: " + (topBarFillerWidth + currentX - startX) + 'px');
            // update the width of the filler that padds out the top bar enough to place the icons over in the right corner
            //tableContainer.querySelector('[name="topbar_filler"]').style.width = (topBarFillerWidth + currentX - startX) + 'px';
            

            if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
            setCSSAttributeOnNamedElement(tableContainer, 'topbar_filler', 'width', (topBarFillerWidth + currentX - startX) + 'px');

            console.debug("startMiddleHeight: " + (startMiddleHeight + currentY - startY) + 'px');

            //tableContainer.querySelector('[name="whole_note_middlebar"]').style.height = (startMiddleHeight + currentY - startY) + 'px';
            if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
        setCSSAttributeOnNamedElement(tableContainer, 'whole_note_middlebar', 'height', (startMiddleHeight + currentY - startY) + 'px');

            if (startX - tableContainer.offsetLeft <= 5) {
                //tableContainer.style.width = (startWidth - dx) + 'px';
                if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
                setCSSAttributeOnNamedElement(note, 'whole_note_table', 'width', (startWidth - dx) + 'px');
                //tableContainer.style.left = (startLeft + dx) + 'px';
                if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
                setCSSAttributeOnNamedElement(note, 'whole_note_table', 'left', (startLeft + dx) + 'px');

            } else {
                //tableContainer.style.width = (startWidth + dx) + 'px';
                if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
                setCSSAttributeOnNamedElement(note, 'whole_note_table', 'width',  (startWidth + dx) + 'px');

            }

            if (startY - tableContainer.offsetTop <= 5) {
                //tableContainer.style.height = (startHeight - dy) + 'px';
                if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
                setCSSAttributeOnNamedElement(note, 'whole_note_table', 'height', (startHeight - dy) + 'px');
                //tableContainer.style.top = (startTop + dy) + 'px';
                if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
                setCSSAttributeOnNamedElement(note, 'whole_note_table', 'top',  (startTop + dy) + 'px');

            } else {
                //tableContainer.style.height = (startHeight + dy) + 'px';
                if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
                setCSSAttributeOnNamedElement(note, 'whole_note_table', 'height', (startHeight + dy) + 'px');

            }
        }
    }

    function stopAction() {
        isDragging = false;
        isResizing = false;

        // update the note object internal structure with the new size information
        //console.debug("startMiddleHeight: " +  (startMiddleHeight + currentY - startY) + 'px');

        console.debug(note);
        console.debug(posx);
        console.debug(posy);
        //console.debug(note);
        // store the new position coordinates with root node of the note object
        if (!isUndefined(posx) && !isUndefined(posy)) {
            console.debug("update the position properties of the note root node");
            note.setAttribute("posx", posx + "px");
            note.setAttribute("posy", posy + "px");

        } {
            console.debug("do NOT update the position properties of the note object, as there are no new values.");
        }

        // whole_note_middlebar


        // store the new size information in the note object

        console.debug("sizeproperties: " + note.getAttribute("sizeproperties"));
        if (note.getAttribute("sizeproperties") === "frozen") {
            console.debug("do NOT update the size properties of the note object, as it is frozen.");
        } else {

            console.debug("free to update the size properties of the note object");

            //console.debug(note);
            //console.debug(note.querySelector('[name="box_width"]'));
            const regex = /\d+/;
            const w = tableContainer.style.width;
            const resultw = w.match(regex);
            const number_w = resultw ? parseInt(resultw[0], 10) : null;
            //console.debug(number_w);
            note.setAttribute("box_width", number_w + "px");
            const h = tableContainer.style.height;
            const resulth = h.match(regex);
            const number_h = resulth ? parseInt(resulth[0], 10) : null;
            console.debug("box_height: " + number_h);
            note.setAttribute("box_height", number_h + "px");
            // update the message field height to track the note expasion
            //var message_field = note.querySelector('[name="message_display_text"]');
            //console.debug(message_field);
            console.debug("calling update_note_internal_size");
            update_note_internal_size(note);

            tableContainer.removeEventListener('mousemove', drag);
            tableContainer.removeEventListener('touchmove', drag);
            tableContainer.removeEventListener('mousemove', resize);
            tableContainer.removeEventListener('touchmove', resize);
            document.removeEventListener('mouseup', stopAction);
            document.removeEventListener('touchend', stopAction);
        }
        //});

    }

}

/**
 * the cavnas needs a toolbar, do not place this within the note, but expand the note to accomodate this toolbar
 */
const canvas_toolbar_height = 100;

/*
 * serialize the note object into a form which is suitable for pasting into chat messages, email and the like.
 *
 */

function copy_note_to_clipboard(event) {
    console.debug("### copy yellow note to clipboard");
    // stop clicking anything behind the button
    event.stopPropagation();

    // call to copye not to clipboard

    // loop upwards from the target nodes to locate the root node for the sticky note

    const root_note = getYellowStickyNoteRoot(event.target);
    //console.debug(root_note);
    /*
    try {
    // use the event target to loop the top node of the note object.
    // call remove of this node

    var stickynote_node = null;

    var t = event.target;
    var i = 0;
    while (i < 12) {
    i++;
    console.debug(t);
    console.debug(isSticyNoteRoot(t));

    if (isSticyNoteRoot(t)) {
    stickynote_node = t;
    // exit the loop
    i = 100;
    }
    // iterate one level up
    t = t.parentNode
    }
    } catch (e) {
    console.error(e);
    }
     */

    try {

        //console.debug(stickynote_node);

        //console.debug("1.2.1");
        //if (isSticyNoteRoot(stickynote_node)) {
        //console.debug("copy...");
        //console.debug(stickynote_node);

        var out = NoteDOM2JSON(root_note);

        // redact certain fields of the note object from the output data

        console.debug(out);
        console.debug(JSON.stringify(out));

        delete (out.lastmodifiedtime);
        delete (out.createtime);
        delete (out.enabled);

        // either redact completely or rewrite the noteid

        console.debug(JSON.stringify(out));
        console.debug(encodeURIComponent(JSON.stringify(out)));
        /* Copy the text inside the text field */

        // serialize the yellow note

        //ser_json_note = JSON.stringify(out).replace(/":"/g,"__del__").replace(/","/g,"__sep__").replace(/\{"/g,"__left__").replace(/"\}/g,"__right__");

        //ser_json_note = encodeURI(JSON.stringify(out).replace(/":"/g,"__del__").replace(/","/g,"__sep__"));

        updateClipboard(yellowstockynote_text_opening + encodeURIComponent(JSON.stringify(out)) + yellowstockynote_text_closing);

        //}
    } catch (e) {
        console.error(e);
    }

}

// extract the essential fields from the note DOM object and return them as a JSON object
function NoteDOM2JSON(note) {
    if(function_call_debuging) console.debug("# NoteDOM2JSON");
    if(function_call_debuging) console.debug(note);
    try {

        console.debug(note.querySelector('[name="url"]').textContent);

        //const posx = processBoxParameterInput(note.querySelector('[name="posx"]'), 0, 0, 1200);
        //const posy = processBoxParameterInput(note.querySelector('[name="posy"]'), 0, 0, 5000);
        //const box_width = processBoxParameterInput(note.querySelector('[name="box_width"]'), 250, 50, 500);
        //         const box_height = processBoxParameterInput(note.querySelector('[name="box_height"]'), 250, 50, 500);

        const box_height = note.querySelector('[name="box_height"]');
        const posx = note.querySelector('[name="posx"]');
        const posy = note.querySelector('[name="posy"]');
        const box_width = note.querySelector('[name="box_width"]');

        var message_display_text = "";
        try {
            if (note.querySelector('[name="message_display_text"]')) {

                message_display_text = utf8_to_b64(note.querySelector('[name="message_display_text"]').innerHTML);
            }

        } catch (e) {
            console.error(e);
        }
        var selection_text = "";
        try {
            selection_text = utf8_to_b64(note.querySelector('[name="selection_text"]').value.trim());

        } catch (e) {
            console.error(e);
        }

        var output = {
            noteid: note.getAttribute('noteid'),
            message_display_text: message_display_text,
            selection_text: selection_text,
            posx: posx,
            note_type: note.getAttribute("note_type"),
            posy: posy,
            box_width: note.getAttribute('box_width'),
            box_height: note.getAttribute('box_height')
        }
        console.debug(output);
        return output;
    } catch (e) {
        console.error(e);
    }

    // createtime: note.querySelector('[name="createtime"]').textContent,
    //   lastmodifiedtime: note.querySelector('[name="lastmodifiedtime"]')


}

/**
 *
 */

var yellowstockynote_text_opening = "yellownote=";
var yellowstockynote_text_closing = "=yellownote";

function isSticyNoteRoot(ele) {
    if(function_call_debuging) console.debug("# isSticyNoteRoot");
    if(function_call_debuging) console.debug(ele.nodeType);
    if(function_call_debuging) console.debug(ele.nodeName);
    if(function_call_debuging) console.debug(ele.getAttribute("type"));

    try {
        if (ele.nodeName == "CONTAINER" && ele.getAttribute("type") == "yellownote") {
            return true;

        } else {
            return false;
        }
    } catch (e) {
        console.error(e);
        return false;
    }

}

function updateClipboard(newClip) {
    navigator.clipboard.writeText(newClip).then(function () {
        /* clipboard successfully set */
    }, function () {
        /* clipboard write failed */
    });
}

/* locate the X-position on the page for element */
function divOffset_x(el) {
    var rect = el.getBoundingClientRect();
    //console.debug(rect);
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    //console.debug(scrollLeft);
    // scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return (rect.right + scrollLeft);
}

/* locate the Y-position on the page for element */
function divOffset_y(el) {
    console.debug("# divOffset_y");
    var rect = el.getBoundingClientRect();
    //console.debug(rect);
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    //console.debug(scrollTop);
    return (rect.top + scrollTop);
}

function ignore(elm) {
    //	console.debug("isExcluded")
    //	console.debug(elm );
    //console.debug("elm.tagName: " + elm.tagName );
    //	console.debug("elm.tagName: " + elm.tagName.toUpperCase() );
    if (elm.tagName.toUpperCase() == "STYLE") {
        return true;
    }
    if (elm.tagName.toUpperCase() == "SCRIPT") {
        return true;
    }
    if (elm.tagName.toUpperCase() == "NOSCRIPT") {
        return true;
    }
    if (elm.tagName.toUpperCase() == "IFRAME") {
        return true;
    }
    if (elm.tagName.toUpperCase() == "OBJECT") {
        return true;
    }
    if (elm.tagName.toUpperCase() == "YELLOWSTICKYNOTE") {
        return true;
    }
    return false
}

// check if a yellownote is already on the page
function isNoteOnPage(noteid) {
    if(function_call_debuging) console.debug("isNoteOnPage (" + noteid + ") ?");
    console.debug(document.querySelectorAll('[noteid="' + noteid + '"]'));
    const result = (document.querySelectorAll('[noteid="' + noteid + '"][class="yellownotecontainer"]').length > 0);
    console.debug("isNoteOnPage (" + noteid + ")", result);

    return result;
}

/**
 *
 * @param {*} input
 * @param {*} fallback
 * @returns
 */
function processBoxParameterInput(input, fallback, lowerLimit, upperLimit) {

    let number;

    if (typeof input === 'string') {
        number = Number(input);
        if (isNaN(number)) {
            return fallback;
        }
    } else if (typeof input === 'number') {
        number = input;
    } else {
        return fallback;
    }

    if (Number.isInteger(number) && number >= lowerLimit && number <= upperLimit) {
        return number;
    } else {
        return fallback;
    }
}

var valid_stickynote_position_coordinate_regexp = new RegExp(/^[0-9][0-9]*[a-z][a-z]$/);

function size_and_place_note_based_on_texthighlight(newGloveboxNode, note_obj, isOwner, isNewNote) {
    if(function_call_debuging) console.debug("size_and_place_note_based_on_texthighlight.start");
    if(function_call_debuging) console.debug(newGloveboxNode);
    if(DOM_debug) console.debug(newGloveboxNode.outerHTML);
    // the text the note is connected to has been located in the text of the page
    // the unique id of the highlight, highlightuniqueid, has been added to the porperties of the root object of the note

    console.debug(note_obj);
    console.debug(isOwner);
    console.debug(isNewNote);

    var posx = note_obj.posx;
    var posy = note_obj.posy;

    console.debug("browsersolutions posx:" + posx);
    console.debug("browsersolutions posy:" + posy);

    //console.debug("browsersolutions " + valid_stickynote_position_coordinate_regexp.test(posx));
    //console.debug("browsersolutions " + valid_stickynote_position_coordinate_regexp.test(posy));

    const rootElement = document.documentElement;
    //console.debug(rootElement);
    // check one more time that the note is not already on the page
    if (!isNoteOnPage(note_obj.noteid)) {
        console.debug("note is not already on the page");
        // cleanup by removing it
        close_noteid(note_obj.noteid);
    }
    let insertedNode = rootElement.insertBefore(newGloveboxNode, rootElement.firstChild.nextSibling);
    //let insertedNode = rootElement.appendChild(newGloveboxNode);

    console.debug(insertedNode);

    const highlightuniqueid = newGloveboxNode.getAttribute("highlightuniqueid");
    console.debug(highlightuniqueid);
    const firstNode = document.querySelector('[data-highlight-id="' + highlightuniqueid + '"]');
    const secondNode = insertedNode;
    console.debug(firstNode);
    console.debug(secondNode);
    console.debug("calling placeNodeRelativeTo  ");
    const[rel_x_pos, rel_y_pos] = placeNodeRelativeTo(firstNode, insertedNode.querySelector('[name="whole_note_table"]'), 50, 50);
    console.debug("rel_x_pos: " + rel_x_pos);
    console.debug("rel_y_pos: " + rel_y_pos);
    //insertedNode.style.visibility = 'visible';
    //insertedNode.style.zIndex = "10000";

    //return
    console.debug("moving to posx:" + rel_x_pos + " posy:" + rel_y_pos);

    //insertedNode.style.top = rel_y_pos;
    //insertedNode.querySelector('[name="whole_note_table"]').style.top = posy;
    //insertedNode.style.left = rel_x_pos;
    //insertedNode.querySelector('[name="whole_note_table"]').style.left = posx;

    insertedNode.style.visibility = 'visible';
    insertedNode.style.zIndex = "10000";

    //newGloveboxNode.style.position = 'relative';

    // set default values first
    // then replace those values with more specific ones if they are available
    var box_width =  parseInt(default_box_width) + "px";
    var box_height =  parseInt(default_box_height) + "px";

    // check for brand/organization-specific values - not implemented yet


    // check for creator specific values

    // check for feed-specific values - not implemented yet


    // check for note specific value


    // if note has valid size settings, use those, otherwise go with defaults
    box_width = note_obj.box_width;
    box_height = note_obj.box_height;

    console.debug("using box_width:" + box_width + " box_height:" + box_height);

    // examine options to make the width context sensitive

    // Set overall size of the note
    // adjust if the note is owned by the current user or is new. In both cases the bottom controll bar will be appended
    insertedNode.style.width = box_width;
   // insertedNode.querySelector('[name="whole_note_table"]').style.width = box_width;
   if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
   setCSSAttributeOnNamedElement(insertedNode, 'whole_note_table', 'width', parseInt(box_width) + 'px');

    //insertedNode.querySelector('[name="whole_note_middlebar"]').style.height = (parseInt(box_height) - note_internal_height_padding) + 'px';

    if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
    setCSSAttributeOnNamedElement(insertedNode, 'whole_note_middlebar', 'height', (parseInt(box_height) - note_internal_height_padding) + 'px');


    if (isOwner || isNewNote) {
        // the note much be expanded to show the edit bar at the bottom

        //insertedNode.querySelector('[name="whole_note_table"]').style.height = (parseInt(box_height) + note_owners_control_bar_height) + 'px';
        if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
        setCSSAttributeOnNamedElement(insertedNode, 'whole_note_table', 'height', (parseInt(box_height) + note_owners_control_bar_height) + 'px');

        insertedNode.style.height = (parseInt(box_height) + note_owners_control_bar_height) + 'px';

    } else {
        // keep configured height
        insertedNode.style.height = box_height;

        //insertedNode.querySelector('[name="whole_note_table"]').style.height = box_height + 'px';
        if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
        setCSSAttributeOnNamedElement(insertedNode, 'whole_note_table', 'height', box_height + 'px');
    }
    //insertedNode.querySelector('[name="whole_note_table"]').style.height = box_height;

    if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
    setCSSAttributeOnNamedElement(insertedNode, 'whole_note_table', 'height', box_height + 'px');

    //insertedNode.querySelector('[name="whole_note_table"]').style.position = "absolute";

    if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
    setCSSAttributeOnNamedElement(insertedNode, 'whole_note_table', 'position', "absolute");
    // update the size of some other fields in the note object


    var usable_height;
    if (isOwner) {
        usable_height = (parseInt(box_height) - note_internal_height_padding);

    } else {
        // if the note is not owned by the current user, the note will be smaller as the bottom bar is removed
        usable_height = (parseInt(box_height) - (note_internal_height_padding - note_owners_control_bar_height));
    }

    // update some internal objects in the note object to reflect the new overall size of the note
    const usable_width = (parseInt(box_width) - note_internal_width_padding);

    console.debug("setting new content frame usable width " + usable_width);
    console.debug("setting new content frame usable height " + usable_height);

    const note_type = insertedNode.getAttribute("note_type");

    // one of the following two will fail, depeding on the type of note this is
    try {
        if (note_type === "webframe") {
            //insertedNode.querySelector('[name="fakeiframe"]').style.width = usable_width + 'px';
            
            if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
            setCSSAttributeOnNamedElement(insertedNode, 'fakeiframe', 'width',usable_width + 'px');

            // insertedNode.querySelector('[name="fakeiframe"]').style.height = (usable_height - frame_note_top_bar_height) + 'px';

            if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
            setCSSAttributeOnNamedElement(insertedNode, 'fakeiframe', 'height', (usable_height - frame_note_top_bar_height) + 'px');
        }

    } catch (e) {
        //console.error(e);
    }
    try {
        if (note_type === "yellownote") {
            //insertedNode.querySelector('[name="message_display_text"]').style.width = usable_width + 'px';
            if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
            setCSSAttributeOnNamedElement(insertedNode, 'message_display_text', 'width',usable_width + 'px');
            //insertedNode.querySelector('[name="message_display_text"]').style.height = usable_height + 'px';
            if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
            setCSSAttributeOnNamedElement(insertedNode, 'message_display_text', 'height',usable_height+ 'px');
        }
        //insertedNode.querySelector('[name="whole_note_middlecell"]').style.width = usable_width + 'px';
        if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
        setCSSAttributeOnNamedElement(insertedNode, 'whole_note_middlecell', 'width',usable_width+ 'px');
        //insertedNode.querySelector('[name="whole_note_middlecell"]').style.height = usable_height + 'px';
        if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
        setCSSAttributeOnNamedElement(insertedNode, 'whole_note_middlecell', 'height',usable_height+ 'px');
    } catch (e) {
        // console.error(e);
    }

    try {

       //insertedNode.querySelector('[name="whole_note_middlebar"]').style.height = usable_height + 'px';
       if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
       setCSSAttributeOnNamedElement(insertedNode, 'whole_note_middlebar', 'height',usable_height+ 'px');
        
    } catch (e) {
        console.error(e);
    }

    insertedNode.setAttribute("box_width", box_width);
    insertedNode.setAttribute("box_height", box_height);
    console.debug(insertedNode);

    console.debug("size_and_place_note_based_on_texthighlight.end");

}

function placeNodeRelativeTo(firstNode, secondNode, x, y) {
    console.debug("placeNodeRelativeTo.start");
    console.debug(firstNode);
    console.debug(secondNode);
    console.debug(x);
    console.debug(y);
    // Ensure both nodes are styled with position absolute
    //firstNode.style.position = 'absolute';
    //secondNode.style.position = 'absolute';

    // Get the position of the first node
    const firstRect = firstNode.getBoundingClientRect();

    // Calculate the new position for the second node
    console.debug("firstRect.left: ", firstRect.left);
    console.debug("firstRect.top: ", firstRect.top);
    console.debug("window.scrollX: ", window.scrollX);
    console.debug("window.scrollY: ", window.scrollY);
    console.debug("x: ", x);
    console.debug("y: ", y);

    const newLeft = Math.round(firstRect.left + window.scrollX + x);
    const newTop = Math.round(firstRect.top + window.scrollY + y);

    console.debug("newLeft: ", newLeft);
    console.debug("newTop: ", newTop);

    // Set the position of the second node
    secondNode.style.left = `${newLeft}px`;
    secondNode.style.top = `${newTop}px`;
    //console.debug("r_x: ",newLeft );
    //console.debug("r_y: ",newTop );
    try {

        if (!document.body.contains(firstNode)) {
            console.debug("first node missing from body");
        } else {
            console.debug("first node present in the DOM")
        }
        // Append the second node to the body if it's not already in the DOM
        if (!document.body.contains(secondNode)) {
            console.debug("second node missing from body");
            //document.body.appendChild(secondNode);
        } else {
            console.debug("second node present in the DOM")

        }

    } catch (e) {}
    // compte the new position of the second node with respect to the first node
    //const r_x = Math.round(newLeft - firstRect.left);
    //const r_y = Math.round(newTop - firstRect.top);
    //console.debug("r_x: ",r_x );
    //console.debug("r_y: ",r_y );

    // Set the position of the second node
    //secondNode.style.left = `${r_x}px`;
    //secondNode.style.top = `${r_y}px`;

    return [newLeft, newTop];
}

// When placeing note that are not anochored to any selected text, place them at the top of the visible page (adjusting for scroll)
// with the following offset from the top-left corner
const note_default_placement_x_offset = "20px";
const note_default_placement_y_offset = "150px";

/**
 *
 * @param {*} newGloveboxNode
 * @param {*} note_obj
 *
 * place the note object into the DOM
 *
 * If there are coordinates in the not, use those to place the note. Otherwise, attempt to locate,  based on text search,
 *  inside the page the location where the note should be placed. If this does not success, place it on top of the page.
 */

function size_and_place_note_based_on_coordinates(newGloveboxNode, note_obj, creatorDetails, isOwner, isNewNote) {
    console.debug("size_and_place_note_based_on_coordinates.start");
    console.debug(newGloveboxNode);
    if (DOM_debug) console.debug(newGloveboxNode.outerHTML);
    console.debug(note_obj);
    console.debug(creatorDetails);
    console.debug(isOwner);
    console.debug("isNewNote: ", isNewNote);
    // final placement
    // check if note contains position coordinates/parameters. If so, try to use them to place the note

    console.debug(note_obj);
    var posx;
    var posy;
    // new note have no coordinates, so they will be placed at the top of the page
    if (isNewNote) {
        console.debug("new note, placing at top of page (adjusted for scrolling)");
        console.debug("scrollX: ", window.scrollX);
        console.debug("scrollY: ", window.scrollY);
        posx = (window.scrollX + parseInt(note_default_placement_x_offset)) + "px";
        posy = (window.scrollY + parseInt(note_default_placement_y_offset)) + "px";
    } else {
        posx = note_obj.posx;
        posy = note_obj.posy;
    }
    console.debug("posx:" + posx);
    console.debug("posy:" + posy);

    const rootElement = document.documentElement;

    // check on more time if the note is already on the page
    if (!isNoteOnPage(note_obj.noteid)) {
        let insertedNode = rootElement.insertBefore(newGloveboxNode, rootElement.firstChild.nextSibling);

        //let insertedNode = rootElement.appendChild(newGloveboxNode);

        if (DOM_debug) console.debug(insertedNode.outerHTML);

        console.debug("moving to posx:" + posx + " posy:" + posy);

        insertedNode.posy = posy;
        insertedNode.posx = posx;
        insertedNode.style.top = posy;
        //insertedNode.querySelector('[name="whole_note_table"]').style.top = posy;
        if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
        setCSSAttributeOnNamedElement(insertedNode, 'whole_note_table', 'top', posy);

        insertedNode.style.left = posx;
        //insertedNode.querySelector('[name="whole_note_table"]').style.left = posx;

        if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
        setCSSAttributeOnNamedElement(insertedNode, 'whole_note_table', 'left', posx);

        insertedNode.style.visibility = 'visible';
        insertedNode.style.zIndex = "10000";

        //newGloveboxNode.style.position = 'relative';


        // for webframes, set any aplicable internal scrolling
        const node_type = insertedNode.getAttribute("note_type");

        if (node_type === "webframe") {

            try {
                const scroll_x = note_obj.framenote_scroll_x;
                const scroll_y = note_obj.framenote_scroll_y;
                console.debug("webframe scroll_x: " + scroll_x);
                console.debug("webframe scroll_y: " + scroll_y);
                if (scroll_x !== undefined && scroll_y !== undefined) {
                    insertedNode.querySelector('[name="fakeiframe"]').scrollLeft = scroll_x;
                    insertedNode.querySelector('[name="fakeiframe"]').scrollTop = scroll_y;
                }
            } catch (e) {
                console.error(e);
            }
        }

        // set default values first
        // then replace those values with more specific ones if they are available
        var box_width = parseInt(default_box_width) + "px";
        var box_height = parseInt(default_box_height) + "px";

        // check for brand/organization-specific values - not implemented yet


        // check for creator specific values

        // check for feed-specific values - not implemented yet


        // check for note specific value


        // if note has valid size settings, use those, otherwise go with defaults
        if (note_obj.box_width !== undefined ) {
           box_width = note_obj.box_width;
        }
        if (note_obj.box_height !== undefined) {
            box_height = note_obj.box_height;
        }

        console.debug("using box_width:" + box_width + " box_height:" + box_height);

        // examine options to make the width context sensitive

        // Set overall size of the note
        // adjust if the note is owned by the current user or is new. In both cases the bottom controll bar will be appended
        insertedNode.style.width = box_width;
        //insertedNode.querySelector('[name="whole_note_table"]').style.width = box_width;
        //insertedNode.querySelector('[name="whole_note_middlebar"]').style.height = (parseInt(box_height) - note_internal_height_padding) + 'px';

        if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
        setCSSAttributeOnNamedElement(insertedNode, 'whole_note_middlebar', 'height', (parseInt(box_height) - note_internal_height_padding) + 'px');

        if (isOwner || isNewNote) {
            // the note much be expanded to show the edit bar at the bottom

            //insertedNode.querySelector('[name="whole_note_table"]').style.height = (parseInt(box_height) + note_owners_control_bar_height) + 'px';
            if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
            setCSSAttributeOnNamedElement(insertedNode, 'whole_note_table', 'height', (parseInt(box_height) + note_owners_control_bar_height) + 'px');

           //insertedNode.style.height = (parseInt(box_height) + note_owners_control_bar_height) + 'px';

        } else {
            // keep configured height
            insertedNode.style.height = box_height;

           // insertedNode.querySelector('[name="whole_note_table"]').style.height = box_height + 'px';
           if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
           setCSSAttributeOnNamedElement(insertedNode, 'whole_note_table', 'height',  box_height + 'px');
        }
        //insertedNode.querySelector('[name="whole_note_table"]').style.height = box_height;
        //insertedNode.querySelector('[name="whole_note_table"]').style.position = "absolute";

        if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
        setCSSAttributeOnNamedElement(insertedNode, 'whole_note_table', 'position', "absolute");

        // update the size of some other fields in the note object


        var usable_height;
        if (isOwner) {
            usable_height = (parseInt(box_height) - note_internal_height_padding);

        } else {
            // if the note is not owned by the current user, the note will be smaller as the bottom bar is removed

            usable_height = (parseInt(box_height) - (note_internal_height_padding - note_owners_control_bar_height));
        }

        // update some internal objects in the note object to reflect the new overall size of the note
        const usable_width = (parseInt(box_width) - note_internal_width_padding);

        console.debug("setting new content frame usable width " + usable_width);
        console.debug("setting new content frame usable height " + usable_height);

        const note_type = insertedNode.getAttribute("note_type");

        if (note_type === "webframe") {
            try {
                //insertedNode.querySelector('[name="fakeiframe"]').style.width = usable_width + 'px';
                if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
        setCSSAttributeOnNamedElement(insertedNode, 'fakeiframe', 'width', usable_width + 'px');
                //insertedNode.querySelector('[name="fakeiframe"]').style.height = (usable_height - frame_note_top_bar_height) + 'px';

                if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
        setCSSAttributeOnNamedElement(insertedNode, 'fakeiframe', 'height', (usable_height - frame_note_top_bar_height) + 'px');

            } catch (e) {
                console.error(e);
            }
        } else {
            try {
                //insertedNode.querySelector('[name="message_display_text"]').style.width = usable_width + 'px';
                if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
                setCSSAttributeOnNamedElement(insertedNode, 'message_display_text', 'width', usable_width + 'px');

                //insertedNode.querySelector('[name="message_display_text"]').style.height = usable_height + 'px';
                if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
                setCSSAttributeOnNamedElement(insertedNode, 'message_display_text', 'height', usable_height + 'px');
            } catch (e) {
                console.error(e);
            }

            try {
                //insertedNode.querySelector('[name="whole_note_middlecell"]').style.width = usable_width + 'px';

                if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
                setCSSAttributeOnNamedElement(insertedNode, 'whole_note_middlecell', 'width', usable_width + 'px');

                //insertedNode.querySelector('[name="whole_note_middlecell"]').style.height = usable_height + 'px';

                if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
                setCSSAttributeOnNamedElement(insertedNode, 'whole_note_middlecell', 'height', usable_height + 'px');

            } catch (e) {
                console.error(e);
            }
        }
        try {

            //insertedNode.querySelector('[name="whole_note_middlebar"]').style.height = usable_height + 'px';
            if(function_call_debuging) console.debug("calling setCSSAttributeOnNamedElement" );
        setCSSAttributeOnNamedElement(insertedNode, 'whole_note_middlebar', 'height', usable_height + 'px');
        } catch (e) {
            console.error(e);
        }

        insertedNode.setAttribute("box_width", box_width);
        insertedNode.setAttribute("box_height", box_height);
        if (DOM_debug) console.debug(insertedNode.outerHTML);
        //console.debug("calling: size_and_place_note_based_on_coordinates");

        console.debug("size_and_place_note_based_on_coordinates.end");

        return insertedNode;
    } else {
        console.debug("note already on page");
        return null;
    }

}
