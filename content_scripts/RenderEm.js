console.log('RenderEm.js loaded');

// array of found tnotes
var found = [];

// the session token is not completed as yet
function get_brand_from_sessiontoken(token) {

    try {
        return (JSON.parse(token)).brand;
    } catch (error) {
        return "default";
    }

}

function isUndefined(variable) {
    return typeof variable === 'undefined';
}

// end of common functions

// Function to traverse DOM and extract yellownotes text

function traverseDOMAndExtractYellownotes(node) {
    console.log('traverseDOMAndExtractYellownotes() called');
    console.log(node);
    console.log('nodeType:', node.nodeType);
    let isInsideTag = false;
    let collectedText = '';
    let originalNode = null;
    let results = [];

    function traverse(currentNode) {
        //console.log('traverse() called');
        if (currentNode.nodeType === Node.TEXT_NODE) {
            console.log('currentNode.nodeType === Node.TEXT_NODE');
            let textContent = currentNode.textContent;
            let startIndex = textContent.indexOf("yellownote=");
            let endIndex = textContent.indexOf("=yellownote");
            console.log('textContent:', textContent);
            console.log('textContent length:', textContent.length);

            console.log('startIndex:', startIndex);
            console.log('endIndex:', endIndex);
            console.log('isInsideTag: ' + isInsideTag);
            //console.log('collectedText:', collectedText);

            if (startIndex !== -1) {
                isInsideTag = true;
                //                console.log('isInsideTag: ' + isInsideTag);
                originalNode = currentNode;
                collectedText += textContent.substring(startIndex + 11);
            } else if (isInsideTag) {
                collectedText += textContent;
            }

            if (isInsideTag && endIndex !== -1) {
                console.log("A hit, a palpable hit!");
                collectedText = collectedText.substring(0, collectedText.length - (textContent.length - endIndex));
                results.push({
                    text: collectedText,
                    node: originalNode
                });
                //found.push
                isInsideTag = false;
                collectedText = '';
            }
        }

        // Traverse child nodes
        for (const childNode of currentNode.childNodes) {
            traverse(childNode);
        }
    }

    traverse(node);
    return results;
}

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
            allGoTo2[i].removeEventListener("click", mydelete_note);
            allGoTo2[i].addEventListener("click", mydelete_note);
        }

        var allGoTo5 = note.querySelectorAll('[js_action="copy_note_to_clipboard"]');
        for (var i = 0; i < allGoTo5.length; i++) {
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
            console.log()
            allGoTo12[i].removeEventListener("click", myminimize_note);
            allGoTo12[i].addEventListener("click", myminimize_note);
        }

        var allGoTo13 = note.querySelectorAll('[js_action="fullscreen_note"]');
        for (var i = 0; i < allGoTo13.length; i++) {
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

// get a unique reference for the URL
function getSliderTag() {
    const url = window.location.href.trim();
    var slidertag = ("slidertag_" + url).replace(/[\/:\.]/g, '');
    return slidertag;

}
var doc = window.document;

// return a drop down html list of all available distribution lists
function get_position() {
    console.debug("# get_distributionlist");
    return new Promise(function (resolve, reject) {

        var slidertag = getSliderTag();
        console.log("slidertag: " + slidertag);
        chrome.storage.local.get(["defaultSliderPosition", slidertag]).then(function (data) {

            try {
                console.log(JSON.stringify(data));
                // first, check if there is a slider position value set for this URL

                if (!isUndefined(data[slidertag])) {

                    position = data[slidertag].position;
                    console.log("position: " + position);
                    resolve({
                        position: position
                    });
                } else {
                    // if nothing specifically for this page is found, check with background for a general setting

                    chrome.runtime.sendMessage({
                        action: "getSliderDefaultPosition"

                    }, function (response) {
                        console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
                        console.log("setting position to: " + response.defaultSliderPosition);
                        position = response.defaultSliderPosition;
                        resolve({
                            position: position
                        });
                    });

                }

            } catch (e) {
                console.log(e);

            }

        })

    });

}

get_position().then(function (response) {
    console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));

    // only run if the slider position is 2 or 3
    if (response.position == 2 || response.position == 3) {

        // do a rapid to check if the "yellownote=" string is even present in the page. most page will not have one so no need to do a full scan
        const isStringFound = searchStringInPage("yellownote=");

        if (isStringFound) {
            page_scan();
        } else {
            console.debug("never mind the detailed scanning, no yellownotes to be found in this page");
        }

    } else {
        console.debug("Do not page scan in this position/setting");

    }

}).catch(function (e) {
    console.error(e);
});

