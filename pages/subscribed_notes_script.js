

const URI_plugin_user_get_all_yellownotes = "/api/plugin_user_get_all_yellownotes";
const URI_plugin_user_delete_yellownote = "/api/v1.0/plugin_user_delete_yellownote";

const URI_plugin_user_get_abstracts_of_all_yellownotes = "/api/plugin_user_get_abstracts_of_all_yellownotes";


//const browser_id = chrome.runtime.id;

// Function to use "fetch" to delete a data row
async function deleteDataRow(uuid) {
    try {

        const userid = "";
        console.log("deleting: " + uuid);
        const message_body = '{ "uuid":"' + uuid + '" }';
        //console.log(message_body);
        const installationUniqueId = (await chrome.storage.local.get(['installationUniqueId'])).installationUniqueId;

        console.log(installationUniqueId);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(server_url + URI_plugin_user_delete_yellownote, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'installationUniqueId': installationUniqueId
                },
                body: message_body // example IDs, replace as necessary
            });
        console.log(response);
        // Check for errors
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse JSON data
        const data = await response.json();

    } catch (error) {
        console.error(error);
    }
}

/**
 * Navigate to the page where the note is attached
 * @param {*} url
 */
async function goThere(url) {
    try {

        const userid = "";
        console.log("go: " + url);

// issue a http redirect to open the URL in another browser tab
window.open(url, '_blank').focus();
// add functionality to scroll to the note in question


    } catch (error) {
        console.error(error);
    }
}

/**
 * Open the note for editing
 * @param {*} uuid
 */

async function editNote(uuid) {
    try {

        const userid = "";
        console.log("deleting: " + uuid);
        const message_body = '{ "uuid":"' + uuid + '" }';
        //console.log(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(server_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: message_body // example IDs, replace as necessary
            });
        //console.log(response);
        // Check for errors
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse JSON data
        const data = await response.json();

    } catch (error) {
        console.error(error);
    }
}



// Function to fetch data and populate the table
function fetchData() {
    try {

        return new Promise(
            function (resolve, reject) {

       // const installationUniqueId = (await chrome.storage.local.get(['installationUniqueId'])).installationUniqueId;

        console.log(installationUniqueId);
        // Fetch data from web service (replace with your actual API endpoint)
        return fetch(server_url + URI_plugin_user_get_all_yellownotes, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "userid": "dummy",
                    "installationUniqueId": installationUniqueId
                }) // example IDs, replace as necessary
            });

        // Check for errors
      //  if (!response.ok) {
      //      throw new Error(`HTTP error! status: ${response.status}`);
      //  }

       
        //resolve('Data saved OK');

    });

    } catch (error) {
        console.error(error);
    }
}

// Locate all elements with the class "my-button"
const buttons = document.querySelectorAll('.sortableCol');
len = buttons.length;
for (var i = 0; i < buttons.length; i++) {
    //work with checkboxes[i]
    console.log(buttons[i]);
    // set column index number for each column
    buttons[i].setAttribute("colindex", i);
    buttons[i].addEventListener('click', function (event) {
        sortTa();
    }, false);

}

// Locate all cells that are used for filtering of search results
const f_cells = document.querySelectorAll('.filterableCol');
console.log(f_cells);
len = f_cells.length;
for (var i = 0; i < f_cells.length; i++) {
    //work with regexp in cell
    console.log(f_cells[i]);
    // set column index number for each column
    f_cells[i].setAttribute("colindex", i);
    f_cells[i].addEventListener('input', function (event) {
        filterTable_a();
    }, false);

}



// Sort states for each column
const sortStates = {
    0: 'none', // None -> Ascending -> Descending -> None -> ...
    1: 'none'
};



function sortTa() {

    sortTable(event.target.getAttribute("colindex"));
}



function integerstring2timestamp(int) {
    const year = int.substring(0, 4);
    const month = int.substring(4, 6);
    const day = int.substring(6, 8);
    const hour = int.substring(8, 10);
    const minute = int.substring(10, 12);
    const second = int.substring(12, 14);
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
}



// Function to sort the table
function sortTable(columnIndex) {
    console.log("sortable: " + columnIndex)
    const table = document.getElementById('dataTable');

    let rows = Array.from(table.rows).slice(1); // Ignore the header
    let sortedRows;

    // Toggle sort state for the column
    if (sortStates[columnIndex] === 'none' || sortStates[columnIndex] === 'desc') {
        sortStates[columnIndex] = 'asc';
    } else {
        sortStates[columnIndex] = 'desc';
    }

    // Sort based on the selected column and sort state
    // Consider options for different types of sorting here.
    if (columnIndex === 0) {
        sortedRows = rows.sort((a, b) => {
                return Number(a.cells[columnIndex].innerText) - Number(b.cells[columnIndex].innerText);
            });
    } else {
        sortedRows = rows.sort((a, b) => a.cells[columnIndex].innerText.localeCompare(b.cells[columnIndex].innerText));
    }

    if (sortStates[columnIndex] === 'desc') {
        sortedRows.reverse();
    }

    console.log(sortedRows);
    // Remove existing rows
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // Append sorted rows
    const tbody = table.getElementsByTagName('tbody')[0];
    sortedRows.forEach(row => tbody.appendChild(row));
}



function filterTable_a() {
    //  console.log("filterTable_a " );

    filterTable(event.target);
}



