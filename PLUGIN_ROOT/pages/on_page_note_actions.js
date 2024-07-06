


function attachEventlistenersToYellowStickynote(note_root) {
    console.log("attachEventlistenersToYellowStickynote.start");

    console.debug("7.7.1");
    console.debug(note_root);

    console.debug("note_type: " + note_root.getAttribute("note_type"));

    try {
// drop-down for selecting the note type 
       const noteTypeSelect = note_root.querySelector('select[name="select_notetype"]');
        console.debug(noteTypeSelect);

        noteTypeSelect.addEventListener('change', function () {
            console.debug("noteTypeSelect.change");
            console.debug("calling replaceNoteType with " + noteTypeSelect.value);
            console.debug(note_root);
            replaceNoteType(note_root, noteTypeSelect.value).then(function (response) {
                console.debug(response);
                noteTypeSpecificActions(note_root.getAttribute("note_type"), note_root, null);
            });
        });

    } catch (e) {
        console.error(e);
    }

    try {

        const mySave_new_note = (event) => {
            event.stopPropagation();
            save_new_note(event);
            event.stopPropagation();
        };
        const myupdate_note = (event) => {
            update_note(event);
            event.stopPropagation();
        };

        // for save buttons/icons
        var allGoTo3 = note_root.querySelectorAll('[js_action="save_new_note"]');
        for (var i = 0; i < allGoTo3.length; i++) {
            allGoTo3[i].removeEventListener("click", mySave_new_note);
            allGoTo3[i].removeEventListener("click", myupdate_note);
            allGoTo3[i].addEventListener("click", mySave_new_note);
        }
    } catch (e) {
        console.error(e);
    }
    try {

        const mySave_new_note = (event) => {
            event.stopPropagation();
            save_new_note(event);
            event.stopPropagation();
        };
        const myupdate_note = (event) => {
            update_note(event);
            event.stopPropagation();
        };
        var allGoTo7 = note_root.querySelectorAll('[js_action="update_note"]');
        for (var i = 0; i < allGoTo7.length; i++) {
            allGoTo7[i].removeEventListener("click", mySave_new_note);
            allGoTo7[i].removeEventListener("click", myupdate_note);
            allGoTo7[i].addEventListener("click", myupdate_note);
        }

    } catch (e) {
        console.error(e);
    }

    try {

        const myclose_note = (event) => {
            close_note(event);
            event.stopPropagation();
        };
        // for close buttons/icons
        var allGoTo = note_root.querySelectorAll('[js_action="close_note"]');
        for (var i = 0; i < allGoTo.length; i++) {
            console.log("attach close note event listener");
            allGoTo[i].removeEventListener("click", myclose_note);
            allGoTo[i].addEventListener("click", myclose_note);
        }
    } catch (e) {
        console.error(e);
    }

    try {

        const myCopy_note_to_clipboard = (event) => {
            copy_note_to_clipboard(event);
            event.stopPropagation();
        };
        var allGoTo5 = note_root.querySelectorAll('[js_action="copy_note_to_clipboard"]');
        for (var i = 0; i < allGoTo5.length; i++) {
            console.debug(allGoTo5[i]);
            allGoTo5[i].removeEventListener("click", myCopy_note_to_clipboard);
            allGoTo5[i].addEventListener("click", myCopy_note_to_clipboard);
        }

    } catch (e) {
        console.error(e);
    }

    try {

        const myminimize_note = (event) => {
            minimize_note(event);
            event.stopPropagation();
        };

        var allGoTo12 = note_root.querySelectorAll('[js_action="minimize_note"]');
        for (var i = 0; i < allGoTo12.length; i++) {
            allGoTo12[i].removeEventListener("click", myminimize_note);
            console.log("minimized_note event listener removed")
            allGoTo12[i].addEventListener("click", myminimize_note);
            console.log("minimized_note event listener attached")
        }

    } catch (e) {
        console.error(e);
    }

    try {

        const myfullscreen_note = (event) => {
            fullscreen_note(event);
            event.stopPropagation();
        };

        var allGoTo13 = note_root.querySelectorAll('[js_action="fullscreen_note"]');
        for (var i = 0; i < allGoTo13.length; i++) {
            allGoTo13[i].addEventListener("click", function (event) {
                fullscreen_note(event);
            });

            //allGoTo13[i].removeEventListener("click", myfullscreen_note);
            //allGoTo13[i].addEventListener("click", myfullscreen_note);

        }

    } catch (e) {
        console.error(e);
    }

    try {

        const myrightsize_note = (event) => {
            rightsize_note(event);
            event.stopPropagation();
        };
        var allGoTo14 = note_root.querySelectorAll('[js_action="rightsize_note"]');
        for (var i = 0; i < allGoTo14.length; i++) {
            allGoTo14[i].removeEventListener("click", myrightsize_note);
            allGoTo14[i].addEventListener("click", myrightsize_note);
        }
    } catch (e) {
        console.error(e);
    }

    try {

        const mydelete_note = (event) => {
            delete_note(event);
            event.stopPropagation();
        };
        // for delete buttons/icons
        var allGoTo2 = note_root.querySelectorAll('[js_action="delete_note"]');
        for (var i = 0; i < allGoTo2.length; i++) {
            allGoTo2[i].removeEventListener("click", mydelete_note);
            allGoTo2[i].addEventListener("click", mydelete_note);
        }
    } catch (e) {
        console.error(e);
    }

    try {

        const mydismiss_note = (event) => {
            dismiss_note(event);
            event.stopPropagation();
        };
        var allGoTo18 = note_root.querySelectorAll('[js_action="dismiss_note"]');
        for (var i = 0; i < allGoTo18.length; i++) {
            allGoTo18[i].removeEventListener("click", mydismiss_note);
            allGoTo18[i].addEventListener("click", mydismiss_note);

        }

    } catch (e) {
        console.log(e);
    }

    try {

        const mydisable_note = (event) => {
            disable_note(event);
            event.stopPropagation();
        };
        var allGoTo8 = note_root.querySelectorAll('[js_action="disable_note"]');
        for (var i = 0; i < allGoTo8.length; i++) {
            allGoTo8[i].removeEventListener("click", mydisable_note);
            allGoTo8[i].addEventListener("click", mydisable_note);

        }

    } catch (e) {
        console.log(e);
    }

   

    // goto
    try {
        /* no event handler, simply a link to the note location that is actioned by the background script

        the gothere functionality depends on the recieving user having access to the note, and access is controlled through being a subscriber to the feed the note is attached to

        When the note creator asigns a feed to the note, is is like makign the nore shared and assigning it to one specific shared feed. The note is not shared with the general public, but only with the subscribers to the feed the note is attached to.

        Gothere may in the future work in the absense of the note being asigned to a feed, but this but this has not been implemented yet.

         */
        // for button going to note location
        const noteid = note_root.getAttribute("noteid");
        const distributionlistid = note_root.getAttribute("distributionlistid");

        console.log("noteid: " + noteid);
        console.log("distributionlistid: " + distributionlistid);

        var allGoTo112 = note_root.querySelectorAll('[name="goto_notetarget_link"]');
        if (distributionlistid != null && distributionlistid != "" && distributionlistid != undefined) {
            for (var i = 0; i < allGoTo112.length; i++) {
                console.log("goto_notetarget_link");
                allGoTo112[i].setAttribute("href", "https://www.yellownotes.cloud/pages/subscribe.html?add_distributionlistid=" + distributionlistid + "&redirecturi=%2Fpages%2Fgothere.html%3Fnoteid%3D" + noteid);
            }
        } else {
            for (var i = 0; i < allGoTo112.length; i++) {
                console.log("goto_notetarget_link");
                allGoTo112[i].setAttribute("href", "https://www.yellownotes.cloud/pages/subscribe.html?gothere.html?noteid=" + noteid);
            }
        }

    } catch (e) {
        console.error(e);
    }

    try {
        const myload_url = (event) => {
            console.log("myload_url");
            console.debug("calling load_url");
            load_url(event);
            event.stopPropagation();
        };
        // load_url

        var allGoTo1_14 = note_root.querySelectorAll('[js_action="load_url"]');
        console.debug(allGoTo1_14);
        for (var i = 0; i < allGoTo1_14.length; i++) {
            allGoTo1_14[i].removeEventListener("click", myload_url);
            allGoTo1_14[i].addEventListener("click", myload_url);
        }

    } catch (e) {
        console.error(e);
    }

    try {
        const mydistributionlist_dropdown = (event) => {
            console.log("mydistributionlist_dropdown");
            //load_url(event);
            event.stopPropagation();
        };
        // for button setting up distribution dropdown list
        var distlist = note_root.querySelectorAll('[js_action="distribute"]');
        for (var i = 0; i < distlist.length; i++) {
            distlist[i].removeEventListener("click", mydistributionlist_dropdown);
            distlist[i].addEventListener("click", mydistributionlist_dropdown);

        }

    } catch (e) {
        console.error(e);
    }
    console.log("attachEventlistenersToYellowStickynote.end");
}


