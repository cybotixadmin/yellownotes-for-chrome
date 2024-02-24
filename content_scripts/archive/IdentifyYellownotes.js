/*
 * This content script runs in pages and looks 
 *  for the presence of serialized YellowStickyNote objects and presents them in their graphic form.
 * The serialized data will contain what is required for rendering (size, color) but any
 *  position instructions are ignored. 
 * 
 * 
 * 

 *
 */

// this global variable indicated whether or not any rule pertain to the URL
var ruleHit = false;
// this global variable indicated whether or not any
var ruleWrite = false;

console.debug("Yellownotes content script running");


function RevealURL(request, sender, sendResponse) {

    var replacementStr = request.Paste_GloveboxAcceptedSecureKeyOfferToken_text;
    console.log("JSON(request): " + JSON.stringify(request));

    try {
        // if (replacementStr){
        var targetElementId = "";
        targetElementId = request.targetElementId;

        ruleHit = false;
        var linkURL = "";
        linkURL = request.linkURL;
        var linkText = "";
        linkText = request.linkText;

        var true_destination_url = "";
        true_destination_url = request.true_destination_url;

        // if the link has the same domain as the current domain, also search
        // using a server relative path

        // locate the DOM node actually right-clicked by the user
        var node = null;

        // in the absence of broad support for targetElementId() on non-Firefox
        // browsers, use xpath as a work-around.
        // this must be rewritten for non-firefox browsers

        node = browser.menus.getTargetElement(targetElementId);

        // attempt to uniquely identify the link selected with a right click by
        // searching for one that has the same link and text.
        // search for both server-relative and fully qualified links

        console.log(linkURL);
        console.log("#### " + true_destination_url);

        // create window for user to see, and click in
        setup_dialog_window(node, true_destination_url, linkURL);

        // handleError(url);

    } catch (e) {
        console.log(e);
    }

    return Promise.resolve({
        response: {
            "selection_html": "ok"
        }
    });
}
// }


/*
 * When this function is called, the text has given a hit on the loosest regxp to match any number of stickynote text serializations
 *
 *
 * */

