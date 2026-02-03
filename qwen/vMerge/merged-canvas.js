// ========================================
// CANVAS MODULE - Visual Interactive Tree
// ========================================

let canvas, ctx;
let canvasContainer;
let draggingNode = null;
let selectedNode = null;
let offsetX = 0, offsetY = 0;
let mouseX = 0, mouseY = 0;
let scale = 1;
let panX = 0, panY = 0;
let isPanning = false;
let lastPanX = 0, lastPanY = 0;

// Node styling
const NODE_WIDTH = 140;
const NODE_HEIGHT = 70;
const NODE_PADDING = 10;

/**
 * Initialize the canvas
 */
function initCanvas() {
    canvas = document.getElementById('tree-canvas');
    ctx = canvas.getContext('2d');
    canvasContainer = document.getElementById('canvas-container');
    
    // Set canvas size
    canvas.width = 3000;
    canvas.height = 2000;
    
    // Event listeners
    canvas.addEventListener('mousedown', canvasMouseDown);
    canvas.addEventListener('mousemove', canvasMouseMove);
    canvas.addEventListener('mouseup', canvasMouseUp);
    canvas.addEventListener('mouseleave', canvasMouseUp);
    canvas.addEventListener('contextmenu', canvasRightClick);
    canvas.addEventListener('wheel', canvasWheel);
    
    drawCanvas();
}

/**
 * Draw the entire canvas
 */
function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    drawGrid();
    
    // Draw connections first (behind nodes)
    drawConnections();
    
    // Draw all nodes
    members.forEach(member => {
        drawNode(member);
    });
    
    // Draw selection highlight
    if (selectedNode) {
        highlightNode(selectedNode);
    }
}

/**
 * Draw grid background
 */
function drawGrid() {
    const gridSize = 50;
    ctx.strokeStyle = '#e5e7eb';
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

/**
 * Draw a single node
 */
function drawNode(member) {
    const x = member.canvasX || 100;
    const y = member.canvasY || 100;
    
    // Node background
    const gradient = ctx.createLinearGradient(x, y, x, y + NODE_HEIGHT);
    if (member.sex === 'M') {
        gradient.addColorStop(0, '#dbeafe');
        gradient.addColorStop(1, '#bfdbfe');
    } else {
        gradient.addColorStop(0, '#fce7f3');
        gradient.addColorStop(1, '#fbcfe8');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, NODE_WIDTH, NODE_HEIGHT);
    
    // Node border
    ctx.strokeStyle = member.sex === 'M' ? '#3b82f6' : '#ec4899';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, NODE_WIDTH, NODE_HEIGHT);
    
    // Name
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    const nameText = truncateText(member.name, NODE_WIDTH - 20);
    ctx.fillText(nameText, x + NODE_PADDING, y + 22);
    
    // Birth/Death
    ctx.font = '11px Arial';
    ctx.fillStyle = '#666';
    const birthYear = member.birth ? member.birth.split('/')[2] : '?';
    const deathYear = member.death ? member.death.split('/')[2] : 'Living';
    ctx.fillText(`${birthYear} - ${deathYear}`, x + NODE_PADDING, y + 40);
    
    // PID
    ctx.font = '10px monospace';
    ctx.fillStyle = '#999';
    ctx.fillText(member.pid, x + NODE_PADDING, y + 58);
    
    // Gender icon
    const icon = member.sex === 'M' ? '♂' : '♀';
    ctx.font = '20px Arial';
    ctx.fillStyle = member.sex === 'M' ? '#3b82f6' : '#ec4899';
    ctx.textAlign = 'right';
    ctx.fillText(icon, x + NODE_WIDTH - 10, y + 25);
}

/**
 * Highlight selected node
 */
function highlightNode(member) {
    const x = member.canvasX || 100;
    const y = member.canvasY || 100;
    
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 4;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(x - 4, y - 4, NODE_WIDTH + 8, NODE_HEIGHT + 8);
    ctx.setLineDash([]);
}

/**
 * Draw connections between family members
 */
function drawConnections() {
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    
    members.forEach(member => {
        // Draw to parents
        member.parentPids.forEach(parentPid => {
            const parent = members.find(m => m.pid === parentPid);
            if (parent) {
                drawConnection(member, parent);
            }
        });
        
        // Draw to spouse
        if (member.spousePid) {
            const spouse = members.find(m => m.pid === member.spousePid);
            if (spouse) {
                drawSpouseConnection(member, spouse);
            }
        }
    });
}

/**
 * Draw connection line between two nodes
 */
function drawConnection(from, to) {
    const fromX = (from.canvasX || 100) + NODE_WIDTH / 2;
    const fromY = (from.canvasY || 100);
    const toX = (to.canvasX || 100) + NODE_WIDTH / 2;
    const toY = (to.canvasY || 100) + NODE_HEIGHT;
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(fromX, fromY - 20);
    ctx.lineTo(toX, fromY - 20);
    ctx.lineTo(toX, toY);
    ctx.stroke();
}

/**
 * Draw spouse connection (dashed line)
 */
function drawSpouseConnection(from, to) {
    const fromX = (from.canvasX || 100) + NODE_WIDTH;
    const fromY = (from.canvasY || 100) + NODE_HEIGHT / 2;
    const toX = (to.canvasX || 100);
    const toY = (to.canvasY || 100) + NODE_HEIGHT / 2;
    
    ctx.strokeStyle = '#f59e0b';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.setLineDash([]);
}

/**
 * Find node at mouse position
 */
