var dataRows;
var rowTopOfTable;
var rowCount;
var displayPage;
var pageCount;
var writePerm;
var dayIsLocked;
var confirmAddDelete;

var CELL_WIDTH = 100;
var CELL_WIDTH_WIDE = 150;
var CELL_HEIGHT = 18; // + 2 padding, + 1 border = 21px per row
var tabDates;
var tabData;
var detailsToPoints;
var addRedirect;
var colWidths;
var gdObjectId, gdObjectType, gdEventType, gdProduct;
var hasEventType;
var hasObjectDependencies = false; // set to true to call project-specific code when the object is changed.
var lstObjType, lstObjId;

function SEOnPageLoad() {
    headerRows = 2;
    ResizeDivDataRight();
    InitDataTableHeight();
    rowTopOfTable = 0;

    hasEventType = !!(document.getElementById('lstEventType'));
    if (hasEventType)
        gdEventType = document.getElementById('lstEventType').value;
    PageMethods.set_defaultFailedCallback(GeneralFailedCallback);
    tabDates = document.getElementById('tabDates');
    tabData = document.getElementById('tabData');
    ResetTables(true, true);

    if (document.getElementById('lnkObjects'))
        document.getElementById('lnkObjects').onclick = new Function("return false;");

    if (document.getElementById('lstProductId')) {
        document.getElementById('lstProductId').onchange = lstProductChanged;
        gdProduct = document.getElementById('lstProductId').value;
    }

    // divert the button clicks to js functions
    document.getElementById('btnGetData').onclick = btnGetDataClick;
    document.getElementById('btnAddRow').onclick = btnAddRowClick;
    document.getElementById('btnSave').onclick = btnSaveClick;
    ToolbarButtonDisable('btnAddRow');
    ToolbarButtonDisable('btnSave');

    lstObjType = document.getElementById('lstObjectType');
    lstObjId = document.getElementById('lstObjectId');
    if (lstObjType)
        lstObjType.onchange = lstObjectTypeChanged;
    if (lstObjId)
        lstObjId.onchange = lstObjectIdChanged;
    if (hasEventType)
        document.getElementById('lstEventType').onchange = lstEventTypeChange;

    document.getElementById('btnFirst').onclick = btnFirstClick;
    document.getElementById('btnLeft').onclick = btnLeftClick;
    document.getElementById('btnRight').onclick = btnRightClick;
    document.getElementById('btnLast').onclick = btnLastClick;

    if (document.getElementById('btnDayPrev'))
        document.getElementById('btnDayPrev').onclick = btnDayPrevClick;
    if (document.getElementById('btnDayNext'))
        document.getElementById('btnDayNext').onclick = btnDayNextClick;

    PageMethods.SEHasWritePermission(HasWriteCallback);
}

function HasWriteCallback(result) {
    writePerm = result;
    PageMethods.SEGetHeaders(lstObjType.value, lstObjId.value, InitialGetHeadersCallback);
}

function InitialGetHeadersCallback(result) {
    SetHeaders(result);
    PageMethods.SEGetPageLoadInfo(GetPageLoadInfoCallback);
}

function GetPageLoadInfoCallback(result) {
    if (result[1] != 0) { // object has been loaded
        rowTopOfTable = result[0];
        btnGetDataClick();
    }
}

function lstProductChanged() {
    var lstProduct = document.getElementById('lstProductId');
    if (lstProduct.value == gdProduct)
        return;

    if (cd()) {
        gdProduct = lstProduct.value;
        PageMethods.SetProduct(gdProduct, btnGetDataClick, GeneralFailedCallback);
    }
    else
        lstProduct.value = gdProduct;
}

// ********* Button click functions *********

function btnGetDataClick() {
    if (!cd()) return false;
    window.status = 'Loading...';
    PageMethods.SEGetHeaders(lstObjType.value, lstObjId.value, GetHeadersCallback);
    return false;
}

