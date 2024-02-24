console.debug("RenderEmbeddedNotes.js: start")

/*
Scan the text of a page and create a map of text nodes to their position in the text.
Examine thext for prescense of any serialized yellow sticky note objects.
Render these notes in the graphic form in the location where the text was found, ignoring any placement information contained in the serialized object.

Use the UUID in the notes to check if the note has already been rendered. If so, do not render it again.

Listen to changes in the document and rerun this script to identify any new notes to be added, 
or removed if their serialized for is no longer present in the text.

When scanning the text, including any contained inside textarea tags, exclude any text that is not visible to the user, such as text in hidden elements, or text that is not visible due to CSS styling.


*/

// a concatenation of all visible text in the document
var all_page_text = "";


// contain node object and the position within overall text (white space removed)
var textnode_map = [];

//create a node array of text content nodes in document order
function traverse_text(elm) {
    // produce a string of all test concatenated
    //var text_str = "";
    // Produce an array of all nodes
 //   console.debug("#traverse");
//console.debug(elm);
//console.debug(elm.nodeType );
//console.debug(elm.nodeType == Node.ELEMENT_NODE);
//console.debug(elm.nodeType == Node.DOCUMENT_NODE   );

    if (elm.nodeType == Node.ELEMENT_NODE || elm.nodeType == Node.DOCUMENT_NODE) {
//       console.debug("1.0.1");
//       console.debug(elm);
//console.debug(ignore(elm));
//console.debug(elm.childNodes);
        // exclude elements with invisible text nodes
        if (ignore(elm)) {
            return
        }
//        console.debug("1.0.2");
//        console.debug(elm.childNodes);
        for (var i = 0; i < elm.childNodes.length; i++) {
 //           console.debug("1.0.2.1");
            // recursively call to traverse
            traverse_text(elm.childNodes[i]);
        }

    }
    if (elm.nodeType == Node.TEXT_NODE) {
   //      console.debug("1.0.3");
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



/*
 * return array of arrays of stickynote tokens and their starting position within textnode
 * */
function getStickyNotesFromString(text) {
console.debug("# getStickyNotesFromString");
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




/*
 * When this function is called, the text has given a hit on the loosest regxp to match any number of stickynote text serializations
 *
 *
 * */

function showStickyNote(node, note_template) {
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
            // at least one stickynote was found in the text node

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
                // 1 split the text node at the beginning of the stickynode text, this point will anchor the placement of yellow sticky note
                // 2 insert a child node at this point
                // 3 add the node text to this child node
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
                console.debug(token);
                console.debug(decodeURIComponent(token));
                console.debug(JSON.parse(decodeURIComponent(token)));
const note_object_data = JSON.parse(decodeURIComponent(token));
//                var stickynote = deserialize_note(token);
                console.debug(note_object_data);
// get template



                // proceed to render this note

                    // render template into a complete note object (with values)

            var node_root = document.createElement('div');

         
            node_root.setAttribute("type", 'yellownote');
            node_root.setAttribute("minimized", 'visible');

        
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

                
                noteForm.querySelector('[name="message_display_text"]').replaceChildren(document.createTextNode(note_object_data.message_display_text));


            } catch (e) {
                console.error(e);

            }

            // attach event listeners to buttons and icons
            attachEventlistenersToYellowStickynote(node_root);

            console.debug(node_root);
            console.debug(tokenNode);
                
            // place note on page - ignoring position information contained inside the note, as it is not relevant. 
            // The location of the serialized text is the only relevant information for placement.
            //placeStickyNote(stickynote,tokenNode);
            const inserted = tokenNode.parentNode.insertBefore(node_root, tokenNode);
            console.debug(inserted);
            inserted.style.visibility = 'visible';

 // attach event listeners to buttons and icons
 attachEventlistenersToYellowStickynote(inserted);

            }

        }

    } catch (e) {
        console.error(e)
    }

}



/*
 * recursively go down the DOM tree below the specified node
 *
 */
