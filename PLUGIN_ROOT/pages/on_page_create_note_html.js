
const default_box_width = 250;
const default_box_height = 250;

//const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CACHE_DURATION = 60 * 1000; // 1 minute in milliseconds
const CACHE_URL_REGEX_PATTERN = /.*/; // Adjust this pattern as needed



// Promisified function that processes a cell value
function processCellValue(cellValue) {
    console.debug("processCellValue");
    //console.debug(`Processing: ${cellValue}`);
    console.debug("3.1.0");
    return new Promise((resolve, reject) => {

        console.debug("3.1.1");

        createNote(JSON.parse(cellValue)).then(function (response) {
            console.debug("createNote.complete");
            console.debug(response.outerHTML);
            console.debug("3.1.1.1");
            resolve(response);
        });

        // Simulate async processing
      //  setTimeout(() => {
      //      resolve(`Processed: ${cellValue}`);
      //  }, 1000);
    });
}

function updateTableColumn(querySelector, processFunction) {
    console.log("updateTableColumn.start");
    // Select the cells in the column based on the querySelector
    const cells = document.querySelector('table[name="dataTable"]').querySelectorAll('td[name="yellownote"][rendering="json"]');

    console.debug(cells);

    // Create an array of promises for processing each cell
    const promises = Array.from(cells).map(cell => {
        console.debug(cell);
        console.debug("3.1.2");
        return processFunction(cell.textContent).then(processedValue => {
            console.debug("3.1.3 updateing table column");
            //cell.textContent = processedValue;
            cell.setAttribute("rendering", "complete");
            console.debug(processedValue);
            // empty the JSON data from the cell
            cell.textContent = "";
            cell.setAttribute("style", "height: 250px; width: 250px;");


            // make certain redaction fro mthe note that should not bee shown in feed-mode
const note_table = processedValue.querySelector('table[name="whole_note_table"]');
note_table.removeAttribute("style");

cell.appendChild(processedValue);
            console.debug(cell);

        });
    });

    // Wait for all promises to complete
    return Promise.all(promises);
}

function removeStyleAttributes(node, attributesToRemove) {
    if (!(node instanceof HTMLElement)) {
        console.error('Provided node is not a valid HTML element');
        return;
    }
    
    attributesToRemove.forEach(attribute => {
        console.debug(`Removing style attribute: ${attribute}`);
        console.debug(node.style);
        var style = node.getAttribute('style');
        console.debug(style);
        node.style.removeProperty(attribute);
console.debug(node.getAttribute('style'));
node.style.removeProperty("list-style");
console.debug(node.getAttribute('style'));

        node.style.removeProperty(attribute);
    });
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



function fetchNewData(creatorId, cacheKey) {
    console.debug('fetchNewData: Fetching new data for creatorId:', creatorId);
    return chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name])
    .then(result => {
        const installationUniqueId = result[plugin_uuid_header_name];
        const sessionToken = result[plugin_session_header_name];

        const controller = new AbortController();
        setTimeout(() => controller.abort(), 8000);

        console.log('fetchCreatorDataThroughAPI: Fetching new data from API');
        return fetch(server_url + '/api/v1.0/get_note_properties', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [plugin_uuid_header_name]: installationUniqueId,
                [plugin_session_header_name]: sessionToken
            },
            signal: controller.signal,
            body: JSON.stringify({
                creatorid: creatorId
            })
        });
    })
    .then(response => {
       



        if (!response.ok) {
            console.log(response);

            // if an invalid session token was sent, it should be removed from the local storage
            if (response.status == 401) {
                // compare the response body with the string "Invalid session token" to determine if the session token is invalid
                if(response.headers.get("session") == "DELETE_COOKIE"){
                        console.log("Session token is invalid, remove it from local storage.");
                        chrome.storage.local.remove([plugin_session_header_name]);
                        // redirect to the front page returning the user to unauthenticated status.
                        // unauthenticated functionality will be in effect until the user authenticates
                        //window.location.href = "/pages/my_account.html";
                        throw new Error('logout');
                } else {
                    throw new Error('Network response was not ok');
                }
            } else {
                throw new Error('Network response was not ok');
            }
        } else {
            return response.json();
        }


    })
    .then(data => {
        console.log('Caching data for', creatorId);
        return cacheData(cacheKey, data)
        .then(() => data);
    })
    .catch(error => {
        console.error("Error in fetchNewData:", error);
        throw error; // Propagate the error to maintain the integrity of the promise chain
    });
}




// Helper to cache data with a timestamp
function cacheData(key, data) {
    console.log('cacheData: Caching data for key:', key);
    return new Promise((resolve, reject) => {
        const cachedData = {
            data: data,
            timestamp: new Date().getTime()
        };
        chrome.storage.local.set({
            [key]: cachedData
        }, function () {
            console.log(`Data cached for key: ${key}`);
            resolve();
        });
    });
}

