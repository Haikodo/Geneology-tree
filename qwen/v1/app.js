// ========================================
// PATEKAI GENERATIONS - MAIN APPLICATION
// PTarsila 1.8 - Spouse Intelligence
// ========================================

// ========================================
// GLOBAL VARIABLES
// ========================================
let selectedMember = null;
let editingMember = null;
let addMode = null;
let regPhoto = null;
let expanded = {}; // Tracks which tree nodes are expanded


// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get a member by their PID
 */
function getMemberByPid(pid) {
  return members.find(m => m.pid === pid);
}

/**
 * Get a member by their name
 */
function getMemberByName(name) {
  return members.find(m => m.name.toLowerCase().includes(name.toLowerCase()));
}

/**
 * Show a success toast notification
 */
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}


// ========================================
// TAB NAVIGATION
// ========================================

/**
 * Switch between tabs (Family Tree, Register, Statistics, Timeline)
 */
function showTab(tab) {
  // Hide all tabs
  document.getElementById('family-tree').style.display = 'none';
  document.getElementById('register').style.display = 'none';
  document.getElementById('statistics').style.display = 'none';
  document.getElementById('timeline').style.display = 'none';
  
  // Show selected tab
  document.getElementById(tab).style.display = 'block';
  
  // Run tab-specific functions
  if (tab === 'family-tree') renderTree();
  if (tab === 'statistics') updateStats();
  if (tab === 'timeline') renderTimeline();
}


// ========================================
// FAMILY TREE RENDERING
// ========================================

/**
 * Main function to render the family tree
 */
function renderTree() {
  const treeEl = document.getElementById('familyTree');
  treeEl.innerHTML = '';

  // Render Patekai (the root ancestor)
  const patekai = getMemberByPid('PID001');
  if (patekai) {
    const patekaiEl = document.createElement('div');
    patekaiEl.className = 'parent-node';
    patekaiEl.textContent = `♂ ${patekai.name}`;
    patekaiEl.onclick = () => selectMember(patekai);
    treeEl.appendChild(patekaiEl);
  }

  // Render all wives and their children
  const wives = members.filter(m => m.spousePid === 'PID001').sort((a, b) => a.pid.localeCompare(b.pid));
  wives.forEach(wife => {
    const wifeKey = `wife-${wife.pid}`;
    const isExpanded = expanded[wifeKey] || false;
    const children = members.filter(m => m.parentPids.includes(wife.pid));

    const wifeDiv = document.createElement('div');
    wifeDiv.className = 'ml-8 mt-3';

    // Wife header with expand button
    const header = document.createElement('div');
    header.className = 'flex items-center';
    header.innerHTML = `
      <button onclick="toggleExpand('${wifeKey}')" class="expand-btn">${isExpanded ? '−' : '+'}</button>
      <span class="text-indigo-600 font-bold">──▶</span>
    `;
    
    // Wife name
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

    // Children (if expanded)
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
        
        // Recursively render descendants
        renderDescendants(child, childrenDiv, 1);
      });
      wifeDiv.appendChild(childrenDiv);
    }

    treeEl.appendChild(wifeDiv);
  });
}

/**
 * Toggle expand/collapse state for a tree node
 */
function toggleExpand(key) {
  expanded[key] = !expanded[key];
  renderTree();
}

/**
 * Recursively render descendants of a member
 */
function renderDescendants(parent, container, depth) {
  if (depth >= 3) return; // Limit depth to 3 levels
  
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
      
      // Continue recursively
      renderDescendants(child, childrenDiv, depth + 1);
    });
    toggleDiv.appendChild(childrenDiv);
  }
}


// ========================================
// MEMBER SELECTION & DETAILS
// ========================================

/**
 * Select a member and display their details
 */
