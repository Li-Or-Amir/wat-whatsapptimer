import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Settings as SettingsIcon, 
  Send, 
  Bell, 
  Key, 
  Database,
  Trash2,
  LogOut,
  Phone,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal';

export default function Settings() {
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list(),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: () => base44.entities.ScheduledMessage.list(),
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Settings updated');
    },
  });

  const deleteAllContactsMutation = useMutation({
    mutationFn: async () => {
      for (const contact of contacts) {
        await base44.entities.Contact.delete(contact.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('All contacts deleted');
      setDeleteModalOpen(false);
    },
  });

  const deleteAllMessagesMutation = useMutation({
    mutationFn: async () => {
      for (const message of messages) {
        await base44.entities.ScheduledMessage.delete(message.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('All messages deleted');
      setDeleteModalOpen(false);
    },
  });

  const deleteAllDataMutation = useMutation({
    mutationFn: async () => {
      for (const contact of contacts) {
        await base44.entities.Contact.delete(contact.id);
      }
      for (const message of messages) {
        await base44.entities.ScheduledMessage.delete(message.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('All data deleted');
      setDeleteModalOpen(false);
    },
  });

  const handleDeleteConfirm = () => {
    if (deleteType === 'contacts') {
      deleteAllContactsMutation.mutate();
    } else if (deleteType === 'messages') {
      deleteAllMessagesMutation.mutate();
    } else if (deleteType === 'all') {
      deleteAllDataMutation.mutate();
    }
  };

  const requestContactsPermission = async () => {
    try {
      if ('contacts' in navigator && 'ContactsManager' in window) {
        await navigator.contacts.select(['name', 'tel']);
        updateUserMutation.mutate({ permissions_contacts: true });
      } else {
        toast.error('Contacts API not supported on this device');
      }
    } catch (error) {
      toast.error('Permission denied');
    }
  };

  const requestNotificationsPermission = async () => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        updateUserMutation.mutate({ permissions_notifications: permission === 'granted' });
        if (permission === 'granted') {
          toast.success('Notifications enabled');
        }
      } else {
        toast.error('Notifications not supported on this device');
      }
    } catch (error) {
      toast.error('Permission denied');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const deleteModalConfig = {
    contacts: {
      title: 'Delete All Contacts',
      description: `Are you sure you want to delete all ${contacts.length} contacts? This action cannot be undone.`,
    },
    messages: {
      title: 'Delete All Messages',
      description: `Are you sure you want to delete all ${messages.length} messages? This action cannot be undone.`,
    },
    all: {
      title: 'Delete All Data',
      description: `Are you sure you want to delete ALL your data (${contacts.length} contacts and ${messages.length} messages)? This action cannot be undone.`,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-emerald-600" />
            Settings
          </h1>
          <p className="text-slate-500 mt-1">Manage your preferences and data</p>
        </motion.div>

        {/* Send Mode */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-emerald-600" />
                Send Mode
              </CardTitle>
              <CardDescription>
                Choose how messages are sent when their scheduled time arrives
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                onClick={() => updateUserMutation.mutate({ send_mode: 'manual' })}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  user?.send_mode === 'manual' || !user?.send_mode
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">Manual (Recommended)</h3>
                    <p className="text-sm text-slate-600">
                      You'll receive a notification when it's time to send. Click to open WhatsApp Web and send manually. 
                      This ensures messages appear as if sent directly by you. Make sure to enable the "ready to send" notification below.
                    </p>
                  </div>
                  {(user?.send_mode === 'manual' || !user?.send_mode) && (
                    <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                  )}
                </div>
              </div>

              <div
                onClick={() => updateUserMutation.mutate({ send_mode: 'automatic' })}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  user?.send_mode === 'automatic'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
                      Automatic
                      <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded">Coming Soon</span>
                    </h3>
                    <p className="text-sm text-slate-600">
                      Messages will be sent automatically via WhatsApp Business API. Requires additional setup and fees.
                    </p>
                  </div>
                  {user?.send_mode === 'automatic' && (
                    <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-emerald-600" />
                Notifications
              </CardTitle>
              <CardDescription>
                Choose which notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Ready to Send</Label>
                  <p className="text-sm text-slate-500">
                    Get notified when a message is ready to send
                  </p>
                </div>
                <Switch
                  checked={user?.notifications_ready_to_send ?? true}
                  onCheckedChange={(checked) =>
                    updateUserMutation.mutate({ notifications_ready_to_send: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Message Sent</Label>
                  <p className="text-sm text-slate-500">
                    Get notified when you've sent a message
                  </p>
                </div>
                <Switch
                  checked={user?.notifications_sent ?? false}
                  onCheckedChange={(checked) =>
                    updateUserMutation.mutate({ notifications_sent: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Permissions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-emerald-600" />
                Permissions
              </CardTitle>
              <CardDescription>
                Manage app permissions and access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    Browser Notifications
                    {user?.permissions_notifications ? (
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-400" />
                    )}
                  </Label>
                  <p className="text-sm text-slate-500">
                    Allow browser notifications for message alerts
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestNotificationsPermission}
                  disabled={user?.permissions_notifications}
                >
                  {user?.permissions_notifications ? 'Enabled' : 'Enable'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    WhatsApp Web
                    {user?.whatsapp_connected ? (
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-400" />
                    )}
                  </Label>
                  <p className="text-sm text-slate-500">
                    {user?.whatsapp_connected && user?.whatsapp_phone
                      ? `Connected: ${user.whatsapp_phone}`
                      : 'Connect your WhatsApp account'}
                  </p>
                </div>
                <Button
                  variant={user?.whatsapp_connected ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => {
                    if (user?.whatsapp_connected) {
                      updateUserMutation.mutate({ whatsapp_connected: false, whatsapp_phone: null });
                    } else {
                      window.open('https://web.whatsapp.com', '_blank');
                    }
                  }}
                  className={!user?.whatsapp_connected ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                  {user?.whatsapp_connected ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Management */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-emerald-600" />
                Data Management
              </CardTitle>
              <CardDescription>
                View and manage your stored data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-2xl font-bold text-slate-800">{contacts.length}</p>
                  <p className="text-sm text-slate-500">Contacts</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{messages.length}</p>
                  <p className="text-sm text-slate-500">Messages</p>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    setDeleteType('contacts');
                    setDeleteModalOpen(true);
                  }}
                  disabled={contacts.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All Contacts
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    setDeleteType('messages');
                    setDeleteModalOpen(true);
                  }}
                  disabled={messages.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All Messages
                </Button>

                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={() => {
                    setDeleteType('all');
                    setDeleteModalOpen(true);
                  }}
                  disabled={contacts.length === 0 && messages.length === 0}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Delete All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogOut className="h-5 w-5 text-emerald-600" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium text-slate-800">{user?.email}</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => base44.auth.logout()}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteType(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={deleteModalConfig[deleteType]?.title || 'Delete Data'}
        description={deleteModalConfig[deleteType]?.description || 'Are you sure?'}
        isLoading={
          deleteAllContactsMutation.isPending ||
          deleteAllMessagesMutation.isPending ||
          deleteAllDataMutation.isPending
        }
      />
    </div>
  );
}