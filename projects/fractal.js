

let canvas = null;
let currentDepth = -1;
let depth = 11;
let degrees = 90;
let length = 300;
let pause = false;
let speed = 1;

let startSequence = 'L';
let invStartSequence = 'R';

let currentSequence = 'L';
let readSeqIndex = 819;

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
    canvas = new Canvas(canvasObj);

    canvas.ctx.strokeStyle = 'white';
    canvas.ctx.fillStyle = 'white';
    canvas.ctx.font = '16px Arial';

    document.body.addEventListener('keydown', listenKeyDown);

    tick();
}

function tick() {


    // animDegrees();
    canvas.beginPath();
    canvas.clear();
    if (currentDepth != depth) {
        currentSequence = genDragonFractalSeq(depth, startSequence, invStartSequence);
        currentDepth = depth;
    }
    let idxGen = findIdxGen(readSeqIndex);
    let gen = findGen(currentSequence.length);
    
    canvas.drawDragon(currentSequence, readSeqIndex, idxGen);

    canvas.drawGenText(readSeqIndex, currentSequence, idxGen, gen);
    canvas.stroke();

    if (!pause)
        requestAnimationFrame(tick);
}

function listenKeyDown(ev) {
    if (ev.code == 'KeyR') {
        readSeqIndex = 0;
    }
    else if (ev.code == 'KeyB') {
        readSeqIndex--;
        if (readSeqIndex < 0) {
            readSeqIndex = 0;
        }
    }
    else if (ev.code == 'KeyN') {
        readSeqIndex++;
        if (readSeqIndex >= currentSequence.length) {
            readSeqIndex = 0;
        }
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

        canvas.fillText(`Index: ${idx}/${seq.length-1}. Symbol: ${seq[idx]}. Gen: ${idxGen}/${gen}.`, 200, 200);
    }

    drawDragon(seq, highlightIdx, idxGen) {
        let len = length * Math.pow(2, -.5 * depth);
        let x = Math.floor(this.ctx.canvas.width / 2);
        let y = Math.floor(this.ctx.canvas.width / 2);
        let pos = new Vec2(x, y);
        // let dir = new Vec2(len, 0);
        let dir = new Vec2(10, 0);

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