function filterTable(colheader) {
    const columnIndex = colheader.parentNode.getAttribute("colindex");
    //console.log(colheader);
    console.log("filter on col: " + columnIndex)
    //const input = colheader;
    const filter = colheader.value.toUpperCase();
    const table = document.getElementById('dataTable');
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    //console.log("filter column:" + columnIndex);
    //console.log("filter value:" + filter);

    for (let i = 0; i < rows.length; i++) {
        const cell = rows[i].getElementsByTagName('td')[columnIndex];
        //console.log(cell);
        if (cell) {
            const content = cell.innerText || cell.textContent;
            if (new RegExp(filter, 'i').test(content)) {
                //        console.log("not sho");
                rows[i].style.display = '';
            } else {
                rows[i].style.display = 'none';
            }
        }
    }
}

// Fetch data on page load


async function fetchData() {
    console.log("fetchData");


  
            var ynInstallationUniqueId = "";
            var xYellownotesSession = "";
    
            let plugin_uuid = await chrome.storage.local.get(["ynInstallationUniqueId"]);
            let session = await chrome.storage.local.get([plugin_session_header_name]);
    
                ynInstallationUniqueId = plugin_uuid.ynInstallationUniqueId;
                xYellownotesSession = session[plugin_session_header_name];
    
        const response  = await   fetch(server_url + "/api/v1.0/plugin_user_get_all_subscribed_notes", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                [plugin_uuid_header_name]: ynInstallationUniqueId,
                [plugin_session_header_name]: xYellownotesSession,
            },
            });
        
        if (!response.ok) {
            reject(new Error('Network response was not ok'));
        }
      
        const data = await response.json();
        // Parse JSON data
      
        console.log(data);
        
        var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
        console.log(utc);
        console.log(Date.now());
        var now = new Date;
        var utc_timestamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
                now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
        console.log(utc_timestamp);
        console.log(new Date().toISOString());

        

        // Get table body element
        const tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];

        // Loop through data and populate the table
        data.forEach(row => {
            console.log(row);
            console.log(JSON.stringify(row));
            console.log(row.uuid);

            // Create new row
            const newRow = tableBody.insertRow();

            // Create cells and populate them with data
            const cell1 = newRow.insertCell(0);
            const cell2 = newRow.insertCell(1);
            const cell3 = newRow.insertCell(2);
            //const cell4 = newRow.insertCell(3);
            const cell5 = newRow.insertCell(3);
            const cell6 = newRow.insertCell(4);
            const cell7 = newRow.insertCell(5);
            // parse the JSON of the note
            const obj = JSON.parse(row.json);
            console.log(obj);
            cell1.textContent = row.uuid;
            try{
            cell2.textContent = integerstring2timestamp(obj.createtime);
            }catch(e){console.debug(e);}
            try{
                cell3.textContent = integerstring2timestamp(obj.lastmodifiedtime);
            }catch(e){console.debug(e);}
            

            cell5.textContent = obj.url;
            cell6.textContent = obj.message_display_text;

            // Add delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = function () {
                // Remove the row from the table
                newRow.remove();
                // call to API to delete row from data base
                deleteDataRow(row.uuid);
            };
           
            cell7.appendChild(deleteButton);

        

           
            // Add location "go there" button
            const goThereButton = document.createElement('button');
            goThereButton.textContent = 'locate';
            goThereButton.onclick = function () {
                // call to API to delete row from data base
                goThere(obj.url, obj.uuid);
            };
            cell7.appendChild(goThereButton);
            

            const cell8 = newRow.insertCell(6);
           
          
        });
       

}

var valid_noteid_regexp = /^[a-zA-Z0-9\-\.\_]{20,100}$/;

function disable_note_with_noteid(noteid) {
console.debug("disable_note_with_noteid: " + noteid);

    console.debug(valid_noteid_regexp.test(noteid));
if (valid_noteid_regexp.test(noteid)){
  // send save request back to background
  chrome.runtime.sendMessage({
    stickynote: {
        "request": "single_disable",
        "disable_details": {
            "noteid": noteid
        }
    }
}, function (response) {
    console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
    // finally, call "close" on the note
    //  try{
    //  	close_note(event);
    //  }catch(g){console.debug(g);}

});
}
}


function enable_note_with_noteid(noteid) {
    console.debug("enable_note_with_noteid: " + noteid);
    
        console.debug(valid_noteid_regexp.test(noteid));
    if (valid_noteid_regexp.test(noteid)){
      // send save request back to background
      chrome.runtime.sendMessage({
        stickynote: {
            "request": "single_enable",
            "enable_details": {
                "noteid": noteid
            }
        }
    }, function (response) {
        console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
        // finally, call "close" on the note
        //  try{
        //  	close_note(event);
        //  }catch(g){console.debug(g);}
    
    });
    
    }
    }
    

/*
 * recursively go down the DOM tree below the specified node
 *
 */
function replaceLink(node, note_template) {
    try {
        console.debug("# replaceLink");
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

fetchData();

    





//traverse_text(document.documentElement);
console.debug("################################################");
//console.debug(all_page_text);
//console.debug(textnode_map);


var doc = window.document;


var root_node = doc.documentElement;
console.debug(root_node);

// start analyzing the DOM (the page/document)

var note_template = null;
 // collect the template, for later use
 fetch(chrome.runtime.getURL('stickynotetemplate.html')).
 then((response) => response.text())
 .then((html) => {
     console.debug(html);
     //note_template_html = html;
     //const note_template = document.createElement('div');
     // container.innerHTML = html;
     note_template = safeParseInnerHTML(html, 'div');
     console.log("browsersolutions " + note_template);
     console.debug(note_template);
     

     //console.debug("browsersolutions url: " + url);
     replaceLink(root_node, note_template);

 });


 console.debug(note_template);
 console.debug("RenderEmbeddedNotes.js: end");


 fetchAndDisplayStaticContent( "/fragments/sidebar_fragment.html", "sidebar").then(() => {   
    page_display_login_status();
  });

