

// main a contstant for how heigh the bar should be for the controls only accessible to the note owner (or administrator)
/*
the owner of the note have extra controls in a bar on the bottom (buttons, drop-downs etc.)

This is height is added to the heigh the note will ordinarily have and is substracted fro mthe height of the note when the note is saved to the database.

 */

const note_owners_control_bar_height = 23;

const default_box_width = "350px";
const default_box_height = "250px";

const frame_note_top_bar_height = 50;

const note_internal_height_padding = 25;

const note_internal_width_padding = 2;

function test() {
    console.debug("test");
}

function create_yellownote_DOM(html_note_template, html_notetype_template, note_type, isOwner, isNewNote) {
    if (DOM_debug)
        console.debug("create_yellownote_DOM.start");
    try {
        return new Promise(function (resolve, reject) {
            // the root of the note object
            if (DOM_debug)
                console.debug(html_note_template);
            if (DOM_debug)
                console.debug(html_notetype_template);
            if (DOM_debug)
                console.debug("note_type: ", note_type);
            if (DOM_debug)
                console.debug("isOwner: ", isOwner);
            if (DOM_debug)
                console.debug("isNewNote: ", isNewNote);
            var note_root = document.createElement('container');
            //console.debug(node_root.outerHTML);

            //const modifiedDoc2 = mergeDOMTrees(doc1, "querySelector", doc2, '#destination');
            if (DOM_debug)
                console.debug("calling mergeHTMLTrees");

            // mergeHTMLTrees(html_notetype_template, "querySelector", html_note_template, '#destination').then(function (response) {

            const modifiedDoc2 = mergeHTMLTrees(html_notetype_template, "querySelector", html_note_template, '#destination');

            if (DOM_debug)
                console.debug(modifiedDoc2.outerHTML);

            // Example usage:
            //const doc1 = new DOMParser().parseFromString(html_notetype_template, 'text/html');
            //const doc2 = new DOMParser().parseFromString(html_note_template, 'text/html');
            //console.debug(doc1.documentElement.outerHTML);
            //console.debug(doc2.documentElement.outerHTML);


            // var fullURLToCSS = chrome.runtime.getURL("css/yellownote.css");

            // insert the overall note template

            //var note_template = safeParseInnerHTML(html_note_template, 'div');
            // note_template = JSON.parse(html);
            //console.debug(note_template);

            note_root.setAttribute("class", "yellownotecontainer");
            note_root.setAttribute("note_type", note_type);
            note_root.setAttribute("button_arrangment", 'new');

            note_root.setAttribute("isOwner", isOwner);
            note_root.setAttribute("isNewNote", isNewNote);

            note_root.appendChild(modifiedDoc2);

            if (DOM_debug)
                console.debug(note_root);
            // update the body of the note which is different for each note type

            //console.debug(node_root.querySelector('[name]'));
            //var notetype_template = safeParseInnerHTML(html_notetype_template, 'div');
            //console.debug(notetype_template);
            //const nodeToReplace = node_root.querySelector('[name="whole_note_middlebar"]');
            //console.debug(nodeToReplace);
            //const middle_bar = notetype_template.querySelector('tr[name="whole_note_middlebar"]');
            //console.debug(middle_bar);
            //nodeToReplace.parentNode.insertBefore(middle_bar, nodeToReplace.nextSibling);

            //nodeToReplace.remove();
            console.debug("create_yellownote_DOM.end");
            if (DOM_debug)
                console.debug(note_root.outerHTML);
            resolve(note_root);
            // });
        });
    } catch (e) {
        console.error(e);
    }
}

function mergeHTMLTrees(doc1, selector1, doc2, selector2) {
    if (DOM_debug)
        console.debug("#mergeHTMLTrees.start");
    // return new Promise(function (resolve, reject) {
    //console.debug("0.0.0");
    try {
        //console.debug("doc1");
        // Select the element from the first document using the provided selector
        //var notetype_template = safeParseInnerHTML(doc1, 'div');
        var notetype_template = document.createElement("div");
        // Populate it with the raw HTML content

        notetype_template.innerHTML = doc1;

        //console.debug(notetype_template.outerHTML);
        // var note_template = safeParseInnerHTML(doc2, 'div');

        var note_template = document.createElement("div");
        // Populate it with the raw HTML content

        note_template.innerHTML = doc2;
        if (DOM_debug)
            console.debug(note_template.outerHTML);

        const elementFromDoc1 = notetype_template.querySelector('[name="whole_note_middlebar"]');
        //console.debug(elementFromDoc1.outerHTML);
        // Select the target element in the second document using the provided selector
        const targetElementInDoc2 = note_template.querySelector('[name="whole_note_middlebar"]');
        //console.debug(targetElementInDoc2.outerHTML);
        // If either of the selected elements is not found, throw an error
        if (!elementFromDoc1) {
            throw new Error('Element not found in the first document using the selector: ' + selector1);
        }
        if (!targetElementInDoc2) {
            throw new Error('Target element not found in the second document using the selector: ' + selector2);
        }

        // Clone the element from the first document to preserve the original
        const elementToInsert = elementFromDoc1.cloneNode(true);
        //console.debug(elementToInsert.outerHTML);

        // Replace the target element in the second document with the cloned element
        const one = targetElementInDoc2.replaceWith(elementToInsert);
        //console.debug(note_template.outerHTML);
        // Return the modified second document
        if (DOM_debug)
            console.debug("0.0.3");
        return (note_template);
    } catch (e) {
        if (DOM_debug)
            console.debug("0.0.1");
        console.error(e);
        return (null);
    }
    //});

}

function getTypeTemplate(note_type) {
    if (function_call_debuging)
        console.debug("getTypeTemplate.start");
    if (function_call_debuging)
        console.debug("note_type: " + note_type);

    const brand = "default";
    var typetemplate;
    return new Promise(function (resolve, reject) {

        const msg = {
            action: "get_notetype_template",
            brand: brand,
            note_type: note_type

        }
        console.debug("msg: ", JSON.stringify(msg));

        chrome.runtime.sendMessage(msg).then(function (response) {
            // found the file locally
          if (DOM_debug) console.debug(response);
            // typetemplate = response.text();
            resolve(response);
        }).catch(function (err) {
            console.debug(err);
            reject(err);
        });
    });
}

/**
 * process the middle part of the note. This is the part where there are diference between the different types of yellownotes
 */
