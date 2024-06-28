

let canvas = null;
let currentDepth = -1;

let degrees = 90;
let length = 300;
let pause = false;
let speed = 1;

let startSequence = 'L';
let invStartSequence = 'R';

let currentSequence = 'L';


function updateSequence(pattern) {
    inv = '';
    for (let i = 0; i < pattern.length; i++) {
        let symbol = pattern[i];
        inv += symbol == 'L' ? 'R' : 'L';
    }
    invStartSequence = inv;
    startSequence = pattern;
}

window.onload = function() {
    let canvasObj = document.querySelector('.canvas');
    if (!canvasObj) {
        console.error("Canvas element not found.");
    }
    canvas = new Canvas(canvasObj);

    canvas.ctx.strokeStyle = 'white';
    canvas.ctx.fillStyle = 'white';
    canvas.ctx.font = '16px Arial';

    document.body.addEventListener('keydown', listenKeyDown);
    document.body.addEventListener('keyup', listenKeyUp);

    StateStorage.initState(11, 1525);

    tick();
}

function tick() {


    // animDegrees();
    canvas.beginPath();
    canvas.clear();
    if (currentDepth != StateStorage.depth) {
        currentSequence = genDragonFractalSeq(StateStorage.depth, startSequence, invStartSequence);
        currentDepth = StateStorage.depth;
    }
    let idxGen = findIdxGen(StateStorage.idx);
    let gen = findGen(currentSequence.length);
    
    canvas.drawDragon(currentSequence, StateStorage.idx, idxGen);

    canvas.drawGenText(StateStorage.idx, currentSequence, idxGen, gen);
    canvas.stroke();

    if (!pause)
        requestAnimationFrame(tick);
}

function listenKeyDown(ev) {
    if (ev.code == 'KeyR') {
        StateStorage.setIdx(0);
    }
    else if (ev.code == 'KeyB') {
        var newidx = StateStorage.idx - 1;
        if (newidx < 0) {
            newidx = 0;
        }
        StateStorage.setIdx(newidx);
    }
    else if (ev.code == 'KeyN') {
        var newidx = StateStorage.idx + 1;
        if (newidx >= currentSequence.length) {
            newidx = currentSequence.length - 1;
        }
        StateStorage.setIdx(newidx);
    }
    else if (ev.code == 'KeyH') {
        var newDepth = StateStorage.depth - 1;
        if (newDepth < 0) {
            newDepth = 0;
        }
        StateStorage.setDepth(newDepth);
    }
    else if (ev.code == 'KeyJ') {
        StateStorage.setDepth(StateStorage.depth + 1);
    }
    
}

function listenKeyUp(ev) {
    if (ev.code == 'KeyR' || ev.code == 'KeyB'
        || ev.code == 'KeyN' || ev.code == 'KeyH' || ev.code == 'KeyJ') {
        StateStorage.setQueryParams();
    }
}

function findIdxGen(idx) {
    let idxGen = 1;
    while ((1 << idxGen) - 1 <= idx) {
        idxGen++;
    }
    return idxGen - 1;
}

