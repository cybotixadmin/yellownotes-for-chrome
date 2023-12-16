/**
 * handle click events no notes
 * 
 * 
 */





function delete_note(event) {
    console.debug("browsersolutions delete note");
    console.debug(event);
    // remove note from database

    // get the node that is the root of the sticky note.
    var note_obj = getYellowStickyNoteRoot(event.target);
    console.debug(note_obj.querySelectorAll('form[name="note_form"] input[name="url"]'));

    console.debug(note_obj.querySelectorAll('form[name="note_form"] input[name="url"]')[0].textContent.trim());
    console.debug(note_obj.querySelector('input[name="url"]').textContent.trim());

    var url = note_obj.querySelectorAll('[name="url"]')[0].textContent.trim();
    var uuid = note_obj.querySelectorAll('[name="uuid"]')[0].textContent.trim();

    console.debug("browsersolutions url: " + url);
    console.debug("browsersolutions uuid: " + uuid);

    // un-highlight text
    unmark_selection_text(note_obj);


    // send delete request back to server to delete the note.
    // rely on the browser already having an authenticated session with the server.

    chrome.runtime.sendMessage({
        stickynote: {
            "request": "single_delete",
            "delete_details": {
                "url": url,
                "uuid": uuid
            }
        }
    }, function (response) {
        console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
        // finally, call "close" on the note
        try {
            close_note(event);
        } catch (g) {
            console.debug(g)
        }
    });
    try {
        close_note(event);
    } catch (g) {
        console.debug(g)
    }
}

