/*
 * This JS is called then user has selected some html for action (encryption....) and it needs to be collected and sent to the plugin.
 * The call is made from background.js from a "browser.tabs.executeScript" statement coupled with a "browser.tabs.sendMessage".
 * executeScript sends the JS on the tab in question and makes the js a listener on the tab,
 * and sendMessage sends a message to this JS listener and the return data is the selected html.
 *
 * The selected data (text, html with or without embeded or linked data) is compressed and base64 encoded before being returned to background.js
 *
 */

console.debug("running CreateBlankYellowStickyNote.js");









function createBlankYellowStickyNote(request, sender, sendResponse) {

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

    var background_to_createBlankYellowStickyNote_sharedsecret = "Glbx_marker6";

    // Use the represence of the dummy value "Glbx_marker" in the request as a
    // insecure "shared secret" to try to ensure only request from the
    // background.js are accepted.
    // This must be improved.
    try {

        console.debug(request.createBlankYellowStickyNote);
        console.debug(request.createBlankYellowStickyNote == background_to_createBlankYellowStickyNote_sharedsecret);

        if (request.createBlankYellowStickyNote == background_to_createBlankYellowStickyNote_sharedsecret) {
            // create a blank yellow sticky not in the middle of thep age of a close to the cursors as possible.


            //var two = FindNext(selection_text);
            //console.debug(two);
           // console.debug(window);
            //console.debug(window.document);
            //console.debug(window.document.innerHTML);
            console.debug(window.document.toString());
            console.debug(window.document.textContent);

            // create the DOM object of sticky note

            try {
                var newGloveboxNode = create_new_stickynote("");
                console.debug(newGloveboxNode);
                newGloveboxNode.addEventListener('mouseenter',
                    function () {
                    console.debug("### mouseover");

                });

                // since there is no anchor text at this stage, place the object at the root of the document

                var doc = window.document;

                console.debug(doc);
                console.debug(doc.nodeName);
                // root
                var root_node = doc.documentElement;
                console.debug(root_node);

                root_node.appendChild(newGloveboxNode);

                // read screen dimension is order to position note

                console.debug(request.tab.width);
                console.debug(request.tab.height);

                console.debug(window.screen);
                console.debug(window);

                var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                newGloveboxNode.style.position = "absolute";

                // compute a location for where to place the note
                var posx,
                posy;
                posy = scrollTop + (request.tab.height / 2);
                console.debug(posy);
                newGloveboxNode.style.top = posy + 'px';

                posx = (request.tab.width / 2);

                console.debug(posx);
                newGloveboxNode.style.left = posx + 'px';

                try {
                    newGloveboxNode.setAttribute("posy", posy);
                    newGloveboxNode.setAttribute("posx", posx);
                    newGloveboxNode.setAttribute("box_width", 250);
                    newGloveboxNode.setAttribute("box_heigth", 250);
                } catch (e) {
                    console.debug(e);
                }

                // remove disable button - since it is not applicable for new sticky notes
                //console.debug(newGloveboxNode.querySelector("tr.button_row"));
                //console.debug(newGloveboxNode.querySelector("button.disable_button"));
                newGloveboxNode.querySelector("button.disable_button").remove();
                // remove delete button - since it is not applicable for new sticky notes
                //console.debug(newGloveboxNode.querySelector("tr.button_row"));
                //console.debug(newGloveboxNode.querySelector("button.disable_button"));
                newGloveboxNode.querySelector("button.delete_button").remove();
                
                
                // Make the stickynote draggable:
                dragStickyNote(newGloveboxNode);


            } catch (e) {
                console.error(e);
            }

        } else {
            console.debug("invalid request");
            // reject("invalid request");
            return false;
        }

    } catch (e) {
        console.debug(e);
    }
    return true;

}

browser.runtime.onMessage.addListener(createBlankYellowStickyNote);
