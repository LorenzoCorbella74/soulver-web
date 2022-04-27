let rows = 0;
let selectedRow = 0;
let expressions = [];
let variables = {};
let results = [];
let relations = []; // indica in quale riga stanno i totali per poi ricaricare 
let functionNames = ['sin', 'cos', 'tan', 'exp', 'sqrt', 'ceil', 'floor', 'abs', 'acos', 'asin', 'atan', 'log', 'round'];
let specialOperator = ['in\\b', 'k\\b', 'M\\b', 'mm\\b', 'cm\\b', 'm\\b', 'km\\b', 'mg\\b', 'g\\b', 'kg\\b', 'cm2\\b', 'm2\\b', 'km2\\b'];
let info = [];
let importedFile = {};
const APP_VERSION = 'V 0.1.6';
let isDark = false;
let statusListening = 'stop';
let currencies = [];

let toggleBtn = document.querySelector('.toggle-theme');
let saveBtn = document.querySelector('.save-btn');
let importBtn = document.querySelector('.import-btn');
let listenBtn = document.querySelector('.btn.listen-btn');

const sound = document.querySelector('.sound');
let SpeechRecognition = null;
let recognition = null;

/* EVENT HANDLERS */
importBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let input = document.getElementById('file-input');
    input.onchange = e => {
        // getting a hold of the file reference
        var file = e.target.files[0];
        // setting up the reader
        var reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        // here we tell the reader what to do when it's done reading...
        reader.onload = readerEvent => {
            var content = readerEvent.target.result; // this is the content!
            try {
                importedFile = JSON.parse(content);
                createSheetFromImportedFile(importedFile);
            } catch (error) {
                console.log('Was not possible to import the file!')
            }
        }
    }
    input.click();
});

saveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let output = {
        ver: APP_VERSION,
        date: formatDate(new Date()),
        rows: []
    }
    Array.from(document.querySelectorAll(".row>div:nth-child(2)")).forEach(e => output.rows.push(e.innerText));
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(output));
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `sheet_${formatDate(new Date())}.json`); // ``
    dlAnchorElem.click();
});

toggleBtn.addEventListener('click', function (e) {
    e.preventDefault();
    if (document.body.classList.contains('dark-theme')) {
        document.body.classList.remove('dark-theme');
        localStorage.removeItem('dark-theme');
        isDark = false;
    } else {
        document.body.classList.add('dark-theme');
        localStorage.setItem('dark-theme', true);
        isDark = true;
    }
    listenBtn.childNodes[1].style.fill = isDark ? '#39cccc' : '#0187f7';
});


function listen (e) {
    if (statusListening !== 'play') {
        statusListening = 'play'
        e.target.childNodes[1].style.fill = "red";
        sound.play();
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "it-IT"/* "en-GB"  https://stackoverflow.com/questions/14257598/what-are-language-codes-in-chromes-implementation-of-the-html5-speech-recogniti*/;

        // si ascolta
        recognition.onresult = function (event) {
            console.log(event);
            var output = "";
            for (var i = 0; i < event.results.length; i++) {
                // if (event.results[i][0].isFinal) {
                output = event.results[i][0].transcript;
                //}
            }
            let editable = Array.from(document.querySelectorAll(".row>div:nth-child(2)"))[selectedRow];
            editable.innerHTML = output;
            formatWithColors(editable);
            setCaretOnLastPosition(editable);
        }

        recognition.onspeechend = function () {
            recognition.stop();
            e.target.childNodes[1].style.fill = isDark ? '#39cccc' : '#0187f7';
        }
        recognition.onnomatch = function (event) {
            console.log("I didn't recognise what was said.");
        }

        recognition.onerror = function (event) {
            console.log('Error occurred in recognition: ' + event.error);
        }
        recognition.start();
    } else {
        statusListening = 'stop';
        recognition.stop();
        e.target.childNodes[1].style.fill = isDark ? '#39cccc' : '#0187f7';
    }

}

function mouseUp (e) {

}

function createRowFromTemplate () {
    var temp = document.getElementsByTagName("template")[0];
    var clone = temp.content.cloneNode(true);
    var left = document.querySelector('.content>.left')
    left.appendChild(clone);
    focusOnCreatedRow();
}

