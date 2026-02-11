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
    let intervalId;
    
    // Check messages every 30 seconds
    const checkMessages = async () => {
      try {
        const messages = await base44.entities.ScheduledMessage.filter({ 
          status: 'pending_user_action' 
        });
        
        messages.forEach((message) => {
          const notificationKey = `notified_${message.id}`;
          const hasNotified = sessionStorage.getItem(notificationKey);
          
          if (!hasNotified) {
            // Mark as notified
            sessionStorage.setItem(notificationKey, 'true');
            
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
      } catch (error) {
        console.error('Error checking messages:', error);
      }
    };

    // Check immediately
    checkMessages();
    
    // Then check every 30 seconds
    intervalId = setInterval(checkMessages, 30000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [permission]);

  return null;
}