function GetHeadersCallback(result) {
    ResetTables(false, true);
    SetHeaders(result);
    var dateFrom = document.getElementById('dtpFrom').children[0];
    var dateTo;
    var needFrom = false; // Whether a from date is required
    var statusMessage = 'Select an object.';
    if (document.getElementById('dtpTo').style.display != 'none')
        dateTo = document.getElementById('dtpTo').children[0];
    else {
        dateTo = dateFrom;
        needFrom = true; // Single date screen - needs a date
        statusMessage = 'Select an object and date.';
    }
    if (lstObjType.value != '' && lstObjId.value != '' && (!needFrom || dateFrom.value != '')) {
        PageMethods.SEGetData(lstObjType.value, lstObjId.value, dateFrom.value, dateTo.value, GetDataCallback);
    }
    else {
        ToolbarButtonDisable('btnAddRow');
        window.status = statusMessage;
        //Translate();
    }
    return false;
}

function GetDataCallback(result) {
    SetRowCount(result, true);

    gdObjType = lstObjType.value;
    gdObjId = lstObjId.value;
    if (hasEventType)
        gdEventType = document.getElementById('lstEventType').value; // save the event type used for the getData

    // check for this being a single-day screen, and if the day is locked
    if (!document.getElementById('dtpTo') ||
        (document.getElementById('dtpTo').style.display == 'none' || document.getElementById('dtpTo').style.visibility == 'hidden')
        && document.getElementById('dtpFrom').children[1].onclick.toString().indexOf('Month') == -1)
        PageMethods.SEDayIsLocked(DayIsLockedCallback);
    else
        DayIsLockedCallback(false);
}

function DayIsLockedCallback(result) {
    if (writePerm && result == false)
        ToolbarButtonEnable('btnAddRow', false, false);
    else
        ToolbarButtonDisable('btnAddRow');
    dayIsLocked = result;

    if (rowCount == 0)
        window.status = 'No data';
    else
        GetCurrentDataRows();
}

function GetCurrentDataRows() {
    window.status = 'Loading...';
    if (RowBeingEdited('tabData') != -1) // user is editing
        ExtractEditedData(MiddleofGetting); // save it back first
    else
        PageMethods.SEGetDataRows(rowTopOfTable, dataRows, GetDataRowsCallback, GeneralFailedCallback, 0); // get now
}

// the line is ok so we can continue to take out of edit mode then save
function MiddleofGetting(result, rowNum) {
    FillDataRow(result, rowNum);
    PageMethods.SEGetDataRows(rowTopOfTable, dataRows, GetDataRowsCallback, GeneralFailedCallback, 0);
}

function GetDataRowsCallback(result, tableRow) {
    if (result == null) {
        ResetTables(true, false);
        window.status = 'No data';
    }
    else {
        FillDataRows(result, tableRow);
        UpdatePageNumInfo();
        //Translate();
        window.status = 'Ready';
    }
}
function btnAddRowClick() {
    if (confirmAddDelete && !confirm("Are you sure you want to Add?"))
        return false;
    if (RowBeingEdited('tabData') != -1) // user is editing
        ExtractEditedData(MiddleOfAdding); // save it back first
    else
        PageMethods.SEAddRow(AddCallback); // go directly to Add
}

function MiddleOfAdding(result, rowNum) {
    FillDataRow(result, rowNum);
    PageMethods.SEAddRow(AddCallback);
}

function AddCallback(result) {
    if (addRedirect) {
        if (cd())
            window.location = addRedirect + '?event_id=' + result.id + '&caller=' + document.URL;
    }
    else {
        MakeDirtyEnableSave();
        SetRowCount(rowCount + 1, true);
        if (rowTopOfTable + dataRows <= rowCount) { // this page is full
            rowTopOfTable = (pageCount - 1) * dataRows; // go to last page
            PageMethods.SEGetDataRows(rowTopOfTable, dataRows, AddToNewPageCallback, GeneralFailedCallback, 0);
        }
        else {
            var rowNum = tabData.rows.length;
            FillDataRow(result, rowNum);
            EditRowSet(rowNum, 1, 'tabData');
            document.getElementById('divData').scrollLeft = 0;
        }
    }
}

function AddToNewPageCallback(result, tableRow) {
    GetDataRowsCallback(result, tableRow);
    EditRowSet(tabData.rows.length - 1, 1, 'tabData');
    //tabData.rows[tabData.rows.length - 1].cells[1].onclick();
}

function btnSaveClick() {
    window.status = 'Saving...';
    if (RowBeingEdited('tabData') != -1) // user is editing
        ExtractEditedData(MiddleOfSaving); // save it back first
    else
        PageMethods.SESave(SaveCallback); // go directly to Save
}

