var gameDb = {};
gameDb.indexedDB = {};

gameDb.indexedDB.db = null;

gameDb.indexedDB.open = function() {
    var version = 1;
    var request = indexedDB.open("highScores", version);

    request.onupgradeneeded = function(e) {
        var db = e.target.result;

        e.target.transaction.onerror = gameDb.indexedDB.onerror;

        if(db.objectStoreNames.contains("highScore")) {
            db.deleteObjectStore("highScore");
        }

        var store = db.createObjectStore("highScore", {keyPath: "timeStamp"});
        store.createIndex("scoreValue", "scoreValue", { unique: false });

    };

    request.onsuccess = function(e) {
        gameDb.indexedDB.db = e.target.result;
        gameDb.indexedDB.getAllHighScores();
    };

    request.onerror = gameDb.indexedDB.onerror;
};

/*
 * get the scores
 */
gameDb.indexedDB.getAllHighScores = function() {
    var allHighScores = document.getElementById("highScores");
    allHighScores.innerHTML = "";
    var db = gameDb.indexedDB.db;
    var trans = db.transaction(["highScore"], "readwrite");
    var store = trans.objectStore("highScore");

    var keyRange = IDBKeyRange.lowerBound(0);
    var cursorRequest = store.index('scoreValue').openCursor(null, 'next');
    var count = 0;
    var lineNumber = 1;

    cursorRequest.onsuccess = function(e) {
        var result = e.target.result;
        if(!!result == false && lineNumber == 1) {
            renderNoHighScores();
        }
        if(!!result == false || lineNumber > 10)
            return;

        renderHighScore(result.value, lineNumber);
        result ? lineNumber++ && result.continue() : console.log(lineNumber);
    };

    cursorRequest.onerror = gameDb.indexedDB.onerror;
};

/*
 * render data to object
 */
function renderHighScore(row, lineNumber) {
    var allHighScores = document.getElementById("highScores");
    var highScoreData = convertTimeStamp(row.timeStamp);

    var p = document.createElement("p");
    // var p = document.createElement("p");

    var strongLineNumber = document.createElement("strong")
    var lineNumberValue = document.createTextNode(lineNumber);

    var spanScoreValue = document.createElement("span");
    var scoreValue = document.createTextNode(row.scoreValue + "(seg)");

    var strongTextOn = document.createElement("strong")
    var textOnValue = document.createTextNode("ON");

    var spanDataValue = document.createElement("span");
    var dataValue = document.createTextNode(highScoreData);

    strongLineNumber.appendChild(lineNumberValue);
    spanScoreValue.appendChild(scoreValue);
    strongTextOn.appendChild(textOnValue);
    spanDataValue.appendChild(dataValue);
    p.appendChild(strongLineNumber);
    p.appendChild(spanScoreValue);
    p.appendChild(strongTextOn);
    p.appendChild(spanDataValue);
    allHighScores.appendChild(p);
}
function renderNoHighScores() {
    var allHighScores = document.getElementById("highScores");
    var p = document.createElement("p");
    var noEntriesText = document.createTextNode('No highscores in database!');
    p.appendChild(noEntriesText);
    allHighScores.appendChild(p);
}

function convertTimeStamp(timeStampValue) {
    var date = new Date(timeStampValue);
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    var formattedTime = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;

    return formattedTime;
}

main = function() {
    gameDb.indexedDB.open();
}();