function createNoteMiddleBody(note_object_data, note_root, creatorDetails, isOwner, isNewNote) {
    if (function_call_debuging)
        console.debug("createNoteMiddleBody.start");
    if (function_call_debuging)
        console.debug("note_object_data:");
    if (function_call_debuging)
        console.debug(note_object_data);
    if (function_call_debuging)
        console.debug("note_root:");
    if (function_call_debuging)
        console.debug(note_root);
    if (DOM_debug)
        console.debug(note_root.outerHTML);
    if (function_call_debuging)
        console.debug("creatorDetails:");
    if (function_call_debuging)
        console.debug(creatorDetails);
    if (function_call_debuging)
        console.debug("isOwner: ", isOwner);
    if (function_call_debuging)
        console.debug("isNewNote: ", isNewNote);

    const note_type = note_object_data.note_type;
    console.debug("note_type: " + note_type);

    if (function_call_debuging)
        console.debug("calling setCSSAttributeOnNamedElement");
    setCSSAttributeOnNamedElement(note_root, "whole_note_middlebar", "top", parseInt(frame_note_top_bar_height, 10) + 'px');

    // show the middle part (the content) of the note
    console.debug(note_root.querySelector('[name="whole_note_middlebar"]').outerHTML);

    const iframe = note_root.querySelector('[name="note_content_frame"]');
    console.debug(iframe);
console.debug("calling queryIframeContent");
       queryIframeContent(iframe, '[name="message_display_text"]').then(function (response) {
        console.log(response);
        const message_display_text = response[0].textContent.trim();
        console.log("message_display_text: ", message_display_text);
       });


    return new Promise(function (resolve, reject) {

        // get the template for the middle bar of the note
        getTypeTemplate(note_type).then(function (html_notetype_template) {
            if (DOM_debug)
                console.debug(html_notetype_template);
            // update the body of the note which is different for each note type
            if (function_call_debuging)
                console.debug("calling: updateNoteMiddleBarNoteType");

            updateNoteMiddleBarNoteType(html_notetype_template, note_root);

        }).then(function (response) {

                console.debug(response);

            // part of the middlebar that pertains to all note types
            try {

                // capture local url and save it as a hidden parameter in the html form
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

            // depending on the note_type, do different things here
            if (DOM_debug)
                console.debug(note_root.outerHTML);

            if (note_type == "http_get_url" || note_type == "webframe" || note_object_data.type == "webframe") {
                // part pertain only to notes of type http_get_url (looking up URLs)
                // Locate the form element
                console.debug("webframe note type");

                console.debug("#### perform url lookup ####");

                // check for content_url for notes that collect content from elsewhere
                try {
                    if (note_object_data.content_url != undefined) {
                        note_root.querySelector('input[name="urlInput"]').value = note_object_data.content_url;
                    }

                    // start the process of looking up the content
                    var content_iframe = note_root.querySelector('[name="contentframe"]');
                    //console.debug("content_iframe: " );
                    //console.debug(content_iframe);
                    // send message to background serviceworker and it will lookup the URL. This is to bypass any CORS issues
                    // Send save request back to background
                    // Stickynotes are always enabled when created.
                    console.debug("remote url: " + note_object_data.content_url);
                    chrome.runtime.sendMessage({
                        message: {
                            "action": "simple_url_lookup",
                            "url": note_object_data.content_url
                        }
                    }).then(function (response) {
                        //console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
                        // render content of ifram based on this
                        //console.debug(getYellowStickyNoteRoot(event.target));
                        setContentIntoIframe(content_iframe, response);

                        //set scroll position
                        var framenote_scroll_y = "0";
                        if (note_object_data.framenote_scroll_x !== undefined) {
                            framenote_scroll_x = note_object_data.framenote_scroll_x;
                            note_root.setAttribute("framenote_scroll_x", framenote_scroll_x);
                        }
                        var framenote_scroll_y = "0";
                        if (note_object_data.framenote_scroll_y !== undefined) {
                            framenote_scroll_y = note_object_data.framenote_scroll_y;
                            note_root.setAttribute("framenote_scroll_y", framenote_scroll_y);
                        }
                        console.debug("framescrollPosition: ", framenote_scroll_x, framenote_scroll_y);
                        try {
                            content_iframe.contentWindow.scrollTo(scrollPosition.x, framenote_scroll_y);
                        } catch (e) {
                            console.error(e);
                        }
                        resolve(note_root);
                    });

                } catch (e) {
                    console.error(e);
                }
            } else if (note_type == "canvas") {
                // part pertain only to notes of type canvas
                console.debug("part pertain only to notes of type canvas");

                // read the canvase data uri frm the note object
                const canvas_uri = note_object_data.canvas_uri;

                console.debug(canvas_uri);

                // Create a new image
                const img = new Image();
                // Set the source of the image to the data URI

                img.onload = function () {
                    console.debug("image load");
                    const canvas = note_root.querySelector('canvas[name="canvas"]');
                    console.debug(canvas);
                    const ctx = canvas.getContext('2d');
                    // Set canvas size to match the image size
                    //    canvas.width = 200px;
                    //  canvas.height = img.height;

                    // Draw the image onto the canvas
                    ctx.drawImage(img, 0, 0);
                    //draw a box over the top
                    // ctx.fillStyle = "rgba(200, 0, 0, 0.5)";
                    // ctx.fillRect(0, 0, 500, 500);
                    console.debug("image loaded");
                    console.debug(ctx);
                    console.debug(canvas);
                    console.debug(img);
                };
                img.src = canvas_uri;
                console.debug("image src set");
                console.debug("calling prepareCanvasNoteForDrawing");
                prepareCanvasNoteForDrawing(note_root);
                resolve(note_root);

            } else if (note_type == "plainhtml") {
                console.debug("plainhtml note type");
                console.debug("note_object_data: " + JSON.stringify(note_object_data));
                // insert the note metatdata and other permanent content

                if (note_object_data.hasOwnProperty("message_display_text")) {

                    // Set initial placeholder text that should vanish when typing begins
                    const iframe = note_root.querySelector('[name="note_content_frame"]');
                    console.debug(iframe);
                    console.debug(iframe.contentWindow);
                    const iframeDoc = iframe.contentWindow.document;
                    try {

                        const htmlContent = '<html><body><div name="message_display_text"  style=" position: absolute; left: 0px; top: 0px; color: rgba(0, 0, 0, 0.7); background: rgba(255, 255, 0, 0.7); border: 0px solid #ffff00; border-radius: 0px; overflow-x: hidden; overflow-y: auto; line-height: 0.9; padding: 2px; margin: 0px; position: relative; bottom: 0; z-index: 10104; white-space: pre-wrap; word-wrap: break-word; "  contenteditable="true" aria-multiline="true" aria-placeholder="Type here...">' + b64_to_utf8(note_object_data.message_display_text) + '</div></body></html>';

                        iframeDoc.open();
                        iframeDoc.write(htmlContent);

                        iframeDoc.close();

                    } catch (e) {
                        console.error(e);
                    }
                    console.debug(note_root.querySelector('[name="whole_note_middlebar"]'));

                }
            } else {
                // "regular" yellow note type, use this as the default but type="yellownote should be set regardless"
                console.debug("yellownote / plaintext note type");
                // insert the note metatdata and other permanent content

                    try {

                        
                            // existing note - add content to the textarea inside the iframe
                            var message_display_text="";
                            console.debug("carry out the note procedure for existing note");

                            if (isNewNote) {
                                // placeholder message text
                                  // if the note is new, there should be aplace holder message that vanishes when the user starts typing
                      
                                message_display_text = "write your notes here..";
                            }else{
                                if (note_object_data.hasOwnProperty("message_display_text")) {
                                    message_display_text = b64_to_utf8(note_object_data.message_display_text);
                                }

                            }

                            const iframe = note_root.querySelector('[name="note_content_frame"]');

                            iframe.onload = function () {
                                const iframeWindow = iframe.contentWindow;
                                if (iframeWindow) {
                                    console.log('iframe contentWindow is available');
                                    const htmlContent = '<!DOCTYPE html><html><body><div name="message_display_text"  style=" position: absolute; left: 0px; top: 0px; color: rgba(0, 0, 0, 0.7); background: rgba(255, 255, 0, 0.7); border: 0px solid #ffff00; border-radius: 0px; overflow-x: hidden; overflow-y: auto; line-height: 0.9; padding: 2px; margin: 0px; position: relative; bottom: 0; z-index: 10104; white-space: pre-wrap; word-wrap: break-word; "  contenteditable="true" aria-multiline="true" aria-placeholder="Type here...">' + message_display_text + '</div></body></html>';
                                    const iframeDoc = iframeWindow.document;
                                    iframeDoc.open();
                                    //  iframeDoc.write(htmlContent);
    
                                    try {
                                        console.debug(iframeDoc.querySelector('[name="message_display_text"]').innerHTML);
                                    } catch (L) {
                                        console.error(L);
                                    }
                                    iframeDoc.close();

                                } else {
                                    console.log('iframe contentWindow is null');
                                }
                            };

                         
                        

                    } catch (e) {
                        console.error(e);
                    }
               // }


                if (note_object_data.hasOwnProperty("selection_text")) {
                    try {
                        note_root.querySelector('input[type="hidden"][name="selection_text"]').replaceChildren(document.createTextNode(b64_to_utf8(note_object_data.selection_text)));
                    } catch (e) {
                        console.error(e);
                        note_root.querySelector('input[type="hidden"][name="selection_text"]').replaceChildren(document.createTextNode(""));
                    }
                    note_root.querySelector('input[type="hidden"][name="encoded_selection_text"]').replaceChildren(document.createTextNode(note_object_data.selection_text));
                }
                if (note_object_data.hasOwnProperty("selection_text")) {
                    try {
                        note_root.querySelector('input[type="hidden"][name="encoded_selection_text"]').replaceChildren(document.createTextNode(note_object_data.selection_text));
                    } catch (e) {
                        console.error(e);
                        note_root.querySelector('input[type="hidden"][name="selection_text"]').replaceChildren(document.createTextNode(""));

                    }
                    note_root.querySelector('input[type="hidden"][name="encoded_selection_text"]').replaceChildren(document.createTextNode(note_object_data.selection_text));
                }

                // insert the displayed text(html) content that consitute the message itself
                //  try {
                //   if (note_object_data.hasOwnProperty("message_display_text")) {
                //       console.debug(cont1.querySelector('[name="message_display_text"]'));
                //      const message_html = b64_to_utf8(note_object_data.message_display_text);
                //       console.debug(message_html);

                //cont1.querySelector('[name="message_display_text"]').replaceChildren(document.createTextNode(b64_to_utf8(note_object_data.message_display_text)));
                //         console.debug(cont1.querySelector('[name="message_display_text"]').innerHTML);
                //         cont1.querySelector('[name="message_display_text"]').innerHTML = message_html;
                //         console.debug(cont1.querySelector('[name="message_display_text"]').innerHTML);

                //      } else {
                //          console.debug("no message_display_text attribute defined");
                //      }
                //  } catch (e) {
                //      console.error(e);
                //  }

                console.debug(JSON.stringify(creatorDetails));
                console.debug(note_root.querySelector('td[name="topbar_filler"]'));
                console.debug(creatorDetails != undefined);
                if (creatorDetails != undefined) {
                    try {
                        if (creatorDetails.displayname != undefined) {
                            //cont1.querySelector('[name="creator"]').replaceChildren(document.createTextNode(creatorDetails.displayname));
                        }
                    } catch (e) {
                        console.error(e);
                    }
                    console.debug(creatorDetails.banner_image != undefined);

                }

                console.debug(note_root)
                if (DOM_debug) console.debug(note_root.innerHTML)
                console.debug("createNoteMiddleBody.end");
                resolve(note_root);
            }
        });
    });
}

function createDropdown(optionsArray, selectedDistributionListId) {
    if (function_call_debuging)
        console.debug("createDropdown.start");
    if (function_call_debuging)
        console.debug(optionsArray);
    if (function_call_debuging)
        console.debug(selectedDistributionListId);
    // Create a select element
    const selectElement = document.createElement('select');

    // Add a blank option as the first option
    const blankOption = document.createElement('option');
    blankOption.textContent = 'do not share'; // Set the display text
    blankOption.value = '';
    selectElement.appendChild(blankOption);

    // Loop through the array and create an option for each object
    optionsArray.forEach(item => {
        const option = document.createElement('option');
        option.textContent = item.name; // Set the display text
        option.value = item.distributionlistid; // Set the option value
        selectElement.appendChild(option);
    });

    // Set the selected option based on distributionListId argument
    selectElement.value = selectedDistributionListId && optionsArray.some(item => item.distributionlistid === selectedDistributionListId)
         ? selectedDistributionListId
         : '';

    // Add an event listener for the 'change' event
    selectElement.addEventListener('change', (event) => {
        const selectedId = event.target.value;
        console.debug(event.target.parentNode);
        console.debug(event.target.parentNode.parentNode);
        console.debug(event.target.parentNode.parentNode.getAttribute("noteid"));
        noteid = event.target.parentNode.parentNode.getAttribute("noteid");

        // Only trigger fetch call if the selected value is not empty
        if (selectedId) {
            //console.debug("update the note with this distrubtionlistid: " + selectedId);
            console.debug("calling setNoteDistributionlistId");
            setNoteDistributionlistId(noteid, selectedId);

        } else {
            //console.debug("no distributionlist selected");
            // remove distributionlist from note

            setNoteDistributionlistId(noteid, "");
        }
        // update the "gothere" url
        var textToCopy;
        const link_obj = event.target.parentNode.parentNode.querySelector('[name="go_to_note"]');
        try {
            console.debug(link_obj);

            distributionlistid = document.querySelector('tr[noteid="' + noteid + '"]').querySelector('[name="distributionlistid"]').value.trim();
            console.debug(distributionlistid);
            if (distributionlistid == "") {
                //        throw "no distributionlistid";
                textToCopy = "https://www.yellownotes.cloud/pages/gothere.html?noteid=" + noteid;
                link_obj.href = textToCopy;
            } else {

                const redirectUri = encodeURIComponent("/pages/gothere.html?noteid=" + noteid);
                textToCopy = "https://www.yellownotes.cloud/subscribe.html?add_feedid=" + distributionlistid + "&redirecturi=" + redirectUri;

                link_obj.href = textToCopy;
            }
        } catch (e) {
            console.debug(e);
            textToCopy = "https://www.yellownotes.cloud/pages/gothere.html?noteid=" + noteid;
            link_obj.href = textToCopy;
        }

    });
    return selectElement;
}

function setNoteColor(creatorDetails, cont1) {
    if (function_call_debuging)
        console.debug("setNoteColor.start");
    var note_color = "#ffff00"; // set default value, override with more specific values if available


    // attempt to read size parameters from the note properties of the creator
    if (creatorDetails != undefined) {
        if (creatorDetails.hasOwnProperty("note_color") && creatorDetails.note_color) {
            note_color = creatorDetails.note_color;
            console.debug("creator's note_properties has note_color, use it " + note_color);
        }

    } else {
        // brand-level not implemted yet
    }
    var box_background = "rgb(" + hexToRGB(note_color) + ", 0.7)";
    console.debug("box_background" + box_background);

    setBackground(creatorDetails, cont1);
}

/*
create the header bar of the yellownotes

The header bar contains the following elements:

1. an icon representing the creator of the note. It appears on the far left of the header bar
2. the name of the creator of the note. It appears in tiny letters below the creator icon
3. an icon or text representing the feed/distribution list the note belongs to. It appears to the right of the creator icon (and to the left of the tools buttons)

1. This icon is customizable by the user,

It is customizable at different levels (creator/brand)

In the profile YellowNote template the user can select the images to be displayed in the creator field. For all notes created by the user, this image is displayed. If no image is set, a default person icon is shown instead.
If no image is set, a default person icon is shown instead. The icon is clickable and will take the user to the profile page of the creator.

2. The display name of the creator is customizable in the profile page.

3. This field may beither text or image. The image is customizable by the user. The user can select the image to be displayed in the feed field.
The image is clickable and will take the user to the feed page of which the note is part.
If no image is selected the feed name is displayed instead.



From this page the user may unsubscribe from the feed.


the note header contains source info about the note
This information is customizable at different levels (note/feed/creator/brand)
//


// If this note is from a subscription, insert the  name of the feed/distributionlist
The name is a clickable link to the subscription page - the subscription is highlighted in the list of subscriptions

If this note belongs to the current user, insert the name of the user
The name is a clickable link to the my_notes page - the note is highlighted in the list of notes

If the the note header contains brading onformation - typically through an img tag with the brand logo (the image itself is included in the note as base64 encoded data)
The feed name and creator name is inserted below the logo in the for om a css tooltip. The tooltip is activated by hovering over the logo

// insert the display of the note creator and or distribution list the note came from (if any)

// The plan is to also have the option to also customize, at different levels (note/feed/creator/brand), the whole note template but this is not yet implemented

// priority

1. is there a display image for the note, use it (not implemented)
2. is there a display image for the feed, use it (not implemented)
3. is there a display image for the brand, use it (not implemented)
4. is there a display image for the creator, use it

5. is there a displayname for the note, use it
6. is there a displayname for the feed, use it
7. is there a displayname for the creator, use it

// in addition to what is display, there is also a clickable link

Depending on circumstance it goes to one of two places

If the note belongs to the users, the link goes to the note in the my_notes page

If the note is one the user is subscribing to, the link goes to the feed in the my_subscriptions page


 */

function createNoteHeader(note_object_data, note_root, creatorDetails, isOwner, isNewNote) {
    if (function_call_debuging)
        console.debug("createNoteHeader.start");
    if (function_call_debuging)
        console.debug("note_object_data:");
    if (function_call_debuging)
        console.debug(note_object_data);
    if (function_call_debuging)
        console.debug("note_root:");
    if (function_call_debuging)
        console.debug(note_root);
    if (DOM_debug)
        console.debug(note_root.outerHTML);
    if (function_call_debuging)
        console.debug("creatorDetails:");
    if (function_call_debuging)
        console.debug(creatorDetails);
    if (function_call_debuging)
        console.debug("isOwner", isOwner);
    if (function_call_debuging)
        console.debug("isNewNote", isNewNote);

    var headerhtml = "";

    var feed_link_target = "";

    var creator_link_target = "";
    var display_text = "";

    //    if (isOwner) {
    //        creator_link_target = "https://www.yellownotes.cloud/pages/my_notes.html?noteid=" + note_object_data.creatorid;
    //    } else {
    //        creator_link_target = 'https://www.yellownotes.cloud/pages/my_subscriptions.html?distributionlistid=' + note_object_data.distributionlistid;
    //    }
    creator_link_target = 'https://www.yellownotes.cloud/pages/publicprofile.html?creatorid=' + creatorDetails.uuid + "&distributionlistid=" + note_object_data.distributionlistid + "&noteid=" + note_object_data.noteid;

    console.debug("creator_link_target: " + creator_link_target);

    console.debug(note_object_data.distributionlistid);
    console.debug(note_object_data.distributionlistname);

    try {
        console.debug(note_root.querySelector('[name="creator_link_target"]'));
        note_root.querySelector('[name="creator_link_target"]').setAttribute("href", creator_link_target);
    } catch (e) {
        console.error(e);
    }
    if (isOwner) {
        // the owner will see a more tools-rich version of the distributionlist page
        feed_link_target = 'https://www.yellownotes.cloud/pages/view_own_distributionlist.html?distributionlistid=' + note_object_data.distributionlistid;
    } else {
        feed_link_target = 'https://www.yellownotes.cloud/pages/view_distributionlist.html?distributionlistid=' + note_object_data.distributionlistid;
    }
    console.debug("feed_link_target: " + feed_link_target);

    // check if there is a brand (with a possible logo) associated with the note
    if (isOwner) {
        if (note_object_data.distributionlistname != undefined && note_object_data.distributionlistname != null) {
            display_text = 'source: ' + note_object_data.distributionlistid;
        } else if (note_object_data.displayname != undefined) {
            display_text = 'source: ' + note_object_data.displayname;
        }
    } else {
        if (note_object_data.distributionlistname != undefined) {
            display_text = 'source: ' + note_object_data.distributionlistid;
        }
        if (note_object_data.displayname != undefined) {
            display_text = 'source: ' + note_object_data.displayname;
        }
    }
    console.debug("display_text: " + display_text);

    console.debug(headerhtml);

    // is there a banner image for the creator of the note ?
    var creator_banner_image = "";

    if (creatorDetails != undefined) {
        try {
            if (creatorDetails.displayname != undefined) {}
        } catch (e) {
            console.error(e);
        }
        console.debug(creatorDetails.banner_image != undefined);
        if (creatorDetails.banner_image != undefined) {
            // Create a new img element
            creator_banner_image = creatorDetails.banner_image;
        }
    } else {
        console.debug("no creator details, consequently no banner image")
        // no creator details, therefore no banner image
        // There is no option for setting image at the level of the feed or the individial note at this time
    }

    try {
        // populate creator displayname on the note , if present.
        if (creatorDetails.note_display_name != undefined) {
            const topbarcreatordisplayname = note_root.querySelector('[name="creator_note_display_name"]');
            console.debug(topbarcreatordisplayname);
            topbarcreatordisplayname.replaceChildren(document.createTextNode(creatorDetails.note_display_name));

            topbarcreatordisplayname.setAttribute("href", creator_link_target);

        }
    } catch (e) {
        console.error(e);
    }
    // if there is abannerimage defined for this user, put it in the creator icon field
    if (creator_banner_image != "") {

        note_root.querySelector('[name="creator_icon"]').setAttribute("src", creator_banner_image);

    } else {
        // leave default icon in place
    }

    // set the link to the feed/distributionlist page - if any feed is attached

    try {
        if (note_object_data.distributionlistid != undefined && note_object_data.distributionlistname != undefined && note_object_data.distributionlistname != null) {
            const topbar_feed_link_target = note_root.querySelector('[name="feed_link_target"]');
            console.debug(topbar_feed_link_target);
            topbar_feed_link_target.replaceChildren(document.createTextNode("" + note_object_data.distributionlistname));
            topbar_feed_link_target.setAttribute("href", feed_link_target);
            topbar_feed_link_target.setAttribute("tb", "feed_link_target");
        } else {
            console.debug("no distributionlistid or distributionlistname");
        }
    } catch (e) {
        console.error(e);
    }
    console.debug("createNoteHeader.end");
    return;
    const topbarfield = note_root.querySelector('td[name="topbar_filler"]');
    console.debug(topbarfield);
    if (creator_banner_image != "") {
        //console.debug(topbarfield);
        //topbarfield.innerHTML = headerhtml;
        var imgElement = document.createElement('img');

        // Set attributes
        imgElement.setAttribute('height', '20');
        //imgElement.setAttribute('width', '170');
        imgElement.setAttribute('src', creator_banner_image);

        // Apply inline styles
        imgElement.style.margin = '0px';
        imgElement.style.height = '20px';
        imgElement.style.width = 'unset';

        // Append the img element to the desired location in the document
        // For example, appending to the body
        console.debug(imgElement);

        var aElement = document.createElement('a');
        aElement.setAttribute('href', creator_link_target);
        aElement.setAttribute('target', "_blank");
        aElement.setAttribute('rel', "noopener noreferrer");

        aElement.appendChild(imgElement);
        // return the top bar field
        topbarfield.appendChild(aElement);
    } else {
        // no image, use text
        headerhtml = '<div style="word-wrap: break-word; line-height: 1; letter-spacing: -0.5px;">feed: <a href="' + creator_link_target + '" target="_blank" rel="noopener noreferrer"><b>' + display_text + '</b></a></div>\n<br/>\n';

        // return the top bar field
        topbarfield.innerHTML = headerhtml;

    }
    topbarfield.st

}

function setCSSAttributeOnNamedElement(search_root, elementName, cssAttribute, value) {
    try{
    if (function_call_debuging)
        console.debug("setCSSAttributeOnNamedElement.start:" + elementName + " " + cssAttribute + " " + value);
    // Check if the elementName is an ID or a class
    let element;
    if (search_root.querySelector('[name="' + elementName + '"]')) {
        // It's an ID
        element = search_root.querySelector('[name="' + elementName + '"]');
    } else {
        console.error("Element not found");
        return;
    }
    //console.debug(element);
    //console.debug(cssAttribute);
    //console.debug(value);

    // Set the CSS attribute
    element.style[cssAttribute] = value;
} catch (e) {
    console.error(e);
}
}





/*  */
function create_universal_yellownote_existing(note_data, note_type, html_note_template, html_notetype_template, creatorDetails, session, is_selection_text_connected, isOwner, isNewNote) {

    if (function_call_debuging)
        console.debug("create_universal_yellownote_existing.start");
   
    if (function_call_debuging)
        console.debug("note_data:");
   
    if (function_call_debuging)
        console.debug(note_data);
   

    if (function_call_debuging)
        console.debug("note_type: " + note_type);
   
    if (function_call_debuging)
        console.debug("html_note_template: " + html_note_template);
   
    if (function_call_debuging)
        console.debug("html_notetype_template: " + html_notetype_template);

    if (function_call_debuging)
        console.debug("creatorDetails: " + creatorDetails);


    if (function_call_debuging)
        console.debug("is_selection_text_connected: " + is_selection_text_connected);

    if (function_call_debuging)
        console.debug("isOwner: " + isOwner);

    if (function_call_debuging)
        console.debug("isNewNote: " + isNewNote);
    // override
    //note_type= "yellownote";


    console.debug("note_properties: ");
    console.debug(creatorDetails);

//  return a promise from this function
    return new Promise(function (resolve, reject) {

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
    if (function_call_debuging)
        console.debug("calling: create_yellownote_DOM");
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
        if (function_call_debuging)
            console.debug("calling: updateNoteMiddleBarNoteType");
        updateNoteMiddleBarNoteType(html_notetype_template, note_root);

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
            console.debug(note_data.selectionText);
            console.debug(note_data.selectionText == undefined);

            try {
                if (!note_data.selectionText == undefined) {
                    if (note_data.selectionText != "" && note_data.selectionText != null) {
                        selection_text = note_data.selectionText;
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
            if (function_call_debuging)
                console.debug("calling highlightTextOccurrences");

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

        if (function_call_debuging)
            console.debug("calling createNoteHeader");
        createNoteHeader(note_object_data, note_root, creatorDetails, isOwner, isNewNote);

        if (function_call_debuging)
            console.debug("calling createNoteFooter");
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
            if (DOM_debug)
                console.debug(note_root.outerHTML);

            var doc = window.document;
            var doc_root = doc.documentElement;
            //console.debug(doc_root);

            // insert the note into the document
            const insertedNode = doc_root.insertBefore(note_root, doc_root.firstChild);

            if (DOM_debug)
                console.debug(insertedNode.outerHTML);
            // attach event listeners to buttons and icons

            noteTypeSpecificActions(note_type, insertedNode, note_data, isOwner, isNewNote);
            //insertedNode.setAttribute("isOwner: ", isOwner);
            //insertedNode.setAttribute("isNewNote: ", isNewNote);


            if (function_call_debuging)
                console.debug("calling size_note");
            size_note(insertedNode, note_object_data, isOwner, isNewNote);

           
            
            // set the flag that contral which button are shown
            insertedNode.setAttribute("button_arrangment", 'new');

            // call the function that will set which part of the note will be displayed
            if (function_call_debuging)
                console.debug("calling setComponentVisibility");
            setComponentVisibility(insertedNode, ",new,.*normalsized,");

            if (function_call_debuging)
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
            if (function_call_debuging)
                console.debug("calling: makeDragAndResize");
            makeDragAndResize(insertedNode, isOwner, isNewNote, true);

            console.debug(insertedNode);
            // attach eventlisteners to the note

            // call the function that will make the note resizeable
            // console.debug("browsersolutions: makeResizeable");

            if (function_call_debuging)
                console.debug("browsersolutions: calling dropdownlist_add_option");
            dropdownlist_add_option(insertedNode, "", "", "");

            // attach eventlisteners to the note ( common to all types of notes)
            if (function_call_debuging)
                console.debug("calling attachEventlistenersToYellowStickynote");
            attachEventlistenersToYellowStickynote(insertedNode, isOwner, isNewNote);

            if (function_call_debuging) console.debug("calling update_note_internal_size");
            update_note_internal_size(insertedNode);
            // place focus on the new yellownote
            try {
                if (insertedNode.querySelector('[focus="true"]')) {
                    insertedNode.querySelector('[focus="true"]').focus();
                }
            } catch (e) {
                console.error(e);
            }
            resolve(insertedNode);
        });
        resolve(insertedNode);
    });
});
}




