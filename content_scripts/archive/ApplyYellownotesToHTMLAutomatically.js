/*
 * This JS is called then user has selected some html for action (encryption....) and it needs to be collected and sent to the plugin.
 * The call is made from background.js from a "chrome.tabs.executeScript" statement coupled with a "chrome.tabs.sendMessage".
 * executeScript sends the JS on the tab in question and makes the js a listener on the tab,
 * and sendMessage sends a message to this JS listener and the return data is the selected html.
 *
 * The selected data (text, html with or without embeded or linked data) is compressed and base64 encoded before being returned to background.js
 *
 */

/*
 * This script also depends functions contained NoteSelectedHTML.js, another content script which should available
 *
 *
 */

console.debug("browsersolutions" + "running ApplyYellownotesToHTMLAutomatically.js");

var whole_page_text;

// contain node object and the position within overall text (white space removed)
var textnode_map = [];
document
// in milliseconds
var update_time_limit = 1000

    var page_scanned = false;

var shared_secret_to_identify_background_js_to_content_script_ApplyYellowNotesToHTML = "Glbx_m_ker7";

// place a small slider in the upper right corner of the page to indicate whether or not stucky notes should be shown
// Set the inner HTML of the div
//newDiv.innerHTML = "<h1>Hello, this is inserted by the extension!</h1>";
//const rootElement = document.documentElement;
//console.log(rootElement);
//rootElement.insertBefore(newDiv, rootElement.firstChild);
//document.body.insertBefore(newDiv, document.body.firstChild);


var noteAudience;
var Cursor_clientX;
var Cursor_clientY;
var Cursor_layerX;
var Cursor_layerY;

var default_box_width = 250;
var default_box_heigth = 250;

getNoteAudience().then(result => {
    noteAudience = result;
    console.log('#############');
    console.log('noteAudience: ', noteAudience);

    // noteAudince = 0 means to not lookup any notes for this tab/page at all

    if (noteAudience == 1) {
        // close all notes on this page
        console.debug("browsersolutions: " + "close all notes on this page");

        chrome.runtime.sendMessage({
            message: {
                "action": "execute_notesupdate_on_page",
                "parameters": {
                    "position": 1
                }
            }
        }).then(function (res) {
            console.log(res);
        }).catch(error => {
            console.error('Error:', error);
        });

    } else if (noteAudience == 2) {
        // close all notes on this page that are not the users' own

        // check for own notes pertaining to this URL
        console.debug("browsersolutions: " + "check for own notes pertaining to this URL");
        chrome.runtime.sendMessage({
            message: {
                "action": "execute_notesupdate_on_page",
                "parameters": {
                    "position": 2
                }
            }
        }).then(function (res) {
            console.log(res);
        }).catch(error => {
            console.error('Error:', error);
        });

        // finally, call "close" on the note

    } else if (noteAudience == 3) {
        // get all in-scope notes for this page

        console.debug("browsersolutions: " + "get all in-scope notes for this page");

        console.debug("browsersolutions: " + "check for own notes pertaining to this URL");
        chrome.runtime.sendMessage({
            message: {
                "action": "execute_notesupdate_on_page",
                "parameters": {
                    "position": 3
                }
            }
        }).then(function (res) {
            console.log(res);
        }).catch(error => {
            console.error('Error:', error);
        });

    } else {

        //place current timestamp in memory as a marker to check
        // Usage example
        checkAndUpdateTimestamp().then(result => {
            console.log('Result:', result);

            // only run if update time limit has been exceeded
            if (result) {
                // up the timelimit has been exceeded. now find out which notes to look for, and place them on the page

                //getNotes(noteAudience);

            } else {
                console.debug("browsersolutions not yet time");
            }

        }).catch(error => {
            console.error('Error:', error);
        });
    }
});

