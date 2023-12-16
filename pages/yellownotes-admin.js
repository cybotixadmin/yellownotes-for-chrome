export {
    attachRowLevelButtonEventHandlers,
    saveObject,
    updateObject
}

//import {
//	    arrayBufferToBase64,
//		arrayBufferToString,
//		base64ToArrayBuffer,
//		convertArrayBufferViewtoString,
//		convertStringToArrayBufferView,
//	    download_file,
//	    indexeddb_setup_async,
//	    refresh_policies_async,
//	    setup_default_policies_async,
//	    SHA1,
//	    stringToArrayBuffer
//}
//from "./utils/glovebox_utils.js"


import {
    //	addObject,
    //	attach_main_button_eventlisteners,
    //	CompareRowOfNumbers,
    //    CompareRowOfText,
    //	createTable,
    //    createTableRow,
    //  deleteObject,
    //    GetDateSortingKey,
    //    reflow,
    filterColumn,
    setup_database_objects_table_async,
    setup_database_objects_table_dataonly_async,
    sortColumn
    //    SortTable,
    //    TableLastSortedColumn,
    //    updateObject,
    //    writeTableCell,
    //    writeTableHeaderRow,
    //    writeTableNode,
    //    writeTableRow
}
from "../utils/glovebox_form_function.js"

console.debug("### yellownote-admin.js ");

import {
    backup_all_databases_async,
    //	create_indexeddb_async,
    deleteFromIndexedDB_async,
    //    dump_db,
    flush_all_keys_async,
    import_into_db_async,
    //	loadFromIndexedDB_async,
    READ_DB_async,
    saveToIndexedDB_async
}
from "../utils/glovebox_db_ops.js"

import {
    //default_policies,
    index_db_config
}
from "../glovebox_projectspecific.js"

class NavigateCollectionUI {
    constructor(containerEl) {

        // console.debug("### rule-admin.js ");

        this.containerEl = containerEl;
        console.debug(document);
        this.state = {
            storedImages: [],
        };
        // create all tables
        render_tables_async().then(function () {});

        attach_main_button_eventlisteners();
    }
}

/*
 * */
function updateObject(event) {
    console.debug("# updateObject");
    console.debug(event);

    // identify row object

    var rowObj = event.target.parentNode.parentNode;

    console.debug(rowObj);

    // make fields in row editable


    // url field
    var a = rowObj.querySelectorAll('td[j_name="url"]')[0];
    a.setAttribute("class", "normal_editing");
    a.setAttribute("contenteditable", "true");

    // notes/message field
    var b = rowObj.querySelectorAll('td[j_name="message_text"]')[0];
    b.setAttribute("class", "normal_editing");
    b.setAttribute("contenteditable", "true");

    // selection text
    var c = rowObj.querySelectorAll('td[j_name="selection_text"]')[0];
    c.setAttribute("class", "normal_editing");
    c.setAttribute("contenteditable", "true");

    // enabled status

    var c = rowObj.querySelectorAll('td[j_name="enabled"]')[0];
    c.setAttribute("class", "normal_editing");

    // change the css-class of editable fields such that they change appearance and "look" editable


    // swap the edit button with a save button

    // remove exitsing button


    // lookup button the edit button and remove it.
    rowObj.querySelectorAll('td[name="edit"]')[0].querySelectorAll('button')[0].remove();

    //  create a new save button

    var new_button = document.createElement("button");
    new_button.appendChild(document.createTextNode("save"));
    //new_button.setAttribute("class","normal_editing");
    // eventlistener - add saveObject action
    new_button.addEventListener("click", function (event) {
        saveObject(event);
    });

    rowObj.querySelectorAll('td[name="edit"]')[0].appendChild(new_button);

}