function extractTokens(str) {
    const tokens = [];
    const openingTag = "yellownote=";
    const closingTag = "=yellownote";
    const regexPattern = new RegExp(`${openingTag}(.*?)${closingTag}`, 'g');
    
    let match;
    while ((match = regexPattern.exec(str)) !== null) {
        tokens.push(match[1]); // match[1] contains the captured group, which is the content between the tags
    }

    return tokens;
}

function searchStringInPage(searchString) {
    if (!searchString) {
        console.log("No search string provided");
        return false;
    }

    const bodyText = document.body.textContent || document.body.innerText;
    //console.log(bodyText);
    const foundIndex = bodyText.indexOf(searchString);

    return foundIndex !== -1; // returns true if the string is found, false otherwise
}

function page_scan() {
    // Use the function and process results
    let yellownotesResults = traverseDOMAndExtractYellownotes(doc.documentElement);
    //let yellownotesResults = traverseDOMAndExtractYellownotes(null);

    console.log('yellownotesResults:');
    console.log(yellownotesResults);
    yellownotesResults.forEach(result => {
        console.log('Found yellownotes text:', result.text, 'in node:', result.node);
        const start_range_node = result.node;
        console.log(start_range_node);
        console.log(result.node.parentNode);

        // de-serialize the yellow note
        console.debug(decodeURIComponent(result.text));
        console.debug(JSON.parse(decodeURIComponent(result.text)));
        const note_data = JSON.parse(decodeURIComponent(result.text));
        console.debug(note_data);

        // determine what type of note this is
        var type;
        if (note_data.hasOwnProperty('note_type')) {
            type = note_data.note_type;
        } else if (note_data.hasOwnProperty('content_url')) {
            note_data.note_type = "webframe";
            type = "webframe";
        } else {
            note_data.note_type = "yellownote";
            type = "yellownote";
        }
        console.log(note_data);
        console.debug("browsersolutions note_type of note: " + type);

        // get brand from note data, or from session
        chrome.storage.local.get(["yellownotes_session"]).then(function (session) {
            var brand = "";
            if (note_data.hasOwnProperty('brand')) {
                brand = note_data.brand;
            } else {
                brand = get_brand_from_sessiontoken(session.yellownotes_session);
                if (brand === undefined || brand == null || brand == '') {
                    brand = "default";
                }
            }

            console.debug("collect template based on brand (" + brand + "), note type (" + type + ")");

            chrome.runtime.sendMessage({
                action: "get_template",
                brand: brand,
                type: type
            }).then(function (response) {
                const note_template = response;
                //console.debug("browsersolutions note_template: " + note_template);
                console.debug("browsersolutions resolve");
                var template = safeParseInnerHTML(note_template, 'div');
                console.debug("browsersolutions template");
                console.debug(template);
                create_stickynote_node(note_data, template).then(function (newYellowNode) {
                    console.debug("browsersolutions create_stickynote_node");
                    console.debug(newYellowNode);
                    // console.debug(template);
                    console.debug(start_range_node.parentNode);

                    console.debug(start_range_node.parentNode.parentNode);

                    console.debug("browsersolutions placeStickyNote");
                    //placeStickyNote(note_data, template, true);

                    const insertedNode = start_range_node.parentNode.parentNode.insertBefore(newYellowNode, start_range_node.parentNode);
                    console.debug("browsersolutions insertedNode");
                    console.debug(insertedNode);
                    attachEventlistenersToYellowStickynote(insertedNode);

                }).catch(function (e) {
                    console.debug("browsersolutions reject");
                    console.error(e);
                });

            }).catch(function (e) {
                console.debug("browsersolutions reject");
                console.error(e);
            });
        });
    });

}

