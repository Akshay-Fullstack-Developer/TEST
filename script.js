let boxCounter = 900;
let history = [];
let historyIndex = -1;

document.addEventListener("DOMContentLoaded", function() {
    // Initialize drag-and-drop event listeners
    document.querySelectorAll('.box').forEach(box => {
        box.addEventListener('dragstart', dragStart);
        box.addEventListener('dragover', dragOver);
        box.addEventListener('drop', drop);
        box.addEventListener('dragend', dragEnd);
    });

    // Initialize Undo/Redo functionality
    document.getElementById('addRow').addEventListener('click', addRow);
    document.getElementById('undo').addEventListener('click', undo);
    document.getElementById('redo').addEventListener('click', redo);
});

function dragStart(e) {
    e.dataTransfer.setData('text', e.target.id);
    e.target.style.opacity = '0.4'; // Fading effect during drag
}

function dragOver(e) {
    e.preventDefault(); // Allow drop
}

function drop(e) {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text');
    const draggedBox = document.getElementById(draggedId);
    const targetCell = e.target.closest('td');

    if (targetCell && targetCell !== draggedBox.parentElement) {
        const sourceBox = targetCell.querySelector('.box');
        if (sourceBox) {
            targetCell.appendChild(draggedBox);
            draggedBox.parentElement.appendChild(sourceBox);
        } else {
            targetCell.appendChild(draggedBox);
        }

        // Record the action for undo/redo
        recordAction('drag', draggedId, draggedBox.parentElement, targetCell);
    }

    draggedBox.style.opacity = '1'; // Reset opacity
}

function dragEnd(e) {
    e.target.style.opacity = '1'; // Reset opacity
}

// Handle row addition
function addRow() {
    const table = document.getElementById('table').getElementsByTagName('tbody')[0];
    const row = table.insertRow();
    
    for (let i = 0; i < 3; i++) {
        const cell = row.insertCell(i);
        const newBox = document.createElement('div');
        boxCounter++;
        newBox.className = 'box';
        newBox.id = `box${boxCounter}`;
        newBox.style.backgroundColor = getRandomColor();
        newBox.draggable = true;
        newBox.innerText = boxCounter;
        newBox.addEventListener('dragstart', dragStart);
        newBox.addEventListener('dragover', dragOver);
        newBox.addEventListener('drop', drop);
        newBox.addEventListener('dragend', dragEnd);
        cell.appendChild(newBox);
    }

    // Record the row addition for undo/redo
    recordAction('addRow', boxCounter);
}

// Undo/Redo functionality
function recordAction(type, id, sourceCell, targetCell) {
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1); // Trim redo history
    }
    history.push({ type, id, sourceCell, targetCell });
    historyIndex++;
    updateUndoRedoButtons();
}

function undo() {
    if (historyIndex >= 0) {
        const lastAction = history[historyIndex];
        if (lastAction.type === 'drag') {
            const box = document.getElementById(lastAction.id);
            const targetCell = lastAction.sourceCell;
            const sourceCell = lastAction.targetCell;
            swapBoxes(box, targetCell, sourceCell);
        } else if (lastAction.type === 'addRow') {
            const table = document.getElementById('table').getElementsByTagName('tbody')[0];
            table.deleteRow(table.rows.length - 1);
        }
        historyIndex--;
        updateUndoRedoButtons();
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        const nextAction = history[historyIndex];
        if (nextAction.type === 'drag') {
            const box = document.getElementById(nextAction.id);
            const targetCell = nextAction.targetCell;
            const sourceCell = nextAction.sourceCell;
            swapBoxes(box, sourceCell, targetCell);
        } else if (nextAction.type === 'addRow') {
            addRow();
        }
        updateUndoRedoButtons();
    }
}

function updateUndoRedoButtons() {
    document.getElementById('undo').disabled = historyIndex < 0;
    document.getElementById('redo').disabled = historyIndex >= history.length - 1;
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function swapBoxes(draggedBox, sourceCell, targetCell) {
    const sourceBox = targetCell.querySelector('.box');
    if (sourceBox) {
        targetCell.appendChild(draggedBox);
        draggedBox.parentElement.appendChild(sourceBox);
    } else {
        targetCell.appendChild(draggedBox);
    }
}
