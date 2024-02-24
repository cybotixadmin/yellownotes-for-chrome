/*
 * This JS is called then user has selected some html for action (encryption....) and it needs to be collected and sent to the plugin.
 * The call is made from background.js from a "chrome.tabs.executeScript" statement coupled with a "chrome.tabs.sendMessage".
 * executeScript sends the JS on the tab in question and makes the js a listener on the tab,
 * and sendMessage sends a message to this JS listener and the return data is the selected html.
 *
 * The selected data (text, html with or without embeded or linked data) is compressed and base64 encoded before being returned to background.js
 *
 */

console.debug("running NoteSelectedHTML.js");

const URI_plugin_user_post_yellownote = "/api/plugin_user_post_yellownote";

function disable_note(event) {
    console.debug("disable note");
    console.debug(event);
    try {
        // get the table node that is the root of the note data.
        var note_table = event.target.parentNode.parentNode.parentNode;
        console.debug(note_table);

        console.debug("uuid: " + uuid);

        // send save request back to background
        chrome.runtime.sendMessage({
            stickynote: {
                "request": "single_note_disable",
                "disable_details": {
                    "uuid": uuid,
                    "enabled": false
                }
            }
        }, function (response) {
            console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
            // finally, call "close" on the note
            //  try{
            //  	close_note(event);
            //  }catch(g){console.debug(g);}

        });
        try {
            close_note(event);
        } catch (g) {
            console.debug(g);
        }
    } catch (e) {
        console.error(e);
    }
}

function DISABLEminimize_note(event) {
    console.debug("minimize_note");
    console.debug(event);
    try {
        // get the table node that is the root of the note data.
        var note_table = event.target.parentNode.parentNode.parentNode;
        console.debug(note_table);

        var selection_text = note_table.querySelectorAll('input[name="selection_text"]')[0].textContent.trim();
        console.debug("selection_text: " + selection_text);
        var url = note_table.querySelectorAll('input[name="url"]')[0].textContent.trim();
        console.debug("url: " + url);
        var uuid = note_table.querySelectorAll('input[name="uuid"]')[0].textContent.trim();
        console.debug("uuid: " + uuid);

        // carry createtime forwards unchanged
        var createtime = note_table.querySelectorAll('input[name="createtime"]')[0].textContent.trim();
        console.debug("createtime: " + createtime);
        var message_display_text = note_table.querySelectorAll('[name="message_display_text"]')[0].value.trim();
        console.debug("messagemessage_display_text_text: " + message_display_text);
        // update lastmodified timestamp every time
        var lastmodifiedtime = getCurrentTimestamp();
        console.debug("lastmodifiedtime: " + lastmodifiedtime);

    } catch (e) {
        console.error(e);
    }
}

function DISABLEminimize_note(event) {
    console.debug("browsersolutions #minimize note");
    event.stopPropagation();
    const node = getYellowStickyNoteRoot(event.target);

    // step through all DOM nodes in the node and set to not visible, the ones that should not be displayed when the note is minimized.
    // only nodes with minimized="display" should be displayed when the note is minimized.
    // Select all elements in the DOM
    const allElements = node.querySelectorAll('*');

    // Iterate over the selected elements
    allElements.forEach(function (element) {
        //console.debug(element);
        // If the element does not have the attribute with the given value, set display to 'none'
        if (element.getAttribute('minimized') == "notvisible") {
            element.style.display = 'none';
            console.debug(element);

        } else {
            console.debug("element has minimized attribute set to visible" + element);
        }
    });
    //console.debug(event);
}

function save_new_note(event) {
    console.debug("browsersolutions ### save new note");
    console.debug(event);

    // save note to database
    try {
        // get the table node that is the root of the note data.

        var note_root = getYellowStickyNoteRoot(event.target);
        console.log(note_root);

        // var note_table = event.target.parentNode.parentNode.parentNode;
        // console.debug(note_table);
        var selection_text = "";
        try {
            selection_text = note_root.querySelectorAll('input[name="selection_text"]')[0].textContent.trim();
        } catch (e) {
            // set default, current timestamp

        }

        console.debug(selection_text);

        var url = "";
        try {
            url = window.location.href;
            //url = note_root.querySelectorAll('input[name="url"]')[0].textContent.trim();
        } catch (e) {
            // set default, local url

        }

        // new notes do not have a uuid and it one does it is not a new note
        var uuid = null;
        console.debug("uuid: " + uuid);
        try {
            uuid = note_root.querySelector('input[name="uuid"]').textContent.trim();
        } catch (e) {}
        console.debug("uuid: " + uuid);
        // only proceed if there is no uuid set - this note should not be created in this function
        if (uuid == null || uuid == "") {

            var distributionlistid;
            try {
                distributionlistid = note_root.querySelector('[name="distributionlistdropdown"]').value;
                console.log('Selected distributionlistid:', distributionlistid);
            } catch (e) {
                console.error(e);
            }

            var message_display_text = "";
            try {
                //console.debug(note_root.querySelectorAll('[name="message_display_text"]')[0]);
                //console.debug(note_root.querySelectorAll('[name="message_display_text"]')[0].value.trim() );
                message_display_text = note_root.querySelectorAll('[name="message_display_text"]')[0].value.trim();

            } catch (e) {}

            var enabled = "";
            try {
                enabled = note_root.querySelectorAll('input[name="enabled"]')[0].textContent.trim();
            } catch (e) {
                // set default
                enabled = true;
            }

            // update lastmodified timestamp every time
            var lastmodifiedtime = getCurrentTimestamp();

            // read out position parameters

            const posx = processBoxParameterInput(note_root.getAttribute("posx"), 0, 0, 1200);

            const posy = processBoxParameterInput(note_root.getAttribute("posy"), 0, 0, 5000);

            const box_width = processBoxParameterInput(note_root.getAttribute("box_width"), 250, 50, 500);

            const box_height = processBoxParameterInput(note_root.getAttribute("box_height"), 250, 50, 500);

            console.debug("message_display_text: " + message_display_text);
            console.debug("url: " + url);

            console.debug("selection_text: " + selection_text);

            let base64data = utf8_to_b64(selection_text);
            console.log(utf8_to_b64(selection_text));

            const json_create = {
                message_display_text: utf8_to_b64(message_display_text),
                selection_text: utf8_to_b64(selection_text),
                url: url,
                enabled: "true",
                distributionlistid: distributionlistid,
                note_type: "yellownote",
                posx: posx,
                posy: posy,
                box_width: box_width,
                box_height: box_height
            };
            console.debug(JSON.stringify(json_create));

            // Send save request back to background
            // Stickynotes are always enabled when created.
            chrome.runtime.sendMessage({
                message: {
                    "action": "single_create",
                    "create_details": json_create
                }
            }, function (response) {
                console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));

                // read the uuid assigned to this note that returned from the API service
                var uuid = response.uuid;
                console.debug("uuid: " + uuid);

                note_root.querySelector('input[type="hidden"][name="uuid"]').replaceChildren(document.createTextNode(uuid));
                note_root.setAttribute("uuid", uuid);

                // update the save button

                // delete existing buttons
                // get location of buttons
                //         const button_root = note_root.querySelector("tr.button_ribbon");

                //         try {
                //             while (button_root.firstChild) {
                //                  button_root.removeChild(button_root.firstChild);
                //              }
                //          } catch (f) {
                //              console.error(f);
                //           }

                // create new ones

                // call the function that will set which part of the note will be displayed
                setComponentVisibility(note_root, ",rw,.*normalsized,");

                attachEventlistenersToYellowStickynote(note_root);

            });
        } else {
            console.log("browsersolutions uuid already set - not creating new note");
        }
    } catch (e) {
        console.error(e);
    }
}