//
function saveObject(event) {
    console.debug("# saveObject");
    console.debug(event);

    // identify row object

    var rowObj = event.target.parentNode.parentNode;

    console.debug(rowObj);

    // make fields in row non-editable


    // url field
    var a = rowObj.querySelectorAll('td[j_name="url"]')[0];
    a.setAttribute("class", "normal");
    a.setAttribute("contenteditable", "false");

    // notes/message field
    var b = rowObj.querySelectorAll('td[j_name="message_text"]')[0];
    b.setAttribute("class", "normal");
    b.setAttribute("contenteditable", "false");

    // selection text
    var c = rowObj.querySelectorAll('td[j_name="selection_text"]')[0];
    c.setAttribute("class", "normal");
    c.setAttribute("contenteditable", "false");

    // enable
    var c = rowObj.querySelectorAll('td[j_name="enabled"]')[0];
    c.setAttribute("class", "normal");

    // update lastmodifiedtime

    var lastmodifiedtime = getCurrentTimestamp();

    rowObj.querySelectorAll('td[j_name="lastmodifiedtime"]')[0].textContent = lastmodifiedtime;

    // compose the stickynote object and save it to the database (and in-memory store)
    var new_note_obj = {}

    // send save request back to background
    browser.runtime.sendMessage({
        stickynote: {
            "request": "single_update",
            "update_details": {
                "message_text": rowObj.querySelectorAll('td[j_name="message_text"]')[0].textContent,
                "selection_text": rowObj.querySelectorAll('td[j_name="selection_text"]')[0].textContent,
                "url": rowObj.querySelectorAll('td[j_name="url"]')[0].textContent.replace(/\s/g, ""),
                "uuid": rowObj.getAttribute('object_id').replace(/\s/g, ""),
                "enabled": rowObj.querySelectorAll('td[j_name="enabled"]')[0].querySelectorAll('input')[0].checked,
                "createtime": rowObj.querySelectorAll('td[j_name="createtime"]')[0].textContent.replace(/\s/g, ""),
                "lastmodifiedtime": rowObj.querySelectorAll('td[j_name="lastmodifiedtime"]')[0].textContent.replace(/\s/g, "")
            }
        }
    }, function (response) {
        console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));

        // swap the save button back to edit button


        // lookup button the save button and remove it.
        rowObj.querySelectorAll('td[name="edit"]')[0].querySelectorAll('button')[0].remove();

        //  create a new edit button

        var new_button = document.createElement("button");
        new_button.appendChild(document.createTextNode("edit"));
        //new_button.setAttribute("class","normal_editing");
        // eventlistener - add saveObject action
        new_button.addEventListener("click", function (event) {
            updateObject(event);
        });

        rowObj.querySelectorAll('td[name="edit"]')[0].appendChild(new_button);

    });

}

function getCurrentTimestamp() {

    // compute current timestamp
    var today = new Date();

    var YYYY = today.getFullYear();
    var MM = (today.getMonth() + 1);
    var DD = (today.getDate() + 1);

    if (MM < 10) {
        MM = "0" + MM;
    }

    if (DD < 10) {
        DD = "0" + DD;
    }

    var HH = (today.getHours() + 1);

    if (HH < 10) {
        HH = "0" + HH;
    }

    var mm = (today.getMinutes() + 1);

    if (mm < 10) {
        mm = "0" + mm;
    }

    var ss = (today.getSeconds() + 1);

    if (ss < 10) {
        ss = "0" + ss;
    }

    var dateTime = YYYY + MM + DD + HH + mm + ss;

    console.debug(dateTime);
    return dateTime;
}

//this updateObject is written generically
//but what it will display will be particular to the implementation
//read out fro mthe form the required pieces of information (which object and in what table it is)
function deleteObject(event) {
    console.debug("# deleteObject");
    console.debug(event);

    var row_node = event.target.parentNode.parentNode;
    var object_id = event.target.parentNode.parentNode.getAttribute('object_id');

    var indexedDbName = row_node.parentNode.parentNode.getAttribute('indexedDbName');

    var objectStoreName = row_node.parentNode.parentNode.getAttribute('objectStoreName');

    var p = deleteFromIndexedDB_async(indexedDbName, objectStoreName, object_id);

    p.then(function (res) {
        console.debug(res)
    });

    // send update message to in-memory database


    // send message to background, to request a refresh of the in-memory databases for this policy object
    browser.runtime.sendMessage({
        stickynote: {
            "request": "single_delete",
            "delete_details": {
                "database": indexedDbName,
                "datastore": objectStoreName,
                "object_id": object_id
            }
        }
    }, function (response) {
        console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
    });

    // remove item from table

    var object_table = document.querySelector('table[indexeddbname="' + indexedDbName + '"]');
    //console.debug(object_table);

    var object_row = object_table.querySelector('tr[object_id="' + object_id + '"]');
    //	console.debug(object_row);

    object_row.remove();

}

