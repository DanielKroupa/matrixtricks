export function ChatAdminReplyEmailTemplate(input: {
  recipientName: string;
  appUrl?: string | null;
}) {
  const appUrl = input.appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
  const chatUrl = appUrl ? `${appUrl}/` : "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Nová odpověď od admina</title>
    </head>
    <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;padding:24px;">
              <tr>
                <td>
                  <h2 style="margin:0 0 16px 0;color:#111;">Nová zpráva od admina</h2>
                  <p style="margin:0 0 12px 0;color:#444;">Ahoj ${input.recipientName},</p>
                  <p style="margin:0 0 20px 0;color:#444;">v chatu máš novou odpověď od admin týmu.</p>
                  ${chatUrl ? `<a href="${chatUrl}" style="display:inline-block;padding:10px 18px;background:#155e75;color:#fff;text-decoration:none;border-radius:6px;">Otevřít chat</a>` : ""}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `.trim();
}
