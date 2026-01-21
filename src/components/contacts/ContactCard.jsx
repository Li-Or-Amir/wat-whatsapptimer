import { Star, Phone, MoreVertical, Trash2, Edit, ExternalLink } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function ContactCard({ contact, onSchedule, onEdit, onDelete, onToggleFavorite }) {
  const initials = contact.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
    >
      <Card className="p-4 hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 ring-2 ring-emerald-100">
            <AvatarImage src={contact.avatar_url} alt={contact.name} />
            <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 truncate">{contact.name}</h3>
              {contact.is_favorite && (
                <Star className="h-4 w-4 fill-amber-400 text-amber-400 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {contact.phone_number}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
              onClick={() => onSchedule(contact)}
              title="New Message"
            >
              {/* App logo style bubble with clock */}
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
                className="h-9 w-9 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                title="See Chat"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400 hover:text-slate-600">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onToggleFavorite(contact)} className="cursor-pointer">
                  <Star className={cn("h-4 w-4 mr-2", contact.is_favorite && "fill-amber-400 text-amber-400")} />
                  {contact.is_favorite ? 'Unfavorite' : 'Favorite'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(contact)} className="cursor-pointer">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(contact)} 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}