// create table for database objects

function setup_rule_table(type, key, node, t, h, c) {

    var table_conf = JSON.parse(JSON.stringify(t));
    var header_conf = JSON.parse(JSON.stringify(h));
    var column_conf = JSON.parse(JSON.stringify(c));

    try {
        // console.debug("# setup_rule_table" );
        // console.debug("type: " + type);
        // console.debug("key: " + key);
        // console.debug("node: " + JSON.stringify(node));
        // console.debug("table_conf: " + JSON.stringify(table_conf));
        // console.debug("header_conf: " + JSON.stringify(header_conf));
        // console.debug("column_conf: " + JSON.stringify(column_conf));

        if (node != null) {
            // ##########
            // list all objects in db
            // ##########


            // var table_obj = createTable(table_conf, key);

            var div_table_obj = document.createElement("div");
            div_table_obj.setAttribute("class", "tableContainer");
            var table_obj = document.createElement("table");

            // div_obj.setAttribute("style", "border: 4px; height: 185px;
            // border-top-color:
            // rgba(2, 225, 225, 0.9)");
            // div_table_obj.setAttribute("class", "tableContainer");
            // table_obj.setAttribute("style", "width: 800px; float: left");
            // table_obj.setAttribute("style", "display: block;max-height:
            // 150px;max-widht: 600px;overflow: auto;");
            table_obj.setAttribute("border", "0");
            table_obj.setAttribute("cellspacing", "0");
            table_obj.setAttribute("cellpadding", "0");
            table_obj.setAttribute("class", "scrollTable");
            table_obj.setAttribute("width", "100%");
            table_obj.setAttribute("id", key);

            // for (var i = 0; i < table_conf.length; i++) {
            // var obj = table_conf[i];
            // create a column for each

            // console.debug(JSON.stringify(obj));
            // console.debug("create column ");

            // setup column width for table
            // var col_i = document.createElement("col");
            // col_i.setAttribute("width", obj.width);
            // table_obj.appendChild(col_i);

            // }


            div_table_obj.appendChild(table_obj);

            var thead = document.createElement("thead");
            thead.setAttribute("class", "fixedHeader");
            thead.appendChild(writeTableHeaderRow(header_conf, key));

            table_obj.appendChild(thead);

            var tbody = document.createElement("tbody");
            tbody.setAttribute("class", "scrollContent");
            // tbody.setAttribute("style", "display: block;height: 100px;width:
            // 100%;overflow-y: auto;");


            var dbRequest = indexedDB.open(key + "DB");
            dbRequest.onerror = function (event) {
                reject(Error("Error text"));
            };

            dbRequest.onupgradeneeded = function (event) {
                // Objectstore does not exist. Nothing to load
                event.target.transaction.abort();
                reject(Error('Not found'));
            };

            dbRequest.onsuccess = function (event) {
                var database = event.target.result;
                var transaction = database.transaction(key + 'Store', 'readonly');
                var objectStore = transaction.objectStore(key + 'Store');

                if ('getAll' in objectStore) {
                    // IDBObjectStore.getAll() will return the full set of items
                    // in our store.
                    objectStore.getAll().onsuccess = function (event) {
                        const res = event.target.result;
                        // console.debug(res);


                        for (const url of res) {

                            // create table row for each entry returned from
                            // database
                            // const tr = document.createElement("tr");
                            // console.debug("column_conf " +
                            // JSON.stringify(column_conf));
                            // console.debug("url" + JSON.stringify(url));
                            // console.debug("column_conf: " +
                            // JSON.stringify(column_conf));

                            const tr = writeTableRow(url, column_conf, type, key);

                            // create add row to table

                            tbody.appendChild(tr);

                        }

                    };
                    // add a line where information on a new key can be added to
                    // the database.
                    // document.querySelector("button.onAddDecryptionKey").onclick
                    // = this.onAddDecryptionKey;

                } else {
                    // Fallback to the traditional cursor approach if getAll
                    // isn't supported.
                    var timestamps = [];
                    objectStore.openCursor().onsuccess = function (event) {
                        var cursor = event.target.result;
                        if (cursor) {
                            console.debug(cursor.value);
                            // timestamps.push(cursor.value);
                            cursor.continue();
                        } else {
                            // logTimestamps(timestamps);
                        }
                    };

                    document.querySelector("button.onAddDecryptionKey").onclick = this.onAddDecryptionKey;

                    const tr_last = document.createElement("tr");

                    const td = document.createElement("td");
                    td.appendChild(document.createTextNode("key name"));
                    tr_last.appendChild(td);
                    const td2 = document.createElement("td");
                    td2.appendChild(document.createTextNode("key"));
                    tr_last.appendChild(td2);
                    const td3 = document.createElement("td");
                    td3.appendChild(document.createTextNode("jwk"));

                    tr_last.appendChild(td3);

                    tbody.appendChild(tr_last);

                }

            };
            table_obj.appendChild(tbody);

            node.appendChild(div_table_obj);
        }
    } catch (e) {
        console.debug(e)
    }

}