function showStickyNote(node) {
    console.debug("# showStickyNote");
    console.debug(node);
    console.debug(node.textContent);
    try {
        // count occurences of pattern in text node
        //var yellownote_regexp = new RegExp(/yellownote=/g);
        //console.debug(yellownote_regexp);
        //console.debug(yellownote_regexp.test(node.textContent));

        var token = "";

        //var yellownote_regexp2 = new RegExp(/yellownote=.*(?!yellownote=).*=yellownote/g);
        //console.debug(yellownote_regexp2);
        //console.debug(yellownote_regexp2.test(node.textContent));
        //console.debug(node.textContent.match(yellownote_regexp2));

        //var yellownote_regexp4 = new RegExp(/yellownote=.*(?=yellownote=).*=yellownote/g);
        //console.debug(yellownote_regexp4);
        //console.debug(yellownote_regexp4.test(node.textContent));
        //console.debug(node.textContent.match(yellownote_regexp4));

        // this pattern may swallow up up multiple separate sticynote token texts but it is a faster match
        //var yellownote_regexp3 = new RegExp(/yellownote=.*=yellownote/g);
        // console.debug(yellownote_regexp3);
        //  console.debug(yellownote_regexp3.test(node.textContent));
        //console.debug(node.textContent.match(yellownote_regexp3));

        // determine if where are more than one


        var one = getStickyNotesFromString(node.textContent);

        console.debug(one);
        console.debug(JSON.stringify(one));

        if (one.length > 0) {
            // at least one stickynote was found in the text

            for (var i = 0; i < one.length; i++) {
                console.debug(one[i]);

                
                // grab serialized token
                // array conains token and starting position of token inside the larger text node
                token = one[i][1];
                var tokenPosition = one[i][0];
                console.debug(token);
                console.debug(tokenPosition);

                
                
                // first check if this serialized notes have already been "processed" by looking for a preceding yellownote node
                // The presence of such a node would indicate that this procedure has already been carried out
                // If so, two things must be true
                // The starting position is 0 (start at the beginning of the text node)
                // preceding node is yellownote element
                
                //if (tokenPosition == 0){
                	// if token position is 0 (zero), check preceding node
if (node.previousSibling){
	console.debug( typeof node.previousSibling );
	console.debug("True");
}else{
	console.debug("False");
	}
                	console.debug( node.previousSibling );
                	
                //}
                
                

                
                // The stickynode text needs to be wrapped in tags.
                // Therefore 
                // 1 split the text node at the beginning if the stickynode text
                // 2 insert a child node at this point
                // 3 add the nodes text to this child node
                // 4 split the remainder of the textnode at the end of the stickynode text - thereby creating 3 sibling text nodes where there before was just one. 
                // 5 delete the middle textnode containing the node text (which was added to a sub node in step 3. 
                
                // 1 split string on token start
                const newNode = node.splitText(tokenPosition);
                console.debug(newNode);
                
                
                if (newNode){
                	console.debug( typeof newNode );
                	console.debug("True");
                }else{
                	console.debug("False");
                	}
                                	console.debug( newNode);
                
                // 3
                var tokenNode = document.createElement("YELLOWSTICKYNOTE"); 
                console.debug(tokenNode);
                var textnode = document.createTextNode(token);  // Create a text node
                tokenNode.appendChild(textnode);
                
                // 2
                const n = node.parentNode.insertBefore(tokenNode,newNode);
                
                console.debug(n);
                //  console.debug(node.parentNode);

                console.debug(yellowstockynote_text_opening.length);
                console.debug(yellowstockynote_text_closing.length);
                console.debug(token.length);
                
                // 4 split string on token end
                const newNode2 = newNode.splitText(12);
                newNode2.remove();
                //console.debug(newNode);
                //console.debug(newNode2);
                if (newNode2){
                	console.debug( typeof newNode2 );
                	console.debug("True");
                }else{
                	console.debug("False");
                	}
                console.debug( newNode2);
                

                // de-serialize the yellow note
                var stickynote = deserialize_note(token);
                console.debug(stickynote);

                // proceed to render this note

                var note_ob = create_stickynote_node(stickynote);

                console.debug(note_ob);
                console.debug(tokenNode);
                
                // place note on page
                placeStickyNote(stickynote,tokenNode);

                // use tokenNode as anchor
                
                //ser_json_note = JSON.stringify(out).replace(/":"/g,"__del__").replace(/","/g,"__sep__").replace(/\{"/g,"__left__").replace(/"\}/g,"__right__");

                //note_json_text = token.replace(/__right__/g, "\"\}").replace(/__left__/g, "\{\"").replace(/__del__/g, "\":\"").replace(/__sep__/g, "\",\"")

            }

        }

    } catch (e) {
        console.error(e)
    }

}