function getNodeAtPosition(x, y) {
    for (let i = members.length - 1; i >= 0; i--) {
        const member = members[i];
        const nodeX = member.canvasX || 100;
        const nodeY = member.canvasY || 100;
        
        if (x >= nodeX && x <= nodeX + NODE_WIDTH &&
            y >= nodeY && y <= nodeY + NODE_HEIGHT) {
            return member;
        }
    }
    return null;
}

/**
 * Truncate text to fit within width
 */
function truncateText(text, maxWidth) {
    ctx.font = 'bold 14px Arial';
    if (ctx.measureText(text).width <= maxWidth) {
        return text;
    }
    
    let truncated = text;
    while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
    }
    return truncated + '...';
}

// ========================================
// MOUSE EVENT HANDLERS
// ========================================

function canvasMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    const clickedNode = getNodeAtPosition(mouseX, mouseY);
    
    if (clickedNode) {
        draggingNode = clickedNode;
        selectedNode = clickedNode;
        offsetX = mouseX - (clickedNode.canvasX || 100);
        offsetY = mouseY - (clickedNode.canvasY || 100);
        drawCanvas();
    } else {
        isPanning = true;
        lastPanX = e.clientX;
        lastPanY = e.clientY;
        canvas.style.cursor = 'grabbing';
    }
}

function canvasMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    if (draggingNode) {
        draggingNode.canvasX = mouseX - offsetX;
        draggingNode.canvasY = mouseY - offsetY;
        drawCanvas();
    } else if (isPanning) {
        const dx = e.clientX - lastPanX;
        const dy = e.clientY - lastPanY;
        canvasContainer.scrollLeft -= dx;
        canvasContainer.scrollTop -= dy;
        lastPanX = e.clientX;
        lastPanY = e.clientY;
    } else {
        // Change cursor on hover
        const hoveredNode = getNodeAtPosition(mouseX, mouseY);
        canvas.style.cursor = hoveredNode ? 'pointer' : 'grab';
    }
}

function canvasMouseUp(e) {
    draggingNode = null;
    isPanning = false;
    canvas.style.cursor = 'grab';
}

function canvasRightClick(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    const clickedNode = getNodeAtPosition(mouseX, mouseY);
    if (clickedNode) {
        selectedNode = clickedNode;
        showContextMenu(e.clientX, e.clientY);
        drawCanvas();
    }
}

function canvasWheel(e) {
    e.preventDefault();
    // Optional: Add zoom functionality here
}

// ========================================
// CANVAS UTILITY FUNCTIONS
// ========================================

/**
 * Add a new member to the canvas
 */
function addMemberToCanvas() {
    showTab('register');
    document.getElementById('registerTitle').textContent = '➕ Add New Member';
    const nextPid = `PID${String(Math.max(0, ...members.map(m => parseInt(m.pid.replace('PID', ''), 10))) + 1).padStart(3, '0')}`;
    document.getElementById('regPID').value = nextPid;
}

/**
 * Reset canvas view to center
 */
function resetCanvas() {
    canvasContainer.scrollLeft = canvas.width / 2 - canvasContainer.clientWidth / 2;
    canvasContainer.scrollTop = 0;
}

/**
 * Auto-layout nodes
 */
function autoLayout() {
    const generations = {};
    
    // Group members by generation
    members.forEach(member => {
        const gen = member.tid.split('-').length;
        if (!generations[gen]) generations[gen] = [];
        generations[gen].push(member);
    });
    
    // Layout each generation
    let currentY = 100;
    Object.keys(generations).sort().forEach(gen => {
        const genMembers = generations[gen];
        const totalWidth = genMembers.length * (NODE_WIDTH + 50);
        let currentX = (canvas.width - totalWidth) / 2;
        
        genMembers.forEach(member => {
            member.canvasX = currentX;
            member.canvasY = currentY;
            currentX += NODE_WIDTH + 50;
        });
        
        currentY += 200;
    });
    
    drawCanvas();
    showToast('✨ Auto-layout applied!');
}

/**
 * Show context menu
 */
function showContextMenu(x, y) {
    const menu = document.getElementById('contextMenu');
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.classList.remove('hidden');
    
    // Close menu on click outside
    setTimeout(() => {
        document.addEventListener('click', closeContextMenu);
    }, 100);
}

/**
 * Close context menu
 */
function closeContextMenu() {
    document.getElementById('contextMenu').classList.add('hidden');
    document.removeEventListener('click', closeContextMenu);
}

/**
 * Edit node from canvas
 */
function editNodeFromCanvas() {
    if (selectedNode) {
        selectMember(selectedNode);
        startEdit();
    }
    closeContextMenu();
}

/**
 * Add child from canvas
 */
function addChildFromCanvas() {
    if (selectedNode) {
        selectMember(selectedNode);
        startAddChild();
    }
    closeContextMenu();
}

/**
 * Delete node from canvas
 */
function deleteNodeFromCanvas() {
    if (selectedNode) {
        selectMember(selectedNode);
        deleteMember();
    }
    closeContextMenu();
}

/**
 * Show member on canvas from tree view
 */
function showOnCanvas() {
    if (selectedMember) {
        showTab('canvas-view');
        selectedNode = selectedMember;
        
        // Scroll to node
        const x = selectedMember.canvasX || 100;
        const y = selectedMember.canvasY || 100;
        canvasContainer.scrollLeft = x - canvasContainer.clientWidth / 2;
        canvasContainer.scrollTop = y - canvasContainer.clientHeight / 2;
        
        drawCanvas();
    }
}

// Initialize canvas when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCanvas);
} else {
    initCanvas();
}