/*  */
function place_note_on_page(note_data, note_type, note_root, creatorDetails, session, is_selection_text_connected, isOwner, isNewNote) {

    if (function_call_debuging)
        console.debug("place_note_on_page.start");
   
    if (function_call_debuging)
        console.debug("note_data:");
   
    if (function_call_debuging)
        console.debug(note_data);
   
    if (function_call_debuging)
        console.debug(note_root);
   


    if (function_call_debuging)
        console.debug("note_type: " + note_type);
   
 
    if (function_call_debuging)
        console.debug("creatorDetails: " + creatorDetails);


    if (function_call_debuging)
        console.debug("is_selection_text_connected: " + is_selection_text_connected);

    if (function_call_debuging)
        console.debug("isOwner: " + isOwner);

    if (function_call_debuging)
        console.debug("isNewNote: " + isNewNote);
    // override
    //note_type= "yellownote";


    console.debug("note_properties: ");
    console.debug(creatorDetails);


 
  

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
        // Should the selection text be connected to the note in the document ?
        // Typically "true" for web pages, and "false" for the feed
        if (is_selection_text_connected) {
            console.debug(note_data.selectionText);
            console.debug(note_data.selectionText == undefined);

            try {
                if (!note_data.selectionText == undefined) {
                    if (note_data.selectionText != "" && note_data.selectionText != null) {
                        selection_text = note_data.selectionText;
                    }
                }
            } catch (e) {
                console.error(e);
            }

         
        }
    
        const note_table = note_root.querySelector('[name="whole_note_table"]');

        console.debug("note_object_data: " + JSON.stringify(note_object_data));

     

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
            if (function_call_debuging)
                console.debug("calling highlightTextOccurrences");

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

                 console.debug("highlightuniqueid: ", highlightuniqueid);
            if (highlightuniqueid && highlightuniqueid !== "0") {
                // selection text was matched in the document
                // place note next to where the text is highlighted


                if (function_call_debuging)
                    console.debug("calling place_note_based_on_texthighlight");
                place_note_based_on_texthighlight(note_root, note_object_data, isOwner, isNewNote);

                note_root.setAttribute("highlightuniqueid", highlightuniqueid);
                console.debug(note_root);
          
                
            } else {
                // selection text was not matched in the document, or there is no selection text
                console.debug("selection text was not matched in the document, or there is no selection text");

                // move to the default location on the screen if all else fails
                //inserted.setAttribute("posx", 50);
                //inserted.setAttribute("posy", 50);
                //insertedNode.querySelector('[name="whole_note_table"]').style.left = insertedNode.getAttribute("posx");
                //insertedNode.querySelector('[name="whole_note_table"]').style.top = insertedNode.getAttribute("posy");
                if (function_call_debuging)
                    console.debug("calling place_note_based_on_coordinates");
                place_note_based_on_coordinates(note_root, note_object_data, creatorDetails, isOwner, isNewNote);

            }
            // set the flag that contral which button are shown
            note_root.setAttribute("button_arrangment", 'new');


   

            console.debug(note_root);
            // attach eventlisteners to the note

            // call the function that will make the note resizeable
            // console.debug("browsersolutions: makeResizeable");

            if (function_call_debuging)
                console.debug("browsersolutions: calling dropdownlist_add_option");
            dropdownlist_add_option(note_root, "", "", "");

 
            if (function_call_debuging) console.debug("calling update_note_internal_size");
            update_note_internal_size(note_root);
            // place focus on the new yellownote
            try {
                if (note_root.querySelector('[focus="true"]')) {
                    note_root.querySelector('[focus="true"]').focus();
                }
            } catch (e) {
                console.error(e);
            }
       
        return note_root;
    
}


