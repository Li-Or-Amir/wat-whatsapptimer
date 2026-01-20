import { useState } from 'react';
import { FileText, Shield, Database, UserCheck, Mail, Trash2 } from 'lucide-react';
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
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TermsModal({ open, onClose, onAccept }) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const canProceed = termsAccepted && privacyAccepted;

  const handleAccept = () => {
    if (canProceed) {
      onAccept();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Terms & Conditions</DialogTitle>
              <DialogDescription>
                Please read and accept our terms to continue
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6 text-sm text-slate-600">
            {/* Terms of Service */}
            <section>
              <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Terms of Service
              </h3>
              <div className="space-y-3 pl-7">
                <p>
                  <strong>1. Acceptance of Terms</strong><br />
                  By accessing and using WA Scheduler ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
                </p>
                <p>
                  <strong>2. Description of Service</strong><br />
                  WA Scheduler provides tools to schedule and manage WhatsApp messages. The Service acts as a scheduling assistant and does not directly send messages through WhatsApp's systems.
                </p>
                <p>
                  <strong>3. User Responsibilities</strong><br />
                  You are responsible for all content you schedule and send. You agree not to use the Service for spam, harassment, or any illegal activities. You must comply with WhatsApp's terms of service.
                </p>
                <p>
                  <strong>4. Accuracy of Information</strong><br />
                  You are responsible for ensuring the accuracy of contact information and message content. We are not liable for messages sent to incorrect recipients.
                </p>
                <p>
                  <strong>5. Service Availability</strong><br />
                  We strive to maintain Service availability but do not guarantee uninterrupted access. Scheduled messages may be delayed or fail due to technical issues.
                </p>
                <p>
                  <strong>6. Limitation of Liability</strong><br />
                  The Service is provided "as is" without warranties. We are not liable for any damages arising from the use or inability to use the Service.
                </p>
              </div>
            </section>

            {/* Privacy Policy - GDPR Compliant */}
            <section>
              <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-500" />
                Privacy Policy (GDPR Compliant)
              </h3>
              <div className="space-y-4 pl-7">
                <div className="flex items-start gap-3">
                  <Database className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-700">Data We Collect</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Contact names and phone numbers you provide</li>
                      <li>Message content you create for scheduling</li>
                      <li>Scheduling preferences and timezone settings</li>
                      <li>Account information (email, name)</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <UserCheck className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-700">Legal Basis for Processing</p>
                    <p className="mt-1">
                      We process your data based on your explicit consent and contractual necessity to provide the Service. You can withdraw consent at any time.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-700">Data Security</p>
                    <p className="mt-1">
                      Your data is encrypted in transit and at rest. We implement industry-standard security measures to protect your information from unauthorized access.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-700">Data Sharing</p>
                    <p className="mt-1">
                      We do not sell, trade, or share your personal data with third parties for marketing purposes. Data may be shared with service providers who assist in operating our Service, under strict confidentiality agreements.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Trash2 className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-700">Your GDPR Rights</p>
                    <p className="mt-1">Under GDPR, you have the right to:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li><strong>Access:</strong> Request a copy of your personal data</li>
                      <li><strong>Rectification:</strong> Correct inaccurate data</li>
                      <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                      <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                      <li><strong>Restriction:</strong> Limit how we use your data</li>
                      <li><strong>Object:</strong> Object to certain processing activities</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium text-blue-800 mb-1">Data Retention</p>
                  <p className="text-blue-700 text-sm">
                    We retain your data only as long as necessary to provide the Service or as required by law. Scheduled messages are automatically deleted 30 days after their scheduled time. You can request immediate deletion of all your data at any time.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="font-medium text-slate-700 mb-1">Contact Us</p>
                  <p className="text-slate-600 text-sm">
                    For any privacy-related inquiries or to exercise your GDPR rights, please contact our Data Protection Officer at privacy@wascheduler.com
                  </p>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        <div className="space-y-3 pt-4 border-t">
          <div 
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer"
            onClick={() => setTermsAccepted(!termsAccepted)}
          >
            <Checkbox 
              id="terms" 
              checked={termsAccepted}
              onCheckedChange={setTermsAccepted}
            />
            <Label htmlFor="terms" className="text-sm cursor-pointer">
              I have read and agree to the <span className="text-blue-600 font-medium">Terms of Service</span>
            </Label>
          </div>
          
          <div 
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer"
            onClick={() => setPrivacyAccepted(!privacyAccepted)}
          >
            <Checkbox 
              id="privacy" 
              checked={privacyAccepted}
              onCheckedChange={setPrivacyAccepted}
            />
            <Label htmlFor="privacy" className="text-sm cursor-pointer">
              I have read and agree to the <span className="text-emerald-600 font-medium">Privacy Policy</span> and consent to the processing of my personal data as described
            </Label>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Decline
          </Button>
          <Button 
            onClick={handleAccept}
            disabled={!canProceed}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}