import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Plus, Users, Star, UserPlus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from 'framer-motion';
import ContactCard from '../components/contacts/ContactCard';
import ContactModal from '../components/modals/ContactModal';
import ScheduleModal from '../components/modals/ScheduleModal';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal';

export default function Contacts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-is_favorite,-created_date'),
  });

  const createContactMutation = useMutation({
    mutationFn: (data) => base44.entities.Contact.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setContactModalOpen(false);
      setSelectedContact(null);
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Contact.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setContactModalOpen(false);
      setSelectedContact(null);
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id) => base44.entities.Contact.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setDeleteModalOpen(false);
      setSelectedContact(null);
    },
  });

  const createMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.ScheduledMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setScheduleModalOpen(false);
      setSelectedContact(null);
    },
  });

  const handleSaveContact = (data) => {
    if (selectedContact) {
      updateContactMutation.mutate({ id: selectedContact.id, data });
    } else {
      createContactMutation.mutate(data);
    }
  };

  const handleToggleFavorite = (contact) => {
    updateContactMutation.mutate({
      id: contact.id,
      data: { is_favorite: !contact.is_favorite },
    });
  };

  const filteredContacts = contacts
    .filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           c.phone_number.includes(searchQuery);
      const matchesTab = activeTab === 'all' || (activeTab === 'favorites' && c.is_favorite);
      return matchesSearch && matchesTab;
    });

  const favorites = contacts.filter(c => c.is_favorite);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
              Contacts
            </h1>
            <p className="text-slate-500 mt-1">{contacts.length} contacts saved</p>
          </div>
          <Button 
            onClick={() => {
              setSelectedContact(null);
              setContactModalOpen(true);
            }}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-200 h-11 px-5"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Add Contact
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
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-white/80 border-slate-200"
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="bg-white/80 border border-slate-200 h-11 p-1">
              <TabsTrigger value="all" className="px-4 data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                <Users className="h-4 w-4 mr-2" />
                All
              </TabsTrigger>
              <TabsTrigger value="favorites" className="px-4 data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                <Star className="h-4 w-4 mr-2" />
                Favorites ({favorites.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Contacts List */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredContacts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 bg-white/50 rounded-2xl border border-dashed border-slate-200"
              >
                <Users className="h-14 w-14 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-700 mb-1">
                  {searchQuery ? 'No contacts found' : 'No contacts yet'}
                </h3>
                <p className="text-slate-500 mb-4">
                  {searchQuery ? 'Try a different search term' : 'Add your first WhatsApp contact to get started'}
                </p>
                {!searchQuery && (
                  <Button 
                    onClick={() => {
                      setSelectedContact(null);
                      setContactModalOpen(true);
                    }}
                    variant="outline"
                    className="border-slate-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                )}
              </motion.div>
            ) : (
              filteredContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onSchedule={(c) => {
                    setSelectedContact(c);
                    setScheduleModalOpen(true);
                  }}
                  onEdit={(c) => {
                    setSelectedContact(c);
                    setContactModalOpen(true);
                  }}
                  onDelete={(c) => {
                    setSelectedContact(c);
                    setDeleteModalOpen(true);
                  }}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modals */}
      <ContactModal
        open={contactModalOpen}
        onClose={() => {
          setContactModalOpen(false);
          setSelectedContact(null);
        }}
        contact={selectedContact}
        onSave={handleSaveContact}
        isLoading={createContactMutation.isPending || updateContactMutation.isPending}
      />

      <ScheduleModal
        open={scheduleModalOpen}
        onClose={() => {
          setScheduleModalOpen(false);
          setSelectedContact(null);
        }}
        contact={selectedContact}
        contacts={contacts}
        onSave={createMessageMutation.mutate}
        isLoading={createMessageMutation.isPending}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedContact(null);
        }}
        onConfirm={() => deleteContactMutation.mutate(selectedContact?.id)}
        title="Delete Contact"
        description={`Are you sure you want to delete ${selectedContact?.name}? All scheduled messages to this contact will remain.`}
        isLoading={deleteContactMutation.isPending}
      />
    </div>
  );
}