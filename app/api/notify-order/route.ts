import { NextResponse } from "next/server";

// Supabase apelează acest endpoint automat de fiecare dată când apare o
// comandă nouă (Database Webhook pe tabela "orders", eveniment INSERT).
// De aici trimitem mesajul pe Telegram.

export async function POST(request: Request) {
  // Verificare simplă: doar cereri care conțin secretul nostru sunt acceptate,
  // ca să nu poată oricine să-ți spameze botul dacă găsește acest URL.
  const secret = request.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const order = payload.record;

  if (!order) {
    return NextResponse.json({ error: "Lipsește comanda din payload" }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const detailLink = siteUrl ? `\n\n👉 ${siteUrl}/admin/comenzi/${order.id}` : "";

  const message =
    `🛒 *Comandă nouă* #${order.order_number}\n` +
    `👤 ${order.customer_name}\n` +
    `📞 ${order.customer_phone}\n` +
    `📍 ${order.customer_address}\n` +
    `💰 ${Number(order.total).toFixed(2)} lei` +
    detailLink;

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return NextResponse.json({ error: "Lipsesc variabilele Telegram" }, { status: 500 });
  }

  const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
    }),
  });

  if (!telegramResponse.ok) {
    const errText = await telegramResponse.text();
    return NextResponse.json({ error: "Telegram a refuzat mesajul: " + errText }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
