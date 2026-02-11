import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, MessageSquare, Globe, Paperclip } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import AttachmentPicker from './AttachmentPicker';

const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central European (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'China (CST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  { value: 'Australia/Perth', label: 'Perth (AWST)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST)' },
];

function getUserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'America/New_York';
  }
}

export default function ScheduleModal({ 
  open, 
  onClose, 
  contact, 
  message: existingMessage, 
  onSave, 
  isLoading,
  contacts = [],
  onContactSelect
}) {
  const [selectedContact, setSelectedContact] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [date, setDate] = useState(null);
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [timezone, setTimezone] = useState(getUserTimezone());
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    if (existingMessage) {
      setSelectedContact(contact);
      setMessageText(existingMessage.message || '');
      const scheduledDate = new Date(existingMessage.scheduled_time);
      setDate(scheduledDate);
      setHour(scheduledDate.getHours().toString());
      setMinute(scheduledDate.getMinutes().toString().padStart(2, '0'));
      setTimezone(existingMessage.timezone || getUserTimezone());
      setAttachments(existingMessage.attachments || []);
    } else if (contact) {
      setSelectedContact(contact);
      setMessageText('');
      setDate(null);
      setHour('12');
      setMinute('00');
      setPeriod('PM');
      setTimezone(getUserTimezone());
      setAttachments([]);
    } else {
      setSelectedContact(null);
      setMessageText('');
      setDate(null);
      setHour('12');
      setMinute('00');
      setPeriod('PM');
      setTimezone(getUserTimezone());
      setAttachments([]);
    }
  }, [existingMessage, contact, open]);

  const handleEmojiSelect = (emoji) => {
    setMessageText(prev => prev + emoji);
  };

  const handleAttachment = (attachment) => {
    setAttachments(prev => [...prev, attachment]);
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !selectedContact) return;

    const scheduledTime = new Date(date);
    scheduledTime.setHours(parseInt(hour), parseInt(minute), 0, 0);

    onSave({
      contact_id: selectedContact.id,
      contact_name: selectedContact.name,
      contact_phone: selectedContact.phone_number,
      message: messageText,
      scheduled_time: scheduledTime.toISOString(),
      timezone: timezone,
      attachments: attachments,
      status: 'pending',
    });
  };

  const isEditing = !!existingMessage;
  const initials = selectedContact?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const hoursOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutesOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  // Find timezone in list or add it
  const allTimezones = COMMON_TIMEZONES.some(tz => tz.value === timezone)
    ? COMMON_TIMEZONES
    : [{ value: timezone, label: timezone }, ...COMMON_TIMEZONES];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? 'Edit Scheduled Message' : 'Schedule Message'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {/* Contact Selection */}
          {!contact && !existingMessage && contacts.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Send To</Label>
              <Select
                value={selectedContact?.id || ''}
                onValueChange={(id) => {
                  const c = contacts.find(c => c.id === id);
                  setSelectedContact(c);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <span>{c.name}</span>
                        <span className="text-slate-400 text-xs">{c.phone_number}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Selected Contact Display */}
          {selectedContact && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-slate-800">{selectedContact.name}</p>
                <p className="text-xs text-slate-500">{selectedContact.phone_number}</p>
              </div>
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium text-slate-700">
              Message
            </Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Textarea
                id="message"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="pl-10 min-h-[100px] resize-none"
                placeholder="Type your message here..."
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <AttachmentPicker
                onEmojiSelect={handleEmojiSelect}
                onAttachment={handleAttachment}
                attachments={attachments}
                onRemoveAttachment={handleRemoveAttachment}
              />
              <p className="text-xs text-slate-500">{messageText.length} characters</p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Schedule For</Label>
            <div className="flex gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex gap-2 items-center">
              <Clock className="h-4 w-4 text-slate-400" />
              <Select value={hour} onValueChange={setHour}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hoursOptions.map((h) => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-slate-400">:</span>
              <Select value={minute} onValueChange={setMinute}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {minutesOptions.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Timezone</Label>
            <div className="flex gap-2 items-center">
              <Globe className="h-4 w-4 text-slate-400" />
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allTimezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !selectedContact || !date || !messageText.trim()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update Message' : 'Schedule Message'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}