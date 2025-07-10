import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value
        },
        async set(name: string, value: string, options) {
          try {
            (await cookieStore).set({ name, value, ...options })
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        async remove(name: string, options) {
          try {
            (await cookieStore).set({ name, value: '', ...options })
          } catch {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    console.error(`Webhook Error: ${errorMessage}`);
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;

      if (!userId || !planId) {
        console.error('Missing userId or planId in checkout session metadata.');
        return NextResponse.json({ received: true }, { status: 200 });
      }

      // Update user's subscription status in Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ subscription_status: 'active', stripe_customer_id: session.customer as string })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating subscription status in Supabase:', updateError);
        return NextResponse.json({ error: 'Failed to update subscription status' }, { status: 500 });
      }

      console.log(`User ${userId} subscribed to ${planId}.`);

      // Trigger Twilio phone number purchase (next step)
      try {
        const twilioResponse = await fetch(`${req.nextUrl.origin}/api/twilio/buy-number`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userId }),
        });

        if (!twilioResponse.ok) {
          const errorData = await twilioResponse.json();
          console.error('Error triggering Twilio number purchase:', errorData.error);
        }
      } catch (twilioErr) {
        console.error('Failed to call Twilio number purchase API:', twilioErr);
      }

      break;
    // Add other event types as needed
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