/**
 *

 * create bottom bar of the note. This bar is only visible/accessible to those with editing priviliges on the note (typically the owner/creator)
The height of the bottom bar is not included in the note height when the note is saved to the database.
The idea being that the note is generally seen by those without editing priviliges and the sizing should conform to the general case.
A user may have a grea many note visible and the screen "realestate" should not be used up by the bottom bar unless it is needed.

NOTE: later feature is that the bottom bar is available on demand by clicking a small icon in the lower corner of the note. This is not yet implemented

 * @param {*} cont1
 * @param {*} creatorDetails
 * @param {*} isOwner
 * @param {*} newNote
 * @returns
 */
function createNoteFooter(note_object_data, cont1, creatorDetails, isOwner, newNote) {
    if (function_call_debuging)
        console.debug("createNoteFooter.start");
    if (function_call_debuging)
        console.debug("note_object_data:");
    if (function_call_debuging)
        console.debug(note_object_data);
    if (function_call_debuging)
        console.debug("cont1:");
    if (function_call_debuging)
        console.debug(cont1);
    if (DOM_debug)
        console.debug(cont1.outerHTML);
    if (function_call_debuging)
        console.debug("creatorDetails:");
    if (function_call_debuging)
        console.debug(creatorDetails);
    if (function_call_debuging)
        console.debug("isOwner: ", isOwner);
    if (function_call_debuging)
        console.debug("newNote: ", newNote);
    // only do this for the note owner (and later administrator and some other roles)
    if (isOwner) {
        console.debug(note_object_data);
        console.debug(cont1);

        // set the width of the distributionlist dropdown list
        // dynamically size this list to fit the width of the yellownote
        var distributionlist_dropdownlist_width = 98;

        console.debug(note_object_data.box_height);
        console.debug(parseInt(note_object_data.box_height, 10));

        console.debug(creatorDetails.box_height);
        console.debug(parseInt(creatorDetails.box_height, 10));

        console.debug(note_object_data.box_width);
        console.debug(parseInt(note_object_data.box_width, 10));

        console.debug(creatorDetails.box_width);
        console.debug(parseInt(creatorDetails.box_width, 10));

        var box_width = parseInt(note_object_data.box_width, 10);
        if (box_width > 0) {
            console.debug("use note-specific box_width: " + box_width);
        } else {
            box_width = parseInt(creatorDetails.box_width, 10);
            if (box_width > 0) {
                console.debug("use creator-specific box_width: " + box_width);
            } else {
                console.debug("use default box_width: " + default_box_width);
                box_width = default_box_width;
            }
        }

        if (box_width > 0) {
            if (box_width < 600) {
                distributionlist_dropdownlist_width = box_width - 160;
            } else {
                distributionlist_dropdownlist_width = 440;
            }
        }

        //console.debug("setting "+distributionlist_dropdownlist_width);
        if (function_call_debuging)
            console.debug("calling setCSSAttributeOnNamedElement");
        setCSSAttributeOnNamedElement(cont1, 'distributionlistdropdowncontainer', 'width', distributionlist_dropdownlist_width + "px");
        if (function_call_debuging)
            console.debug("calling setCSSAttributeOnNamedElement");
        setCSSAttributeOnNamedElement(cont1, 'distributionlistdropdown', 'width', distributionlist_dropdownlist_width + "px");
        if (function_call_debuging)
            console.debug("calling setCSSAttributeOnNamedElement");
        setCSSAttributeOnNamedElement(cont1, 'distributionlistdropdowncontainer', 'max-width', distributionlist_dropdownlist_width + "px");
        if (function_call_debuging)
            console.debug("calling setCSSAttributeOnNamedElement");
        setCSSAttributeOnNamedElement(cont1, 'distributionlistdropdown', 'max-width', distributionlist_dropdownlist_width + "px");

        // place the bottom bar directly below the body of the note.making it apear as a continuation of the note
        // the size set for the not is for the combined area of the top bar and the middle bar.
        // The bottom bar is not included in this size as this bar will only be seen by those with editing priveliges
        var bottombar_position;
        // prefer the note-specific value, but if none is found user the one from the creator profile, or as a last resort , the default


        var box_height = parseInt(note_object_data.box_height, 10);
        if (box_height > 0) {
            console.debug("use note-specific box_height: " + box_height);

        } else {
            box_height = parseInt(creatorDetails.box_height, 10);
            console.debug("use creator-specific box_height: " + box_height);
            if (box_height > 0) {}
            else {
                box_height = default_box_height;
                console.debug("use default box_height: " + default_box_height);

            }
        }

        bottombar_position = parseInt(box_height, 10) - 0;

        // expand the note downwards by the height of the bottom bar - the bottom bar does not count towards the maximum note size (height)

        if (function_call_debuging)
            console.debug("calling setCSSAttributeOnNamedElement");
        console.debug(box_height);
        console.debug(parseInt(box_height, 10));
        console.debug(note_owners_control_bar_height);
        console.debug(parseInt(note_owners_control_bar_height, 10));

        setCSSAttributeOnNamedElement(cont1, 'whole_note_table', 'height', (parseInt(box_height, 10) + parseInt(note_owners_control_bar_height, 10)) + "px");

        // set the height of the middle bar to the height of the note minus the height of the top bar
        if (function_call_debuging)
            console.debug("calling setCSSAttributeOnNamedElement");
        setCSSAttributeOnNamedElement(cont1, 'whole_note_middlebar', 'height', (parseInt(box_height, 10) - parseInt(frame_note_top_bar_height, 10)) + "px");
        if (DOM_debug)
            console.debug(cont1.outerHTML);

        console.debug(cont1.querySelector('[name="whole_note_middlebar"]').style.height);

        console.debug("setting bottombar_position: " + bottombar_position);
        // place the bottom bar at the bottom of the note
        if (function_call_debuging)
            console.debug("calling setCSSAttributeOnNamedElement");
        setCSSAttributeOnNamedElement(cont1, 'whole_note_bottombar', 'top', bottombar_position + "px");

        // the enable checkbox should be set(or unset) according to the value of "enabled_status" in the note object data
        if (note_object_data.hasOwnProperty("enabled_status")) {
            console.debug(note_object_data.enabled);
            const enablecheckbox = cont1.querySelector('input[type="checkbox"][name="enabled_status"]');
            console.debug(enablecheckbox);
            if (note_object_data.enabled_status == 1) {
                enablecheckbox.setAttribute("checked", "true");
            } else {

                enablecheckbox.removeAttribute("checked");
            }
        }

        // if the note has a distributionlist assigned, pre-select this on the selection list
        return new Promise(function (resolve, reject) {
            //createNoteHeader(note_object_data, cont1, creatorDetails, isOwner, newNote);
            // set up the drop-down menu for distribution lists/feeds
            // pre-select the distribution list drop down menu
            const dl_container = cont1.querySelector('[name="distributionlistdropdown"]');
            //   console.debug(dl_container);
            //   console.debug(dl_container.outerHTML );
            //   console.debug(dl_container.innerHTML );
            //   console.debug(dl_container.options);
            //   console.debug((dl_container.options));
            //   console.debug((dl_container.options).length);
            const opts = dl_container.options;
            //   console.debug(opts.length);

            // pre-clean the list
            //    while ((dl_container.options).length > 0) {
            //        console.debug("removing option");
            //        dl_container.remove(0);
            //    }
            //   console.debug(dl_container.outerHTML );
            //   console.debug(dl_container.innerHTML );
            if (!isUndefined(note_object_data.distributionlistid) && note_object_data.distributionlistid != undefined) {
                console.debug("there is a distribution list assigned already: " + note_object_data.distributionlistid);
                if (function_call_debuging)
                    console.debug("calling: get_distributionlist");
                get_distributionlist().then(function (response) {
                    console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
                    try {
                        //  const selectElement = document.getElementById('distributionList');
                        response.forEach(item => {
                            console.debug(item);
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

                        if (note_object_data.hasOwnProperty("distributionlistid")) {
                            dl_container.value = note_object_data.distributionlistid;

                        } else {
                            // if no distributionlistid is set, set the value to the first option (the "do not share")
                            console.debug("no distributionlistid set, set the value to the last option (the 'do not share')");
                            dl_container.value = "";
                        }
                        resolve(null);
                    } catch (e) {
                        console.error(e);
                    }
                });

            } else {
                if (function_call_debuging)
                    console.debug("calling: get_distributionlist");
                get_distributionlist().then(function (response) {
                    console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
                    // at the top of the list add the option of not sharing the note with any distribution list/feeds

                    console.debug(response.count);

                    const option0 = document.createElement('option');
                    option0.value = '';
                    option0.textContent = 'do not share';
                    dl_container.appendChild(option0);
                    //         console.debug(dl_container.outerHTML );
                    //         console.debug(dl_container.innerHTML );

                    if (response.count > 0) {
                        response.forEach(item => {
                            console.debug(item);
                            const option = document.createElement('option');
                            option.value = item.distributionlistid;
                            option.textContent = `${item.name} ${item.description}`;
                            dl_container.appendChild(option);
                        });
                        //      console.debug(dl_container.outerHTML );
                        //      console.debug(dl_container.innerHTML );
                        // set the existing distributionlistid as selected on the dropdown list


                        if (note_object_data.hasOwnProperty("distributionlistid")) {
                            dl_container.value = note_object_data.distributionlistid;

                        } else {
                            // if no distributionlistid is set, set the value to the first option (the "do not share")
                            console.debug("no distributionlistid set, set the value to the first option (the 'do not share')");
                            dl_container.value = "";
                        }
                    }
                    console.debug("createNoteFooter.end");
                    resolve(null);
                });
            }

        });
    } else {
        // if the user is not the owner of the note, do not show the footer
        // return a promise that resolves to null
        console.debug("not the owner of the note, do not show the footer");
        return new Promise(function (resolve, reject) {
            resolve(null);
        });

    }
}

function prepareCanvasNoteForDrawing(node_root) {
    if (function_call_debuging)
        console.debug("prepareCanvasNoteForDrawing.start");
    if (function_call_debuging)
        console.debug(node_root);
    if (DOM_debug)
        console.debug(node_root.outerHTML);
    // Constants for canvas size and colors
    const canvasWidth = 200;
    const canvasHeightLarge = 250;
    const canvasHeightSmall = 30;
    const initialColor = '#FFFF00'; // Yellow

    // Get the table cells for canvas and controls
    //const canvasCell = document.getElementById('canvas-cell');
    const canvasCell = node_root.querySelector('[name="canvas-cell"]');
    //const controlsCell = document.getElementById('controls-cell');
    const controlsCell = node_root.querySelector('[name="controls-cell"]');

    // Create canvas element
    //const canvas = node_root.createElement('canvas');
    const canvas = node_root.querySelector('[name="canvas"]');

    canvas.width = canvasWidth;
    canvas.height = canvasHeightLarge;
    canvas.style.backgroundColor = initialColor; // Set initial color
    canvasCell.appendChild(canvas);

    // Bring focus back to the canvas
    canvas.focus();

    // Prevent event handlers from interfering with drawing
    canvas.addEventListener('keydown', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    canvas.addEventListener('keyup', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    canvas.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleMouseDown(e);
    });

    canvas.addEventListener('mousemove', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleMouseMove(e);
    });

    canvas.addEventListener('mouseup', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleMouseUp(e);
    });

    function handleMouseDown(e) {
        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    }

    function handleMouseMove(e) {
        if (isDrawing) {
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        }
    }

    function handleMouseUp(e) {
        if (isDrawing) {
            handleMouseMove(e);
            isDrawing = false;
        }
    }

    // Get canvas context
    const ctx = canvas.getContext('2d');

    // Variables to track drawing state
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Function to draw a sample line based on selected type
    function drawSampleLine(ctx, lineType, color, thickness) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeightSmall);
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;

        // Draw different types of lines
        switch (lineType) {
        case 'solid':
            ctx.beginPath();
            ctx.moveTo(10, 15);
            ctx.lineTo(190, 15);
            ctx.stroke();
            break;
        case 'widely_stapled':
            ctx.beginPath();
            ctx.moveTo(10, 15);
            ctx.lineTo(70, 15);
            ctx.moveTo(90, 15);
            ctx.lineTo(150, 15);
            ctx.stroke();
            break;
        case 'dencely_stapled':
            ctx.beginPath();
            ctx.moveTo(10, 15);
            ctx.lineTo(50, 15);
            ctx.moveTo(70, 15);
            ctx.lineTo(110, 15);
            ctx.moveTo(130, 15);
            ctx.lineTo(170, 15);
            ctx.stroke();
            break;
        default:
            break;
        }
    }

    // Color picker for canvas background
    //const canvasColorPicker = node_root.createElement('input');

    const canvasColorPicker = node_root.querySelector('[name="canvas-color-picker"]');

    canvasColorPicker.type = 'color';
    canvasColorPicker.value = initialColor;
    canvasColorPicker.addEventListener('input', function () {
        canvas.style.backgroundColor = canvasColorPicker.value;
    });
    controlsCell.appendChild(canvasColorPicker);

    // Color picker for drawing color
    //const drawColorPicker = node_root.createElement('input');
    const drawColorPicker = node_root.querySelector('[name="draw-color-picker"]');

    drawColorPicker.type = 'color';
    drawColorPicker.value = '#000000'; // Black initially
    drawColorPicker.addEventListener('input', function () {
        ctx.strokeStyle = drawColorPicker.value;
        drawSampleLine(ctx, lineTypeSelect.value, ctx.strokeStyle, lineWidthSelect.value);
    });
    controlsCell.appendChild(drawColorPicker);

    // Line width selector
    // const lineWidthSelect = node_root.createElement('select');
    const lineWidthSelect = node_root.querySelector('select[name="line-width-select"]');
    console.debug(lineWidthSelect);
    // [1, 2, 3, 4, 5].forEach(function(num) {
    //     const option = node_root.createElement('option');
    //     option.value = num;
    //     option.textContent = num;
    //     lineWidthSelect.appendChild(option);
    // });
    lineWidthSelect.addEventListener('change', function () {
        ctx.lineWidth = lineWidthSelect.value;
        drawSampleLine(ctx, lineTypeSelect.value, ctx.strokeStyle, ctx.lineWidth);
    });
    //controlsCell.appendChild(lineWidthSelect);

    // Line type selector
    //const lineTypeSelect = node_root.createElement('select');
    const lineTypeSelect = node_root.querySelector('select[name="line-type-select"]');

    // ['solid', 'widely_stapled', 'dencely_stapled'].forEach(function(type) {
    //     const option = node_root.createElement('option');
    //     option.value = type;
    //     option.textContent = type.replace('_', ' ');
    //     lineTypeSelect.appendChild(option);
    // });

    lineTypeSelect.addEventListener('change', function () {
        console.debug('Line type:', lineTypeSelect.value);
        drawSampleLine(ctx, lineTypeSelect.value, ctx.strokeStyle, lineWidthSelect.value);
    });

    //controlsCell.appendChild(lineTypeSelect);

    // Button to save canvas as PNG
    //const saveButton = node_root.createElement('button');
    //saveButton.textContent = 'Save as PNG';
    const saveButton = node_root.querySelector('[name="save-button"]');

    saveButton.addEventListener('click', function () {
        const dataURI = canvas.toDataURL('image/png');
        console.debug('Image saved:', dataURI);
        // Send dataURI to background script (example)
        chrome.runtime.sendMessage({
            action: 'saveImage',
            imageDataURI: dataURI
        }, function (response) {
            console.debug('Image saved:', response);
        });
    });
    controlsCell.appendChild(saveButton);

    // Function to handle mouse/touch down event for drawing
    function startDrawing(e) {
        e.preventDefault();
        isDrawing = true;
        [lastX, lastY] = [e.offsetX || e.touches[0].clientX, e.offsetY || e.touches[0].clientY];
    }

    // Function to handle mouse/touch move event for drawing
    function draw(e) {
        e.preventDefault();
        if (!isDrawing)
            return;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        [lastX, lastY] = [e.offsetX || e.touches[0].clientX, e.offsetY || e.touches[0].clientY];
        ctx.lineTo(lastX, lastY);
        ctx.stroke();
    }

    // Function to handle mouse/touch up event for drawing
    function stopDrawing(e) {
        e.preventDefault();
        isDrawing = false;
    }

    // Event listeners for mouse events on the canvas
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);

    // Event listeners for touch events on the canvas
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    // Initial drawing of the sample line
    drawSampleLine(ctx, 'solid', drawColorPicker.value, lineWidthSelect.value);

}
function hexToRGB(hex) {
    if (function_call_debuging)
        console.debug("hexToRGB.start (" + hex + ")");
    try {
        if (hex) {

            // Remove the leading '#' if it exists
            if (hex.charAt(0) === '#') {
                hex = hex.slice(1);
            }

            // Parse the red, green, and blue values
            let r = parseInt(hex.slice(0, 2), 16);
            let g = parseInt(hex.slice(2, 4), 16);
            let b = parseInt(hex.slice(4, 6), 16);

            // Return the RGB string
            return `${r},${g},${b}`;
        } else {
            // return the default color
            return "255,255,0";
        }
    } catch (e) {
        console.error(e);
        // return the default color
        return "255,255,0";
    }
}


