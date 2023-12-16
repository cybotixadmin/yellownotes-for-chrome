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
const server_url = "http://localhost:3002";

const URI_plugin_user_post_yellowstickynote = "/plugin_user_post_yellowstickynote";

var default_box_width = "250";
var default_box_heigth = "250";

function delete_note(event) {
    console.debug("browsersolutions delete note");
    console.debug(event);
    // remove note from database

    // get the node that is the root of the sticky note.
    //var note_obj = event.target.parentNode.parentNode.parentNode.parentNode;

    var note_obj = getYellowStickyNoteRoot(event.target);
    console.debug(note_obj.querySelectorAll('form[name="note_form"] input[name="url"]'));

    console.debug(note_obj.querySelectorAll('form[name="note_form"] input[name="url"]')[0].textContent.trim());
    console.debug(note_obj.querySelector('input[name="url"]').textContent.trim());

    var url = note_obj.querySelectorAll('[name="url"]')[0].textContent.trim();

    var uuid = note_obj.querySelectorAll('[name="uuid"]')[0].textContent.trim();

    console.debug("browsersolutions url: " + url);
    console.debug("browsersolutions uuid: " + uuid);

    // un-highlight text
    //unmark_selection_text(note_obj);


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
            url = note_root.querySelectorAll('input[name="url"]')[0].textContent.trim();
        } catch (e) {
            // set default, local url

        }

        // new notes do not have a uuid
        var uuid = null;
        console.debug("uuid: " + uuid);
        try {
            uuid = note_root.querySelector('input[name="uuid"]').textContent.trim();
        } catch (e) {
            // set default, local url

        }
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

            console.debug("message_display_text: " + message_display_text);
            console.debug("url: " + url);
            console.debug("createtime: " + createtime);
            console.debug("lastmodifiedtime: " + lastmodifiedtime);

            console.debug("selection_text: " + selection_text);
            // Create Base64 Object
            var Base64 = {
                _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
                encode: function (e) {
                    var t = "";
                    var n,
                    r,
                    i,
                    s,
                    o,
                    u,
                    a;
                    var f = 0;
                    e = Base64._utf8_encode(e);
                    while (f < e.length) {
                        n = e.charCodeAt(f++);
                        r = e.charCodeAt(f++);
                        i = e.charCodeAt(f++);
                        s = n >> 2;
                        o = (n & 3) << 4 | r >> 4;
                        u = (r & 15) << 2 | i >> 6;
                        a = i & 63;
                        if (isNaN(r)) {
                            u = a = 64
                        } else if (isNaN(i)) {
                            a = 64
                        }
                        t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
                    }
                    return t
                },
                decode: function (e) {
                    var t = "";
                    var n,
                    r,
                    i;
                    var s,
                    o,
                    u,
                    a;
                    var f = 0;
                    e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
                    while (f < e.length) {
                        s = this._keyStr.indexOf(e.charAt(f++));
                        o = this._keyStr.indexOf(e.charAt(f++));
                        u = this._keyStr.indexOf(e.charAt(f++));
                        a = this._keyStr.indexOf(e.charAt(f++));
                        n = s << 2 | o >> 4;
                        r = (o & 15) << 4 | u >> 2;
                        i = (u & 3) << 6 | a;
                        t = t + String.fromCharCode(n);
                        if (u != 64) {
                            t = t + String.fromCharCode(r)
                        }
                        if (a != 64) {
                            t = t + String.fromCharCode(i)
                        }
                    }
                    t = Base64._utf8_decode(t);
                    return t
                },
                _utf8_encode: function (e) {
                    e = e.replace(/\r\n/g, "\n");
                    var t = "";
                    for (var n = 0; n < e.length; n++) {
                        var r = e.charCodeAt(n);
                        if (r < 128) {
                            t += String.fromCharCode(r)
                        } else if (r > 127 && r < 2048) {
                            t += String.fromCharCode(r >> 6 | 192);
                            t += String.fromCharCode(r & 63 | 128)
                        } else {
                            t += String.fromCharCode(r >> 12 | 224);
                            t += String.fromCharCode(r >> 6 & 63 | 128);
                            t += String.fromCharCode(r & 63 | 128)
                        }
                    }
                    return t
                },
                _utf8_decode: function (e) {
                    var t = "";
                    var n = 0;
                    var r = c1 = c2 = 0;
                    while (n < e.length) {
                        r = e.charCodeAt(n);
                        if (r < 128) {
                            t += String.fromCharCode(r);
                            n++
                        } else if (r > 191 && r < 224) {
                            c2 = e.charCodeAt(n + 1);
                            t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                            n += 2
                        } else {
                            c2 = e.charCodeAt(n + 1);
                            c3 = e.charCodeAt(n + 2);
                            t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                            n += 3
                        }
                    }
                    return t
                }
            }

            // Encode the String
            //    var encodedString = Base64.encode(selection_text);
            let base64data = textToBase64(selection_text);
            console.log(textToBase64(selection_text)); 

            const json_create = {
                message_display_text: message_display_text,
                selection_text: textToBase64(selection_text),
                url: url,
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
                    img_del0.setAttribute("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFwAAAAiCAYAAADSx77pAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAJ5ElEQVRoge2ae3BU1R3HP/ex2Tz2ld1kN+8X5EEIJAYIISSQ+AbFIm0RHzPtVEentJY6tlCLr3HUilat4igzdIpFZyqjoyAYOwgI8rKigEBNIAECGMg7u3mS7N57+seGTQjkAY3gMPnO3Jm795773d/5nt/9/X73nCPRg8LFs4uBR4FcIIZRjAROA3uBl3e8WLoVQAIoXDL7z46xrufMsTaCQo1X0b5rD90dXbRWu2msrF26Y1np81Lh4tnF9rGuzx1jnVfbtmsajZV1NFXWlqjAo+YoK0IXV9umaxrmKCtNlbWPqkCuGqwidP1q23RNQw1WAXJVIEZoo959hRCjAqPefQWhAugjFL+FEFSvqQUg9i4XkiSNCO+1BL+HayPj4bpXp6uu23/epSEb5BHhvZbQE1JGyMP78AhdjAhvQdwkZiZOJcESS1hQCB3es1S5T7Glajdfnd7/f/NfaVyS4LpP0LzbQ9vhDvSu3meMLgMxP3NeVPDTH9TRVesNXJeNEqb0UMKnWZHVwUPOw3m/pCB+0nnXLEYTE13jmOgaR+m3m3inct2wbP+x4JJCStMuD60HOwCQ1PPvCU3HX+2Int8CIesXtNW7BC0H2hFC4JhuHfC/CuInXSB2f8zOvpHte3dxPKx2WPb/GDDspCl0QXtFJ0jgvN1OUIQhcE9S/By66OXRhQAdnHPsCK2Xp7vBS92GJtorOrFNNSPJF/fyybHZgfN/fLiat9e+S5OnkfioOJY+tITC3AIAZk24nmc3v44tMeLSen6VMOyyUPcJhFcgyWBwKEhK//ABQuecgyN0Hd3nP5eUXlENDgVJBuEV6D59wLBiMoQGzlesWYkhLowxRRNRgw2sPLiGgpx8ZFkmPTmNpoparPF2AMZFpjI382aSwuMxG02c9XVxylPNxoov2HniawCWzFzI5NiJAPxu/ZOcaa0L/Jc9xMZbc59HlmS+OrWfl7avAMBsDGP+hDnkxeVgNppwn23hm+oDvH/wE1q6WofU7xx6QsowPLxPG6EJRI9OQgjqP/UgNIGj2BJoo7VpNG5tQVIkImdZAyXiQDz9cbzpFBOjxwGw4qnl/Pv77RxqOEK31k27fJY7V95P+cd7/Z0IMSA0QVZUOk/csAhFVgI8BkUl05lGpjONs/XtfN36HVsqdgYET2uN4XhzFUZLCACFiXnIkr+6WrVqFVXfl5N90xSev2UJTlPvWxQZZufWtGJyneN5rPQFPFrbkBrCJXj4+QlRR+g9AgqB8Ol4GzUaNro5F1UaNrrxtegYHIqf/5zgA/D0xyffbeL6lALMISZyM3PIzczBq3k52lDFgTPl7KzagzpfPY/r3pw7UWSF/1Z+x2+efYSG5gYKcvJZ8dRyZFmmKHEqn328lT1iP56OFqyhFuYUz+a9V9fhyooDoChpCgBNnma27dlO7LQUHshbgNMUQXtnB4+88Ed2f/sVORkTWb70FZy2SBak3Mbyff/EEBo0pI7yORGGc/QVP3BNgL3EjGpT8LXooAM6+Fp0VJuCvcQMgiF5+h8NbU08veGvnDhzMtDeoBjIcKUyP2cOr819ht8XPECwYgw8s2TDc+TcV8C8RXfT7G0h6eZM6hI6qWtpAMDliKS5qgFN09h27EsAEmMSiFP8FVaM2UWSPR6ADVtLQZWIToglL+E6AD7esoHt+3YRlZdI61jBhm83AlAyZQaesvph6edPmsOoUoQmzoVnhKaj9/mKlIIgvCSM5s/b8Ln9XKpNJrwkDCnofP7BePrjqOckD72zmFTimJkznfzsPOJcsYH7RalTkTp1lu1cgWLwh5Gk4gyswWYyXGNJjUxhQnQGTqs/FCiygrezG13T2XxkB3dk3QzArfk38q+KDczImRvg/nDTOizxdlIcCYEQc/dt87n7tvkX2KkqKtHGCNrPegN2DIRh1+H9PZN+YyQbJWwzw3B/0Q6AbUYYslG6gHsonv4w2kI4IRp4c/dqXvxoOTZMXD9pBgsXPIjFZKFw4jReee8NtCSZaIuThUW/ICsmIyBSX+ii19uqGk5RUXOM1KgUZhXdworNqykakwdA+fEjlB07TFJxBqGGkCG1AbCarDS6awh1mAZtN2KCg190+02miz5zKTzJjgRe+/kzABysLmPp+mWYXFZMLn/dvq3lG8Yd2sFP8mcDEB0ayVFPLU8veJQoixOf5mP9tlL+c2AP+8r28+YTr5Ecl4QQOpLUa8OWyl2kRqXgcji5JbOYKIt/EebDz9ZhNAdjNIfQ2X02YNdba1byt9VvDKhR7JSUIbW87KTJAMluJHiqGk4GktqE2HHcl3oHm2p2UdvSQGhQCHnZ07gptyTQvtnjZkxqfECwt9e+y0urXsUcE06oIwy73d7PBn9/tx7eya/y78KgGnjkvt8C+AdraymWODtC1zlWV4Wu68iyzJSsSdjHOolIjx6kf4NredllIZc5ETgcHg2NTw5s4p78eQDMv2Ee85l3Ub7va6vZW7af6SnFgWuTx19HyoQ07GOc3Dt1HtZQf7lqUA3+BN5jQ2tHG18e/Yai9Hxs5p63Z892mlqaSM7NRGiCxtZm9p04yKTkbCaPz2VBwTx2uPfiMkfy2KyHiQ2Ppq61gQdX/wGfrvU37wIM38MRSAoIL3ibfKi2y5sJ9Ln9lYxkAMHAb8qaPWtJtsQxLTNvQC5/mbYYxahS01VPeXUFGbGp5GRk8+lf3g+0c7e6sZltRIRH9FRMvf39rGwbRen5gd9rN68nLMKMYpAD7d7c+jbLwh8nwuZg0V2/ZlEfG7q6u/jTssepKDtEYmEqkjy4LlLh4tnCFDXwnEZfdBzy0nW8ZxQHT8YDo+dxY7JCaJZh0KZC18mzTGDWlBtJT07DYjLT0dnB6foadu37klUfrabe00h0biLB1lAswWbuHX8H07KmYjGZKTtWzsoPVuGw2nnm4ScBuP+phVRbmwMfYhISq+9/nQiLA3erh4J7SojIiiHMaTnPFpMUyk8zbmVG7nQiwiNobmlmf/kBVqz5O2XHy3FlJwyZMNtqPH7BwyLNw9JKaILOwxreah3hHbr9xSAZwBArE5KunPfJPxhaz7hpq/HQ3d6F7tOQFRnFaCDEHoY13o5q7B04rdtH09E6Opva0H06QaZgrAkOtG4fjUdqAHBlxxNq75PcheDUrkq0bh+yKpMwPe2iczy+Lh/uqno6GtvQun0oBhWjJQRbkgOjeehqpr2+1S/4UCMzipFBR2PbyC5AjGJojOgS2yiGxoguIo9iaKjAaaHro5s3rwxOq8Be3afHjG5p+GEh/PPWe1XgZd2n3S4ro1safkj0zJi+rJzcWVGVUJDqRXCDOLd6IEaPkToC8+FCLN3xYuk7gTgyuiH/B8EFG/L/B7GI/tuSUd5JAAAAAElFTkSuQmCC");
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

function minimize_note(event) {
    console.debug("browsersolutions #minimize note");
    event.stopPropagation();
    const note = getYellowStickyNoteRoot(event.target);

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

function save_changes_to_note(event) {
    console.debug("browsersolutions #save changes to note");
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

        console.debug("message_display_text: " + message_display_text);
        console.debug("url: " + url);
        console.debug("uuid: " + uuid);
        console.debug("createtime: " + createtime);
        console.debug("lastmodifiedtime: " + lastmodifiedtime);

        console.debug("selection_text: " + selection_text);
        // Create Base64 Object
        var Base64 = {
            _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            encode: function (e) {
                var t = "";
                var n,
                r,
                i,
                s,
                o,
                u,
                a;
                var f = 0;
                e = Base64._utf8_encode(e);
                while (f < e.length) {
                    n = e.charCodeAt(f++);
                    r = e.charCodeAt(f++);
                    i = e.charCodeAt(f++);
                    s = n >> 2;
                    o = (n & 3) << 4 | r >> 4;
                    u = (r & 15) << 2 | i >> 6;
                    a = i & 63;
                    if (isNaN(r)) {
                        u = a = 64
                    } else if (isNaN(i)) {
                        a = 64
                    }
                    t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
                }
                return t
            },
            decode: function (e) {
                var t = "";
                var n,
                r,
                i;
                var s,
                o,
                u,
                a;
                var f = 0;
                e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
                while (f < e.length) {
                    s = this._keyStr.indexOf(e.charAt(f++));
                    o = this._keyStr.indexOf(e.charAt(f++));
                    u = this._keyStr.indexOf(e.charAt(f++));
                    a = this._keyStr.indexOf(e.charAt(f++));
                    n = s << 2 | o >> 4;
                    r = (o & 15) << 4 | u >> 2;
                    i = (u & 3) << 6 | a;
                    t = t + String.fromCharCode(n);
                    if (u != 64) {
                        t = t + String.fromCharCode(r)
                    }
                    if (a != 64) {
                        t = t + String.fromCharCode(i)
                    }
                }
                t = Base64._utf8_decode(t);
                return t
            },
            _utf8_encode: function (e) {
                e = e.replace(/\r\n/g, "\n");
                var t = "";
                for (var n = 0; n < e.length; n++) {
                    var r = e.charCodeAt(n);
                    if (r < 128) {
                        t += String.fromCharCode(r)
                    } else if (r > 127 && r < 2048) {
                        t += String.fromCharCode(r >> 6 | 192);
                        t += String.fromCharCode(r & 63 | 128)
                    } else {
                        t += String.fromCharCode(r >> 12 | 224);
                        t += String.fromCharCode(r >> 6 & 63 | 128);
                        t += String.fromCharCode(r & 63 | 128)
                    }
                }
                return t
            },
            _utf8_decode: function (e) {
                var t = "";
                var n = 0;
                var r = c1 = c2 = 0;
                while (n < e.length) {
                    r = e.charCodeAt(n);
                    if (r < 128) {
                        t += String.fromCharCode(r);
                        n++
                    } else if (r > 191 && r < 224) {
                        c2 = e.charCodeAt(n + 1);
                        t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                        n += 2
                    } else {
                        c2 = e.charCodeAt(n + 1);
                        c3 = e.charCodeAt(n + 2);
                        t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                        n += 3
                    }
                }
                return t
            }
        }

        // Encode the String
        var encodedString = Base64.encode(selection_text);
        console.log(encodedString); // Outputs: "SGVsbG8gV29ybGQh"

        const json_update = {
            message_display_text: message_display_text,
            selection_text: Base64.encode(selection_text),
            url: url,
            uuid: uuid,
            enabled: "true",
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

function close_note(event) {
    console.debug("# close yellow note");
    // call to kill the yellow note window

    // loop upwards from the target nodes to locate the root node for the sticky note

    const stickynote_rootnode = getYellowStickyNoteRoot(event.target );
   
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


        fetch(chrome.runtime.getURL('stickynotetemplate.html'))
        .then((response) => response.text())
        .then((html) => {
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

            //node_root.setAttribute("draggable", 'true');
            //  node_root.setAttribute("style", 'width: 100px; height: 100px; background-color: yellow; position: absolute; z-index: 103;');
            var note_template = safeParseInnerHTML(html, 'div');
            // note_template = JSON.parse(html);
            console.log(note_template);

            //cont1.appendChild(create_note_table(note_object_data,note_template));
            node_root.appendChild(note_template);
            try {
                // Locate the form element
                var noteForm = node_root.querySelector('form[name="note_form"]');

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

            console.debug("# create_new_stickynote_2 promise resolved");
            resolve(node_root);

        })
        .catch((error) => {
            console.warn('Something went wrong.', error);
        });
    });
}

function DISABLEcreate_new_stickynote_node(note_object_data, note_template) {
    console.log("browsersolutions create_new_stickynote_node.start");
    console.debug(JSON.stringify(note_object_data));

    var cont1 = document.createElement('container');

    //<!--<link rel="stylesheet" type="text/css" href="message-box.css">-->


    var fullURLToCSS = chrome.runtime.getURL("css/yellownote.css");

    var link1 = document.createElement('link');
    link1.setAttribute("rel", 'stylesheet');
    link1.setAttribute("type", 'text/css');
    link1.setAttribute("href", fullURLToCSS);
    cont1.appendChild(link1);

    cont1.setAttribute("class", "yellowstickynotecontainer");
    // use this attribute to mark this as a stickynote object
    cont1.setAttribute("type", 'yellowstickynote');
    // // <container class="yellow_note" type="yellowstickynote" posy="2" posx="0" box_width="250" box_heigth="250" >
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
    console.log("noteSelectedHTML Promise start");
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
                        const ins = start_range_node.parentNode.insertBefore(newGloveboxNode, start_range_node);

                        console.debug(ins);
                        console.debug(newGloveboxNode);

                        var temp = document.createElement('div');
                        temp.setAttribute("style", 'z-index: 120;');
                        var textnode = document.createTextNode("token"); // Create a text node
                        temp.appendChild(textnode);

                        console.debug(root_node);
                        const draggable = root_node.appendChild(temp);
                        console.debug(draggable);
                        console.debug(temp);
                        // Make the stickynote draggable:
                        //dragStickyNote(ins);
                        //const draggable = document.getElementById('draggable');

                        let offsetX,
                        offsetY,
                        isDragging = false;

                        //dragElement(temp);
                        //newGloveboxNode.setAttribute("id", 'draggable2');
                        console.log(newGloveboxNode);
                        newGloveboxNode.addEventListener('mousedown', (event) => {
                            // Mark the element as being dragged
                            //isDragging = true;
                            console.log("############ mousedown");
                            const node = getYellowStickyNoteRoot(event.target);
                            console.debug(node);
                            console.debug("isDragging: " + isDragging);
                            //console.log(getYellowStickyNoteRoot(event.target));
                            // Mark the element as being dragged
                            node.setAttribute("isDragging", 'true');
                            isDragging = true;
                            console.debug(node);
                            // Calculate the mouse's position relative to the element
                            offsetX = event.clientX - node.getBoundingClientRect().left;
                            console.debug("offsetX: " + offsetX);
                            offsetY = event.clientY - node.getBoundingClientRect().top;
                            console.debug("offsetY: " + offsetY);

                        });

                        newGloveboxNode.addEventListener('touchdown', (event) => {
                            // Mark the element as being dragged
                            //isDragging = true;
                            console.log("############ touchstart");
                            const node = getYellowStickyNoteRoot(event.target);
                            console.debug(node);
                            console.debug("isDragging: " + isDragging);
                            //console.log(getYellowStickyNoteRoot(event.target));
                            // Mark the element as being dragged
                            node.setAttribute("isDragging", 'true');
                            isDragging = true;
                            console.debug(node);
                            // Calculate the mouse's position relative to the element
                            offsetX = event.clientX - node.getBoundingClientRect().left;
                            console.debug("offsetX: " + offsetX);
                            offsetY = event.clientY - node.getBoundingClientRect().top;
                            console.debug("offsetY: " + offsetY);

                        });

                        newGloveboxNode.addEventListener('mousemove', (event) => {
                            console.log("mousemove");
                            // Only drag if the element is being dragged
                            //console.log(node);
                            // console.log(node.getAttribute("isDragging"));
                            //console.debug("isDragging: " +isDragging);
                            //if ( node.getAttribute("isDragging") != "true") return;
                            //console.debug(node);
                            // console.debug(isDragging == "true");
                            // console.debug(isDragging.toUpperCase() == "TRUE");
                            //     console.debug(isDragging);
                            //console.log(getYellowStickyNoteRoot(event.target).getAttribute("isDragging") );
                            //console.log(getYellowStickyNoteRoot(event.target).getAttribute("isDragging") == "true" );
                            if (isDragging) {
                                //       if (getYellowStickyNoteRoot(event.target).getAttribute("isDragging") == "true"  ){

                                const x = event.clientX - offsetX;
                                const y = event.clientY - offsetY;
                                const node = getYellowStickyNoteRoot(event.target);

                                // Move the element to the new coordinates
                                node.style.left = x + 'px';
                                node.style.top = y + 'px';
                            }
                        });

                        newGloveboxNode.addEventListener('mouseup', (event) => {
                            console.log("############ mouseup ########");
                            // Mark the element as not being dragged
                            const node = getYellowStickyNoteRoot(event.target);
                            //console.log(getYellowStickyNoteRoot(event.target));
                            // Mark the element as being dragged
                            node.setAttribute("isDragging", 'false');
                            isDragging = false;

                        });

                        console.log("noteSelectedHTML Promise resolve");
                        resolve();
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

    console.debug("request1: " + request.NoteSelectedHTML);
    console.debug("request2: " + request.NavigateToSpecificStickynote);

    noteSelectedHTML(request, sender, sendResponse).then(function (one) {
        console.log("£££££££££££££££££££");
        console.log(one);

    });

    locateStickyNote(request, sender, sendResponse);

    sendResponse({
        success: true,
        data: value
    });

    return true;
}

chrome.runtime.onMessage.addListener(listener);
