
export {
    addObject,
    CompareRowOfNumbers,
    CompareRowOfText,
    createTable,
    createTableRow,
    create_scope_dropdown_list,
    deleteObject,
    filterColumn,
    GetDateSortingKey,
    get_parent_domain,
    reflow,
    setup_database_objects_table_async,
    setup_database_objects_table_dataonly_async,
    sortColumn,
    SortTable,
    TableLastSortedColumn,
    updateObject,
    writeTableCell,
    writeTableHeaderRow,
    writeTableNode,
    writeTableRow
};

/* v 1.0.8
 * Standard "toolkit" across all Glovebox's add-ons
 *
 * 1.0.8 bool checkbox in forms
 *
 * setup_database_objects_table_async resolves after all database rows are read
 */

import {
    arrayBufferToBase64,
    arrayBufferToString,
    base64ToArrayBuffer,
    convertArrayBufferViewtoString,
    convertStringToArrayBufferView,
    download_file,
    indexeddb_setup_async,
    refresh_policies_async,
    setup_default_policies_async,
    SHA1,
    stringToArrayBuffer

}
from "./glovebox_utils.js"

import {
    backup_all_databases_async,
    //    	create_indexeddb_async,
    deleteFromIndexedDB_async,
    //        dump_db,
    //        flush_all_keys_async,
    import_into_db_async,
    loadFromIndexedDB_async,
    //        READ_DB_async,
    saveToIndexedDB_async
}
from "./glovebox_db_ops.js"

import {
    attachRowLevelButtonEventHandlers,
    saveObject,
    updateObject
}
from "../yellownotes-admin.js"

function get_parent_domain(url) {

    return url.replace(/^http[s]*:\/\/[^\.]*\.([^\/]*)\/.*/i, '$1');

}

//this updateObject is written generically
//but what it will display will be particular to the implementation
// read out from the form the required pieces of information (which object and in what table it is)
function addObject(event) {
    console.debug("# updateObject");
    console.debug(event);

    // identify which database and datastore the new object goes to
    var indexedDbName = null;

    var container = event.target.parentNode;

    try {
        indexedDbName = container.querySelector("table.scrollTable").getAttribute('indexedDbName');
    } catch (e) {
        console.debug(e);
    }

    var objectStoreName = null;

    try {
        objectStoreName = container.querySelector("table.scrollTable").getAttribute('objectStoreName');
    } catch (e) {
        console.debug(e);
    }

    console.debug("objectStoreName: " + objectStoreName);
    console.debug("indexedDbName: " + indexedDbName);

    return browser.storage.sync.set({
        'indexedDbName': indexedDbName,
        'objectStoreName': objectStoreName
    }).then(function (res) {

        var w = window.open('popup/add-policy.html', 'test01', 'width=1000,height=600,resizeable,scrollbars');
        console.debug(w);

    });

}

//this updateObject is written generically
//but what it will display will be particular to the implementation
// read out from the form the required pieces of information (which object and in what table it is)
function DISABLEDupdateObject(event) {
    console.debug("# updateObject");
    console.debug(event);

    var object_id = null;

    try {
        object_id = event.target.parentNode.parentNode.getAttribute('object_id');
        console.debug(event.target.parentNode.parentNode.getAttribute('object_id'));
        console.debug(event.target.parentNode.getAttribute('object_id'));
    } catch (e) {
        consolde.debug(e);
    }

    var indexedDbName = null;

    try {
        indexedDbName = event.target.parentNode.parentNode.parentNode.parentNode.getAttribute('indexedDbName');
    } catch (e) {
        consolde.debug(e);
    }

    var objectStoreName = null;

    try {
        objectStoreName = event.target.parentNode.parentNode.parentNode.parentNode.getAttribute('objectStoreName');
    } catch (e) {
        consolde.debug(e);
    }

    // get the id of the object which is to be modified from the table row object

    console.debug("objectStoreName: " + objectStoreName);
    console.debug("object_id: " + object_id);

    // var popup = window.open("<html><title>sub</title></html>");


    // create popup window where fields can be edited


    // two different popups depending on wheather not this is a rule based on
    // source URL (where the link is found)
    // or destination (where the link goes to)

    // Add the url to the pending urls and open a popup.
    // pendingCollectedURLs.push(info.srcURL);
    var popup = null;
    try {

        // open up the popup
        var obj;
        // read object out of database

        loadFromIndexedDB_async(indexedDbName, objectStoreName, object_id).then(function (res) {
            obj = res;
            console.debug(obj);

            // place the identity of the object to be edited in storage

            return browser.storage.sync.set({
                'object_id': object_id,
                'indexedDbName': indexedDbName,
                'objectStoreName': objectStoreName
            });
        }).then(function (g) {

            console.debug(g);
            //});

            // the popup is now open

            // console.debug("read back: " + browser.storage.sync.get(['editThisRule', 'type', 'key']));
            //browser.storage.sync.get(['editThisRule', 'type', 'key']).then(function(e){
            // 	console.debug(e);
            // 	});

            //console.debug("read back: " + browser.storage.sync.get(['editThisRule', 'type', 'key'], function (data){
            // 	console.debug(data);
            //} ));

            // send message to background, and have background send it to the popup
            //	browser.runtime.sendMessage({
            //		request: {"sendRule":"toEditPopup","editThisObject": obj}
            //	}, function (response) {
            //		console.debug("message sent to backgroup.js with response: " + JSON.stringify(response));
            //	});

        });

        var w = window.open('popup/edit-policy.html', 'test01', 'width=1000,height=600,resizeable,scrollbars');
        console.debug(w);

    } catch (err) {
        console.error(err);
    }

}