function update_note(event) {
    console.debug("browsersolutions #update_note");
    console.debug(event);

    var note_root = getYellowStickyNoteRoot(event.target);
    console.log(note_root);

    // call to background and trigger the save operation from there


    // save note to database
    try {
        // get the table node that is the root of the note data.

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
            message_display_text = note_root.querySelectorAll('textarea[name="message_display_text"]')[0].value.trim();
        } catch (e) {}

        var enabled = "";
        try {
            enabled = note_root.querySelectorAll('input[name="enabled"]')[0].textContent.trim();
        } catch (e) {
            // set default
            enabled = true;
        }

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

        var posx = "";
        var posy = "";
        var box_width;
        var box_height;

        // measure the current width of the box

        if (note_root) {
            var rect = note_root.querySelector('[name="whole_note_table"]').getBoundingClientRect();
            console.log(rect.width); // This is the width of the element
            box_width = rect.width;
            if (box_width == 0) {
                // use the existing preset value
                box_width = note_root.getAttribute("box_width");
                if (box_width === undefined || box_width == "" || box_width == null) {
                    // use default width
                    box_width = default_box_width;
                }
            } else {
                // convert to integer
                box_width = parseInt(box_width);
            }

            console.log(rect.height); // This is the heigth of the element
            box_height = rect.height;
            if (box_height == 0) {
                // use the existing preset value
                box_height = note_root.getAttribute("box_height");
                if (box_height === undefined || box_height == "" || box_height == null) {
                    // use default width
                    box_height = default_box_height;
                }
            } else {
                // convert to integer
                box_height = parseInt(box_height);
            }

            posx = rect.x;
            if (posx == 0) {
                // use the existing preset value
                posx = note_root.getAttribute("posx");
                if (posx === undefined || posx == "" || posx == null) {
                    // use default position
                    posx = "50";
                }
            } else {
                // convert to integer
                posx = parseInt(posx);
            }

            // capture who far down the page the user has scrolled
            var scrollPositionY = window.scrollY;

            console.debug("browsersolutions: " + "scrollPositionY: " + scrollPositionY);
            posy = scrollPositionY + rect.y;
            if (posy == 0) {
                // use the existing preset value
                posy = note_root.getAttribute("posy");
                if (posy === undefined || posy == "" || posy == null) {
                    // use default position
                    posy = "50";
                }
            } else {
                // convert to integer
                posy = parseInt(posy);
            }
            console.log(rect); // This is the width of the element

        }

        console.debug("message_display_text: " + message_display_text);
        console.debug("url: " + url);
        console.debug("uuid: " + uuid);
        console.debug("createtime: " + createtime);
        console.debug("lastmodifiedtime: " + lastmodifiedtime);
        console.debug("selection_text: " + selection_text);

        // Encode the String
        var encodedString = btoa(selection_text);
        console.log(encodedString); // Outputs: "SGVsbG8gV29ybGQh"

        const json_update = {
            message_display_text: message_display_text,
            selection_text: encodedString,
            url: url,
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

function delete_note(event) {
    console.debug("browsersolutions delete note");
    console.debug(event);
    // get the node that is the root of the sticky note.

    var note_obj = getYellowStickyNoteRoot(event.target);

    var uuid = note_obj.querySelectorAll('[name="uuid"]')[0].textContent.trim();

    console.debug("browsersolutions uuid: " + uuid);

    // send delete request back to server to delete the note.
    // rely on the browser already having an authenticated session with the server.


    chrome.runtime.sendMessage({
        message: {
            "action": "single_note_delete",
            "delete_details": {
                "uuid": uuid
            }
        }
    }, function (response) {
        console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
    });

}

function isNoteOnPage(uuid) {
    console.debug("browsersolutions isNoteOnPage (" + uuid + ")");
    return document.querySelectorAll('[uuid="' + uuid + '"]').length > 0;
}

// This is the main function.
// Check with the central service if there are any notes for this URL
function getNotes(noteAudience) {
    console.log("browsersolutions getNotes (noteAudience: " + noteAudience + ")");
    var notes_found;
    var note_template_html;
    var note_template;

    var url = window.location.href.trim();
    var msg;
    console.log(noteAudience);
    console.log((noteAudience == 2));
    if (noteAudience == 2) {
        // check for own notes pertaining to this URL
        getOwnNotes().then(function (response) {
            console.debug("browsersolutions" + "message sent to backgroup.js with response: " + JSON.stringify(response));
            notes_found = response;
        });

    } else if (noteAudience == 3) {

        // check for any notes that pertains to this URL
        getAllNotes().then(function (response) {
            console.debug("browsersolutions" + "message sent to backgroup.js with response: " + JSON.stringify(response));
            notes_found = response;
        });

    }
}

/*
note_obj contains the data that populated the note

note_template contains the html making up the DOM tree of the note, including all styling and graphical elements.
There are no external references; The note is self contained.


First attempt to use the selction text in the note to place the note in the document. If there are no selection text, use the coordinates in the note to place the note. If there are no coordinates, place the note on top of the page.

 * */

function placeStickyNote(note_obj, note_template, isOwner) {
    console.debug("browsersolutions: #placeStickyNote.start");
    // contenttype
    // permitted values: text, html, embeded, linked
    console.debug(note_obj);
    console.debug(note_template);
    console.debug(isOwner);

    if (typeof note_obj == 'undefined') {
        // nothing to do
    } else {

        if (note_obj.selection_text == "") {
            // if no selection_text, only position co-ordinates can place the note

            try {
                create_stickynote_node(note_obj, note_template).then(function (response) {
                    var newGloveboxNode = response;

                    console.debug(newGloveboxNode);
                    size_and_place_note_based_on_coordinates(newGloveboxNode, note_obj);
                    attachEventlistenersToYellowStickynote(newGloveboxNode);

                    // Make the stickynote draggable:
                    //dragStickyNote(newGloveboxNode);
                });
            } catch (e) {
                console.debug("browsersolutions " + e);
            }

        } else {
            console.debug("browsersolutions: attempt selection text macthing");
            // check if note contains position coordinates/parameters. If so, try to use them to place the note.


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
                console.debug(root_node);

                whole_page_text = "";
                console.debug("browsersolutions: " + traverse(doc.documentElement));
                console.debug("browsersolutions: " + "################################################");
                // console.debug("browsersolutions: " +whole_page_text);
                // console.debug("browsersolutions: " +textnode_map);

                // console.debug("browsersolutions: " +whole_page_text.replace(/\s/g, ""));
                //console.debug(selectionText.replace(/\s/g,""));
                // remove all whitespace before making attempt to place selection inside larger text


                console.debug("browsersolutions: " + "note: " + JSON.stringify(note_obj));
                // locate where this note goes.
                var uuid = note_obj.uuid;
                // var obj = JSON.parse(note_obj.json);
                // Create Base64 Object


                // Decode the String containing the selection text
                console.debug("browsersolutions: selection_text: " + note_obj.selection_text);

                var selection_text = base64ToText(note_obj.selection_text);
                console.debug("browsersolutions: selection_text: " + selection_text);

                // fiund where in the DOM the selection text is found (if at all)
                var {
                    selection_matched_in_document,
                    start_range_node,
                    start_offset,
                    end_range_node,
                    end_offset
                } = getDOMplacement(selection_text, note_obj);

                console.log("selection_matched_in_document: " + selection_matched_in_document);
                console.debug("browsersolutions: start_range_node");
                console.log(start_range_node);
                console.log("start_offset: " + start_offset);
                console.log(end_range_node);
                console.log("end_offset: " + end_offset);
                // if the selection text that should be use to anchor the note in the document found, switch to using the coordinates contained in the note

                if (selection_matched_in_document) {

                    console.debug("browsersolutions: selection_matched_in_document " + selection_matched_in_document);

                    console.debug(start_range_node.textContent);
                    let original_start_range_node_textcontent = start_range_node.textContent;
                    console.debug("browsersolutions: start_range_node start_offset " + start_offset);
                    console.debug("browsersolutions: start_range_node total text length: " + start_range_node.textContent.length);

                    console.debug("browsersolutions: end_range_node");
                    console.debug(end_range_node.textContent);
                    console.debug("browsersolutions: end_range_node end_offset " + end_offset);
                    console.debug("browsersolutions: end_range_node total text length: " + end_range_node.textContent.length);
                    console.debug("browsersolutions: nodesAreIdentical:" + nodesAreIdentical(start_range_node, end_range_node));
                    // create message box and anchor it
                    //console.debug("1.1.3");
                    // create html of tooltip
                    //var it2 = document.createElement("div");

                    //it2.setAttribute("class", 'xstooltip');

                    // create the yellow note, later attach it to the right location in the DOM
                    create_stickynote_node(note_obj, note_template).then(function (response) {
                        var newGloveboxNode = response;

                        console.debug(newGloveboxNode);

                        //newGloveboxNode.addEventListener('mouseenter',
                        //    function () {
                        //    console.debug("browsersolutions: " + "### mouseover");
                        //    // add functionality to display selection linked to this note
                        //});
                        //attachEventlistenersToYellowStickynote(newGloveboxNode);


                        // Construct a DOM range-type object of the selected text, and use this give to a coloured background to the selected text

                        // insert the note DOM-object into the textnode where the selection was made from. right before text selection begins.
                        // this means splitting the text node into two parts, inserting the note in between them.

                        if (start_range_node.nodeType == Node.TEXT_NODE) {
                            console.debug("browsersolutions: is text node");
                            var mark2 = document.createElement('span');
                            var insertedNode;
                            // if the selection text is within one single text node in the document, then do things a little differently
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

                                // Link the span to the note by setting the "to_note" attribute to the uuid of the note
                                // newly created notes do not have a uuid yet, in which case, use ""
                                var note_id = note_obj.uuid;

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
                                //console.log("browsersolutions: insertedNode at root");
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

                                // Link the span to the note by setting the "to_note" attribute to the uuid of the note
                                // newly created notes do not have a uuid yet, in which case, use ""
                                var note_id = note_obj.uuid;

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
                            //const rootElement = document.documentElement; // For <html> as root
                            //const insertedNode2 = rootElement.appendChild(newGloveboxNode);
                            //console.debug(insertedNode2);
                            attachEventlistenersToYellowStickynote(insertedNode);

                            // whether or not a note is owned  by the current user will be flaged in the DOM (for easier handling of selective-removal of notes)))
                            if (isOwner) {
                                console.debug(insertedNode);
                                insertedNode.setAttribute("isOwner", "true");
                            } else {
                                insertedNode.setAttribute("isOwner", "false");
                            }
                            console.debug("######################################################");

                            // Set which parts of the note DOM tree is visible -
                            // Depending of whether or not the note is editable, some buttons will be visible or not.
                            // Only the note owner should see editing button

                            if (isOwner) {
                                setComponentVisibility(insertedNode, ",rw,.*normalsized,");
                            } else {
                                setComponentVisibility(insertedNode, ",ro,.*normalsized,");
                            }
                            // make note dragable
                            console.debug(insertedNode);
                            //makeDraggable(insertedNode);
                            //makeResizable(insertedNode);

                            // determine which part of the text is before and after the start of the selection
                            // save whole text
                            // remove all text after the selection point
                            // add an empty element after the end of the text node
                            // determine position of this element
                            // remove element
                            // restore the original text

                            //var {
                            //    insertedNote,
                            //    start_range_node_preceeding
                            //} = insertNodeIntoTextNodebeforeSelectionText(start_range_node, start_offset, newGloveboxNode);

                            // updateNotePositionCoordinates(insertedNote, newGloveboxNode);


                            //  console.debug("browsersolutions: " + "Y-position: " + divOffset_y(insertedNote));
                            //  console.debug("browsersolutions: " + "X-position: " + divOffset_x(insertedNote));
                            // console.debug("browsersolutions: " + "Y-position: " + divOffset_y(spanNode));
                            // console.debug("browsersolutions: " + "X-position: " + divOffset_x(spanNode));


                        } else {
                            console.debug("browsersolutions: " + " is not text node");
                            // in case the start node is not a text node, insert the note as preceeding it.

                            const insertedNode = start_range_node.parentNode.insertBefore(newGloveboxNode, start_range_node)
                                console.log(insertedNode);

                            // whether or not a note is owned  by the current user will be flaged in the DOM (for easier handling of selective-removal of notes)))
                            if (isOwner) {
                                console.debug(insertedNode);
                                insertedNode.setAttribute("isOwner", "true");
                            } else {
                                insertedNode.setAttribute("isOwner", "false");
                            }
                            console.debug("######################################################");

                        }

                        //return;
                    });

                } else {
                    // the selection text was not found in the document...
                    // look for coordinates in the note
                    console.debug("browsersolutions: selection text not found in note, using coordinates instead");
                    try {

                        console.log("browsersolutions: " + "note posx: " + note_obj.posx);
                        console.log("browsersolutions: " + "note posy: " + note_obj.posy);

                        // check if note contains position coordinates/parameters. If so, try to use them to place the note
                        var valid_stickynote_position_coordinate_regexp = new RegExp(/[0-9][0-9]*/);

                        var posx = "";

                        posx = note_obj.posx;

                        var posy = "";

                        posy = note_obj.posy;

                        console.debug("browsersolutions: " + "using posx:" + posx + " posy:" + posy);

                        console.debug("browsersolutions: " + valid_stickynote_position_coordinate_regexp.test(posx));
                        console.debug("browsersolutions: " + valid_stickynote_position_coordinate_regexp.test(posy));

                        try {
                            create_stickynote_node(note_obj, note_template).then(function (newGloveboxNode) {
                                console.debug(newGloveboxNode);
                                size_and_place_note_based_on_coordinates(newGloveboxNode, note_obj);

                                if (isOwner) {
                                    setComponentVisibility(newGloveboxNode, ",rw,.*normalsized,");
                                } else {
                                    setComponentVisibility(newGloveboxNode, ",ro,.*normalsized,");
                                }
                                attachEventlistenersToYellowStickynote(newGloveboxNode);

                                newGloveboxNode.addEventListener('mouseenter',
                                    function () {
                                    console.debug("browsersolutions ### mouseover");

                                });

                                if (isOwner) {
                                    console.debug(newGloveboxNode);
                                    newGloveboxNode.setAttribute("isOwner", "true");
                                } else {
                                    newGloveboxNode.setAttribute("isOwner", "false");
                                }
                                console.debug("######################################################");

                                // Make the stickynote draggable:
                                dragStickyNote(newGloveboxNode);
                            });

                        } catch (e) {
                            console.debug("browsersolutions " + e);
                        }
                    } catch (e) {
                        console.debug(e);
                    }

                }
            } catch (e) {
                console.debug(e);
            }
        }
        return true;
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

/*
disable the note means to keep it from being placed on the pages where it is attached.
It is still visible in the list of notes in the database, but not "on the page". Or available for distribution to other users.
User can still mange the note from the GUI - and re-enable it.
 */

function disable_note(event) {
    console.debug("disable note");
    console.debug(event);
    try {
        var note_root = getYellowStickyNoteRoot(event.target);

        console.debug(note_root);

        var uuid = note_root.getAttribute("uuid");

        console.debug("browsersolutions uuid: " + uuid);

        // send save request back to background
        chrome.runtime.sendMessage({
            message: {
                "action": "single_note_disable",
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
            remove_uuid(uuid);
        });

    } catch (e) {
        console.error(e);
    }
}

function remove_uuid(uuid) {
    console.log("remove_uuid: " + uuid);
    //    var note_root = document.querySelectorAll('[type="yellownote"]')[0];
    var note_root = document.querySelectorAll('[type="yellownote"][uuid="' + uuid + '"]')[0];
    console.debug(note_root);
    remove_note(note_root);

}

var default_box_width = "250";
var default_box_height = "250";

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
            console.debug(allGoTo[i]);
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
            console.log("attach delete note event listener");
            console.debug(allGoTo2[i]);
            allGoTo2[i].removeEventListener("click", mydelete_note);
            allGoTo2[i].addEventListener("click", mydelete_note);
        }

        var allGoTo5 = note.querySelectorAll('[js_action="copy_note_to_clipboard"]');
        for (var i = 0; i < allGoTo5.length; i++) {
            console.log("attach copy note to clipboard event listener");
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
            console.log("attach disable note event listener");
            console.debug(allGoTo8[i]);
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
            console.log("attach minimize note event listener");
            console.log(allGoTo12[i])
            allGoTo12[i].removeEventListener("click", myminimize_note);
            allGoTo12[i].addEventListener("click", myminimize_note);
        }

        var allGoTo13 = note.querySelectorAll('[js_action="fullscreen_note"]');
        for (var i = 0; i < allGoTo13.length; i++) {
            console.log("attach fullscreen note event listener");
            console.debug(allGoTo13[i]);
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

/*
 * serialize the note object into a form which is suitable for pasting into chat messages, email and the like.
 *
 */

function copy_note_to_clipboard(event) {
    console.debug("# copy yellow note to clipboard");
    // call to copy not to clipboard

    // loop upwards from the target nodes to locate the root node for the sticky note

    const root_note = getYellowStickyNoteRoot(event.target);
    console.debug(root_note);
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
            box_height = default_box_height;
        }

        var output = {
            url: note.querySelector('[name="url"]').textContent,
            uuid: note.querySelector('[name="uuid"]').textContent,
            message_display_text: note.querySelector('[name="message_display_text"]').value,
            enabled: note.querySelector('[name="enabled"]').textContent,
            selection_text: note.querySelector('[name="selection_text"]').textContent,
            posx: posx,
            posy: posy,
            box_width: box_width,
            box_height: box_height,
            createtime: note.querySelector('[name="createtime"]').textContent,
            lastmodifiedtime: note.querySelector('[name="lastmodifiedtime"]').textContent
        }
        console.debug(output);
        return output;
    } catch (e) {
        console.error(e);
    }

    // createtime: note.querySelector('[name="createtime"]').textContent,
    //   lastmodifiedtime: note.querySelector('[name="lastmodifiedtime"]')


}

function updateClipboard(newClip) {
    navigator.clipboard.writeText(newClip).then(function () {
        /* clipboard successfully set */
    }, function () {
        /* clipboard write failed */
    });
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

function makeDraggable(element) {
    console.debug("browsersolutions: " + "makeDraggable");
    console.debug(element);
    let dragElement = getYellowStickyNoteRoot(element); // move the root node
    //let dragElement = element
    let offsetX,
    offsetY;

    // Function to handle the dragging
    const onMove = (event) => {
        // write code to interupt the event propagation here
        event.stopPropagation();

        // console.debug("browsersolutions: onMove");
        let clientX,
        clientY;

        // Check if it's a touch event
        if (event.changedTouches) {
            clientX = event.changedTouches[0].clientX;
            clientY = event.changedTouches[0].clientY;
        } else { // Mouse event
            clientX = event.clientX;
            clientY = event.clientY;
        }

        dragElement.style.left = clientX - offsetX + 'px';
        dragElement.style.top = clientY - offsetY + 'px';
    };

    // Function to clean up after dragging
    const onEnd = () => {
        console.debug("browsersolutions: " + "onEnd");
        //event.stopPropagation();
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchend', onEnd);
    };

    // Initial setup
    const onStart = (event) => {
        event.stopPropagation();
        let clientX,
        clientY;
        let rect = dragElement.getBoundingClientRect();

        // Check if it's a touch event
        if (event.touches) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else { // Mouse event
            clientX = event.clientX;
            clientY = event.clientY;
        }

        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;

        // Set the position properties if not already set
        if (window.getComputedStyle(dragElement).position === 'static') {
            dragElement.style.position = 'absolute';
        }

        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove);
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);
    };

    // Attach event listeners for both touch and mouse events
    element.addEventListener('mousedown', onStart);
    element.addEventListener('touchstart', onStart);
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

function updateNotePositionCoordinates(insertedNote, newGloveboxNode) {
    console.debug("browsersolutions: " + "Y-position: " + divOffset_y(insertedNote));
    console.debug("browsersolutions: " + "X-position: " + divOffset_x(insertedNote));
    // console.debug("browsersolutions: " + "Y-position: " + divOffset_y(spanNode));
    //console.debug("browsersolutions: " + "X-position: " + divOffset_x(spanNode));
    try {
        newGloveboxNode.setAttribute("posy", Math.round(divOffset_y(insertedNote)));
        newGloveboxNode.setAttribute("posx", Math.round(divOffset_x(insertedNote)));
        newGloveboxNode.setAttribute("width", 250);
        newGloveboxNode.setAttribute("heigth", 250);
    } catch (e) {
        console.debug("browsersolutions " + e);
    }
}

function insertNodeIntoTextNodebeforeSelectionText(start_range_node, start_offset, newGloveboxNode) {
    var original_start_range_node_textcontent = start_range_node.textContent;
    const start_range_node_preceeding = start_range_node.splitText(start_offset);
    console.debug("browsersolutions: " + start_range_node_preceeding.textcontent);

    //console.debug("browsersolutions: portion of text node preceeding the start node: " + original_start_range_node_textcontent.trim());
    //console.debug("Y-position: " + divOffset_y(bar));
    //console.debug("X-position: " + divOffset_x(bar));
    console.debug(start_range_node_preceeding.parentNode);
    console.debug("browsersolutions: " + "start_range_node_preceedin parent Y-position: " + divOffset_y(start_range_node_preceeding.parentNode));
    console.debug("browsersolutions: " + "start_range_node_preceeding parent X-position: " + divOffset_x(start_range_node_preceeding.parentNode));
    //console.debug("Y-position: " + divOffset_y(start_range_node));
    //console.debug("X-position: " + divOffset_x(start_range_node));
    //console.debug("Y-position: " + divOffset_y(start_range_node_preceeding));
    //var mark = document.createElement('span');

    //const spanNode = start_range_node.parentNode.insertBefore(mark, start_range_node.nextSibling);

    const insertedNote = start_range_node.parentNode.insertBefore(newGloveboxNode, start_range_node.nextSibling);

    return {
        insertedNote,
        //spanNode,
        original_start_range_node_textcontent,
        start_range_node_preceeding
    };
}

function getDOMplacement(selection_text, note_obj) {
    if (selection_text !== undefined && selection_text.length > 0) {

        var message_display_text = note_obj.message_display_text;
        var selection_matched_in_document = false;

        // start
        var start_range_node;
        var start_offset = 0;
        // end
        var end_range_node;
        var end_offset = 0;
        // using the position of the start of the selection text within the whole text, determine the start node where the selection begins
        // try to match the selection text to the text in the document
        var one = getDOMposition(textnode_map, selection_text);
        console.debug("browsersolutions " + JSON.stringify(one));
        // Now the starting node for the selection is found, as well as the end node (and character offset within the nodes)
        if (one === undefined) {
            console.log("browsersolutions: " + "This is undefined");
            // not place to in the page to attach the note to. place it on top of the page
            start_range_node = document.querySelector(':root');
            start_offset = 0;
            // end
            end_range_node = start_range_node;
            end_offset = 0;

        } else {

            console.debug("browsersolutions: " + JSON.stringify(one));

            if (one.start_range_node === undefined) {
                console.debug("browsersolutions: unable to locate the selection text");
                // if the selection text in the note is not matchable on the page, something that will be a common occurence on dynamic sites, place the note on top of the page

                start_range_node = document.querySelector(':root');
                start_offset = 0;
                // end
                end_range_node = start_range_node;
                end_offset = 0;

            } else {
                selection_matched_in_document = true;

                start_range_node = one.start_range_node;
                end_range_node = one.end_range_node;
                start_offset = one.start_offset;
                end_offset = one.end_offset;

            }

        }
    } else {
        // No text selected in the note that can anchor the palcement of the note to the page. Place the note on top of the page
        start_range_node = document.querySelector(':root');
        start_offset = 0;
        // end
        end_range_node = start_range_node;
        end_offset = 0;
    }
    return {
        selection_matched_in_document,
        start_range_node,
        start_offset,
        end_range_node,
        end_offset
    };
}

function sleeper_async(ms) {
    return function (x) {
        return new Promise(resolve => setTimeout(() => resolve(x), ms));
    };
}

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

function size_and_place_note_based_on_coordinates(newGloveboxNode, note_obj) {
    console.debug("browsersolutions: " + "#size_and_place_note_based_on_coordinates.start");
    // final placement
    // check if note contains position coordinates/parameters. If so, try to use them to place the note
    var valid_stickynote_position_coordinate_regexp = new RegExp(/[0-9][0-9]*/);

    var posx = "";

    posx = note_obj.posx;

    var posy = "";

    posy = note_obj.posy;
    console.debug("browsersolutions posx:" + posx);
    console.debug("browsersolutions posy:" + posy);

    console.debug("browsersolutions " + valid_stickynote_position_coordinate_regexp.test(posx));
    console.debug("browsersolutions " + valid_stickynote_position_coordinate_regexp.test(posy));

    const rootElement = document.documentElement;
    console.debug(rootElement);
    let insertedNode = rootElement.insertBefore(newGloveboxNode, rootElement.firstChild.nextSibling);
    //let insertedNode = rootElement.appendChild(newGloveboxNode);

    console.debug(insertedNode);

    if (valid_stickynote_position_coordinate_regexp.test(posx) && valid_stickynote_position_coordinate_regexp.test(posy)) {

        console.debug("moving to posx:" + posx + " posy:" + posy);

        insertedNode.style.top = posy + 'px';
        insertedNode.style.left = posx + 'px';
        // embedd postion in the note object

        insertedNode.setAttribute("posy", posy);
        insertedNode.setAttribute("posx", posx);

        //it2.style.visibility = 'visible';
        insertedNode.style.visibility = 'visible';
        //it2.style.zIndex = "1000";
        insertedNode.style.zIndex = "1000";

        //newGloveboxNode.style.position = 'relative';

        // if note has valid size settings, use those, otherwise go with defaults


        var box_width = default_box_width;

        var valid_stickynote_width_regexp = new RegExp(/[0-9][0-9]*/);

        if (valid_stickynote_width_regexp.test(note_obj.box_width)) {
            box_width = note_obj.box_width;
        }
        var box_height = default_box_heigth;

        var valid_stickynote_height_regexp = new RegExp(/[0-9][0-9]*/);
        if (valid_stickynote_height_regexp.test(note_obj.box_width)) {
            box_height = note_obj.box_height;
        }
        console.debug("using box_width:" + box_width + " box_height:" + box_height);

        // examine options to make the width context sensitive
        //it2.style.width = box_width + 'px';
        insertedNode.style.width = box_width + 'px';
        //it2.style.height = box_height + 'px';
        insertedNode.style.height = box_height + 'px';

        insertedNode.style.position = "absolute";

        insertedNode.setAttribute("box_width", box_width);
        insertedNode.setAttribute("box_height", box_height);

    } else {
        // no valid x,y coordinate position info found in note, so use document position


        //let insertedNode = start_range_node.parentNode.insertBefore(newGloveboxNode, start_range_node.parentNode.firstChild);

        //console.debug("Y-position: " + divOffset_y(insertedNode));
        console.debug("browsersolutions Y-position: " + divOffset_y(newGloveboxNode));
        //console.debug("Y-position: " + divOffset_y(mark2));

        //var inserted = insertedNode.appendChild(it2);

        // locate the inserted node in the overall document and use this position to place the stickynote frame

        //console.debug(inserted);

        // size of yellow sticky notes is fixed
        // make this browser frame sensitive in later versions, or configurable
        var box_height = 250;
        var box_width = 250;

        // where to position the "note"


        // Y position
        //it2.style.top = y + 'px';
        //it2.style.top = Cursor_clientY + 'px';
        //it2.style.top = Cursor_clientY + window.scrollY + 'px';

        console.debug(mark2);
        console.debug("browsersolutions Y-position: " + divOffset_y(mark2));
        var ypos = divOffset_y(mark2) + 200;
        console.debug("browsersolutions Y-position: " + ypos);
        //it2.style.top = ypos + 'px';
        newGloveboxNode.style.top = ypos + 'px';

        // X -position
        var xpos = divOffset_x(insertedNode);
        console.debug("browsersolutions X-position: " + xpos);
        //it2.style.left = xpos + 'px';
        newGloveboxNode.style.left = xpos + 'px';
        // embedd postion in the note object

        newGloveboxNode.setAttribute("posy", ypos);
        newGloveboxNode.setAttribute("posx", xpos);

        //it2.style.visibility = 'visible';
        newGloveboxNode.style.visibility = 'visible';
        //it2.style.zIndex = "1000";
        newGloveboxNode.style.zIndex = "12000";

        newGloveboxNode.style.position = "absolute";
        // examin options to make the width context sensitive
        //it2.style.width = box_width + 'px';
        newGloveboxNode.style.width = box_width + 'px';
        //it2.style.height = box_height + 'px';
        newGloveboxNode.style.height = box_height + 'px';

        newGloveboxNode.setAttribute("box_width", box_width);
        newGloveboxNode.setAttribute("box_height", box_height);

    }

}

function stickynote_mouseover() {
    console.debug("browsersolutions stickynote_mouseover");

}

// get a unique reference for the URL
function getSliderTag() {
    const url = window.location.href.trim();
    var slidertag = ("slidertag_" + url).replace(/[\/:\.]/g, '');
    return slidertag;

}

// This function generates a unique key based on the current URL
function generateKey() {
    return 'urlTimestamp_' + window.location.href;
}

// This function checks the local storage and performs the required actions
function checkAndUpdateTimestamp() {
    return new Promise((resolve, reject) => {
        try {
            const key = generateKey();
            const storedData = localStorage.getItem(key);
            const currentTime = new Date().getTime();

            if (!storedData) {
                // If no timestamp is stored, set the current timestamp and return true
                localStorage.setItem(key, currentTime.toString());
                resolve(true);
            } else {
                const storedTimestamp = parseInt(storedData);

                // Check if the stored timestamp is older than 1 minute
                //if (currentTime - storedTimestamp > 60000) {
                if (currentTime - storedTimestamp > 60) {
                    // Update the timestamp and return true
                    localStorage.setItem(key, currentTime.toString());
                    resolve(true);
                } else {
                    // Return false if the stored timestamp is newer than 1 minute older
                    resolve(false);
                }
            }
        } catch (error) {
            reject(error);
        }
    });
}

/* This function checks what the current setting is for which notes should be displayed, if any (
position 1 is for not display anything
position 2 is for only displaying own notes
position 3 is for for dplsyaing all relevant (for this page) notes the user has access to.

 */
function getNoteAudience() {
    console.debug("browsersolutions " + "getNoteAudience");
    return new Promise((resolve, reject) => {
        try {
            const key = getSliderTag();
            //const storedData = localStorage.getItem(key);
            var currentPositon;
            //const currentTime = new Date().getTime();
            console.debug("browsersolutions " + "getNoteAudience for " + key);
            chrome.storage.local.get(key).then(function (data) {
                try {
                    console.log("browsersolutions " + "get local storage: " + JSON.stringify(data));
                    console.log("browsersolutions " + "get local storage: " + data[key]);
                    console.log("browsersolutions " + "get local storage: " + JSON.stringify(data[key]));
                    console.log("browsersolutions " + "get local storage: " + data[key].position);

                    currentPositon = data[key].position;

                    console.log("browsersolutions " + "get local storage: " + currentPositon);
                } catch (error) {
                    console.debug("browsersolutions " + error);
                    currentPositon = "undefined";
                }

                if (currentPositon === "undefined") {
                    console.debug("browsersolutions " + "no stored data on " + key + ", setting noteAudience to 1");
                    // If no timestamp is stored, get the current default and use that
                    chrome.runtime.sendMessage({
                        action: "getSliderDefaultPosition"

                    }).then(function (response) {
                        console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
                        const defaultSliderPosition = response.defaultSliderPosition;
                        console.debug("browsersolutions " + "no stored data on " + key + ", setting noteAudience to " + defaultSliderPosition);
                        resolve(defaultSliderPosition);
                    });
                    //                localStorage.setItem(key, "0");
                } else {
                    console.debug("browsersolutions " + "returning noteAudience: " + currentPositon);

                    resolve(currentPositon);

                }
            });
        } catch (error) {
            resolve("1");

        }
    });
}

// the session token is not completed as yet
function get_username_from_sessiontoken(token) {

    return (JSON.parse(token)).userid;

}

// the session token is not completed as yet
function get_brand_from_sessiontoken(token) {

    try {
        return (JSON.parse(token)).brand;
    } catch (error) {
        return "default";
    }

}
