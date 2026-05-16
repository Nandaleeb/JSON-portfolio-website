document.getElementById('contact-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    name: form.name.value,
    email: form.email.value,
    message: form.message.value
  };
  fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(result => {
      document.getElementById('form-status').textContent = result.success ? 'Message sent!' : 'Failed to send.';
      form.reset();
    })
    .catch(() => {
      document.getElementById('form-status').textContent = 'Error sending message.';
    });
});