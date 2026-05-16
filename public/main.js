
// Chatbot logic
function appendChat(role, text) {
  const log = document.getElementById('chat-log');
  const div = document.createElement('div');
  div.textContent = `${role}: ${text}`;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function sendChat() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (!message) return;
  appendChat('You', message);
  input.value = '';
  fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  })
    .then(res => res.json())
    .then(data => appendChat('AI', data.reply))
    .catch(() => appendChat('AI', 'Sorry, there was an error.'));
}

document.getElementById('chat-input')?.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') sendChat();
});