/**
 * make different parts of the graphical elements visible or not.
 */
function setComponentVisibility(note, visibility) {
    if (function_call_debuging)
        console.debug("# setComponentVisibility.start " + visibility);
    if (function_call_debuging)
        console.debug(note);
    if (DOM_debug)
        console.debug(note.outerHTML);
    const regex = new RegExp(visibility, 'i');
    // locate all elements that have the attribute "subcomponentvisibility"
    const allElements = note.querySelectorAll('[ subcomponentvisibility ]');

    // Iterate over the selected elements
    // and depending on if they are a match or not on the visibility regexp , set the display property to 'none' or blank
    allElements.forEach(function (element) {
        // If the element does not have the attribute with the given value, set display to 'none'
        // if (element.getAttribute('minimized') === "notvisible") {
        //console.debug(element);
        //console.debug(element.getAttribute('subcomponentvisibility'));
        //console.debug(regex.test( element.getAttribute('subcomponentvisibility') ) );

        if (regex.test(element.getAttribute('subcomponentvisibility'))) {
            // make the element visible
            //console.debug("make visible");
            //console.debug(element);
            element.style["display"] = "";
            //element.style.display = 'inherit';
            //element.style.display = 'unset';

        } else {
            // make the element invisible
            //console.debug("make invisible");
            //console.debug(element);
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
        //note.querySelector('table[name="whole_note_table"]').style.height = "30px";

    } else if (/normal/.test(visibility)) {
        console.debug("normal");

        console.debug("setting height to " + note.getAttribute("box_height"));
        // account for the possibility that the "editor"-bar at the bottom should be visible is the user is the owner of the note.
        console.debug(note.getAttribute("isOwner"));
        if (note.getAttribute("isOwner") === "false") {
            console.debug("note owner? false");
            if (function_call_debuging)
                console.debug("calling setCSSAttributeOnNamedElement");
            setCSSAttributeOnNamedElement(note, "whole_note_table", "height", note.getAttribute("box_height") + 'px');

        } else {
            console.debug("note owner? true");
            if (function_call_debuging)
                console.debug("calling setCSSAttributeOnNamedElement");
            setCSSAttributeOnNamedElement(note, "whole_note_table", "height", (parseInt(note.getAttribute("box_height")) + note_owners_control_bar_height) + 'px');

        }

    }

}

/**
 *
 * @param {*} distributionlists
 */
function createQRCode(url) {
    if (function_call_debuging)
        console.debug("createQRCode.start: " + url);
    // Create the QR code container
    const qrContainer = document.createElement('div');
    qrContainer.style.position = 'fixed';
    qrContainer.style.top = '50%';
    qrContainer.style.left = '50%';
    qrContainer.style.transform = 'translate(-50%, -50%)';
    qrContainer.style.padding = '20px';
    qrContainer.style.backgroundColor = 'white';
    qrContainer.style.border = '2px solid black';
    qrContainer.style.zIndex = '300000';
    qrContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';

    // Create the close button
    const closeButton = document.createElement('span');
    closeButton.textContent = '✖';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '5px';
    closeButton.style.left = '5px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '20px';
    closeButton.style.color = 'red';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(qrContainer);
    });

    // Create the QR code element
    const qrCodeElement = document.createElement('div');
    new QRCode(qrCodeElement, {
        text: url,
        width: 200,
        height: 200,
    });

    // Append the close button and QR code to the container
    qrContainer.appendChild(closeButton);
    qrContainer.appendChild(qrCodeElement);

    // Append the QR code container to the body
    document.body.appendChild(qrContainer);
}

