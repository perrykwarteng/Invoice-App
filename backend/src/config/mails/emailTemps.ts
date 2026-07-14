export const otpEmail = (otp: string, name: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<body style="margin:0;padding:40px 20px;background:#f5f7f8;font-family:Arial,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">

        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;">

          <tr>
            <td style="padding:32px 40px;border-bottom:1px solid #e5e7eb;">
              <h2 style="margin:0;color:#003932;font-size:26px;font-weight:700;">
                SwiftInvoice
              </h2>
            </td>
          </tr>

          <tr>
            <td style="padding:40px;">

              <h3 style="margin:0 0 20px;color:#111827;font-size:22px;font-weight:600;">
                Verify your email
              </h3>

              <p style="margin:0 0 18px;color:#4b5563;font-size:16px;line-height:1.7;">
                Hi <strong>${name}</strong>,
              </p>

              <p style="margin:0 0 28px;color:#4b5563;font-size:16px;line-height:1.7;">
                Thanks for creating your SwiftInvoice account. Use the verification code below to complete your registration.
              </p>

              <div style="text-align:center;margin:32px 0;">
                <div style="display:inline-block;padding:18px 36px;background:#f4faf8;border:1px solid #d7ebe5;border-radius:8px;">
                  <span style="font-size:34px;font-weight:700;letter-spacing:8px;color:#003932;">
                    ${otp}
                  </span>
                </div>
              </div>

              <p style="margin:0 0 24px;text-align:center;color:#6b7280;font-size:14px;">
                This code expires in <strong>10 minutes</strong>.
              </p>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;">

              <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.7;">
                If you didn't request this email, you can safely ignore it.
              </p>

              <p style="margin:32px 0 0;color:#4b5563;font-size:15px;line-height:1.8;">
                Thanks,<br>
                <strong>SwiftInvoice Team</strong>
              </p>

            </td>
          </tr>

          <tr>
            <td style="padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} SwiftInvoice. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;

export const welcomeEmail = (name: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<body style="margin:0;padding:40px 20px;background:#f5f7f8;font-family:Arial,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">

        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;">

          <tr>
            <td style="padding:32px 40px;border-bottom:1px solid #e5e7eb;">
              <h2 style="margin:0;color:#003932;font-size:26px;font-weight:700;">
                SwiftInvoice
              </h2>
            </td>
          </tr>

          <tr>
            <td style="padding:40px;">

              <h3 style="margin:0 0 20px;color:#111827;font-size:22px;font-weight:600;">
                Welcome to SwiftInvoice 🎉
              </h3>

              <p style="margin:0 0 18px;color:#4b5563;font-size:16px;line-height:1.7;">
                Hi <strong>${name}</strong>,
              </p>

              <p style="margin:0 0 18px;color:#4b5563;font-size:16px;line-height:1.7;">
                Your account has been successfully created. You're now ready to manage invoices, customers, and payments all in one place.
              </p>

              <p style="margin:0 0 28px;color:#4b5563;font-size:16px;line-height:1.7;">
                Here are a few things you can do to get started:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:8px 0;color:#4b5563;font-size:15px;">
                    ✓ Add your business information
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#4b5563;font-size:15px;">
                    ✓ Create your first invoice
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#4b5563;font-size:15px;">
                    ✓ Add and manage customers
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#4b5563;font-size:15px;">
                    ✓ Track invoice payments
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#4b5563;font-size:15px;">
                    ✓ Generate professional PDF invoices
                  </td>
                </tr>
              </table>

              <div style="text-align:center;margin:36px 0;">
                <a
                  href="${process.env.FRONTEND_URL}/dashboard"
                  style="
                    display:inline-block;
                    background:#003932;
                    color:#ffffff;
                    text-decoration:none;
                    padding:14px 28px;
                    border-radius:8px;
                    font-size:15px;
                    font-weight:600;
                  "
                >
                  Go to Dashboard
                </a>
              </div>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;">

              <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.7;">
                If you have any questions, simply reply to this email—we're always happy to help.
              </p>

              <p style="margin:32px 0 0;color:#4b5563;font-size:15px;line-height:1.8;">
                Thanks for choosing SwiftInvoice,<br>
                <strong>SwiftInvoice Team</strong>
              </p>

            </td>
          </tr>

          <tr>
            <td style="padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} SwiftInvoice. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