// the line is ok so we can continue to take out of edit mode then save
function MiddleOfSaving(result, rowNum) {
    FillDataRow(result, rowNum);
    PageMethods.SESave(SaveCallback);
}

function SaveCallback(result) {
    ClearDirtyDisableSave();
    btnGetDataClick();
}

function btnFirstClick() {
    if (rowTopOfTable > 0) {
        rowTopOfTable = 0;
        GetCurrentDataRows();
    }
    return false;
}

function btnLeftClick() {
    if (rowTopOfTable >= dataRows) {
        rowTopOfTable -= dataRows;
        GetCurrentDataRows();
    }
    return false;
}

function btnRightClick() {
    if (rowTopOfTable < (pageCount - 1) * dataRows) {
        rowTopOfTable += dataRows;
        GetCurrentDataRows();
    }
    return false;
}

function btnLastClick() {
    if (rowTopOfTable < (pageCount - 1) * dataRows) {
        rowTopOfTable = (pageCount - 1) * dataRows;
        GetCurrentDataRows();
    }
    return false;
}

// Go back a day
function btnDayPrevClick() {
    if (cd()) {
        ClearDirtyDisableSave();
        var dateFrom = document.getElementById('dtpFrom').children[0];
        var selDate = parseDate(dateFrom.value);
        selDate.setDate(selDate.getDate() - 1);
        dateFrom.value = formatDate(selDate);
        btnGetDataClick();
    }
    return false;
}

// Go forward a day
function btnDayNextClick() {
    if (cd()) {
        ClearDirtyDisableSave();
        var dateFrom = document.getElementById('dtpFrom').children[0];
        var selDate = parseDate(dateFrom.value);
        selDate.setDate(selDate.getDate() + 1);
        dateFrom.value = formatDate(selDate);
        btnGetDataClick();
    }
    return false;
}

function btnDeleteRowClickCtx(rowNum) {
    if (confirmAddDelete && !confirm("Are you sure you want to delete this row?"))
        return;
    wantToDelete = rowNum;
    if (RowBeingEdited('tabData') != -1) // currently editing a different row
        ExtractEditedData(DeleteExtract);
    else
        MiddleOfDeleting(rowNum);
}

function btnDeleteRowClick() {
    if (confirmAddDelete && !confirm("Are you sure you want to delete this row?"))
        return false;
    var rowNum = this.parentElement.parentElement.rowIndex;
    wantToDelete = rowNum;
    if (RowBeingEdited('tabData') != -1) // currently editing a different row
        ExtractEditedData(DeleteExtract);
    else
        MiddleOfDeleting(rowNum);
    return false;
}

function DeleteExtract(result, rowNum) {
    FillDataRow(result, rowNum);
    MiddleOfDeleting(wantToDelete);
}

function MiddleOfDeleting(rowNum) {
    var myRow = tabDates.rows[rowNum];
    PageMethods.SEDeleteRow(myRow.cells[0].eventId, DeleteRowCallback, GeneralFailedCallback, rowNum);
}

function DeleteRowCallback(result, rowNum) {
    tabDates.deleteRow(rowNum);
    tabData.deleteRow(rowNum);
    MakeDirtyEnableSave();
    SetRowCount(rowCount - 1, false);
    if (rowTopOfTable + dataRows <= rowCount) { // there is one on next page to show on this page
        PageMethods.SEGetDataRows(rowTopOfTable + dataRows - 1, 1, GetDataRowsCallback, GeneralFailedCallback, dataRows - 1);
    }
    else if (rowTopOfTable > rowCount - 1) { // no more rows on this page
        SetRowCount(rowCount, true);
        GetCurrentDataRows(); // rowTopOfTable already corrected, just refresh screen
    }
}

function btnDetailsRowClickCtx(rowNum) {
    if (!cd()) return;
    var eventId = tabDates.rows[rowNum].cells[0].eventId;
    if (detailsToPoints)
        window.location = detailsToPoints + '?event_id=' + eventId + "&mode=edit&caller=" + document.URL;
    else
        window.location = '/Axis/MaintainSingleEvent.aspx?id=' + eventId + "&caller=" + document.URL;
}

function btnDetailsRowClick() {
    if (!cd()) return;
    var rowNum = this.parentElement.parentElement.rowIndex;
    btnDetailsRowClickCtx(rowNum);
}

