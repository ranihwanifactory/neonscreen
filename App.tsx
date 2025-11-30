import React, { useState } from 'react';
import { useAds } from './store';
import BillboardView from './components/BillboardView';
import AdminDashboard from './components/AdminDashboard';
import { ADMIN_EMAIL } from './types';
import { Lock } from 'lucide-react';
import { auth } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

const App: React.FC = () => {
  const { ads, loading, addAd, removeAd, uploadAdImage } = useAds();
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  
  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleOpenAdmin = () => {
    if (auth.currentUser && auth.currentUser.email === ADMIN_EMAIL) {
      setIsAdminOpen(true);
    } else {
      setShowAuthModal(true);
      setAuthError('');
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      
      if (email === ADMIN_EMAIL) {
        setUser(result.user);
        setShowAuthModal(false);
        setIsAdminOpen(true);
      } else {
        setAuthError(`Access Denied: ${email} is not authorized.`);
        await signOut(auth); // Log them out immediately if not admin
      }
    } catch (error: any) {
      console.error(error);
      setAuthError('Login Failed: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAdminOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-neon-blue font-mono animate-pulse">CONNECTING TO NEONSQUARE NET...</div>
      </div>
    );
  }

  return (
    <>
      <BillboardView ads={ads} onOpenAdmin={handleOpenAdmin} />

      {/* Admin Dashboard Overlay */}
      {isAdminOpen && (
        <AdminDashboard 
          ads={ads} 
          onAdd={addAd} 
          onRemove={removeAd}
          onUpload={uploadAdImage}
          onClose={() => setIsAdminOpen(false)}
          onLogout={handleLogout}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 p-8 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-pink to-neon-blue" />
            
            <div className="flex justify-center mb-6 text-neon-blue">
              <Lock size={48} />
            </div>
            
            <h2 className="text-2xl font-bold text-center text-white mb-2">Restricted Access</h2>
            <p className="text-gray-400 text-center mb-6 text-sm">
              Admin access only. Please sign in with <strong>{ADMIN_EMAIL}</strong>
            </p>
            
            <div className="space-y-4">
               {authError && (
                 <div className="bg-red-900/30 border border-red-800 text-red-300 p-3 rounded-lg text-xs text-center">
                   {authError}
                 </div>
               )}
              
              <button 
                onClick={handleGoogleLogin}
                className="w-full py-3 px-4 rounded-lg bg-white text-black font-bold flex items-center justify-center hover:bg-gray-200 transition"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"/>
                  <path fill="#EA4335" d="M12 4.66c1.61 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.19 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
              
              <button 
                onClick={() => setShowAuthModal(false)}
                className="w-full py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;