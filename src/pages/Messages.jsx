import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { isPast } from 'date-fns';
import { 
  Search, 
  Plus, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Filter
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from 'framer-motion';
import MessageCard from '../components/messages/MessageCard';
import ScheduleModal from '../components/modals/ScheduleModal';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal';

export default function Messages() {
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  const initialTab = tabParam === 'scheduled' ? 'pending' : (tabParam || 'pending');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: () => base44.entities.ScheduledMessage.list('-scheduled_time'),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-created_date'),
  });

  const createMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.ScheduledMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setScheduleModalOpen(false);
      setSelectedMessage(null);
      setSelectedContact(null);
    },
  });

  const updateMessageMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ScheduledMessage.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setScheduleModalOpen(false);
      setSelectedMessage(null);
      setSelectedContact(null);
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (id) => base44.entities.ScheduledMessage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setDeleteModalOpen(false);
      setSelectedMessage(null);
    },
  });

  const handleSaveMessage = (data) => {
    if (selectedMessage) {
      updateMessageMutation.mutate({ id: selectedMessage.id, data });
    } else {
      createMessageMutation.mutate(data);
    }
  };

  const filteredMessages = messages
    .filter(m => {
      const matchesSearch = 
        m.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.contact_name || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const scheduledDate = new Date(m.scheduled_time);
      const isPending = (m.status === 'pending' || m.status === 'pending_user_action') && !isPast(scheduledDate);
      
      if (activeTab === 'pending') return matchesSearch && (isPending || m.status === 'pending_user_action');
      if (activeTab === 'sent') return matchesSearch && m.status === 'sent';
      if (activeTab === 'cancelled') return matchesSearch && (m.status === 'cancelled' || (m.status === 'pending' && isPast(scheduledDate)));
      return matchesSearch;
    });

  const pendingCount = messages.filter(m => (m.status === 'pending' || m.status === 'pending_user_action') && !isPast(new Date(m.scheduled_time))).length;
  const sentCount = messages.filter(m => m.status === 'sent').length;

  const handleEditMessage = (message) => {
    const contact = contacts.find(c => c.id === message.contact_id);
    setSelectedMessage(message);
    setSelectedContact(contact || { 
      id: message.contact_id, 
      name: message.contact_name, 
      phone_number: message.contact_phone 
    });
    setScheduleModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
              Scheduled Messages
            </h1>
            <p className="text-slate-500 mt-1">{pendingCount} messages waiting to be sent</p>
          </div>
          <Button 
            onClick={() => {
              setSelectedMessage(null);
              setSelectedContact(null);
              setScheduleModalOpen(true);
            }}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-200 h-11 px-5"
          >
            <Plus className="h-5 w-5 mr-2" />
            Schedule Message
          </Button>
        </motion.div>

        {/* Search & Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search messages or contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-white/80 border-slate-200"
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="bg-white/80 border border-slate-200 h-11 p-1 w-full sm:w-auto">
              <TabsTrigger value="pending" className="px-3 data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                <Clock className="h-4 w-4 mr-1.5" />
                Scheduled
              </TabsTrigger>
              <TabsTrigger value="sent" className="px-3 data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Sent
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="px-3 data-[state=active]:bg-slate-600 data-[state=active]:text-white">
                <XCircle className="h-4 w-4 mr-1.5" />
                Deleted
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Messages List */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredMessages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 bg-white/50 rounded-2xl border border-dashed border-slate-200"
              >
                <MessageCircle className="h-14 w-14 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-700 mb-1">
                  {searchQuery ? 'No messages found' : `No ${activeTab === 'pending' ? 'scheduled' : activeTab} messages`}
                </h3>
                <p className="text-slate-500 mb-4">
                  {searchQuery ? 'Try a different search term' : 'Schedule your first message to get started'}
                </p>
                {!searchQuery && activeTab === 'pending' && (
                  <Button 
                    onClick={() => {
                      setSelectedMessage(null);
                      setSelectedContact(null);
                      setScheduleModalOpen(true);
                    }}
                    variant="outline"
                    className="border-slate-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Message
                  </Button>
                )}
              </motion.div>
            ) : (
              filteredMessages.map((message) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  onEdit={handleEditMessage}
                  onDelete={(m) => {
                    setSelectedMessage(m);
                    setDeleteModalOpen(true);
                  }}
                />
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modals */}
      <ScheduleModal
        open={scheduleModalOpen}
        onClose={() => {
          setScheduleModalOpen(false);
          setSelectedMessage(null);
          setSelectedContact(null);
        }}
        contact={selectedContact}
        message={selectedMessage}
        contacts={contacts}
        onSave={handleSaveMessage}
        isLoading={createMessageMutation.isPending || updateMessageMutation.isPending}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedMessage(null);
        }}
        onConfirm={() => deleteMessageMutation.mutate(selectedMessage?.id)}
        title="Delete Message"
        description="Are you sure you want to delete this scheduled message? This action cannot be undone."
        isLoading={deleteMessageMutation.isPending}
      />
    </div>
  );
}