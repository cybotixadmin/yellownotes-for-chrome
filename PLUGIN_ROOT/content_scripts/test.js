

// main a contstant for how heigh the bar should be for the controls only accessible to the note owner (or administrator)
/*
the owner of the note have extra controls in a bar on the bottom (buttons, drop-downs etc.)

This is height is added to the heigh the note will ordinarily have and is substracted fro mthe height of the note when the note is saved to the database.

 */

const note_owners_control_bar_height = 23;

function test() {
    console.log("test");
}

function create_yellownote_DOM(html_note_template, html_notetype_template, note_type, isOwner, isNewNote) {
    console.debug("create_yellownote_DOM.start");
    try {
        return new Promise(function (resolve, reject) {
            // the root of the note object
            //console.debug(html_note_template);
            //console.debug(html_notetype_template);
            console.debug(note_type);
            console.debug(isOwner);
            console.debug(isNewNote);
            var node_root = document.createElement('container');
            //console.debug(node_root.outerHTML);

            //const modifiedDoc2 = mergeDOMTrees(doc1, "querySelector", doc2, '#destination');
            console.debug("calling mergeHTMLTrees");
            mergeHTMLTrees(html_notetype_template, "querySelector", html_note_template, '#destination').then(function (response) {

                const modifiedDoc2 = response;

                //console.log(modifiedDoc2.outerHTML);

                // Example usage:
                //const doc1 = new DOMParser().parseFromString(html_notetype_template, 'text/html');
                //const doc2 = new DOMParser().parseFromString(html_note_template, 'text/html');
                //console.log(doc1.documentElement.outerHTML);
                //console.log(doc2.documentElement.outerHTML);


                // var fullURLToCSS = chrome.runtime.getURL("css/yellownote.css");

                // insert the overall note template

                //var note_template = safeParseInnerHTML(html_note_template, 'div');
                // note_template = JSON.parse(html);
                //console.debug(note_template);

                node_root.setAttribute("class", "yellownotecontainer");
                node_root.setAttribute("note_type", note_type);
                node_root.setAttribute("button_arrangment", 'new');

                //node_root.setAttribute("isOwner", isOwner);
                //node_root.setAttribute("isNewNote", isNewNote);

                node_root.appendChild(modifiedDoc2);

                console.log(node_root);
                // update the body of the note which is different for each note type

                //console.log(node_root.querySelector('[name]'));
                //var notetype_template = safeParseInnerHTML(html_notetype_template, 'div');
                //console.log(notetype_template);
                //const nodeToReplace = node_root.querySelector('[name="whole_note_middlebar"]');
                //console.debug(nodeToReplace);
                //const middle_bar = notetype_template.querySelector('tr[name="whole_note_middlebar"]');
                //console.debug(middle_bar);
                //nodeToReplace.parentNode.insertBefore(middle_bar, nodeToReplace.nextSibling);

                //nodeToReplace.remove();

                //console.debug(node_root.outerHTML);
                resolve(node_root);
            });
        });
    } catch (e) {
        console.error(e);
    }
}

function mergeHTMLTrees(doc1, selector1, doc2, selector2) {
    console.debug("#mergeHTMLTrees.start");
    return new Promise(function (resolve, reject) {
        //console.debug("0.0.0");
        try {
            //console.log("doc1");
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
            //console.debug(note_template.outerHTML);

            const elementFromDoc1 = notetype_template.querySelector('[name="whole_note_middlebar"]');
            //console.log(elementFromDoc1.outerHTML);
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
            //console.log(note_template.outerHTML);
            // Return the modified second document
            console.debug("0.0.3");
            resolve(note_template);
        } catch (e) {
            console.debug("0.0.1");
            console.error(e);
            resolve(null);
        }
    });

}

/**
 * process the middle part of the note. This is the part where there are diference between the different types of yellownotes
 */
