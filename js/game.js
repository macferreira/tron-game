canvas = document.getElementById("the-game");
context = canvas.getContext("2d");
context.fillStyle="#000000";
context.fillRect(0,0,480,320);

var timeCount = 0;
var gameTimer;

enemy = {
    type: 'program',
    width: 8,
    height: 8,
    color: '#b3d4fc',
    history: [],
    current_direction: null
};

player = {
    type: 'user',
    width: 8,
    height: 8,
    color: '#f16529',
    history: [],
    current_direction: null
};

keys = {
    up: [38],
    down: [40],
    left: [37],
    right: [39],
    start_game: [32]
};

lastKey = null;

game = {

    over: false,

    start: function() {
        document.getElementById('game-console').innerHTML='user@tron-game:/$';
        cycle.resetPlayer();
        cycle.resetEnemy();
        game.over = false;
        player.current_direction = "left";
        game.resetCanvas();
        // start timer, counting to high scores, less is better
        gameTimer=setInterval(function(){timeCount+=1},1000);
    },

    stop: function(cycle) {
        game.over = true;
        context.fillStyle = '#FFF';

        if(timeCount > 0){
            winner = cycle.type == 'program' ? 'USER' : 'PROGRAM';
            var textToConsole = '';
            textToConsole+='user@tron-game:/$ game over > ' + winner + ' wins';
            cycle.color = "#F00";
            // stop timer, counting to high scores, less is better
            clearInterval(gameTimer);
            if(winner == 'USER') {
                addHighScore(timeCount);
                textToConsole+='<br />user@tron-game:/$ score > '+timeCount+'seg';
            }
            timeCount=0;
            textToConsole+='<br />user@tron-game:/$ press spacebar to contine';
            document.getElementById('game-console').innerHTML=textToConsole;
        }
        else {
            cycle.color = "#F00";
            clearInterval(gameTimer);
            textToConsole+='user@tron-game:/$ press spacebar to start';
            document.getElementById('game-console').innerHTML=textToConsole;
        }
    },

    newLevel: function() {
        cycle.resetPlayer();
        cycle.resetEnemy();
        this.resetCanvas();
    },

    resetCanvas: function() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

};