function getYellowStickyNoteRoot(currentElement) {
    console.debug("# getYellowStickyNoteRoot");

    // the root node of the yellownote is the first(top-most) container element with attribute type="yellownote"
    try {
        if (currentElement.hasAttribute("note_type")) {
            if (currentElement.getAttribute("note_type") === "yellownote") {

                // Condition met, return this element
                return currentElement;
            }
        }
    } catch (e) {
        //console.error(e);
        return null;
    }
    while (currentElement !== null && currentElement !== document) {

        if (currentElement.hasAttribute("note_type")) {
            if (currentElement.getAttribute("note_type") === "yellownote") {

                // Condition met, return this element
                return currentElement;
            }
        }
        // Move up the DOM tree to the parent node
        currentElement = currentElement.parentNode;
    }

    // If the loop completes without finding an element with the target class
    return null;
}

/*
a note is minimized by changing the visibility of some parts of the note DOM tree
 */

function minimize_note(event) {
    console.debug("browsersolutions #minimize note");
    event.stopPropagation();
    const note = getYellowStickyNoteRoot(event.target);

    setComponentVisibility(note, ",rw,.*minimized");

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
    console.debug("browsersolutions #maximize note");
    event.stopPropagation();

}

function rightsize_note(event) {
    event.stopPropagation();

    console.debug("browsersolutions #expand note to normal size");
    const note = getYellowStickyNoteRoot(event.target);
    console.debug(note);

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

function update_note(event) {
    console.debug("browsersolutions #update_note");
    console.debug(event);

    // save note to database
    try {
        // get the table node that is the root of the note data.

        var note_root = getYellowStickyNoteRoot(event.target);
        console.log(note_root);

        // var note_table = event.target.parentNode.parentNode.parentNode;
        // console.debug(note_table);
        var selection_text = "";
        try {
            selection_text = note_root.querySelectorAll('input[name="selection_text"]')[0].textContent.trim();
        } catch (e) {
            // set default, current timestamp
        }

        console.debug(selection_text);

        var url = "";
        try {
            url = note_root.querySelectorAll('input[name="url"]')[0].textContent.trim();
        } catch (e) {
            // set default, local url
        }
        var uuid = "";
        try {
            uuid = note_root.querySelectorAll('input[name="uuid"]')[0].textContent.trim();
        } catch (e) {
            // set default, local url
        }

        // carry createtime forwards unchanged
        var createtime = "";
        try {
            createtime = note_root.querySelectorAll('input[name="createtime"]')[0].textContent.trim();
        } catch (e) {
            // set default, current timestamp
            createtime = getCurrentTimestamp();

        }

        var message_display_text = "";
        try {
            message_display_text = note_root.querySelectorAll('[name="message_display_text"]')[0].value.trim();
        } catch (e) {}

        var enabled = "";
        try {
            enabled = note_root.querySelectorAll('input[name="enabled"]')[0].textContent.trim();
        } catch (e) {
            // set default
            enabled = true;
        }

        // the list of distribution lists is a dropdown. There is an empty field there where the user can select "no distribution list"


        var distributionlistid;
        try {
            distributionlistid = note_root.querySelector('[name="distributionlistdropdown"]').value;
            console.log('Selected distributionlistid:', distributionlistid);
        } catch (e) {
            console.error(e);
        }

        // update lastmodified timestamp every time
        var lastmodifiedtime = getCurrentTimestamp();

        // create out position parameters

        // var note_root = note_table.parentNode;
        // console.debug(note_root);

        // capture new positon and size of note

        const posx = processBoxParameterInput(note_root.getAttribute("posx"), 0, 0, 1200);

        const posy = processBoxParameterInput(note_root.getAttribute("posy"), 0, 0, 5000);

        const box_width = processBoxParameterInput(note_root.getAttribute("box_width"), 250, 50, 500);

        const box_height = processBoxParameterInput(note_root.getAttribute("box_height"), 250, 50, 500);

        console.debug("message_display_text: " + message_display_text);
        console.debug("url: " + url);
        console.debug("uuid: " + uuid);
        console.debug("createtime: " + createtime);
        console.debug("lastmodifiedtime: " + lastmodifiedtime);

        console.debug("selection_text: " + selection_text);

        // Encode the String
        var encodedString = utf8_to_b64(selection_text);
        console.log(encodedString); // Outputs: "SGVsbG8gV29ybGQh"
        console.log(b64_to_utf8(encodedString)); // Outputs: "Hello World!"


        const json_update = {
            message_display_text: message_display_text,
            selection_text: encodedString,
            url: url,
            uuid: uuid,
            enabled: "true",
            createtime: createtime,
            distributionlistid: distributionlistid,
            lastmodifiedtime: lastmodifiedtime,
            posx: posx,
            posy: posy,
            box_width: box_width,
            box_height: box_height
        };
        console.debug(JSON.stringify(json_update));

        // Send save request back to background
        // Stickynotes are always enabled when created.
        chrome.runtime.sendMessage({
            message: {
                "action": "single_yellownote_update",
                "update_details": json_update
            }
        }, function (response) {
            console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));

        });

    } catch (e) {
        console.error(e);
    }
}

function utf8_to_b64(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
}

function b64_to_utf8(str) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
}

function serlializeJSON(json_text) {
    // json_text.replace(/:/g,"");

    return arrayBufferToBase64(stringToArrayBuffer(json_text));

}

