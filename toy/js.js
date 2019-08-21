const app = new PIXI.Application({
    width: 600, height: 600, backgroundColor: 0x1099bb, resolution: window.devicePixelRatio || 1,
});

const style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 10,
    fontStyle: 'italic',
    fontWeight: 'bold',
    fill: ['#ffffff', '#00ff99'], // gradient
    stroke: '#4a1850',
    strokeThickness: 5,
    wordWrap: true,
    wordWrapWidth: 440,
});

const graphics = new PIXI.Graphics();
document.body.appendChild(app.view); 
var sizeX = 7;
var sizeY = 5;

var playerX = 2;
var playerY = 3;
var goalY = 3;
var goalX = 6;
var width = 600 / sizeX;
var height = 600 / sizeY;

var openList = [];
var closeList = []; 
function drawMap(map) {
    for (var i = app.stage.children.length - 1; i >= 0; i--) {	app.stage.removeChild(app.stage.children[i]);}
    app.stage.addChild(graphics);
    for(var i=1; i<=sizeY; i++) {
        for(var j=1; j<=sizeX; j++) {
            if(map[i][j] === 0) {
                graphics.beginFill(0xDE3249);
                graphics.drawRect((j - 1)* width, (i - 1)* height, width-1, height-1);
                graphics.endFill(); 
            } 
        }
    } 
    for(var key in openList) { 
        const richText = new PIXI.Text('g: ' + openList[key].g + ', h: ' + openList[key].h, style);
        var keyObj = JSON.parse(key);
        richText.x = (keyObj.x - 1) * width;
        richText.y = (keyObj.y - 1) * height;
        app.stage.addChild(richText);
    }
    for(var key in closeList) { 
        const richText = new PIXI.Text('g: ' + closeList[key].g + ', h: ' + closeList[key].h, style);
        var keyObj = JSON.parse(key);
        richText.x = (keyObj.x - 1) * width;
        richText.y = (keyObj.y - 1) * height;
        app.stage.addChild(richText);
    }
}

function drawPlayer(x, y, color) {
    graphics.beginFill(color);
    var xx = (x - 1) * width;
    var yy = (y - 1) * height;
    graphics.drawRect(xx, yy, width-1, height-1);
    graphics.endFill(); 
}

function existPos(x, y, arr) {
    var existIndex = "";
    for(var key in arr) {
        var keyObj = JSON.parse(key);
        if(keyObj.x == x && keyObj.y == y) {
            existIndex = key;
            break;
        }
    }
    return existIndex;
}


function validRange(x, y) {
    var ret = 1 <= x && x <= sizeX && 
        1 <= y && y <= sizeY;
    return ret;
}

function getAdj(mi, w) {
    var ret = [];
    var nextY;
    var nextX;
    nextY = mi.y - 1;
    nextX = mi.x;
    if(validRange(nextX, nextY) && map[nextY][nextX] === 0 && existPos(nextX, nextY, closeList)== "" ) {
        ret.push({"x":nextX, "y": nextY, "g":w.g + 10, "px":mi.x, "py":mi.y});
    }
    nextY = mi.y + 1;
    nextX = mi.x;
    if(validRange(nextX, nextY) && map[nextY][nextX] === 0 && existPos(nextX, nextY, closeList)== "" ) {
        ret.push({"x":nextX, "y": nextY, "g":w.g + 10, "px":mi.x, "py":mi.y});
    }
    nextY = mi.y;
    nextX = mi.x - 1;
    if(validRange(nextX, nextY) && map[nextY][nextX] === 0 && existPos(nextX, nextY, closeList)== "" ) {
        ret.push({"x":nextX, "y": nextY, "g":w.g + 10, "px":mi.x, "py":mi.y});
    }
    nextY = mi.y;
    nextX = mi.x + 1;
    if(validRange(nextX, nextY) && map[nextY][nextX] === 0 && existPos(nextX, nextY, closeList)== "" ) {
        ret.push({"x":nextX, "y": nextY, "g":w.g + 10, "px":mi.x, "py":mi.y});
    }

    nextY = mi.y - 1;
    nextX = mi.x + 1;
    if(validRange(nextX, nextY) && map[nextY][nextX] === 0 && existPos(nextX, nextY, closeList) == "" && map[mi.y - 1][mi.x] == 0 && map[mi.y][mi.x + 1] == 0) {
        ret.push({"x":nextX, "y": nextY, "g":w.g + 14, "px":mi.x, "py":mi.y});
    }
    nextY = mi.y + 1;
    nextX = mi.x + 1;
    if(validRange(nextX, nextY) && map[nextY][nextX] === 0 && existPos(nextX, nextY, closeList) == "" && map[mi.y + 1][mi.x] == 0 && map[mi.y][mi.x + 1] == 0) {
        ret.push({"x":nextX, "y": nextY, "g":w.g + 14, "px":mi.x, "py":mi.y});
    }
    nextY = mi.y + 1;
    nextX = mi.x - 1;
    if(validRange(nextX, nextY) && map[nextY][nextX] === 0 && existPos(nextX, nextY, closeList) == "" && map[mi.y + 1][mi.x] == 0 && map[mi.y][mi.x - 1] == 0) {
        ret.push({"x":nextX, "y": nextY, "g":w.g + 14, "px":mi.x, "py":mi.y});
    }
    nextY = mi.y - 1;
    nextX = mi.x - 1;
    if(validRange(nextX, nextY) && map[nextY][nextX] === 0 && existPos(nextX, nextY, closeList) == "" && map[mi.y - 1][mi.x] == 0 && map[mi.y][mi.x - 1] == 0) {
        ret.push({"x":nextX, "y": nextY, "g":w.g + 14, "px":mi.x, "py":mi.y});
    }
    return ret;
} 