function btnEmailRowClickCtx(rowNum) {
    if (!cd())
        return;

    var conf;
    var email = document.getElementById('lstWorkflowTo').value;
    if (email != '') {
        conf = confirm("This action will send a message to the following recipient: " + email + ".");
        if (conf) {
            PageMethods.SendWorkflowEmail(tabDates.rows[rowNum].cells[0].eventId, email, SendWorkflowEmailCallback);
        }
    }
    else {
        alert("No recipient selected/defined.");
    }
}

function SendWorkflowEmailCallback() {
    ClearDirtyDisableSave();
    alert("Email sent.");
    btnGetDataClick();
}

function EditRowClick() {
    var rowNum = GetParentObj(this, 'tr').rowIndex;
    var eventId = tabDates.rows[rowNum].cells[0].eventId;
    if (this.type && this.type == 'checkbox') {
        MakeDirtyEnableSave();
        ExtractRow(rowNum, nullFunc);
    }
    else {
        var colNum = GetCellIndex(GetParentObj(this, 'td'));
        var tableId = GetParentObj(this, 'table').id;
        EditRowSet(rowNum, colNum, tableId);
    }
}

function nullFunc() {
    return;
}

// Puts a row in edit mode.
function EditRowSet(rowNum, colNum, tableId) {
    var currentEditRow = RowBeingEdited('tabData');
    if (currentEditRow == rowNum) // editing the clicked row already
        return; // no action

    wantToEditRow = rowNum;
    wantToEditCol = colNum;
    wantToEditTable = tableId;
    if (currentEditRow != -1) // currently editing a different row
        ExtractEditedData(MiddleOfEditCallback);
    else
        MiddleOfEditClick(rowNum, colNum, tableId); // continue with going into edit mode
}

function MiddleOfEditCallback(result, rowNum) {
    FillDataRow(result, rowNum);
    MiddleOfEditClick(wantToEditRow, wantToEditCol, wantToEditTable);
}

function MiddleOfEditClick(rowNum, colNum, tableId) {
    // Take off onclick, onmouseover and colour the row
    var row1 = tabDates.rows[rowNum];
    var row2 = tabData.rows[rowNum];
    ClearRowEditClicks(row1, 0, 0);
    ClearRowEditClicks(row2, 0, row2.cells.length - 1);
    ClearMouseHilite(row1);
    ClearMouseHilite(row2);
    row1.style.backgroundColor = editingColour;
    row2.style.backgroundColor = editingColour;

    // date
    var myCell = row1.cells[0];
    var currentVal = GetCellText(myCell);
    var dPicker = null;
    if (row2.eventDateType == dataTypeDate)
        dPicker = AddDatePicker(myCell, currentVal, MakeDirtyEnableSave, "ProdDay");
    else
        dPicker = AddDateTimePicker(myCell, currentVal, MakeDirtyEnableSave);

    // status
    myCell = row2.cells[0];
    currentVal = GetCellText(myCell);
    var ddl = AddDdl(myCell, 'statusDdl', currentVal, 'none');
    PageMethods.SEGetStatuses(FillDdlCallback, GeneralFailedCallback, ddl);

    // data points
    var txt;
    for (col = 1; col < row2.cells.length; col++) {
        myCell = row2.cells[col];
        currentVal = myCell.innerText;
        var txtWidth = (colWidths && col < colWidths.length ? colWidths[col] - 8 : 76);
        if (myCell.style.backgroundColor != disabledGrey) {
            if (myCell.dataTypeInd == dataTypeDate) {
                txt = AddDatePicker(myCell, currentVal, MakeDirtyEnableSave, "ProdDay");
            }
            else if (myCell.dataTypeInd == dataTypeDateTime) {
                txt = AddDateTimePicker(myCell, currentVal, MakeDirtyEnableSave);
            }
            else {
                txt = AddRowTextBox(myCell, 'txtDP' + col, currentVal, txtWidth, true);
            }
        }
    }

    SetCellFocus(document.getElementById(tableId).rows[rowNum], colNum);
}

function selectObject(objectType, objectId) {
    var currentType = lstObjType.value;
    var currentId = lstObjId.value;
    if (currentType == objectType && currentId == objectId)
        return;

    if (cd()) {
        ClearDirtyDisableSave();
        if (currentType != objectType) {
            lstObjId.tempValue = objectId;
            lstObjType.value = objectType;
            lstObjectTypeChanged();
        }
        else { // object ID has changed
            lstObjId.value = objectId;
            lstObjectIdChanged();
        }
    }
}