function createNoteMiddleBody(note_object_data, cont1, creatorDetails, isOwner, newNote) {
    console.debug("createNoteMiddleBody.start");
    console.debug(note_object_data);
    console.debug(cont1);
    console.debug(creatorDetails);
    console.debug(isOwner);
    console.debug(newNote);

    const note_type = note_object_data.note_type;
    console.debug("note_type: " + note_type);
    return new Promise(function (resolve, reject) {

        // part pertain to all note types
        try {
            if (note_object_data.hasOwnProperty("createtime")) {
                cont1.querySelector('input[type="hidden"][name="createtime"]').replaceChildren(document.createTextNode(note_object_data.createtime));
            }
            if (note_object_data.hasOwnProperty("lastmodifiedtime")) {
                cont1.querySelector('input[type="hidden"][name="lastmodifiedtime"]').replaceChildren(document.createTextNode(note_object_data.lastmodifiedtime));
            }
            if (note_object_data.hasOwnProperty("note_type")) {
                cont1.querySelector('input[type="hidden"][name="note_type"]').replaceChildren(document.createTextNode(note_object_data.note_type));
            }

            // capture local url
            cont1.querySelector('input[type="hidden"][name="url"]').replaceChildren(document.createTextNode(note_object_data.url));
            if (typeof note_object_data.enabled != undefined) {
                cont1.querySelector('input[type="hidden"][name="enabled"]').replaceChildren(document.createTextNode(note_object_data.enabled));
            } else {
                // default value if undefined, is enabled(=true)
                cont1.querySelector('input[type="hidden"][name="enabled"]').replaceChildren(document.createTextNode("true"));
            }

            if (note_object_data.hasOwnProperty("noteid")) {
                cont1.querySelector('input[type="hidden"][name="noteid"]').replaceChildren(document.createTextNode(note_object_data.noteid));
            }

        } catch (e) {
            console.error(e);
        }

        if (note_type == "http_get_url" || note_type == "webframe" || note_object_data.type == "webframe") {
            // part pertain only to notes of type http_get_url (looking up URLs)
            // Locate the form element
            console.debug("webframe note type");

            console.debug("#### perform url lookup ####");

            // check for content_url for notes that collect content from elsewhere
            try {
                if (note_object_data.content_url != undefined) {
                    cont1.querySelector('input[name="urlInput"]').value = note_object_data.content_url;
                }

                // start the process of looking up the content
                var content_iframe = cont1.querySelector('[name="contentframe"]');
                //console.log("content_iframe: " );
                //console.log(content_iframe);
                // send message to background serviceworker and it will lookup the URL. This is to bypass any CORS issues
                // Send save request back to background
                // Stickynotes are always enabled when created.
                console.log("remote url: " + note_object_data.content_url);
                chrome.runtime.sendMessage({
                    message: {
                        "action": "simple_url_lookup",
                        "url": note_object_data.content_url
                    }
                }).then(function (response) {
                    //console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
                    // render content of ifram based on this
                    //console.log(getYellowStickyNoteRoot(event.target));
                    setContentInIframe(content_iframe, response);

                    //set scroll position
                    var framenote_scroll_y = "0";
                    if (note_object_data.framenote_scroll_x !== undefined) {
                        framenote_scroll_x = note_object_data.framenote_scroll_x;
                        cont1.setAttribute("framenote_scroll_x", framenote_scroll_x);
                    }
                    var framenote_scroll_y = "0";
                    if (note_object_data.framenote_scroll_y !== undefined) {
                        framenote_scroll_y = note_object_data.framenote_scroll_y;
                        cont1.setAttribute("framenote_scroll_y", framenote_scroll_y);
                    }
                    console.log("framescrollPosition: ", framenote_scroll_x, framenote_scroll_y);
                    content_iframe.contentWindow.scrollTo(scrollPosition.x, framenote_scroll_y);

                    resolve(cont1);
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
                const canvas = cont1.querySelector('canvas[name="canvas"]');
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
            prepareCanvasNoteForDrawing(cont1);
            resolve(cont1);

        } else {
            // "regular" yellow note type, use this as the default but type="yellownote should be set regardless"
            console.debug("yellownote note type");
            // insert the note metatdata and other permanent content
            if (note_object_data.hasOwnProperty("selection_text")) {
                try {
                    cont1.querySelector('input[type="hidden"][name="selection_text"]').replaceChildren(document.createTextNode(b64_to_utf8(note_object_data.selection_text)));
                } catch (e) {
                    console.error(e);
                    cont1.querySelector('input[type="hidden"][name="selection_text"]').replaceChildren(document.createTextNode(""));
                }
                cont1.querySelector('input[type="hidden"][name="encoded_selection_text"]').replaceChildren(document.createTextNode(note_object_data.selection_text));
            }
            if (note_object_data.hasOwnProperty("selection_text")) {
                try {
                    cont1.querySelector('input[type="hidden"][name="encoded_selection_text"]').replaceChildren(document.createTextNode(note_object_data.selection_text));
                } catch (e) {
                    console.error(e);
                    cont1.querySelector('input[type="hidden"][name="selection_text"]').replaceChildren(document.createTextNode(""));

                }
                cont1.querySelector('input[type="hidden"][name="encoded_selection_text"]').replaceChildren(document.createTextNode(note_object_data.selection_text));
            }

            // insert the displayed text(html) content that consitute the message itself
            try {
                if (note_object_data.hasOwnProperty("message_display_text")) {
                    console.debug(cont1.querySelector('[name="message_display_text"]'));
                    const message_html = b64_to_utf8(note_object_data.message_display_text);
                    console.debug(message_html);

                    //cont1.querySelector('[name="message_display_text"]').replaceChildren(document.createTextNode(b64_to_utf8(note_object_data.message_display_text)));
                    console.debug(cont1.querySelector('[name="message_display_text"]').innerHTML );
                    cont1.querySelector('[name="message_display_text"]').innerHTML = message_html;
                    console.debug(cont1.querySelector('[name="message_display_text"]').innerHTML );

                }else{
                    console.debug("no message_display_text attribute defined");
                }
            } catch (e) {
                console.error(e);
            }

            console.debug(JSON.stringify(creatorDetails));
            console.debug(cont1.querySelector('td[name="topbar_filler"]'));
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

            console.debug("8.0.3");

            // set up the drop-down menu for distribution lists/feeds
            // pre-select the distribution list drop down menu
            // only do this for note where the authenticated user is the note owner
            if (isOwner) {
                const dl_container = cont1.querySelector('[name="distributionlistdropdown"]');

                // check if the note already has a distributionlist assigned to it
                if (!isUndefined(note_object_data.distributionlistid) && note_object_data.distributionlistid != undefined) {
                    console.debug("there is a distribution list assigned to this note already: " + note_object_data.distributionlistid);

                    try {
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
                    } catch (f) {
                        console.error(f);
                    }
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
                // });
            }
            //console.debug(cont1.innerHTML)
            resolve(cont1);
        }
    });
}


function setNoteColor(creatorDetails, cont1) {
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
    console.log("box_background" + box_background);

    setBackground(box_background, cont1);
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


function createNoteHeader(note_object_data, note_root, creatorDetails, isOwner, newNote) {
    console.debug("createNoteHeader.start");
    console.debug(note_object_data);
    console.debug(note_root);
    console.debug(creatorDetails);
    console.debug(isOwner);
    console.debug(newNote);


    var headerhtml = "";

    var feed_link_target = "";

    var creator_link_target = "";
    var display_text = "";

//    if (isOwner) {
//        creator_link_target = "https://www.yellownotes.cloud/pages/my_notes.html?noteid=" + note_object_data.creatorid;
//    } else {
//        creator_link_target = 'https://www.yellownotes.cloud/pages/my_subscriptions.html?distributionlistid=' + note_object_data.distributionlistid;
//    }
    creator_link_target = 'https://www.yellownotes.cloud/pages/publicprofile.html?creatorid=' + note_object_data.creatorid;

    console.debug( "creator_link_target: " + creator_link_target   );

  
    try{

        console.debug(note_root.querySelector('[name="creator_link_target"]'));
        note_root.querySelector('[name="creator_link_target"]').setAttribute("href", creator_link_target);
    }catch(e){
        console.error(e);
    }
    if (isOwner) {
        // the owner will see a more tools-rich version of the distributionlist page
    feed_link_target = 'https://www.yellownotes.cloud/pages/view_own_distributionlist.html?distributionlistid=' + note_object_data.distributionlistid;
    }else{
        feed_link_target = 'https://www.yellownotes.cloud/pages/view_distributionlist.html?distributionlistid=' + note_object_data.distributionlistid;

    }
    console.debug( "feed_link_target: " + feed_link_target   );


    // check if there is a brand (with a possible logo) associated with the note
    if (isOwner) {
        if (note_object_data.distributionlistname != undefined) {
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
        console.log("no creator details, consequently no banner image")
        // no creator details, therefore no banner image
        // There is no option for setting image at the level of the feed or the individial note at this time
    }

if (creatorDetails.note_display_name != undefined) {
    const topbarcreatordisplayname = note_root.querySelector('[name="creator_note_display_name"]');
    console.debug(topbarcreatordisplayname);
    topbarcreatordisplayname.replaceChildren(document.createTextNode(creatorDetails.note_display_name));

    topbarcreatordisplayname.setAttribute("href", creator_link_target);

}
// if there is abannerimage defined for this user, put it in the creator icon field
    if (creator_banner_image != "") {

        note_root.querySelector('[name="creator_icon"]').setAttribute("src", creator_banner_image);
    
    }else{
        // leave default icon in place  
    }


// set the link to the feed page
try{
   // if (note_object_data.distributionlistname != undefined) {
        const topbar_feed_link_target = note_root.querySelector('[name="feed_link_target"]');
        console.debug(topbar_feed_link_target);
        topbar_feed_link_target.replaceChildren(document.createTextNode("feed: " + note_object_data.distributionlistname));
        topbar_feed_link_target.setAttribute("href", feed_link_target);
   // }
}catch(e){
    console.error(e);
}

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

/**
 * 

* create bottom bar of the note. This bar is only visible/accessible to those wit hediting priviliges on the note (owner/creator) 

* @param {*} cont1 
 * @param {*} creatorDetails 
 * @param {*} isOwner 
 * @param {*} newNote 
 * @returns 
 */
function createNoteFooter(note_object_data, cont1, creatorDetails, isOwner, newNote) {
    console.debug("createNoteFooter.start");
    // only do this for the note owner (and later administrator and some other roles)
    if (isOwner) {
console.debug(note_object_data);
console.debug(cont1);

// the enable checkbox should be set(or unset) according to the note object data
if (note_object_data.hasOwnProperty("enabled")) {
    console.debug(note_object_data.enabled);
    const enablecheckbox = cont1.querySelector('input[type="checkbox"][name="enabled_status"]');
console.debug(enablecheckbox);
if (note_object_data.enabled_status == 1) {
enablecheckbox.setAttribute("checked","true");
}else{  

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

                    resolve(null);
                } catch (e) {
                    console.error(e);
                }
            });

        } else {
            console.debug("calling: get_distributionlist");
            get_distributionlist().then(function (response) {
                console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
                // at the top of the list add the option of not sharing the note with any distribution list/feeds
                const option0 = document.createElement('option');
                option0.value = '';
                option0.textContent = 'do not share';
                dl_container.appendChild(option0);
       //         console.debug(dl_container.outerHTML );
       //         console.debug(dl_container.innerHTML );
        
                response.forEach(item => {
                    console.log(item);
                    const option = document.createElement('option');
                    option.value = item.distributionlistid;
                    option.textContent = `${item.name} ${item.description}`;
                    dl_container.appendChild(option);
                });
          //      console.debug(dl_container.outerHTML );
          //      console.debug(dl_container.innerHTML );
                        resolve(null);
            });
        }
    });
}else{
// if the user is not the owner of the note, do not show the footer
// return a promise that resolves to null
return new Promise(function (resolve, reject) {
    resolve(null);
});

}
}

function prepareCanvasNoteForDrawing(node_root) {
    console.log("prepareCanvasNoteForDrawing.start");
    console.log(node_root);
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
        console.log('Line type:', lineTypeSelect.value);
        drawSampleLine(ctx, lineTypeSelect.value, ctx.strokeStyle, lineWidthSelect.value);
    });

    //controlsCell.appendChild(lineTypeSelect);

    // Button to save canvas as PNG
    //const saveButton = node_root.createElement('button');
    //saveButton.textContent = 'Save as PNG';
    const saveButton = node_root.querySelector('[name="save-button"]');

    saveButton.addEventListener('click', function () {
        const dataURI = canvas.toDataURL('image/png');
        console.log('Image saved:', dataURI);
        // Send dataURI to background script (example)
        chrome.runtime.sendMessage({
            action: 'saveImage',
            imageDataURI: dataURI
        }, function (response) {
            console.log('Image saved:', response);
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

const default_box_width = 250;
const default_box_height = 250;

function hexToRGB(hex) {
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
    console.debug("# setComponentVisibility.start " + visibility);
    console.debug(note);
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
            note.querySelector('table[name="whole_note_table"]').style.height = note.getAttribute("box_height");
        } else {
            console.debug("note owner? true");
            note.querySelector('table[name="whole_note_table"]').style.height = (parseInt(note.getAttribute("box_height")) + note_owners_control_bar_height) + "px";

        }

    }

}

function attachEventlistenersToYellowStickynote(note_root, isOwner, isNewNote) {
    console.log("attachEventlistenersToYellowStickynote.start");

    console.debug("7.7.1");
    console.debug(note_root);
    console.debug(isOwner);
    console.debug(isNewNote);
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
    const note_type = note_root.getAttribute("note_type");
    console.debug("calling note type-specific procedures (for " + note_type + ")");
    if (note_type == "plaintext") {
        if (isNewNote  ){
        // make the message in the textarea touch-n-go
        prepareNewTextNoteEventlistener(note_root);
        }
    } else if (note_type == "plainhtml") {
        if (isNewNote  ){
            // make the message in the textarea touch-n-go
        prepareNewTextNoteEventlistener(note_root);
        }
    } else if (note_type == "yellownote") {
        if (isNewNote  ){
            // make the message in the textarea touch-n-go
        prepareNewTextNoteEventlistener(note_root);
        }
    } else if (note_type == "capture_note") {
        prepareCaptureNoteEventlistener(note_root, info);
    } else if (note_type == "canvas") {

        attacheCanvasEventlisteners(note_root);
    } else if (note_type == "webframe") {
        console.debug("webframe");
        //
    }

    console.log("attachEventlistenersToYellowStickynote.end");
}

/**
 * get the root node of a yellownote DOM given any subsidiary node
 * @param {*} currentElement
 * @returns
 */
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
    console.debug(event.target);
    const isChecked = event.target.checked;
    // stop clicking anything behind the button
    event.stopPropagation();
    try {
        var note_root = getYellowStickyNoteRoot(event.target);
        var noteid = note_root.getAttribute("noteid");
        if (isChecked) {
            console.log("Checkbox is checked");
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
            console.log("Checkbox is unchecked");
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
    console.debug("preparePlainNoteEventlistener.start");
    // make the message in the textarea touch-n-go
    try {
        // Grab the textarea element
        const textarea = note_root.querySelector('[name="message_display_text"]');
        console.log(textarea);
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
    console.debug("prepareCaptureNoteEventlistener.start");
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
    console.log(img);
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

function setBackground(newBackgroundRGB, note_root) {
    console.debug("browsersolutions ### setBackground to " + newBackgroundRGB);
    // Get all elements in the note_root
    const allElements = note_root.querySelectorAll('*');

    // Iterate over each element
    allElements.forEach(element => {
        // Check if the element has a style attribute that includes 'background'
        if (element.style && element.style.background) {
            // Update the background style to the new value
            //console.log(element);
            element.style.backgroundColor = newBackgroundRGB;
            //console.log(element);

        }
    });
}

// return a drop down html list of all available distribution lists
function get_distributionlist() {
    console.debug("# get_distributionlist");
    return new Promise(function (resolve, reject) {
        try {
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
        } catch (e) {
            console.log(e);
            reject();
        }
    });
}

function isUndefined(variable) {
    return typeof variable === 'undefined';
}

function create_stickynote_node(note_object_data, html_note_template, html_notetype_template, creatorDetails, isOwner, newNote) {
    console.log("create_stickynote_node.start");
    return new Promise(function (resolve, reject) {
        console.debug(note_object_data);
        //console.debug(html_note_template);
        //console.debug(html_notetype_template);
        console.debug(creatorDetails);
        console.debug(isOwner);
        console.debug(newNote);
        // create the "wrapping" container that hold the DOM-structure of the note

        var cont1;
        console.debug("calling create_yellownote_DOM");
        create_yellownote_DOM(html_note_template, html_notetype_template, note_object_data.note_type, isOwner, newNote).
        then(function (response) {
            cont1 = response;
            //console.debug(cont1.outerHTML);
            // if the note is new, there is no noteid yet
            if (newNote) {
                console.debug("new note, not yet a noteid");
                cont1.setAttribute("newNote", "true");
                // the note is new so the note has status automatically set to active - not that that means anything at that stage
                cont1.setAttribute("note_active_status", 1);
            } else {
                console.debug("not a new note");
                cont1.setAttribute("noteid", note_object_data.noteid);
                // set note active status
                if (!isUndefined(note_object_data.status) && note_object_data.status != undefined) {
                    cont1.setAttribute("note_active_status", note_object_data.status);
                }

            }

            if (!isUndefined(note_object_data.distributionlistid) && note_object_data.distributionlistid != undefined) {
                cont1.setAttribute("distributionlistid", note_object_data.distributionlistid);
            }

            //cont1.appendChild(create_note_table(note_object_data,note_template));

            // render a webframe note


            // render a canvas note


            // render a plainhtml note
            console.debug("calling createNoteMiddleBody");
            createNoteMiddleBody(note_object_data, cont1, resolve, creatorDetails, isOwner, newNote).
            then(function (response) {
                console.debug("createNoteMiddleBody.complete");
                console.debug(response);
                //    resolve(response);
                console.debug("calling createNoteFooter");
                return createNoteFooter(note_object_data, cont1, creatorDetails, isOwner, newNote);
            }).then(function (response) {
                console.debug("createNoteFooter.complete");
                console.debug("calling createNoteHeader");
                return createNoteHeader(note_object_data, cont1, creatorDetails, isOwner, newNote);
            }).then(function (response) {
                console.debug("createNoteHeader.complete");

                // attach event lsiteners to the note
                //console.debug("calling attachEventlistenersToYellowStickynote");
                //attachEventlistenersToYellowStickynote(cont1, isOwner, newNote);
                //console.debug(noteForm);

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
                setNoteColor(creatorDetails, cont1);

                // set note size
                // set default values first
                // then replace those values with more specific ones if they are available/applicable

                // set defaults
                var box_width = default_box_width + "px";
                var box_height = default_box_height + "px";

                // check for template-specific values - not implemented yet


                // check for brand/organization-specific values - not implemented yet

                try {
                    // check for creator specific values
                    if (creatorDetails.box_width) {
                        box_width = creatorDetails.box_width;
                        console.debug("creator's note_properties has box_width, use it " + box_width);
                    }
                } catch (e) {
                    console.error(e);
                }

                try {
                    if (creatorDetails.box_height) {
                        box_height = creatorDetails.box_height;
                        console.debug("creator's note_properties has box_width, use it " + box_height);
                    }
                } catch (e) {
                    console.error(e);
                }
                // check for feed-specific values - not implemented yet


                // check for note specific values


                cont1.setAttribute("box_height", box_height);
                cont1.setAttribute("box_width", box_width);

                console.debug(cont1);

                resolve(cont1);
            });
        });
    });
}
