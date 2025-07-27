import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CommentConfirmationRequest {
  comment_id: string
  tracking_id: string
  commenter_email?: string
  commenter_name?: string
  docket_title: string
  agency_name: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      comment_id,
      tracking_id,
      commenter_email,
      commenter_name,
      docket_title,
      agency_name
    }: CommentConfirmationRequest = await req.json()

    // Only send email if email address was provided
    if (!commenter_email) {
      return new Response(
        JSON.stringify({ success: true, message: 'No email provided, skipping confirmation' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not configured, skipping email send')
      return new Response(
        JSON.stringify({ success: true, message: 'Email service not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Format confirmation email
    const emailSubject = `Comment Submitted: ${docket_title}`
    const emailBody = `
Dear ${commenter_name || 'Commenter'},

Thank you for submitting your public comment on "${docket_title}" with ${agency_name}.

Your comment has been received and assigned tracking ID: ${tracking_id}

What happens next:
1. Your comment will be reviewed by agency staff
2. Once approved, it will be published on the public docket page
3. All comments will be considered in the agency's decision-making process

You can view the docket and other public comments at:
${Deno.env.get('SITE_URL') || 'https://opencomments.us'}/dockets

Thank you for participating in the democratic process. Your voice matters!

Best regards,
The OpenComments Team

---
This is an automated confirmation email. Please do not reply to this message.
If you have questions, contact the agency directly or visit our help center.
    `.trim()

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'OpenComments <notifications@opencomments.us>',
        to: [commenter_email],
        subject: emailSubject,
        text: emailBody,
        html: emailBody.replace(/\n/g, '<br>')
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Resend API error:', errorText)
      throw new Error('Failed to send confirmation email')
    }

    const emailResult = await emailResponse.json()
    console.log('Confirmation email sent:', emailResult.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Confirmation email sent',
        email_id: emailResult.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Comment confirmation error:', error)

    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send confirmation email',
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})