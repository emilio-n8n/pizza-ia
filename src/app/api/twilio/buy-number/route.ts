import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

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

  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId in request body.' }, { status: 400 });
    }

    // Find the pizzeria associated with the user
    const { data: pizzeria, error: pizzeriaError } = await supabase
      .from('pizzerias')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (pizzeriaError || !pizzeria) {
      console.error('Pizzeria not found for user:', userId, pizzeriaError);
      return NextResponse.json({ error: 'Pizzeria not found for user.' }, { status: 404 });
    }

    // Search for an available phone number (e.g., in a specific area code)
    const areaCode = parseInt(process.env.TWILIO_AREA_CODE || '415', 10); // Default to San Francisco area code if not set
    const availableNumbers = await twilioClient.availablePhoneNumbers('US') // Or 'FR' for France, etc.
      .local
      .list({ areaCode: areaCode, smsEnabled: true, voiceEnabled: true });

    if (availableNumbers.length === 0) {
      console.error('No available Twilio numbers found for area code:', areaCode);
      return NextResponse.json({ error: 'No available Twilio numbers found.' }, { status: 500 });
    }

    const numberToBuy = availableNumbers[0];

    // Purchase the number
    const purchasedNumber = await twilioClient.incomingPhoneNumbers
      .create({ phoneNumber: numberToBuy.phoneNumber });

    // Update the pizzeria record with the new Twilio number
    const { error: updateError } = await supabase
      .from('pizzerias')
      .update({ twilio_phone_number: purchasedNumber.phoneNumber })
      .eq('id', pizzeria.id);

    if (updateError) {
      console.error('Error updating pizzeria with Twilio number:', updateError);
      return NextResponse.json({ error: 'Failed to update pizzeria with Twilio number.' }, { status: 500 });
    }

    console.log(`Purchased Twilio number ${purchasedNumber.phoneNumber} for pizzeria ${pizzeria.id}`);

    return NextResponse.json({ message: 'Twilio number purchased and assigned successfully.', phoneNumber: purchasedNumber.phoneNumber });

  } catch (error) {
    console.error('Error in Twilio number purchase API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `Failed to purchase Twilio number: ${errorMessage}` }, { status: 500 });
  }
}
