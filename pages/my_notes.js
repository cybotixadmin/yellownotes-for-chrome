

// uri to the server-side services used by YellowStickyNotes
const server_url = "http://api.yellownotes.xyz";

const URI_plugin_user_get_own_yellownotes = "/api/plugin_user_get_own_yellownotes";
const URI_plugin_user_delete_yellownote = "/api/plugin_user_delete_yellownote";

const URI_plugin_user_get_abstracts_of_all_yellownotes = "/api/plugin_user_get_abstracts_of_all_yellownotes";

const plugin_uuid_header_name = "ynInstallationUniqueId";
const plugin_session_header_name = "yellownotes_session";

//const browser_id = chrome.runtime.id;

// Function to use "fetch" to delete a data row
async function deleteDataRow(uuid) {
    try {

        const userid = "";
        console.log("deleting: " + uuid);
        const message_body = '{ "uuid":"' + uuid + '" }';
        //console.log(message_body);
        const installationUniqueId = (await chrome.storage.local.get(['installationUniqueId'])).installationUniqueId;

        let plugin_uuid = await chrome.storage.local.get(["ynInstallationUniqueId"]);
        let session = await chrome.storage.local.get(["yellownotes_session"]);

        console.log(installationUniqueId);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(server_url + URI_plugin_user_delete_yellownote, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [plugin_uuid_header_name]: plugin_uuid.ynInstallationUniqueId,
                    [plugin_session_header_name]: session.yellownotes_session,
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
async function goThere(url, uuid) {
    try {

        const userid = "";
        console.log("go to url: " + url);
        console.log("go lookup uuid: " + uuid);

        // issue a http redirect to open the URL in another browser tab
        //window.open(url, '_blank').focus();
        // add functionality to scroll to the note in question
 // invoke the background script to scroll to the note in question
        chrome.runtime.sendMessage({
            message: {
                action: "scroll_to_note",
                scroll_to_note_details: {
                    uuid: uuid,
                    url: url

                }
            }
        }, function (response) {
            console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
            // finally, call "close" on the note
            //  try{
            //  	close_note(event);
            //  }catch(g){console.debug(g);}

        });



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
        let plugin_uuid = await chrome.storage.local.get(["ynInstallationUniqueId"]);
        let session = await chrome.storage.local.get(["yellownotes_session"]);

        //console.log(message_body);
        // Fetch data from web service (replace with your actual API endpoint)
        const response = await fetch(server_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [plugin_uuid_header_name]: plugin_uuid.ynInstallationUniqueId,
                    [plugin_session_header_name]: session.yellownotes_session
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
    console.debug("fetchData");
    try {

        return new Promise(
            function (resolve, reject) {

            // const installationUniqueId = (await chrome.storage.local.get(['installationUniqueId'])).installationUniqueId;

            console.log(installationUniqueId);
            //  let plugin_uuid = await chrome.storage.local.get(["ynInstallationUniqueId"]);
            //  let session = await chrome.storage.local.get(["yellownotes_session"]);
            var ynInstallationUniqueId;
            var yellownotes_session;
            chrome.storage.local.get(['ynInstallationUniqueId', 'yellownotes_session'])
            .then(function (ins) {
                console.log(ins);
                ynInstallationUniqueId = ins.ynInstallationUniqueId;
                yellownotes_session = ins.yellownotes_session;
                console.log(ynInstallationUniqueId);
                console.log(yellownotes_session);
                //ynInstallationUniqueId = "dummy";

                // Fetch data from web service (replace with your actual API endpoint)
                return fetch(server_url + URI_plugin_user_get_own_yellownotes, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        [plugin_uuid_header_name]: ynInstallationUniqueId,
                        [plugin_session_header_name]: yellownotes_session
                    },
                    body: JSON.stringify({}) // example IDs, replace as necessary
                });
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


function render() {
    console.log("render");

    return new Promise(
        function (resolve, reject) {
        var ynInstallationUniqueId = "";
        var yellownotes_session = "";
        //const installationUniqueId = (await chrome.storage.local.get(['installationUniqueId'])).installationUniqueId;


        chrome.storage.local.get(['ynInstallationUniqueId', 'yellownotes_session']).then(function (result) {
            console.log(result);
            console.log(ynInstallationUniqueId);
            ynInstallationUniqueId = result.ynInstallationUniqueId;
            yellownotes_session = result.yellownotes_session;
            console.log(ynInstallationUniqueId);
            console.log(yellownotes_session);
            return fetch(server_url + URI_plugin_user_get_own_yellownotes, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [plugin_uuid_header_name]: ynInstallationUniqueId,
                    [plugin_session_header_name]: yellownotes_session,
                },
                body: JSON.stringify({}) // example IDs, replace as necessary, the body is used to retrieve the notes of other users, default is to retrieve the notes of the authenticated user
            });
        }).then(response => {
            if (!response.ok) {
                reject(new Error('Network response was not ok'));
            }
            return response.json();
        }).then(function (data) {
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
                const cell4 = newRow.insertCell(3);
                const cell5 = newRow.insertCell(4);
                const cell6 = newRow.insertCell(5);
                const obj = JSON.parse(row.json);
                cell1.textContent = row.uuid;
try{
                cell2.textContent = integerstring2timestamp(obj.createtime);
}catch(e){
    console.log(e);
}
try{
                    cell3.textContent = integerstring2timestamp(obj.lastmodifiedtime);
                }catch(e){
                    console.log(e);
                }
                
                if (row.status == "1") {
                    cell4.textContent = "enabled";
                } else {
                    cell4.textContent = "disabled";
                }

                cell5.textContent = obj.url;
                cell6.textContent = obj.message_display_text;

                // create small table to contain the action buttons
                const buttonTable = document.createElement('table');
                buttonTable.setAttribute('class', 'actionButtonTable');
                const buttonRow = document.createElement('tr');
                buttonRow.setAttribute('class', 'actionButtonTable');
                buttonTable.appendChild(buttonRow);
                buttonRow.setAttribute('class', 'actionButtonTable');

                const buttonCell1 = document.createElement('td');
                buttonCell1.setAttribute('class', 'actionButtonTable');
                buttonTable.appendChild(buttonCell1);

                // Add delete button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.onclick = function () {
                    // Remove the row from the table
                    newRow.remove();
                    // call to API to delete row from data base
                    deleteDataRow(row.uuid);
                };
                buttonCell1.appendChild(deleteButton);
                const cell7 = newRow.insertCell(6);
                cell7.appendChild(buttonTable);

                // Add edit button
                const buttonCell2 = document.createElement('td');
                buttonCell2.setAttribute('class', 'actionButtonTable');
                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.onclick = function () {
                    // call to API to delete row from data base
                    editNote(row.uuid);
                };
                buttonCell2.appendChild(editButton);
                buttonTable.appendChild(buttonCell2);

                // Add location "go there" button
                const buttonCell3 = document.createElement('td');
                buttonCell3.setAttribute('class', 'actionButtonTable');
                const goThereButton = document.createElement('button');
                goThereButton.textContent = 'locate';
                goThereButton.onclick = function () {
                    // call to API to delete row from data base
                    goThere(obj.url, obj.uuid);
                };
                buttonCell3.appendChild(goThereButton);
                buttonTable.appendChild(buttonCell3);

                // add enable/disable button
                const buttonCell4 = document.createElement('td');
                buttonCell4.setAttribute('class', 'actionButtonTable');
                const ableButton = document.createElement('button');

                if (row.status == "1" || row.status == 1) {
                    ableButton.setAttribute('name', 'disable');
                    ableButton.textContent = 'disable';
                    ableButton.onclick = function () {
                        // call to API to delete row from data base
                        disable_note_with_uuid(obj.uuid);
                    };
                } else {
                    ableButton.setAttribute('name', 'enable');
                    ableButton.textContent = 'enable';
                    ableButton.onclick = function () {
                        // call to API to delete row from data base
                        enable_note_with_uuid(obj.uuid);
                    };
                }
                buttonCell4.appendChild(ableButton);
                buttonTable.appendChild(buttonCell4);

                const cell8 = newRow.insertCell(7);

                // cell7.textContent = 'yellownote=%7B%22url%22%3A%22file%3A%2F%2F%2FC%3A%2Ftemp%2F2.html%22%2C%22uuid%22%3A%22%22%2C%22message_display_text%22%3A%22something%22%2C%22selection_text%22%3A%22b71-4b02-87ee%22%2C%22posx%22%3A%22%22%2C%22posy%22%3A%22%22%2C%22box_width%22%3A%22250%22%2C%22box_height%22%3A%22250%22%7D=yellownote';

                //cell7.setAttribute('style', 'height: 250px; width: 350px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;');

                // Adding data-label for mobile responsive
                cell2.setAttribute('data-label', 'createtime');
                cell2.setAttribute('class', 'timestamp');
                cell3.setAttribute('data-label', 'lastmodfiedtime');
                cell3.setAttribute('class', 'timestamp');
                cell4.setAttribute('data-label', 'url');
                cell5.setAttribute('data-label', 'text');
            });
            resolve('Data saved OK');
        });
    });

}

var valid_uuid_regexp = /^[a-zA-Z0-9\-\.\_]{20,100}$/;

function disable_note_with_uuid(uuid) {
    console.debug("disable_note_with_uuid: " + uuid);

    console.debug(valid_uuid_regexp.test(uuid));
    if (valid_uuid_regexp.test(uuid)) {
        // send save request back to background
        chrome.runtime.sendMessage({
            message: {
                "action": "single_note_disable",
                "disable_details": {
                    "uuid": uuid,
                    "enabled": false
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

function enable_note_with_uuid(uuid) {
    console.debug("enable_note_with_uuid: " + uuid);

    console.debug(valid_uuid_regexp.test(uuid));
    if (valid_uuid_regexp.test(uuid)) {
        // send save request back to background
        chrome.runtime.sendMessage({
            message: {
                "action": "single_note_enable",
                "enable_details": {
                    "uuid": uuid
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
        //  console.debug("# replaceLink");
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

render().then(function (d) {
    console.log("render NOtes");
    console.log("################################################");
    console.log("################################################");
    console.log("################################################");
    console.log("################################################");
    console.log("################################################");
    console.log("################################################");
    console.log("################################################");
    console.log(d);
    // kick of the process of rendering the yellow sticky notes in the graphic form


    var doc = window.document;

    var root_node = doc.documentElement;
    console.debug(root_node);

    // start analyzing the DOM (the page/document)

    var note_template = null;
    // collect the template, for later use
    fetch(chrome.runtime.getURL('./templates/default_yellownote_template.html')).
    then((response) => response.text())
    .then((html) => {
        console.debug(html);
        //note_template_html = html;
        //const note_template = document.createElement('div');
        // container.innerHTML = html;
        note_template = safeParseInnerHTML(html, 'div');
        console.log("browsersolutions " + note_template);
        console.debug(note_template);

        replaceLink(root_node, note_template);

    });

    console.debug(note_template);

});

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


