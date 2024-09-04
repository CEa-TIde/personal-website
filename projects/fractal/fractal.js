/**
 * Dragon Fractal renderer
 * (c) CEa_TIde / Cyana
 *  
 * ————————————————————————————————————
 * Browser support:
 * # Canvas (basic)
 * https://caniuse.com/canvas
 * IE6-8 requires polyfill; partially supported on Safari 3.1-3.2, FF 2-3.5, Android 2.1-2.3, Opera Mini
 * (TODO: FIND POLYFILL, WHAT is partially supported?)
 * 
 * # String interpolation
 * TODO: replace with regular string concatenation
 * 
 * # Local storage
 * TODO: check if available before using
 * (fallback on cookies?)
 * 
 * # query strings
 * TODO: check if available before using (also URLsearchparams)
 * 
 * 
 */




var canvas = null;
var stateStorage = null;
var currentDepth = -1;

var degrees = 90;
var length = 300;
var pause = false;
var speed = 1;

var startSequence = 'L';
var invStartSequence = 'R';

var currentSequence = 'L';


function updateSequence(pattern) {
    inv = '';
    for (var i = 0; i < pattern.length; i++) {
        var symbol = pattern[i];
        inv += symbol == 'L' ? 'R' : 'L';
    }
    invStartSequence = inv;
    startSequence = pattern;
}

window.onload = function() {
    var canvasObj = document.querySelector('.canvas');
    if (!canvasObj) {
        console.error("Canvas element not found.");
    }
    canvas = new Canvas(canvasObj);
    stateStorage = new StateStorage(11, 1525);
    
    canvas.ctx.strokeStyle = 'white';
    canvas.ctx.fillStyle = 'white';
    canvas.ctx.font = '16px Arial';

    document.body.addEventListener('keydown', listenKeyDown);
    document.body.addEventListener('keyup', listenKeyUp);

    


    tick();
}

function tick() {


    // animDegrees();
    canvas.beginPath();
    canvas.clear();
    if (currentDepth != stateStorage.depth) {
        currentSequence = genDragonFractalSeq(stateStorage.depth, startSequence, invStartSequence);
        currentDepth = stateStorage.depth;
    }
    var idxGen = findIdxGen(stateStorage.idx);
    var gen = findGen(currentSequence.length);
    
    canvas.drawDragon(currentSequence, stateStorage.idx, idxGen);

    canvas.drawGenText(stateStorage.idx, currentSequence, idxGen, gen);
    canvas.stroke();

    if (!pause)
        requestAnimationFrame(tick);
}

function listenKeyDown(ev) {
    if (ev.code == 'KeyR') {
        stateStorage.setIdx(0);
    }
    else if (ev.code == 'KeyB') {
        var newidx = stateStorage.idx - 1;
        if (newidx < 0) {
            newidx = 0;
        }
        stateStorage.setIdx(newidx);
    }
    else if (ev.code == 'KeyN') {
        var newidx = stateStorage.idx + 1;
        if (newidx >= currentSequence.length) {
            newidx = currentSequence.length - 1;
        }
        stateStorage.setIdx(newidx);
    }
    else if (ev.code == 'KeyH') {
        var newDepth = stateStorage.depth - 1;
        if (newDepth < 0) {
            newDepth = 0;
        }
        stateStorage.setDepth(newDepth);
    }
    else if (ev.code == 'KeyJ') {
        stateStorage.setDepth(stateStorage.depth + 1);
    }
    
}

function listenKeyUp(ev) {
    if (ev.code == 'KeyR' || ev.code == 'KeyB'
        || ev.code == 'KeyN' || ev.code == 'KeyH' || ev.code == 'KeyJ') {
        stateStorage.updateQueryParams();
    }
}




function findIdxGen(idx) {
    var idxGen = 1;
    while ((1 << idxGen) - 1 <= idx) {
        idxGen++;
    }
    return idxGen - 1;
}

function findGen(length) {
    var gen = 0;
    while ((1 << gen) & length) {
        gen++;
    }
    return gen - 1;
}

function animDegrees() {
    degrees += speed / 60;
    if (degrees > 360)
        degrees = 0;
}