function lstObjectTypeChanged() {
    var onlyValidObj = (document.getElementById('chkOnlyValidObj') ? document.getElementById('chkOnlyValidObj').checked : false);
    if (cd()) {
        ClearDirtyDisableSave();
        PageMethods.GetObjectIDs(lstObjType.value, onlyValidObj, objTypeChangeCallback);
    }
    else
        lstObjType.value = gdObjType;
}

function objTypeChangeCallback(result) {
    FillDdlCallback(result, lstObjId);
    lstObjectIdChanged();
}

function lstObjectIdChanged() {
    if (cd()) {
        ClearDirtyDisableSave();
        if (hasEventType) {
            PageMethods.SEGetEventTypes(lstObjType.value, lstObjId.value, GetEventTypesCallback);
        }
        else {
            ProcessObjectDependencies();
        }
    }
    else
        lstObjId.value = gdObjId;
}

// To perform custom processing after the selected object has been changed (e.g. refresh a dependent dropdown):
// Implement ProcessObjectDependencies & Callback, and set hasObjectDependencies to true, in the project sporadic event page.
function ProcessObjectDependencies() {
    if (hasObjectDependencies) {
        PageMethods.ProcessObjectDependencies(lstObjType.value, lstObjId.value, ProcessObjectDependenciesCallback);
    }
    else {
        btnGetDataClick();
    }
}

function GetEventTypesCallback(result) {
    var ddlEventType = document.getElementById('lstEventType');
    ddlEventType.tempValue = ddlEventType.value; // store current value so fill ddl will pick it up
    FillDdlCallback(result, ddlEventType);

    if (ddlEventType.value == '') // if old value not in new list
        ddlEventType.selectedIndex = 0; // select first from list
    PageMethods.SESetEventType(ddlEventType.value, eventTypeChangeCallback2);
}

function eventTypeChangeCallback2(result) {
    ProcessObjectDependencies();
}

function lstEventTypeChange() {
    if (cd()) {
        ClearDirtyDisableSave();
        PageMethods.SESetEventType(this.value, eventTypeChangeCallback);
    }
    else // revert back the event type
        document.getElementById('lstEventType').value = gdEventType;
}

function eventTypeChangeCallback(result) {
    btnGetDataClick();
}

// ********* General functions *********

function InitDataTableHeight() {
    var divData = document.getElementById("divData");
    var divDates = document.getElementById("divDates");
    var divTree = document.getElementById('panelTree');
    var dataTop = parseInt(divData.style.top.substr(0, divData.style.top.indexOf("px")));
    var treeTop = parseInt(divTree.style.top.substr(0, divTree.style.top.indexOf("px")));

    dataRows = Math.max(1, Math.floor((getHeight() - dataTop - 25 - (headerRows * (CELL_HEIGHT + 3))) / (CELL_HEIGHT + 3)));
    pageCount = Math.ceil(rowCount / dataRows);

    var blocksize = ((headerRows + dataRows) * (CELL_HEIGHT + 3)) + 21;
    divData.style.height = blocksize;
    divDates.style.height = blocksize;
    divTree.style.height = blocksize + (dataTop - treeTop);
    if (document.getElementById('mover'))
        document.getElementById('mover').style.height = blocksize;

    // 4 navigation buttons
    var lowButtons = document.getElementById('divLowerButtons');
    var lowButtonsTop = parseInt(lowButtons.style.top.substr(0, lowButtons.style.top.indexOf("px")));
    var buttonH = (blocksize + dataTop - 16) + "px";
    if (lowButtonsTop > dataTop) // Buttons are below the data table
        document.getElementById('divLowerButtons').style.top = buttonH;
}

function SetRowCount(newRowCount, doCheckTop) {
    rowCount = newRowCount;
    pageCount = Math.max(Math.ceil(rowCount / dataRows), 1);

    if (doCheckTop) {
        // make sure not off the end
        if (rowTopOfTable > (rowCount - 1))
            rowTopOfTable = (pageCount - 1) * dataRows; // set to top of last page

        // make sure not off the top
        rowTopOfTable = Math.max(rowTopOfTable, 0);

        // make sure on a page boundary
        rowTopOfTable = (Math.ceil((rowTopOfTable + 1) / dataRows) - 1) * dataRows;
    }
    UpdatePageNumInfo();
}