function attachEventlistenersToYellowStickynote(note_root, isOwner, isNewNote) {
    if (function_call_debuging)
        console.debug("attachEventlistenersToYellowStickynote.start");

    if (function_call_debuging)
        console.debug("7.7.1");
    if (function_call_debuging)
        console.debug(note_root);
    if (function_call_debuging)
        console.debug(isOwner);
    if (function_call_debuging)
        console.debug(isNewNote);
    if (function_call_debuging)
        console.debug("note_type: " + note_root.getAttribute("note_type"));


    console.debug("extract_message_display_text: ", extract_message_display_text(note_root));

    try {
        // drop-down for selecting the note type
        const noteTypeSelect = note_root.querySelector('select[name="select_notetype"]');
        console.debug(noteTypeSelect);

        noteTypeSelect.addEventListener('change', function () {
            console.debug("noteTypeSelect.change");
            console.debug("calling replaceNoteType with " + noteTypeSelect.value);
            // updateing note type in note root
            note_root.setAttribute("note_type", noteTypeSelect.value);
            if (DOM_debug)
                console.debug(note_root.outerHTML);

            if (function_call_debuging)
                console.debug("calling replaceNoteType");
            replaceNoteType(note_root, noteTypeSelect.value, isOwner, isNewNote).then(function (response) {
                console.debug(response);
                if (function_call_debuging)
                    console.debug("calling noteTypeSpecificActions");

                noteTypeSpecificActions(note_root.getAttribute("note_type"), note_root, null, isOwner, isNewNote);
            });
        });

    } catch (e) {
        console.error(e);
    }
    console.debug("7.7.2");
    try {
        if (function_call_debuging)
            console.debug("calling noteTypeSpecificActions");
        noteTypeSpecificActions(note_root.getAttribute("note_type"), note_root, null, isOwner, isNewNote);
    } catch (e) {
        console.error(e);
    }

    console.debug("7.7.3");
    // the procedure for saving a new not
    try {

        const mySave_new_note = (event) => {
            //event.stopPropagation();
            if (function_call_debuging)
                console.debug("calling save_new_note");

            var note_root = getYellowStickyNoteRoot(event.target);
            console.debug(note_root);


            // get note type which will determine which fields to read
            const note_type = note_root.getAttribute("note_type");

            var url = "";
            try {
                url = window.location.href;
                //url = note_root.querySelectorAll('input[name="url"]')[0].textContent.trim();
            } catch (e) {
                // set default, local url

            }

            // new notes do not have a noteid and if one does it is not a new note
            var noteid = null;
            console.debug("noteid: " + noteid);
            try {
                noteid = note_root.querySelector('input[name="noteid"]').textContent.trim();
            } catch (e) {}
            console.debug("noteid: " + noteid);
            // only proceed if there is no noteid set - this note should not be created in this function
            // if (noteid == null || noteid == "" || noteid == undefined || noteid == "undefined") {

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

            var enabled = "";
            try {
                enabled = note_root.querySelectorAll('input[name="enabled"]')[0].textContent.trim();
            } catch (g) {
                // set default
                console.debug(g);
                enabled = true;
            }
            console.debug("7.7.5");
            var canvas_uri = "";
            if (note_type == "canvas") {
                var canvas;
                try {
                    canvas = note_root.querySelector('[name="canvas"]');
                    console.debug(canvas);
                    canvas_uri = canvas.toDataURL('image/png');
                    console.debug(canvas_uri);
                } catch (h) {
                    console.debug(h);
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


            // The message has been placed inside an ifram to protect it from javascript running in the page
            // For instance, there are site where pressing the space bar will pause the media stream. This is not desirable when editing a note


            var message_display_text = "";
           
           
           // message_display_text = extract_message_display_text(note_root);


            const iframe = note_root.querySelector('[name="note_content_frame"]');
            console.debug(iframe);
            var message_display_text = "";


              console.log(queryIframeContent(iframe, '[name="message_display_text"]')[0]);

              queryIframeContent(iframe, '[name="message_display_text"]').then(function (response) {
                console.log(response);
                message_display_text = response[0].textContent.trim();
                console.log("message_display_text: ", message_display_text);
              


            console.debug("7.7.4");
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

            save_new_note_msg(json_create, noteid, note_root);
            event.stopPropagation();
            });
        };
        const myupdate_note = (event) => {
            update_note(event);
            event.stopPropagation();
        };

        // for save buttons/icons
        var allGoTo3 = note_root.querySelectorAll('[js_action="save_new_note"]');
        console.debug(allGoTo3);
        for (var i = 0; i < allGoTo3.length; i++) {
            //allGoTo3[i].removeEventListener("click", mySave_new_note);
            allGoTo3[i].removeEventListener("click", myupdate_note);
            allGoTo3[i].addEventListener("click", mySave_new_note);
        }

        var allGoTo7 = note_root.querySelectorAll('[js_action="update_note"]');
        for (var i = 0; i < allGoTo7.length; i++) {
            allGoTo7[i].removeEventListener("click", mySave_new_note);
            allGoTo7[i].removeEventListener("click", myupdate_note);
            allGoTo7[i].addEventListener("click", myupdate_note);
        }

    } catch (e) {
        console.error(e);
    }
    /// close note event listener
    try {
        console.debug("add close note event listener");

        const myclose_note = (event) => {
            close_note(event);
            event.stopPropagation();
        };
        // for close buttons/icons
        var allGoTo = note_root.querySelectorAll('[js_action="close_note"]');
        for (var i = 0; i < allGoTo.length; i++) {
            console.debug("attach close note event listener");
            allGoTo[i].removeEventListener("click", myclose_note);
            allGoTo[i].addEventListener("click", myclose_note);
        }
    } catch (e) {
        console.error(e);
    }

    try {
        console.debug("add copy note event listener");

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
        console.debug("add minimze note event listener");

        const myminimize_note = (event) => {
            minimize_note(event);
            event.stopPropagation();
        };

        var allGoTo12 = note_root.querySelectorAll('[js_action="minimize_note"]');
        for (var i = 0; i < allGoTo12.length; i++) {
            allGoTo12[i].removeEventListener("click", myminimize_note);
            console.debug("minimized_note event listener removed")
            allGoTo12[i].addEventListener("click", myminimize_note);
            console.debug("minimized_note event listener attached")
        }

    } catch (e) {
        console.error(e);
    }

    try {
        console.debug("add fullscreen note event listener");

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
        console.debug("add rightsize note event listener");

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
        console.debug("add delete note event listener");

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
        console.debug("add dmisimss note event listener");
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
        console.debug(e);
    }

    // QR-code
    try {
        console.debug("add qr-code event listener");
        const qr_code_note = (event) => {

            // for button going to note location
            const noteid = note_root.getAttribute("noteid");
            const distributionlistid = note_root.getAttribute("distributionlistid");

            console.debug("noteid: " + noteid);
            console.debug("distributionlistid: " + distributionlistid);
            var link = "";
            if (distributionlistid != null && distributionlistid != "" && distributionlistid != undefined) {
                console.debug("goto_notetarget_link");
                link = "https://www.yellownotes.cloud/pages/subscribe.html?add_feedid=" + distributionlistid + "&redirecturi=%2Fpages%2Fgothere.html%3Fnoteid%3D" + noteid;
            } else {
                console.debug("goto_notetarget_link");
                link = "https://www.yellownotes.cloud/pages/subscribe.html?gothere.html?noteid=" + noteid;
            }

            createQRCode(link);
            event.stopPropagation();
        };
        var allGoTo28 = note_root.querySelectorAll('[js_action="qr_code"]');
        console.debug(allGoTo28);
        for (var i = 0; i < allGoTo28.length; i++) {
            console.debug("qr_core");
            console.debug(allGoTo28[i]);
            allGoTo28[i].removeEventListener("click", qr_code_note);
            allGoTo28[i].addEventListener("click", qr_code_note);

        }

    } catch (e) {
        console.debug(e);
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
        console.debug(e);
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

        console.debug("noteid: " + noteid);
        console.debug("distributionlistid: " + distributionlistid);

        var allGoTo112 = note_root.querySelectorAll('[name="goto_notetarget_link"]');
        if (distributionlistid != null && distributionlistid != "" && distributionlistid != undefined) {
            for (var i = 0; i < allGoTo112.length; i++) {
                console.debug("goto_notetarget_link");
                allGoTo112[i].setAttribute("href", "https://www.yellownotes.cloud/pages/subscribe.html?add_feedid=" + distributionlistid + "&redirecturi=%2Fpages%2Fgothere.html%3Fnoteid%3D" + noteid);
            }
        } else {
            for (var i = 0; i < allGoTo112.length; i++) {
                console.debug("goto_notetarget_link");
                allGoTo112[i].setAttribute("href", "https://www.yellownotes.cloud/pages/subscribe.html?gothere.html?noteid=" + noteid);
            }
        }

    } catch (e) {
        console.error(e);
    }

    try {
        const myload_url = (event) => {
            console.debug("myload_url");
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
            console.debug("mydistributionlist_dropdown");
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
    const note_type = note_root.getAttribute("note_type");
    console.debug("calling note type-specific procedures (for " + note_type + ")");
    if (note_type == "plaintext") {
        if (isNewNote) {
            // make the message in the textarea touch-n-go
            //  prepareNewTextNoteEventlistener(note_root);
        }
    } else if (note_type == "plainhtml") {
        if (isNewNote) {
            // make the message in the textarea touch-n-go
            //  prepareNewTextNoteEventlistener(note_root);
        }
    } else if (note_type == "yellownote") {
        if (isNewNote) {
            // make the message in the textarea touch-n-go
            //   prepareNewTextNoteEventlistener(note_root);
        }
    } else if (note_type == "capture_note") {
        prepareCaptureNoteEventlistener(note_root, info);
    } else if (note_type == "canvas") {

        attacheCanvasEventlisteners(note_root);
    } else if (note_type == "webframe") {
        console.debug("webframe");
        //
    }

    // console.debug(note_root.outerHTML);
    console.debug("attachEventlistenersToYellowStickynote.end");
}


function queryIframeContent(iframe, selector) {
    console.debug("queryIframeContent.start");
    try {
        // Check if the iframe is present in the DOM
        if (!iframe) {
          throw new Error('The iframe object is null or undefined.');
        }
    
        // Check if the iframe has a valid document
        if (!iframe.contentWindow || !iframe.contentWindow.document) {
          // Try reloading the iframe or re-attaching it to the DOM
          console.warn('Iframe not accessible yet. Attempting to reload or reattach.');
          
          const parentElement = iframe.parentElement;
          if (parentElement) {
            // Remove and re-append the iframe to force reload
            const tempIframe = iframe.cloneNode(true);
            parentElement.replaceChild(tempIframe, iframe);
            iframe = tempIframe;
            console.debug("iframe 9.0.3");

          } else {
            throw new Error('Iframe is not attached to the DOM.');
          }
        }
    console.debug("iframe 9.0.4");
        // Wait for the iframe to fully load if not already loaded
        return new Promise((resolve, reject) => {
          iframe.onload = function() {
            try {
                console.debug("iframe 9.0.2");

              const iframeDoc = iframe.contentWindow.document;
              const elements = iframeDoc.querySelectorAll(selector);
              resolve(Array.from(elements));
            } catch (error) {
              reject('Error querying iframe content after load: ' + error.message);
            }
        };  
          console.debug("iframe 9.0.1");

          console.debug(iframe.contentWindow);
          console.debug(iframe.contentWindow.document.readyState);

          // Check if the iframe is already loaded
          if (iframe.contentWindow && iframe.contentWindow.document.readyState === 'complete') {
            console.debug("iframe 9.0.8");

            const iframeDoc = iframe.contentWindow.document;
            const elements = iframeDoc.querySelectorAll(selector);
            resolve(Array.from(elements));
          }
        
        });
    
      } catch (error) {
        console.error('Error accessing iframe:', error.message);
        return Promise.resolve(null); // Return a resolved promise with null
      }
    }
    





function extract_message_display_text(note_root) {
    if (function_call_debuging)
        console.debug("# extract_message_display_text.start");
    const iframe = note_root.querySelector('[name="note_content_frame"]');
    console.debug(iframe);
    var message_display_text = "";
    iframe.onload = function () {
        const iframeWindow = iframe.contentWindow;
        if (iframeWindow) {
            console.log('iframe contentWindow is available');
            try {
            const iframeDoc = iframeWindow.document;
            iframeDoc.open();

            message_display_text = iframeDoc.querySelector('[name="message_display_text"]').innerHTML.trim();
            iframeDoc.close();
            return message_display_text;
           
                //console.debug(iframeDoc.querySelector('[name="message_display_text"]').innerHTML);
            } catch (L) {
                console.error(L);
            }
           

        } else {
            console.log('iframe contentWindow is null');
        }
    };
   
}

/**
 * get the root node of a yellownote DOM given any subsidiary node
 * @param {*} currentElement
 * @returns
 */
function getYellowStickyNoteRoot(currentElement) {
    if (function_call_debuging)
        console.debug("# getYellowStickyNoteRoot");
    //console.debug(currentElement);

    // let currentElement = element;
    // container type="yellownote"
    //console.debug(currentElement);
    //console.debug(currentElement.querySelector('container[type="yellownote"]'));

    // the root node of the yellownote is the first(top-most) container element with attribute type="yellownote"
    try {
        if (currentElement.hasAttribute("class")) {
            if (currentElement.getAttribute("class") === "yellownotecontainer") {

                // Condition met, return this element
                return currentElement;
            }

        }
        while (currentElement !== null && currentElement !== document) {
            //console.debug(currentElement);
            //console.debug(currentElement.querySelector('container[type="yellownote"]'));
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
    if (function_call_debuging)
        console.debug("disable note");
    if (function_call_debuging)
        console.debug(event);
    if (function_call_debuging)
        console.debug(event.target);
    const isChecked = event.target.checked;
    // stop clicking anything behind the button
    event.stopPropagation();
    try {
        var note_root = getYellowStickyNoteRoot(event.target);
        var noteid = note_root.getAttribute("noteid");
        if (isChecked) {
            console.debug("Checkbox is checked");
            // Add your code to handle the checked state
            // update the table of notes
            if (!isHttpUrl()) {
                console.debug("not a http url");
                // update the table of notes
                //  update_notes_table();
                const table_row = document.querySelector('tr[noteid="' + noteid + '"]');
                console.debug(table_row);
                table_row.querySelector('td[name="enabled_status"]').querySelector('input[type="checkbox"]').setAttribute("checked", "false");

            } else {
                console.debug("a http url");

            }
            // start the process of enabling the note
            // send save request back to background

            const msg = {
                "action": "single_note_disable",
                "disable_details": {
                    "noteid": noteid,
                    "enabled_status": 1
                }
            };
            console.debug(msg);
            chrome.runtime.sendMessage(msg, function (response) {
                console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
                // finally, call "close" on the note
                //  try{
                //  	close_note(event);
                //  }catch(g){console.debug(g);}
                //remove_noteid(noteid);


            });

        } else {
            console.debug("Checkbox is unchecked");
            // Add your code to handle the unchecked state
            // update the table of notes
            if (!isHttpUrl()) {
                console.debug("not a http url");
                // update the table of notes
                //  update_notes_table();
                const table_row = document.querySelector('tr[noteid="' + noteid + '"]');
                console.debug(table_row);
                table_row.querySelector('td[name="enabled_status"]').querySelector('input[type="checkbox"]').removeAttribute("checked");
            } else {
                console.debug("a http url");

            }
            console.debug("browsersolutions noteid: " + noteid);

            // send save request back to background
            const msg = {
                "action": "single_note_disable",
                "disable_details": {
                    "noteid": noteid,
                    "enabled_status": 0
                }
            };
            console.debug(msg);
            chrome.runtime.sendMessage(msg, function (response) {
                console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));

            });

        }

    } catch (e) {
        console.error(e);
    }
}

/**
 * determine if the note is on a web page or in the YellowNotes GUI
 */
function isHttpUrl() {
    // Get the current URL
    const currentUrl = window.location.href;
    // Check if it starts with 'http'
    return currentUrl.startsWith('http');
}

function delete_note(event) {
    if (function_call_debuging)
        console.debug("delete_note.start");
    if (function_call_debuging)
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


    // if this in on the GUI, also remove the row from the table of notes

    if (!isHttpUrl()) {
        console.debug("not a http url");
        // update the table of notes
        //  update_notes_table();
        const table_row = document.querySelector('tr[noteid="' + noteid + '"]');
        console.debug(table_row);
        table_row.remove();
    } else {
        console.debug("a http url");
    }

    delete_note_by_noteid(noteid);
}

function delete_note_by_noteid(noteid) {
    if (function_call_debuging)
        console.debug("delete_note_by_noteid.start");

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

function prepareNewTextNoteEventlistener(note_root) {
    if (function_call_debuging)
        console.debug("preparePlainNoteEventlistener.start");
    // make the message in the textarea touch-n-go
    try {
        // Grab the textarea element
        const textarea = note_root.querySelector('[name="message_display_text"]');
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
}

function prepareCaptureNoteEventlistener(note_root) {
    if (function_call_debuging)
        console.debug("prepareCaptureNoteEventlistener.start");
    if (function_call_debuging)
        console.debug("capture_note");

    // place the note on the orignal capture coordinates

    note_root.setAttribute("posx", info.coords.x1 + "px");
    note_root.setAttribute("posy", info.coords.y1 + "px");
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

function setBackground(creatorDetails, note_root) {
    if (function_call_debuging)
        console.debug("browsersolutions ### setBackground to " + creatorDetails.note_color);

    // what color to use for the note
    var note_color = "#ffff00"; // set default value, override with more specific values if available
    // attempt to read size parameters from the note properties of the creator
    if (creatorDetails.note_color) {
        note_color = creatorDetails.note_color
            console.debug("creator's note_properties has note_color, use it " + note_color);

    } else {
        // brand-level not implemted yet
    }
    var box_background = "rgb(" + hexToRGB(note_color) + ", 0.7)";

    // Get all elements in the note_root
    const allElements = note_root.querySelectorAll('*');

    // Iterate over each element
    allElements.forEach(element => {
        // Check if the element has a style attribute that includes 'background'
        if (element.style && element.style.background) {
            // Update the background style to the new value
            //console.debug(element);
            element.style.backgroundColor = box_background;
            //console.debug(element);

        }
    });
}

// return a drop down html list of all available distribution lists
function get_distributionlist() {
    if (function_call_debuging)
        console.debug("# get_distributionlist");
    return new Promise(function (resolve, reject) {
        try {
            chrome.runtime.sendMessage({
                message: {
                    action: "get_my_distribution_lists"
                }
            }).then(function (response) {
                console.debug("get_distributionlist message sent to background.js with response: ");
                console.debug(response);
                // render content of ifram based on this
                //console.debug(getYellowStickyNoteRoot(event.target));
                //setContentInIframe(content_iframe, response);
                resolve(response);
            });
        } catch (e) {
            console.debug(e);
            reject();
        }
    });
}

function isUndefined(variable) {
    return typeof variable === 'undefined';
}

function create_stickynote_node(note_object_data, html_note_template, html_notetype_template, creatorDetails, isOwner, isNewNote) {
    if (function_call_debuging)
        console.debug("create_stickynote_node.start");
    return new Promise(function (resolve, reject) {
        console.debug("note_object_data:");
        console.debug(note_object_data);
        console.debug("html_note_template.length: ", html_note_template.length);
        //console.debug(html_note_template);
        console.debug("html_notetype_template.length: ", html_notetype_template.length);
        //console.debug(html_notetype_template);
        console.debug("creatorDetails:");
        console.debug(creatorDetails);
        console.debug("isOwner: ", isOwner);
        console.debug("isNewNote: ", isNewNote);
        // create the "wrapping" container that hold the DOM-structure of the note

        var note_root;
        console.debug("calling create_yellownote_DOM");
        create_yellownote_DOM(html_note_template, html_notetype_template, note_object_data.note_type, isOwner, isNewNote).
        then(function (response) {
            note_root = response;
            //console.debug(cont1.outerHTML);
            resolve(note_root);
            return note_root;

            // if the note is new, there is no noteid yet
            if (isNewNote) {
                console.debug("new note, not yet a noteid");
                note_root.setAttribute("newNote", "true");
                // the note is new so the note has status automatically set to active - not that that means anything at that stage
                note_root.setAttribute("note_active_status", 1);
            } else {
                console.debug("not a new note");
                note_root.setAttribute("noteid", note_object_data.noteid);
                // set note active status
                if (!isUndefined(note_object_data.status) && note_object_data.status != undefined) {
                    note_root.setAttribute("note_active_status", note_object_data.status);

                }
            }

            if (!isUndefined(note_object_data.distributionlistid) && note_object_data.distributionlistid != undefined) {
                note_root.setAttribute("distributionlistid", note_object_data.distributionlistid);
            }

            //cont1.appendChild(create_note_table(note_object_data,note_template));

            // render a webframe note

            

            // render a canvas note

            console.debug("extract_message_display_text: ", extract_message_display_text(note_root));

            // render a plainhtml note
            console.debug("calling createNoteMiddleBody");
            createNoteMiddleBody(note_object_data, note_root, creatorDetails, isOwner, isNewNote).
            then(function (response) {
                console.debug("createNoteMiddleBody.complete");
                console.debug(response);
                console.debug(response.outerHTML);
                console.debug("extract_message_display_text: ", extract_message_display_text(note_root));




                //    resolve(response);
                // note footer is only for editing and thereofre only for the note owner or a new note (also note owner)
                console.debug("calling createNoteFooter");
                return createNoteFooter(note_object_data, note_root, creatorDetails, isOwner, isNewNote);
            }).then(function (response) {
                console.debug("createNoteFooter.complete");
                //console.debug(response);
                //console.debug(response.outerHTML);
                console.debug("extract_message_display_text: ", extract_message_display_text(note_root));

                console.debug("calling createNoteHeader");
                return createNoteHeader(note_object_data, note_root, creatorDetails, isOwner, isNewNote);
            }).then(function (response) {
                console.debug("createNoteHeader.complete");

                // attach event lsiteners to the note
                //console.debug("calling attachEventlistenersToYellowStickynote");
                //attachEventlistenersToYellowStickynote(cont1, isOwner, newNote);
                //console.debug(noteForm);
                console.debug("extract_message_display_text: ", extract_message_display_text(note_root));

                // there directly by just clicking on this link

                // setup event listener whereby the user can configure this link
                // rewriting to be automatic

                // where to anchor the tooltip
                // setup node in the DOM tree to contain content of message box
                // var newGloveboxNode = document.createElement("Glovebox");
                // console.debug(newGloveboxNode);

                // set background color of note
                // what color to use for the note
                console.debug("calling setNoteColor");
                setNoteColor(creatorDetails, note_root);

                // set note size
                // set default values first
                // then replace those values with more specific ones if they are available/applicable

                // set defaults

                var box_height = default_box_height;

                var box_width = parseInt(note_object_data.box_width, 10);
                if (box_width > 0) {
                    console.debug("use note-specific box_width: " + box_width);
                } else {
                    box_width = parseInt(creatorDetails.box_width, 10);
                    if (box_width > 0) {
                        console.debug("use creator-specific box_width: " + box_width);
                    } else {
                        console.debug("use default box_width: " + default_box_width);
                        box_width = default_box_width;
                    }
                }

                var box_height = parseInt(note_object_data.box_height, 10);
                if (box_height > 0) {
                    console.debug("use note-specific box_height: " + box_height);
                } else {
                    box_height = parseInt(creatorDetails.box_height, 10);
                    if (box_height > 0) {
                        console.debug("use creator-specific box_height: " + box_height);
                    } else {
                        console.debug("use default box_width: " + default_box_height);
                        box_width = default_box_height;
                    }
                }

                // check for template-specific values - not implemented yet


                // check for brand/organization-specific values - not implemented yet


                // check for feed-specific values - not implemented yet


                // check for note specific values

                //
                // set the established note dimensions to the note root object
                note_root.setAttribute("box_height", box_height + "px");
                note_root.setAttribute("box_width", box_width + "px");
                //                // as well as to the graphical elements of the note
                var whole_note_table = note_root.querySelector('table[name="whole_note_table"]');
                console.debug(whole_note_table);
                //whole_note_table.style.width = box_width;
                if (function_call_debuging)
                    console.debug("calling setCSSAttributeOnNamedElement");
                setCSSAttributeOnNamedElement(note_root, 'whole_note_table', 'width', box_width + "px");
                if (isOwner) {
                    // expand the note downwards to make room for the note owner's control bar
                    console.debug("isOwner=true expand note downwards");
                    if (function_call_debuging)
                        console.debug("calling setCSSAttributeOnNamedElement");

                    setCSSAttributeOnNamedElement(note_root, 'whole_note_table', 'height', (box_height + note_owners_control_bar_height) + "px");

                } else {
                    // remove the bottom bar
                    const bottom_bar = note_root.querySelector('tr[name="whole_note_bottombar"]');
                    console.debug(bottom_bar);
                    bottom_bar.style.display = 'none';

                    //whole_note_table.style.height = box_height;
                    if (function_call_debuging)
                        console.debug("calling setCSSAttributeOnNamedElement");
                    setCSSAttributeOnNamedElement(note_root, 'whole_note_table', 'height', box_height + "px");

                }
                //console.debug(whole_note_table.innerHTML);
                //console.debug(whole_note_table.outerHTML);

                console.debug(note_root);
                //console.debug("calling update_note_internal_size");
                //update_note_internal_size(cont1);
                console.debug(note_root.outerHTML);

                resolve(note_root);
            });
        });
    });
}

function scaleGraphicalElement(element, maxWidth) {
    if (function_call_debuging)
        console.debug("scaleGraphicalElement.start");
    if (function_call_debuging)
        console.debug(element);
    //const container = document.getElementById(containerId);
    //const element = document.getElementById(elementId);

    const originalDisplay = element.style.display;
    console.debug("originalDisplay: ", originalDisplay);
    // Ensure the element is visible to get correct measurements
    element.style.display = 'block';

    // Get the original dimensions of the graphical element
    const originalWidth = element.offsetWidth;
    const originalHeight = element.offsetHeight;

    // Calculate the scale factor
    const scaleFactor = maxWidth / originalWidth;

    // Apply the scale factor to the graphical element
    element.style.transform = `scale(${scaleFactor})`;

    // Adjust the container height to fit the scaled element
    //container.style.height = `${originalHeight * scaleFactor}px`;

    // make adjustments to offset the way the scaling will move the x-y position of the element
    element.style.transformOrigin = '0 0';
    if (originalDisplay === '') {
        console.debug("display was orignaly unset");
        // unset the display style to revert to the default
        element.style.display = '';
    } else {
        console.debug("display was orignaly set to: ", originalDisplay);
        // restore the original display style
        element.style.display = originalDisplay;
    }
    // Hide the element again
    //element.style.display = 'none';

}

function update_note(event) {
    if (function_call_debuging)
        console.debug("update_note (event)");
    if (function_call_debuging)
        console.debug(event);

    // save note to database
    try {
        // get the table node that is the root of the note data.

        var note_root = getYellowStickyNoteRoot(event.target);
        console.debug(note_root);

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

        var content_url = "";
        // check for content_url for notes that collect content from elsewher
        if (note_type == "webframe") {
            try {
                content_url = note_root.querySelector('input[name="urlInput"]').value.trim();
            } catch (e) {
                console.error(e);

            }
        }

        // extract the text in the message_display_text node
        var message_display_text = "";
        try {
            //console.debug(note_root.querySelectorAll('[name="message_display_text"]')[0].value.trim())
            const message_display_text_node = note_root.querySelector('[name="message_display_text"]');
            // two different type: plaintext and html
            if (note_type == "plaintext") {

                message_display_text = note_root.querySelector('[name="message_display_text"]').value.trim();

            } else if (note_type == "plainhtml") {
                console.debug("collected note contents as if it is plain html");
                console.debug(note_root.querySelector('[name="whole_note_middlecell"]'));
                console.debug(note_root.querySelector('[name="whole_note_middlecell"]').innerHTML);

                message_display_text = note_root.querySelector('[name="whole_note_middlecell"]').innerHTML;
            } else if (note_type == "yellownote") {
                console.debug("collected note contents as if it is plaintext");
                message_display_text = note_root.querySelector('[name="whole_note_middlecell"]').textContent.trim();

            }
            console.debug(message_display_text);

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
            console.debug('Selected distributionlistid:', distributionlistid);

            // update the reference to the current distributionlist for this note in the root node of the note
            note_root.setAttribute("distributionlistid", distributionlistid);

            // update the goto-link
            var goto_link = note_root.querySelector('[name="goto_notetarget_link"]');
            goto_link.setAttribute("href", "https://www.yellownotes.cloud/pages/subscribe.html?add_feedid=" + distributionlistid + "&redirecturi=%2Fpages%2Fgothere.html%3Fnoteid%3D" + noteid);
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
            box_width = default_box_width;
        }

        //const box_height = processBoxParameterInput(note_root.getAttribute("box_height"), 250, 50, 500);
        var box_height = note_root.getAttribute("box_height");
        if (box_height == null || box_height == undefined) {
            box_height = default_box_height;
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
            enabled_status: 1,
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

/* update the sizing of internal items in the note object
such as the canvas for the canvas note, the message display area for the yellow note, etc.
 */
function update_note_internal_size(note) {
    console.debug("update_note_internal_size.start");
    if (function_call_debuging)
        console.debug("update_note_internal_size.start");
    if (function_call_debuging)
        console.debug(note);
    const note_type = note.getAttribute("note_type");
    console.debug("note_type: ", note_type);

    const box_width = parseInt(note.getAttribute("box_width"), 10);
    const box_height = parseInt(note.getAttribute("box_height"), 10);
    console.debug("box_width: " + box_width);
    console.debug("box_height: " + box_height);

    // update some internal objects in the note object to reflect the new overall size of the note
    const usable_width = (parseInt(box_width) - note_internal_width_padding);
    const usable_height = (parseInt(box_height, 10) - (frame_note_top_bar_height + note_internal_height_padding));
    console.debug("setting new content frame usable width " + usable_width);
    console.debug("setting new content frame usable height " + usable_height);

    // webframe

    if (note_type === "webframe") {
        try {
            console.debug("setting new (fake)iframe width " + usable_width);
            if (function_call_debuging)
                console.debug("calling setCSSAttributeOnNamedElement");
            setCSSAttributeOnNamedElement(note, "fakeiframe", "width", usable_width + 'px');
            if (function_call_debuging)
                console.debug("calling setCSSAttributeOnNamedElement");
            setCSSAttributeOnNamedElement(note, "fakeiframe", "height", (usable_height - 55) + 'px');

        } catch (e) {
            //console.error(e);
        }

        try {
            if (function_call_debuging)
                console.debug("calling setCSSAttributeOnNamedElement");
            setCSSAttributeOnNamedElement(note, "whole_note_middlecell", "width", usable_width + 'px');
            if (function_call_debuging)
                console.debug("calling setCSSAttributeOnNamedElement");
            setCSSAttributeOnNamedElement(note, "whole_note_middlecell", "height", usable_height + 'px');
        } catch (e) {
            //console.error(e);
        }

        // update the URL box on webframe note
        try {
            const new_field_width = (parseInt(box_width) - 40);
            console.debug("setting new url intput field width " + new_field_width);
            if (function_call_debuging)
                console.debug("calling setCSSAttributeOnNamedElement");
            setCSSAttributeOnNamedElement(note, "urlInput", "width", new_field_width + 'px');
        } catch (e) {
            //console.error(e);
        }
    }
    // plainhtml / yellownote
    if (note_type === "plaintext" || note_type === "yellownote" || note_type === "plainhtml") {
        // update the iframe size
        try {
            if (function_call_debuging)
                console.debug("calling setCSSAttributeOnNamedElement");
            setCSSAttributeOnNamedElement(note, "note_content_frame", "width", usable_width + 'px');
            if (function_call_debuging)
                console.debug("calling setCSSAttributeOnNamedElement");
            setCSSAttributeOnNamedElement(note, "note_content_frame", "height", usable_height + 'px');

        } catch (e) {
            //console.debug(e);
        }
    }
    // cancase
    if (note_type === "canvas") {
        // a convas is wiped everytime it is resized. Therefore manipulation of the note should not by itself resize the canvas, as this looks like a bug to the user
        try {
            console.debug("canvas current width: ", note.querySelector('[name="canvas"]').getAttribute("width"));
            console.debug("canvas new width: ", usable_width);
            console.debug("canvas current height: ", note.querySelector('[name="canvas"]').getAttribute("height"));
            console.debug("canvas new height: ", (usable_height - canvas_toolbar_height));

            // make sure the size parameters are not updates unless there is an actual change in values
            if (note.querySelector('[name="canvas"]').getAttribute("width") == usable_width) {
                console.debug("no need to update canvas width");
            } else {
                // console.debug("setting new canvas width " + usable_width);
                // note.querySelector('[name="canvas"]').setAttribute("width", usable_width);
                // const new_canvas_width = (usable_width );
                // console.debug("setting new canvas_width " + new_canvas_width);
                // note.querySelector('[name="canvas"]').setAttribute("height", new_canvas_width);
                // note.setAttribute("canvas_width", (new_canvas_width ) + "px");
            }
            if (note.querySelector('[name="canvas"]').getAttribute("height") == (usable_height - canvas_toolbar_height)) {
                console.debug("no need to update canvas height");
            } else {
                // const new_canvas_height = (usable_height - canvas_toolbar_height);
                // console.debug("setting new canvas height " + new_canvas_height);
                // note.querySelector('[name="canvas"]').setAttribute("height", new_canvas_height);
                // note.setAttribute("canvas_height", (new_canvas_height ) + "px");

            }

        } catch (e) {
            console.debug(e);
        }
    }
    try {

        if (function_call_debuging)
            console.debug("calling setCSSAttributeOnNamedElement");
        setCSSAttributeOnNamedElement(note, "whole_note_middlebar", "height", usable_height + 'px');
    } catch (e) {
        console.debug(e);
    }

}
