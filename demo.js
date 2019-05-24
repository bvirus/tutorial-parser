import React, { Component, useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

const app = document.getElementById("app");
let style = { stroke: "black", strokeWidth: 4, fill: "red" }

function useDrag(node, {startX, startY} = {x: 50, y: 50}) {
    let [x, setX]   = useState(startX);
    let [y, setY]   = useState(startY);
    let dragging = useRef();
    useEffect(() => {
        function dragStart() {
            dragging.current = true;
        }
        function dragMove(ev) {
            if (dragging.current) {
                setX(ev.offsetX)
                setY(ev.offsetY)
            }
        }
        function dragStop() {
            dragging.current = false;
        }
        node.current.addEventListener('mousedown', dragStart);
        node.current.addEventListener('mousemove', dragMove);
        node.current.addEventListener('mouseup', dragStop);
        node.current.addEventListener('mouseout', dragStop);

        return () => {
            console.log('remove')
            node.current.removeEventListener('mousedown', dragStart);
            node.current.removeEventListener('mousemove', dragMove);
            node.current.removeEventListener('mouseup', dragStop);
            node.current.removeEventListener('mouseout', dragStop);
        }
    }, [node]);

    return [x, y];
}
function DragCircle() {
    let node        = useRef();
    let [x, y] = useDrag(node, { x: 50, y: 50 });

    return (<circle 
            cx={x}
            cy={y}
            r="40"
            ref={node}
            {...style} />);
}

function App() {
    
    return (<svg width="500" height="500">
        <DragCircle />
        <circle 
            cx="150" 
            cy="150" 
            r="40" 
            {...style} />
    </svg>)
}

// function 

ReactDOM.render(<App />, app);