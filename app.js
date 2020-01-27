let rows = 0;
let selectedRow = 0;

function createRowFromTemplate() {
    var temp = document.getElementsByTagName("template")[0];
    var clone = temp.content.cloneNode(true);
    var left = document.querySelector('.content>.left')
    left.appendChild(clone);
    focusOnCreatedRow();
}

function createOrUpdateResult(resultStr) {
    // se non esiste si crea
    if (!document.querySelectorAll('.content>.right>.row>.result')[selectedRow]) {
        var temp = document.getElementsByTagName("template")[1];
        var clone = temp.content.cloneNode(true);
        var left = document.querySelector('.content>.right')
        left.appendChild(clone);
    }
    console.log('Updating result...', resultStr)
    document.querySelectorAll('.content>.right>.row>.result')[selectedRow].innerText = resultStr;
}

function focusOnCreatedRow() {
    let createdEditableNodeLIst = document.querySelectorAll(".row>div:nth-child(2)");
    let createdEditable = Array.from(createdEditableNodeLIst)[rows];
    createdEditable.focus();
    rows++;
}

function focusRow(num) {
    let createdEditableNodeLIst = document.querySelectorAll(".row>div:nth-child(2)");
    let createdEditable = Array.from(createdEditableNodeLIst)[num];
    createdEditable.focus();
    setCaretOnLastPosition(createdEditable);
}

function setCaretOnLastPosition(el) {
    var range = document.createRange();
    var sel = window.getSelection();
    let selectedRowText = el.childNodes[0];
    range.setStart(selectedRowText, selectedRowText.length);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
}

function selectRow(el) {
    let createdEditableNodeLIst = document.querySelectorAll(".row>div:nth-child(2)");
    let createdEditable = Array.from(createdEditableNodeLIst);
    for (let i = 0; i < createdEditable.length; i++) {
        const element = createdEditable[i];
        if (element === el) {
            selectedRow = i;
            break;
        }
    }
}

// SOURCE: https://stackoverflow.com/questions/41884969/replacing-content-in-contenteditable-box-while-typing
function highLite(el) {
    // si formatta il div con gli stili
    el.previousElementSibling.innerHTML = el.innerHTML
        .replace(/(\d+)/g, "<span class='numbers'>$1</span>")
        .replace(/(€|\$)/g, "<span class='currencies'>$1</span>")
        .replace(/\#(.*)/g, "<span class='headers'>#$1</span>")
        .replace(/\@(.*)/g, "<span class='comments'>@$1</span>");

    parse(el);
}

function addRow(e) {
    if (e.keyCode == 13) {
        e.preventDefault(); // ferma l'evento
        if (selectedRow + 1 === rows) {
            createRowFromTemplate();
            // createOrUpdateResult();
        } else {
            focusRow(selectedRow + 1);
        }
    }
}

function parse(el) {
    console.log(el.innerHTML);
    createOrUpdateResult(el.innerHTML)
}


// si crea la 1° riga
createRowFromTemplate()