import { format, isPast, differenceInMinutes } from 'date-fns';
import { Clock, Edit, Trash2, CheckCircle, XCircle, AlertCircle, User, ExternalLink } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const statusConfig = {
  pending: { 
    icon: Clock, 
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    label: 'Scheduled'
  },
  pending_user_action: { 
    icon: AlertCircle, 
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    label: 'Ready to Send'
  },
  sent: { 
    icon: CheckCircle, 
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    label: 'Sent'
  },
  failed: { 
    icon: AlertCircle, 
    color: 'bg-red-100 text-red-700 border-red-200',
    label: 'Failed'
  },
  cancelled: { 
    icon: XCircle, 
    color: 'bg-slate-100 text-slate-600 border-slate-200',
    label: 'Cancelled'
  },
};

export default function MessageCard({ message, onEdit, onDelete, onSendNow }) {
  const scheduledDate = new Date(message.scheduled_time);
  const isPastDue = isPast(scheduledDate);
  const minutesUntil = differenceInMinutes(scheduledDate, new Date());
  const canEdit = message.status === 'pending' || message.status === 'pending_user_action';
  
  const status = statusConfig[message.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  const initials = (message.contact_name || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
    >
      <Card className={cn(
        "p-5 transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg",
        !canEdit && message.status === 'pending' && "opacity-75"
      )}>
        <div className="flex gap-4">
          <Avatar className="h-11 w-11 ring-2 ring-slate-100 flex-shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-800 text-white text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h3 className="font-semibold text-slate-800">{message.contact_name || 'Unknown'}</h3>
                <p className="text-xs text-slate-500">{message.contact_phone}</p>
              </div>
              <Badge variant="outline" className={cn("flex-shrink-0", status.color)}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            
            <p className="text-slate-700 text-sm leading-relaxed mb-3 line-clamp-2">
              {message.message}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5" />
                <span>{format(scheduledDate, "MMM d, yyyy 'at' h:mm a")}</span>
                {canEdit && minutesUntil <= 60 && minutesUntil > 0 && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-xs">
                    {minutesUntil} min left
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {(message.status === 'pending_user_action' || (message.status === 'pending' && isPastDue)) && message.contact_phone && (
                  <Button
                    size="sm"
                    className="h-8 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md"
                    onClick={() => {
                      window.open(`https://wa.me/${message.contact_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message.message)}`, '_blank');
                      if (onSendNow) onSendNow(message);
                    }}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    Send Now
                  </Button>
                )}
                {message.status === 'sent' && message.contact_phone && (
                  <a
                    href={`https://wa.me/${message.contact_phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-3 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      See Chat
                    </Button>
                  </a>
                )}
                {canEdit && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-3 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                      onClick={() => onEdit(message)}
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-3 text-slate-600 hover:text-red-600 hover:bg-red-50"
                      onClick={() => onDelete(message)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}