const canvas = document.querySelector('.signature-pad');
const form = document.querySelector('.signature-pad-form');
const clearButton = document.querySelector('.clear-button');
const ctx = canvas.getContext('2d');
let writingMode = false;

// Set default color
let selectedColor = '#000000'; 
const colorPicker = document.getElementById('colorPicker');

colorPicker.addEventListener('input', (event) => {
    selectedColor = event.target.value;
    ctx.strokeStyle = selectedColor;
});

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const imageURL = canvas.toDataURL();
    
    // Get the text annotation
    const annotation = document.getElementById('textAnnotation').value;

    // Create an image element for the signature
    const image = document.createElement('img');
    image.src = imageURL;
    image.height = canvas.height;
    image.width = canvas.width;
    image.style.display = 'block';
    
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
    combinedCtx.fillText(annotation, 10, canvas.height + 20); // Position the text

    // Append the combined image
    const combinedImage = document.createElement('img');
    combinedImage.src = combinedCanvas.toDataURL();
    combinedImage.style.display = 'block';
    form.appendChild(combinedImage);
});


// Clear canvas function
const clearPad = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
};

const handlePointerDown = (event) => {
    writingMode = true;
    ctx.lineWidth = 0.6; // Set line width here
    ctx.beginPath();
    const [positionX, positionY] = getTargetPosition(event);
    ctx.moveTo(positionX, positionY);
};

const handlePointerMove = (event) => {
    if (!writingMode) return;
    const [positionX, positionY] = getTargetPosition(event);
    
    // Introduce a delay to make drawing appear slower
    setTimeout(() => {
        ctx.lineTo(positionX, positionY);
        ctx.stroke();
    }, 30); // Adjust the delay time (in milliseconds) as needed
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
    combinedCtx.fillText(annotation, 10, canvas.height + 20); // Position the text

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
    combinedCtx.fillText(annotation, 10, canvas.height + 20); // Position the text

    const imageURL = combinedCanvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    pdf.addImage(imageURL, 'PNG', 10, 10, 190, 100); // Adjust dimensions as needed
    pdf.save('signature_with_annotation.pdf'); // Save the PDF
});


// Setup canvas properties
ctx.lineWidth = 3;
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
