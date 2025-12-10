import { supabase } from '../lib/supabaseClient';
import { TwilioConfig } from '../types';

export const saveTwilioConfig = async (config: TwilioConfig) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('integrations')
    .upsert({
      user_id: user.id,
      twilio_account_sid: config.accountSid,
      twilio_auth_token: config.authToken,
      twilio_phone_number: config.phoneNumber,
      whatsapp_enabled: config.enabled
    });

  if (error) throw error;
};

export const getTwilioConfig = async (): Promise<TwilioConfig | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error || !data) return null;

  return {
    accountSid: data.twilio_account_sid,
    authToken: data.twilio_auth_token, // Note: In a real app, never return full token to client if possible
    phoneNumber: data.twilio_phone_number,
    enabled: data.whatsapp_enabled
  };
};

export const sendWhatsAppMessage = async (to: string, message: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-whatsapp', {
      body: { to, message }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    throw error;
  }
};