function selectMember(member) {
  if (!member) return;
  selectedMember = member;
  document.getElementById('selectedMember').classList.remove('hidden');

  // Update member details
  document.getElementById('memberName').textContent = member.name;
  document.getElementById('memberPID').textContent = member.pid;
  document.getElementById('memberTID').textContent = member.tid;
  document.getElementById('memberBirth').textContent = member.birth;
  document.getElementById('memberDeath').textContent = member.death || 'Alive';

  // Display parents
  const father = member.parentPids[0] ? getMemberByPid(member.parentPids[0]) : null;
  document.getElementById('memberFather').textContent = father ? father.name : 'Unknown';

  const mother = member.parentPids[1] ? getMemberByPid(member.parentPids[1]) : null;
  document.getElementById('memberMother').textContent = mother ? mother.name : 'Unknown';

  // Display spouse
  let spouseText = 'None';
  if (member.spouseStatus === 'Yes' && member.spousePid) {
    const spouse = getMemberByPid(member.spousePid);
    spouseText = spouse ? spouse.name : 'Linked';
  } else if (member.spouseStatus === 'Unknown') {
    spouseText = 'Unknown';
  }
  document.getElementById('memberSpouse').textContent = spouseText;

  // Display photo
  const photoImg = document.getElementById('memberPhoto');
  if (member.photo) {
    photoImg.src = member.photo;
    photoImg.style.display = 'block';
  } else {
    photoImg.style.display = 'none';
  }
}


// ========================================
// SEARCH FUNCTIONALITY
// ========================================

/**
 * Search for members by PID, name, or TID
 */
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
// ADD/EDIT MEMBER FUNCTIONALITY
// ========================================

/**
 * Start adding a child to the selected member
 */
function startAddChild() {
  if (!selectedMember) {
    alert("Please select a member first.");
    return;
  }

  addMode = 'child';
  showTab('register');
  document.getElementById('registerTitle').textContent = `➕ Add Child to ${selectedMember.name}`;

  const form = document.getElementById('regForm');
  
  // Generate next PID and TID
  const nextPid = `PID${String(Math.max(...members.map(m => parseInt(m.pid.replace('PID', ''), 10))) + 1).padStart(3, '0')}`;
  const children = members.filter(m => m.parentPids.includes(selectedMember.pid));
  const nextNum = String(children.length + 1).padStart(2, '0');
  const nextTid = `${selectedMember.tid}-GGSD${nextNum}`;

  // Pre-fill form
  document.getElementById('regPID').value = nextPid;
  form.tid.value = nextTid;
  form.fatherPid.value = selectedMember.pid;
  form.motherPid.value = '';
  form.firstName.value = '';
  form.lastName.value = '';
  form.sex.value = '';
  form.birth.value = '';
  form.death.value = '';
  form.country.value = 'Philippines';
  form.region.value = '';
  form.city.value = '';
  form.address.value = '';
  form.phone.value = '';
  form.email.value = '';
  form.spousePid.value = '';
  form.marriageDate.value = '';
  form.divorceDate.value = '';
  document.getElementById('photoPreview').style.display = 'none';
  regPhoto = null;
  form.spouseStatus.value = 'No';
  updateSpouseFields();
}

/**
 * Start editing the selected member
 */
