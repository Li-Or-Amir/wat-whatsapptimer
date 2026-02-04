import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import TermsModal from '../modals/TermsModal';
import PermissionsModal from '../modals/PermissionsModal';
import WhatsAppConnectScreen from './WhatsAppConnectScreen';

export default function OnboardingFlow({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showWhatsAppConnect, setShowWhatsAppConnect] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Check if user has completed onboarding
      if (currentUser.terms_accepted && currentUser.permissions_granted && currentUser.whatsapp_connected) {
        setOnboardingComplete(true);
      } else if (!currentUser.terms_accepted) {
        setShowTerms(true);
      } else if (!currentUser.permissions_granted) {
        setShowPermissions(true);
      } else if (!currentUser.whatsapp_connected) {
        setShowWhatsAppConnect(true);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTermsAccept = async () => {
    try {
      await base44.auth.updateMe({ 
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString()
      });
      setShowTerms(false);
      setShowPermissions(true);
    } catch (error) {
      console.error('Error updating terms:', error);
    }
  };

  const handlePermissionsAccept = async () => {
    try {
      await base44.auth.updateMe({ 
        permissions_granted: true,
        permissions_granted_at: new Date().toISOString()
      });
      setShowPermissions(false);
      setShowWhatsAppConnect(true);
    } catch (error) {
      console.error('Error updating permissions:', error);
    }
  };

  const handleWhatsAppConnect = async () => {
    try {
      await base44.auth.updateMe({ 
        whatsapp_connected: true,
        whatsapp_connected_at: new Date().toISOString()
      });
      setShowWhatsAppConnect(false);
      setOnboardingComplete(true);
    } catch (error) {
      console.error('Error connecting WhatsApp:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (showWhatsAppConnect) {
    return <WhatsAppConnectScreen onConnect={handleWhatsAppConnect} />;
  }

  return (
    <>
      {onboardingComplete ? children : (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Welcome to WAT?!</h1>
            <p className="text-slate-500">Please complete the setup to continue</p>
          </div>
        </div>
      )}

      <TermsModal
        open={showTerms}
        onClose={() => {}} // Prevent closing without accepting
        onAccept={handleTermsAccept}
      />

      <PermissionsModal
        open={showPermissions}
        onClose={() => {}} // Prevent closing without accepting
        onAccept={handlePermissionsAccept}
      />
    </>
  );
}