// extract the essential fields from the note DOM object and return them as a JSON object
function NoteDOM2JSON(note) {
    console.debug("# NoteDOM2JSON");
    console.debug(note);
    try {

        console.debug(note.querySelector('[name="url"]').textContent);

        const posx = processBoxParameterInput(note.querySelector('[name="posx"]'), 0, 0, 1200);

        const posy = processBoxParameterInput(note.querySelector('[name="posy"]'), 0, 0, 5000);

        const box_width = processBoxParameterInput(note.querySelector('[name="box_width"]'), 250, 50, 500);

        const box_height = processBoxParameterInput(note.querySelector('[name="box_height"]'), 250, 50, 500);

        var output = {
            url: note.querySelector('[name="url"]').textContent,
            uuid: note.querySelector('[name="uuid"]').textContent,
            message_display_text: note.querySelector('[name="message_display_text"]').textContent,
            enabled: note.querySelector('[name="enabled"]').textContent,
            selection_text: note.querySelector('[name="selection_text"]').textContent,
            posx: posx,
            posy: posy,
            box_width: box_width,
            box_height: box_height,
            createtime: note.querySelector('[name="createtime"]').textContent,
            lastmodifiedtime: note.querySelector('[name="lastmodifiedtime"]').textContent
        }
        //console.debug(output);
        return output;
    } catch (e) {
        console.error(e);
    }

    // createtime: note.querySelector('[name="createtime"]').textContent,
    //   lastmodifiedtime: note.querySelector('[name="lastmodifiedtime"]')
}

