
function loadProjects() {
  fetch('/api/portfolio')
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('portfolio-list');
      if (!data.length) {
        list.innerHTML = '<p>No projects found.</p>';
        return;
      }
      list.innerHTML = data.map(item => `
        <div class="portfolio-item" data-id="${item._id}">
          <h3>${item.title}</h3>
          <p>${item.description}</p>
          ${item.image ? `<img src="${item.image}" alt="${item.title}" style="max-width:100%;max-height:150px;display:block;margin-bottom:1em;">` : ''}
          ${item.link ? `<a href="${item.link}" target="_blank">View Project</a>` : ''}
          <button class="delete-btn" data-id="${item._id}"><i class="fas fa-trash"></i> Delete</button>
        </div>
      `).join('');
      // Add event listeners for delete buttons
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = this.getAttribute('data-id');
          if (confirm('Are you sure you want to delete this project?')) {
            fetch(`/api/portfolio/${id}`, { method: 'DELETE' })
              .then(res => res.json())
              .then(res => {
                if (res.success) {
                  loadProjects();
                } else {
                  alert('Delete failed: ' + (res.error || 'Unknown error'));
                }
              })
              .catch(() => alert('Network error while deleting.'));
          }
        });
      });
    })
    .catch(() => {
      document.getElementById('portfolio-list').textContent = 'Failed to load portfolio.';
    });
}

// Initial load
loadProjects();

// Handle project form submission
const form = document.getElementById('project-form');
if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const status = document.getElementById('form-status');
    status.textContent = '';
    const formData = new FormData(form);
    fetch('/api/portfolio', {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        status.textContent = 'Project added!';
        form.reset();
        loadProjects();
      } else {
        status.textContent = 'Error: ' + (res.error || 'Could not add project.');
        status.style.color = '#ef4444';
      }
    })
    .catch(() => {
      status.textContent = 'Network error.';
      status.style.color = '#ef4444';
    });
  });
}