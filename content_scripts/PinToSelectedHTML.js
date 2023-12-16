/*
 * This JS is called then user has selected some html for action (encryption....) and it needs to be collected and sent to the plugin.
 * The call is made from background.js from a "chrome.tabs.executeScript" statement coupled with a "chrome.tabs.sendMessage".
 * executeScript sends the JS on the tab in question and makes the js a listener on the tab,
 * and sendMessage sends a message to this JS listener and the return data is the selected html.
 *
 * The selected data (text, html with or without embeded or linked data) is compressed and base64 encoded before being returned to background.js
 *
 */

console.debug("running PinToSelectedHTML.js");

//const URI_plugin_user_post_yellowstickynote = "/plugin_user_post_yellowstickynote";

var default_box_width = "250";
var default_box_heigth = "250";

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
    var note_type = "";
    try {
        note_type = note_root.querySelectorAll('input[name="note_type"]')[0].textContent.trim();
    } catch (e) {
        // set default, local url
    }

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
        message_display_text = note_root.querySelectorAll('textarea[name="message_display_text"]')[0].value.trim();
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
    var posx = "";
    posx = note_root.getAttribute("posx");
    if (posx === undefined || posx == "" || posx == null) {
        posx = "0";
    }
    var posy = "";
    posy = note_root.getAttribute("posy");
    if (posy === undefined || posy == "" || posy == null) {
        posy = "0";
    }
    var box_width;
    box_width = note_root.getAttribute("box_width");

    if (box_width === undefined || box_width == "" || box_width == null) {
        // use default width
        box_width = default_box_width;
    }

    var box_height;
    box_height = note_root.getAttribute("box_height");
    if (box_height === undefined || box_height == "" || box_height == null) {
        // use default height
        box_height = default_box_heigth; ;
    }
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
            note_type: note_type,
            content_url: content_url,
            uuid: uuid,
            enabled: "true",
            distributionlistid: distributionlistid,
            createtime: createtime,
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

function str2base64(str) {
    return btoa(str);
}

