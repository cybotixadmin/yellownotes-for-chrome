
function attacheCanvasEventlisteners(note_root){


    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    const controlPanel = document.getElementById('controlPanel');
    const pencilIcon = document.getElementById('pencilIcon');
    
    let isDrawing = false;
    let currentLineWidth = 1;
    let currentLineType = 'solid';
    let currentLineColor = '#000000';
    let canvasBgColor = '#FFFFFF';
    let noteId = canvas.closest('.grandparent').getAttribute('noteid');
    
    pencilIcon.addEventListener('click', () => {
        pencilIcon.style.display = 'none';
        controlPanel.style.display = 'block';
        canvas.style.pointerEvents = 'all';
        controlPanel.style.top = `${canvas.offsetTop}px`;
        controlPanel.style.left = `${canvas.offsetLeft + canvas.offsetWidth + 10}px`;
    });
    
    document.getElementById('lineThickness').addEventListener('input', (e) => {
        currentLineWidth = e.target.value;
    });
    
    document.getElementById('lineType').addEventListener('change', (e) => {
        currentLineType = e.target.value;
    });
    
    document.getElementById('lineColor').addEventListener('input', (e) => {
        currentLineColor = e.target.value;
    });
    
    document.getElementById('bgColor').addEventListener('input', (e) => {
        canvasBgColor = e.target.value;
        canvas.style.backgroundColor = canvasBgColor;
    });
    
    document.getElementById('canvasWidth').addEventListener('input', (e) => {
        canvas.width = e.target.value;
    });
    
    document.getElementById('canvasHeight').addEventListener('input', (e) => {
        canvas.height = e.target.value;
    });
    
    document.getElementById('erase').addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
    
    document.getElementById('save').addEventListener('click', () => {
        const dataURL = canvas.toDataURL('image/png');
        chrome.runtime.sendMessage({
            type: 'saveImage',
            noteId: noteId,
            dataURL: dataURL
        });
    });
    
    document.getElementById('closePanel').addEventListener('click', () => {
        controlPanel.style.display = 'none';
        pencilIcon.style.display = 'block';
        canvas.style.pointerEvents = 'none';
    });
    
    function startDrawing(e) {
        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    }
    
    function draw(e) {
        if (!isDrawing) return;
        ctx.lineWidth = currentLineWidth;
        ctx.strokeStyle = currentLineColor;
        ctx.lineCap = 'round';
        ctx.setLineDash(currentLineType === 'dashed' ? [5, 5] : []);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }
    
    function stopDrawing() {
        isDrawing = false;
        ctx.closePath();
    }
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Make the control panel draggable
    controlPanel.addEventListener('mousedown', (e) => {
        let shiftX = e.clientX - controlPanel.getBoundingClientRect().left;
        let shiftY = e.clientY - controlPanel.getBoundingClientRect().top;
        
        function moveAt(pageX, pageY) {
            controlPanel.style.left = pageX - shiftX + 'px';
            controlPanel.style.top = pageY - shiftY + 'px';
        }
        
        function onMouseMove(e) {
            moveAt(e.pageX, e.pageY);
        }
        
        document.addEventListener('mousemove', onMouseMove);
        
        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', onMouseMove);
        }, { once: true });
    });

}


document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    const controlPanel = document.getElementById('controlPanel');
    const pencilIcon = document.getElementById('pencilIcon');
    
    let isDrawing = false;
    let currentLineWidth = 1;
    let currentLineType = 'solid';
    let currentLineColor = '#000000';
    let canvasBgColor = '#FFFFFF';
    let noteId = canvas.closest('.grandparent').getAttribute('noteid');
    
    pencilIcon.addEventListener('click', () => {
        pencilIcon.style.display = 'none';
        controlPanel.style.display = 'block';
        canvas.style.pointerEvents = 'all';
        controlPanel.style.top = `${canvas.offsetTop}px`;
        controlPanel.style.left = `${canvas.offsetLeft + canvas.offsetWidth + 10}px`;
    });
    
    document.getElementById('lineThickness').addEventListener('input', (e) => {
        currentLineWidth = e.target.value;
    });
    
    document.getElementById('lineType').addEventListener('change', (e) => {
        currentLineType = e.target.value;
    });
    
    document.getElementById('lineColor').addEventListener('input', (e) => {
        currentLineColor = e.target.value;
    });
    
    document.getElementById('bgColor').addEventListener('input', (e) => {
        canvasBgColor = e.target.value;
        canvas.style.backgroundColor = canvasBgColor;
    });
    
    document.getElementById('canvasWidth').addEventListener('input', (e) => {
        canvas.width = e.target.value;
    });
    
    document.getElementById('canvasHeight').addEventListener('input', (e) => {
        canvas.height = e.target.value;
    });
    
    document.getElementById('erase').addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
    
    document.getElementById('save').addEventListener('click', () => {
        const dataURL = canvas.toDataURL('image/png');
        chrome.runtime.sendMessage({
            type: 'saveImage',
            noteId: noteId,
            dataURL: dataURL
        });
    });
    
    document.getElementById('closePanel').addEventListener('click', () => {
        controlPanel.style.display = 'none';
        pencilIcon.style.display = 'block';
        canvas.style.pointerEvents = 'none';
    });
    
    function startDrawing(e) {
        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    }
    
    function draw(e) {
        if (!isDrawing) return;
        ctx.lineWidth = currentLineWidth;
        ctx.strokeStyle = currentLineColor;
        ctx.lineCap = 'round';
        ctx.setLineDash(currentLineType === 'dashed' ? [5, 5] : []);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }
    
    function stopDrawing() {
        isDrawing = false;
        ctx.closePath();
    }
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Make the control panel draggable
    controlPanel.addEventListener('mousedown', (e) => {
        let shiftX = e.clientX - controlPanel.getBoundingClientRect().left;
        let shiftY = e.clientY - controlPanel.getBoundingClientRect().top;
        
        function moveAt(pageX, pageY) {
            controlPanel.style.left = pageX - shiftX + 'px';
            controlPanel.style.top = pageY - shiftY + 'px';
        }
        
        function onMouseMove(e) {
            moveAt(e.pageX, e.pageY);
        }
        
        document.addEventListener('mousemove', onMouseMove);
        
        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', onMouseMove);
        }, { once: true });
    });
});
