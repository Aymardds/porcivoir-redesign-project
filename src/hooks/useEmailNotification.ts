import { supabase } from '@/lib/supabase';

interface SendEmailOptions {
  order: any;
  type: 'order_confirmed' | 'order_shipped' | 'invoice';
  client_email: string;
}

/**
 * useEmailNotification
 * Hook to send transactional emails via the Supabase Edge Function
 * which calls Resend internally.
 */
export const useEmailNotification = () => {
  const sendEmail = async ({ order, type, client_email }: SendEmailOptions) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-order-email', {
        body: { order, type, client_email },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error('Email send error:', err);
      return { success: false, error: err.message };
    }
  };

  return { sendEmail };
};
