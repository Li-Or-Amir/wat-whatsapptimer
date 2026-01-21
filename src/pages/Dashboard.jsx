import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  MessageCircle, 
  Users, 
  Plus,
  ArrowRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ScheduleModal from '../components/modals/ScheduleModal';

export default function Dashboard() {
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-created_date'),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: () => base44.entities.ScheduledMessage.list('-scheduled_time'),
  });

  const createMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.ScheduledMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setScheduleModalOpen(false);
    },
  });

  const pendingMessages = messages.filter(m => m.status === 'pending' && !isPast(new Date(m.scheduled_time)));
  const todayMessages = pendingMessages.filter(m => isToday(new Date(m.scheduled_time)));
  const upcomingMessages = pendingMessages.slice(0, 5);

  const sentMessages = messages.filter(m => m.status === 'sent');

  const stats = [
    { 
      label: 'Sent Messages', 
      value: sentMessages.length, 
      icon: MessageCircle, 
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      tab: 'sent'
    },
    { 
      label: 'Scheduled Today', 
      value: todayMessages.length, 
      icon: Calendar, 
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      tab: 'scheduled'
    },
    { 
      label: 'Pending Messages', 
      value: pendingMessages.length, 
      icon: Clock, 
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      tab: 'scheduled'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
              WAT?! Dashboard
            </h1>
            <p className="text-slate-500 mt-1">Set-and-forget your WhatsApp messages here.</p>
          </div>
          <div className="flex gap-3">
            <a 
              href="https://web.whatsapp.com" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button 
                variant="outline"
                className="h-12 px-5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                Go to WhatsApp
              </Button>
            </a>
            <Button 
              onClick={() => setScheduleModalOpen(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-200 h-12 px-6"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Message
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`${createPageUrl('Messages')}?tab=${stat.tab}`}>
                <Card className="p-6 border-0 bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                      <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                    </div>
                    <div className={`h-14 w-14 rounded-2xl ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`h-7 w-7 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} 
                        style={{ color: stat.color.includes('blue') ? '#3b82f6' : stat.color.includes('emerald') ? '#10b981' : '#f59e0b' }}
                      />
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Messages */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800">Upcoming Messages</h2>
                  </div>
                  <Link to={createPageUrl('Messages')}>
                    <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                      View All <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="p-4 space-y-3 max-h-[400px] overflow-auto">
                <AnimatePresence>
                  {upcomingMessages.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No scheduled messages yet</p>
                      <Button 
                        variant="link" 
                        onClick={() => setScheduleModalOpen(true)}
                        className="text-emerald-600 mt-2"
                      >
                        Schedule your first message
                      </Button>
                    </motion.div>
                  ) : (
                    upcomingMessages.map((msg, index) => {
                      const scheduledDate = new Date(msg.scheduled_time);
                      const initials = (msg.contact_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                      
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10 ring-2 ring-white">
                              <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-800 text-white text-sm">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-slate-800">{msg.contact_name}</span>
                                {isToday(scheduledDate) && (
                                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">Today</Badge>
                                )}
                                {isTomorrow(scheduledDate) && (
                                  <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">Tomorrow</Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 line-clamp-1">{msg.message}</p>
                              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(scheduledDate, "MMM d 'at' h:mm a")}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>

          {/* Recent Contacts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800">Contacts</h2>
                  </div>
                  <Link to={createPageUrl('Contacts')}>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      Manage <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="p-4 space-y-2 max-h-[400px] overflow-auto">
                <AnimatePresence>
                  {contacts.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No contacts yet</p>
                      <Link to={createPageUrl('Contacts')}>
                        <Button variant="link" className="text-blue-600 mt-2">
                          Add your first contact
                        </Button>
                      </Link>
                    </motion.div>
                  ) : (
                    contacts.slice(0, 6).map((contact, index) => {
                      const initials = contact.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                      
                      return (
                        <motion.div
                          key={contact.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <Avatar className="h-10 w-10 ring-2 ring-slate-100">
                            <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-sm">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800">{contact.name}</p>
                            <p className="text-xs text-slate-500">{contact.phone_number}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                              onClick={() => setScheduleModalOpen(true)}
                              title="New Message"
                            >
                              <svg viewBox="0 0 24 24" className="h-5 w-5">
                                <circle cx="12" cy="10" r="8" fill="#10b981" />
                                <path d="M7 16l2.5-2.5h5" fill="#10b981" />
                                <circle cx="12" cy="10" r="3" fill="none" stroke="white" strokeWidth="1.5" />
                                <path d="M12 8.5v1.5l1 0.7" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            </Button>
                            <a
                              href={`https://wa.me/${contact.phone_number.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                title="See Chat"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </a>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      <ScheduleModal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        contacts={contacts}
        onSave={createMessageMutation.mutate}
        isLoading={createMessageMutation.isPending}
      />
    </div>
  );
}