function base642str(base64) {
    return atob(base64);
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

// extract the essential fields from the note DOM object and return them as a JSON object
function NoteDOM2JSON(note) {
    console.debug("# NoteDOM2JSON");
    console.debug(note);
    try {

        console.debug(note.querySelector('[name="url"]').textContent);

        var posx = "";
        console.debug(note.querySelector('[name="posx"]'));
        if (note.querySelector('[name="posx"]')) {
            posx = note.querySelector('[name="posx"]').textContent;
        }
        var posy = "";
        if (note.querySelector('[name="posy"]')) {
            posy = note.querySelector('[name="posy"]').textContent;
        }

        var box_width = "";
        if (note.querySelector('[name="box_width"]')) {
            box_width = note.querySelector('[name="box_width"]').textContent;
        } else {
            box_width = default_box_width;
        }

        var box_height = "";
        if (note.querySelector('[name="box_height"]')) {
            box_height = note.querySelector('[name="box_height"]').textContent;
        } else {
            box_height = default_box_heigth;
        }

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
    var note_uuid = guid();

    // create the note object data with suitable initial values for some fields
    var note_object_data = {
        "selection_text": selection_text,
        "message_display_text": selection_text,
        "createtime": getCurrentTimestamp(),
        "lastmodifiedtime": getCurrentTimestamp(),
        "enabled": true,
        "brand": brand,
        "note_type": note_type,
        "noteID": note_uuid
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

    // // <container class="yellow_note" type="yellowstickynote" posy="2" posx="0" box_width="250" box_heigth="250" >
    //    node_root.setAttribute("class", "yellowstickynote");
    node_root.setAttribute("type", 'yellowstickynote');
    node_root.setAttribute("minimized", 'visible');
    // resets all CSS to initial
    node_root.setAttribute("display", 'all: initial;');
    node_root.setAttribute("note_uuid", note_uuid);
    //node_root.setAttribute("draggable", 'true');
    //  node_root.setAttribute("style", 'width: 100px; height: 100px; background-color: yellow; position: absolute; z-index: 103;');

    var note_template = safeParseInnerHTML(html, 'div');
    // note_template = JSON.parse(html);
    console.log(note_template);

    node_root.appendChild(note_template);
    try {
        // Locate the form element
        var noteForm = node_root.querySelector('form[name="note_form"]');
        noteForm.querySelector('input[type="hidden"][name="selection_text"]').replaceChildren(document.createTextNode(note_object_data.selection_text));
        noteForm.querySelector('input[type="hidden"][name="brand"]').textContent = note_object_data.brand;
        noteForm.querySelector('input[type="hidden"][name="note_type"]').replaceChildren(document.createTextNode(note_object_data.note_type));
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
    } catch (e) {
        console.error(e);

    }

    // attach event listeners to buttons and icons
    attachEventlistenersToYellowStickynote(node_root);

    // make the message in the textarea touch-n-go
    try {
        // Grab the textarea element
        const textarea = node_root.querySelector('textarea[name="message_display_text"]');

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

    console.debug("# create_new_note promise resolved");
    return node_root;
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


function pinToSelectedHTML(request, sender, sendResponse) {

    // contenttype
    // permitted values: text, html, embeded, linked

    console.debug("request selected JSON(request): " + JSON.stringify(request));
    console.debug("request selected JSON(sender): " + JSON.stringify(sender));
    console.debug("request selected JSON(sendResponse): " + JSON.stringify(sendResponse));

    return new Promise(function (resolve, reject) {

        var background_to_NoteSelectedHTML_sharedsecret = "Glbx_marker6";

        // Use the represence of the dummy value "Glbx_marker" in the request as a
        // insecure "shared secret" to try to ensure only request from the
        // background.js are accepted.
        // This must be improved.
        try {

            if (request.NoteSelectedHTML == background_to_NoteSelectedHTML_sharedsecret) {
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
                    console.log("calling create_new_stickynote_2 with selection_text: " + selection_text);
                    // create_new_stickynote_2(selection_text).then(function (newGloveboxNode) {
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

                     
                      setComponentVisibility(inserted, ",new,.*normalsized,");
                     
                                  // make note dragable
                                  //dragStickyNote(insertedNode2)
  console.debug(inserted.querySelector("[name='brand_logo']"));
                                  makeDraggable(inserted.querySelector("[name='brand_logo']"));
                                  makeResizable(inserted);

                    

                    // add the dropdown list of available distribution lists
                    dropdownlist_add_option(inserted)
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

                //            return false;
            }

        } catch (e) {
            console.debug(e);
        }
        //return true;

    });

}

function dropdownlist_add_option(dropdownlist, option_text, option_value) {
    // check if the tempate contains a dropdown list, if so pupulate it with the available distribution lists
    const dl_container = newGloveboxNode.querySelector('[name="distributionlistdropdown"]');
    dl_container.replaceChildren(document.createTextNode("loading..."));

    get_distributionlist().then(function (response) {
        console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));

        const selectElement = document.getElementById('distributionList');
        response.forEach(item => {
            console.log(item);
            const option = document.createElement('option');
            option.value = item.distributionlistid;
            option.textContent = `ID: ${item.distributionlistid}, Originator: ${item.OriginatorID}, Name: ${item.Name}`;
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

    return new Promise(function (resolve, reject) {

        chrome.runtime.sendMessage({
            stickynote: {
                "request": "get_my_distribution_lists"

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

// attache event isteners to button and icons, to trigger actions when clicked
function attachEventlistenersToYellowStickynote(note) {
    console.log("attachEventlistenersToYellowStickynote.start");
    console.debug(note);

    // call up the URL for the iframe
    var url;
    note.querySelector('#loadButton').addEventListener('click', function () {
        console.log("loadButton clicked");
        url = document.getElementById('urlInput').value;
        console.log("url: " + url);

            var content_iframe = note.querySelector('#contentFrame');
            console.log("content_iframe: " + content_iframe);
            console.log(content_iframe);

            // send message to background serviceworker and it will lookup the URL. This is to bypass any CORS issues
            // Send save request back to background
            // Stickynotes are always enabled when created.
            console.log("url: " + url);
            chrome.runtime.sendMessage({
                stickynote: {
                    "request": "simple_url_lookup",
                    "url": url
                }
            }).then(function (response) {
                console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
                // render content of ifram based on this
                //console.log(getYellowStickyNoteRoot(event.target));
                setContentInIframe(content_iframe, response);

            });
    });

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
            event.stopPropagation();
        };

        const mymaximize_note = (event) => {
            maximize_note(event);
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
        const mySave_changes_to_note = (event) => {
            save_changes_to_note(event);
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
            allGoTo[i].removeEventListener("click", myclose_note);
            allGoTo[i].addEventListener("click", myclose_note);
        }

        // for save buttons/icons
        var allGoTo3 = note.querySelectorAll('[js_action="save_new_note"]');
        for (var i = 0; i < allGoTo3.length; i++) {
            allGoTo3[i].removeEventListener("click", mySave_new_note);
            allGoTo3[i].removeEventListener("click", mySave_changes_to_note);
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

        var allGoTo7 = note.querySelectorAll('[js_action="save_changes_to_note"]');
        for (var i = 0; i < allGoTo7.length; i++) {
            allGoTo7[i].removeEventListener("click", mySave_new_note);
            allGoTo7[i].removeEventListener("click", mySave_changes_to_note);
            allGoTo7[i].addEventListener("click", mySave_changes_to_note);
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
            allGoTo12[i].removeEventListener("click", myminimize_note);
            allGoTo12[i].addEventListener("click", myminimize_note);
        }

        var allGoTo13 = note.querySelectorAll('[js_action="maximize_note"]');
        for (var i = 0; i < allGoTo13.length; i++) {
            allGoTo13[i].removeEventListener("click", mymaximize_note);
            allGoTo13[i].addEventListener("click", mymaximize_note);
        }
        var allGoTo14 = note.querySelectorAll('[js_action="rightsize_note"]');
        for (var i = 0; i < allGoTo14.length; i++) {
            allGoTo14[i].removeEventListener("click", myrightsize_note);
            allGoTo14[i].addEventListener("click", myrightsize_note);
        }

    } catch (e) {
        console.error(e);
    }

}

function getYellowStickyNoteRoot(currentElement) {

    // let currentElement = element;
    // container type="yellowstickynote"
    //console.log(currentElement);
    //console.log(currentElement.querySelector('container[type="yellowstickynote"]'));

    if (currentElement.hasAttribute("type")) {
        if (currentElement.getAttribute("type") === "yellowstickynote") {

            // Condition met, return this element
            return currentElement;
        }
    }
    while (currentElement !== null && currentElement !== document) {
        //console.log(currentElement);
        //console.log(currentElement.querySelector('container[type="yellowstickynote"]'));
        if (currentElement.hasAttribute("type")) {
            if (currentElement.getAttribute("type") === "yellowstickynote") {

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

function setContentInIframe(iframe, content) {

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
    // console.debug("browsersolutions request: " + JSON.stringify(request));

    // chose which function to proceed with

    //console.debug("request1: " + request.NoteSelectedHTML);
    //console.debug("request2: " + request.NavigateToSpecificStickynote);

    pinToSelectedHTML(request, sender, sendResponse).then(function (one) {
        console.log("£££££££££££££££££££");
        console.log(one);

    });

    //locateStickyNote(request, sender, sendResponse);

    sendResponse({
        success: true,
        data: "value"
    });

    return true;
}

chrome.runtime.onMessage.addListener(listener);
