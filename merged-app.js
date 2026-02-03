// ========================================
// MAIN APP - Core Functionality
// ========================================

let selectedMember = null;
let editingMember = null;
let addMode = null;
let expanded = {};

// ========================================
// TAB NAVIGATION
// ========================================

function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.remove('hidden');
    
    // Add active class to button
    const btnMap = {
        'canvas-view': 'tab-canvas',
        'family-tree': 'tab-family',
        'register': 'tab-register',
        'statistics': 'tab-stats',
        'timeline': 'tab-timeline'
    };
    
    if (btnMap[tabName]) {
        document.getElementById(btnMap[tabName]).classList.add('active');
    }
    
    // Run tab-specific functions
    if (tabName === 'family-tree') renderTree();
    if (tabName === 'statistics') updateStats();
    if (tabName === 'timeline') renderTimeline();
    if (tabName === 'canvas-view' && typeof drawCanvas === 'function') drawCanvas();
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function getMemberByPid(pid) {
    return members.find(m => m.pid === pid);
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ========================================
// TRADITIONAL TREE RENDERING
// ========================================

function renderTree() {
    const treeEl = document.getElementById('familyTree');
    treeEl.innerHTML = '';

    const patekai = getMemberByPid('PID001');
    if (patekai) {
        const patekaiEl = document.createElement('div');
        patekaiEl.className = 'parent-node';
        patekaiEl.textContent = `♂ ${patekai.name}`;
        patekaiEl.onclick = () => selectMember(patekai);
        treeEl.appendChild(patekaiEl);
    }

    const wives = members.filter(m => m.spousePid === 'PID001').sort((a, b) => a.pid.localeCompare(b.pid));
    wives.forEach(wife => {
        const wifeKey = `wife-${wife.pid}`;
        const isExpanded = expanded[wifeKey] || false;
        const children = members.filter(m => m.parentPids.includes(wife.pid));

        const wifeDiv = document.createElement('div');
        wifeDiv.className = 'ml-8 mt-3';

        const header = document.createElement('div');
        header.className = 'flex items-center';
        header.innerHTML = `
            <button onclick="toggleExpand('${wifeKey}')" class="expand-btn">${isExpanded ? '−' : '+'}</button>
            <span class="text-indigo-600 font-bold">──▶</span>
        `;
        
        const wifeSpan = document.createElement('div');
        wifeSpan.className = 'wife-node';
        let displayName = wife.name;
        if (wife.spouseStatus === 'Unknown') {
            displayName = `${wife.name} - Unknown`;
            wifeSpan.className += ' spouse-unknown';
        }
        wifeSpan.textContent = `♀ ${displayName}`;
        wifeSpan.onclick = () => selectMember(wife);
        header.appendChild(wifeSpan);
        wifeDiv.appendChild(header);

        if (isExpanded && children.length > 0) {
            const childrenDiv = document.createElement('div');
            childrenDiv.className = 'border-l-2 border-gray-300 ml-6 pl-6 mt-2 space-y-1';
            children.forEach(child => {
                const childEl = document.createElement('div');
                childEl.className = 'flex items-center mt-1';
                const childSpan = document.createElement('div');
                childSpan.className = 'child-node';
                let childDisplayName = `${child.sex === 'M' ? '♂ ' : '♀ '} ${child.name}`;
                if (child.spouseStatus === 'Unknown') {
                    childDisplayName += ' - Unknown';
                    childSpan.className += ' spouse-unknown';
                }
                childSpan.textContent = childDisplayName;
                childSpan.onclick = () => selectMember(child);
                childEl.appendChild(childSpan);
                childrenDiv.appendChild(childEl);
                renderDescendants(child, childrenDiv, 1);
            });
            wifeDiv.appendChild(childrenDiv);
        }

        treeEl.appendChild(wifeDiv);
    });
}

function toggleExpand(key) {
    expanded[key] = !expanded[key];
    renderTree();
}

function renderDescendants(parent, container, depth) {
    if (depth >= 3) return;
    
    const children = members.filter(m => m.parentPids.includes(parent.pid));
    if (children.length === 0) return;

    const parentKey = `child-${parent.pid}`;
    const isExpanded = expanded[parentKey] || false;

    const toggleDiv = document.createElement('div');
    toggleDiv.className = 'ml-6 mt-1';
    toggleDiv.innerHTML = `<button onclick="toggleExpand('${parentKey}')" class="expand-btn">${isExpanded ? '−' : '+'}</button>`;
    container.appendChild(toggleDiv);

    if (isExpanded) {
        const childrenDiv = document.createElement('div');
        childrenDiv.className = 'ml-5 mt-1 space-y-1';
        children.forEach(child => {
            const childEl = document.createElement('div');
            childEl.className = 'flex items-center mt-1';
            const childSpan = document.createElement('div');
            childSpan.className = 'member-node';
            let childDisplayName = `${child.sex === 'M' ? '♂ ' : '♀ '} ${child.name}`;
            if (child.spouseStatus === 'Unknown') {
                childDisplayName += ' - Unknown';
                childSpan.className += ' spouse-unknown';
            }
            childSpan.textContent = childDisplayName;
            childSpan.onclick = () => selectMember(child);
            childEl.appendChild(childSpan);
            childrenDiv.appendChild(childEl);
            renderDescendants(child, childrenDiv, depth + 1);
        });
        toggleDiv.appendChild(childrenDiv);
    }
}

// ========================================
// MEMBER SELECTION
// ========================================

function selectMember(member) {
    if (!member) return;
    selectedMember = member;
    document.getElementById('selectedMember').classList.remove('hidden');

    document.getElementById('memberName').textContent = member.name;
    document.getElementById('memberPID').textContent = member.pid;
    document.getElementById('memberTID').textContent = member.tid;
    document.getElementById('memberBirth').textContent = member.birth;
    document.getElementById('memberDeath').textContent = member.death || 'Alive';

    const father = member.parentPids[0] ? getMemberByPid(member.parentPids[0]) : null;
    document.getElementById('memberFather').textContent = father ? father.name : 'Unknown';

    const mother = member.parentPids[1] ? getMemberByPid(member.parentPids[1]) : null;
    document.getElementById('memberMother').textContent = mother ? mother.name : 'Unknown';

    let spouseText = 'None';
    if (member.spouseStatus === 'Yes' && member.spousePid) {
        const spouse = getMemberByPid(member.spousePid);
        spouseText = spouse ? spouse.name : 'Linked';
    } else if (member.spouseStatus === 'Unknown') {
        spouseText = 'Unknown';
    }
    document.getElementById('memberSpouse').textContent = spouseText;

    const photoImg = document.getElementById('memberPhoto');
    if (member.photo) {
        photoImg.src = member.photo;
        photoImg.style.display = 'block';
    } else {
        photoImg.style.display = 'none';
    }
}

// ========================================
// SEARCH
// ========================================

function searchMembers() {
    const query = document.getElementById('searchQuery').value.toLowerCase();
    const resultsEl = document.getElementById('searchResults');
    resultsEl.classList.remove('hidden');
    resultsEl.innerHTML = '';

    if (!query) {
        resultsEl.classList.add('hidden');
        return;
    }

    const results = members.filter(m => 
        m.pid.toLowerCase().includes(query) ||
        m.name.toLowerCase().includes(query) ||
        m.tid.toLowerCase().includes(query)
    );

    if (results.length === 0) {
        resultsEl.innerHTML = '<div class="text-red-500">🚫 Member not found</div>';
        return;
    }

    results.forEach(m => {
        const div = document.createElement('div');
        div.className = 'search-result';
        div.innerHTML = `<strong class="text-indigo-700">${m.name}</strong> | ${m.pid} | ${m.tid}`;
        div.onclick = () => selectMember(m);
        resultsEl.appendChild(div);
    });
}

// ========================================
// ADD/EDIT MEMBERS
// ========================================

function startAddChild() {
    if (!selectedMember) {
        alert("Please select a member first.");
        return;
    }

    addMode = 'child';
    showTab('register');
    document.getElementById('registerTitle').textContent = `➕ Add Child to ${selectedMember.name}`;

    const form = document.getElementById('regForm');
    const nextPid = `PID${String(Math.max(...members.map(m => parseInt(m.pid.replace('PID', ''), 10))) + 1).padStart(3, '0')}`;
    const children = members.filter(m => m.parentPids.includes(selectedMember.pid));
    const nextNum = String(children.length + 1).padStart(2, '0');
    const nextTid = `${selectedMember.tid}-GGSD${nextNum}`;

    document.getElementById('regPID').value = nextPid;
    form.tid.value = nextTid;
    form.fatherPid.value = selectedMember.pid;
    form.motherPid.value = '';
    form.firstName.value = '';
    form.lastName.value = '';
    form.sex.value = '';
    form.birth.value = '';
    form.death.value = '';
    form.spouseStatus.value = 'No';
}

function startEdit() {
    if (!selectedMember) return;

    editingMember = selectedMember;
    showTab('register');
    document.getElementById('registerTitle').textContent = `✏️ Edit Member: ${selectedMember.name}`;

    const form = document.getElementById('regForm');
    document.getElementById('regPID').value = selectedMember.pid;
    form.tid.value = selectedMember.tid;
    form.firstName.value = selectedMember.firstName;
    form.lastName.value = selectedMember.lastName || '';
    form.sex.value = selectedMember.sex;
    form.birth.value = selectedMember.birth;
    form.death.value = selectedMember.death || '';
    form.fatherPid.value = selectedMember.parentPids[0] || '';
    form.motherPid.value = selectedMember.parentPids[1] || '';
    form.spouseStatus.value = selectedMember.spouseStatus || 'No';
}

function cancelAdd() {
    addMode = null;
    editingMember = null;
    showTab('family-tree');
}

function submitRegForm(e) {
    e.preventDefault();
    
    const form = document.getElementById('regForm');
    const firstName = form.firstName.value.trim();
    if (!firstName) return alert("First name is required.");

    const isEditing = !!editingMember;
    const pid = isEditing ? editingMember.pid : document.getElementById('regPID').value;

    const member = {
        id: isEditing ? editingMember.id : Math.max(0, ...members.map(m => m.id)) + 1,
        pid,
        tid: form.tid.value.trim(),
        firstName,
        lastName: form.lastName.value,
        name: `${firstName}${form.lastName.value ? ' ' + form.lastName.value : ''}`.trim() || 'Unknown',
        sex: form.sex.value,
        birth: form.birth.value,
        death: form.death.value,
        country: 'Philippines',
        region: '',
        city: '',
        address: '',
        phone: '',
        email: '',
        parentPids: [form.fatherPid.value, form.motherPid.value].filter(Boolean),
        spousePid: form.spousePid.value || '',
        spouseStatus: form.spouseStatus.value,
        marriageDate: '',
        divorceDate: '',
        photo: '',
        canvasX: isEditing ? editingMember.canvasX : 1000,
        canvasY: isEditing ? editingMember.canvasY : 500
    };

    if (isEditing) {
        const index = members.findIndex(m => m.pid === pid);
        members[index] = member;
        showToast(`✅ ${member.name} updated!`);
    } else {
        members.push(member);
        showToast(`✅ ${member.name} added!`);
    }

    cancelAdd();
    renderTree();
    if (typeof drawCanvas === 'function') drawCanvas();
}

function deleteMember() {
    if (!selectedMember) return;
    if (confirm(`Delete ${selectedMember.name}? This cannot be undone.`)) {
        members = members.filter(m => m.pid !== selectedMember.pid);
        document.getElementById('selectedMember').classList.add('hidden');
        selectedMember = null;
        selectedNode = null;
        renderTree();
        if (typeof drawCanvas === 'function') drawCanvas();
        showToast('🗑️ Member deleted');
    }
}

// ========================================
// STATISTICS
// ========================================

function updateStats() {
    document.getElementById('totalMembers').textContent = members.length;
    document.getElementById('totalWives').textContent = members.filter(m => m.spousePid === 'PID001').length;
    document.getElementById('totalChildren').textContent = members.filter(m => m.parentPids.length > 0).length;
    
    // Calculate generations
    const maxDepth = Math.max(...members.map(m => m.tid.split('-').length));
    document.getElementById('totalGenerations').textContent = maxDepth;
}

// ========================================
// TIMELINE
// ========================================

function renderTimeline() {
    const container = document.getElementById('timelineContent');
    container.innerHTML = '';
    
    [...members]
        .sort((a, b) => new Date(a.birth) - new Date(b.birth))
        .forEach(m => {
            if (m.birth) {
                const div = document.createElement('div');
                div.className = 'bg-white p-3 rounded border';
                div.textContent = `${m.name} — Born on ${m.birth}`;
                container.appendChild(div);
            }
            if (m.death) {
                const div = document.createElement('div');
                div.className = 'bg-white p-3 rounded border';
                div.textContent = `${m.name} — Died on ${m.death}`;
                container.appendChild(div);
            }
        });
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    showTab('canvas-view');
});
