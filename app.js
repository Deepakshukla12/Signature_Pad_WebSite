const canvas = document.querySelector('.signature-pad');
const form = document.querySelector('.signature-pad-form');
const clearButton = document.querySelector('.clear-button');
const ctx = canvas.getContext('2d');
let writingMode = false;

let selectedColor = '#000000'; 
const colorPicker = document.getElementById('colorPicker');

canvas.width = canvas.offsetWidth;
canvas.height = 300; 

colorPicker.addEventListener('input', (event) => {
    selectedColor = event.target.value;
    ctx.strokeStyle = selectedColor;
});

form.addEventListener('submit', (event) => {
    event.preventDefault();
    
    // Generate image from canvas and annotation
    const imageURL = canvas.toDataURL();
    const annotation = document.getElementById('textAnnotation').value;

    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = canvas.width;
    combinedCanvas.height = canvas.height + 30; 
    const combinedCtx = combinedCanvas.getContext('2d');

    combinedCtx.drawImage(canvas, 0, 0);
    combinedCtx.fillStyle = 'black'; 
    combinedCtx.font = '16px Arial'; 
    combinedCtx.fillText(annotation, 10, canvas.height); 

    const combinedImage = document.createElement('img');
    combinedImage.src = combinedCanvas.toDataURL();
    combinedImage.style.display = 'block';
    form.appendChild(combinedImage);

    // Scroll down to the signature preview smoothly after it is appended
    setTimeout(() => {
        combinedImage.scrollIntoView({
            behavior: 'smooth',
            block: 'start' // You can also use 'center' or 'end' based on preference
        });
    }, 100); // Delay to ensure DOM updates before scrolling
});


const clearPad = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath(); 
};

clearButton.addEventListener('click', () => {
    clearPad();
});

const getTargetPosition = (event) => {
    const rect = canvas.getBoundingClientRect();
    const positionX = event.clientX - rect.left; 
    const positionY = event.clientY - rect.top;  
    return [positionX, positionY];
};

const handlePointerUp = () => {
    writingMode = false;
    ctx.beginPath(); 
};

const handlePointerDown = (event) => {
    writingMode = true;
    const [positionX, positionY] = getTargetPosition(event);
    ctx.lineWidth = 2; // Set line width for better visibility
    ctx.strokeStyle = selectedColor; 
    ctx.moveTo(positionX, positionY); 
    ctx.beginPath(); // Start a new path to avoid connecting lines
};

const handlePointerMove = (event) => {
    if (!writingMode) return;
    const [positionX, positionY] = getTargetPosition(event);
    ctx.lineTo(positionX, positionY);
    ctx.stroke();
    ctx.moveTo(positionX, positionY); 
};

const throttle = (func, limit) => {
    let lastFunc;
    let lastRan;
    return function(...args) {
        if (!lastRan) {
            func.apply(this, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(() => {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(this, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
};

const draw = (event) => {
    handlePointerMove(event);
};

// Download image button event
const downloadButton = document.querySelector('.download-button');
downloadButton.addEventListener('click', () => {
    const annotation = document.getElementById('textAnnotation').value;

    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = canvas.width;
    combinedCanvas.height = canvas.height + 30; 
    const combinedCtx = combinedCanvas.getContext('2d');

    combinedCtx.drawImage(canvas, 0, 0);
    combinedCtx.fillStyle = 'black'; 
    combinedCtx.font = '16px Arial'; 
    combinedCtx.fillText(annotation, 10, canvas.height); 

    const imageURL = combinedCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imageURL;
    link.download = 'signature_with_annotation.png'; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Download PDF button event
const downloadPdfButton = document.querySelector('.download-pdf-button');
downloadPdfButton.addEventListener('click', () => {
    const annotation = document.getElementById('textAnnotation').value;

    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = canvas.width;
    combinedCanvas.height = canvas.height + 30; 
    const combinedCtx = combinedCanvas.getContext('2d');

    combinedCtx.drawImage(canvas, 0, 0);
    combinedCtx.fillStyle = 'black'; 
    combinedCtx.font = '16px Arial'; 
    combinedCtx.fillText(annotation, 10, canvas.height); 

    const imageURL = combinedCanvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    pdf.addImage(imageURL, 'PNG', 10, 10, 190, 100); 
    pdf.save('signature_with_annotation.pdf'); 
});

ctx.lineWidth = 1.5; 
ctx.lineJoin = ctx.lineCap = 'round';
ctx.strokeStyle = selectedColor;

canvas.addEventListener('pointerdown', handlePointerDown, { passive: false });
canvas.addEventListener('pointerup', handlePointerUp, { passive: false });
canvas.addEventListener('pointermove', throttle(draw, 16), { passive: false });

const preventDefault = (event) => {
    event.preventDefault();
};

canvas.addEventListener('touchstart', (event) => {
    preventDefault(event);
    handlePointerDown(event.touches[0]);
}, { passive: false });

canvas.addEventListener('touchend', (event) => {
    preventDefault(event);
    handlePointerUp();
}, { passive: false });

canvas.addEventListener('touchmove', (event) => {
    preventDefault(event);
    draw(event.touches[0]);
}, { passive: false });

window.addEventListener('resize', () => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCanvas.getContext('2d').drawImage(canvas, 0, 0);

    canvas.width = canvas.offsetWidth;
    canvas.height = 300; 
    ctx.drawImage(tempCanvas, 0, 0);
});

// Undo/Redo functionality
const undoButton = document.querySelector('.undo-button');
const redoButton = document.querySelector('.redo-button');

let undoStack = [];
let redoStack = [];

const saveState = (stack, canvas, keepRedo = false) => {
    if (!keepRedo) {
        redoStack = []; 
    }
    stack.push(canvas.toDataURL());
};

const restoreState = (canvas, ctx, stack) => {
    if (stack.length) {
        const canvasPic = new Image();
        const state = stack.pop();
        canvasPic.src = state;
        canvasPic.onload = () => ctx.drawImage(canvasPic, 0, 0);
    }
};

canvas.addEventListener('pointerdown', () => {
    saveState(undoStack, canvas);
    writingMode = true;
});

undoButton.addEventListener('click', () => {
    if (undoStack.length > 0) {
        saveState(redoStack, canvas, true);
        clearPad(); 
        restoreState(canvas, ctx, undoStack); 
    }
});

redoButton.addEventListener('click', () => {
    if (redoStack.length > 0) {
        saveState(undoStack, canvas, true);
        clearPad(); 
        restoreState(canvas, ctx, redoStack); 
    }
});

// Scroll to the top and reset zoom on page load
window.addEventListener('load', function() {
    // Scroll to the top
    setTimeout(function() {
        window.scrollTo(0, 0);
    }, 0);  // Using setTimeout to ensure scroll is triggered after page load

    // Reset the page zoom to default (100%) on reload
    document.body.style.transform = 'scale(1)';
    document.body.style.transformOrigin = 'top left';
});
