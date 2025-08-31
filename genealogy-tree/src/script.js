document.addEventListener('DOMContentLoaded', () => {
    const canvasContainer = document.getElementById('canvas-container');
    const canvas = document.getElementById('tree-canvas');
    const ctx = canvas.getContext('2d');
    const addMemberButton = document.getElementById('add-member');
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close');
    const memberForm = document.getElementById('member-form');
    const coordinatesDisplay = document.getElementById('coordinates');
    const previewCanvas = document.getElementById('preview-canvas');
    const previewCtx = previewCanvas.getContext('2d');
    let memberCount = 0;
    const nodes = [];
    let draggingNode = null;
    let offsetX, offsetY;
    let isPanning = false;
    let startX, startY;
    let mouseX = 0, mouseY = 0;

    // Set the canvas to a static size
    canvas.width = 2000;
    canvas.height = 2000;

    class Node {
        constructor(id, name, birthDate, x, y, siblings = [], parents = [], spouses = []) {
            this.id = id;
            this.name = name;
            this.birthDate = birthDate;
            this.x = x;
            this.y = y;
            this.width = 100;
            this.height = 50;
            this.siblings = siblings;
            this.parents = parents;
            this.spouses = spouses;
        }

        draw(ctx) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = '#000';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = '#000';
            ctx.font = '12px Arial';
            ctx.fillText(this.name, this.x + 10, this.y + 20);
            ctx.fillText(this.birthDate, this.x + 10, this.y + 40);
        }

        isPointInside(x, y) {
            return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
        }
    }

    addMemberButton.addEventListener('click', () => {
        const name = prompt('Enter name:');
        const birthDate = prompt('Enter birth date:');
        if (name && birthDate) {
            const newNode = new Node(`member-${memberCount}`, name, birthDate, canvas.width / 2, canvas.height / 2);
            nodes.push(newNode);
            memberCount++;
            console.log(`Added node: ${newNode.id} at (${newNode.x}, ${newNode.y})`);
            drawTree();
        }
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            modal.style.display = 'none';
        }
    });

    memberForm.addEventListener('input', updatePreview);

    memberForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const birthDate = document.getElementById('birthDate').value;
        const siblings = document.getElementById('siblings').value.split(',').map(id => id.trim()).filter(id => id);
        const parents = document.getElementById('parents').value.split(',').map(id => id.trim()).filter(id => id);
        const spouses = document.getElementById('spouses').value.split(',').map(id => id.trim()).filter(id => id);
        const newNode = new Node(`member-${memberCount}`, name, birthDate, canvas.width / 2, canvas.height / 2, siblings, parents, spouses);
        nodes.push(newNode);
        memberCount++;
        console.log(`Added node: ${newNode.id} at (${newNode.x}, ${newNode.y})`);
        drawTree();
        modal.style.display = 'none';
        memberForm.reset();
    });

    canvas.addEventListener('mousedown', (e) => {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
        console.log(`Mouse down at (${mouseX}, ${mouseY})`);
        for (const node of nodes) {
            if (node.isPointInside(mouseX, mouseY)) {
                draggingNode = node;
                offsetX = mouseX - node.x;
                offsetY = mouseY - node.y;
                console.log(`Dragging started for node: ${node.id}`);
                return;
            }
        }
        // If no node is clicked, start panning
        isPanning = true;
        startX = e.clientX;
        startY = e.clientY;
        canvasContainer.style.cursor = 'grabbing';
        console.log('Panning started');
    });

    canvas.addEventListener('mousemove', (e) => {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
        coordinatesDisplay.textContent = `X: ${mouseX}, Y: ${mouseY}`;
        if (draggingNode) {
            draggingNode.x = mouseX - offsetX;
            draggingNode.y = mouseY - offsetY;
            console.log(`Dragging node: ${draggingNode.id} to (${draggingNode.x}, ${draggingNode.y})`);
            drawTree();
        } else if (isPanning) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            canvasContainer.scrollLeft -= dx;
            canvasContainer.scrollTop -= dy;
            startX = e.clientX;
            startY = e.clientY;
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (draggingNode) {
            console.log(`Dragging ended for node: ${draggingNode.id} at (${draggingNode.x}, ${draggingNode.y})`);
            draggingNode = null;
        }
        if (isPanning) {
            isPanning = false;
            canvasContainer.style.cursor = 'grab';
            console.log('Panning ended');
        }
    });

    canvas.addEventListener('mouseleave', () => {
        if (draggingNode) {
            console.log(`Dragging ended for node: ${draggingNode.id} at (${draggingNode.x}, ${draggingNode.y})`);
            draggingNode = null;
        }
        if (isPanning) {
            isPanning = false;
            canvasContainer.style.cursor = 'grab';
            console.log('Panning ended');
        }
    });

    function drawTree() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
        for (const node of nodes) {
            node.draw(ctx);
        }
        drawConnections();
    }

    function drawGrid() {
        const gridSize = 50;
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 0.5;
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    function drawConnections() {
        ctx.strokeStyle = '#ccc';
        for (const node of nodes) {
            for (const target of nodes) {
                if (node !== target) {
                    ctx.beginPath();
                    ctx.moveTo(node.x + node.width / 2, node.y + node.height / 2);
                    ctx.lineTo(target.x + target.width / 2, target.y + target.height / 2);
                    ctx.stroke();
                }
            }
        }
    }

    function drawLine(node1, node2) {
        ctx.beginPath();
        ctx.moveTo(node1.x + node1.width / 2, node1.y + node1.height / 2);
        ctx.lineTo(node2.x + node2.width / 2, node2.y + node2.height / 2);
        ctx.stroke();
    }

    function updatePreview() {
        const name = document.getElementById('name').value || 'John Doe';
        const birthDate = document.getElementById('birthDate').value || '1990-01-01';
        const previewNode = new Node('preview', name, birthDate, 0, 0);
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        previewNode.draw(previewCtx);
    }

    drawTree();
});