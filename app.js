const canvas = document.querySelector('.signature-pad');
const form = document.querySelector('.signature-pad-form');
const clearButton = document.querySelector('.clear-button');
const ctx = canvas.getContext('2d');
let writingMode = false;

// Set default color
let selectedColor = '#000000'; 
const colorPicker = document.getElementById('colorPicker');

// Adjust the canvas size dynamically
canvas.width = canvas.offsetWidth;
canvas.height = 300; // Set desired height

colorPicker.addEventListener('input', (event) => {
    selectedColor = event.target.value;
    ctx.strokeStyle = selectedColor;
});

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const imageURL = canvas.toDataURL();
    
    // Get the text annotation
    const annotation = document.getElementById('textAnnotation').value;

    // Create a new canvas to draw the signature and annotation together
    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = canvas.width;
    combinedCanvas.height = canvas.height + 30; // Add space for the annotation
    const combinedCtx = combinedCanvas.getContext('2d');

    // Draw the signature
    combinedCtx.drawImage(canvas, 0, 0);

    // Add the annotation
    combinedCtx.fillStyle = 'black'; // Change to desired color
    combinedCtx.font = '16px Arial'; // Adjust font size and style as needed
    const textWidth = combinedCtx.measureText(annotation).width; // Get the text width
    const xPosition = (combinedCanvas.width - textWidth) / 2; // Calculate centered x position
    const yPosition = canvas.height - 20; // Position near the bottom
    combinedCtx.fillText(annotation, 10, canvas.height); // Adjusted Y position to canvas.height

    // Append the combined image
    const combinedImage = document.createElement('img');
    combinedImage.src = combinedCanvas.toDataURL();
    combinedImage.style.display = 'block';
    form.appendChild(combinedImage);
});

// Clear canvas function
const clearPad = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath(); // Clear paths for a fresh start
};

// Clear button event
clearButton.addEventListener('click', () => {
    clearPad();
});

// Drawing functions
const getTargetPosition = (event) => {
    const rect = canvas.getBoundingClientRect();
    const positionX = event.clientX - rect.left; 
    const positionY = event.clientY - rect.top;  
    return [positionX, positionY];
};

const handlePointerUp = () => {
    writingMode = false;
    ctx.beginPath(); // End the current drawing path cleanly
};

const handlePointerDown = (event) => {
    writingMode = true;
    const [positionX, positionY] = getTargetPosition(event);
    ctx.lineWidth = 1.5; // Set line width for smoother experience
    ctx.strokeStyle = selectedColor; // Ensure color is applied correctly
    ctx.moveTo(positionX, positionY); // Correctly set the start position
};

const handlePointerMove = (event) => {
    if (!writingMode) return;
    const [positionX, positionY] = getTargetPosition(event);
    ctx.lineTo(positionX, positionY);
    ctx.stroke();
    ctx.moveTo(positionX, positionY); // Ensure the path follows the pointer exactly
};

// Download image button event
const downloadButton = document.querySelector('.download-button');
downloadButton.addEventListener('click', () => {
    const annotation = document.getElementById('textAnnotation').value;

    // Create a new canvas to draw the signature and annotation together
    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = canvas.width;
    combinedCanvas.height = canvas.height + 30; // Add space for the annotation
    const combinedCtx = combinedCanvas.getContext('2d');

    // Draw the signature
    combinedCtx.drawImage(canvas, 0, 0);

    // Add the annotation
    combinedCtx.fillStyle = 'black'; // Change to desired color
    combinedCtx.font = '16px Arial'; // Adjust font size and style as needed
    combinedCtx.fillText(annotation, 10, canvas.height); // Adjusted Y position to canvas.height

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

    // Create a new canvas to draw the signature and annotation together
    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = canvas.width;
    combinedCanvas.height = canvas.height + 30; // Add space for the annotation
    const combinedCtx = combinedCanvas.getContext('2d');

    // Draw the signature
    combinedCtx.drawImage(canvas, 0, 0);

    // Add the annotation
    combinedCtx.fillStyle = 'black'; // Change to desired color
    combinedCtx.font = '16px Arial'; // Adjust font size and style as needed
    combinedCtx.fillText(annotation, 10, canvas.height); // Adjusted Y position to canvas.height

    const imageURL = combinedCanvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    pdf.addImage(imageURL, 'PNG', 10, 10, 190, 100); // Adjust dimensions as needed
    pdf.save('signature_with_annotation.pdf'); // Save the PDF
});

// Setup canvas properties for smoother drawing
ctx.lineWidth = 1.5; // Thinner stroke for smoother signature
ctx.lineJoin = ctx.lineCap = 'round';
ctx.strokeStyle = selectedColor;

// Event listeners for drawing
canvas.addEventListener('pointerdown', handlePointerDown, { passive: false });
canvas.addEventListener('pointerup', handlePointerUp, { passive: false });
canvas.addEventListener('pointermove', handlePointerMove, { passive: false });

// Touch events for mobile support
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
    handlePointerMove(event.touches[0]);
}, { passive: false });

// Resize canvas to fit the window size and maintain smooth writing experience
window.addEventListener('resize', () => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCanvas.getContext('2d').drawImage(canvas, 0, 0);

    canvas.width = canvas.offsetWidth;
    canvas.height = 300; // Reset to original height or set dynamically
    ctx.drawImage(tempCanvas, 0, 0);
});
const undoButton = document.querySelector('.undo-button');
const redoButton = document.querySelector('.redo-button');

let undoStack = [];
let redoStack = [];

// Save current canvas state
const saveState = (stack, canvas, keepRedo = false) => {
    if (!keepRedo) {
        redoStack = []; // Clear redo stack when new action is performed
    }
    stack.push(canvas.toDataURL());
};

// Restore canvas to a previous state
const restoreState = (canvas, ctx, stack) => {
    if (stack.length) {
        const canvasPic = new Image();
        const state = stack.pop();
        canvasPic.src = state;
        canvasPic.onload = () => ctx.drawImage(canvasPic, 0, 0);
    }
};

// On pointer down, save the state for undo
canvas.addEventListener('pointerdown', () => {
    saveState(undoStack, canvas);
    writingMode = true;
});

// Undo button functionality
undoButton.addEventListener('click', () => {
    if (undoStack.length > 0) {
        saveState(redoStack, canvas, true); // Save current state to redo stack
        clearPad(); // Clear current canvas
        restoreState(canvas, ctx, undoStack); // Restore the previous state
    }
});

// Redo button functionality
redoButton.addEventListener('click', () => {
    if (redoStack.length > 0) {
        saveState(undoStack, canvas, true); // Save current state to undo stack
        clearPad(); // Clear current canvas
        restoreState(canvas, ctx, redoStack); // Restore the next state from redo
    }
});