function submitAddNewRule(type, key) {
    console.debug("## submitAddNewRule");
    console.debug(type);
    console.debug(key);

}

//this function creates all tables for database entries
function render_tables_async() {
    // create tables to present all available rules

    try {

        return new Promise(
            function (resolve, reject) {

            var table_conf = {};
            table_conf["conf"] = [{
                    "id": "1",
                    "width": "100px"
                }, {
                    "id": "1",
                    "width": "290px"
                }, {
                    "id": "1",
                    "width": "290px"
                }, {
                    "id": "1",
                    "width": "100px"
                }, {
                    "id": "1",
                    "width": "100px"
                }, {
                    "id": "1",
                    "width": "100px"
                }
            ];

            // presentation_format: text, JSON, table, dropdown

            // configure column headers for table
            var header_conf = [];
            header_conf = [{
                    "id": "1",
                    "text": "URL location",
                    "class": "class01"
                }, {
                    "id": "2",
                    "text": "note text"
                }, {
                    "id": "5",
                    "text": "selected text"
                }, {
                    "id": "6",
                    "text": "enabled"
                }, {
                    "id": "3",
                    "text": "created"
                }, {
                    "id": "4",
                    "text": "last modified"
                }
            ];

            // setup column configuration for table

            var column_conf = [];
            column_conf = [{
                    "id": "1",
                    "json_path": "url",
                    "other_attributes": [{
                            "j_name": "url",
                            "class": "normal"
                        }
                    ],
                    "presentation_format": "text"
                }, {
                    "id": "1",
                    "json_path": "message_text",
                    "other_attributes": [{
                            "j_name": "message_text",
                            "class": "normal"
                        }
                    ],
                    "presentation_format": "text"
                }, {
                    "id": "1",
                    "json_path": "selection_text",
                    "other_attributes": [{
                            "j_name": "selection_text",
                            "class": "normal"
                        }
                    ],
                    "presentation_format": "text"
                }, {
                    "id": "1",
                    "json_path": "enabled",
                    "other_attributes": [{
                            "j_name": "enabled",
                            "class": "normal"
                        }
                    ],
                    "presentation_format": "boolean"
                }, {
                    "id": "1",
                    "name": "box_width",
                    "json_path": "box_width",
                    "other_attributes": [{
                            "j_name": "box_width"
                        }
                    ],
                    "presentation_format": "hidden"
                }, {
                    "id": "1",
                    "name": "box_height",
                    "json_path": "box_height",
                    "other_attributes": [{
                            "j_name": "box_height"
                        }
                    ],
                    "presentation_format": "hidden"
                }, {
                    "id": "1",
                    "name": "posx",
                    "json_path": "posx",
                    "other_attributes": [{
                            "j_name": "posx",
                            "class": "hidden"
                        }
                    ],
                    "presentation_format": "hidden"
                }, {
                    "id": "1",
                    "name": "posy",
                    "json_path": "posy",
                    "other_attributes": [{
                            "j_name": "posy",
                           
                        }
                    ],
                    "presentation_format": "hidden"
                }, {
                    "id": "1",
                    "json_path": "createtime",
                    "class": "timestamp",
                    "other_attributes": [{
                            "j_name": "createtime",
                            "class": "normal"
                        }
                    ],
                    "presentation_format": "timestamp"
                }, {
                    "id": "1",
                    "json_path": "lastmodifiedtime",
                    "class": "timestamp",
                    "other_attributes": [{
                            "j_name": "lastmodifiedtime",
                            "class": "normal"
                        }
                    ],
                    "presentation_format": "timestamp"
                }, {
                    "id": "1",
                    "json_path": "uuid",
                    "class": "normal",
                    "other_attributes": [{
                            "j_name": "uuid",
                            "class": "normal"
                        }
                    ],
                    "presentation_format": "text"
                }, { //action="updateObject
                    "id": "4",
                    "other_attributes": [{
                            "class": "normal",
                            "name": "edit","action": "updateObject"
                        }
                    ],
                    "node": {
                        "name": "button",
                        "text": "edit",
                        "class": "editbutton",
                        "EventListener": {
                            "type": "click",
                            "func": "updateObject",
                            "parameter": "click"
                        }
                    }
                }, {
                    "id": "5",
                    "other_attributes": [{
                            "class": "normal",
                            "action": "deleteObject"
                        }
                    ],
                    "node": {
                        "name": "button",
                        "text": "delete",
                        "class": "deletebutton",
                        "EventListener": {
                            "type": "click",
                            "func": "deleteObject",
                            "parameter": "click"
                        }
                    }
                }, {
                    "id": "6",
                    "other_attributes": [{
                            "class": "normal",
                            "action": "goToYellowNoteOnLocation"
                        }
                    ],
                    "node": {
                        "name": "button",
                        "text": "go there",
                        "class": "goToYellowNoteOnLocation"

                    }
                }

            ];

            // console.debug(JSON.stringify(column_conf));

            // destinationDomainRule
            header_conf[0].text = "destinationDomainRule";

            // column_conf[0]["json_path"] = "destinationDomain";
            // column_conf[1].json_path = "steps";
            // column_conf[2].node.text = "update this rule3";
            // column_conf[2].node["class"] = "update-rule";
            //column_conf[3].node["EventListener"].func = "updateObject";
            // column_conf[3].node.text = "delete2";
            // column_conf[3].node["class"] = "update-rule";
            // column_conf[4].node["EventListener"].func = "deleteObject";
            // console.debug(JSON.stringify(column_conf));


            // set label in first column
            header_conf[0].text = "destination hostname";

            //            setup_database_objects_table_async("sourceURLYellowNotesDB", "sourceURLYellowNotesStore", "uuid", "sourceURLYellowNotesDB", document.getElementById("sourceURLYellowNotes"), table_conf, header_conf, column_conf)


            setup_database_objects_table_dataonly_async("sourceURLYellowNotesDB", "sourceURLYellowNotesStore", "uuid", "sourceURLYellowNotesDB", document.getElementById("sourceURLYellowNotesDB"), table_conf, header_conf, column_conf)
            .then(function (res) {
                console.debug(res);

                // create event listener on each column headers to trigger sorting on the column
                var col_headers = document.querySelectorAll("thead.fixedHeader > tr > td.column_header");
                for (var t = 0; t < col_headers.length; t++) {
                    col_headers[t].addEventListener('click', function (event) {
                        // SortTable(i, 'T', table_id);
                        sortColumn(event);
                    });
                }

                // add filter action to filter button
                document.getElementById("action_filter_button").addEventListener('click', function (event) {
                    // console.debug(event);
                    filterColumn(event);
                });

                // add clear action to clear filter button
                document.getElementById("clear_filter_button").addEventListener('click', function (event) {
                    // console.debug(event);
                    clearFilterColumn(event);
                });

                // format timestamps
                var all = document.querySelectorAll("td.timestamp");
                console.debug(all);
                for (var i = 0; i < all.length; i++) {
                    var new_timefield = convert_timestamp_from_machinereadable_to_humanreadable(all[i].textContent);
                    all[i].textContent = new_timefield;
                }

                attachRowLevelButtonEventHandlers();

            });

        });

    } catch (f) {
        console.error(f);
    }

}


