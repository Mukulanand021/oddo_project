const issueForm = document.getElementById('issueForm');
const issueList = document.getElementById('issueList');
const darkToggle = document.getElementById('darkModeToggle');
const filterCategory = document.getElementById('filterCategory');
const searchInput = document.getElementById('searchInput');
const successMsg = document.getElementById('successMsg');
const previewContainer = document.getElementById('previewContainer');
const counterNew = document.getElementById('countNew');
const counterProgress = document.getElementById('countProgress');
const counterResolved = document.getElementById('countResolved');
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImg');
const modalClose = document.getElementById('modalClose');

let issues = JSON.parse(localStorage.getItem('civicIssues')) || [];
let isDark = JSON.parse(localStorage.getItem('darkMode')) || false;

// Dark mode init
if (isDark) {
  document.body.classList.add('dark');
  darkToggle.checked = true;
}

// Splash
window.addEventListener('load', () => {
  const splash = document.getElementById('splash');
  setTimeout(() => splash.style.display = 'none', 2000);
});

// Show issues
displayIssues();

// Preview image
document.getElementById('image').addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    previewContainer.innerHTML = `<img src="${url}" alt="Preview" onclick="openModal('${url}')">`;
  } else {
    previewContainer.innerHTML = '';
  }
});

// Form submit
issueForm.addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const location = document.getElementById('location').value;
  const category = document.getElementById('category').value;
  const imageInput = document.getElementById('image');
  let image = '';
  if (imageInput.files[0]) {
    image = URL.createObjectURL(imageInput.files[0]);
  }

  if (title && description && location && category) {
    const issue = {
      id: Date.now(),
      title, description, location, category,
      status: "New",
      date: new Date().toLocaleString(),
      image,
      comments: []
    };
    issues.push(issue);
    localStorage.setItem('civicIssues', JSON.stringify(issues));
    issueForm.reset();
    previewContainer.innerHTML = '';
    showSuccess();
    displayIssues();
  }
});

// Show toast
function showSuccess() {
  successMsg.style.display = 'block';
  setTimeout(() => successMsg.style.display = 'none', 2000);
}

// Delete
function deleteIssue(id) {
  issues = issues.filter(i => i.id !== id);
  localStorage.setItem('civicIssues', JSON.stringify(issues));
  displayIssues();
}

// Toggle status
function toggleStatus(id) {
  const issue = issues.find(i => i.id === id);
  if (issue) {
    issue.status = issue.status === "New" ? "In Progress" :
                   issue.status === "In Progress" ? "Resolved" : "New";
    localStorage.setItem('civicIssues', JSON.stringify(issues));
    displayIssues();
  }
}

// Add comment
function addComment(id, text) {
  if (!text.trim()) return;
  const issue = issues.find(i => i.id === id);
  if (issue) {
    issue.comments.push({ text: text.trim(), date: new Date().toLocaleTimeString() });
    localStorage.setItem('civicIssues', JSON.stringify(issues));
    displayIssues();
  }
}

// Open image modal
function openModal(url) {
  modal.style.display = 'flex';
  modalImg.src = url;
}
modalClose.onclick = () => modal.style.display = 'none';
window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };

// Map
function openMap(location) {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  window.open(url, '_blank');
}

// Display
function displayIssues() {
  issueList.innerHTML = '';
  let filtered = issues;

  if (filterCategory.value) {
    filtered = filtered.filter(i => i.category === filterCategory.value);
  }
  if (searchInput.value.trim()) {
    const q = searchInput.value.trim().toLowerCase();
    filtered = filtered.filter(i =>
      i.title.toLowerCase().includes(q) || i.location.toLowerCase().includes(q)
    );
  }

  // Counters
  counterNew.textContent = issues.filter(i => i.status === 'New').length;
  counterProgress.textContent = issues.filter(i => i.status === 'In Progress').length;
  counterResolved.textContent = issues.filter(i => i.status === 'Resolved').length;

  if (filtered.length === 0) {
    issueList.innerHTML = '<p>No issues found.</p>';
  } else {
    filtered.forEach(issue => {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <span class="badge ${issue.category}">${issue.category}</span>
        <span class="status-badge ${issue.status.replace(/\s/g,'')}" onclick="toggleStatus(${issue.id})">${issue.status}</span>
        <h3>${issue.title}</h3>
        <em>${issue.location}</em>
        <p>${issue.description}</p>
        ${issue.image ? `<img src="${issue.image}" alt="Issue" onclick="openModal('${issue.image}')" style="width:100%;margin-top:5px;border-radius:6px;cursor:pointer;">` : ''}
        <small>Reported on: ${issue.date}</small>
        <button onclick="openMap('${issue.location}')">🗺 View Map</button>
        <button class="delete-btn" onclick="deleteIssue(${issue.id})">Delete</button>
        <div class="comment-box">
          <input type="text" placeholder="Add comment..." onkeypress="if(event.key==='Enter'){addComment(${issue.id}, this.value); this.value=''}">
          <div class="comment-list">
            ${issue.comments.map(c => `<div class="comment-item">${c.text} <small>${c.date}</small></div>`).join('')}
          </div>
        </div>
      `;
      issueList.appendChild(div);
    });
  }
}

// Events
filterCategory.addEventListener('change', displayIssues);
searchInput.addEventListener('input', displayIssues);
darkToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', JSON.stringify(darkToggle.checked));
});

// Fade-in
const fadeEls = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1 });
fadeEls.forEach(el => observer.observe(el));