cycle = {

    resetPlayer: function() {
        player.x = canvas.width - (canvas.width / (player.width / 2) + 4);
        player.y = (canvas.height / 2) + (player.height / 2);
        player.color = '#f16529';
        player.history = [];
        player.current_direction = "left";
    },

    resetEnemy: function() {
        enemy.x = (canvas.width / (enemy.width / 2) - 4);
        enemy.y = (canvas.height / 2) + (enemy.height / 2);
        enemy.color = '#b3d4fc';
        enemy.history = [];
        enemy.current_direction = "right";
    },

    move: function(cycle, opponent) {
        switch(cycle.current_direction) {
            case 'up':
                cycle.y -= cycle.height;
                break;
            case 'down':
                cycle.y += cycle.height;
                break;
            case 'right':
                cycle.x += cycle.width;
                break;
            case 'left':
                cycle.x -= cycle.width;
                break;
        }
        if (this.checkCollision(cycle, opponent)) {
            game.stop(cycle);
        }
        coords = this.generateCoords(cycle);
        cycle.history.push(coords);
    },


    moveEnemy: function() {
        advisor = this.enemyPingDirections();
        if (advisor[enemy.current_direction] < enemy.width || Math.ceil(Math.random() * 10) == 5) {
            enemy.current_direction = advisor.best;
        }
        this.move(enemy, player);
    },

    enemyPingDirections: function() {
        pong = {
            up: 0,
            down: 0,
            left: 0,
            right: 0
        };
        // Up
        for (i = enemy.y - enemy.height; i>= 0; i -= enemy.height) {
            pong.up = enemy.y - i - enemy.width;
            if (this.isCollision(enemy.x, i)) break;
        }
        // Down
        for (i = enemy.y + enemy.height; i<= canvas.height; i += enemy.height) {
            pong.down = i - enemy.y - enemy.width;
            if (this.isCollision(enemy.x, i)) break;
        }
        // Left
        for (i = enemy.x - enemy.width; i>= 0; i -= enemy.width) {
            pong.left = enemy.x - i - enemy.width;
            if (this.isCollision(i, enemy.y)) break;
        }
        // Right
        for (i = enemy.x + enemy.width; i<= canvas.width; i += enemy.width) {
            pong.right = i - enemy.x - enemy.width;
            if (this.isCollision(i, enemy.y)) break;
        }
        var largest = {
            key: null,
            value: 0
        };
        for(var j in pong){
            if( pong[j] > largest.value ){
                largest.key = j;
                largest.value = pong[j];
            }
        }
        pong.best = largest.key;
        return pong;
    },

    checkCollision: function(cycle, opponent) {
        if ((cycle.x < (cycle.width / 2)) ||
            (cycle.x > canvas.width - (cycle.width / 2)) ||
            (cycle.y < (cycle.height / 2)) ||
            (cycle.y > canvas.height - (cycle.height / 2)) ||
            (cycle.history.indexOf(this.generateCoords(cycle)) >= 0) ||
            (opponent.history.indexOf(this.generateCoords(cycle)) >= 0)) {
            return true;
        }
    },

    isCollision: function(x,y) {
        coords = x + ',' + y;
        if (x < (enemy.width / 2) ||
            x > canvas.width - (enemy.width / 2) ||
            y < (enemy.height / 2) ||
            y > canvas.height - (enemy.height / 2) ||
            enemy.history.indexOf(coords) >= 0 ||
            player.history.indexOf(coords) >= 0) {
            return true;
        }
    },

    generateCoords: function(cycle) {
        return cycle.x + "," + cycle.y;
    },

    draw: function(cycle) {
        context.fillStyle = cycle.color;
        context.beginPath();
        context.moveTo(cycle.x - (cycle.width / 2), cycle.y - (cycle.height / 2));
        context.lineTo(cycle.x + (cycle.width / 2), cycle.y - (cycle.height / 2));
        context.lineTo(cycle.x + (cycle.width / 2), cycle.y + (cycle.height / 2));
        context.lineTo(cycle.x - (cycle.width / 2), cycle.y + (cycle.height / 2));
        context.closePath();
        context.fill();
    }

};

inverseDirection = function() {
    switch(player.current_direction) {
        case 'up':
            return 'down';
            break;
        case 'down':
            return 'up';
            break;
        case 'right':
            return 'left';
            break;
        case 'left':
            return 'right';
            break;
    }
};

Object.prototype.getKey = function(value){
    for(var key in this){
        if(this[key] instanceof Array && this[key].indexOf(value) >= 0){
            return key;
        }
    }
    return null;
};

addEventListener("keydown", function (e) {
    lastKey = keys.getKey(e.keyCode);
    if (['up', 'down', 'left', 'right'].indexOf(lastKey) >= 0  && lastKey != inverseDirection()) {
        player.current_direction = lastKey;
    } else if (['start_game'].indexOf(lastKey) >= 0  && game.over) {
        game.start();
    }
}, false);

loop = function() {
    if (game.over === false) {
        cycle.move(player, enemy);
        cycle.draw(player);
        cycle.moveEnemy();
        cycle.draw(enemy);
    }
};

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


        var thisDb = e.target.result;

    };

    request.onsuccess = function(e) {
        gameDb.indexedDB.db = e.target.result;
    };

    request.onerror = gameDb.indexedDB.onerror;
};

/*
 * add score to the database
 */
gameDb.indexedDB.addHighScore = function(highScoreValue) {
    var db = gameDb.indexedDB.db;
    var trans = db.transaction(["highScore"], "readwrite");
    var store = trans.objectStore("highScore");
    var request = store.put({ "scoreValue": highScoreValue, "timeStamp" : new Date().getTime()});

    request.onsuccess = function(e) {};

    request.onerror = function(e) {
        console.log(e.value);
    };
};
function addHighScore(highScoreValue) {
    gameDb.indexedDB.addHighScore(highScoreValue);
}

main = function() {
    setInterval(loop, 100);
    gameDb.indexedDB.open();
}();
