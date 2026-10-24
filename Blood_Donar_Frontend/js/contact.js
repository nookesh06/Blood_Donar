document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const topic = document.getElementById('contactTopic').value;
  const message = document.getElementById('contactMessage').value.trim();
  const body = `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`;
  document.getElementById('contactStatus').textContent = 'No support email is configured. The message is ready to copy, but it has not been sent.';
  const copyText = `Subject: Blood Donor Management - ${topic}\n\n${body}`;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(copyText).then(() => {
      document.getElementById('contactStatus').textContent = 'Message copied. Configure a support email or backend endpoint to send it.';
    }).catch(() => {});
  }
});