function createOrUpdateResult (resultStr) {
    // se non esiste si crea
    if (!document.querySelectorAll('.content>.right>.row>.result')[selectedRow]) {
        var temp = document.getElementsByTagName("template")[1];
        var clone = temp.content.cloneNode(true);
        var left = document.querySelector('.content>.right')
        left.appendChild(clone);
    }
    // console.log('Updating result...', resultStr)
    document.querySelectorAll('.content>.right>.row>.result')[selectedRow].innerText = resultStr;
    updateRelated()

}

function checkIfUnit (obj) {
    return typeof obj === 'object' && obj !== null && obj.value;
}

// si aggiorna ogni riga in funzione della presenza delle variabili presenti in 'relations'
function updateRelated () {
    for (let numRow = 0; numRow < rows; numRow++) { // per tutte le righe si vede quelle che includono nelle relazioni le variabili 
        let who = relations.map(e => e && (e.includes(`R${numRow}`) || Object.keys(variables).findIndex(a => a == e) > -1)); // FIXME: da rivedere...
        if (who && who.length > 0) {
            who.forEach((element, index) => {
                if (element) {
                    try {
                        results = math.evaluate(expressions, variables);
                        results.map((e, i) => variables[`R${i}`] = checkIfUnit(e) ? math.unit(e) : e);  // si mette i risultati di riga nelle variabili
                        updateResultInRow(results[index] ? formatResults(results[index]) : '', index);  // si aggiorna la riga corrente
                    } catch (error) {
                        updateResultInRow('', index);
                        console.log('Completing expression', error);
                    }
                }
            });
        }
    }
}

function updateResultInRow (resultStr, row) {
    document.querySelectorAll('.content>.right>.row>.result')[row].innerText = resultStr;
}

function focusOnCreatedRow () {
    let createdEditable = Array.from(document.querySelectorAll(".row>div:nth-child(2)"))[rows];
    createdEditable.focus();
    rows++;
}

function focusRow (num) {
    let createdEditable = Array.from(document.querySelectorAll(".row>div:nth-child(2)"))[num];
    createdEditable.focus();
    setCaretOnLastPosition(createdEditable);
}

