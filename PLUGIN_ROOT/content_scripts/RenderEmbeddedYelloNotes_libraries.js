
/**
 * functions required to render a yellonote from seralized form to a full graphical note
 *
 */

const DELETEdefault_box_width = "250px";
const DELETEdefault_box_height = "250px";

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
        const isOwner = false;
        const isNewNote = false;
        console.debug("calling createYellowNoteFromNoteDataObject")
        createYellowNoteFromNoteDataObject(JSON.parse(cellValue), isOwner, isNewNote).then(function (response) {
            console.debug("createYellowNoteFromNoteDataObject.complete");
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
    console.debug("updateTableColumn.start");
    console.debug(querySelector);
    console.debug(processFunction);
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

                // make certain redaction from the note that should not bee shown in feed-mode
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

function fetchNewData(creatorId, cacheKey) {
    console.debug('fetchNewData: Fetching new data for creatorId:', creatorId);
    return chrome.storage.local.get([plugin_uuid_header_name, plugin_session_header_name])
    .then(result => {
        const installationUniqueId = result[plugin_uuid_header_name];
        const sessionToken = result[plugin_session_header_name];

        const controller = new AbortController();
        setTimeout(() => controller.abort(), 8000);

        console.debug('fetchCreatorDataThroughAPI: Fetching new data from API');
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
            console.debug(response);

            // if an invalid session token was sent, it should be removed from the local storage
            if (response.status == 401) {
                // compare the response body with the string "Invalid session token" to determine if the session token is invalid
                if (response.headers.get("session") == "DELETE_COOKIE") {
                    console.debug("Session token is invalid, remove it from local storage.");
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
        console.debug('Caching data for', creatorId);
        return cacheData(cacheKey, data)
        .then(() => data);
    })
    .catch(error => {
        console.error("Error in fetchNewData:", error);
        throw error; // Propagate the error to maintain the integrity of the promise chain
    });
}


/**
 *  creating the complete not for display in a html page
 */
function createYellowNoteFromNoteDataObject(note_obj, isOwner, isNewNote) {
    console.debug("createYellowNoteFromNoteDataObject.start");
    console.debug(note_obj);
    console.debug(isOwner);
    console.debug(isNewNote);

    console.debug(note_obj.noteid);
    
    return new Promise(function (resolve, reject) {
        const brand = "default";
        const nodeid = note_obj.noteid;
// check if noteid is in the cache, and if it is, use it
// only accept cache entried less than 10 seconds old
getCachedData(nodeid, 10).then(cachedData => {
    console.debug('createYellowNoteFromNoteDataObject: data returned from cache:');
    console.debug(cachedData);

if (cachedData == "null") {
    console.debug('Returning cached data for noteid:', nodeid);

    console.debug(cachedData);

    resolve(cachedData);


}else {
     console.debug(' not in cache, create the note afresh');



        const creatorid = note_obj.creatorid;
        const note_type = note_obj.note_type;
        var html_note_template;
        var html_notetype_template;
        var creatorDetails;
        var node_root;
        const msg = {
            action: "get_template",
            brand: brand,
            note_type: note_type

        }
        console.debug(msg);
        // call to get the note template to use
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
            console.debug("calling cachableCall2API_POST");
         
            return cachableCall2API_POST( creatorid + "_creator_data", 30, "POST", server_url + URI_plugin_user_get_creatorlevel_note_properties, { creatorid: creatorid } );

        }).then(function (response) {
            creatorDetails = response;
            console.debug(creatorDetails);
            test();
            console.debug("calling create_stickynote_node");
            return create_stickynote_node(note_obj, html_note_template, html_notetype_template, creatorDetails, isOwner, isNewNote);
        }).then(function (response) {
            console.debug("createNote.complete");
             node_root = response;
if (isOwner) {
    if (isNewNote   ) {
        setComponentVisibility(node_root,",new,.*normalsized");
    }else{
        setComponentVisibility(node_root,",rw,.*normalsized");
    }
}else{
    if (isNewNote   ) {
        setComponentVisibility(node_root,",new,.*normalsized");
    }else{
        setComponentVisibility(node_root,",ro,.*normalsized");
    }
}
            // put the completed note into the note cache
            console.debug('Caching data for', nodeid);

            return cacheData(nodeid, node_root);            
        }).then(function ( ) {
            console.debug('Cached data for', nodeid);
            console.debug(node_root.outerHTML);
            resolve(node_root);
        });


    }
}).catch(error => {
    console.error("Error during createYellowNoteFromNoteDataObject:", error);
});



    });
}


// Helper to fetch data from API_URL_2
function fetchCreatorDataThroughAPI(creatorId) {
    console.debug('fetchCreatorDataThroughAPI: Fetching data for creatorId:', creatorId);

    if (!creatorId) {
        // If no creator ID is supplied, resolve immediately with null
        return Promise.resolve(null);
    }

    const cacheKey = creatorId + "_creator_data";

    return getCachedData(cacheKey, 3)
    .then(cachedData => {
        console.debug('fetchCreatorDataThroughAPI: data returned from cache:', cachedData);

        if (cachedData) {
            console.debug('Returning cached data for creatorId:', creatorId, "cacheKey:", cacheKey);
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
