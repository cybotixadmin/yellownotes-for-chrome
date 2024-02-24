/*
 * Pin a note that presents a URL and attaches this not to a selection of text from the page.
 *
 * This JS is called then user has selected some html for action (encryption....) and it needs to be collected and sent to the plugin.
 * The call is made from background.js from a "chrome.tabs.executeScript" statement coupled with a "chrome.tabs.sendMessage".
 * executeScript sends the JS on the tab in question and makes the js a listener on the tab,
 * and sendMessage sends a message to this JS listener and the return data is the selected html.
 *
 * The selected data (text, html with or without embeded or linked data) is compressed and base64 encoded before being returned to background.js
 *
 */

console.debug("running PinToSelectedHTML.js");

//const URI_plugin_user_post_yellownote = "/api/plugin_user_post_yellownote";


// lookup information from the note object

function extract_node_data(note_root) {

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
    var note_type = "webframe";

    
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

    var  distributionlistid;   
    try{
    distributionlistid = newGloveboxNode.querySelector('[name="distributionlistdropdown"]').value;
    console.log('Selected distributionlistid:', distributionlistid);
    }catch(e){
        console.error(e);
    }

    var content_url = "";
    // check for content_url for notes that collect content from elsewhere
    try {
        content_url = note_root.querySelector('input[id="urlInput"]').value.trim();
    } catch (e) {}

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

    const posx = processBoxParameterInput(note_root.getAttribute("posx"), 0, 0, 1200);

    const posy = processBoxParameterInput(note_root.getAttribute("posy"), 0, 0, 5000);

    const box_width = processBoxParameterInput(note_root.getAttribute("box_width"), 250, 50, 500);

    const box_height = processBoxParameterInput(note_root.getAttribute("box_height"), 250, 50, 500);

    return {
        uuid,
        message_display_text,
        selection_text,
        url,
        content_url,
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


function save_changes_to_note(event) {
    console.debug("browsersolutions #save changes to note");
    console.debug(event);

    // save note to database
    try {

        // get the table node that is the root of the note data.

        var note_root = getYellowStickyNoteRoot(event.target);
        console.log(note_root);
        console.log(extract_node_data(note_root));

        var {
            uuid,
            message_display_text,
            selection_text,
            url,
            content_url,
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
        } = extract_node_data(note_root);

        // update lastmodified timestamp every time
        lastmodifiedtime = getCurrentTimestamp();

        // Encode the String
        var encodedString = str2base64(selection_text);
        console.log(encodedString); // Outputs: "SGVsbG8gV29ybGQh"

        // note_type can not be changed
        const json_update = {
            message_display_text: message_display_text,
            selection_text: str2base64(selection_text),
            url: url,
            brand: brand,
            note_type: "webframe",
            content_url: content_url,
            uuid: uuid,
            enabled: "true",
            distributionlistid: distributionlistid,
            posx: posx,
            posy: posy,
            box_width: box_width,
            box_height: box_height
        };
        console.debug(JSON.stringify(json_update));

        // Send save request back to background
        // Stickynotes are always enabled when created.
        chrome.runtime.sendMessage({
            stickynote: {
                "request": "single_update",
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
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}

function b64_to_utf8(str) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

/*
 * serialize the note object into a form which is suitable for pasting into chat messages, email and the like.
 *
 */

function copy_note_to_clipboard(event) {
    console.debug("# copy yellow note to clipboard");
    // call to copy not to clipboard

    // loop upwards from the target nodes to locate the root node for the sticky note

    const root_note = getYellowStickyNoteRoot(event.target);

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
    } catch (e) {}

    try {

        console.debug(stickynote_node);

        //console.debug("1.2.1");
        //if (isSticyNoteRoot(stickynote_node)) {
        console.debug("copy...");
        console.debug(stickynote_node);

        var out = NoteDOM2JSON(root_note);

        // redact certain fields of the note object from the output data

        console.debug(out);
        console.debug(JSON.stringify(out));

        delete (out.lastmodifiedtime);
        delete (out.createtime);
        delete (out.enabled);

        // either redact completely or rewrite the uuid

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

function updateClipboard(newClip) {
    navigator.clipboard.writeText(newClip).then(function () {
        /* clipboard successfully set */
    }, function () {
        /* clipboard write failed */
    });
}

function serlializeJSON(json_text) {
    // json_text.replace(/:/g,"");

    return arrayBufferToBase64(stringToArrayBuffer(json_text));

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


// extract the essential fields from the note DOM object and return them as a JSON object
function NoteDOM2JSON(note) {
    console.debug("# NoteDOM2JSON");
    console.debug(note);
    try {

        console.debug(note.querySelector('[name="url"]').textContent);



        const posx = processBoxParameterInput(note.getAttribute("posx"), 0, 0, 1200);

        const posy = processBoxParameterInput(note.getAttribute("posy"), 0, 0, 5000);
    
        const box_width = processBoxParameterInput(note.getAttribute("box_width"), 250, 50, 500);
    
        const box_height = processBoxParameterInput(note.getAttribute("box_height"), 250, 50, 500);
    

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

/* creates DOM object of the  note, using the html template supplied */
function create_new_note(html, note_type, brand, selection_text) {

    console.debug("# create_new_note start promise");
    //return new Promise(function (resolve, reject) {
    console.debug("# create_new_note promise started");

    // generate a temporary new unique identifier
    let guid = () => {
        let s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
  

    // create the note object data with suitable initial values for some fields
    var note_object_data = {
        "selection_text": selection_text,
        "message_display_text": selection_text,
        "createtime": getCurrentTimestamp(),
        "lastmodifiedtime": getCurrentTimestamp(),
        "enabled": true,
        "brand": brand,
        "note_type": note_type
    }
    console.log("note_object_data: " + JSON.stringify(note_object_data));

    //cont1.appendChild(create_note_table(note_object_data));


    // fetch(chrome.runtime.getURL('stickynotetemplate.html'))
    // .then((response) => response.text())
    // .then((html) => {
    //console.debug("html: " + html);
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

    //   var link1 = document.createElement('link');
    //   link1.setAttribute("rel", 'stylesheet');
    //   link1.setAttribute("type", 'text/css');
    //   link1.setAttribute("href", fullURLToCSS);
    //   node_root.appendChild(link1);

    // // <container class="yellow_note" type="yellownote" posy="2" posx="0" box_width="250" box_heigth="250" >
    //    node_root.setAttribute("class", "yellownote");
    node_root.setAttribute("class", "yellownotecontainer");

    node_root.setAttribute("type", 'webframe');
    node_root.setAttribute("button_arrangment", 'new');
            
    node_root.setAttribute("minimized", 'visible');
    // resets all CSS to initial
    node_root.setAttribute("display", 'all: initial;');
   // node_root.setAttribute("note_uuid", note_uuid);
    //node_root.setAttribute("draggable", 'true');
    //  node_root.setAttribute("style", 'width: 100px; height: 100px; background-color: yellow; position: absolute; z-index: 103;');

    var note_template = safeParseInnerHTML(html, 'div');
    // note_template = JSON.parse(html);
    console.log(note_template);

    node_root.appendChild(note_template);
    try {
    
        node_root.querySelector('input[type="hidden"][name="selection_text"]').replaceChildren(document.createTextNode(note_object_data.selection_text));
        node_root.querySelector('input[type="hidden"][name="brand"]').textContent = note_object_data.brand;
        node_root.querySelector('input[type="hidden"][name="note_type"]').replaceChildren(document.createTextNode(note_object_data.note_type));
        node_root.querySelector('input[type="hidden"][name="createtime"]').replaceChildren(document.createTextNode(note_object_data.createtime));
        node_root.querySelector('input[type="hidden"][name="lastmodifiedtime"]').replaceChildren(document.createTextNode(note_object_data.lastmodifiedtime));
        // capture local url
        node_root.querySelector('input[type="hidden"][name="url"]').replaceChildren(document.createTextNode(note_object_data.url));
        if (typeof note_object_data.enabled != undefined) {
            node_root.querySelector('input[type="hidden"][name="enabled"]').replaceChildren(document.createTextNode(note_object_data.enabled));
        } else {
            // default value if undefined, is enabled(=true)
            node_root.querySelector('input[type="hidden"][name="enabled"]').replaceChildren(document.createTextNode("true"));
        }

                   /* the note header contains source info on the note
             */
                   renderNoteHeader(note_object_data, node_root);
                   // set up the drop-down menu for distribution lists/feeds
                               // pre-select the distribution list drop down menu
                               const dl_container = node_root.querySelector('[name="distributionlistdropdown"]');
                   
                               if (!isUndefined(note_object_data.distributionlistid) && note_object_data.distributionlistid != undefined) {
                                   console.debug("there is a distribution list assigned already: " + note_object_data.distributionlistid);
                                   console.debug("calling: get_distributionlist");
                                   get_distributionlist().then(function (response) {
                                       console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
                                       try {
                                           const selectElement = document.getElementById('distributionList');
                                           response.forEach(item => {
                                               console.log(item);
                                               const option = document.createElement('option');
                                               option.value = item.distributionlistid;
                                               option.textContent = `${item.name} ${item.description}`;
                                               if (item.distributionlistid == note_object_data.distributionlistid) {
                                                   option.setAttribute("selected", "selected");
                                               }
                                               dl_container.appendChild(option);
                                           });
                                           // add the option of not sharing the note with any distribution list/feeds
                                           const option0 = document.createElement('option');
                                           option0.value = '';
                                           option0.textContent = 'do not share';
                                           dl_container.appendChild(option0);
                                           
                                       } catch (e) {
                                           console.error(e);
                                       }
                                   });
                   
                               } else {
                                   console.debug("calling: get_distributionlist");
                                   get_distributionlist().then(function (response) {
                                       console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
                                       // add the option of not sharing the note with any distribution list/feeds
                                       const option0 = document.createElement('option');
                                       option0.value = '';
                                       option0.textContent = 'do not share';
                                       dl_container.appendChild(option0);
                   
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


    } catch (e) {
        console.error(e);

    }

    // attach event listeners to buttons and icons
    console.debug("attachEventlistenersToYellowStickynote");
    attachEventlistenersToYellowStickynote(node_root);

  

    console.log("cont1: " + node_root);

    console.debug("# create_new_note promise resolved");
    return node_root;
}




/**
 * make different parts of the graphical elements visible or not.
 */
function setComponentVisibility(note, visibility) {
    console.debug("# setComponentVisibility " + visibility);
    const regex = new RegExp(visibility, 'i');
    const allElements = note.querySelectorAll('[ subcomponentvisibility ]');
    // Iterate over the selected elements

    allElements.forEach(function (element) {
        // If the element does not have the attribute with the given value, set display to 'none'
        // if (element.getAttribute('minimized') === "notvisible") {
        //console.debug(element);
        //console.debug(element.getAttribute('subcomponentvisibility'));
        //console.debug(regex.test( element.getAttribute('subcomponentvisibility') ) );

        if (regex.test(element.getAttribute('subcomponentvisibility'))) {
            // make the element visible
            console.debug("make visible");
            console.debug(element);
            element.style["display"] = "";
            //element.style.display = 'inherit';
            //element.style.display = 'unset';

        } else {
            // make the element invisible
            console.debug("make invisible");
            console.debug(element);
            element.style.display = 'none';
        }
        //console.debug(element.style.display);
        //element.style.display = 'inherit';
        //  console.debug("element has minimized attribute set to visible" + element);

        //}else{
        // }
    });
    // set new size for the whole note "frame"

    if (/mini/.test(visibility)) {
        console.debug("mini");



note.querySelector('table[name="whole_note_table"]').style.height = "30px";


    } else if (/normal/.test(visibility)) {
        console.debug("normal");

        //  note.setAttribute("box_height", number_h);
        //  element = note.querySelector('[name="whole_note_table"]');
        //   const w= element.style.width;
        console.debug("setting to " + note.getAttribute("box_height") + "px");
        note.querySelector('table[name="whole_note_table"]').style.height = note.getAttribute("box_height") + "px";

    }

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

// contain node object and the position within overall text (white space removed)
var textnode_map = [];

/*
 *  list of HTML object that should not be included in the note-object or added to the DOM tree.
 *  These are typically objects that are not relevant to the user, or may be objectionably from a security perspective.
 */
function isExcluded(elm) {
    //	console.debug("isExcluded")


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



// the session token is not completed as yet
function get_brand_from_sessiontoken(token) {

    try {
        return (JSON.parse(token)).brand;
    } catch (error) {
        return "default";
    }

}

// the session token is not completed as yet
function get_username_from_sessiontoken(token) {

    return (JSON.parse(token)).userid;

}

/* creates DOM object of the stick note */
function create_new_pinnednote(selection_text) {

    console.debug("# create_new_pinnednote start promise");
    return new Promise(function (resolve, reject) {
        console.debug("# create_new_pinnednote promise started");

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
            note_type: "webframe",
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

            const note_type = "webframe";
            const action = "get_" + note_type + "_template";
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

            //   var link1 = document.createElement('link');
            //   link1.setAttribute("rel", 'stylesheet');
            //   link1.setAttribute("type", 'text/css');
            //   link1.setAttribute("href", fullURLToCSS);
            //   node_root.appendChild(link1);

            // // <container class="yellow_note" type="yellownote" posy="2" posx="0" box_width="250" box_heigth="250" >
            node_root.setAttribute("class", "yellownotecontainer");
            node_root.setAttribute("note_type", 'webframe');
            node_root.setAttribute("button_arrangment", 'new');
            const note_table = note_template.querySelector('[name="whole_note_table"]');
            console.debug(note_table);
            console.debug(note_table.style);
            console.debug(note_table.style.width);
            
            const w = note_table.style.width;
 if (isUndefined(w)){
    node_root.setAttribute("box_width", 250);
 }else{
    node_root.setAttribute("box_width", parseInt(w, 10));
 }

            const h = note_table.style.height;
            if (isUndefined(h)){
                node_root.setAttribute("box_width", 250);
                         }else{
                node_root.setAttribute("box_width", parseInt(h, 10));
                         }
            



            node_root.setAttribute("posx", 0);
            node_root.setAttribute("posy", 0);

            //  node_root.setAttribute("style", 'width: 100px; height: 100px; background-color: yellow; position: absolute; z-index: 103;');

            //cont1.appendChild(create_note_table(note_object_data,note_template));
            node_root.appendChild(note_template);
            try {
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




            console.log("cont1: " + node_root);

            console.debug("# create_new_pinnednote promise resolved");
            resolve(node_root);

        })
        .catch((error) => {
            console.warn('Something went wrong.', error);
        });
    });
}

function pinToNoHTML(request, sender, sendResponse) {
    console.debug("browsersolutions pinToNoHTML");
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
    // console.debug('AfpinToNoHTMLter three seconds')
    // });
    return new Promise(function (resolve, reject) {
        console.log("pinToNoHTML Promise start");

        var shared_secret_to_identify_background_js_to_content_script_NoteSelectedHTML = "Glbx_marker6";

        // Use the represence of the dummy value "Glbx_marker" in the request as a
        // insecure "shared secret" to try to ensure only request from the
        // background.js are accepted.
        // This must be improved.
        try {

          //  if (request.sharedsecret == shared_secret_to_identify_background_js_to_content_script_NoteSelectedHTML) {
                // a valid marker was included, proceed
                console.debug("a valid sharedsecret was submitted");

                // create the note object at the root of the document
                // root
               
                

                var doc_root = doc.documentElement;
                console.debug(doc_root);

                create_new_pinnednote("").then(function (newGloveboxNode) {
                    console.debug(newGloveboxNode);

                    //const inserted =  doc_root.appendChild(newGloveboxNode);
                    const inserted = doc_root.insertBefore(newGloveboxNode, doc_root.firstChild);
                    console.log(inserted)

                    // call the function that will set which part of the note will be displayed
                    console.debug("browsersolutions: call setComponentVisibility");
                    setComponentVisibility(inserted, ",new,.*normalsized,");

                    // call the function that will make the note draggable
                    console.debug("browsersolutions: makeDragAndResize");
                    makeDragAndResize(inserted);

                    // move to the default location on the screen
                    
                    inserted.setAttribute("posx", 50);
                    inserted.setAttribute("posy", 50);
                    // attach event listeners to buttons and icons
                    attachEventlistenersToYellowStickynote(inserted);

                    // call the function that will make the note resizeable
                    // console.debug("browsersolutions: makeResizable");
                   
                    dropdownlist_add_option(inserted, "", "", "");

                    return;

                });

        
        } catch (e) {
            console.debug(e);
        }
        //return true;

    });

}




function makeDragAndResize(note){
    console.debug("# makeDragAndResize.start");

    //document.addEventListener('DOMContentLoaded', function() {
        //const tableContainer = document.getElementById('tableContainer');

        // the margin within which the user can resize the note by dragging the edges
        const resizeBorderMargin = 5;

        const tableContainer = note.querySelector('[name="whole_note_table"]');
        console.debug(tableContainer);
        let isDragging = false, isResizing = false;
        let startX, startY, startWidth, startHeight, startMiddleHeight,topBarFillerWidth, posx, posy;
    

        tableContainer.addEventListener('mousedown', startAction);
        tableContainer.addEventListener('touchstart', startAction, { passive: false });
    
        function startAction(e) {
            console.debug("# startAction");


            // if this is on top of any buttons of drop down lists, in which case allow other events to take place

console.debug(e);
console.debug(e.target.tagName);

             if (e.target.tagName === 'SELECT' || e.target.tagName === 'OPTION') {
                console.debug("on top of a drop down list");
                // allow action on the drop down list
             }else if (e.target.tagName === 'TEXTAREA' ) {
                    console.debug("on top of textarea");
                    // allow action on the drop down list
                }else if (e.target.tagName === 'INPUT' ) {
                    console.debug("on top of an input");
                    // allow action on the drop down list
                }else if (e.target.tagName === 'IMG' ) {
                    console.debug("on top of an image");



                    console.debug(e.target.alt);

                    if (e.target.alt === 'Load' ) {
// don't prevent click action on the image with alt="Load"
                    }else{
                        e.preventDefault();
                    }

                    // allow action on the drop down list
            }else{
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
            tableContainer.addEventListener('touchmove', resize, { passive: false });
        } else {
            // Start dragging
            console.debug("# start dragging");
            isDragging = true;
            tableContainer.addEventListener('mousemove', drag);
            tableContainer.addEventListener('touchmove', drag, { passive: false });
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

                // update the insides of note during the expansion/contraction 
                console.debug("topBarFillerWidth: " +  (topBarFillerWidth + currentX - startX) + 'px');
                // update the width of the filler that padds out the top bar enough to place the icons over in the right corner
                tableContainer.querySelector('[name="topbar_filler"]').style.width = (topBarFillerWidth + currentX - startX) + 'px';
                console.debug("startMiddleHeight: " +  (startMiddleHeight + currentY - startY) + 'px');
                
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

console.debug(posx);
console.debug(posy);
console.debug(note);

note.setAttribute("posx", posx);
note.setAttribute("posy", posy);

// whole_note_middlebar

  // store the new size information in the note object

//        note.setAttribute("sizeproperties", "frozen");
console.debug(note);
console.debug(note);
console.debug("sizeproperties: " + note.getAttribute('note_type'));

console.debug("sizeproperties: " + note.getAttribute('sizeproperties'));
console.debug("sizeproperties: " + note.getAttribute('size'));
if (note.getAttribute("sizeproperties") === "frozen"){
    console.debug("do NOT update the size properties of the note object, as it is frozen.");
} else{
    
    console.debug("free to update the size properties of the note object");



        //console.debug(note);
        //console.debug(note.querySelector('[name="box_width"]'));
        const regex = /\d+/;
        const w = tableContainer.style.width;
        const resultw = w.match(regex);
        const number_w = resultw ? parseInt(resultw[0], 10) : null;
        //console.debug(number_w);
        note.setAttribute("box_width", number_w);
        const h = tableContainer.style.height;
        const resulth = h.match(regex);
        const number_h = resulth ? parseInt(resulth[0], 10) : null;
console.debug("box_height: " + number_h);
        note.setAttribute("box_height", number_h);
        // update the message field height to track the note expasion
        //var message_field = note.querySelector('[name="message_display_text"]');
        //console.debug(message_field);
        const new_height = number_h - 70;

}
        //message_field.style.height = new_height + "px";

            tableContainer.removeEventListener('mousemove', drag);
            tableContainer.removeEventListener('touchmove', drag);
            tableContainer.removeEventListener('mousemove', resize);
            tableContainer.removeEventListener('touchmove', resize);
            document.removeEventListener('mouseup', stopAction);
            document.removeEventListener('touchend', stopAction);
        }
    //});
    


}

function pinToSelectedHTML(request, sender, sendResponse) {

    // contenttype
    // permitted values: text, html, embeded, linked

    console.debug("pinToSelectedHTML request selected JSON(request): " + JSON.stringify(request));
    console.debug("pinToSelectedHTML request selected JSON(sender): " + JSON.stringify(sender));
    console.debug("pinToSelectedHTML request selected JSON(sendResponse): " + JSON.stringify(sendResponse));

    return new Promise(function (resolve, reject) {

        //var background_to_NoteSelectedHTML_sharedsecret = "Glbx_marker6";

        var PinToSelectedHTML_sharedsecret = "Glbx_maraskesfser6";

//if (request.sharedsecret == PinToSelectedHTML_sharedsecret){
        // Use the represence of the dummy value "Glbx_marker" in the request as a
        // insecure "shared secret" to try to ensure only request from the
        // background.js are accepted.
        // This must be improved.
        try {

            if (request.sharedsecret == PinToSelectedHTML_sharedsecret) {
                // a valid marker was included, proceed


                var selObj = window.getSelection();
                console.debug(selObj);
                console.debug(JSON.stringify(selObj));
                var selRange = selObj.getRangeAt(0);
                console.debug(selRange);
                console.debug("request selected JSON(request): " + JSON.stringify(request));
                var selection_html = "";
                var note_template = request.note_template;

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

                // create and insert the DOM object of the sticky note

                try {
                    // var newGloveboxNode = create_new_stickynote(selection_text);
                    var html = request.note_template;
                    console.log("calling create_new_pinnednote with selection_text: " + selection_text);
                    // create_new_pinnednote(selection_text).then(function (newGloveboxNode) {
                    newGloveboxNode = create_new_note(html, request.note_type, request.brand, selection_text);

                 

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

                       // var mark3 = document.createElement('span');

                       // const ins3 = start_range_node.parentNode.insertBefore(mark3, start_range_node)

                       //     console.debug("Y-position: " + divOffset_y(ins3));
                       // console.debug("X-position: " + divOffset_x(ins3));
                       // console.debug("Y-position: " + divOffset_y(mark3));
                       // console.debug("X-position: " + divOffset_x(mark3));
                        try {
                       //     newGloveboxNode.setAttribute("posy", Math.round(divOffset_y(ins3)));
                       //     newGloveboxNode.setAttribute("posx", Math.round(divOffset_x(ins3)));
                        //    newGloveboxNode.setAttribute("box_width", default_box_width);
                         //   newGloveboxNode.setAttribute("box_heigth", default_box_heigth);
                        } catch (e) {
                            console.debug(e);
                        }

                        // shrink text content
                        start_range_node.textContent = original_textcontent.substring(0, start_offset);
                        console.debug(start_range_node.textContent);
                        //console.debug("Y-position: " + divOffset_y(ins3));
                        //console.debug("X-position: " + divOffset_x(ins3));
                        //console.debug("Y-position: " + divOffset_y(mark3));
                        //console.debug("X-position: " + divOffset_x(mark3));

                    }

                    //  get position of the starting fragment of the selection text
                    // use this position for place the stucky note.
                    // place sitckynote immediately before the text node

                    console.debug(newGloveboxNode);
                    const inserted = start_range_node.parentNode.insertBefore(newGloveboxNode, start_range_node);

                     // call the function that will set which part of the note will be displayed
                     console.debug("calling setComponentVisibility");
                      setComponentVisibility(inserted, ",new,.*normalsized,");
                     
                                  // make note dragable
                                  //dragStickyNote(insertedNode2)
  console.debug(inserted.querySelector("[name='brand_logo']"));
                     // call the function that will make the note draggable
                     console.debug("dragStickyNote");
                     dragStickyNote(inserted.querySelector("[name='topbar_filler']"));
                     // call the function that will make the note resizeable
                     console.debug("makeResizable");
                     makeResizable(inserted);

                    

                    // add the dropdown list of available distribution lists
                    dropdownlist_add_option(inserted);
                    console.log("noteSelectedHTML Promise resolve");

attachEventlistenersToYellowStickynote(inserted);

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

            }

        } catch (e) {
            console.debug(e);
        }
        //return true;

    });

}


function createUnattachedWebframeNote(request, sender, sendResponse) {
console.log("createUnattachedWebframeNote.start");
    // contenttype
    // permitted values: text, html, embeded, linked

    console.debug("pinToSelectedHTML request selected JSON(request): " + JSON.stringify(request));
    console.debug("pinToSelectedHTML request selected JSON(sender): " + JSON.stringify(sender));
    console.debug("pinToSelectedHTML request selected JSON(sendResponse): " + JSON.stringify(sendResponse));
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

               
                // create the note object at the root of the document
                // root
                var doc = window.document;

                var doc_root = doc.documentElement;
                console.debug(doc_root);

                //newGloveboxNode = create_new_note(html, request.note_type, request.brand, selection_text);

                create_new_pinnednote("").then(function (newGloveboxNode) {
                    console.debug(newGloveboxNode);

                    //const inserted =  doc_root.appendChild(newGloveboxNode);
                    const inserted = doc_root.insertBefore(newGloveboxNode, doc_root.firstChild);
                    console.log(inserted)

                    // call the function that will set which part of the note will be displayed
                    console.debug("browsersolutions: call setComponentVisibility");
                    setComponentVisibility(inserted, ",new,.*normalsized,");

                    // call the function that will make the note draggable
                    console.debug("browsersolutions: makeDragAndResize");
                    makeDragAndResize(inserted);

                    attachEventlistenersToYellowStickynote(inserted);

                    //console.debug("browsersolutions: makeDraggable");
                    //makeDraggable(inserted.querySelector("[name='topbar_filler']"));


                    // call the function that will make the note resizeable
                    // console.debug("browsersolutions: makeResizable");
                    // makeResizable(inserted);

                    dropdownlist_add_option(inserted, "", "", "");

                    return;

                });

           
        } catch (e) {
            console.debug(e);
        }
        //return true;

    });

}

function isUndefined(variable) {
    return typeof variable === 'undefined';
}

function DELmakeResizable(note) {
    console.debug("# makeResizable.start");
    // "drill" down to the whole_note_table element
    element = note.querySelector('[name="whole_note_table"]');
    // check if there is an iframe inside the note and if so, it will need its own resizing.
    iframe = element.querySelector('[name="contentFrame"]');

    console.debug(element);
    let startX,
    startY,
    startWidth,
    startHeight,
    iFrameStartWidth,
    iFrameStartHeight;
    const resizeMargin = 10; // Margin along the iside of the edge, in pixels, within which touch/click resizing is allowed


    // Function to check if the event is near the border - and only then the element should be resized with a draging motion
    // except in the case of a touch event, where the element is resized by pinching
    const isNearBorder = (event, rect) => {
        console.debug("# isNearBorder");
        let clientX = event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
        let clientY = event.type.includes('mouse') ? event.clientY : event.touches[0].clientY;
        console.debug("x: " + clientX);
        console.debug("from left edge: " + (clientX - rect.left));
        console.debug("from right edge: " +  ( (rect.left + rect.width) - clientX));
        console.debug(clientY);
        console.debug("from top edge: " + (clientY - rect.top));
        console.debug("from bottom edge: " +  ( (rect.top + rect.height) - clientY));
        console.debug(rect);
        console.debug(resizeMargin > (clientX - rect.left));
        console.debug(resizeMargin >  ( (rect.left + rect.width) - clientX));
        console.debug(resizeMargin > (clientY - rect.top));
        console.debug(resizeMargin > ( (rect.top + rect.height) - clientY));
        


        console.debug(clientX > rect.left + rect.width - resizeMargin);
        console.debug(clientX < rect.left + resizeMargin);
        console.debug(clientY > rect.top + rect.height - resizeMargin);
        console.debug(clientY < rect.top + resizeMargin);

console.log((resizeMargin > (clientX - rect.left)) || (resizeMargin >  ( (rect.left + rect.width) - clientX)) || (resizeMargin > (clientY - rect.top)) || (resizeMargin > ( (rect.top + rect.height) - clientY)));

        return (resizeMargin > (clientX - rect.left)) || (resizeMargin >  ( (rect.left + rect.width) - clientX)) || (resizeMargin > (clientY - rect.top)) || (resizeMargin > ( (rect.top + rect.height) - clientY));
    };

    // Function to handle the starting of resizing
    const initResize = (e) => {
        console.debug("# initResize");
        console.debug(element);
        let rect = element.getBoundingClientRect();
        if (!isNearBorder(e, rect))
            return;

        e.preventDefault();
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        startWidth = rect.width;
        startHeight = rect.height;

        if (iframe != null) {
            let rect2 = iframe.getBoundingClientRect();
            iFrameStartWidth = rect2.width;
            iFrameStartHeight = rect2.height;

        }

        document.documentElement.addEventListener('mousemove', startResizing);
        document.documentElement.addEventListener('mouseup', stopResizing);
        document.documentElement.addEventListener('touchmove', startResizing);
        document.documentElement.addEventListener('touchend', stopResizing);

    };

    // Function to handle the resizing
    const startResizing = (e) => {
        //console.debug("# startResizing");
        let currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        let currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        element.style.width = (startWidth + currentX - startX) + 'px';
        element.style.height = (startHeight + currentY - startY) + 'px';

        //console.debug(element.style.width);
        //console.debug(element.style.height);

        // if there is an iframe inside the note, it will need its own resizing.
        if (iframe != null) {
            // console.log(currentX - startX);
            // console.log(currentY - startY);
            //const iFrameStartWidth = iframe.getBoundingClientRect().width;
            // console.log("iFrameStartWidth: " + iFrameStartWidth);
            // console.log("iFrameStartHeight: " + iFrameStartHeight);
            // console.log(iFrameStartWidth + currentX - startX);
            iframe.style.width = (iFrameStartWidth + currentX - startX) + 'px';
            console.log(iFrameStartHeight + currentY - startY);
            iframe.style.height = (iFrameStartHeight + currentY - startY) + 'px';
        }
    };

    // Function executed to stop resizing
    const stopResizing = () => {
        console.debug("# stopResizing");
        document.documentElement.removeEventListener('mousemove', startResizing);
        document.documentElement.removeEventListener('mouseup', stopResizing);
        document.documentElement.removeEventListener('touchmove', startResizing);
        document.documentElement.removeEventListener('touchend', stopResizing);

        // store the new size information in the note object
        //console.debug(note);
        //console.debug(note.querySelector('[name="box_width"]'));
        const regex = /\d+/;
        const w = element.style.width;
        const resultw = w.match(regex);
        const number_w = resultw ? parseInt(resultw[0], 10) : null;
        //console.debug(number_w);
        note.setAttribute("box_width", number_w);
        const h = element.style.height;
        const resulth = h.match(regex);
        const number_h = resulth ? parseInt(resulth[0], 10) : null;

        note.setAttribute("box_height", number_h);
        // update the message field height to track the note expasion
        var message_field = note.querySelector('[name="message_display_text"]');
        console.debug(message_field);
        const new_height = number_h - 70;
        message_field.style.height = new_height + "px";

    };

    // Adding the event listener to the element for starting the resize
    element.addEventListener('mousedown', initResize);
    element.addEventListener('touchstart', initResize);

}


/**
 * make note "draggable" across the screen
 */

function DELdragStickyNote(elmnt) {
    console.debug("# dragStickyNote");
    console.debug(elmnt);
    try {
        // identity the root element of the stickynote - based on any arbitrarily clicked element contained inside it.
        // check if clicked element is root
        // loop upwards until note root is found

        var StickyNoteRootNode = getYellowStickyNoteRoot(elmnt);
        //    if (isSticyNoteRoot(elmnt)) {
        //      // the element is the root and is the element where position should be set

        //        StickyNoteRootNode = elmnt;

        //  }

        console.debug(StickyNoteRootNode);

        var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
        if (document.getElementById(elmnt.id + "header")) {
            console.debug("2.0");
            // if present, the header is where you move the DIV from:
            document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
        } else {
            console.debug("2.2");
            // otherwise, move the DIV from anywhere inside the DIV:
            // assign top row in the note table to be "dragable"
            console.debug(StickyNoteRootNode.querySelector("tr[name='whole_note_topbar']"));

            StickyNoteRootNode.querySelector("tr[name='whole_note_topbar']").onmousedown = dragMouseDown;

            //elmnt.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
            console.debug("# dragMouseDown");
            console.debug(e);
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
            console.debug("# elementDrag");
            //console.debug(e);
            //console.debug(divOffset_y(e.target));
            //console.debug(divOffset_x(e.target));

            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            //console.debug(pos1);
            //console.debug(pos2);
            //console.debug(pos3);
            //console.debug(pos4);

            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            //console.debug(pos1);
            //console.debug(pos2);
            // console.debug(pos3);
            // console.debug(pos4);

            //console.debug(elmnt.offsetTop);
            //console.debug(elmnt.offsetLeft);

            //console.debug("seting y: " + (elmnt.offsetTop - pos2));
            //console.debug("seting x: " + (elmnt.offsetLeft - pos1));

            // set the element's new position:
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";

            //     cont1.setAttribute("type", 'glovebox');

            //console.debug(document.querySelector('container[type="glovebox"]'));

            //document.querySelector('container[type="glovebox"]').style.position = "absolute";

            //document.querySelector('container[type="glovebox"]').style.top = (elmnt.offsetTop - pos2) + "px";
            //document.querySelector('container[type="glovebox"]').style.left = (elmnt.offsetLeft - pos1) + "px";

            //document.querySelector('container[type="glovebox"]').setAttribute("posy", (elmnt.offsetTop - pos2));
            //document.querySelector('container[type="glovebox"]').setAttribute("posx", (elmnt.offsetLeft - pos1));

            //console.debug(document.querySelector('container[type="glovebox"]'));

        }

        function closeDragElement(e) {
            console.debug("# closeDragElement");
            //console.debug(e);
            // stop moving when mouse button is released:
            // store final position in root node
            //console.debug(StickyNoteRootNode);
            console.debug("seting y: " + (elmnt.offsetTop - pos2));
            console.debug("seting x: " + (elmnt.offsetLeft - pos1));
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";

            StickyNoteRootNode.setAttribute("posy", (elmnt.offsetTop - pos2));
            StickyNoteRootNode.setAttribute("posx", (elmnt.offsetLeft - pos1));

            document.onmouseup = null;
            document.onmousemove = null;
        }
    } catch (e) {
        console.error(e);
    }

}


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

function offset(el) {
    var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft
    }
}

/* locate the X-position on the page for element */
function divOffset_x(el) {
    var rect = el.getBoundingClientRect();
    //console.log(rect);
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    //console.debug(scrollLeft);
    // scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return (rect.right + scrollLeft);
}

/* locate the Y-position on the page for element */
function divOffset_y(el) {
    console.debug("# divOffset_y");
    var rect = el.getBoundingClientRect();
    //console.log(rect);
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    //console.debug(scrollTop);
    return (rect.top + scrollTop);
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
            console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
            // render content of ifram based on this
            //console.log(getYellowStickyNoteRoot(event.target));
            //setContentInIframe(content_iframe, response);

            resolve(response);
        });

    });

}


// return a drop down html list of all available distribution lists
function load_url(event) {
console.debug("load_url");
console.debug(event);
console.debug(event.target.parentNode);
    // get the root node of the note    
    var note_root = getYellowStickyNoteRoot(event.target.parentNode);
    console.debug(note_root);
    return new Promise(function (resolve, reject) {
console.debug(note_root.querySelector('input[id="urlInput"]'));
const url = note_root.querySelector('input[id="urlInput"]').value;

        console.debug("#### perform url lookup #### " + url);
            //console.debug(cont1);
         
            // check for content_url for notes that collect content from elsewhere
            try {
                //cont1.querySelector('input[id="urlInput"]').value = note_object_data.content_url;

                // start the process of looking up the content
                var content_iframe = note_root.querySelector('#contentFrame');
                console.log("content_iframe: " + content_iframe);
                // console.log(content_iframe);

                // send message to background serviceworker and it will lookup the URL. This is to bypass any CORS issues
                // Send save request back to background
                // Stickynotes are always enabled when created.
                console.log("remote url: " + url);
                chrome.runtime.sendMessage({
                    message: {
                        "action": "simple_url_lookup",
                        "url": url
                    }
                }).then(function (response) {
                    console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
                    // render content of ifram based on this
                    //console.log(getYellowStickyNoteRoot(event.target));
                    setContentInIframe(content_iframe, response);
                    resolve(cont1);
                });

            } catch (e) {
                console.error(e);
            }
    });
}



function save_new_note(event) {
    console.debug("browsersolutions ### save new note");
    console.debug(event);

    // save note to database
    try {
        // get the table node that is the root of the note data.

     
        var note_root = getYellowStickyNoteRoot(event.target);
        console.log(note_root);
        console.log(extract_node_data(note_root));

        var {
            uuid,
            message_display_text,
            selection_text,
            url,
            content_url,
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
        } = extract_node_data(note_root);
        console.debug("uuid: " + uuid);
        // only proceed if there is no uuid set - this note should not be created in this function
        if (uuid == null || uuid == "") {

            // carry createtime forwards unchanged
            var createtime = "";
            try {
                createtime = note_root.querySelectorAll('input[name="createtime"]')[0].textContent.trim();
            } catch (e) {
                // set default, current timestamp
                createtime = getCurrentTimestamp();

            }

            var  distributionlistid;   
            try{
            distributionlistid = note_root.querySelector('[name="distributionlistdropdown"]').value;
            console.log('Selected distributionlistid:', distributionlistid);
            }catch(e){
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

            // read out position parameters

            const posx = processBoxParameterInput(note_root.getAttribute("posx") , 0, 0, 1200);
            
            const posy = processBoxParameterInput(note_root.getAttribute("posy") , 0, 0, 5000);

            
            const box_width = processBoxParameterInput(note_root.getAttribute("box_width") , 250, 50, 500);


            const box_height = processBoxParameterInput(note_root.getAttribute("box_height") , 250, 50, 500);

            console.debug("message_display_text: " + message_display_text);
            console.debug("url: " + url);
            console.debug("createtime: " + createtime);
            console.debug("lastmodifiedtime: " + lastmodifiedtime);

            console.debug("selection_text: " + selection_text);
           
            
            let base64data = utf8_to_b64(selection_text);
            console.log(utf8_to_b64(selection_text)); 

            const json_create = {
                message_display_text: message_display_text,
                selection_text: utf8_to_b64(selection_text),
                url: url,
                enabled: "true",
                content_url: content_url,
                note_type: "webframe",
                distributionlistid: distributionlistid,
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


                // create new ones

                // call the function that will set which part of the note will be displayed
                console.debug("browsersolutions: call setComponentVisibility");
                setComponentVisibility(note_root, ",rw,.*normalsized,");

                console.debug("browsersolutions: call attachEventlistenersToYellowStickynote");
                attachEventlistenersToYellowStickynote(note_root);

            });
        } else {
            console.log("browsersolutions uuid already set - not creating new note");
        }
    } catch (e) {
        console.error(e);
    }
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

        const myload_url = (event) => {
            console.log("myload_url");
            load_url(event);
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
            allGoTo13[i].addEventListener("click", function(event){ 
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

        // load_url

        var allGoTo1_14 = note.querySelectorAll('[js_action="load_url"]');
        for (var i = 0; i < allGoTo1_14.length; i++) {
            allGoTo1_14[i].removeEventListener("click", myload_url);
            allGoTo1_14[i].addEventListener("click", myload_url);
        }


    } catch (e) {
        console.error(e);
    }
    console.log("attachEventlistenersToYellowStickynote.end");
}

function getYellowStickyNoteRoot(currentElement) {
    console.debug("# getYellowStickyNoteRoot");
    console.debug(currentElement);

    // let currentElement = element;
    // container type="yellownote"
    //console.log(currentElement);
    //console.log(currentElement.querySelector('container[type="yellownote"]'));

    // the root node of the yellownote is the first(top-most) container element with attribute type="yellownote"
    try {
        if (currentElement.hasAttribute("class")) {
            if (currentElement.getAttribute("class") === "yellownotecontainer")  {

                // Condition met, return this element
                return currentElement;
            }
        }
        while (currentElement !== null && currentElement !== document) {
            //console.log(currentElement);
            //console.log(currentElement.querySelector('container[type="yellownote"]'));
            if (currentElement.hasAttribute("class")) {
                if (currentElement.getAttribute("class") === "yellownotecontainer")  {

                    // Condition met, return this element
                    return currentElement;
                }
            }
            // Move up the DOM tree to the parent node
            currentElement = currentElement.parentNode;
        }

        // If the loop completes without finding an element with the target class
        return null;
    } catch (e) {
        console.error(e);
        return null;
    }
}

function setContentInIframe(iframe, content) {
console.debug("# setContentInIframe");
    //const iframe = document.getElementById(iframeId);
    if (iframe) {
        iframe.srcdoc = content; // Using srcdoc to set the content
    } else {
        console.error('Iframe not found');
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

function dragElement(elmnt) {
    console.debug("#dragElement")
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

function listener(request, sender, sendResponse) {
     console.debug("browsersolutions request: " + JSON.stringify(request));

    // chose which function to proceed with
    var PinToSelectedHTML_sharedsecret = "Glbx_maraskesfser6";

    //console.debug("request1: " + request.NoteSelectedHTML);
    //console.debug("request2: " + request.NavigateToSpecificStickynote);

    if (!(isUndefined(request.sharedsecret)) && !(isUndefined(request.contenttype))) {

        console.debug("browsersolutions: request.task: " + request.task);

        if (!(isUndefined(request.task)) && request.task == "createBlankWebFrameNote") {

            pinToNoHTML(request, sender, sendResponse).then(function (res) {
                console.log(res);

                sendResponse({
                    success: true,
                    data: "value"
                });

            });

        } else {

            pinToSelectedHTML(request, sender, sendResponse).then(function (one) {
                console.log("£££££££££££££££££££");
                console.log(one);
                sendResponse({
                    success: true,
                    data: "value"
                });
            });
        
        }

    }
    
    // ok, the messge is for this script and from the background.js
    // proceed
    console.debug("request: ok");




//}
    //locateStickyNote(request, sender, sendResponse);

    

    return true;
}

chrome.runtime.onMessage.addListener(listener);
