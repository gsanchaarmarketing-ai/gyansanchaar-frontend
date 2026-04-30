import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { to, otp, purpose, name } = await req.json()

    if (!to || !otp) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const purposeLabel: Record<string, string> = {
      registration:       'Email Verification',
      login:              'Login OTP',
      password_reset:     'Password Reset',
      phone_verification: 'Phone Verification',
    }

    const subject = `${purposeLabel[purpose] ?? 'OTP'}: ${otp} — GyanSanchaar`
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1E3A8A,#1D4ED8);padding:32px 40px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.5px;">🎓 GyanSanchaar</h1>
          <p style="color:rgba(255,255,255,0.65);margin:6px 0 0;font-size:13px;">India's College Application Platform</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:36px 40px;">
          ${name ? `<p style="color:#374151;font-size:15px;margin:0 0 20px;">Hi ${name},</p>` : ''}
          <p style="color:#374151;font-size:15px;margin:0 0 28px;line-height:1.6;">
            Your ${purposeLabel[purpose] ?? 'OTP'} code for GyanSanchaar is:
          </p>
          <!-- OTP Box -->
          <div style="background:#EFF6FF;border:2px solid #BFDBFE;border-radius:12px;padding:24px;text-align:center;margin:0 0 28px;">
            <p style="margin:0 0 8px;color:#6B7280;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Your OTP</p>
            <p style="margin:0;font-size:40px;font-weight:800;letter-spacing:12px;color:#1E3A8A;font-family:monospace;">${otp}</p>
          </div>
          <p style="color:#9CA3AF;font-size:13px;margin:0 0 8px;">⏱ Valid for <strong>10 minutes</strong>.</p>
          <p style="color:#9CA3AF;font-size:13px;margin:0;">🔒 Never share this OTP with anyone, including GyanSanchaar staff.</p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#F9FAFB;border-top:1px solid #E5E7EB;padding:20px 40px;text-align:center;">
          <p style="color:#9CA3AF;font-size:11px;margin:0;">
            GyanSanchaar · India's College Application Platform<br>
            DPDP Act 2023 Compliant · <a href="https://gyansanchaar.com/privacy" style="color:#6B7280;">Privacy Policy</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

    // Send via Zoho SMTP
    const client = new SmtpClient()
    await client.connectTLS({
      hostname: 'smtp.zoho.in',
      port: 465,
      username: Deno.env.get('SMTP_USER')!,
      password: Deno.env.get('SMTP_PASS')!,
    })

    await client.send({
      from: `GyanSanchaar <${Deno.env.get('SMTP_USER')}>`,
      to,
      subject,
      content: `Your GyanSanchaar OTP is: ${otp}. Valid for 10 minutes.`,
      html,
    })

    await client.close()

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('send-otp-email error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
