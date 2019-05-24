const canvas    = document.querySelector("canvas");
const app       = document.querySelector("#app");
const ctx       = canvas.getContext("2d");

let size = 0;
function resize(canvas, cb) {
    size = Math.min(canvas.clientWidth, canvas.clientHeight);
    if (canvas.height !== size || canvas.width !== size)
        canvas.height = canvas.width = size;
    if (cb) cb();
}

resize(canvas);


function computeSize(x,y,w,h) {
    x=x*size;
    y=y*size;
    w=w*size;
    h=h*size;

    return [x,y,w,h]
}

function fillRect(x,y,w,h) {
    [x,y,w,h] = computeSize(x,y,w,h)
    ctx.fillRect(x,y,w,h);
}

function fillText(string,x,y,maxWidth = 0) {
    ctx.fillText(string,x*size,y*size, maxWidth*size);
}

function clearRect(x,y,w,h) {
    [x,y,w,h] = computeSize(x,y,w,h)
    ctx.clearRect(x,y,w,h);
}

function clear() {
    clearRect(0,0,1,1);
}

let tree = {
    type: 'tag',
    name: 'test',
    children: [
        { type: 'tag', name: 'one', children: [] },
        { type: 'tag', name: 'two', children: [] },
        { type: 'tag', name: 'three', children: [] },
    ]
}

const offset = 0.1;
function drawTree(t, level = 0, config = { line: 1 }) {
    ctx.font = `${size/50}px Consolas`;
    // ctx.fillStyle.fontcolor = 'black';
    let name = t.name;
    if (level === 0) name = `[[${name}]]`
    else name = "- " + JSON.stringify(t, false, " ").replace("  ", " ");
    ctx.fillText(name, (0+offset*level)*size, size*(config.line/15))
    for (let i = 0; i < t.children.length; i++) {
        config.line++;
        drawTree(t.children[i], level+1, config)
    }
}

function render() {
    // clear();
    // let x = Math.abs(0.9*Math.sin(Date.now()/1000)) - 0.1;
    // let y = 0;
    // fillRect(x,y,0.3,0.3);
    // resize(canvas);
    drawTree(tree);
    // requestAnimationFrame(render);
}
window.addEventListener('load', () => requestAnimationFrame(render));