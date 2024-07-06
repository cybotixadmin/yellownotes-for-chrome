// Content script for the browser extension

document.addEventListener("DOMContentLoaded", function() {
    // Constants for canvas size and colors
    const canvasWidth = 200;
    const canvasHeightLarge = 250;
    const canvasHeightSmall = 30;
    const initialColor = '#FFFF00'; // Yellow

    // Get the table cells for canvas and controls
    const canvasCell = document.getElementById('canvas-cell');
    const controlsCell = document.getElementById('controls-cell');

    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeightLarge;
    canvas.style.backgroundColor = initialColor; // Set initial color
    canvasCell.appendChild(canvas);

    // Get canvas context
    const ctx = canvas.getContext('2d');

    // Variables to track drawing state
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Function to draw a sample line based on selected type
    function drawSampleLine(ctx, lineType, color, thickness) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeightSmall);
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;

        // Draw different types of lines
        switch (lineType) {
            case 'solid':
                ctx.beginPath();
                ctx.moveTo(10, 15);
                ctx.lineTo(190, 15);
                ctx.stroke();
                break;
            case 'widely_stapled':
                ctx.beginPath();
                ctx.moveTo(10, 15);
                ctx.lineTo(70, 15);
                ctx.moveTo(90, 15);
                ctx.lineTo(150, 15);
                ctx.stroke();
                break;
            case 'dencely_stapled':
                ctx.beginPath();
                ctx.moveTo(10, 15);
                ctx.lineTo(50, 15);
                ctx.moveTo(70, 15);
                ctx.lineTo(110, 15);
                ctx.moveTo(130, 15);
                ctx.lineTo(170, 15);
                ctx.stroke();
                break;
            default:
                break;
        }
    }

    // Color picker for canvas background
    const canvasColorPicker = document.createElement('input');
    canvasColorPicker.type = 'color';
    canvasColorPicker.value = initialColor;
    canvasColorPicker.addEventListener('input', function() {
        canvas.style.backgroundColor = canvasColorPicker.value;
    });
    controlsCell.appendChild(canvasColorPicker);

    // Color picker for drawing color
    const drawColorPicker = document.createElement('input');
    drawColorPicker.type = 'color';
    drawColorPicker.value = '#000000'; // Black initially
    drawColorPicker.addEventListener('input', function() {
        ctx.strokeStyle = drawColorPicker.value;
        drawSampleLine(ctx, lineTypeSelect.value, ctx.strokeStyle, lineWidthSelect.value);
    });
    controlsCell.appendChild(drawColorPicker);

    // Line width selector
    const lineWidthSelect = document.createElement('select');
    [1, 2, 3, 4, 5].forEach(function(num) {
        const option = document.createElement('option');
        option.value = num;
        option.textContent = num;
        lineWidthSelect.appendChild(option);
    });
    lineWidthSelect.addEventListener('change', function() {
        ctx.lineWidth = lineWidthSelect.value;
        drawSampleLine(ctx, lineTypeSelect.value, ctx.strokeStyle, ctx.lineWidth);
    });
    controlsCell.appendChild(lineWidthSelect);

    // Line type selector
    const lineTypeSelect = document.createElement('select');
    ['solid', 'widely_stapled', 'dencely_stapled'].forEach(function(type) {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type.replace('_', ' ');
        lineTypeSelect.appendChild(option);
    });
    lineTypeSelect.addEventListener('change', function() {
        drawSampleLine(ctx, lineTypeSelect.value, ctx.strokeStyle, lineWidthSelect.value);
    });
    controlsCell.appendChild(lineTypeSelect);

    // Button to save canvas as PNG
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save as PNG';
    saveButton.addEventListener('click', function() {
        const dataURI = canvas.toDataURL('image/png');
        console.log('Image saved:', dataURI);
        // Send dataURI to background script (example)
        chrome.runtime.sendMessage({ action: 'saveImage', imageDataURI: dataURI }, function(response) {
            console.log('Image saved:', response);
        });
    });
    controlsCell.appendChild(saveButton);

    // Function to handle mouse/touch down event for drawing
    function startDrawing(e) {
        e.preventDefault();
        isDrawing = true;
        [lastX, lastY] = [e.offsetX || e.touches[0].clientX, e.offsetY || e.touches[0].clientY];
    }

    // Function to handle mouse/touch move event for drawing
    function draw(e) {
        e.preventDefault();
        if (!isDrawing) return;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        [lastX, lastY] = [e.offsetX || e.touches[0].clientX, e.offsetY || e.touches[0].clientY];
        ctx.lineTo(lastX, lastY);
        ctx.stroke();
    }

    // Function to handle mouse/touch up event for drawing
    function stopDrawing(e) {
        e.preventDefault();
        isDrawing = false;
    }

    // Event listeners for mouse events on the canvas
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);

    // Event listeners for touch events on the canvas
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    // Initial drawing of the sample line
    drawSampleLine(ctx, 'solid', drawColorPicker.value, lineWidthSelect.value);
});
