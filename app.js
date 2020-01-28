let rows = 0;
let selectedRow = 0;
let expressions = [];
let variables = {};
let results = [];
let relations = {}; // indica in quale riga sta per poi ricaricare 

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
    // console.log('Updating result...', resultStr)
    document.querySelectorAll('.content>.right>.row>.result')[selectedRow].innerText = resultStr;
}

function updateResultInRow(resultStr, row) {
    document.querySelectorAll('.content>.right>.row>.result')[row].innerText = resultStr;
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
    el.previousElementSibling.innerHTML = el.innerHTML
        .replace(/(\d+)/g, "<span class='numbers'>$1</span>")   // TODO: togliere
        .replace(/(€|\$)/g, "<span class='currencies'>$1</span>")
        .replace(/\#(.*)/g, "<span class='headers'>#$1</span>")
        .replace(/\@(.*)/g, "<span class='comments'>@$1</span>");
    parse(el);
}

function onKeyPress(e, el) {
    // enter
    if (e.keyCode == 13) {
        e.preventDefault(); // ferma l'evento
        if (selectedRow + 1 === rows) {
            createRowFromTemplate();
        } else {
            focusRow(selectedRow + 1);
        }
    }
    // backspace
    if (e.keyCode == 8 && selectedRow != 0 && el.innerHTML.length == 0) {
        focusRow(selectedRow - 1);
    }
    // + as first element of row
    if (e.code === 'BracketRight' && el.innerHTML.length === 0 && rows > 0) {
        e.preventDefault();
        /*  let createdEditableNodeLIst = document.querySelectorAll(".row>div:nth-child(2)");
         let element = Array.from(createdEditableNodeLIst)[selectedRow]; */
        el.innerHTML = `R${selectedRow - 1}`;
        el.previousElementSibling.innerHTML = `<span class="result-cell R${selectedRow - 1}">R${selectedRow - 1}</span>`;
        setCaretOnLastPosition(el);
    }
}

function parse(el) {
    let strToBeParsed = el.innerHTML.trim();       // ciò che deve essere parsato
    // se c'è una assegnazione si mette
    if (/[=]/.test(strToBeParsed)) {
        // TODO: gestione espressione dentro il DX di una assegnazione...
        let reg = /\s*([^:]*?)\s*=\s*([^:\s]*)/g;
        while (match = reg.exec(strToBeParsed)) {
            if (match[1] && match[2]) {
                variables[match[1]] = match[2];
            }
        }
    } else if (/[#@]/.test(strToBeParsed)) {
        strToBeParsed = '';
    } else {
        // si rimuove tutti i caratteri ma non le sottostringhe delle variabili
        let varConcatenated = Object.keys(variables).join("|");
        let re = varConcatenated ? `\\b(?!${varConcatenated})\\b([a-zA-Z])+` : '[a-zA-Z]+';
        strToBeParsed = strToBeParsed.replace(new RegExp(re, "g"), "").replace(/\s+/g, '');
    }
    expressions[selectedRow] = strToBeParsed.trim();
    console.log(el.innerHTML, strToBeParsed, expressions);
    try {
        results = math.evaluate(expressions, variables);
        results.map((e, i) => variables[`R${i}`] = e);
        console.log(variables);
        createOrUpdateResult(results[selectedRow] ? results[selectedRow] : '');
    } catch (error) {
        createOrUpdateResult('');
        console.log('Completing expression', error);
    }
}


// si crea la 1° riga
createRowFromTemplate()