import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContactEmailRequest {
  name: string
  email: string
  organization?: string
  subject: string
  category: string
  message: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      name,
      email,
      organization,
      subject,
      category,
      message
    }: ContactEmailRequest = await req.json()

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not configured, skipping email send')
      return new Response(
        JSON.stringify({ success: true, message: 'Contact form submitted (email disabled)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Format email content
    const emailSubject = `[OpenComments] ${category.replace('_', ' ').toUpperCase()}: ${subject}`
    const emailBody = `
New contact form submission:

Name: ${name}
Email: ${email}
Organization: ${organization || 'Not provided'}
Category: ${category.replace('_', ' ')}
Subject: ${subject}

Message:
${message}

---
Submitted via OpenComments Contact Form
Time: ${new Date().toISOString()}
    `.trim()

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'OpenComments <noreply@opencomments.us>', // Update with actual email
to: ['support@opencomments.us'], // This will be updated to actual support email
        reply_to: email,
        subject: emailSubject,
        text: emailBody,
        html: emailBody.replace(/\n/g, '<br>')
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Resend API error:', errorText)
      throw new Error('Failed to send email notification')
    }

    const emailResult = await emailResponse.json()
    console.log('Email sent successfully:', emailResult.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Contact form submitted and email sent',
        email_id: emailResult.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Contact form error:', error)

    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process contact form',
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})