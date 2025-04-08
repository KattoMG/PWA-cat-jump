import React, { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';

const NotificationManager: React.FC = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      
      // Check if already subscribed
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking push subscription:', error);
    }
  };

  const handleSubscriptionToggle = async () => {
    if (!isSupported) return;
    
    setIsLoading(true);
    
    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (isSubscribed) {
        // Unsubscribe
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          setIsSubscribed(false);
        }
      } else {
        // Request permission
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          // Subscribe
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              // This is a placeholder public key - in a real app, you would use your actual VAPID public key
              'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
            )
          });
          
          setIsSubscribed(true);
          
          // In a real app, you would send the subscription to your server
          console.log('Push subscription:', JSON.stringify(subscription));
          
          // Send a test notification
          setTimeout(() => {
            registration.showNotification('Cat Jump Game', {
              body: 'Notifications enabled! Your cat is ready to jump!',
              icon: '/pwa-192x192.png',
              vibrate: [100, 50, 100]
            });
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error managing push subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert base64 to Uint8Array for applicationServerKey
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  };

  if (!isSupported) return null;

  return (
    <div className="mt-4">
      <button
        onClick={handleSubscriptionToggle}
        disabled={isLoading}
        className={`flex items-center px-4 py-2 rounded-full text-white ${
          isSubscribed 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-green-500 hover:bg-green-600'
        } transition-colors duration-300`}
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : isSubscribed ? (
          <>
            <BellOff className="mr-2" size={16} />
            Disable Notifications
          </>
        ) : (
          <>
            <Bell className="mr-2" size={16} />
            Enable Notifications
          </>
        )}
      </button>
    </div>
  );
};

export default NotificationManager;