function startEdit() {
  if (!selectedMember) return;

  editingMember = selectedMember;
  showTab('register');
  document.getElementById('registerTitle').textContent = `✏️ Edit Member: ${selectedMember.name}`;

  const form = document.getElementById('regForm');
  
  // Fill form with member data
  document.getElementById('regPID').value = selectedMember.pid;
  form.tid.value = selectedMember.tid;
  form.firstName.value = selectedMember.firstName;
  form.lastName.value = selectedMember.lastName || '';
  form.sex.value = selectedMember.sex;
  form.birth.value = selectedMember.birth;
  form.death.value = selectedMember.death || '';
  form.country.value = selectedMember.country || 'Philippines';
  form.region.value = selectedMember.region || '';
  form.city.value = selectedMember.city || '';
  form.address.value = selectedMember.address || '';
  form.phone.value = selectedMember.phone || '';
  form.email.value = selectedMember.email || '';
  form.fatherPid.value = selectedMember.parentPids[0] || '';
  form.motherPid.value = selectedMember.parentPids[1] || '';
  form.marriageDate.value = selectedMember.marriageDate || '';
  form.divorceDate.value = selectedMember.divorceDate || '';

  const status = selectedMember.spouseStatus || 'No';
  form.spouseStatus.value = status;
  form.spousePid.value = selectedMember.spousePid || '';

  if (selectedMember.photo) {
    document.getElementById('photoPreview').src = selectedMember.photo;
    document.getElementById('photoPreview').style.display = 'block';
    regPhoto = selectedMember.photo;
  } else {
    document.getElementById('photoPreview').style.display = 'none';
    regPhoto = null;
  }

  updateSpouseFields();
}

/**
 * Cancel add/edit and return to family tree
 */
function cancelAdd() {
  addMode = null;
  editingMember = null;
  showTab('family-tree');
}

/**
 * Delete the selected member
 */
function deleteMember() {
  if (!selectedMember) return;
  if (confirm(`Delete ${selectedMember.name}? This cannot be undone.`)) {
    members = members.filter(m => m.pid !== selectedMember.pid);
    document.getElementById('selectedMember').classList.add('hidden');
    selectedMember = null;
    renderTree();
  }
}


// ========================================
// SPOUSE MANAGEMENT
// ========================================

/**
 * Update spouse field visibility based on spouse status
 */
function updateSpouseFields() {
  const status = document.getElementById('spouseStatus').value;
  const searchGroup = document.getElementById('spouseSearchGroup');
  const newSpouseGroup = document.getElementById('newSpouseGroup');

  if (status === 'Yes') {
    searchGroup.classList.remove('hidden');
    newSpouseGroup.classList.add('hidden');
  } else if (status === 'Unknown') {
    searchGroup.classList.add('hidden');
    newSpouseGroup.classList.add('hidden');
  } else {
    searchGroup.classList.add('hidden');
    newSpouseGroup.classList.add('hidden');
  }
}

/**
 * Search for existing spouse or create new one
 */
function searchSpouse() {
  const query = document.getElementById('spouseSearch').value.toLowerCase();
  const resultsEl = document.getElementById('spouseResults');
  resultsEl.classList.remove('hidden');
  resultsEl.innerHTML = '';

  if (!query) {
    resultsEl.classList.add('hidden');
    return;
  }

  const results = members.filter(m => 
    m.pid.toLowerCase().includes(query) ||
    m.name.toLowerCase().includes(query)
  );

  if (results.length === 0) {
    const createNew = document.createElement('div');
    createNew.className = 'p-2 border-b cursor-pointer hover:bg-green-50';
    createNew.innerHTML = `➕ <strong>Add new spouse: ${query}</strong>`;
    createNew.onclick = () => {
      document.getElementById('newSpouseFirstName').value = query;
      document.getElementById('spouseSearchGroup').classList.add('hidden');
      document.getElementById('newSpouseGroup').classList.remove('hidden');
    };
    resultsEl.appendChild(createNew);
    return;
  }

  results.forEach(m => {
    const div = document.createElement('div');
    div.className = 'p-2 border-b cursor-pointer hover:bg-indigo-50';
    div.innerHTML = `<strong>${m.name}</strong> (${m.pid})`;
    div.onclick = () => {
      document.getElementById('spousePid').value = m.pid;
      document.getElementById('spouseSearch').value = m.name;
      resultsEl.classList.add('hidden');
    };
    resultsEl.appendChild(div);
  });
}


// ========================================
// FORM HANDLING
// ========================================

/**
 * Handle photo upload
 */
function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      regPhoto = e.target.result;
      document.getElementById('photoPreview').src = e.target.result;
      document.getElementById('photoPreview').style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
}

/**
 * Submit registration form (add or edit member)
 */
