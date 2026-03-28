export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return res.status(500).json({ ok: false, error: 'Telegram env vars missing' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const formData = payload?.formData || {};
    const source = payload?.source || 'coufoh-site';

    const esc = (v) => String(v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    let msg = `🏗️ <b>COUFOH New Enquiry</b>\n`;
    msg += `<b>Source:</b> ${esc(source)}\n`;
    msg += `<b>Time:</b> ${esc(new Date().toUTCString())}\n\n`;

    for (const [key, value] of Object.entries(formData)) {
      if (value === undefined || value === null || value === '') continue;
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
      msg += `<b>${esc(label)}:</b> ${esc(Array.isArray(value) ? value.join(', ') : value)}\n`;
    }

    const tgResp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: msg,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    if (!tgResp.ok) {
      const text = await tgResp.text();
      return res.status(502).json({ ok: false, error: `Telegram send failed: ${text}` });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Unknown error' });
  }
}
