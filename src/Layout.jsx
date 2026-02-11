import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  LayoutDashboard, 
  Users, 
  MessageCircle,
  Settings as SettingsIcon,
  Menu,
  X
} from 'lucide-react';
import AppLogo from './components/ui/AppLogo';
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import InstallPrompt from './components/ui/InstallPrompt';
import MessageNotifications from './components/notifications/MessageNotifications';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
  { name: 'Contacts', icon: Users, page: 'Contacts' },
  { name: 'Messages', icon: MessageCircle, page: 'Messages' },
  { name: 'Settings', icon: SettingsIcon, page: 'Settings' },
];

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <OnboardingFlow>
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 flex-col z-50">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <AppLogo size="md" />
            <div>
              <h1 className="font-bold text-slate-800 text-lg">WAT?!</h1>
              <p className="text-xs text-slate-500">WhatsAppTimer</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200" 
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-100">
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              ⏰ Schedule now, edit or delete trace-free.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <AppLogo size="sm" />
          <h1 className="font-bold text-slate-800">WAT?!</h1>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed top-16 left-0 right-0 bg-white border-b border-slate-200 p-4 z-40 shadow-lg"
          >
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                      isActive 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white" 
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
          <main className="md:ml-64 pt-16 md:pt-0 min-h-screen">
            {children}
          </main>

          {/* PWA Install Prompt */}
          <InstallPrompt />
          
          {/* Message Notifications */}
          <MessageNotifications />
        </div>
        </OnboardingFlow>
  );
}