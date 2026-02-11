import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ExternalLink } from 'lucide-react';

export default function MessageNotifications() {
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    // Check current permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    // Request permission if not already granted
    const requestPermission = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        const result = await Notification.requestPermission();
        setPermission(result);
      }
    };
    requestPermission();
  }, []);

  useEffect(() => {
    // Subscribe to ScheduledMessage changes
    const unsubscribe = base44.entities.ScheduledMessage.subscribe((event) => {
      if (event.type === 'update' && event.data.status === 'pending_user_action') {
        const message = event.data;
        
        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification('Message Ready to Send! 📱', {
            body: `Send to ${message.contact_name}: "${message.message.substring(0, 50)}${message.message.length > 50 ? '...' : ''}"`,
            icon: '/favicon.ico',
            tag: message.id,
            requireInteraction: true,
          });

          notification.onclick = () => {
            window.focus();
            window.location.href = `https://wa.me/${message.contact_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message.message)}`;
            notification.close();
          };
        }

        // Also show in-app toast notification
        toast.success(`Time to send message to ${message.contact_name}!`, {
          description: 'Click to open WhatsApp',
          duration: 10000,
          action: {
            label: 'Send Now',
            onClick: () => {
              window.open(
                `https://wa.me/${message.contact_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message.message)}`,
                '_blank'
              );
            },
          },
        });
      }
    });

    return () => unsubscribe();
  }, [permission]);

  return null;
}