// Helper to get cached data , timeout in seconds
function getCachedData(key, cachetimeout) {
    console.log('getCachedData: Getting cached data for key:', key, ", with timeout:", cachetimeout);
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get([key], function (result) {
                if (result[key]) {
                    console.log(`Cached data for key: ${key}`, result[key].timestamp);
                    console.log((new Date().getTime() - result[key].timestamp));

                    // only accept data less than 3 hours old
                    //            if (result[key] && (new Date().getTime() - result[key].timestamp) < 3 * 3600 * 1000) {
                    // only accept data less than 10 seconds old
                    if (result[key] && (new Date().getTime() - result[key].timestamp) < cachetimeout * 1000) {
                        console.log(result[key].data);
                        resolve(result[key].data);
                    } else {
                        console.log("return null");
                        resolve(null);
                    }
                } else {
                    console.log("return null - cache miss");
                    resolve(null);
                }
            });
        } catch (e) {
            console.debug(e);
            reject(null);
        }
    });
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

/**
 *  creating the complete not for display in a html page
 */
function createNote(note_obj){
    console.debug("createNote().start");
    console.debug(note_obj);
    return new Promise(function (resolve, reject) {
    const brand = "default";
const nodeid = note_obj.noteid;
const creatorid = note_obj.creatorid;
const note_type = note_obj.note_type;
        var html_note_template;
        var html_notetype_template;
        var creatorDetails;
        var isOwner = false;//override later
        var newNote = false;// not likely to create notes from here

const msg ={
    action: "get_template",
    brand: brand,
    note_type: note_type

}
        console.debug(msg);

        chrome.runtime.sendMessage(msg).then(function (response) {
            html_note_template = response;
            console.debug("calling getNotetypeTemplate");

const msg = {
    action: "get_notetype_template",
    brand: brand,
    note_type: note_type
};
console.debug(msg);
            return chrome.runtime.sendMessage(msg);
        }).then(function (response) {
            html_notetype_template = response;
            console.debug("calling fetchCreatorDataThroughAPI");
            return fetchCreatorDataThroughAPI(creatorid);
        }).then(function (response) {
            creatorDetails = response;
            console.debug(note_obj);
            console.debug("calling create_stickynote_node");
            return create_stickynote_node(note_obj, html_note_template, html_notetype_template, creatorDetails, isOwner, newNote);
        }).then(function (response) {
        var node_root = document.createElement('container');
        node_root.appendChild(response);
        console.debug(node_root.outerHTML);
        resolve(node_root);
    });



});

    }
    

// Helper to fetch data from API_URL_2
function fetchCreatorDataThroughAPI(creatorId) {
    console.log('fetchCreatorDataThroughAPI: Fetching data for creatorId:', creatorId);

    if (!creatorId) {
        // If no creator ID is supplied, resolve immediately with null
        return Promise.resolve(null);
    }

    const cacheKey = creatorId + "_creator_data";

    return getCachedData(cacheKey, CACHE_DURATION)
    .then(cachedData => {
        console.log('fetchCreatorDataThroughAPI: data returned from cache:', cachedData);

        if (cachedData) {
            console.log('Returning cached data for creatorId:', creatorId, "cacheKey:", cacheKey);
            return cachedData;
        } else {
            return fetchNewData(creatorId, cacheKey);
        }
    })
    .catch(error => {
        console.error("Error during fetchCreatorDataThroughAPI:", error);
        throw error; // Propagate the error to be handled in the next link of the promise chain
    });
}
    
function create_stickynote_node(note_object_data, html_note_template, html_notetype_template, creatorDetails, isOwner, newNote) {
    console.log("create_stickynote_node.start");
    return new Promise(function (resolve, reject) {
        console.debug(note_object_data);
        console.debug(html_note_template);
        console.debug(html_notetype_template);
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
            }else{
                console.debug("not a new note");
               cont1.setAttribute("noteid", note_object_data.noteid);
        
            }

            if (!isUndefined(note_object_data.distributionlistid) && note_object_data.distributionlistid != undefined) {
                cont1.setAttribute("distributionlistid", note_object_data.distributionlistid);
            }

            //cont1.appendChild(create_note_table(note_object_data,note_template));

            // render a webframe note


            // render a canvas note


            // render a plainhtml note
            console.debug("calling processNoteMiddleBody");
            processNoteMiddleBody(note_object_data, cont1, resolve, creatorDetails, isOwner, newNote).
            then(function (response) {
                console.debug("processNoteMiddleBody.complete");
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

                //console.debug(noteForm);

                // there directly by just clicking on this link

                // setup event listener whereby the user can configure this link
                // rewriting to be automatic

                // where to anchor the tooltip
                // setup node in the DOM tree to contain content of message box
                // var newGloveboxNode = document.createElement("Glovebox");
                // console.debug(newGloveboxNode);

                // set note size
                // set default values first
                // then replace those values with more specific ones if they are available

                // set defaults
                var box_width = default_box_width + "px";
                var box_height = default_box_height + "px";

                // check for template-specific values - not implemented yet
                console.debug(creatorDetails);
                // set background color of note
                // what color to use for the note
                console.debug("calling setNoteColor");
                setNoteColor(creatorDetails, cont1);

               
                // check for brand/organization-specific values - not implemented yet

                try {
                    // check for creator specific values
                    if (creatorDetails.box_width) {
                        box_width = creatorDetails.box_width;
                        console.debug("creator's note_properties has box_width, use it " + box_width);
                    }
                } catch (e) {
                    console.debug(e);
                }

                try {
                    if (creatorDetails.box_height) {
                        box_height = creatorDetails.box_height;
                        console.debug("creator's note_properties has box_width, use it " + box_height);
                    }
                } catch (e) {
                    console.debug(e);
                }
                // check for feed-specific values - not implemented yet

// make visible/invisible selected parts of the note
console.debug("calling setComponentVisibility");
setComponentVisibility(cont1, ",rw,.*normalsized");

console.debug("calling attachEventlistenersToYellowStickynote");
attachEventlistenersToYellowStickynote(cont1);

                // check for note specific values


                cont1.setAttribute("box_height", box_height);
                cont1.setAttribute("box_width", box_width);

                console.debug(cont1);

                resolve(cont1);
            });
        });
    });
}