function findGen(length) {
    let gen = 0;
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

class Canvas {
    constructor(canvasObj) {
        this.ctx = canvasObj.getContext('2d');
    }

    drawGenText(idx, seq, idxGen, gen) {
        canvas.fillText(`Index: ${idx}/${seq.length-1}. Symbol: ${seq[idx]}. Gen: ${idxGen}/${gen}.`, 400, 200);
    }

    drawDragon(seq, highlightIdx, idxGen) {
        let len = length * Math.pow(2, -.5 * StateStorage.depth);
        let x = Math.floor(this.ctx.canvas.width / 2);
        let y = Math.floor(this.ctx.canvas.width / 2);
        let pos = new Vec2(x, y);
        let dir = new Vec2(len, 0);
        // let dir = new Vec2(10, 0);

        this.stroke();
        this.beginPath();
        this.ctx.moveTo(x, y);
        pos = pos.add(dir);

        let prevColour;
        if (highlightIdx == 0) {
            this.ctx.strokeStyle = 'red';
            prevColour = 'red';
        }
        else {
            this.ctx.strokeStyle = 'white';
            prevColour = 'white';
        }

        this.ctx.lineTo(pos.x, pos.y);

        let prevIdxGen = 0;
        for (let i = 0; i < seq.length; i++) {

            if (seq[i] == 'L') {
                dir = dir.rotateDegCCW(-degrees);
            }
            else {
                dir = dir.rotateDegCCW(degrees);
            }

            let newColour;
            let newIdxGen = findIdxGen(i + 1);
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

    fillText(text, x, y, width=undefined) {
        this.ctx.fillText(text, x, y, width);
    }

    beginPath() {
        this.ctx.beginPath();
    }

    clear() {
        this.ctx.clearRect(0,0,this.ctx.canvas.width, this.ctx.canvas.height);
    }

    stroke() {
        this.ctx.stroke();
    }
}

class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    rotate90CW() {
        return new Vec2(this.y, -this.x);
    }
    rotateDegCCW(degrees) {
        let rad = degrees * Math.PI / 180;
        let x = this.x * Math.cos(rad) - this.y * Math.sin(rad);
        let y = this.x * Math.sin(rad) + this.y * Math.cos(rad);
        return new Vec2(x, y);
    }
    rotate90CCW() {
        return new Vec2(-this.y, this.x);
    }

    add(vec) {
        return new Vec2(this.x + vec.x, this.y + vec.y);
    }
}


function genDragonFractalSeq(depth, seq = 'L', invSeq='R') {
    // console.log('Generating... depth:', depth);
    for (let i = 1; i <= depth; i++) {
        let newSeq = `${seq}L${invSeq}`;
        let newInvSeq =  `${seq}R${invSeq}`;
        seq = newSeq;
        invSeq = newInvSeq;
        // console.log(`Sequence at depth ${i}: ${seq}`);
    }
    return seq;
}

// TODO: convert class to function if needing to support ~pre-2016 browsers
// also need to convert the above classes too

// function StateStorage(defaultDepth, defaultIdx) {
//     this._idxLSName = "fractal_index";
//     this._idxQPName = "i";
//     this._depthLSName = "fractal_depth";
//     this._depthQPName = "depth";

//     this.setLSIdx = function(idx) {
//         localStorage.setItem(StateStorage.idxLSName, idx);
//     }

//     this.getLSIdx = function() {
//         return localStorage.getItem(StateStorage.idxLSName);
//     }

//     this.setLSDepth = function(depth) {
//         localStorage.setItem(StateStorage.depthLSName, depth);
//     }

//     this.getLSDepth = function() {
//         return localStorage.getItem(StateStorage.depthLSName);
//     }

//     this.setQueryParams = function(depth, idx) {
//         window.history.replaceState(null, "", `/?depth=${depth}&i=${idx}`);
//     }

//     //....
// }

/**
 * Local storage interface for loading and saving current read index and depth
 */
class StateStorage {
    static idxLSName = "fractal_index";
    static idxQPName = "i";
    static depthLSName = "fractal_depth";
    static depthQPName = "depth";

    static idx;
    static depth;

    static defaultIdx;
    static defaultDepth;

    static setLSIdx() {
        localStorage.setItem(StateStorage.idxLSName, StateStorage.idx);
    }

    static getLSIdx() {
        return localStorage.getItem(StateStorage.idxLSName);
    }

    static setLSDepth() {
        localStorage.setItem(StateStorage.depthLSName, StateStorage.depth);
    }

    static getLSDepth() {
        return localStorage.getItem(StateStorage.depthLSName);
    }

    static setQueryParams() {
        if (!window.history.replaceState) {
            console.warn("history.replaceState() not supported");
            return;
        }
        const newurl = window.location.pathname + '?depth=' + StateStorage.depth + '&i=' + StateStorage.idx;
        window.history.replaceState(null, "", newurl);
    }

    static initState(defaultDepth, defaultIdx) {
        StateStorage.defaultDepth = defaultDepth;
        StateStorage.defaultIdx = defaultIdx;

        // load local storage values
        StateStorage.depth = StateStorage.getLSDepth() || defaultDepth;
        StateStorage.idx = StateStorage.getLSIdx() || defaultIdx;
        console.log(StateStorage.depth, StateStorage.idx);


        if ((typeof URLSearchParams !== "function") && (typeof URLSearchParams !== "object")) {
            console.error("Query parameters not supported.");
            return;
        }
        // load query parameters and if valid overwrite existing value.
        const urlParams = new URLSearchParams(window.location.search);
        const idxQuery = urlParams.get(StateStorage.idxQPName) || NaN;
        const depthQuery = urlParams.get(StateStorage.depthQPName) || NaN;
        const tempIdx = Math.floor(idxQuery);
        const tempDepth = Math.floor(depthQuery);
        console.log(tempIdx, tempDepth);
        if (!isNaN(tempIdx)) {
            StateStorage.idx = tempIdx;
        }
        if (!isNaN(tempDepth)) {
            StateStorage.depth = tempDepth;
        }

        // set the query parameters with the clean values
        StateStorage.setQueryParams();
    }

    static setIdx(idx) {
        StateStorage.updateState(StateStorage.depth, idx);
    }

    static setDepth(depth) {
        StateStorage.updateState(depth, StateStorage.idx);
    }

    static updateState(depth, idx) {
        StateStorage.depth = depth;
        StateStorage.idx = idx;
        StateStorage.setLSDepth();
        StateStorage.setLSIdx();
    }

    static reset() {
        localStorage.clear();
        StateStorage.setQueryParams(StateStorage.defaultDepth, StateStorage.defaultIdx);
    }

    
}