function UpdatePageNumInfo() {
    displayPage = Math.floor(rowTopOfTable / dataRows) + 1;
    document.getElementById("pageLabel").innerText = (rowCount == 0 ? "" : "Page " + displayPage + "/" + pageCount);

    var canGoLeft = (displayPage > 1);
    var btnFirst = document.getElementById("btnFirst");
    var btnLeft = document.getElementById("btnLeft");
    btnFirst.disabled = btnLeft.disabled = !canGoLeft;
    btnFirst.style.filter = (canGoLeft ? 'alpha(opacity:100)' : 'alpha(opacity:30)');
    btnLeft.style.filter = (canGoLeft ? 'alpha(opacity:100)' : 'alpha(opacity:30)');

    var canGoRight = (displayPage < pageCount);
    var btnRight = document.getElementById("btnRight");
    var btnLast = document.getElementById("btnLast");
    btnRight.disabled = btnLast.disabled = !canGoRight;
    btnRight.style.filter = (canGoRight ? 'alpha(opacity:100)' : 'alpha(opacity:30)');
    btnLast.style.filter = (canGoRight ? 'alpha(opacity:100)' : 'alpha(opacity:30)');
}

function ResetTables(resetRowCount, clearDirty) {
    while (tabDates.rows.length > headerRows)
        tabDates.deleteRow();
    while (tabData.rows.length > headerRows)
        tabData.deleteRow();

    if (resetRowCount)
        SetRowCount(0);
    if (clearDirty)
        ClearDirtyDisableSave();
}

function AddEmptyRow() {
    // dates table
    var row1 = insertRow(tabDates);
    var myCell = insertCell(row1);
    myCell.height = CELL_HEIGHT;
    myCell.className = 'centreText';

    // data table
    row2 = insertRow(tabData);
    var numCols = tabData.rows[0].cells.length;
    for (var col = 0; col < numCols; col++) {
        myCell = insertCell(row2);
        myCell.className = (col == 0 ? 'centreText' : 'stdNumeric');
        myCell.height = CELL_HEIGHT;
        myCell.noWrap = true;
        myCell.style.border = '1px solid gray';
        myCell.style.display = tabData.rows[0].cells[col].style.display; // hide if header col is hidden
    }
}

// fill result into table starting at tableRow
function FillDataRows(result, tableRow) {
    var resultRow = 0;
    for (var row = tableRow; resultRow < result.length && row < dataRows; row++) {
        FillDataRow(result[resultRow], row + headerRows);
        resultRow++;
    }
    while (tabData.rows.length - headerRows > row) {
        tabDates.deleteRow();
        tabData.deleteRow();
    }
}

// fill one result row into table at tableRow
function FillDataRow(result, rowNum) {
    if (rowNum - headerRows < dataRows) {

        if (tabDates.rows.length <= rowNum)
            AddEmptyRow();

        var rowDate = tabDates.rows[rowNum];
        var rowData = tabData.rows[rowNum];
        var numCols = result.cells.length + 1; // + 1 for status column
        if (result.editable && writePerm) {
            SetRowEditClicks(rowDate, 0, 0);
            SetRowEditClicks(rowData, 0, numCols - 1);
            SetMouseHiliteDbl(rowDate, rowData);
        }

        rowDate.style.backgroundColor = rowData.style.backgroundColor = (result.editable ? normalColour : disabledGrey);

        rowData.eventDateType = result.eventDateType; // Store the SporadicRow.eventDateType property in a variable in the HTML row object.

        // date cell, in the dates table
        var myCell = rowDate.cells[0];
        RemoveCellChildren(myCell);
        SetCellText(myCell, result.eventDate);
        myCell.eventId = result.id;
        myCell.oncontextmenu = function () { SCtx(result.id, null, result.editable && writePerm, result.deleteable && writePerm, false); return false; };

        RemoveChildren(rowData);

        // status cell
        SetCellText(rowData.cells[0], result.status);
        rowData.cells[0].oncontextmenu = function () { SCtx(result.id, null, result.editable && writePerm, result.deleteable && writePerm, false); return false; };

        var sporadicCell = 1;
        for (var col = 1; col < numCols; col++) {
            myCell = rowData.cells[col];
            FillSporadicCell(myCell, result.cells[col - 1], result.id, (result.editable && writePerm && !dayIsLocked),
                (result.deleteable && writePerm && !dayIsLocked), tabData.rows[0] != null && tabData.rows[0].cells[col] != null && !!tabData.rows[0].cells[col].isCheckbox, false);
        }
    }
}