function getYellowStickyNoteRoot(currentElement) {
    console.debug("# getYellowStickyNoteRoot");
    //console.debug(currentElement);

    // let currentElement = element;
    // container type="yellownote"
    //console.log(currentElement);
    //console.log(currentElement.querySelector('container[type="yellownote"]'));

    // the root node of the yellownote is the first(top-most) container element with attribute type="yellownote"
    try {
        if (currentElement.hasAttribute("class")) {
            if (currentElement.getAttribute("class") === "yellownotecontainer") {

                // Condition met, return this element
                return currentElement;
            }

        }
        while (currentElement !== null && currentElement !== document) {
            //console.log(currentElement);
            //console.log(currentElement.querySelector('container[type="yellownote"]'));
            if (currentElement.hasAttribute("class")) {
                if (currentElement.getAttribute("class") === "yellownotecontainer") {

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



/*
disable the note means to keep it from being placed on the pages where it is attached.
It is still visible in the list of notes in the database, but not "on the page". Or available for distribution to other users.
User can still mange the note from the GUI - and re-enable it.
 */

function disable_note(event) {
    console.debug("disable note");
    console.debug(event);
    // stop clicking anything behind the button
    event.stopPropagation();
    try {
        var note_root = getYellowStickyNoteRoot(event.target);

        console.debug(note_root);

        var noteid = note_root.getAttribute("noteid");

        console.debug("browsersolutions noteid: " + noteid);
        // call close on the note
        remove_noteid(noteid);
        // send save request back to background
        chrome.runtime.sendMessage({
            message: {
                "action": "single_note_disable",
                "disable_details": {
                    "noteid": noteid,
                    "enabled": false
                }
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



/*
a note is minimized by changing the visibility of some parts of the note DOM tree
 */

function minimize_note(event) {
    console.debug("browsersolutions #minimize note");
    event.stopPropagation();
    const note = getYellowStickyNoteRoot(event.target);
    console.debug(note);

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
    note.querySelector('table[name="whole_note_table"]').style.height = "26px";

    
}

function maximize_note(event) {
    // not yet implemented
    console.debug("browsersolutions #maximize note");
    // set flag to indicate note does not have it's "regular" size and should not have its size properties updated
    note.setAttribute("sizeproperties", "frozen");
    const button_arrangment = note.getAttribute("button_arrangment");

    event.stopPropagation();

}

function rightsize_note(event) {
    event.stopPropagation();

    console.debug("browsersolutions #expand note to normal size");
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

    note.querySelector('table[name="whole_note_table"]').style.height = original_height;

    
}



function update_note(event) {
    console.debug("update_note (event)");
    console.debug(event);

    // save note to database
    try {
        // get the table node that is the root of the note data.

        var note_root = getYellowStickyNoteRoot(event.target);
        console.log(note_root);

        // var note_table = event.target.parentNode.parentNode.parentNode;
        // console.debug(note_table);
        var encoded_selection_text = "";
        try {
            encoded_selection_text = note_root.querySelectorAll('input[name="encoded_selection_text"]')[0].textContent.trim();
        } catch (e) {
            // set default, current timestamp
        }

        console.debug(encoded_selection_text);

        var note_type = "";
        try {
            note_type = note_root.getAttribute('note_type').trim();
        } catch (e) {
            console.error(e);
            //note_type = "yellownote";
            // set default, current timestamp
        }
        var url = "";
        try {
            url = note_root.querySelectorAll('input[name="url"]')[0].textContent.trim();
        } catch (e) {
            // set default, local url
        }
        var noteid = "";
        try {
            noteid = note_root.getAttribute('noteid').trim();
        } catch (e) {
            // set default, local url
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
        // carry createtime forwards unchanged
        var createtime = "";
        try {
            createtime = note_root.querySelectorAll('input[name="createtime"]')[0].textContent.trim();
        } catch (e) {
            // set default, current timestamp
            createtime = getCurrentTimestamp();

        }

        var content_url = "";
        // check for content_url for notes that collect content from elsewhere
        try {
            content_url = note_root.querySelector('input[name="urlInput"]').value.trim();
        } catch (e) {
            console.error(e);

        }

        var message_display_text = "";
        try {
            //console.debug(note_root.querySelectorAll('[name="message_display_text"]')[0].value.trim())
            const message_display_text_node = note_root.querySelector('[name="message_display_text"]');
            console.debug(message_display_text_node);
            console.debug(message_display_text_node.innerHTML);
            message_display_text = note_root.querySelector('[name="message_display_text"]').innerHTML;

            console.debug(note_root.querySelector('[name="message_display_text"]').value);
            console.debug(note_root.querySelector('[name="message_display_text"]').textContent);

            console.debug(note_root.querySelectorAll('[name="message_display_text"]')[0].value.trim())
            console.debug(utf8_to_b64(note_root.querySelectorAll('[name="message_display_text"]')[0].value.trim()));
        } catch (e) {
            // set default, current timestamp
            console.error(e);
        }

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

            // update the reference to the current distributionlist for this note in the root node of the note
            note_root.setAttribute("distributionlistid", distributionlistid);

            // update the goto-link
            var goto_link = note_root.querySelector('[name="goto_notetarget_link"]');
            goto_link.setAttribute("href", "https://www.yellownotes.cloud/pages/subscribe.html?add_distributionlistid=" + distributionlistid + "&redirecturi=%2Fpages%2Fgothere.html%3Fnoteid%3D" + noteid);
            console.debug("browsersolutions: goto_link update to ", goto_link.getAttribute("href"));
        } catch (e) {
            console.error(e);
        }

        // create out position parameters

        // var note_root = note_table.parentNode;
        // console.debug(note_root);

        // capture new positon and size of note

        //const posx = processBoxParameterInput(note_root.getAttribute("posx"), 0, 0, 1200);
        var posx = note_root.getAttribute("posx");
        if (posx == null || posx == undefined) {
            posx = 0 + "px";
        }

        //const posy = processBoxParameterInput(note_root.getAttribute("posy"), 0, 0, 5000);
        var posy = note_root.getAttribute("posy");
        if (posy == null || posy == undefined) {
            posy = 0 + "px";
        }

        //const box_width = processBoxParameterInput(note_root.getAttribute("box_width"), 250, 50, 500);
        var box_width = note_root.getAttribute("box_width");
        if (box_width == null || box_width == undefined) {
            box_width = default_box_width + "px";
        }

        //const box_height = processBoxParameterInput(note_root.getAttribute("box_height"), 250, 50, 500);
        var box_height = note_root.getAttribute("box_height");
        if (box_height == null || box_height == undefined) {
            box_height = default_box_height + "px";
        }

        console.debug("message_display_text: " + message_display_text);
        console.debug("url: " + url);
        console.debug("noteid: " + noteid);

        console.debug("selection_text (encoded): " + encoded_selection_text);

        var json_update = {
            message_display_text: utf8_to_b64(message_display_text),
            selection_text: encoded_selection_text,
            url: url,
            note_type: note_type,
            noteid: noteid,
            enabled: "true",
            canvas_uri: canvas_uri,
            content_url: content_url,
            distributionlistid: distributionlistid,
            posx: posx,
            posy: posy,
            box_width: box_width,
            box_height: box_height
        };

        if (note_type == "webframe") {
            // capture the scroll position of the iframe
            if (note_type == "webframe") {
                // capture the scroll position of the iframe
                var framenote_scroll_x = note_root.querySelector('[name="fakeiframe"]').scrollLeft.toString();
                if (framenote_scroll_x == null || framenote_scroll_x == undefined) {
                    framenote_scroll_x = "0";
                }
                json_update.framenote_scroll_x = framenote_scroll_x;
                var framenote_scroll_y = note_root.querySelector('[name="fakeiframe"]').scrollTop.toString();
                if (framenote_scroll_y == null || framenote_scroll_y == undefined) {
                    framenote_scroll_y = "0";
                }
                json_update.framenote_scroll_y = framenote_scroll_y;
            }

        }

        console.debug(json_update);

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
    console.debug("delete_note.start");
    console.debug(event);
    // stop clicking anything behind the button
    event.stopPropagation();

    // get the node that is the root of the sticky note.

    var note_obj = getYellowStickyNoteRoot(event.target);
    console.debug(note_obj);
    //var noteid = note_obj.querySelectorAll('[name="noteid"]')[0].textContent.trim();
    var noteid = note_obj.getAttribute("noteid");

    console.debug("browsersolutions removing noteid: " + noteid);

    // call "close" on the note
    remove_noteid(noteid);
    // send delete request back to server to delete the note.
    // rely on the browser already having an authenticated session with the server.


    chrome.runtime.sendMessage({
        message: {
            "action": "single_note_delete",
            "delete_details": {
                "noteid": noteid
            }
        }
    }, function (response) {
        console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
        console.debug("message sent to backgroup.js with response code: " + response.statuscode);

    });
}

function remove_noteid(noteid) {
    console.log("# remove_noteid (" + noteid + ")");
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
        //console.log( noteroot.getAttribute("highlightuniqueid"));
        //console.log( noteroot.ge);
        console.debug(noteroot.getAttribute("note_type"));
        try {
            const highlightuniqueid = noteroot.getAttribute("highlightuniqueid");
            console.debug("clearing hightlight with id: ", highlightuniqueid);
            removeHighlighting(highlightuniqueid);
        } catch (e) {
            console.log(e);
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