function submitRegForm(e) {
  e.preventDefault();
  if (!selectedMember && !editingMember) {
    alert("No member selected.");
    return;
  }

  const form = document.getElementById('regForm');
  const firstName = form.firstName.value.trim();
  if (!firstName) return alert("First name is required.");

  const isEditing = !!editingMember;
  const pid = isEditing ? editingMember.pid : document.getElementById('regPID').value;

  // Handle new spouse creation
  let spousePid = form.spousePid.value;
  const status = form.spouseStatus.value;
  if (status === 'Yes' && !spousePid) {
    const newFirst = document.getElementById('newSpouseFirstName').value.trim();
    if (newFirst) {
      const newId = Math.max(0, ...members.map(m => m.id)) + 1;
      const newSpousePid = `PID${String(newId).padStart(3, '0')}`;
      const newSpouse = {
        id: newId,
        pid: newSpousePid,
        tid: 'TEMP-TID',
        firstName: newFirst,
        lastName: document.getElementById('newSpouseLastName').value || '',
        name: `${newFirst} ${document.getElementById('newSpouseLastName').value || ''}`.trim(),
        sex: form.sex.value === 'M' ? 'F' : 'M',
        birth: '',
        death: '',
        country: 'Philippines',
        parentPids: [],
        spousePid: pid,
        spouseStatus: 'Yes',
        photo: null
      };
      members.push(newSpouse);
      spousePid = newSpousePid;
    }
  }

  // Create member object
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
    country: form.country.value,
    region: form.region.value,
    city: form.city.value || document.getElementById('cityInputField').value,
    address: form.address.value,
    phone: (form.countryCode.value || '') + (form.phone.value || ''),
    email: form.email.value,
    parentPids: [form.fatherPid.value, form.motherPid.value].filter(Boolean),
    spousePid: spousePid,
    spouseStatus: status,
    marriageDate: form.marriageDate.value,
    divorceDate: form.divorceDate.value,
    photo: regPhoto
  };

  // Update or add member
  if (isEditing) {
    const index = members.findIndex(m => m.pid === pid);
    members[index] = member;
    showToast(`✅ ${member.name} updated successfully!`);
  } else {
    members.push(member);
    showToast(`✅ ${member.name} added successfully!`);
  }

  cancelAdd();
  renderTree();
}


// ========================================
// LOCATION MANAGEMENT
// ========================================

/**
 * Update form fields based on country selection
 */
function updateCountry(select) {
  const regionGroup = document.getElementById('regionGroup');
  const cityGroup = document.getElementById('cityGroup');
  const cityInput = document.getElementById('cityInput');
  
  if (select.value === 'Philippines') {
    regionGroup.classList.remove('hidden');
    cityGroup.classList.remove('hidden');
    cityInput.classList.add('hidden');
  } else {
    regionGroup.classList.add('hidden');
    cityGroup.classList.add('hidden');
    cityInput.classList.remove('hidden');
  }
}

/**
 * Update city dropdown based on region selection
 */
function updateCities() {
  const region = document.getElementById('region').value;
  const citySelect = document.getElementById('city');
  citySelect.innerHTML = '<option value="">Select City</option>';
  
  if (region && philippineCities[region]) {
    philippineCities[region].forEach(city => {
      const opt = document.createElement('option');
      opt.value = city;
      opt.textContent = city;
      citySelect.appendChild(opt);
    });
  }
}


// ========================================
// STATISTICS & TIMELINE
// ========================================

/**
 * Update statistics display
 */
function updateStats() {
  document.getElementById('totalMembers').textContent = members.length;
  document.getElementById('totalWives').textContent = members.filter(m => m.spousePid === 'PID001').length;
  document.getElementById('totalChildren').textContent = members.filter(m => m.parentPids.length > 0).length;
}

/**
 * Render timeline of births and deaths
 */
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

// Initialize the app when page loads
showTab('family-tree');