function DISABLEcreate_stickynote_node(note_object_data) {

    console.debug(JSON.stringify(note_object_data));

    var cont1 = document.createElement('container');

    //<!--<link rel="stylesheet" type="text/css" href="message-box.css">-->


    var fullURLToCSS = browser.runtime.getURL("css/yellownote.css");

    var link1 = document.createElement('link');
    link1.setAttribute("rel", 'stylesheet');
    link1.setAttribute("type", 'text/css');
    link1.setAttribute("href", fullURLToCSS);
    cont1.appendChild(link1);

    cont1.setAttribute("class", "yellownotecontainer");
    // use this attribute to mark this as a stickynote object
    cont1.setAttribute("type", 'yellownote');

    cont1.appendChild(create_note_table(note_object_data));

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



function DISABLEcreate_note_table(note_object_data) {
    // data contains the information to place in the form fields, if any

    try {
        console.debug(JSON.stringify(note_object_data));

        // the yellow note is a html table with two columns and three rows

        // Top row, first cell has explanations (if any)
        // Top row, second cell has control buttons

        // Middle row, first cell spanning two columns, has textarea (inside a form) for writing (textarea has a scroll bar, which will be needed)

        // Bottom row contain action buttons:
        // delete, save, dismiss

        var tab1 = document.createElement('table');
        tab1.setAttribute("class", "yellownote_table");

        // attach event listener to whole table
        tab1.addEventListener("click", function (event) {
            console.debug("whole note clicked");

            // highlight the text the note refers to
        });

        // first row
        var tr1 = document.createElement('tr');
        //tr1.setAttribute("class", "top_row");

        tr1.setAttribute("style", "height: 20px; z-index: 3;");

        var td11 = document.createElement('td');
        td11.appendChild(document.createTextNode('write your notes here: '));

        //td11.setAttribute("class", "yellow_note_cell");

        td11.setAttribute("style", "height: 20px;border: solid 0px;border-color: rgba(255, 255, 0, 1.0);padding: 0px;position: relative;z-index: 3;text-align: left;");

        tr1.appendChild(td11);

        // top-right corner actions in this cell

        var td12 = document.createElement('td');

        // close icon
        // create an svg with the typical "X" for window close
        const closeIconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        closeIconSvg.setAttribute("width", "20");
        closeIconSvg.setAttribute("height", "20");

        var g1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g1.setAttribute("transform", "matrix(1.00 0 0 1 0 0)");

        var line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line1.setAttribute("style", "stroke: rgb(0,0,0); stroke-width: 3; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;");
        line1.setAttribute("x1", "2");
        line1.setAttribute("y1", "2");
        line1.setAttribute("x2", "18");
        line1.setAttribute("y2", "18");

        g1.appendChild(line1);

        closeIconSvg.appendChild(g1);

        var g2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g2.setAttribute("transform", "matrix(-1.00 0 0 1 20 0)");

        var line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line2.setAttribute("style", "stroke: rgb(0,0,0); stroke-width: 3; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;");
        line2.setAttribute("x1", "2");
        line2.setAttribute("y1", "2");
        line2.setAttribute("x2", "18");
        line2.setAttribute("y2", "18");

        g2.appendChild(line2);

        closeIconSvg.appendChild(g2);
        td12.appendChild(closeIconSvg);
        // close action - complete


        //        td12.appendChild(document.createTextNode('close(X)'));
        td12.appendChild(closeIconSvg);

        //td12.setAttribute("class", "yellow_note_cell");
        td12.setAttribute("style", "height: 20px;border: solid 0px;border-color: rgba(255, 255, 0, 1.0);padding: 0px;position: relative;z-index: 3;text-align: right;");

        // copy note to clipboard
        // icon and event handler
        const copyIconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        copyIconSvg.setAttribute("version", "1.1");
        copyIconSvg.setAttribute("width", "30");
        copyIconSvg.setAttribute("height", "20");

        var g21 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g21.setAttribute("transform", "matrix(1 0 0 1 0 7.00)");

        var text21 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text21.setAttribute("style", "stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1; white-space: pre;");
        text21.setAttribute("font-family", "'Open Sans', sans-serif");
        text21.setAttribute("font-size", "10");
        text21.setAttribute("font-style", "normal");
        text21.setAttribute("font-stretch", "200% ");
        text21.setAttribute("font-weight", "bold");
        //text21.setAttribute("lengthAdjust", "spacingAndGlyphs");

        // text21.appendChild(document.createTextNode("Copy"));


        var tspan21 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan21.appendChild(document.createTextNode("Copy"));
        tspan21.setAttribute("x", "0.00");
        tspan21.setAttribute("y", "10.00");
        tspan21.setAttribute("style", "font-family: 'Oswald', sans-serif;");
        text21.appendChild(tspan21);

        g21.appendChild(text21);

        copyIconSvg.appendChild(g21);

        // create a table in the cell to ensure proper icon arrangement

        var topLeftButtonTable = document.createElement('table');
        topLeftButtonTable.setAttribute("border", "0");

        topLeftButtonTable.setAttribute("cellspacing", "0");
        topLeftButtonTable.setAttribute("cellpadding", "0");

        topLeftButtonTable.setAttribute("style", "border: 0px;padding: 0px;");

        var topLeftButtonTr = document.createElement('tr');
        topLeftButtonTr.setAttribute("border", "0");

        var topLeftButtonTd1 = document.createElement('td');
        //topLeftButtonTd1.setAttribute("border", "0");
        topLeftButtonTd1.setAttribute("class", "icon");
        topLeftButtonTd1.appendChild(copyIconSvg);
        topLeftButtonTd1.addEventListener("click", function (event) {
            copy_note_to_clipboard(event);
        });
        topLeftButtonTr.appendChild(topLeftButtonTd1);

        var topLeftButtonTd2 = document.createElement('td');
        topLeftButtonTd2.setAttribute("class", "icon");
        topLeftButtonTd2.appendChild(closeIconSvg);
        topLeftButtonTd2.addEventListener("click", function (event) {
            close_note(event);
        });

        topLeftButtonTr.appendChild(topLeftButtonTd2);

        topLeftButtonTable.appendChild(topLeftButtonTr);
        td12.appendChild(topLeftButtonTable);

        tr1.appendChild(td12);
        tab1.appendChild(tr1);

        // second row
        var tr2 = document.createElement('tr');
        tr2.setAttribute("class", "form_row");

        // user notes - the main part of the yellow notes
        var form1 = document.createElement('form');

        // store the selection text to which the note is linked

        var input1 = document.createElement('input');
        input1.setAttribute("type", "hidden");
        input1.setAttribute("name", "selection_text");
        input1.appendChild(document.createTextNode(note_object_data.selection_text));

        form1.appendChild(input1);

        // capture local url
        var input2 = document.createElement('input');
        input2.setAttribute("type", "hidden");
        input2.setAttribute("name", "url");

        input2.appendChild(document.createTextNode(window.location.href));
        console.debug(window.location.href);
        form1.appendChild(input2);

        var input6 = document.createElement('input');
        input6.setAttribute("type", "hidden");
        input6.setAttribute("name", "uuid");
        input6.appendChild(document.createTextNode(note_object_data.uuid));
        form1.appendChild(input6);

        var input3 = document.createElement('input');
        input3.setAttribute("type", "hidden");
        input3.setAttribute("name", "createtime");
        input3.appendChild(document.createTextNode(note_object_data.createtime));

        form1.appendChild(input3);

        var input5 = document.createElement('input');
        input5.setAttribute("type", "hidden");
        input5.setAttribute("name", "lastmodifiedtime");
        input5.appendChild(document.createTextNode(note_object_data.lastmodifiedtime));
        form1.appendChild(input5);

        var input4 = document.createElement('input');
        input4.setAttribute("type", "hidden");
        input4.setAttribute("name", "enabled");
        if (typeof note_object_data.enabled != undefined) {
            input4.appendChild(document.createTextNode(note_object_data.enabled));
        } else {
            // default value if undefined, is enabled(=true)
            input4.appendChild(document.createTextNode("true"));
        }
        form1.appendChild(input4);

        //var input7 = document.createElement('input');
        //input7.setAttribute("type", "hidden");
        //input7.setAttribute("name", "posx");
        //input7.appendChild(document.createTextNode(note_object_data.posx));
        //form1.appendChild(input7);

        //var input8 = document.createElement('input');
        //input8.setAttribute("type", "hidden");
        //input8.setAttribute("name", "posy");
        //input8.appendChild(document.createTextNode(note_object_data.posy));
        //form1.appendChild(input8);


        var textarea1 = document.createElement('textarea');

        textarea1.appendChild(document.createTextNode(note_object_data.message_display_text));

        textarea1.setAttribute("name", "message_display_text");
        textarea1.setAttribute("class", "yellow");
        textarea1.setAttribute("contenteditable", "true");
        // attach listener to detect changes so a "save" button can appear

        form1.appendChild(textarea1);

        var td21 = document.createElement('td');
        td21.setAttribute("class", "yellow_note_cell");

        td21.appendChild(form1);

        td21.setAttribute("colspan", "2");

        tr2.appendChild(td21);

        //	tr2.appendChild(td22);
        tab1.appendChild(tr2);

        // third row
        var tr3 = document.createElement('tr');
        tr3.setAttribute("class", "button_row");

        var td31 = document.createElement('td');
        td31.setAttribute("class", "button_cell");

        tr3.appendChild(td31);

        var td32 = document.createElement('td');
        tr3.appendChild(td32);

        tab1.appendChild(tr3);

        return tab1;
    } catch (e) {
        console.error(e)
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



function placeStickyNote(note_obj,anchorNode) {

    // contenttype
    // permitted values: text, html, embeded, linked
console.debug(anchorNode);
console.debug(typeof anchorNode);

// if (typeof note_obj == 'undefined') {

	console.debug(one);

    if (typeof note_obj == 'undefined') {
        // nothing to do
    } else {

        console.debug("note_obj JSON(note_obj): " + JSON.stringify(note_obj));

        // if there is an achor node, the note should be place next to it. Ignore selection_text and coordinates.
        
        if (typeof note_obj == "object") {
        	
        	

            var newGloveboxNode = create_stickynote_node(note_obj);
            newGloveboxNode.addEventListener('mouseenter',
                function () {
                console.debug("### mouseover");
                // add functionality to display selection linked to this note

            });
        	
            let insertedNode = anchorNode.parentNode.insertBefore(newGloveboxNode, anchorNode);
            console.debug(insertedNode);

            
            
            
            
            // make note movable
            dragStickyNote(insertedNode);

            // make anchor node not visible
            
        	
        	
        }else{
        	
        
        
        if (note_obj.selection_text == "") {
            // if no selection_text, only position co-ordinates can place the note on screen. The node object is placed at document root

            // check if note contains position coordinates/parameters. If so, try to use them to place the note
            var valid_stickynote_position_coordinate_regexp = new RegExp(/[0-9][0-9]*/);

            var posx = "";

            posx = note_obj.posx;

            var posy = "";

            posy = note_obj.posy;

            console.debug("using posx:" + posx + " posy:" + posy);

            console.debug(valid_stickynote_position_coordinate_regexp.test(posx));
            console.debug(valid_stickynote_position_coordinate_regexp.test(posy));

            try {
                var newGloveboxNode = create_stickynote_node(note_obj);
                newGloveboxNode.addEventListener('mouseenter',
                    function () {
                    console.debug("### mouseover");

                });

                // root
                var doc = window.document;
                //console.debug(doc);
                var root_node = doc.documentElement;

                console.debug(root_node);

                const one = root_node.appendChild(newGloveboxNode);
                console.debug(one);

                size_and_place_note(newGloveboxNode, note_obj)

                // Make the stickynote draggable:
                dragStickyNote(newGloveboxNode);

            } catch (e) {
                console.debug(e);
            }

        } else {

            // check if note contains position coordinates/parameters. If so, try to use them to place the note
            var valid_stickynote_position_coordinate_regexp = new RegExp(/[0-9][0-9]*/);

            var posx = "";

            posx = note_obj.posx;

            var posy = "";

            posy = note_obj.posy;

            console.debug("using posx:" + posx + " posy:" + posy);

            console.debug(valid_stickynote_position_coordinate_regexp.test(posx));
            console.debug(valid_stickynote_position_coordinate_regexp.test(posy));

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
                console.debug(doc.nodeName);
                // root
                var root_node = doc.documentElement;
                console.debug(root_node);

                whole_page_text = "";
                console.debug(traverse(doc.documentElement));
                console.debug("################################################");
                console.debug(whole_page_text);
                console.debug(textnode_map);

                console.debug(whole_page_text.replace(/\s/g, ""));
                //console.debug(selectionText.replace(/\s/g,""));
                // remove all whitespace before making attempt to place selection inside larger text


                console.debug("note: " + JSON.stringify(note_obj));
                // locate where this not goes.
                var uuid = note_obj.uuid;
                var selection_text = note_obj.selection_text;
                var message_display_text = note_obj.message_display_text;

                // start
                var start_range_node;
                var start_offset = 0;
                // end
                var end_range_node;
                var end_offset = 0;
                // using the position of the start of the selection text within the whole text, determine the start node where the selection begins


                var one = getDOMposition(textnode_map, selection_text);
                console.debug(one);

                console.debug(JSON.stringify(one));

                start_range_node = one.start_range_node;
                end_range_node = one.end_range_node;
                start_offset = one.start_offset;
                end_offset = one.end_offset;

                console.debug(start_range_node);
                console.debug(start_offset);

                console.debug(end_range_node);
                console.debug(end_offset);

                // create message box and anchor it
                //console.debug("1.1.3");
                // create html of tooltip
                //var it2 = document.createElement("div");

                //it2.setAttribute("class", 'xstooltip');

                var newGloveboxNode = create_stickynote_node(note_obj);
                newGloveboxNode.addEventListener('mouseenter',
                    function () {
                    console.debug("### mouseover");
                    // add functionality to display selection linked to this note

                });

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
                        newGloveboxNode.setAttribute("width", 250);
                        newGloveboxNode.setAttribute("heigth", 250);
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

                let notedRange = document.createRange();

                //start_offset = 10;
                //end_offset = 20;
                notedRange.setStart(start_range_node, start_offset);
                notedRange.setEnd(end_range_node, end_offset);

                // create a range to contain the selection specified in the stickynote

                console.debug(notedRange);
                console.debug(notedRange.toString());

                // make highlighting of the selected text pertaining to the sticky note
                var color = "#ffff00";

                var mark2 = document.createElement('span');
                mark2.setAttribute("style", "background-color: " + color + ";");
                notedRange.surroundContents(mark2);

                //it2.appendChild(newGloveboxNode);

                // insert the sticky note document into the main DOM just before the highlighted selection

                // insert the sticky note node immediately before the selection text it links too.

                let insertedNode = mark2.parentNode.insertBefore(newGloveboxNode, mark2);
                console.debug(insertedNode);

                // make note movable
                dragStickyNote(insertedNode);

                //console.debug("1.1.4");

            } catch (e) {
                console.debug(e);
            }
        }
        }

        return true;
    }
}




function goToYellowNoteOnLocation(event) {

    console.debug("# goToStickyNoteOnLocation");

    var url = event.target.parentNode.parentNode.querySelector('td[j_name="url"]').textContent.replace(/\s/g, "");
    console.debug(url);
    // lookup the URL and issue a redirect to that URL, into another tab

    var win = window.open(url, '_blank');
    console.debug(win);
    // move focus to the page
    win.focus();

    var object_id = event.target.parentNode.parentNode.getAttribute("object_id").replace(/\s/g, "");
    console.debug(object_id);

    // If you don't exclude the current tab, every search will find a hit on the
    // current page.


    // call content script on this tab (by calling background.jd, and have it call the content-script=

    // send message to background, to request a lookup of this note on the page where it is "located". 
    browser.runtime.sendMessage({
        stickynote: {
            "request": "lookup_stickynote_in_place",
            "stickynote_details": {
                "object_id": object_id
            }
        }
    }, function (response) {
        console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
    });

    // populate yellow notes on the tab

    // execute a search on the tab for the requested note using the uuid of the note.


}




/*
 * return array of arrays of stickynote tokens and their starting position within textnode
 * */
function getStickyNotesFromString(text) {

    var res = [];
    var token_text = "";
    // split string on token opener
    console.debug(text.indexOf(yellowstockynote_text_opening));
    console.debug(text.split(yellowstockynote_text_opening));
    var sp = text.split(yellowstockynote_text_opening);
    
    
    var pos = 0;
    console.debug(sp);
    for (var i = 0; i < sp.length; i++) {
        // compute starting position

        for (var j = 0; j < i; j++) {
            pos = pos + sp[j].length;
        }
        console.debug("position in string: " + pos);

        console.debug(sp[i]);
        console.debug(sp[j]);

        // Split again on token-closer
        // first check if it is even there
        console.debug(sp[i].indexOf(yellowstockynote_text_closing));
        
        // yellowstockynote_text_opening
        if (sp[i].indexOf(yellowstockynote_text_closing) > 0) {
            var sp2 = sp[i].split(yellowstockynote_text_closing);
            console.debug(sp2);
            token_text = sp2[0];

            console.debug("found (at pos="+ pos + ") token_text: " + token_text);

            res.push([pos, token_text]);
        }
    }
    //console.debug(ret);
    console.debug(JSON.stringify(res));
    return res;

}




// a concatenation of all visible text in the document
var all_page_text = "";


// contain node object and the position within overall text (white space removed)
var textnode_map = [];

//create a node array of text content nodes in document order
function traverse_text(elm) {
    // produce a string of all test concatenated
    //var text_str = "";
    // Produce an array of all nodes
    console.debug("#traverse");
console.debug(elm);
console.debug(elm.nodeType );
console.debug(elm.nodeType == Node.ELEMENT_NODE);
console.debug(elm.nodeType == Node.DOCUMENT_NODE   );

    if (elm.nodeType == Node.ELEMENT_NODE || elm.nodeType == Node.DOCUMENT_NODE) {
       console.debug("1.0.1");
       console.debug(elm);
console.debug(ignore(elm));
console.debug(elm.childNodes);
        // exclude elements with invisible text nodes
        if (ignore(elm)) {
            return
        }
        console.debug("1.0.2");
        console.debug(elm.childNodes);
        for (var i = 0; i < elm.childNodes.length; i++) {
            console.debug("1.0.2.1");
            // recursively call to traverse
            traverse_text(elm.childNodes[i]);
        }

    }
    if (elm.nodeType == Node.TEXT_NODE) {
         console.debug("1.0.3");
        // exclude text node consisting of only spaces
        if (elm.nodeValue.trim() == "") {
            return
        }

        // elm.nodeValue here is visible text we need.
        //  console.log("##");
        //   console.log(elm.nodeValue);
        var start_position = all_page_text.length;
        all_page_text = all_page_text + elm.nodeValue.replace(/\s/g, "");
        var end_position = all_page_text.length;
        textnode_map.push([start_position, end_position, elm]);

    }
}



// browser.runtime.onMessage.addListener(RevealURL);

// setup onClick listener to remove tooltip window for any click.

function getAllVisibleText(node) {
    console.debug("# getAllVisibleText");
    console.debug(node);
    let text = '';

    function isNodeVisible(node) {
        // Check if the node is visible
        const style = getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
        
        // Additional check to ensure the node is in the viewport
        const rect = node.getBoundingClientRect();
        if(rect.bottom < 0 || rect.right < 0 || rect.top > window.innerHeight || rect.left > window.innerWidth) return false;
        
        return true;
    }

    function traverseNodes(node) {
        // Check if the node itself is visible
        if (node.nodeType === Node.ELEMENT_NODE && !isNodeVisible(node)) return;

        // If it's a text node and it's not empty, append the text to the string
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') text += node.textContent.trim() + ' ';

        // Traverse the child nodes
        for (const child of node.childNodes) traverseNodes(child);
    }

    traverseNodes(node);
    return text;
}



/*
 * recursively go down the DOM tree below the specified node
 *
 */
function replaceLink(node) {
    try {
        console.debug("# replaceLink");
        //console.debug(node);

        if (node) {
            
            // recursively call to analyse child nodes
            
            for (var i = 0; i < node.childNodes.length; i++) {
                //console.debug("call childnodes");
                try {
                    replaceLink(node.childNodes[i]);
                } catch (f) {}
            }

            /*
             * Node.ELEMENT_NODE 	1 	An Element node like <p> or <div>.
            Node.ATTRIBUTE_NODE 	2 	An Attribute of an Element.
            Node.TEXT_NODE 	3 	The actual Text inside an Element or Attr.
            Node.CDATA_SECTION_NODE 	4 	A CDATASection, such as <!CDATA[[ … ]]>.
            Node.PROCESSING_INSTRUCTION_NODE 	7 	A ProcessingInstruction of an XML document, such as <?xml-stylesheet … ?>.
            Node.COMMENT_NODE 	8 	A Comment node, such as <!-- … -->.
            Node.DOCUMENT_NODE 	9 	A Document node.
            Node.DOCUMENT_TYPE_NODE 	10 	A DocumentType node, such as <!DOCTYPE html>.
            Node.DOCUMENT_FRAGMENT_NODE 	11 	A DocumentFragment node.
             *
             */

            if (node.nodeType == Node.ELEMENT_NODE || node.nodeType == Node.DOCUMENT_NODE) {
                // console.debug("1.0.1");

                // exclude elements with invisible text nodes
              //  if (ignore(node)) {
              //      return
              //  }
            }

            // if this node is a textnode, look for the
            if (node.nodeType === Node.TEXT_NODE) {
                // apply regexp identifying yellownote

                // exclude elements with invisible text nodes

                // ignore any textnode that is not at least xx characters long
                if (node.textContent.length >= 150) {

                    //console.debug("look for sticky note in (" + node.nodeType + "): " + node.textContent);
                    // regexp to match begining and end of a stickynote serialization. The regex pattern is such that multiple note objects may be matched.
                    var yellownote_regexp = new RegExp(/yellownote=.*=yellownote/);

                    if (yellownote_regexp.test(node.textContent)) {
                        console.debug("HIT");
                        // carry out yellow sticky note presentation on this textnode

                        showStickyNote(node);

                    }

                }
            }
        }
    } catch (e) {
        console.debug(e);
    }

}






console.debug(window.document.documentElement.innerText);


const elements = document.getElementsByTagName('*');
console.debug(elements);
  for (let i = 0; i < elements.length; i++) {
    let element = elements[i];
    for (let j = 0; j < element.childNodes.length; j++) {
      let node = element.childNodes[j];
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue;
        console.debug(text);
        const newText = text.replace(new RegExp(from, 'gi'), to);
        if (newText !== text) node.nodeValue = newText;
      }
    }
  }

traverse_text(document.documentElement);

console.debug("################################################");
console.debug(all_page_text);
console.debug(textnode_map);

const visibleText = getAllVisibleText(window.document.documentElement);
console.log(visibleText);

// Start the recursion from the body tag.


var doc = window.document
console.debug( doc);

var  body = doc.body,selection,range, bodyText;

console.debug(body);
//  console.debug(doc);
//   console.debug(doc.nodeName);
// root
var root_node = doc.documentElement;
console.debug(root_node);

// start analyzing the DOM (the page/document)

replaceLink(root_node);


//Now monitor the DOM for additions
//@see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver.
const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                console.debug("mutation observer");
                // This DOM change was new nodes being added. Run our substitution
                // algorithm on each newly added node.
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                	// temporarily disable change monitoring
                    //const newNode = mutation.addedNodes[i];
                    //replaceLink(newNode);
                }
            }
        });
    });
observer.observe(document.body, {
    childList: true,
    subtree: true
});