function SetHeaders(result) {
    while (tabData.rows.length > 0)
        tabData.deleteRow();
    var row1 = insertRow(tabData);
    var row2 = insertRow(tabData);
    for (var col = 0; col < result.length; col++) {
        if (result[col] == null) {
            continue;
        }
        var myCell = insertCell(row1);
        myCell.className = 'th';
        myCell.height = CELL_HEIGHT;
        myCell.noWrap = true;
        myCell.style.border = '1px solid gray';
        if (colWidths && col < colWidths.length)
            myCell.style.width = colWidths[col];
        myCell.innerText = result[col][0];
        myCell.title = result[col][1];
        if (result[col][3] === "check") {
            myCell.isCheckbox = true;
            result[col][3] = 'block';
        }
        myCell.style.display = result[col][3];
        myCell.style.paddingLeft = 2;
        myCell.style.paddingRight = 2;

        myCell = insertCell(row2);
        myCell.className = 'th';
        myCell.height = CELL_HEIGHT;
        myCell.noWrap = true;
        myCell.style.border = '1px solid gray';
        myCell.innerText = result[col][2];
        myCell.style.display = result[col][3];
        myCell.style.paddingLeft = 2;
        myCell.style.paddingRight = 2;
    }
}

function ExtractEditedData(callbackFunc) {
    var rowNum = RowBeingEdited('tabData');
    if (rowNum == -1) // no row being edited
        return;
    ExtractRow(rowNum, callbackFunc);
}

function ExtractRow(rowNum, callbackFunc) {
    var row1 = tabDates.rows[rowNum];
    var row2 = tabData.rows[rowNum];
    var numCols = row2.cells.length;
    var object = new Axis.Core.Biz.SporadicEventRow();
    object.id = row1.cells[0].eventId;
    object.eventDate = GetCellText(row1.cells[0]);
    object.status = GetCellText(row2.cells[0]);

    object.cells = Array(numCols - 1); // -1 because status col is not a sporadic value cell
    for (var col = 0; col < numCols - 1; col++) {
        object.cells[col] = new Axis.Core.Biz.SporadicValueCell();
        object.cells[col].text = GetCellText(row2.cells[col + 1]);
        if (row2.cells[col + 1].dpId)
            object.cells[col].dpId = row2.cells[col + 1].dpId;
    }

    PageMethods.SEUpdateRow(object, callbackFunc, GeneralFailedCallback, rowNum);
}

function ShowComment(x, y, eventId, dpId, tableId, cellCol, cellRow) {
    var oComment = document.getElementById('textComment');
    var left;
    if (x + oComment.clientWidth > getWidth()) // if off right of screen
        left = x - oComment.clientWidth;       // go left instead
    else
        left = x;  // else go right
    oComment.style.left = left;
    oComment.style.top = y;
    oComment.cmtEvId = eventId;
    oComment.cmtDpId = dpId;
    oComment.commCell = document.getElementById(tableId).rows[cellRow].cells[cellCol];
    PageMethods.SEGetComment(eventId, dpId, GetCommentCallback);
}

function OkCommentClick() {
    ExtractEditedData(null);
    var oComment = document.getElementById('textComment');
    if (oComment.children[0].value != oComment.cmtText) // if changed
        PageMethods.SEUpdateComment(oComment.cmtEvId, oComment.cmtDpId,
            oComment.children[0].value, UpdateCommentCallback,
            GeneralFailedCallback, oComment.commCell);
}

function UpdateCommentCallback(result, myCell) {
    var oComment = document.getElementById('textComment');
    oComment.style.visibility = 'hidden';
    MakeDirtyEnableSave();
    if (result) {
        FillSporadicCell(myCell, result, oComment.cmtEvId, (writePerm && !dayIsLocked),
            (writePerm && !dayIsLocked), myCell.isCheckbox, false);
    }
}