function setCaretOnLastPosition (el) {
    var range = document.createRange();
    var sel = window.getSelection();
    let selectedRowText = el.childNodes[0];
    if (selectedRowText) {
        range.setStart(selectedRowText, selectedRowText.length);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

function selectRow (el) {
    let createdEditable = Array.from(document.querySelectorAll(".row>div:nth-child(2)"));
    for (let i = 0; i < createdEditable.length; i++) {
        const element = createdEditable[i];
        if (element === el) {
            selectedRow = i;
            break;
        }
    }
}

function cancellAll () {
    let left = document.querySelectorAll(".left");
    while (left.firstChild) {
        left.removeChild(left.firstChild);
    }
    let right = document.querySelectorAll(".right");
    while (right.firstChild) {
        right.removeChild(right.firstChild);
    }
}

function createSheetFromImportedFile () {
    cancellAll();
    rows = 0;
    if (importedFile && importedFile.rows) {
        importedFile.rows.forEach((e, index) => {
            createRowFromTemplate();
            let editable = Array.from(document.querySelectorAll(".row>div:nth-child(2)"))[index];
            editable.innerHTML = e;
            formatWithColors(editable);
            if (index === importedFile.rows.length - 1) {
                setCaretOnLastPosition(editable);
            }
        });
    }
    importedFile = {};
}

// SOURCE: https://stackoverflow.com/questions/41884969/replacing-content-in-contenteditable-box-while-typing
// REPLACE: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
function formatWithColors (el) {
    let currenciesConcatenated = currencies.join("|");
    let operatorsConcatenated = specialOperator.join("|");
    let re = `(?<!.+\\/\\/.*)(${currenciesConcatenated})\\b`;
    let re2 = `(?<!.+\\/\\/.*)(${operatorsConcatenated})\\b`;
    if (el.innerHTML.indexOf('#') !== -1) {
        el.previousElementSibling.innerHTML = el.innerHTML.trim()
            .replace(/\#(.*)/g, "<span class='headers'>#$1</span>")
    } else {
        if (el.innerHTML.indexOf('//') !== -1) {
            el.previousElementSibling.innerHTML = el.innerHTML.trim()
                .replace(/(?<!#.*)\b((\d*[\.,])?\d+)(?=.+\/\/\w*)/g, "<span class='numbers'>$1</span>")   //solo numeri con '.' come separatore decimale
                .replace(/(?<!#.*)\bR[0-9]{1,2}\b(?=.+\/\/.*)/g, "<span class='result-cell'>$&</span>")   // solo totali di riga: R0, R1,..
                .replace(new RegExp(re, "g"), "<span class='currencies'>$1</span>")
                .replace(/(total\b|totale\b|subtotal\b|subtotale\b)/g, "<span class='headers'>$1</span>")
                .replace(/\/\/(.*)/g, "<span class='comments'>//$1</span>")
                .replace(new RegExp(re2, "g"), "<span class='units'>$1</span>")       // non funzionz (?<=\W\d+)[kM](?=.+\/\/\w*)
        } else {
            el.previousElementSibling.innerHTML = el.innerHTML.trim()
                .replace(/(?<!#.*)\b((\d*[\.,])?\d+)/g, "<span class='numbers'>$1</span>")   //solo numeri con '.' come separatore decimale
                .replace(/(?<!#.*)\bR[0-9]{1,2}\b/g, "<span class='result-cell'>$&</span>")   // solo totali di riga: R0, R1,..
                .replace(new RegExp(re, "g"), "<span class='currencies'>$1</span>")
                .replace(/(total\b|totale\b|subtotal\b|subtotale\b)/g, "<span class='headers'>$1</span>")
                .replace(/\/\/(.*)/g, "<span class='comments'>//$1</span>")
                .replace(new RegExp(re2, "g"), "<span class='units'>$1</span>")  // non funziona.... (?<=\W\d+)([kM])
        }
    }

    parse(el);
}

function onKeyPress (e, el) {
    // enter
    if (e.keyCode == 13) {
        e.preventDefault(); // stop event
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
    // + as first element of row producing a 'result cell'
    if (e.code === 'BracketRight' && el.innerHTML.length === 0 && rows > 0) {
        e.preventDefault(); // no +
        el.innerHTML = `R${selectedRow - 1}`;
        el.previousElementSibling.innerHTML = `<span class="result-cell">R${selectedRow - 1}</span>`; // TODO: qua si può attaccare un onmousemove="showToolTipValue(this)""
        setCaretOnLastPosition(el);
    }
    // TODO: shortcuts for save, import,settings, etc
}

// assegna ad ogni riga le variabili presenti
/*
    [ 
        null,
        [R0],
        [R0,R1]
    ]
*/
function setRelation (selectedRow, presences) {
    relations[selectedRow] = presences;
    console.log('Relations: ', relations);
}

function removeTextFromStr (strToBeParsed) {
    // si rimuove tutti i caratteri ma non le sottostringhe delle variabili, nomi delle funzioni ed unità di misura
    let varConcatenated = Object.keys(variables).concat(functionNames).concat(currencies).concat(specialOperator).join("|");
    let re = varConcatenated ? `\\b(?!${varConcatenated})\\b([a-zA-Z])+` : '[a-zA-Z]+';
    return strToBeParsed.replace(new RegExp(re, "g"), "").replace(/\&nbsp;/g, '').replace(/\&;/g, '');
}

function parse (el) {
    // typeOfResult: H per header, N per normal, S per subtotal, T per total, A per assegnazione
    // typeOfResultFormat: N per noraml, % per percentuale
    info[selectedRow] = { row: selectedRow, typeOfResult: 'N', typeOfResultFormat: 'N' };

    let strToBeParsed = el.innerHTML.trim();

    if (/#(.*)/g.test(strToBeParsed)) {
        strToBeParsed = ''; // si rimuovono gli header
        info[selectedRow].typeOfResult = 'H';
    } else if (/\/\/(.*)/g.test(strToBeParsed)) {
        strToBeParsed = strToBeParsed.replace(/\/\/(.*)/g, "").trim(); // si rimuove tutto ciò oltre i //
    }

    if (/(subtotale\b|subtotal\b).*/g.test(strToBeParsed)) {
        info[selectedRow].typeOfResult = 'S';
        let out = '0';
        for (var i = selectedRow - 1; i >= 0; i--) {
            if (info[i].typeOfResult === 'N') {
                out += `+ R${i}`;
            } else if (info[i].typeOfResult !== 'S' || info[i].typeOfResult !== 'T') {
                break;
            }
        }
        strToBeParsed = out;    // si costruisce la stringa per i totali
    } else if (/(total\b|totale\b).*/g.test(strToBeParsed)) {
        info[selectedRow].typeOfResult = 'T';
        let out = '0';
        for (var i = 0; i <= rows - 2; i++) {
            if (info[i].typeOfResult === 'N') {
                out += `+ R${i}`;
            }
        }
        strToBeParsed = out;    // si costruisce la stringa per i totali
    }

    // k dopo un numero *1000
    if (/(?<=\d)([k])/g.test(strToBeParsed)) {
        strToBeParsed = strToBeParsed.replace(/(?<=\d)([k])/g, "*1000").trim();
    }
    // M dopo un numero *1.000.000
    if (/(?<=\d)([M])/g.test(strToBeParsed)) {
        strToBeParsed = strToBeParsed.replace(/(?<=\d)([M])/g, "*1000000").trim();
    }

    // + al posto di 'più'
    if (/(\b(pi\ù)\B)/g.test(strToBeParsed)) {
        strToBeParsed = strToBeParsed.replace(/(\b(pi\ù)\B)/g, "+").trim();
    }

    // se c'è una assegnazione si mette tra le variabili
    if (/[=]/.test(strToBeParsed)) {
        info[selectedRow].typeOfResult = 'A';
        // TODO: gestione espressione dentro il DX di una assegnazione...
        let reg = /\s*([^:]*?)\s*=\s*([^:\s]*)/g;
        while (match = reg.exec(strToBeParsed)) {
            if (match[1] && match[2]) {
                variables[match[1]] = match[2];
            }
        }
    }

    // 10.5% of 100.5   TODO: 10.5% di (espressione) non funziona
    // SOURCE: https://stackoverflow.com/questions/12812902/javascript-regular-expression-matching-cityname // come prendere solo parti specifiche
    let reg = /(\d*[\.,])?(\d+)(\s?%)(\s+)(di|of)(\s+)(\d*[\.,])?(\d+\s?)/g;
    while (match = reg.exec(strToBeParsed)) {
        // console.log(match);
        let num = match[1] ? match[1] + match[2] : match[2];
        let dest = match[7] ? match[7] + match[8] : match[8];
        let sostituzione = (Number(dest) * (Number(num) / 100)).toString();
        strToBeParsed = strToBeParsed.replace(/(\d*[\.,])?(\d+)(\s?%)(\s+)(di|of)(\s+)(\d*[\.,])?(\d+\s?)/g, sostituzione);
    }

    // +/- 10 % TODO: (2 + 22%)% non funziona!
    let add = /\+\s?(\d*[\.,])?(\d+\s?)(%)/g;
    while (match = add.exec(strToBeParsed)) {
        let num = match[1] ? match[1] + match[2] : match[2];
        let sostituzione = ((Number(num) + 100) / 100).toString();
        strToBeParsed = strToBeParsed.replace(/\+\s?(\d*[\.,])?(\d+\s?)(%)/g, `*${sostituzione}`);
    }
    let sub = /\-\s?(\d*[\.,])?(\d+\s?)(%)/g;
    while (match = sub.exec(strToBeParsed)) {
        let num = match[1] ? match[1] + match[2] : match[2];
        let sostituzione = ((100 - Number(num)) / 100).toString();
        strToBeParsed = strToBeParsed.replace(/\-\s?(\d*[\.,])?(\d+\s?)(%)/g, `*${sostituzione}`);
    }

    // 10.1 come % di 10.1 ( 10.1 as % of 10.1)
    let as = /(\d*[\.,])?(\d+\s?)(come|as)(\s+%)(\s+(di|of)\s+)(\d*[\.,])?(\d+\s?)/g;
    while (match = as.exec(strToBeParsed)) {
        let num1 = match[1] ? match[1] + match[2] : match[2];
        let num2 = match[7] ? match[7] + match[8] : match[8];
        let sostituzione = (Number(num1) / Number(num2)).toString();
        strToBeParsed = strToBeParsed.replace(/(\d*[\.,])?(\d+\s?)(come|as)(\s+%)(\s+(di|of)\s+)(\d*[\.,])?(\d+\s?)/g, `${sostituzione}`);
    }

    strToBeParsed = removeTextFromStr(strToBeParsed);

    console.log(`Str originale: ${el.innerHTML} - parsata: ${strToBeParsed}`, expressions);

    // se ci stanno Rx si definiscono le relazioni
    let relRegStr = `\\b(${Object.keys(variables).join('|')})\\b`
    let relReg = new RegExp(relRegStr, "g")
    let presences = /\b(sub)?total(e)?\b/g.exec(el.innerHTML) ? strToBeParsed.match(relReg).map(e => e.replace(/\+/g, '')) : strToBeParsed.match(relReg);
    expressions[selectedRow] = strToBeParsed.replace(/^0\+/g, '').trim() || 0;  // si rimuove lo 0+ fix somme con unità
    setRelation(selectedRow, presences)

    try {
        results = math.evaluate(expressions, variables);
        results.map((e, i) => variables[`R${i}`] = checkIfUnit(e) ? math.unit(e) : e);  // si mette i risultati di riga nelle variabili
        console.log('Risultati: ', results, 'Variabili: ', variables);
        createOrUpdateResult(results[selectedRow] ? formatResults(results[selectedRow]) : ''); // si aggiorna la riga corrente
    } catch (error) {
        createOrUpdateResult('');
        console.log('Completing expression', error);
    }
}

function formatResults (result) {
    let output, check;
    if (checkIfUnit(result)) {
        check = result.value;
    } else {
        check = result;
    }
    if (check % 1 != 0) {
        output = format(result, 2);
    } else {
        output = result;
    }
    return output;
}


function initSpeechRecognition () {
    try {
        SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = null;
        // mostra btn
        listenBtn.classList.add('show');
        listenBtn.classList.remove('hide');
        statusListening = 'stop';
    } catch (e) {
        console.error(e);
    }
}

function formatDate (date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

function getCurrencies () {
    const data = {
        "success": true,
        "timestamp": 1519296206,
        "base": "EUR",
        "date": "2021-03-17",
        "rates": {
            "AUD": 1.566015,
            "CAD": 1.560132,
            "CHF": 1.154727,
            "CNY": 7.827874,
            "GBP": 0.882047,
            "JPY": 132.360679,
            "USD": 1.23396,
        }
    };
    /* return fetch('https://api.exchangeratesapi.io/latest')
        .then(function (response) {
            return response.json()
        })
        .then(function (data) {
        */
            console.log('Currencies:', data);
            localStorage.setItem(`currencies-${data.date}`, JSON.stringify(data))
            return createUnit(data);
       /*  }); */
}

function createUnit (data) {
    math.createUnit(data.base, { aliases: ['€'] });
    Object.keys(data.rates)
        .forEach(function (currency) {
            math.createUnit(currency, math.unit(1 / data.rates[currency], data.base));
        });
    // return an array with all available currencies
    return Object.keys(data.rates).concat(data.base);
}

function format (value) {
    const precision = 4;
    return math.format(value, precision)
}

function setAppVersion () {
    document.querySelector('.version').innerText = APP_VERSION;
}

function init () {
    currencies = localStorage.getItem(`currencies-${formatDate(new Date())}`); // only a call a day/browser!!!
    if (!currencies) {
        getCurrencies().then(e => currencies = e);
    } else {
        currencies = createUnit(JSON.parse(currencies));
    }
    // Turn the theme of if the 'dark-theme' key exists in localStorage
    if (localStorage.getItem('dark-theme')) {
        document.body.classList.add('dark-theme');
        isDark = true;
    }

    setAppVersion();

    initSpeechRecognition();
    // si crea la 1° riga
    createRowFromTemplate()
}

init();
/*
    TODO:
    [] classe per la gestione del caret
    [] classe per la gestione della view e classe per la gestione del parsing e calcoli (in file separati)
    [] formattazione di numeri con separazione per migliaia e virgola
    [] colori custom definiti nelle preferenze tramite modale
    [] totale in fondo alla pagina
    [] percentuali
        NUM +/- 20%
        40 come % di 50 (N as a % of N)
        20 che % è di 50 (N is what % of N)
    [] matematica per le date
        Today + 3 weeks 2 days
        3:35 am + 9 hours 20 minutes
        From March 12 to July 30
    [] json export / inport tramite modale
    [] variabili globali
    [] progressive web app ed electron
    [] internalizzazione e formati numerici

    NOTES:
    https://stackoverflow.com/questions/6249095/how-to-set-caretcursor-position-in-contenteditable-element-div
    https://stackoverflow.com/questions/10778291/move-the-cursor-position-with-javascript
    https://stackoverflow.com/questions/18884262/regular-expression-match-string-not-preceded-by-another-string-javascript


*/