function close_note(event) {
    console.debug("# close yellow note");
    // call to kill the yellow note window

    // loop upwards from the target nodes to locate the root node for the sticky note

    const stickynote_rootnode = getYellowStickyNoteRoot(event.target);

    try {
        remove_note(stickynote_rootnode);

    } catch (e) {
        console.error(e);
    }
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

function DELunmark_selection_text(sticky_note_node) {
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

// find string on page
// return true/false
function FindNext(str) {

    if (str == "") {
        alert("Please enter some text to search!");
        return;
    }

    var supported = false;
    var found = false;
    if (window.find) { // Firefox, Google Chrome, Safari
        supported = true;
        // if some content is selected, the start position of the search
        // will be the end position of the selection

        var matchCase = true;
        var searchUpward = true;
        var wrapAround = true;
        var wholeWord = true;
        var searchInFrames = true;

        found = window.find(str, matchCase, searchUpward, wrapAround, wholeWord, searchInFrames);
        console.debug(found);
    } else {
        if (document.selection && document.selection.createRange) { // Internet Explorer, Opera before version 10.5
            var textRange = document.selection.createRange();
            if (textRange.findText) { // Internet Explorer
                supported = true;
                // if some content is selected, the start position of the search
                // will be the position after the start position of the selection
                if (textRange.text.length > 0) {
                    textRange.collapse(true);
                    textRange.move("character", 1);
                }

                found = textRange.findText(str);
                if (found) {
                    textRange.select();
                }
            }
        }
    }

    if (supported) {
        if (!found) {
            //    alert ("The following text was not found:\n" + str);
        }
    } else {
        //  alert ("Your browser does not support this example!");
    }
}

/* creates DOM object of the stick note */
function create_new_stickynote_2(selection_text) {

    console.debug("# create_new_stickynote_2 start promise");
    return new Promise(function (resolve, reject) {
        console.debug("# create_new_stickynote_2 promise started");

        // generate a new unique identifier
        //        let guid = () => {
        //          let s4 = () => {
        //               return Math.floor((1 + Math.random()) * 0x10000)
        //              .toString(16)
        //              .substring(1);
        //          }
        //          return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        //      }
        //     var uuid = guid();


        // create the note object data with suitable initial values for some fields
        var note_object_data = {
            "selection_text": selection_text,
            "message_display_text": selection_text,
            "createtime": getCurrentTimestamp(),
            "lastmodifiedtime": getCurrentTimestamp(),
            "enabled": true
        }
        console.log("note_object_data: " + JSON.stringify(note_object_data));

        //cont1.appendChild(create_note_table(note_object_data));
        var userid = "";
        chrome.storage.local.get(["yellownotes_session"]).then(function (session) {
            console.debug("session: " + JSON.stringify(session));
            console.debug("session.yellownotes_session: " + session.yellownotes_session);
            // get the userid from the session token
            userid = get_username_from_sessiontoken(session.yellownotes_session);
            console.debug("userid: " + userid);
            var brand = get_brand_from_sessiontoken(session.yellownotes_session);
            if (isUndefined(brand) || brand == null || brand == '' || brand == 'undefined') {
                brand = "default";
            }

            const type = "yellownote";
            const action = "get_" + type + "_template";
            console.log("action: " + action, "userid: " + userid, "brand: " + brand);
            return chrome.runtime.sendMessage({
                "action": action,
                "brand": brand
            });
        }).then((html) => {
            // console.debug("html: " + html);
            // Create a new HTML element to hold the content

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

            var node_root = document.createElement('div');

            // var fullURLToCSS = chrome.runtime.getURL("css/yellownote.css");

            var note_template = safeParseInnerHTML(html, 'div');
            // note_template = JSON.parse(html);
            console.log(note_template);


            node_root.setAttribute("class", "yellownotecontainer");
            node_root.setAttribute("note_type", 'yellownote');
            node_root.setAttribute("button_arrangment", 'new');
            
            const note_table = note_template.querySelector('[name="whole_note_table"]');
            console.debug(note_table);
            const box_width = processBoxParameterInput(note_table.getAttribute("box_width"), 250, 50, 500);
            node_root.setAttribute("box_width", box_width);
            const box_height = processBoxParameterInput(note_table.getAttribute("box_height"), 250, 50, 500);
            node_root.setAttribute("box_height", box_height);

            node_root.setAttribute("posx", 0);
            node_root.setAttribute("posy", 0);

            //  node_root.setAttribute("style", 'width: 100px; height: 100px; background-color: yellow; position: absolute; z-index: 103;');

            //cont1.appendChild(create_note_table(note_object_data,note_template));
            node_root.appendChild(note_template);
            try {
                // itterate trhoug hthe data container object in the not and populate them with values from the note_object_data

                node_root.querySelector('input[type="hidden"][name="selection_text"]').replaceChildren(document.createTextNode(note_object_data.selection_text));

                //node_root.querySelector('input[type="hidden"][name="createtime"]').replaceChildren(document.createTextNode(note_object_data.createtime));
                //node_root.querySelector('input[type="hidden"][name="lastmodifiedtime"]').replaceChildren(document.createTextNode(note_object_data.lastmodifiedtime));
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

            // attach event listeners to buttons and icons
            //attachEventlistenersToYellowStickynote(node_root);


            // make the message in the textarea touch-n-go
            try {
                // Grab the textarea element
                const textarea = node_root.querySelector('[name="message_display_text"]');

                // Set initial placeholder text that should vanish when typing begins
                const placeholderText = "write your notes here..";
                textarea.value = placeholderText;

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

            console.log("cont1: " + node_root);

            console.debug("# create_new_stickynote_2 promise resolved");
            resolve(node_root);

        })
        .catch((error) => {
            console.warn('Something went wrong.', error);
        });
    });
}



function extract_note_data(note_root) {
    console.debug("# extract_note_data");
    var selection_text = "";
    try {
        selection_text = note_root.querySelectorAll('input[name="selection_text"]')[0].textContent.trim();
    } catch (e) {
        // set default, current timestamp
    }

    console.debug(selection_text);

    var url = "";
    try {
        url = note_root.querySelectorAll('input[name="url"]')[0].textContent.trim();
    } catch (e) {
        // set default, local url
    }

    var uuid = "";
    try {
        uuid = note_root.querySelectorAll('input[name="uuid"]')[0].textContent.trim();
    } catch (e) {
        // set default, local url
    }

    // note type
    var note_type = "yellownote";

    var brand = "";
    try {
        brand = note_root.querySelectorAll('input[name="brand"]')[0].textContent.trim();
    } catch (e) {
        // set default, local url
    }
    // carry createtime forwards unchanged
    var createtime = "";
    try {
        createtime = note_root.querySelectorAll('input[name="createtime"]')[0].textContent.trim();
    } catch (e) {
        // set default, current timestamp
        createtime = getCurrentTimestamp();

    }

    var distributionlistid;
    try {
        distributionlistid = note_root.querySelector('[name="distributionlistdropdown"]').value;
        console.log('Selected distributionlistid:', distributionlistid);
    } catch (e) {
        console.error(e);
    }

    var message_display_text = "";
    try {
        message_display_text = note_root.querySelectorAll('[name="message_display_text"]')[0].value.trim();
    } catch (e) {}

    var enabled = "";
    try {
        enabled = note_root.querySelectorAll('input[name="enabled"]')[0].textContent.trim();
    } catch (e) {
        // set default
        enabled = true;
    }

    // update lastmodified timestamp every time
    var lastmodifiedtime = getCurrentTimestamp();

    // create out position parameters
    // var note_root = note_table.parentNode;
    // console.debug(note_root);


    var posx = processBoxParameterInput(note_root.posx, 0, 10, 500);

    var posy = processBoxParameterInput(note_root.posy, 0, 10, 500);

    var box_width;
    try {
        box_width = note_root.getAttribute("box_width");

        if (box_width === undefined || box_width == "" || box_width == null) {
            // use default width
            box_width = default_box_width;
        }
    } catch (e) {}

    var box_height;
    try {
        box_height = note_root.getAttribute("box_height");
        if (box_height === undefined || box_height == "" || box_height == null) {
            // use default height
            box_height = default_box_heigth;
        }
    } catch (e) {}
    return {
        uuid,
        message_display_text,
        selection_text,
        url,
        note_type,
        brand,
        enabled,
        distributionlistid,
        createtime,
        lastmodifiedtime,
        posx,
        posy,
        box_width,
        box_height
    };
}

function DISABLEcreate_new_stickynote_node(note_object_data, note_template) {
    console.debug("browsersolutions create_new_stickynote_node.start");
    console.debug(JSON.stringify(note_object_data));

    var cont1 = document.createElement('container');

    //<!--<link rel="stylesheet" type="text/css" href="message-box.css">-->


    var fullURLToCSS = chrome.runtime.getURL("css/yellownote.css");

    var link1 = document.createElement('link');
    link1.setAttribute("rel", 'stylesheet');
    link1.setAttribute("type", 'text/css');
    link1.setAttribute("href", fullURLToCSS);
    cont1.appendChild(link1);

    cont1.setAttribute("class", "yellownotecontainer");
    // use this attribute to mark this as a stickynote object
    cont1.setAttribute("note_type", 'yellownote');
    // // <container class="yellow_note" type="yellownote" posy="2" posx="0" box_width="250" box_heigth="250" >
    var note_template = safeParseInnerHTML(html, 'div');
    // note_template = JSON.parse(html);
    console.log(note_template);

    //cont1.appendChild(create_note_table(note_object_data,note_template));
    cont1.appendChild(note_template);

    // Locate the form element
    var noteForm = cont1.querySelector('form[name="note_form"]');

    noteForm.querySelector('input[type="hidden"][name="selection_text"]').replaceChildren(document.createTextNode(note_object_data.selection_text));

    noteForm.querySelector('input[type="hidden"][name="createtime"]').replaceChildren(document.createTextNode(note_object_data.createtime));
    noteForm.querySelector('input[type="hidden"][name="lastmodifiedtime"]').replaceChildren(document.createTextNode(note_object_data.lastmodifiedtime));
    // capture local url
    noteForm.querySelector('input[type="hidden"][name="url"]').replaceChildren(document.createTextNode(note_object_data.url));

    if (typeof note_object_data.enabled != undefined) {
        noteForm.querySelector('input[type="hidden"][name="enabled"]').replaceChildren(document.createTextNode(note_object_data.enabled));
    } else {
        // default value if undefined, is enabled(=true)
        noteForm.querySelector('input[type="hidden"][name="enabled"]').replaceChildren(document.createTextNode("true"));
    }

    // there directly by just clicking on this link

    // setup event listener whereby the user can configure this link
    // rewriting to be automatic

    // where to anchor the tooltip
    // setup node in the DOM tree to contain content of message box
    // var newGloveboxNode = document.createElement("Glovebox");
    // console.debug(newGloveboxNode);

    cont1.setAttribute("id", note_object_data.uuid); // attach a unique ID to the


    return cont1;

}

/* align whitespace */
function align_characterspace(one) {
    var two;
    return one.replace(/[\n\r\t]/g, " ").replace(/  */g, " ").replace(/[\)\?]/g, "");

}


function createUnattachedNote(request, sender, sendResponse) {
    console.debug("browsersolutions createUnattachedNote");
    // contenttype
    // permitted values: text, html, embeded, linked

    console.debug("request selected JSON(request): " + JSON.stringify(request));
    console.debug("request selected JSON(sender): " + JSON.stringify(sender));
    console.debug("request selected JSON(sendResponse): " + JSON.stringify(sendResponse));

    // console.debug(document.innerText);

    // const sleep = function (ms) {
    // console.debug("ms:" + ms);
    // return new Promise(function (resolve, reject) {
    // console.debug("ms:" + ms);
    // return setTimeout(resolve, ms);
    // });
    // }
    // Using Sleep,
    // console.debug('Now');
    // sleep(3000).then(v => {
    // console.debug('After three seconds')
    // });
    return new Promise(function (resolve, reject) {
        console.log("noteSelectedHTML Promise start");

        var shared_secret_to_identify_background_js_to_content_script_NoteSelectedHTML = "Glbx_marker6";

        // Use the represence of the dummy value "Glbx_marker" in the request as a
        // insecure "shared secret" to try to ensure only request from the
        // background.js are accepted.
        // This must be improved.
        try {

            if (request.sharedsecret == shared_secret_to_identify_background_js_to_content_script_NoteSelectedHTML) {
                // a valid marker was included, proceed
                console.debug("a valid sharedsecret was submitted");

                // create the note object at the root of the document
                // root
                var doc = window.document;

                var doc_root = doc.documentElement;
                console.debug(doc_root);

                create_new_stickynote_2("").then(function (newGloveboxNode) {
                    console.debug(newGloveboxNode);

                    //const inserted =  doc_root.appendChild(newGloveboxNode);
                    const inserted = doc_root.insertBefore(newGloveboxNode, doc_root.firstChild);
                    console.log(inserted)
                    
                    // set the flag that contral which button are shown
                    inserted.setAttribute("button_arrangment", 'new');
            
                    // call the function that will set which part of the note will be displayed
                    setComponentVisibility(inserted, ",new,.*normalsized,");

                    // call the function that will make the note draggable
                    console.debug("browsersolutions: makeDragAndResize");
                    makeDragAndResize(inserted);

                    // attach eventlisteners to the note
                    attachEventlistenersToYellowStickynote(inserted);

                    //console.debug("browsersolutions: makeDraggable");
                    //makeDraggable(inserted.querySelector("[name='topbar_filler']"));

                      // move to the default location on the screen
                      inserted.setAttribute("posx", 50);
                      inserted.setAttribute("posy", 50);
  inserted.querySelector('[name="whole_note_table"]').style.left = inserted.getAttribute("posx") + "px";
  inserted.querySelector('[name="whole_note_table"]').style.top = inserted.getAttribute("posy") + "px";

                    // call the function that will make the note resizeable
                    // console.debug("browsersolutions: makeResizable");
                    // makeResizable(inserted);

                    dropdownlist_add_option(inserted, "", "", "");

                    return;

                });

            } else {
                console.debug("invalid request");
                // reject("invalid request");
                console.log("noteSelectedHTML Promise rejected");
                reject();

                //            return false;
            }

        } catch (e) {
            console.debug(e);
        }
        //return true;

    });

}

function noteSelectedHTML(request, sender, sendResponse) {

    // contenttype
    // permitted values: text, html, embeded, linked

    console.debug("request selected JSON(request): " + JSON.stringify(request));
    console.debug("request selected JSON(sender): " + JSON.stringify(sender));
    console.debug("request selected JSON(sendResponse): " + JSON.stringify(sendResponse));

    // console.debug(document.innerText);

    // const sleep = function (ms) {
    // console.debug("ms:" + ms);
    // return new Promise(function (resolve, reject) {
    // console.debug("ms:" + ms);
    // return setTimeout(resolve, ms);
    // });
    // }
    // Using Sleep,
    // console.debug('Now');
    // sleep(3000).then(v => {
    // console.debug('After three seconds')
    // });
    return new Promise(function (resolve, reject) {
        console.log("noteSelectedHTML Promise start");

        var shared_secret_to_identify_background_js_to_content_script_NoteSelectedHTML = "Glbx_marker6";

        // Use the represence of the dummy value "Glbx_marker" in the request as a
        // insecure "shared secret" to try to ensure only request from the
        // background.js are accepted.
        // This must be improved.
        try {

            if (request.sharedsecret == shared_secret_to_identify_background_js_to_content_script_NoteSelectedHTML) {
                // a valid marker was included, proceed


                var selObj = window.getSelection();
                console.debug(selObj);
                console.debug(JSON.stringify(selObj));
                var selRange = selObj.getRangeAt(0);
                console.debug(selRange);
                console.debug("request selected JSON(request): " + JSON.stringify(request));
                var selection_html = "";

                var selection_text = request.selectionText;

                //var two = FindNext(selection_text);
                //console.debug(two);
                console.debug(window);
                console.debug(window.document);
                console.debug(window.document.innerHTML);
                console.debug(window.document.toString());
                console.debug(window.document.textContent);

                var doc = window.document,
                body = doc.body,
                selection,
                range,
                bodyText;
                console.debug(doc);
                console.debug(doc.nodeName);
                // root
                var root_node = doc.documentElement;
                console.debug(root_node);
                whole_page_text = "";
                var tr = traverse(doc.documentElement);
                //console.debug(traverse(doc.documentElement));
                //console.debug("################################################");
                //console.debug(whole_page_text);
                //console.debug(textnode_map);

                //console.debug(whole_page_text.replace(/\s/g, ""));
                //console.debug(selection_text.replace(/\s/g, ""));
                // remove all non-letter-number characters before making an attempt to place selection inside larger text


                // start
                var start_range_node;
                var start_offset = 0;
                // end
                var end_range_node;
                var end_offset = 0;
                // using the position of the start of the selection text within the whole text, determine the start node where the selection begins


                //var one = getDOMposition(textnode_map,selection_text);
                //console.debug(one);

                //console.debug(JSON.stringify(one));

                // use selection object to read out the DOM position parameters

                start_range_node = selRange.startContainer;
                end_range_node = selRange.endContainer;
                start_offset = selRange.startOffset;
                end_offset = selRange.endOffset;

                console.debug(end_range_node);
                console.debug(end_offset);
                console.debug("1.1.0");

                // create and insert the DOM object of sticky note

                try {
                    // var newGloveboxNode = create_new_stickynote(selection_text);

                    console.log("calling create_new_stickynote_2 with selection_text: " + selection_text);
                    create_new_stickynote_2(selection_text).then(function (newGloveboxNode) {

                        console.debug(newGloveboxNode);

                        // newGloveboxNode.addEventListener('mouseenter',
                        //     function () {
                        //    console.debug("### mouseenter");

                        //       });
                        // split the node containing the start of the selection

                        // if the startnode is a textnode
                        // 1 clone the parent node.
                        // 2 insert the clone after the parent node.
                        // 3 remove from the node all text after the point where the selection begins
                        console.debug("nodetype " + start_range_node.nodeType);

                        console.debug(start_range_node);
                        console.debug(start_offset);

                        if (start_range_node.nodeType == Node.TEXT_NODE) {
                            console.debug("is text node");
                            // determine which part of the text is before and after the start of the selection
                            // save whole text
                            // remove all text after the selection point
                            // add an empty element after the end of the text node
                            // determine position of this element
                            // remove element
                            // restore the original text


                            const bar = start_range_node.splitText(start_offset);
                            // "bar" now contains the piece of the startnode that is inside the selection
                            console.debug(bar);
                            var original_textcontent = start_range_node.textContent;
                            console.debug(original_textcontent);
                            //console.debug("Y-position: " + divOffset_y(bar));
                            //console.debug("X-position: " + divOffset_x(bar));
                            console.debug(bar.parentNode);
                            console.debug("bar parent Y-position: " + divOffset_y(bar.parentNode));
                            console.debug("bar parent X-position: " + divOffset_x(bar.parentNode));
                            //console.debug("Y-position: " + divOffset_y(start_range_node));
                            //console.debug("X-position: " + divOffset_x(start_range_node));

                            var mark3 = document.createElement('span');

                            const ins3 = start_range_node.parentNode.insertBefore(mark3, start_range_node)

                                console.debug("Y-position: " + divOffset_y(ins3));
                            console.debug("X-position: " + divOffset_x(ins3));
                            console.debug("Y-position: " + divOffset_y(mark3));
                            console.debug("X-position: " + divOffset_x(mark3));
                            try {
                                newGloveboxNode.setAttribute("posy", Math.round(divOffset_y(ins3)));
                                newGloveboxNode.setAttribute("posx", Math.round(divOffset_x(ins3)));
                                newGloveboxNode.setAttribute("box_width", default_box_width);
                                newGloveboxNode.setAttribute("box_heigth", default_box_heigth);
                            } catch (e) {
                                console.debug(e);
                            }

                            // shrink text content
                            start_range_node.textContent = original_textcontent.substring(0, start_offset);
                            console.debug(start_range_node.textContent);
                            console.debug("Y-position: " + divOffset_y(ins3));
                            console.debug("X-position: " + divOffset_x(ins3));
                            console.debug("Y-position: " + divOffset_y(mark3));
                            console.debug("X-position: " + divOffset_x(mark3));
                        }

                        //  get position of the starting fragment of the selection text
                        // use this position for place the stucky note.
                        // place sitckynote immediately before the text node

                        console.debug(newGloveboxNode);
                        const inserted = start_range_node.parentNode.insertBefore(newGloveboxNode, start_range_node);

                        console.debug(inserted);
                        console.debug(newGloveboxNode);

                        // call the function that will set which part of the note will be displayed
                        setComponentVisibility(inserted, ",new,.*normalsized,");

                        // call the function that will make the note draggable
                        console.debug("browsersolutions: makeDragAndResize");
                        //makeDraggable(inserted.querySelector("[name='topbar_filler']"));
                        makeDragAndResize(inserted);
                        // dragElement(inserted.querySelector("[name='topbar_filler']"));

                        // Example usage:
                        // Assuming there's an element with id 'myDraggableElement' and a handle with id 'myHandle'
                        //const draggableElement = document.getElementById('myDraggableElement');
                        //const dragHandle = document.getElementById('myHandle');
                        //makeDraggable2(inserted, inserted.querySelector("[name='topbar_filler']"));


                        // call the function that will make the note resizeable
                        console.debug("browsersolutions: makeResizable");
                        makeResizable(inserted);

                        dropdownlist_add_option(inserted, "", "", "");

                        var temp = document.createElement('div');
                        //temp.setAttribute("style", 'z-index: 120;');
                        var textnode = document.createTextNode("token"); // Create a text node
                        temp.appendChild(textnode);

                        console.log("noteSelectedHTML Promise resolve");
                        resolve(newGloveboxNode);
                    });

                } catch (e) {
                    console.error(e);
                    console.log("noteSelectedHTML Promise reject");
                    reject();
                }

                let notedRange = document.createRange();

            } else {
                console.debug("invalid request");
                // reject("invalid request");
                console.log("noteSelectedHTML Promise rejected");
                reject();

                //            return false;
            }

        } catch (e) {
            console.debug(e);
        }
        //return true;

    });

}

var page_scanned = false;

/**
 * create the dropdown list of available distribution lists the note can be assigned to.
 * @param {*} node_root
 * @param {*} dropdownlist
 * @param {*} option_text
 * @param {*} option_value
 *
 *
 *
 */
function dropdownlist_add_option(node_root, dropdownlist, option_text, option_value) {
    console.debug("# dropdownlist_add_option");
    console.debug(node_root);
    // check if the tempate contains a dropdown list, if so pupulate it with the available distribution lists
    const dl_container = node_root.querySelector('[name="distributionlistdropdown"]');
    console.debug(dl_container);
    dl_container.replaceChildren(document.createTextNode("loading..."));

    get_distributionlist().then(function (response) {
        console.debug("get_distributionlist message sent to background.js with response: " + JSON.stringify(response));

        // create the option to have no discribution (this is the default)
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'do not share';
        dl_container.appendChild(option);

        const selectElement = document.getElementById('distributionList');
        response.forEach(item => {
            console.log(item);
            const option = document.createElement('option');
            option.value = item.distributionlistid;
            option.textContent = `${item.name} ${item.description}`;
            dl_container.appendChild(option);
        });

    });

}

// return a drop down html list of all available distribution lists
function get_distributionlist() {
    console.debug("# get_distributionlist");
    return new Promise(function (resolve, reject) {

        chrome.runtime.sendMessage({
            message: {
                action: "get_my_distribution_lists"

            }
        }).then(function (response) {
            console.debug("get_distributionlist message sent to background.js with response: " + JSON.stringify(response));
            // render content of ifram based on this
            //console.log(getYellowStickyNoteRoot(event.target));
            //setContentInIframe(content_iframe, response);

            resolve(response);
        });

    });

}

function DELmakeDraggable(element) {
    console.debug("browsersolutions: " + "# makeDraggable");
    try {
        console.debug(element);
        let dragElement = getYellowStickyNoteRoot(element).querySelector("[name='whole_note_table']"); // move the root node
        //let dragElement = element
        let offsetX,
        offsetY,
        inFrameOffsetX,
        inFrameOffsetY,
        startMiddleHeight,
        topBarFillerWidth;

        // Function to handle the dragging
        const onMove = (event) => {
            // write code to interupt the event propagation here
            event.stopPropagation();
            console.log("browsersolutions: onMove");
            //console.log(dragElement);
            //console.log(dragElement.querySelector("[name='whole_note_table']"));

            // console.debug("browsersolutions: onMove");
            let clientX,
            clientY;

            // Check if it's a touch event
            if (event.changedTouches) {
                clientX = convertStringToIntOrReturnInt(event.changedTouches[0].clientX);
                clientY = convertStringToIntOrReturnInt(event.changedTouches[0].clientY);
            } else { // Mouse event
                clientX = convertStringToIntOrReturnInt(event.clientX);
                clientY = convertStringToIntOrReturnInt(event.clientY);
            }
            console.log("read clientX: " + clientX);
            console.log("read clientY: " + clientY);
            console.log("offsetX: " + offsetX);
            console.log("offsetY: " + offsetY);
            inFrameOffsetX = clientX - offsetX;
            inFrameOffsetY = clientY - offsetY;
            console.log("inFrameOffsetX: " + inFrameOffsetX);
            console.log("inFrameOffsetY: " + inFrameOffsetY);

            console.log("move to: x=" + (clientX - offsetX) + " y=" + (clientY - offsetY));
            //  dragElement.style.left = (clientX - offsetX) + 'px';
            //  dragElement.style.top = (clientY - offsetY) + 'px';
            console.log("move to: x=" + (clientX) + " y=" + (clientY));
            //   dragElement.style.left = (clientX ) + 'px';
            dragElement.style.left = (clientX - offsetX) + 'px';
            dragElement.style.top = (clientY) + 'px';
            dragElement.style.top = (clientY - offsetY) + 'px';

        };

        // Function to clean up after dragging
        const onEnd = () => {
            console.debug("browsersolutions: " + "onEnd ######");
            //event.stopPropagation();
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchend', onEnd);
        };

        // Initial setup
        const onStart = (event) => {
            event.stopPropagation();
            console.debug("browsersolutions: " + "onStart");
            let clientX,
            clientY;
            let rect = dragElement.getBoundingClientRect();

            // Check if it's a touch event
            if (event.touches) {
                clientX = convertStringToIntOrReturnInt(event.touches[0].clientX);
                clientY = convertStringToIntOrReturnInt(event.touches[0].clientY);
            } else { // Mouse event
                clientX = convertStringToIntOrReturnInt(event.clientX);
                clientY = convertStringToIntOrReturnInt(event.clientY);
            }
            console.log("read clientX: " + clientX);
            console.log("read clientY: " + clientY);
            let a = convertStringToIntOrReturnInt(rect.left);
            let b = convertStringToIntOrReturnInt(rect.top);
            console.log(rect);
            console.log("read a: " + rect.left);
            console.log("read a: " + a);
            console.log("read b: " + rect.top);
            console.log("read b: " + b);

            offsetX = clientX - a;
            offsetY = clientY - b;

            console.log("offsetX: " + offsetX);
            console.log("offsetY: " + offsetY);

            // Set the position properties if not already set
            if (window.getComputedStyle(dragElement).position === 'static') {
                dragElement.style.position = 'absolute';
            }

            const regex = /\d+/;
            const h = dragElement.querySelector('[name="whole_note_middlebar"]').style.height;
            const resulth = h.match(regex);
            const number_h = resulth ? parseInt(resulth[0], 10) : null;
            startMiddleHeight = number_h;
            console.debug("startMiddleHeight: " + startMiddleHeight);

            console.debug(dragElement.querySelector('[name="topbar_filler"]'));
            const w = dragElement.querySelector('[name="topbar_filler"]').style.width;
            const resultw = w.match(regex);
            const number_w = resultw ? parseInt(resultw[0], 10) : null;
            topBarFillerWidth = number_w;
            console.debug("topBarFillerWidth: " + topBarFillerWidth);

            document.addEventListener('mousemove', onMove);
            document.addEventListener('touchmove', onMove);
            document.addEventListener('mouseup', onEnd);
            document.addEventListener('touchend', onEnd);
        };

        // Attach event listeners for both touch and mouse events
        element.addEventListener('mousedown', onStart);
        element.addEventListener('touchstart', onStart);
    } catch (e) {
        console.error(e);
    }
}

function convertStringToIntOrReturnInt(input) {
    let number;

    // Check if input is a number (either integer or decimal)
    if (typeof input === "number" && !isNaN(input)) {
        number = input;
    }
    // If input is a string, attempt to convert it to a number
    else if (typeof input === "string") {
        number = parseFloat(input);
    }
    // If input is neither a number nor a string, or if it's a non-numeric string, return NaN
    else {
        return NaN;
    }

    // If the parsed number is not a valid number, return NaN
    if (isNaN(number)) {
        return NaN;
    }

    // Round down the number to the nearest integer and return
    return Math.floor(number);
}

function roundDown(number) {
    return Math.floor(number);
}

function DELmakeDraggable2(dragHandle, draggableElement) {
    let offsetX,
    offsetY;

    // Function to handle the start of dragging
    const dragStart = (e) => {
        e = e || window.event;
        e.preventDefault(); // Prevent text selection

        offsetX = e.clientX - draggableElement.getBoundingClientRect().left;
        offsetY = e.clientY - draggableElement.getBoundingClientRect().top;

        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('mousemove', elementDrag);

        document.addEventListener('touchend', stopDrag, false);
        document.addEventListener('touchmove', elementDrag, false);
    };

    // Function to handle the dragging
    const elementDrag = (e) => {
        e = e || window.event;
        e.preventDefault();

        let clientX = e.clientX,
        clientY = e.clientY;

        // If this is a touch event, get the touches
        if (e.type === "touchmove" && e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        // Set the position of the element
        draggableElement.style.top = (clientY - offsetY) + "px";
        draggableElement.style.left = (clientX - offsetX) + "px";
    };

    // Function to stop the dragging
    const stopDrag = () => {
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('mousemove', elementDrag);

        document.removeEventListener('touchend', stopDrag, false);
        document.removeEventListener('touchmove', elementDrag, false);
    };

    // Add event listeners to the designated handle
    dragHandle.addEventListener('mousedown', dragStart);
    dragHandle.addEventListener('touchstart', dragStart, false);
}

function DELdragElement(dragElement) {
    console.debug("#dragElement")
    let elmnt = getYellowStickyNoteRoot(dragElement); // move the root node
    var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        console.debug("#dragMouseDown");
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        console.debug("#elementDrag");
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        console.debug("#closeDragElement");
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

/// common functions

// the session token is not completed as yet
function get_username_from_sessiontoken(token) {

    return (JSON.parse(token)).userid;

}

function attachEventlistenersToYellowStickynote(note) {
    console.log("attachEventlistenersToYellowStickynote.start");
    console.debug(note);

    try {

        const mySave_new_note = (event) => {
            event.stopPropagation();
            save_new_note(event);
            event.stopPropagation();
        };
        const myclose_note = (event) => {
            close_note(event);
            event.stopPropagation();
        };

        const myCopy_note_to_clipboard = (event) => {
            copy_note_to_clipboard(event);
            event.stopPropagation();
        };

        const myminimize_note = (event) => {
            minimize_note(event);
            //event.stopPropagation();
        };

        const myfullscreen_note = (event) => {
            fullscreen_note(event);
            event.stopPropagation();
        };
        const myrightsize_note = (event) => {
            rightsize_note(event);
            event.stopPropagation();
        };

        const mydelete_note = (event) => {
            delete_note(event);
            event.stopPropagation();
        };
        const myupdate_note = (event) => {
            update_note(event);
            event.stopPropagation();
        };
        const mydisable_note = (event) => {
            disable_note(event);
            event.stopPropagation();
        };

        const mylocate_note = (event) => {
            console.log("event.stopPropagation();");
            locate_note(event);
            event.stopPropagation();

        };

        // for close buttons/icons
        var allGoTo = note.querySelectorAll('[js_action="close_note"]');
        for (var i = 0; i < allGoTo.length; i++) {
            console.log("attach close note event listener");
            allGoTo[i].removeEventListener("click", myclose_note);
            allGoTo[i].addEventListener("click", myclose_note);
        }

        // for save buttons/icons
        var allGoTo3 = note.querySelectorAll('[js_action="save_new_note"]');
        for (var i = 0; i < allGoTo3.length; i++) {
            allGoTo3[i].removeEventListener("click", mySave_new_note);
            allGoTo3[i].removeEventListener("click", myupdate_note);
            allGoTo3[i].addEventListener("click", mySave_new_note);
        }

        // for delete buttons/icons
        var allGoTo2 = note.querySelectorAll('[js_action="delete_note"]');
        for (var i = 0; i < allGoTo2.length; i++) {
            allGoTo2[i].removeEventListener("click", mydelete_note);
            allGoTo2[i].addEventListener("click", mydelete_note);
        }

        var allGoTo5 = note.querySelectorAll('[js_action="copy_note_to_clipboard"]');
        for (var i = 0; i < allGoTo5.length; i++) {
            console.debug(allGoTo5[i]);
            allGoTo5[i].removeEventListener("click", myCopy_note_to_clipboard);
            allGoTo5[i].addEventListener("click", myCopy_note_to_clipboard);
        }

        var allGoTo7 = note.querySelectorAll('[js_action="update_note"]');
        for (var i = 0; i < allGoTo7.length; i++) {
            allGoTo7[i].removeEventListener("click", mySave_new_note);
            allGoTo7[i].removeEventListener("click", myupdate_note);
            allGoTo7[i].addEventListener("click", myupdate_note);
        }

        var allGoTo8 = note.querySelectorAll('[js_action="disable_note"]');
        for (var i = 0; i < allGoTo8.length; i++) {
            allGoTo8[i].removeEventListener("click", mydisable_note);
            allGoTo8[i].addEventListener("click", mydisable_note);

        }
        // for button going to note location
        var allGoTo11 = note.querySelectorAll('[js_action="locate_note"]');
        for (var i = 0; i < allGoTo11.length; i++) {
            allGoTo11[i].removeEventListener("click", mylocate_note);
            allGoTo11[i].addEventListener("click", mylocate_note);

        }

        var allGoTo12 = note.querySelectorAll('[js_action="minimize_note"]');
        for (var i = 0; i < allGoTo12.length; i++) {
            console.log()
            allGoTo12[i].removeEventListener("click", myminimize_note);
            allGoTo12[i].addEventListener("click", myminimize_note);
        }

        var allGoTo13 = note.querySelectorAll('[js_action="fullscreen_note"]');
        for (var i = 0; i < allGoTo13.length; i++) {
            allGoTo13[i].addEventListener("click", function (event) {
                fullscreen_note(event);
            });

            //allGoTo13[i].removeEventListener("click", myfullscreen_note);
            //allGoTo13[i].addEventListener("click", myfullscreen_note);

        }
        var allGoTo14 = note.querySelectorAll('[js_action="rightsize_note"]');
        for (var i = 0; i < allGoTo14.length; i++) {
            allGoTo14[i].removeEventListener("click", myrightsize_note);
            allGoTo14[i].addEventListener("click", myrightsize_note);
        }

    } catch (e) {
        console.error(e);
    }
    console.log("attachEventlistenersToYellowStickynote.end");
}

function isExcluded(elm) {
    //	console.debug("isExcluded")
    //	console.debug(elm );
    //	console.debug("elm.tagName: " + elm.tagName );
    //	console.debug("elm.tagName: " + elm.tagName.toUpperCase() );
    //    if (elm.tagName.toUpperCase() == "STYLE") {
    //        return true;
    //    }
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
    return false
}

// contain node object and the position within overall text (white space removed)
var textnode_map = [];

// create a node array of text content nodes in document order
function traverse(elm) {
    // produce a string of all test concatenated
    //var text_str = "";
    // Produce an array of all nodes
    //console.debug("#traverse");

    if (elm.nodeType == Node.ELEMENT_NODE || elm.nodeType == Node.DOCUMENT_NODE) {
        // console.debug("1.0.1");

        // exclude elements with invisible text nodes
        if (isExcluded(elm)) {
            return
        }

        for (var i = 0; i < elm.childNodes.length; i++) {
            // recursively call to traverse
            traverse(elm.childNodes[i]);
        }

    }

    if (elm.nodeType == Node.TEXT_NODE) {
        //  console.debug("1.0.2");
        // exclude text node consisting of only spaces
        if (elm.nodeValue.trim() == "") {
            return
        }

        // elm.nodeValue here is visible text we need.
        //  console.log("##");
        //   console.log(elm.nodeValue);
        var start_position = whole_page_text.length;
        whole_page_text = whole_page_text + elm.nodeValue.replace(/\s/g, "");
        var end_position = whole_page_text.length;
        textnode_map.push([start_position, end_position, elm]);

    }
}

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

// the session token is not completed as yet
function get_brand_from_sessiontoken(token) {

    try {
        return (JSON.parse(token)).brand;
    } catch (error) {
        return "default";
    }

}

function isUndefined(variable) {
    return typeof variable === 'undefined';
}

// end of common functions


function locateStickyNote(request, sender, sendResponse) {

    try {

        var shared_secret_to_identify_background_js_to_content_script_NavigateToSpecificStickynote = "Glbx_marker3465";

        console.debug("browsersolutions JSON(request): " + JSON.stringify(request));

        // only execute this code if it has been properly called. The value of Get_GloveboxCiphertext is not being used for anything other than to screen out calls to this code.
        if (request.NavigateToSpecificStickynote == shared_secret_to_identify_background_js_to_content_script_NavigateToSpecificStickynote) {
            // look up
            console.debug("#################");
            request.note_object.selection_text

            // check if the note has set position coordinated and no selected text. if so, go to that positon

            var selection_text = request.note_object.selection_text

                console.debug(selection_text);

            var selection_text = request.note_object.selection_text

                console.debug(selection_text);

            var valid_pos_regex = /^[0-9\.]*$/;

            valid_pos_regex.test(request.note_object.posx);
            valid_pos_regex.test(request.note_object.posy);

            if (valid_pos_regex.test(request.note_object.posx) && valid_pos_regex.test(request.note_object.posy)) {

                window.scrollTo(request.note_object.posx, request.note_object.posy);

            } else {
                //window.scrollTo(500, 0);
                // try searching for the note in the document

            }

        }
    } catch (e) {
        console.error(e);
    }

}

function listener(request, sender, sendResponse) {
    console.debug("browsersolutions request: " + JSON.stringify(request));

    // chose which function to proceed with
    var shared_secret_to_identify_background_js_to_content_script_NoteSelectedHTML = "Glbx_marker6";

    // request.sharedsecret == shared_secret_to_identify_background_js_to_content_script_NoteSelectedHTML
    if (!(isUndefined(request.sharedsecret)) && !(isUndefined(request.contenttype))) {
        console.debug("browsersolutions: request.task: " + request.task);
        if (!(isUndefined(request.task)) && request.task == "createBlankYellowStickyNote") {

            createUnattachedNote(request, sender, sendResponse).then(function (res) {
                console.log(res);

                sendResponse({
                    success: true,
                    data: "value"
                });

            });

        } else {

            noteSelectedHTML(request, sender, sendResponse).then(function (res) {
                console.log(res);

                sendResponse({
                    success: true,
                    data: "value"
                });

            });
        }
        locateStickyNote(request, sender, sendResponse);

        return true;
    } else {
        return false;
    }
}

chrome.runtime.onMessage.addListener(listener);