function clearFilterColumn(event){
	console.debug("# clearFilterColumn");
	
	// loop all filter fields and reset the values
	  var filters = document.querySelectorAll("td.filter");
	  
	  // what sort of fiter regexp or wilscard
	  
	  if(document.getElementById('filterregexp').checked == true) {   
	  
      for (var t = 0; t < filters.length; t++) {
    	  filters[t].textContent = ".*";
          
      }
	
	  }else{
	      for (var t = 0; t < filters.length; t++) {
	    	  filters[t].textContent = "*";
	          
	      }
		  
		  
	  }
	
}


function attachRowLevelButtonEventHandlers() {
    //console.debug("# attachRowLevelButtonEventHandlers");
    // assign other event handlers to buttons
    var allGoTo = document.querySelectorAll('td[action="goToYellowNoteOnLocation"]');
    //console.debug(allGoTo);
    for (var i = 0; i < allGoTo.length; i++) {
        allGoTo[i].addEventListener('click', function () {
            goToYellowNoteOnLocation(event);
        })
    }

    var up = document.querySelectorAll('td[action="updateObject"]');
    //console.debug(up);
    for (var i = 0; i < up.length; i++) {
        up[i].addEventListener('click', function () {
            updateObject(event);
        })
    }

    var del = document.querySelectorAll('td[action="deleteObject"]');
    //console.debug(del);
    for (var i = 0; i < del.length; i++) {
        del[i].addEventListener('click', function () {
            deleteObject(event);
        })
    }
}