function replaceLink(node, note_template) {
    try {
        //console.debug("# replaceLink");
        //console.debug(node);

        if (node) {
            
            // recursively call to analyse child nodes
            
            for (var i = 0; i < node.childNodes.length; i++) {
                //console.debug("call childnodes");
                try {
                    replaceLink(node.childNodes[i], note_template);
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
// check for visibility


                // apply regexp identifying yellownote

                // exclude elements with invisible text nodes
console.log(node.textContent);
                // ignore any textnode that is not at least xx characters long
                if (node.textContent.length >= 150) {

                    //console.debug("look for sticky note in (" + node.nodeType + "): " + node.textContent);
                    // regexp to match begining and end of a stickynote serialization. The regex pattern is such that multiple note objects may be matched.
                    var yellownote_regexp = new RegExp(/yellownote=.*=yellownote/);

                    if (yellownote_regexp.test(node.textContent)) {
                        console.debug("HIT");
                        // carry out yellow sticky note presentation on this textnode

                        showStickyNote(node, note_template);

                    }

                }
            }
        }
    } catch (e) {
        console.debug(e);
    }
}


function traverseDOM(node, foundOpeningTag, collectedText, originalNode , callback) {
    if (node.nodeType === Node.TEXT_NODE) {
        let textContent = node.textContent;
        let startIndex = foundOpeningTag ? -1 : textContent.indexOf("yellownote=");
        let endIndex = textContent.indexOf("=yellownote");

        if (!foundOpeningTag && startIndex !== -1) {
            // Found the opening tag
            foundOpeningTag = true;
            originalNode = node;
            // Start collecting text from this node
            collectedText = textContent.substring(startIndex + 12);
        } else if (foundOpeningTag) {
            // Already found the opening tag, keep collecting text
            collectedText += textContent;
        }
console.debug("#################" + collectedText);

        // If we have found the closing tag
        if (foundOpeningTag && endIndex !== -1) {
            // Finalize collecting text
            collectedText = collectedText.substring(0, collectedText.length - textContent.length + endIndex);
            // Call the named function
            callback(collectedText, originalNode);
            // Reset for subsequent searches
            foundOpeningTag = false;
            collectedText = '';
        }
    }

    // Traverse child nodes
    node.childNodes.forEach(childNode => traverseDOM(childNode, foundOpeningTag, collectedText, originalNode, callback));
}

// Example named function to be called
function processYellownotesText(text, node) {
    console.log('Found yellownote text:', text, 'in node:', node);
    // Additional processing can be done here
}




traverse_text(document.documentElement);
//console.debug("################################################");
//console.debug(all_page_text);
console.debug(textnode_map);


var doc = window.document;


var root_node = doc.documentElement;
console.debug(root_node);

// start analyzing the DOM (the page/document)


function passOver() {
 // collect the template, for later use
 fetch(chrome.runtime.getURL('./templates/default_yellownote_template.html')).
        then((response) => response.text())
        .then((html) => {
            //console.debug(html);
            //note_template_html = html;
            //const note_template = document.createElement('div');
            // container.innerHTML = html;
            note_template = safeParseInnerHTML(html, 'div');
            console.log("browsersolutions " + note_template);
            console.debug(note_template);


            //console.debug("browsersolutions url: " + url);
            replaceLink(root_node, note_template);

        });
}



 function onPageChange(callback, delay = 10000) {
    let lastInvocationTime = 0;

    // Function to be called when mutations are observed
    const observerCallback = (mutationsList, observer) => {
        const currentTime = Date.now();

        // Check if the current time is at least 'delay' milliseconds after the last invocation
        //console.log(currentTime - lastInvocationTime);
        if (currentTime - lastInvocationTime > delay) {
            console.log("#################delay###############################");
            console.log("#################delay###############################");
            console.log("#################delay###############################");
            // Start the traversal from the document body
        }
        if (currentTime - lastInvocationTime > delay) {
            lastInvocationTime = currentTime; // Update the last invocation time

      // Start the traversal from the document body
      traverse_text(document.documentElement);
      //console.debug("################################################");
      console.debug(all_page_text);
      //console.debug(textnode_map);
      
      passOver();


            //traverse_text(document.documentElement);
            //console.debug("################################################");
            //console.debug(all_page_text);
            console.debug(textnode_map);

            const regexp = new RegExp(/yellownote=.*=yellownote/);

            console.debug("################## contains tag ? ##############################");
            console.log(regexp.test(all_page_text));    

            // deserialize_note

            for (let mutation of mutationsList) {
                console.log(mutation.type);
                if (mutation.type === 'childList' || mutation.type === 'attributes') {

                    callback(mutation); // Call the named function
                }
            }
        }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(observerCallback);

    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: true, subtree: true, characterData: true };

    // Start observing the target node for configured mutations
    observer.observe(document, config);
}

// Example usage of onPageChange
onPageChange(mutation => {
    //console.log('A change was detected:', mutation);
    // Your code to handle the change
});