function findMinF(obj) {
    var minIndex = "";
    var minValue = 1e9;
    for(var key in obj) {
        if(minValue > obj[key].g + obj[key].h) {
            minValue = obj[key].g + obj[key].h;
            minIndex = key;
        }
    }

    return minIndex;
}
function astar(x, y, goalX, goalY) {
    var h = Math.abs(goalX - x) + Math.abs(goalY - y);
    h *= 10;
    openList[JSON.stringify({"x":x, "y":y})] = {"g":0, "h":h};
    // openList.push({"x":x, "y":y, "g":0, "h":h});
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@");
    setTimeout(function abc() {
        if(Object.keys(openList).length > 0) { 
            var minIndex = findMinF(openList);
            minIndex = JSON.parse(minIndex);
            var w = openList[JSON.stringify(minIndex)];
            // openList.splice(minIndex, 1);
            delete openList[JSON.stringify(minIndex)];
            closeList[JSON.stringify(minIndex)] = w;

            graphics.clear();
            drawMap(map);
            if(minIndex.y == goalY && minIndex.x == goalX) {
                var curX, curY;
                curX = goalX;
                curY = goalY;
                while(playerX != curX || playerY != curY) {
                    drawPlayer(curX, curY, 0xffff00);
                    var parent = closeList[JSON.stringify({"x":curX, "y":curY})];
                    curX = parent.px;
                    curY = parent.py;
                }
                drawPlayer(curX, curY, 0xffff00);
                return;
            }
            drawPlayer(minIndex.x, minIndex.y, 0xff0000);
            var adj = getAdj(minIndex, w);
            for(var i=0; i<adj.length; i++) {
                var existIndex = existPos(adj[i].x, adj[i].y, openList);
                if(existIndex != "") {
                    if(openList[existIndex].g > adj[i].g) {
                        openList[existIndex].g = adj[i].g; 
                        openList[existIndex].py = minIndex.y;
                        openList[existIndex].px = minIndex.x; 
                    } 
                }
                else {
                    adj[i].h = (Math.abs(goalX - adj[i].x) + Math.abs(goalY - adj[i].y)) * 10;
                    openList[JSON.stringify({"x":adj[i].x, "y":adj[i].y})] = {"g":adj[i].g, "px":adj[i].px, "py":adj[i].py, "h":(Math.abs(goalX - adj[i].x) + Math.abs(goalY - adj[i].y)) * 10};

                }
            }

            // console.log(w);
            // break;

            setTimeout(function() {
                abc();
            }, 5000);
        }
    }, 5000);
}

var map = [];
for(var i=0; i<sizeY+1; i++) {
    var arr = [];
    for(var j=0; j<sizeX+1; j++) {
        arr.push(0);
    }
    map.push(arr);
}

map[2][4] = 1;
map[3][4] = 1;
map[4][4] = 1;

drawMap(map);
drawPlayer(playerX, playerY, 0xffff00);

astar(playerX, playerY, goalX, goalY);
// Listen for animate update
app.ticker.add((delta) => {
    // rotate the container!
    // use delta to create frame-independent transform
    // container.rotation -= 0.01 * delta;
});

