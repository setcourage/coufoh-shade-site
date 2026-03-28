const form = document.getElementById('leadForm');
const msg = document.getElementById('formMsg');
document.getElementById('year').textContent = new Date().getFullYear();

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = '';
  msg.style.color = '#ffd5bf';

  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());

  const missing = Object.entries(data)
    .filter(([, v]) => !String(v || '').trim())
    .map(([k]) => k);

  if (missing.length) {
    msg.textContent = `Please complete all required fields (${missing.join(', ')}).`;
    return;
  }

  if (!validEmail(data.email)) {
    msg.textContent = 'Please enter a valid email address.';
    return;
  }

  try {
    msg.style.color = '#fff';
    msg.textContent = 'Sending your enquiry...';

    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: window.location.hostname,
        formData: data,
      }),
    });

    const result = await res.json().catch(() => ({}));

    if (!res.ok || !result.ok) {
      throw new Error(result?.error || 'Submission failed');
    }

    msg.style.color = '#e9f7ef';
    msg.textContent = 'Thank you. Your enquiry has been sent successfully.';
    form.reset();
  } catch (error) {
    msg.style.color = '#ffd5bf';
    msg.textContent = 'We could not send your enquiry right now. Please try again shortly.';
    console.error(error);
  }
});
