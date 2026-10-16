import { supabase } from '@/lib/supabase';

interface SendEmailOptions {
  order: any;
  type: 'order_confirmed' | 'order_shipped' | 'invoice' | 'new_order_team';
  client_email: string;
  invoice_base64?: string;
}

/**
 * useEmailNotification
 * Hook to send transactional emails via the Supabase Edge Function
 * which calls Resend internally.
 */
export const useEmailNotification = () => {
  const sendEmail = async ({ order, type, client_email, invoice_base64 }: SendEmailOptions) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-order-email', {
        body: { order, type, client_email, invoice_base64 },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error('Email send error:', err);
      return { success: false, error: err.message };
    }
  };

  /**
   * sendTeamNotification
   * Fetches all active subscribers from order_notification_subscribers
   * and sends each one a new-order notification email.
   * Non-blocking — failures are logged but don't interrupt the order flow.
   */
  const sendTeamNotification = async (order: any) => {
    try {
      // Fetch active commercial subscribers
      const { data: subscribers, error } = await supabase
        .from('order_notification_subscribers')
        .select('email, label')
        .eq('active', true);

      if (error) {
        console.error('Failed to fetch notification subscribers:', error);
        return;
      }

      if (!subscribers || subscribers.length === 0) {
        console.log('No active order notification subscribers found.');
        return;
      }

      // Send notification to each active subscriber in parallel
      const results = await Promise.allSettled(
        subscribers.map((sub) =>
          supabase.functions.invoke('send-order-email', {
            body: {
              order,
              type: 'new_order_team',
              client_email: sub.email,
              recipient_label: sub.label || sub.email,
            },
          })
        )
      );

      const sent = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;
      console.log(`Team notifications: ${sent} sent, ${failed} failed out of ${subscribers.length} subscribers.`);
    } catch (err: any) {
      console.error('sendTeamNotification error:', err);
    }
  };

  return { sendEmail, sendTeamNotification };
};
