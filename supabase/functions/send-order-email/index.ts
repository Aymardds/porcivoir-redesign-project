// supabase/functions/send-order-email/index.ts
// Edge Function: Envoie un email de confirmation de commande via Resend
// Déclenchez cette fonction depuis votre code React après la création d'une commande.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "noreply@porcivoir.com"; // Configurez votre domaine dans Resend

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const getOrderConfirmationEmail = (order: any) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de commande – Porc'Ivoire</title>
</head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg, #009a55 0%, #00c47a 100%);padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:26px;font-weight:700;letter-spacing:-0.5px">Porc'Ivoire</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px">Produit par les meilleures fermes d'ici</p>
    </div>
    <!-- Body -->
    <div style="padding:40px 32px;">
      <h2 style="color:#1a2e1a;margin-top:0;font-size:22px;">✅ Commande confirmée !</h2>
      <p style="color:#555;line-height:1.6;">
        Bonjour <strong>${order.client_name}</strong>,<br>
        Nous avons bien reçu votre commande. Notre équipe la prépare avec soin. Vous serez informé(e) dès son expédition.
      </p>
      <!-- Order Summary Box -->
      <div style="background:#f9f6f2;border-radius:8px;padding:20px;margin:24px 0;">
        <p style="margin:0 0 4px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Numéro de commande</p>
        <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#1a2e1a;font-family:monospace;">#${order.id.split('-')[0].toUpperCase()}</p>
        <p style="margin:0 0 4px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Total</p>
        <p style="margin:0;font-size:20px;font-weight:700;color:#009a55;">${order.total_amount.toLocaleString('fr-FR')} FCFA</p>
      </div>
      <!-- Items -->
      ${order.items && order.items.length > 0 ? `
      <h3 style="color:#1a2e1a;font-size:16px;margin-bottom:12px;">Articles commandés</h3>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f0ebe4;">
            <th style="padding:10px;text-align:left;font-size:12px;color:#888;font-weight:600;border-radius:4px 0 0 4px;">Article</th>
            <th style="padding:10px;text-align:center;font-size:12px;color:#888;font-weight:600;">Qté</th>
            <th style="padding:10px;text-align:right;font-size:12px;color:#888;font-weight:600;border-radius:0 4px 4px 0;">Prix</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map((item: any) => `
          <tr style="border-bottom:1px solid #f0ebe4;">
            <td style="padding:12px 10px;font-size:14px;color:#333;">${item.product_name}</td>
            <td style="padding:12px 10px;text-align:center;font-size:14px;color:#555;">${item.quantity}</td>
            <td style="padding:12px 10px;text-align:right;font-size:14px;color:#333;font-weight:600;">${item.total_price.toLocaleString('fr-FR')} FCFA</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
      ` : ''}
      <!-- Address -->
      <div style="margin-top:24px;padding:16px;background:#fff8f0;border-left:3px solid #ff7700;border-radius:0 8px 8px 0;">
        <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;">Adresse de livraison</p>
        <p style="margin:0;font-size:14px;color:#333;">${order.shipping_address}, ${order.shipping_city}</p>
        <p style="margin:4px 0 0;font-size:14px;color:#333;">📞 ${order.phone_contact}</p>
      </div>
    </div>
    <!-- Footer -->
    <div style="background:#1a2e1a;padding:24px;text-align:center;">
      <p style="color:rgba(255,255,255,0.5);margin:0;font-size:12px;">© ${new Date().getFullYear()} Porc'Ivoire — Abidjan, Côte d'Ivoire</p>
      <p style="color:rgba(255,255,255,0.4);margin:8px 0 0;font-size:11px;">Si vous avez des questions, contactez-nous au +225 07 87 295 734</p>
    </div>
  </div>
</body>
</html>
`;

const getShippedEmail = (order: any) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Votre commande est en route – Porc'Ivoire</title>
</head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg, #ff7700 0%, #ff4500 100%);padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:26px;font-weight:700;">Porc'Ivoire</h1>
    </div>
    <div style="padding:40px 32px;">
      <h2 style="color:#1a2e1a;margin-top:0;">🚚 Votre commande est en route !</h2>
      <p style="color:#555;line-height:1.6;">
        Bonjour <strong>${order.client_name}</strong>,<br>
        Excellente nouvelle ! Votre commande <strong>#${order.id.split('-')[0].toUpperCase()}</strong> a été expédiée et sera bientôt livrée à votre adresse.
      </p>
      <p style="color:#555;line-height:1.6;">Notre livreur prendra contact avec vous au <strong>${order.phone_contact}</strong> avant la livraison.</p>
    </div>
    <div style="background:#1a2e1a;padding:24px;text-align:center;">
      <p style="color:rgba(255,255,255,0.5);margin:0;font-size:12px;">© ${new Date().getFullYear()} Porc'Ivoire — Abidjan, Côte d'Ivoire</p>
    </div>
  </div>
</body>
</html>
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { order, type, client_email } = await req.json();

    if (!order || !client_email || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: order, client_email, type" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let subject: string;
    let html: string;

    switch (type) {
      case "order_confirmed":
        subject = `✅ Commande confirmée – Porc'Ivoire #${order.id.split('-')[0].toUpperCase()}`;
        html = getOrderConfirmationEmail(order);
        break;
      case "order_shipped":
        subject = `🚚 Votre commande est en route – Porc'Ivoire`;
        html = getShippedEmail(order);
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unknown email type: ${type}` }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Porc'Ivoire <${FROM_EMAIL}>`,
        to: [client_email],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend error: ${err}`);
    }

    const data = await res.json();
    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