function Canvas(canvasObj) {
    this.ctx = canvasObj.getContext('2d');

    this.drawGenText = function(idx, seq, idxGen, gen) {
        var txt = "Index: " + idx + "/" + (seq.length - 1) + ". Symbol: " + seq[idx] + ". Gen: " + idxGen + "/" + gen + ".";
        canvas.fillText(txt, 400, 200);
    }

    this.drawDragon = function(seq, highlightIdx, idxGen) {
        var len = length * Math.pow(2, -.5 * stateStorage.depth);
        var x = Math.floor(this.ctx.canvas.width / 2);
        var y = Math.floor(this.ctx.canvas.width / 2);
        var pos = new Vec2(x, y);
        var dir = new Vec2(len, 0);
        // var dir = new Vec2(10, 0);

        this.stroke();
        this.beginPath();
        this.ctx.moveTo(x, y);
        pos = pos.add(dir);

        var prevColour;
        if (highlightIdx == 0) {
            this.ctx.strokeStyle = 'red';
            prevColour = 'red';
        }
        else {
            this.ctx.strokeStyle = 'white';
            prevColour = 'white';
        }

        this.ctx.lineTo(pos.x, pos.y);

        var prevIdxGen = 0;
        for (var i = 0; i < seq.length; i++) {

            if (seq[i] == 'L') {
                dir = dir.rotateDegCCW(-degrees);
            }
            else {
                dir = dir.rotateDegCCW(degrees);
            }

            var newColour;
            var newIdxGen = findIdxGen(i + 1);
            if (i == highlightIdx || i + 1 == highlightIdx) {
                newColour = 'red';
            }
            else if (idxGen == prevIdxGen || idxGen == newIdxGen) {
                if (i < highlightIdx) {
                    newColour = 'lightgreen';
                }
                else {
                    newColour = 'green';
                }
            }
            else {
                if (i % 6 < 6) {
                    newColour = 'white';
                }
                else {
                    newColour = 'black';
                }
            }

            if (prevColour != newColour) {
                this.stroke();
                this.beginPath();
                this.ctx.moveTo(pos.x, pos.y);
                this.ctx.strokeStyle = newColour;
            }
            pos = pos.add(dir);
            this.ctx.lineTo(pos.x, pos.y);
            prevColour = newColour;
            prevIdxGen = newIdxGen;
        }
        this.stroke();
        this.beginPath();
    }

    this.fillText = function(text, x, y, width=undefined) {
        this.ctx.fillText(text, x, y, width);
    }

    this.beginPath = function() {
        this.ctx.beginPath();
    }

    this.clear = function() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    this.stroke = function() {
        this.ctx.stroke();
    }
} 


function Vec2(x, y) {
    this.x = x;
    this.y = y;

    this.rotate90CW = function() {
        return new Vec2(this.y, -this.x);
    }
    this.rotateDegCCW = function(degrees) {
        var rad = degrees * Math.PI / 180;
        var x = this.x * Math.cos(rad) - this.y * Math.sin(rad);
        var y = this.x * Math.sin(rad) + this.y * Math.cos(rad);
        return new Vec2(x, y);
    }
    this.rotate90CCW = function() {
        return new Vec2(-this.y, this.x);
    }

    this.add = function(vec) {
        return new Vec2(this.x + vec.x, this.y + vec.y);
    }
}


function genDragonFractalSeq(depth, seq = 'L', invSeq='R') {
    // console.log('Generating... depth:', depth);
    for (var i = 1; i <= depth; i++) {
        var newSeq = seq + "L" + invSeq;
        var newInvSeq = seq + "R" + invSeq;
        seq = newSeq;
        invSeq = newInvSeq;
        // console.log("Sequence at depth", i, ":", seq);
    }
    return seq;
}


/**
 * Local storage interface for loading and saving current read index and depth
 */
function StateStorage(defaultDepth, defaultIdx) {
    this._idxLSName = "fractal_index";
    this._idxQPName = "i";
    this._depthLSName = "fractal_depth";
    this._depthQPName = "depth";
    this.defaultDepth = defaultDepth;
    this.defaultIdx = defaultIdx;

    // init storage. Is called after all functions are initialised
    this.initState = function() {

        // load local storage values
        this.depth = this.getLSDepth() || this.defaultDepth;
        this.idx = this.getLSIdx() || this.defaultIdx;


        if ((typeof URLSearchParams !== "function") && (typeof URLSearchParams !== "object")) {
            console.warning("URLSearchParams for query parameters is not supported.");
            return;
        }
        // load query parameters and if valid overwrite existing value.
        var urlParams = new URLSearchParams(window.location.search);
        var idxQuery = urlParams.get(this._idxQPName) || NaN;
        var depthQuery = urlParams.get(this._depthQPName) || NaN;
        var tempIdx = Math.floor(idxQuery);
        var tempDepth = Math.floor(depthQuery);

        if (!isNaN(tempIdx)) {
            this.idx = tempIdx;
        }
        if (!isNaN(tempDepth)) {
            this.depth = tempDepth;
        }

        // set the query parameters with the clean values
        this.updateQueryParams();
    }

    this.setLSIdx = function() {
        localStorage.setItem(this._idxLSName, this.idx);
    }

    this.getLSIdx = function() {
        var val = localStorage.getItem(this._idxLSName);
        if (null !== val) return +val || null;
        return null;
    }

    this.setLSDepth = function() {
        localStorage.setItem(this._depthLSName, this.depth);
    }

    this.getLSDepth = function() {
        var val = localStorage.getItem(this._depthLSName);
        if (null !== val) return +val || null;
        return null;
    }

    this.updateQueryParams = function() {
        if (!window.history.replaceState) {
            console.warn("Query parameters are not supported.");
            return;
        }

        var queryState = this._depthQPName + '=' + this.depth + '&' + this._idxQPName + '=' + this.idx;

        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + queryState;
        window.history.replaceState(null, '', newurl);
    }

    this.setIdx = function(idx) {
        if (isNaN(idx) || +idx !== idx) return;
        this.idx = idx;
        this.setLSIdx();
    }

    this.setDepth = function(depth) {
        if (isNaN(depth) || +depth !== depth) return;
        this.depth = depth;
        this.setLSDepth();
    }

    this.reset = function() {
        localStorage.clear();
        this.depth = this.defaultDepth;
        this.idx = this.defaultIdx;
        this.updateQueryParams();
    }

    this.initState();
}