function disable_note(event) {
    console.debug("disable note");
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

        // send save request back to background
        chrome.runtime.sendMessage({
            stickynote: {
                "request": "single_disable",
                "disable_details": {
                    "message_display_text": message_display_text,
                    "selection_text": selection_text,
                    "url": url,
                    "uuid": uuid,
                    "enabled": false,
                    "createtime": createtime,
                    "lastmodifiedtime": lastmodifiedtime
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

function DELminimize_note(event) {
    console.debug("browsersolutions #minimize note");
    event.stopPropagation();
    const node = getYellowStickyNoteRoot(event.target);

    // step through all DOM nodes in the node and set to not visible, the ones that should not be displayed when the note is minimized.
    // only nodes with minimized="display" should be displayed when the note is minimized.
    // Select all elements in the DOM
    const allElements = node.querySelectorAll('*');

    // Iterate over the selected elements
    allElements.forEach(function (element) {
        console.debug(element);
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


function minimize_note(event) {
    console.debug("browsersolutions #minimize note");
    event.stopPropagation();
    const note = getYellowStickyNoteRoot(event.target);

  

    setComponentVisibility(note, ",rw,.*minimized");

    // shrink the size of the note

    note.querySelector('table[name="whole_note_table"]').style.height = "30px";

    // replace the minimize icon, with the maximize one


    //console.debug(event);
}



function fullscreen_note(event) {
    console.debug("browsersolutions #fullscreen note");
    event.stopPropagation();
    
    const note = getYellowStickyNoteRoot(event.target);
    setComponentVisibility(note, ",rw,.*fullscreen");


}

function rightsize_note(event) {
    event.stopPropagation();

    console.debug("browsersolutions #expand note to normal size");
    const note = getYellowStickyNoteRoot(event.target);
    console.debug(note);
    setComponentVisibility(note, ",rw,.*normalsized");


   // const allElements = note.querySelectorAll('[ minimized="notvisible" ]');
    // Iterate over the selected elements
   // allElements.forEach(function (element) {
        // If the element does not have the attribute with the given value, set display to 'none'
        // if (element.getAttribute('minimized') === "notvisible") {
   //     console.debug(element);
   //     element.style.display = 'inherit';
   //     console.debug("element has minimized attribute set to visible" + element);

        //}else{
        // }
   // });

    // shrink the size of the note

    note.querySelector('table[name="whole_note_table"]').style.height = "250px";

   
}


function save_new_note(event) {
    console.debug("browsersolutions ### save new note");
    console.debug(event);

    // save note to database
    try {
        // get the table node that is the root of the note data.

        var note_root = getYellowStickyNoteRoot(event.target);
        console.log(note_root);

        console.debug(extract_node_data(note_root));

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

        // only proceed if there is no uuid set - this note should not be created in this function
        if (uuid == null || uuid == "") {

            // carry createtime forwards unchanged


            // new notes do not have a uuid


            const json_create = {
                message_display_text: message_display_text,
                selection_text: textToBase64(selection_text),
                url: url,
                brand: brand,
                note_type: note_type,
                content_url: content_url,
                distributionlistid: distributionlistid,
                enabled: "true",
                createtime: createtime,
                lastmodifiedtime: lastmodifiedtime,
                posx: posx,
                posy: posy,
                box_width: box_width,
                box_height: box_height
            };
            console.debug(JSON.stringify(json_create));

            // Send save request back to background
            // Stickynotes are always enabled when created.
            chrome.runtime.sendMessage({
                stickynote: {
                    "request": "single_create",
                    "create_details": json_create
                }
            }, function (response) {
                console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));

                // read the uuid returned from the service
                var uuid = response.uuid;
                console.debug("uuid: " + uuid);

                // update the note DOM object with the uuid
                note_root.querySelector('input[type="hidden"][name="uuid"]').replaceChildren(document.createTextNode(uuid));
                note_root.setAttribute("uuid", uuid);

                // update the save button


                //var swapThese = note_root.querySelectorAll('[js_action="save_new_note"]');
                //           console.log("swap save button"   );
                //           console.log(swapThese);
                //for (var i = 0; i < swapThese.length; i++) {
                //    swapThese[i].setAttribute("js_action", "save_changes_to_note");

                //}

                // delete existing buttons
                // get location of buttons
                const button_root = note_root.querySelector("tr.button_ribbon");

                try {
                    while (button_root.firstChild) {
                        button_root.removeChild(button_root.firstChild);
                    }

                } catch (f) {
                    console.error(f);
                }

                // create new ones


                // check for  delete / disable buttons and add them if missing
                try {

                    var button_temnplate = document.createElement('td');

                    button_temnplate.setAttribute("class", "button_cell");
                    button_temnplate.setAttribute("style", "padding: 0px; text-align: left; z-index: 104;");

                    // save button
                    var save_button = button_temnplate.cloneNode(true);
                    save_button.setAttribute("class", "button");
                    save_button.setAttribute("js_action", "save_changes_to_note");
                    save_button.setAttribute("value", "save changes");
                    save_button.setAttribute("style", "margin: 0px; z-index: 106;");

                    var img_del0 = document.createElement('img');
                    img_del0.setAttribute("js_action", "save_changes_to_note");
                    img_del0.setAttribute("src", "data:image/png;base64,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");
                    img_del0.setAttribute("alt", "save changes");
                    img_del0.setAttribute("style", "margin: 0px;height: 20px; z-index: 106;");

                    save_button.replaceChildren(img_del0);
                    button_root.appendChild(save_button);

                    // delete button
                    var delete_button = button_temnplate.cloneNode(true);
                    delete_button.setAttribute("js_action", "delete_note");
                    delete_button.setAttribute("value", "delete1");
                    delete_button.setAttribute("style", "margin: 0px; z-index: 106;");
                    var img_del = document.createElement('img');
                    img_del.setAttribute("js_action", "delete_note");
                    img_del.setAttribute("src", "data:image/png;base64,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");
                    img_del.setAttribute("alt", "delete");
                    img_del.setAttribute("style", "margin: 0px;height: 20px; z-index: 106;");

                    delete_button.replaceChildren(img_del);
                    button_root.appendChild(delete_button);

                    console.log(button_root);
                    // disable button
                    var disable_button = button_temnplate.cloneNode(true);

                    disable_button.setAttribute("js_action", "disable_note");
                    disable_button.setAttribute("value", "disable1");
                    disable_button.setAttribute("style", "margin: 0px; z-index: 106;");

                    var img_del2 = document.createElement('img');
                    img_del2.setAttribute("js_action", "disable_note");
                    img_del2.setAttribute("src", "data:image/png;base64,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");
                    img_del2.setAttribute("alt", "disable");
                    img_del2.setAttribute("style", "margin: 0px;height: 20px; z-index: 106;");

                    disable_button.replaceChildren(img_del2);

                    button_root.appendChild(disable_button);
                    console.log(button_root);
                    // locate "go to" button
                    var locate_button = button_temnplate.cloneNode(true);

                    locate_button.setAttribute("js_action", "locate_note");
                    locate_button.setAttribute("value", "locate");
                    locate_button.setAttribute("style", "margin: 0px; z-index: 106;");

                    var img_del3 = document.createElement('img');
                    img_del3.setAttribute("js_action", "locate_note");
                    img_del3.setAttribute("src", "data:image/png;base64,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");
                    img_del3.setAttribute("alt", "locate");
                    img_del3.setAttribute("style", "margin: 0px;height: 20px; z-index: 106;");

                    locate_button.replaceChildren(img_del3);

                    button_root.appendChild(locate_button);

                    console.log(button_root);

                } catch (f) {
                    console.error(f);
                }

                attachEventlistenersToYellowStickynote(note_root);

            });
        } else {
            console.log("browsersolutions uuid already set - not creating new note");
        }
    } catch (e) {
        console.error(e);
    }
}


function close_note(event) {
    console.debug("# close yellow note");
    // call to kill the yellow note window

    // loop upwards from the target nodes to locate the root node for the sticky note

    const stickynote_rootnode = getYellowStickyNoteRoot(event.target);

    try {

        console.debug(stickynote_rootnode);
        try {
            unmark_selection_text(stickynote_rootnode);
        } catch (f) {
            console.error(f);
        }

        console.debug("closing...");
        console.debug(stickynote_rootnode);
        stickynote_rootnode.remove();

    } catch (e) {
        console.error(e);
    }

}

function unmark_selection_text(sticky_note_node) {
    console.debug("# unmark_selection_text");
    var uuid = sticky_note_node.getAttribute("uuid");
    console.debug("unmark the span: " + uuid);
    // unmark the selection text
    // use the uuid of the note, to locate the span node that is the parent of the selection text
    try {
        var marked = document.querySelector("span[to_note='" + uuid + "']");
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