function goToYellowNoteOnLocation(event) {

    console.debug("goToStickyNoteOnLocation");

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


function attach_main_button_eventlisteners() {

    console.debug("# attach_main_button_eventlisteners");

    // add backup button
    try {
        document.getElementById("backup-all-rules_button").addEventListener('click', () => {
            // document.querySelector("button.backup-all-keys").addEventListener('click',
            // ()
            // => {
            console.debug("backup rules ");

            backup_all_databases_async().then(function (e) {
                console.debug("backup complete");
                console.debug(e);
            });
        }, false);
    } catch (e) {
        console.debug(e)
    }

    // add filter button
    try {
        var fs = document.querySelectorAll("td.filter");

        for (var f = 0; f < fs.length; f++) {
            fs[f].addEventListener('click', () => {

                filterColumn(event);
            }, false);

        }

    } catch (e) {
        console.debug(e)
    }

    // add event listener for import button

    console.debug("setup import form");
    try {
        document.getElementById('import-rules_button').addEventListener('click', function (evt) {
            console.debug("### reading import file");

            var input = document.createElement('input');
            input.type = 'file';

            input.onchange = e => {

                // getting a hold of the file reference
                var file = e.target.files[0];

                // setting up the reader
                var reader = new FileReader();
                reader.readAsText(file, 'UTF-8');

                // here we tell the reader what to do when it's done
                // reading...
                reader.onload = readerEvent => {
                    var content = readerEvent.target.result; // this is
                    // the
                    // content!
                    console.debug(content);

                    var data = JSON.parse(content);

                    var imp = [];

                    // fine contains an array of database dumps
                    for (var j = 0; j < data.length; j++) {
                        console.debug(data[j].database);

                        imp.push(import_into_db_async(data[j].database, data[j].datastore, 'keyId', data[j].data));

                    }

                    Promise.all(imp)
                    .then(function (values) {
                        console.debug(JSON.stringify(values));

                    });

                }

            }

            input.click();

        });

    } catch (e) {
        console.debug(e);
    }

}

// kick off
const navigateCollectionUI = new NavigateCollectionUI(document.getElementById('app'));
