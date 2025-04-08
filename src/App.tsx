import React, { useEffect, useState } from 'react';
import Game from './components/Game';
import { Cat } from 'lucide-react';

function App() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
    });

    // Listen for the appinstalled event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We no longer need the prompt
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start pt-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        <Game />
        
        {!isInstalled && deferredPrompt && (
          <div className="mt-6 text-center">
            <button
              onClick={handleInstallClick}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded flex items-center mx-auto"
            >
              <Cat className="mr-2" size={20} />
              Install Cat Jump Game
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Install this app on your device for the best experience!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;