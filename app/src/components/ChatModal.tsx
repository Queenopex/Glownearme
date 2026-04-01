import { useEffect, useRef, useState } from 'react';
import { X, Send, Image as ImageIcon, Phone, MoreVertical, Check, CheckCheck } from 'lucide-react';
import { chatConfig } from '../config';
import { fetchConversations, sendMessage } from '../lib/api';
import gsap from 'gsap';

import type { Artist } from '../config';

interface Message {
  id: string;
  text: string;
  sender: 'client' | 'artist';
  timestamp: Date;
  isRead: boolean;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  artist: Artist | null;
  onConversationUpdated?: () => Promise<void> | void;
}

const ChatModal = ({ isOpen, onClose, artist, onConversationUpdated }: ChatModalProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      gsap.fromTo(
        contentRef.current,
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: 'expo.out', delay: 0.1 },
      );
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !artist) return;

    let isMounted = true;
    const selectedArtist = artist;

    async function loadConversation() {
      try {
        const response = await fetchConversations();
        if (!isMounted) return;

        const conversation = response.data.find((item) => item.artistId === selectedArtist.id);
        setConversationId(conversation?.id);

        if (conversation) {
          setMessages(
            conversation.messages.map((message) => ({
              id: message.id,
              text: message.text,
              sender: message.sender as 'client' | 'artist',
              timestamp: new Date(message.sentAt),
              isRead: message.sender === 'artist',
            })),
          );
        } else {
          setMessages([
            {
              id: 'welcome',
              text: `Hi! I'm ${selectedArtist.name}. How can I help you today?`,
              sender: 'artist',
              timestamp: new Date(),
              isRead: true,
            },
          ]);
        }
      } catch (error) {
        console.error('Failed to load conversation:', error);
        setMessages([
          {
            id: 'welcome',
            text: `Hi! I'm ${selectedArtist.name}. How can I help you today?`,
            sender: 'artist',
            timestamp: new Date(),
            isRead: true,
          },
        ]);
      }
    }

    setErrorMessage('');
    loadConversation();

    return () => {
      isMounted = false;
    };
  }, [isOpen, artist]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleClose = () => {
    gsap.to(contentRef.current, {
      x: 100,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
    });
    gsap.to(modalRef.current, {
      opacity: 0,
      duration: 0.3,
      delay: 0.1,
      ease: 'power2.in',
      onComplete: () => {
        onClose();
        setMessages([]);
        setInputText('');
        setConversationId(undefined);
        setErrorMessage('');
      },
    });
  };

  const handleSend = async () => {
    if (!inputText.trim() || !artist || isSending) return;

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      text: inputText,
      sender: 'client',
      timestamp: new Date(),
      isRead: false,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInputText('');
    setIsSending(true);
    setIsTyping(true);
    setErrorMessage('');

    try {
      await sendMessage<{
        id: string;
        sender: string;
        text: string;
        sentAt: string;
      }>({
        conversationId,
        artistId: artist.id,
        sender: 'client',
        text: optimisticMessage.text,
      });

      const response = await fetchConversations();
      const updatedConversation = response.data.find((item) => item.artistId === artist.id);
      setConversationId(updatedConversation?.id);

      if (updatedConversation) {
        setMessages(
          updatedConversation.messages.map((message) => ({
            id: message.id,
            text: message.text,
            sender: message.sender as 'client' | 'artist',
            timestamp: new Date(message.sentAt),
            isRead: message.sender === 'artist',
          })),
        );
      }

      await onConversationUpdated?.();
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => prev.filter((message) => message.id !== optimisticMessage.id));
      setInputText(optimisticMessage.text);
      setErrorMessage('Message could not be sent right now. Please try again.');
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!isOpen || !artist) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[100] flex items-end justify-end bg-black/60 p-0 opacity-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4"
      onClick={handleClose}
    >
      <div
        ref={contentRef}
        className="relative flex h-[80vh] w-full flex-col overflow-hidden border border-white/10 bg-neutral-900 opacity-0 sm:h-[600px] sm:w-96 sm:max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 bg-neutral-800 p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={artist.image} alt={artist.name} className="h-10 w-10 rounded-full object-cover" />
              <div
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-neutral-800 ${
                  artist.isOnline ? 'bg-green-500' : 'bg-gray-500'
                }`}
              />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-white">{artist.name}</h3>
              <p className="font-body text-xs text-white/50">
                {isTyping ? chatConfig.typingText : artist.isOnline ? chatConfig.onlineText : chatConfig.offlineText}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex h-8 w-8 items-center justify-center text-white/50 transition-colors hover:text-white">
              <Phone className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center text-white/50 transition-colors hover:text-white">
              <MoreVertical className="h-4 w-4" />
            </button>
            <button
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center text-white/50 transition-colors hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink/20">
                <Send className="h-8 w-8 text-pink" />
              </div>
              <p className="font-body text-sm text-white/60">{chatConfig.startConversationText}</p>
            </div>
          ) : null}

          {messages.map((message, index) => {
            const showDate =
              index === 0 || formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

            return (
              <div key={message.id}>
                {showDate ? (
                  <div className="my-4 flex justify-center">
                    <span className="rounded-full bg-white/5 px-3 py-1 font-body text-xs text-white/40">
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                ) : null}
                <div className={`flex ${message.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] px-4 py-2 ${
                      message.sender === 'client' ? 'bg-pink text-black' : 'bg-white/10 text-white'
                    }`}
                  >
                    <p className="font-body text-sm">{message.text}</p>
                    <div
                      className={`mt-1 flex items-center gap-1 ${
                        message.sender === 'client' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span
                        className={`text-xs ${
                          message.sender === 'client' ? 'text-black/60' : 'text-white/40'
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </span>
                      {message.sender === 'client' ? (
                        message.isRead ? (
                          <CheckCheck className="h-3 w-3 text-black/60" />
                        ) : (
                          <Check className="h-3 w-3 text-black/40" />
                        )
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-white/10 bg-neutral-800 p-4">
          <div className="flex items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center text-white/40 transition-colors hover:text-pink">
              <ImageIcon className="h-5 w-5" />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  void handleSend();
                }
              }}
              placeholder={chatConfig.placeholder}
              className="flex-1 border border-white/10 bg-black px-4 py-2 font-body text-white placeholder:text-white/30 transition-colors focus:border-pink focus:outline-none"
            />
            <button
              onClick={() => void handleSend()}
              disabled={!inputText.trim() || isSending}
              className="flex h-10 w-10 items-center justify-center bg-pink text-black transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          {errorMessage ? <p className="mt-3 font-body text-sm text-red-400">{errorMessage}</p> : null}
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
