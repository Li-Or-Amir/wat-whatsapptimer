import { useState } from 'react';
import { Shield, Users, MessageCircle, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { motion } from 'framer-motion';

const permissions = [
  {
    id: 'contacts',
    icon: Users,
    title: 'Sync & Manage Contacts',
    description: 'Add your WhatsApp contacts to schedule messages. You can import contacts manually or from your phone\'s contact list.',
    required: true,
  },
  {
    id: 'whatsapp',
    icon: MessageCircle,
    title: 'WhatsApp Integration',
    description: 'Allow the app to prepare messages for your WhatsApp account. Messages will be sent through WhatsApp Web.',
    required: true,
  },
];

export default function PermissionsModal({ open, onClose, onAccept }) {
  const [accepted, setAccepted] = useState({
    contacts: false,
    whatsapp: false,
  });

  const allAccepted = permissions.every(p => accepted[p.id]);

  const handleAccept = () => {
    if (allAccepted) {
      onAccept();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Permissions Required</DialogTitle>
              <DialogDescription className="text-sm">
                To use WA Scheduler, please grant the following permissions
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {permissions.map((permission, index) => (
            <motion.div
              key={permission.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                accepted[permission.id] 
                  ? 'border-emerald-200 bg-emerald-50' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
              onClick={() => setAccepted(prev => ({ ...prev, [permission.id]: !prev[permission.id] }))}
            >
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  accepted[permission.id] ? 'bg-emerald-100' : 'bg-slate-100'
                }`}>
                  <permission.icon className={`h-5 w-5 ${
                    accepted[permission.id] ? 'text-emerald-600' : 'text-slate-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-slate-800 cursor-pointer">
                      {permission.title}
                      {permission.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      accepted[permission.id] 
                        ? 'bg-emerald-500 border-emerald-500' 
                        : 'border-slate-300'
                    }`}>
                      {accepted[permission.id] && <Check className="h-3 w-3 text-white" />}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{permission.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
          <p className="font-medium text-slate-700 mb-1">Your data is secure</p>
          <p>We only store the information necessary to schedule your messages. Your data is encrypted and never shared with third parties. For the best experience, install WAT?! on your phone.</p>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAccept}
            disabled={!allAccepted}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Grant Permissions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}