function listener(request, sender, sendResponse) {

    try {
        console.debug("browsersolutions request: " + JSON.stringify(request));

        if (!(isUndefined(request.sharedsecret)) && !(isUndefined(request.action))) {

            console.debug("browsersolutions request action: " + request.action);
            // chose which function to proceed with
            if (request.action == "update_notes_on_page") {

                // chose which function to proceed with
                var shared_secret_to_identify_background_js_to_content_script_NoteSelectedHTML = "Glbx_marker6";
                console.debug("request0: " + request.action);

                if (request.action == "update_notes_on_page") {

                    // examin page for embedded notes
                    get_position().then(function (response) {
                        console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));

                        // only run if the slider position is 2 or 3
                        if (response.position == 2 || response.position == 3) {

                            // do a rapid to check if the "yellownote=" string is even present in the page. most page will not have one so no need to do a full scan
                            const isStringFound = searchStringInPage("yellownote=");

                            if (isStringFound) {

                                const tokens = extractTokens( document.body.textContent || document.body.innerText);
console.log('tokens:');
console.log(tokens);

tokens.forEach(result => {
    console.log( result);
  // de-serialize the yellow note
  console.debug(decodeURIComponent(result));
  console.debug(JSON.parse(decodeURIComponent(result)));
  const note_data = JSON.parse(decodeURIComponent(result));
  console.debug(note_data);

  // determine what type of note this is
  var type;
  if (note_data.hasOwnProperty('note_type')) {
      type = note_data.note_type;
  } else if (note_data.hasOwnProperty('content_url')) {
      note_data.note_type = "webframe";
      type = "webframe";
  } else {
      note_data.note_type = "yellownote";
      type = "yellownote";
  }
  console.log(note_data);
  console.debug("browsersolutions note_type of note: " + type);

  // get brand from note data, or from session
  chrome.storage.local.get(["yellownotes_session"]).then(function (session) {
      var brand = "";
      if (note_data.hasOwnProperty('brand')) {
          brand = note_data.brand;
      } else {
          brand = get_brand_from_sessiontoken(session.yellownotes_session);
          if (brand === undefined || brand == null || brand == '') {
              brand = "default";
          }
      }

      console.debug("collect template based on brand (" + brand + "), note type (" + type + ")");

      chrome.runtime.sendMessage({
          action: "get_template",
          brand: brand,
          type: type
      }).then(function (response) {
          const note_template = response;
          //console.debug("browsersolutions note_template: " + note_template);
          console.debug("browsersolutions resolve");
          var template = safeParseInnerHTML(note_template, 'div');
          console.debug("browsersolutions template");
          console.debug(template);
          create_stickynote_node(note_data, template).then(function (newYellowNode) {
              console.debug("browsersolutions create_stickynote_node");
              console.debug(newYellowNode);
              // console.debug(template);
              console.debug(start_range_node.parentNode);

              console.debug(start_range_node.parentNode.parentNode);

              console.debug("browsersolutions placeStickyNote");
              //placeStickyNote(note_data, template, true);

              const insertedNode = start_range_node.parentNode.parentNode.insertBefore(newYellowNode, start_range_node.parentNode);
              console.debug("browsersolutions insertedNode");
              console.debug(insertedNode);
              attachEventlistenersToYellowStickynote(insertedNode);

          }).catch(function (e) {
              console.debug("browsersolutions reject");
              console.error(e);
          });

      }).catch(function (e) {
          console.debug("browsersolutions reject");
          console.error(e);
      });
  });

  //  console.log('Found yellownotes text:', result.text, 'in node:', result.node);
});

                               // page_scan();
                            } else {
                                console.debug("never mind the detailed scanning, no yellownotes to be found in this page");
                            }

                        } else {
                            console.debug("Do not page scan in this position/setting");

                        }

                    });

                    sendResponse({
                        success: true,
                        data: "value"
                    });

                } else {
                    sendResponse({
                        success: false,
                        data: "value"
                    });

                }

                return true;

            } else if (request.action == "scroll_to_note") {
                const uuid = request.uuid;
                console.log("scroll to note with uuid: " + uuid);
                // Find the element by its ID
                const note_root = document.querySelectorAll('[type="yellownote"][uuid="' + uuid + '"]')[0];
                const element = note_root.querySelector('table[name="whole_note_table"]')
                    // Check if the element exists
                    if (element) {
                        // Scroll the element into view
                        element.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    } else {
                        console.log('Element not found: ' + elementId);
                    }

            } else {
                return false;
            }

        } else {
            return false;
        }

    } catch (e) {
        console.error(e);
    }
}
// temprarily disable listener
//chrome.runtime.onMessage.addListener(listener);
