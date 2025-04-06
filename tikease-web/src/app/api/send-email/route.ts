import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, message, subject } = body;
    
    if (!email || !message) {
      return NextResponse.json(
        { message: 'Missing fields' },
        { status: 400 }
      );
    }

    const name = "Tikease";
    const emailSubject = subject || `New message from ${name}`;

    // 1) create reusable transporter
    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Check if message is already HTML
    const isHTML = message.trim().startsWith('<!DOCTYPE html') || 
                  message.trim().startsWith('<html') || 
                  (message.includes('<') && message.includes('</'));

    // 2) send mail
    await transporter.sendMail({
      from: `"${name}" <${process.env.EMAIL_USER}>`, // sender address
      to: email,
      subject: emailSubject,
      text: isHTML ? extractTextFromHTML(message) : message,
      html: isHTML ? message : `<p>${message}</p>`,
    });
    
    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json(
      { message: 'Error sending email' },
      { status: 500 }
    );
  }
}

// Helper function to extract plain text from HTML for the text version of the email
function extractTextFromHTML(html: string): string {
  // Very simple extraction - in production, use a proper HTML parser
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}