/**
 * make different parts of the graphical elements visible or not.
 */
function setComponentVisibility(note, visibility) {
    console.debug("# setComponentVisibility.start " + visibility);
    console.debug(note);
    const regex = new RegExp(visibility, 'i');
    const allElements = note.querySelectorAll('[ subcomponentvisibility ]');
    // Iterate over the selected elements

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


/**
 * process the middle part of the note. This is the part where there are diference between the different types of yellownotes
 */
function processNoteMiddleBody(note_object_data, cont1, creatorDetails, isOwner, newNote) {
    console.debug("processNoteMiddleBody.start");
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

img.onload = function() {
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
                    const message_node = cont1.querySelector('[name="message_display_text"]');
                    console.debug(message_node);

                    //cont1.querySelector('[name="message_display_text"]').replaceChildren(document.createTextNode(b64_to_utf8(note_object_data.message_display_text)));
                    message_node.innerHTML = b64_to_utf8(note_object_data.message_display_text);
                    console.debug(message_node);

                }
            } catch (e) {
                console.error(e);
            }

            console.debug(creatorDetails);
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
                    console.debug("calling: get_distributionlist");
                    try {
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
            console.debug("completed processNoteMiddleBody");
            resolve(cont1);
        }
    });
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

function hexToRGB(hex) {
    console.debug("browsersolutions ### hexToRGB (" + hex + ")");
    try {
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
    } catch (e) {
        console.error(e);
        // return the default color
        return "255,255,0";
    }
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


function isUndefined(variable) {
    return typeof variable === 'undefined';
}



// return a drop down html list of all available distribution lists
function get_distributionlist() {
    console.debug("# get_distributionlist");
    return new Promise(function (resolve, reject) {
        try {
           // if update is to disable the note, remove it from the in-memory store
           const cacheKey = URI_plugin_user_get_my_distribution_lists.replace(/\//g, "_");
           //const cacheKey = "cacheKey0002";

           console.debug("Cache key: " + cacheKey);
           const currentTime = Date.now();

           console.debug("currentTime: " + currentTime);
           const cachetimeout = 60;
           const endpoint = server_url + URI_plugin_user_get_my_distribution_lists;
           const protocol = "GET";

           // Accept data from cache if it is less than 60 seconds old
           // Make changes to this timeout when there is a procedure to empty the cache if the value has been updated.
           cachableCall2API_GET(cacheKey, cachetimeout, protocol, endpoint).then(function (data) {
               console.debug(data);
               resolve(data);
           });
        } catch (e) {
            console.log(e);
            reject();
        }
    });
}


function createNoteHeader(note_object_data, cont1, creatorDetails, isOwner, newNote) {
    console.debug("createNoteHeader.start");
    console.debug(note_object_data);
    console.debug(cont1);
    console.debug(creatorDetails);
    console.debug(isOwner);
    console.debug(newNote);
    return new Promise(function (resolve, reject) {
        //createNoteHeader(note_object_data, cont1, creatorDetails, isOwner, newNote);
        // set up the drop-down menu for distribution lists/feeds
        // pre-select the distribution list drop down menu
        const dl_container = cont1.querySelector('[name="distributionlistdropdown"]');

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
                    resolve();
                } catch (e) {
                    console.error(e);
                }
            });

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
resolve();
            });
        }
    });
}

function createNoteFooter(note_object_data, cont1, creatorDetails, isOwner, newNote) {
    console.debug("createNoteFooter.start");
    return new Promise(function (resolve, reject) {
        //createNoteHeader(note_object_data, cont1, creatorDetails, isOwner, newNote);
        // set up the drop-down menu for distribution lists/feeds
        // pre-select the distribution list drop down menu
        const dl_container = cont1.querySelector('[name="distributionlistdropdown"]');

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
                resolve(null);
            });
        }
    });
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