//this updateObject is written generically
//but what it will display will be particular to the implementation
// read out fro mthe form the required pieces of information (which object and in what table it is)
function deleteObject(event) {
    console.debug("# deleteObject");
    console.debug(event);

    var object_id = event.target.parentNode.parentNode.getAttribute('object_id');

    var indexedDbName = event.target.parentNode.parentNode.parentNode.parentNode.getAttribute('indexedDbName');

    var objectStoreName = event.target.parentNode.parentNode.parentNode.parentNode.getAttribute('objectStoreName');

    var p = deleteFromIndexedDB_async(indexedDbName, objectStoreName, object_id);

    p.then(function (res) {
        console.debug(res)
    });

    // send update message to in-memory database


    // send message to background, to request a refresh of the in-memory databases for this policy object
    browser.runtime.sendMessage({
        request: {
            "policy": "single_delete",
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

//create table for database objects
//append the created table node object as a child to the node passed in the "node" parameter
// creating only the data rows, no column header of the table object, which must be created separately
function setup_database_objects_table_dataonly_async(indexedDbName, objectStoreName, keyId_json_path, table_id, node, table_conf, header_conf, column_conf) {
    //

    /*
     * indexedDbName
     * objectStore
     * keyId_json_path
     * table_id
     * node    DOM node below which the table object is appended
     * table_conf
     * header_conf
     * column_conf
     */
    try {
        return new Promise(
            function (resolve, reject) {

            var tbody = document.createElement("tbody");
            tbody.setAttribute("class", "scrollContent");

            node.appendChild(tbody);

            var dbRequest = indexedDB.open(indexedDbName);
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
                var transaction = database.transaction(objectStoreName, 'readonly');
                var objectStore = transaction.objectStore(objectStoreName);

                if ('getAll' in objectStore) {
                    // IDBObjectStore.getAll() will return the full set of items
                    // in our store.
                    objectStore.getAll().onsuccess = function (event) {
                        const res = event.target.result;
                        // console.debug(res);
                        for (const url of res) {

                            const tr = writeTableRow(url, column_conf, keyId_json_path);

                            // create add row to table

                            tbody.appendChild(tr);

                        }
                        resolve(tbody);
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

                }

            };
            // table_obj.appendChild(tbody);

            try {
                console.debug("insert before");
                console.debug(node.querySelectorAll("button")[0]);

                //resolve(div_table_obj);
            } catch (e) {
                node.appendChild(tbody);
                //resolve(div_table_obj);

            }

        });
    } catch (e) {
        console.debug(e)
    }

}

//create table for database objects
//append the created table node object as a child to the node passed in the "node" parameter
function setup_database_objects_table_async(indexedDbName, objectStoreName, keyId_json_path, table_id, node, table_conf, header_conf, column_conf) {

    /*
     * indexedDbName
     * objectStore
     * keyId_json_path
     * table_id
     * node    DOM node below which the table object is appended
     * table_conf
     * header_conf
     * column_conf
     */
    try {
        return new Promise(
            function (resolve, reject) {

            //var table_conf = JSON.parse(JSON.stringify(t));
            //var header_conf = JSON.parse(JSON.stringify(h));
            //var column_conf = JSON.parse(JSON.stringify(c));


            console.debug("# setup_database_objects_table");
            //console.debug("objectStore: " + objectStoreName);
            //console.debug("indexedDbName: " + indexedDbName);
            // console.debug("node: " + JSON.stringify(node));

            //console.debug("table_conf: " + JSON.stringify(table_conf));
            //console.debug("header_conf: " + JSON.stringify(header_conf));
            //console.debug("column_conf: " + JSON.stringify(column_conf));


            // ##########
            // list all objects in db
            // ##########


            // var table_obj = createTable(table_conf, key);

            var div_table_obj = document.createElement("div");
            div_table_obj.setAttribute("class", "tableContainer");
            var table_obj = document.createElement("table");

            table_obj.setAttribute("class", "scrollTable");
            table_obj.setAttribute("width", "100%");
            table_obj.setAttribute("id", table_id);
            table_obj.setAttribute("indexedDbName", indexedDbName);
            table_obj.setAttribute("objectStoreName", objectStoreName);

            div_table_obj.appendChild(table_obj);

            var thead = document.createElement("thead");
            thead.setAttribute("class", "fixedHeader");
            thead.appendChild(writeTableHeaderRow("normalRow", header_conf));
            thead.appendChild(writeTableFilterRow("normalRow", header_conf));

            table_obj.appendChild(thead);

            node.appendChild(table_obj);

            var tbody = document.createElement("tbody");
            tbody.setAttribute("class", "scrollContent");

            node.appendChild(tbody);

            var dbRequest = indexedDB.open(indexedDbName);
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
                var transaction = database.transaction(objectStoreName, 'readonly');
                var objectStore = transaction.objectStore(objectStoreName);

                if ('getAll' in objectStore) {
                    // IDBObjectStore.getAll() will return the full set of items
                    // in our store.
                    objectStore.getAll().onsuccess = function (event) {
                        const res = event.target.result;
                        // console.debug(res);
                        for (const url of res) {

                            const tr = writeTableRow(url, column_conf, keyId_json_path);

                            // create add row to table

                            tbody.appendChild(tr);

                        }
                        resolve(div_table_obj);
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
                }
            };
            table_obj.appendChild(tbody);

            try {
                console.debug("insert before");
                console.debug(node.querySelectorAll("button")[0]);
                node.insertBefore(table_obj, node.querySelectorAll("button")[0]);
                //resolve(div_table_obj);
            } catch (e) {
                node.appendChild(table_obj);
                //resolve(div_table_obj);
            }
        });
    } catch (e) {
        console.debug(e)
    }
}

var TableLastSortedColumn = -1;

// pass in a JSON with a descrition columns
// return


function createTable(data, table_conf, row_conf, column_conf) {
    // console.debug("# createTable" );
    // console.debug("data: " + JSON.stringify(data));
    // console.debug("table_conf: " + JSON.stringify(table_conf));
    // console.debug("row_conf: " + JSON.stringify(row_conf));
    // console.debug("column_conf: " + JSON.stringify(column_conf));

    var table_obj = null;

    try {
        table_obj = document.createElement("table");

        if (table_conf.hasOwnProperty('class')) {
            table_obj.setAttribute("class", table_conf.class);
        }
        // table_obj.setAttribute("width", "100%");

        // loop though data to create one row for each
        var i = 0;
        while (i < data.length && i < 5) {

            var tr_i = createTableRow(data[i], row_conf, column_conf);

            table_obj.appendChild(tr_i);
            i++;
        }

    } catch (e) {
        console.debug(e)
    }

    return table_obj;
}

function createTableRow(data, row_conf, column_conf) {
    console.debug("# createTableRow start");
    console.debug("data: " + JSON.stringify(data));
    console.debug("row_conf: " + JSON.stringify(row_conf));
    console.debug("column_conf: " + JSON.stringify(column_conf));

    var row_obj = null;

    try {
        row_obj = document.createElement("tr");

        if (row_conf.hasOwnProperty('class')) {
            row_obj.setAttribute("class", row_conf.class);
        }

        // table_obj.setAttribute("id", table_id);

        // loop though column conf to create one column for each
        var i = 0;
        var column_count = column_conf.length;
        // console.debug("column_count: " + column_count);
        while (i < column_count && i < 5) {

            var tr_i = writeTableCell(data, column_conf[i]);

            row_obj.appendChild(tr_i);
            i++;
        }

    } catch (e) {
        console.debug(e)
    }

    return row_obj;
}

// ensure fixed header row in scrollable table
// http://www.imaputz.com/cssStuff/bigFourVersion.html

// return table row (header) object
function writeTableHeaderRow(row_class, row_conf) {
    //  console.debug("## writeTableHeaderRow");


    var tr = null;

    try {

        // t_head.setAttribute("style", "position: absolute; color: #000");

        tr = document.createElement("tr");
        // tr.setAttribute("style", "display: block; position: relative; color:
        // #000");
        tr.setAttribute("class", row_class);

        for (var i = 0; i < row_conf.length; i++) {
            var obj = row_conf[i];
            // create a column for each

            // console.debug(JSON.stringify(obj));
            // console.debug("create column header ");

            var i_col = document.createElement("th");

            i_col.setAttribute("col_num", i);
            // i_col.setAttribute("style", "background: #C96; text-align: left;
            // border-top: 1px; padding: 4px" );

            // create clickable link
            var a_ref = document.createElement("a");
            // set data type here
            // T for text
            // D for dates
            // N for numbers
            // a_ref.setAttribute("href", "javascript:SortTable("+i+",'T'," +
            // table_id +");");
            // i_col.innerHTML = obj.text;
            i_col.appendChild(document.createTextNode(obj.text));

            // create event listener to trigger sorting on the column
            i_col.addEventListener('click', function (event) {
                // SortTable(i, 'T', table_id);
                sortColumn(event);
            })
            i_col.appendChild(a_ref);
            tr.appendChild(i_col);

        }
    } catch (e) {
        console.debug(e)
    }

    return tr;

}

//ensure fixed header row in scrollable table

// create filter row
// enter rexexp in field to filter the column on this regexp
//return table row (header) object
function writeTableFilterRow(row_class, row_conf) {
    console.debug("## writeTableFilterRow");

    var tr = null;

    try {

        // t_head.setAttribute("style", "position: absolute; color: #000");

        tr = document.createElement("tr");
        // tr.setAttribute("style", "display: block; position: relative; color:
        // #000");
        tr.setAttribute("class", "filter_row");

        for (var i = 0; i < row_conf.length; i++) {
            var obj = row_conf[i];
            // create a td for each

            // console.debug(JSON.stringify(obj));
            // console.debug("create column header ");

            var i_col = document.createElement("td");

            i_col.setAttribute("col_num", i);
            // i_col.setAttribute("style", "background: #C96; text-align: left;
            // border-top: 1px; padding: 4px" );
            i_col.setAttribute("contenteditable", "true");
            i_col.setAttribute("class", "filter");

            // create default filter
            // var a_ref = document.createElement("a");
            // set data type here
            // T for text
            // D for dates
            // N for numbers
            // a_ref.setAttribute("href", "javascript:SortTable("+i+",'T'," +
            // table_id +");");
            // i_col.innerHTML = obj.text;
            i_col.appendChild(document.createTextNode(".*"));

            // create event listener to trigger sorting on the column
            //  i_col.addEventListener('change', function (event) {
            // 	 console.debug("evt");
            //      filterColumn(event);
            //  });


            //i_col.appendChild(a_ref);
            tr.appendChild(i_col);

        }

        // add button to the end and have filtering be triggered by this

        var n_col = document.createElement("td");

        var filter_button = document.createElement("button");
        filter_button.appendChild(document.createTextNode("filter"));
        n_col.appendChild(filter_button);

        n_col.addEventListener('click', function (event) {
            // console.debug(event);
            filterColumn(event);
        });
        tr.appendChild(n_col);

    } catch (e) {
        console.debug(e)
    }

    return tr;

}

function filterColumn(event) {
    console.debug("# filtercolumn");

    // filter takes into account all filters on all columns simultaneously.

    // create one regexp for each column

    var filter_row = event.target.parentNode.parentNode;

    // loop through all and create an array of reg exp where position match column number
    var col_filters = [];
    //console.debug(filter_row.querySelectorAll("td.filter"));
    var filter_fields = filter_row.querySelectorAll("td.filter");

    // depending on whether or not this is going to be a regexp match, make some adjustments to the filter
    if (document.getElementById('filterregexp').checked == true) {
        // regexp
        for (var f = 0; f < filter_fields.length; f++) {
            //	console.debug(filter_fields[f].textContent );
            //var fil = new RegExp( filter_fields[f].textContent   );
            // conver a single leading * to .*
            col_filters.push(new RegExp(filter_fields[f].textContent.replace(/^\*/g, ".*")));
            //console.debug(fil);
        }
    } else {
        // wildcard
        for (var f = 0; f < filter_fields.length; f++) {
            //	console.debug(filter_fields[f].textContent );
            //var fil = new RegExp( filter_fields[f].textContent   );
            // convert single * to .*
            col_filters.push(new RegExp(filter_fields[f].textContent.replace(/\*/g, ".*")));
            //console.debug(fil);
        }

    }

    console.debug(event);

    console.debug(event.target);
    console.debug(event.target.td);
    var node = event.target;
    // get the number of the column

    var col_num = event.target.getAttribute('col_num');
    console.debug("col_num: " + col_num);
    // get the type of sort (text etc.)
    var sort_type = "T";
    console.debug("sort_type: " + sort_type);

    // get the direction of sort

    var table = event.target.parentNode.parentNode.parentNode.parentNode;
    console.debug(table);
    var all_data_rows = table.querySelectorAll("tbody > tr");
    // step through every row, and every field in that row to match against the filter. If any field in a row fail to match the filter, make the row not visible.

    // iterate rows

    console.debug(all_data_rows);
    for (var d_row = 0; d_row < all_data_rows.length; d_row++) {
        //console.debug(all_data_rows[d_row])
        //console.debug(all_data_rows[d_row].childNodes)

        var row_clears_all_filters = true;
        // step through all cells in the data row to see if they match the filter
        // count from the left-side of the table and only include the number of cells for thish there are filters
        for (var d_cell = 0; d_cell < col_filters.length; d_cell++) {
            //console.debug(all_data_rows[d_row].childNodes[d_cell])
            //console.debug(col_filters[d_cell].test(all_data_rows[d_row].childNodes[d_cell].textContent ) );
            // in case of mismatch, exit without checking any more cells in that row

            // If wildcard match has been selected (regexp is default)
            // rewrite typical expression

            console.debug("applying filter: " + col_filters[d_cell]);
            // use a regexp match
            if (!col_filters[d_cell].test(all_data_rows[d_row].childNodes[d_cell].textContent)) {
                //console.debug("remove this row for failure to match filter");
                row_clears_all_filters = false;
                d_cell = 100;
            }
        }
        if (!row_clears_all_filters) {
            // mark whole row invisible

            console.debug(all_data_rows[d_row]);
            console.debug(all_data_rows[d_row].parentNode);

            all_data_rows[d_row].setAttribute("class", "normalRow_not_visible");
        } else {
            // mark visible
            all_data_rows[d_row].setAttribute("class", "normalRow");
        }
    }

    //reflow(table);
    attachRowLevelButtonEventHandlers();
}

function sortColumn(event) {

    console.debug(event);

    console.debug(event.target);
    console.debug(event.target.th);
    var node = event.target;
    // get the number of the column

    var col_num = event.target.getAttribute('col_num');
    console.debug("col_num: " + col_num);
    // get the type of sort (text etc.)
    var sort_type = "T";
    console.debug("sort_type: " + sort_type);

    // get the direction of sort

    // id of table
    var table_id = event.target.parentNode.parentNode.parentNode.getAttribute('id');

    console.debug(event.target.parentNode);
    console.debug(event.target.parentNode.parentNode);
    console.debug(event.target.parentNode.parentNode.parentNode);
    console.debug(event.target.parentNode.parentNode.parentNode.getAttribute('id'));

    console.debug("table_id: " + table_id);

    SortTable(col_num, sort_type, table_id);
    // trigger redraw/reflow
    // document.getElementsByTagName('body')[0].focus();

    console.debug("table_id: " + table_id);
    console.debug(document.getElementById(table_id));
    reflow(document.getElementById(table_id));
    attachRowLevelButtonEventHandlers();
}

function SortTable() {
    var sortColumn = parseInt(arguments[0]);
    var type = arguments.length > 1 ? arguments[1] : 'T';
    var TableIDvalue = arguments.length > 2 ? arguments[2] : '';
    var dateformat = arguments.length > 3 ? arguments[3] : '';

    var table = document.getElementById(TableIDvalue);

    // console.debug(sortColumn);
    // console.debug(type);
    // console.debug(TableIDvalue);
    // console.debug(table);

    var tbody = table.getElementsByTagName("tbody")[0];
    // get the principal rows in the table
    // var rows = tbody.getElementsByTagName("tr");

    var rows = tbody.querySelectorAll('tr.normalRow');
    var arrayOfRows = new Array();
    type = type.toUpperCase();
    dateformat = dateformat.toLowerCase();
    for (var i = 0, len = rows.length; i < len; i++) {
        arrayOfRows[i] = new Object;
        arrayOfRows[i].oldIndex = i;
        // console.debug(rows);
        // console.debug(rows[i]);
        // console.debug(rows[i].getElementsByTagName("td"));
        // console.debug(sortColumn);
        // console.debug(rows[i].getElementsByTagName("td")[sortColumn]);
        var celltext = rows[i].getElementsByTagName("td")[sortColumn].innerHTML.replace(/<[^>]*>/g, "");
        if (type == 'D') {
            arrayOfRows[i].value = GetDateSortingKey(dateformat, celltext);
        } else {
            var re = type == "N" ? /[^\.\-\+\d]/g : /[^a-zA-Z0-9]/g;
            console.debug(celltext.replace(re, "").substr(0, 25).toLowerCase());
            arrayOfRows[i].value = celltext.replace(re, "").substr(0, 25).toLowerCase();
        }
    }
    if (sortColumn == TableLastSortedColumn) {
        arrayOfRows.reverse();
    } else {
        TableLastSortedColumn = sortColumn;
        switch (type) {
        case "N":
            arrayOfRows.sort(CompareRowOfNumbers);
            break;
        case "D":
            arrayOfRows.sort(CompareRowOfNumbers);
            break;
        default:
            arrayOfRows.sort(CompareRowOfText);
        }
    }
    var newTableBody = document.createElement("tbody");
    newTableBody.setAttribute("class", "scrollContent");
    for (var i = 0, len = arrayOfRows.length; i < len; i++) {
        newTableBody.appendChild(rows[arrayOfRows[i].oldIndex].cloneNode(true));
    }

    var one = tbody.parentNode.replaceChild(newTableBody, tbody);

    reflow(one);

} // function SortTable()

function CompareRowOfText(a, b) {
    var aval = a.value;
    var bval = b.value;
    return (aval == bval ? 0 : (aval > bval ? 1 : -1));
} // function CompareRowOfText()

function CompareRowOfNumbers(a, b) {
    var aval = /\d/.test(a.value) ? parseFloat(a.value) : 0;
    var bval = /\d/.test(b.value) ? parseFloat(b.value) : 0;
    return (aval == bval ? 0 : (aval > bval ? 1 : -1));
} // function CompareRowOfNumbers()

function GetDateSortingKey(format, text) {
    if (format.length < 1) {
        return "";
    }
    format = format.toLowerCase();
    text = text.toLowerCase();
    text = text.replace(/^[^a-z0-9]*/, "");
    text = text.replace(/[^a-z0-9]*$/, "");
    if (text.length < 1) {
        return "";
    }
    text = text.replace(/[^a-z0-9]+/g, ",");
    var date = text.split(",");
    if (date.length < 3) {
        return "";
    }
    var d = 0,
    m = 0,
    y = 0;
    for (var i = 0; i < 3; i++) {
        var ts = format.substr(i, 1);
        if (ts == "d") {
            d = date[i];
        } else if (ts == "m") {
            m = date[i];
        } else if (ts == "y") {
            y = date[i];
        }
    }
    d = d.replace(/^0/, "");
    if (d < 10) {
        d = "0" + d;
    }
    if (/[a-z]/.test(m)) {
        m = m.substr(0, 3);
        switch (m) {
        case "jan":
            m = String(1);
            break;
        case "feb":
            m = String(2);
            break;
        case "mar":
            m = String(3);
            break;
        case "apr":
            m = String(4);
            break;
        case "may":
            m = String(5);
            break;
        case "jun":
            m = String(6);
            break;
        case "jul":
            m = String(7);
            break;
        case "aug":
            m = String(8);
            break;
        case "sep":
            m = String(9);
            break;
        case "oct":
            m = String(10);
            break;
        case "nov":
            m = String(11);
            break;
        case "dec":
            m = String(12);
            break;
        default:
            m = String(0);
        }
    }
    m = m.replace(/^0/, "");
    if (m < 10) {
        m = "0" + m;
    }
    y = parseInt(y);
    if (y < 100) {
        y = parseInt(y) + 2000;
    }
    return "" + String(y) + "" + String(m) + "" + String(d) + "";
} // function GetDateSortingKey()


// return td object
function writeTableCell(data, cell_conf) {
    // console.debug("### writeTableCell ");
    // console.debug("data: " + JSON.stringify(data));
    console.debug("cell_conf: " + JSON.stringify(cell_conf));

    var cell = null;
    try {

        cell = document.createElement("td");
        if (cell_conf.hasOwnProperty('class')) {
            cell.setAttribute("class", cell_conf['class']);
        }

        var json_path = "";
        if (cell_conf.hasOwnProperty('json_path')) {
            json_path = cell_conf['json_path'];

            cell.appendChild(document.createTextNode(data[json_path]));
        }
        // console.debug("json_path: " +json_path );
        // console.debug("data: " +data[json_path] );


    } catch (e) {
        console.debug(e)
    }
    return cell;
}

function writeTableNode(rule, node_conf, type, key) {
    // console.debug("### writeTableNode ");
    // console.debug("rule " + JSON.stringify(rule));
    // console.debug(rule);

    var node = null;
    var n = node_conf;
    try {
        //console.debug("node definition " + JSON.stringify(node_conf));

        node = document.createElement(node_conf.name);

        // node configuration has sub nodes ?
        if (node_conf.hasOwnProperty('subnodes')) {

            for (var i = 0; i < node_conf.subnodes.length; i++) {
                // var obj = node_conf.subnodes[i];
                // console.debug("###### has sub nodes " + JSON.stringify(obj));
                node.appendChild(writeTableNode(rule, node_conf.subnodes[i], type, key));
            }
        }
        // if a class has been specified in the data field configuration, add it to the output html

        if (node_conf.hasOwnProperty('class')) {
            node.setAttribute("class", node_conf['class']);
        }
        if (node_conf.hasOwnProperty('text')) {
            // node.appendChild(document.createTextNode(node_conf.text.substring(1)));
            node.appendChild(document.createTextNode(node_conf.text));

            // node.appendChild(document.createTextNode("HHHH"));
        }
        if (node_conf.hasOwnProperty('EventListener')) {

            var func = node_conf.EventListener.func;

            // console.debug("node hadeleteObjects event listener function:" +
            // func);

            // depending on the parameter set for which function to call

            switch (func) {
            case "deleteObject":
                // console.debug("####node has event listener
                // deleteDecryptionKey:" +
                // func);
                node.addEventListener('click', function () {
                    deleteObject(event);
                })
                break;
            case "updateObject":
                // console.debug("####node has event listener
                // updateEncryptionKey:" +
                // func);
                node.addEventListener('click', function (event) {
                    console.debug(event);
                    updateObject(event);
                })
                break;
            case "goToYellowNoteOnLocation":
                // console.debug("####node has event listener exportPrivateKey:" +
                // func);
                node.addEventListener('click', function () {
                    goToYellowNoteOnLocation(event);
                })
                break;
            }
        }
    } catch (e) {
        console.debug(e)
    }
    return node;
}

// return tr object
function writeTableRow(row_data, column_conf, keyId_json_path) {
    //console.trace("## writeTableRow");
    //console.trace("row_data " + JSON.stringify(row_data));
    //console.trace("column_conf " + JSON.stringify(column_conf));
    //console.trace("key " + JSON.stringify(key));
    // console.trace("type " + JSON.stringify(type));

    // start a table row
    const tr = document.createElement("tr");
    try {

        // look through the column definitions as to what goes into the fields in a
        // table row. For each definition create a data cell (td) in the table row (tr)
        var i = 0;
        while (i < column_conf.length && i < 25) {
        	   var cell_conf = column_conf[i];
               
            // present according to the specification in the "format"-field in
            // the column configuration
            var presentation_format = "text";
            if (cell_conf.hasOwnProperty('presentation_format')) {
                presentation_format = cell_conf.presentation_format;
            }

        	
            try {
                // each table row represents a unique value in the database. Add a reference to this in the row objwct itself


                if (row_data.hasOwnProperty(keyId_json_path)) {
                    tr.setAttribute('object_id', row_data[keyId_json_path]);
                }

                //console.debug("cell_conf " + JSON.stringify(cell_conf));

                var i_col = document.createElement("td");

                // if class has been specified, include it in the markup
                if (cell_conf.hasOwnProperty('class')) {
                    i_col.setAttribute("class", cell_conf['class']);
                }
                // add any additional attributes to the node
                if (cell_conf.hasOwnProperty('other_attributes')) {
                    for (var a = 0; a < cell_conf.other_attributes.length; a++) {
                        Object.keys(cell_conf.other_attributes[a]).forEach(function (key) {
                            i_col.setAttribute(key, cell_conf.other_attributes[a][key]);
                        })

                    }
                }

                if (cell_conf.hasOwnProperty('json_path')) {
                    // use value json_path to lookup in the row_data json structure

                    var cell_data = row_data[cell_conf.json_path];
                    //console.debug(presentation_format);

                    // how should the data be presented
                    
                    if (presentation_format == "JSON") {

                        i_col.appendChild(document.createTextNode(JSON.stringify(cell_data)));
                    } else if (presentation_format == "table") {
                        // render a table inside the cell based on the detailed
                        // specifications contained in the "cell_table_column_conf"
                        // is not was specified, forget it.
                        if (cell_conf.hasOwnProperty('cell_table_conf')) {
                            var cell_table_conf = cell_conf.cell_table_conf;

                            var cell_table = document.createElement("table");
                            cell_table.setAttribute('class', cell_table_conf.table_conf.class);

                            // loop through all data objects that need a separate
                            // row in the cell-level
                            // table
                            var cell_table_row_count = cell_data.length;

                            // set a maximum of row permitted in a table embedded
                            // inside a cell
                            var max_cell_table_rows = 8;
                            var k = 0;
                            while (k < cell_table_row_count && k < max_cell_table_rows) {
                                var cell_data_row = cell_data[k];

                                var cell_table_row = document.createElement("tr");
                                cell_table_row.setAttribute('class', cell_table_conf.row_conf.class);

                                // loop through all cells configure for this row

                                var cell_table_row_cell_count = cell_table_conf.column_conf.length;

                                // iterate over the number of configured columns
                                // (max 15)
                                var max_cell_table_cells = 15;
                                var m = 0;
                                while (m < cell_table_row_cell_count && m < max_cell_table_cells) {
                                    var cell_table_column_conf = cell_table_conf.column_conf[m];
                                    var cell_table_cell = document.createElement("td");
                                    try {
                                        if (cell_table_column_conf.class) {
                                            cell_table_cell.setAttribute('class', cell_table_column_conf.class);
                                        }
                                        var cell_data_path = cell_table_column_conf.json_path;
                                        // look for path in "cell_data_path" variable in the row_data object
                                        var presentation_format = cell_table_column_conf.presentation_format;

                                        // depending on the presentation format take
                                        // configurable action here
                                        if (presentation_format == "table") {
                                            // create a small table to contain the list

                                            var list_table = createTable(cell_data_row[cell_data_path], cell_table_column_conf.cell_table_conf.table_conf, cell_table_column_conf.cell_table_conf.row_conf, cell_table_column_conf.cell_table_conf.column_conf);
                                            cell_table_cell.appendChild(list_table);

                                        } else {
                                            // present the data as text
                                            var newContent = document.createTextNode(cell_data_row[cell_data_path]);
                                            cell_table_cell.appendChild(newContent);
                                        }
                                    } catch (e) {
                                        console.error(e);
                                    }
                                    cell_table_row.appendChild(cell_table_cell);
                                    m++
                                }

                                // add row to table
                                cell_table.appendChild(cell_table_row);
                                k++;
                            }

                            i_col.appendChild(cell_table);

                        } else {
                            console.error("cell_table_column_conf attribute missing");
                        }
                    } else if (presentation_format == "dropdown") {
                        // render a dropdown list
                    	
                    } else if (presentation_format == "hidden") {
                        // add this field as an attribute of the tr row object
                    	// use the name field in the config as attribute name

                    	 if (cell_conf.hasOwnProperty('name')) {
                    		 //console.debug( cell_conf.name );
                    		 //console.debug( cell_data );
                    		 
                    		 tr.setAttribute(cell_conf.name,cell_data);
                    	 }
                    	
                    } else if (presentation_format == "timestamp") {
                        // render a timestamp

                        //	console.debug(convert_timestamp_from_machinereadable_to_humanreadable(cell_data));
                        i_col.appendChild(document.createTextNode(convert_timestamp_from_machinereadable_to_humanreadable(cell_data)));
                        //((console.debug("TIESTAMP");

                    } else if (presentation_format == "boolean") {
                        // present true/false checkbox

                        //  i_col.appendChild(document.createTextNode(row_data[cell_conf.json_path]));
                        var checkbox = document.createElement("input");
                        checkbox.setAttribute('type', 'checkbox');

                        if (typeof row_data[cell_conf.json_path] == 'undefined') {
                            // assume enable if information is missing
                            checkbox.setAttribute('checked', 'checked');
                        } else {
                            if (row_data[cell_conf.json_path] == true) {
                                // check the box
                                console.debug("check");
                                checkbox.setAttribute('checked', 'checked');
                            } else {
                                // leave box unchecked
                                console.debug("uncheck");
                                try {
                                    checkbox.removeAttribute('checked');
                                } catch (e) {}
                            }
                        }
                        i_col.appendChild(checkbox);

                    } else {
                        // for all other, treat as cell content as plain text
                        i_col.appendChild(document.createTextNode(row_data[cell_conf.json_path]));
                    }
                } else if (cell_conf.hasOwnProperty('node')) {

                    var node = writeTableNode(row_data, cell_conf.node);

                    // any eventlisteners defined ?

                    i_col.appendChild(node);

                }
            } catch (e) {
                console.error(e);
            }
            
            // only add table cells for non-hidden 
            if (presentation_format != "hidden"){
            tr.setAttribute("class", "normalRow");
            tr.appendChild(i_col);
            }
            
            i++;
        }
    } catch (e) {
        console.error(e);
    }

    return tr;
}

function reflow(elt) {
    void elt.offsetWidth;
    console.debug(elt.offsetHeight);
}

function convert_timestamp_from_machinereadable_to_humanreadable(old) {

    var is_timestamp = /^[0-9]*$/;

    if (is_timestamp.test(old)) {
        //console.debug("ok, convert");
        var new_value = "";
        // write out a more "reader-friendly" timestamp
        new_value = old.replace(/^([0-9]{4}).*/, "$1") + "-" + old.replace(/^.{4}([0-9]{2}).*/, "$1") + "-" + old.replace(/^.{6}([0-9]{2}).*/, "$1") + " " + old.replace(/^.{8}([0-9]{2}).*/, "$1") + ":" + old.replace(/^.{10}([0-9]{2}).*/, "$1") + ":" + old.replace(/^.{12}([0-9]{2}).*/, "$1");
        //console.debug(new_value);
        return new_value;

    } else {
        return old;

    }
}

function convert_timestamp_from_humanreadable_to_machinereadable(old) {
    var new_value = "";
    // write out a more "reader-friendly" timestamp
    new_value = old.replace(/[- :]*/g, "");
    //console.debug(new_value);
    return new_value;

}

function create_scope_dropdown_list() {

    var step_function_list = document.createElement('select');
    var opt_1 = document.createElement('option');
    opt_1.setAttribute("value", "all");
    opt_1.appendChild(document.createTextNode("All"));
    step_function_list.appendChild(opt_1);

    var opt_2 = document.createElement('option');
    opt_2.setAttribute("value", "hostname");
    opt_2.appendChild(document.createTextNode("Host"));
    step_function_list.appendChild(opt_2);

    var opt_3 = document.createElement('option');
    opt_3.setAttribute("value", "domain");
    opt_3.appendChild(document.createTextNode("Domain name"));
    step_function_list.appendChild(opt_3);

    var opt_4 = document.createElement('option');
    opt_4.setAttribute("value", "URL");
    opt_4.appendChild(document.createTextNode("URL"));
    step_function_list.appendChild(opt_4);

    return step_function_list;

}
