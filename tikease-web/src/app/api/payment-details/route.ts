import { NextRequest, NextResponse } from 'next/server';

const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string;
const keySecret = process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET as string;

// Create the auth header on the server side
const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

export async function GET(request: NextRequest) {
  // Get payment ID from the URL query parameter
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get('paymentId');

  if (!paymentId) {
    return NextResponse.json(
      { error: 'Payment ID is required' },
      { status: 400 }
    );
  }

  try {
    // Call Razorpay API from the server
    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
    });

    // Get the data from Razorpay
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch payment details', details: data },
        { status: response.status }
      );
    }

    // Return the payment details to the client
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Razorpay payment details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment details' },
      { status: 500 }
    );
  }
}