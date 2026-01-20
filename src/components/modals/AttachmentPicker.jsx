import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { 
  Image, 
  Video, 
  FileText, 
  User, 
  Smile, 
  Sticker,
  X,
  Loader2,
  Paperclip
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const EMOJI_LIST = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
  '😉', '😍', '🥰', '😘', '😗', '😋', '😛', '😜', '🤪', '😎',
  '🤩', '🥳', '😏', '😒', '😔', '😢', '😭', '😤', '😠', '🤯',
  '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
  '👋', '🤚', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟',
  '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👍', '👎', '✊',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '🔥', '✨',
  '⭐', '🌟', '💫', '🎉', '🎊', '🎁', '🎂', '🍰', '🎈', '🎀'
];

const GIF_PLACEHOLDERS = [
  { id: 1, url: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif', name: 'Thumbs up' },
  { id: 2, url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', name: 'Celebration' },
  { id: 3, url: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif', name: 'Thank you' },
  { id: 4, url: 'https://media.giphy.com/media/l41lGvinEgARjB2HC/giphy.gif', name: 'Hello' },
  { id: 5, url: 'https://media.giphy.com/media/KJ1f5iTl4Oo7u/giphy.gif', name: 'Bye' },
  { id: 6, url: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', name: 'Love' },
];

const STICKER_PLACEHOLDERS = [
  '🎉', '🎊', '🎁', '🎈', '🎀', '🏆', '🥇', '🌈', '☀️', '🌙',
  '⭐', '💫', '✨', '🔥', '💥', '💢', '💯', '💤', '💬', '👁️‍🗨️'
];

export default function AttachmentPicker({ onEmojiSelect, onAttachment, attachments = [], onRemoveAttachment }) {
  const [activeTab, setActiveTab] = useState('emoji');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onAttachment({
        type,
        url: file_url,
        name: file.name,
        size: file.size,
      });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const attachmentTypes = [
    { id: 'photo', icon: Image, label: 'Photo', accept: 'image/*' },
    { id: 'video', icon: Video, label: 'Video', accept: 'video/*' },
    { id: 'file', icon: FileText, label: 'File', accept: '*/*' },
    { id: 'contact', icon: User, label: 'Contact', accept: null },
  ];

  return (
    <div className="space-y-3">
      {/* Attachment toolbar */}
      <div className="flex items-center gap-1 flex-wrap">
        {/* Emoji picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Smile className="h-4 w-4 text-slate-500" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-2" align="start">
            <div className="space-y-2">
              <div className="flex gap-1 border-b pb-2">
                <Button
                  type="button"
                  variant={activeTab === 'emoji' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('emoji')}
                  className="text-xs"
                >
                  <Smile className="h-3 w-3 mr-1" /> Emoji
                </Button>
                <Button
                  type="button"
                  variant={activeTab === 'gif' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('gif')}
                  className="text-xs"
                >
                  GIF
                </Button>
                <Button
                  type="button"
                  variant={activeTab === 'sticker' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('sticker')}
                  className="text-xs"
                >
                  <Sticker className="h-3 w-3 mr-1" /> Sticker
                </Button>
              </div>

              {activeTab === 'emoji' && (
                <div className="grid grid-cols-10 gap-1 max-h-48 overflow-auto">
                  {EMOJI_LIST.map((emoji, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onEmojiSelect(emoji)}
                      className="text-lg hover:bg-slate-100 rounded p-1 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'gif' && (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto">
                  {GIF_PLACEHOLDERS.map((gif) => (
                    <button
                      key={gif.id}
                      type="button"
                      onClick={() => onAttachment({ type: 'gif', url: gif.url, name: gif.name })}
                      className="rounded-lg overflow-hidden hover:ring-2 ring-emerald-400 transition-all"
                    >
                      <img src={gif.url} alt={gif.name} className="w-full h-20 object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'sticker' && (
                <div className="grid grid-cols-5 gap-2 max-h-48 overflow-auto">
                  {STICKER_PLACEHOLDERS.map((sticker, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onAttachment({ type: 'sticker', content: sticker })}
                      className="text-2xl hover:bg-slate-100 rounded-lg p-2 transition-colors"
                    >
                      {sticker}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* File attachments */}
        {attachmentTypes.map((type) => (
          <div key={type.id}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                if (type.accept) {
                  fileInputRef.current.accept = type.accept;
                  fileInputRef.current.dataset.type = type.id;
                  fileInputRef.current.click();
                }
              }}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 text-slate-500 animate-spin" />
              ) : (
                <type.icon className="h-4 w-4 text-slate-500" />
              )}
            </Button>
          </div>
        ))}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFileSelect(e, fileInputRef.current.dataset.type)}
        />
      </div>

      {/* Attached items preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((attachment, index) => (
            <div
              key={index}
              className="relative group bg-slate-100 rounded-lg overflow-hidden"
            >
              {attachment.type === 'photo' || attachment.type === 'gif' ? (
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="h-16 w-16 object-cover"
                />
              ) : attachment.type === 'sticker' ? (
                <div className="h-16 w-16 flex items-center justify-center text-2xl bg-slate-50">
                  {attachment.content}
                </div>
              ) : (
                <div className="h-16 w-16 flex flex-col items-center justify-center p-2">
                  {attachment.type === 'video' ? (
                    <Video className="h-5 w-5 text-slate-500" />
                  ) : (
                    <FileText className="h-5 w-5 text-slate-500" />
                  )}
                  <span className="text-xs text-slate-500 truncate w-full text-center mt-1">
                    {attachment.name?.slice(0, 8)}...
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => onRemoveAttachment(index)}
                className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}