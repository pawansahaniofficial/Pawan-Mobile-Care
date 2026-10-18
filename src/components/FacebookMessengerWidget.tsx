import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Phone,
  Video,
  X,
  Minus,
  Send,
  Image as ImageIcon,
  Mic,
  Smile,
  Check,
  CheckCheck,
  PhoneCall,
  PhoneOff,
  Volume2,
  VolumeX,
  MicOff,
  Sparkles,
  ChevronDown,
  Paperclip,
  ExternalLink,
  ShieldCheck,
  Clock,
  MapPin
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface Message {
  id: string;
  sender: 'customer' | 'technician';
  text: string;
  time: string;
  image?: string;
  isVoiceNote?: boolean;
  voiceDuration?: string;
  status: 'sent' | 'delivered' | 'read';
}

interface FacebookMessengerWidgetProps {
  onNavigate?: (page: string, params?: any) => void;
}

export const FacebookMessengerWidget: React.FC<FacebookMessengerWidgetProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [showGreetingBubble, setShowGreetingBubble] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Calling state
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [callType, setCallType] = useState<'audio' | 'video'>('audio');

  // Input & Messages
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-01',
      sender: 'technician',
      text: 'Namaste! Welcome to Pawan Mobile Repairing Center 🙏 How can I assist you with your smartphone today?',
      time: 'Just now',
      status: 'read'
    },
    {
      id: 'msg-02',
      sender: 'technician',
      text: 'You can ask for instant repair cost estimates, book a technician, or click the Call button above to speak with Pawan Dai directly!',
      time: 'Just now',
      status: 'read'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isTyping]);

  // Call timer effect
  useEffect(() => {
    let timer: number;
    if (callState === 'connected') {
      timer = window.setInterval(() => {
        setCallDuration(d => d + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  // When call starts, play ringtone and simulate pickup
  useEffect(() => {
    if (callState === 'calling') {
      setCallDuration(0);
      sounds.startRingtone();

      const pickupTimer = setTimeout(() => {
        sounds.stopRingtone();
        sounds.playConnectedSound();
        setCallState('connected');
      }, 3500);

      return () => {
        clearTimeout(pickupTimer);
        sounds.stopRingtone();
      };
    }
  }, [callState]);

  // Format call duration MM:SS
  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const startVoiceCall = (type: 'audio' | 'video' = 'audio') => {
    setCallType(type);
    setCallState('calling');
  };

  const endCall = () => {
    sounds.stopRingtone();
    sounds.playHangupSound();
    setCallState('ended');
    setTimeout(() => {
      setCallState('idle');
      setCallDuration(0);
    }, 1500);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
    setShowGreetingBubble(false);
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    sounds.playSendSound();

    const newMsg: Message = {
      id: 'cust-' + Date.now(),
      sender: 'customer',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Simulate technician typing and smart automated reply
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      sounds.playReceiveSound();

      let replyText = '';
      const lower = text.toLowerCase();

      if (lower.includes('screen') || lower.includes('display') || lower.includes('glass')) {
        replyText =
          'For screen replacements, we provide 100% genuine OEM AMOLED / IPS panels with a 180-day warranty! Standard repair takes just 30 to 45 minutes. What is your phone model (e.g. iPhone 13, Galaxy S23, Redmi Note 12)?';
      } else if (lower.includes('battery') || lower.includes('drain') || lower.includes('charging')) {
        replyText =
          'Battery drainage issues are typically resolved with our Grade-A high capacity battery swap in 20 minutes (NPR 1,200 - 3,500 depending on model). Charging port pins can also be micro-soldered for NPR 600 - 1,200.';
      } else if (lower.includes('water') || lower.includes('liquid') || lower.includes('dead') || lower.includes('motherboard')) {
        replyText =
          '⚠️ Water damage emergency: Please DO NOT plug your phone into a charger! Bring it immediately to our Biratnagar shop or schedule emergency courier pickup so we can treat it with our ultrasonic cleaning tank and recover your data.';
      } else if (lower.includes('price') || lower.includes('cost') || lower.includes('rate') || lower.includes('kati')) {
        replyText =
          'Our diagnosis is 100% free! Transparent estimates: Screens from NPR 1,800, Batteries from NPR 1,200, Charging Ports from NPR 600, Motherboard BGA from NPR 2,500. You only pay after you approve the SMS quote!';
      } else if (lower.includes('location') || lower.includes('where') || lower.includes('shop') || lower.includes('address')) {
        replyText =
          '📍 Pawan Mobile Repairing Center is located on Main Road, Biratnagar, Nepal (near Central Market). Open 9:00 AM to 8:00 PM daily. We also offer doorstep courier pickup across Kathmandu Valley and Nepal!';
      } else {
        replyText =
          'Thank you for your message! Pawan Dai or one of our senior technicians is reviewing your request. You can also call us directly at +977-9812345678 or tap the Call button above!';
      }

      const replyMsg: Message = {
        id: 'tech-' + Date.now(),
        sender: 'technician',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
      };

      setMessages(prev => [...prev, replyMsg]);
    }, 1800);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      sounds.playSendSound();
      const newMsg: Message = {
        id: 'cust-img-' + Date.now(),
        sender: 'customer',
        text: 'Photo of smartphone damage for diagnosis:',
        image: reader.result as string,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent'
      };
      setMessages(prev => [...prev, newMsg]);

      // Technician response to photo
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        sounds.playReceiveSound();
        const replyMsg: Message = {
          id: 'tech-photo-reply-' + Date.now(),
          sender: 'technician',
          text: 'Thank you for the photo! Our technician is inspecting the damage under magnification. Looks repairable with genuine spare parts in ~40 minutes. Would you like to book a repair slot?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read'
        };
        setMessages(prev => [...prev, replyMsg]);
      }, 2200);
    };
    reader.readAsDataURL(file);
  };

  const quickPrompts = [
    '📱 Cracked Screen Cost?',
    '🔋 Fast Battery Drain',
    '⚡ Water Damage Help',
    '📍 Shop Location & Hours',
    '🚚 Doorstep Pickup'
  ];

  return (
    <>
      {/* Floating Messenger Launcher Button & Unread Bubble */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end">
        {/* Messenger Greeting Bubble Popup */}
        {showGreetingBubble && !isOpen && (
          <div className="mb-2 max-w-xs bg-white dark:bg-slate-900 rounded-2xl p-3.5 shadow-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 animate-bounce relative flex items-start gap-2.5">
            <button
              onClick={e => {
                e.stopPropagation();
                setShowGreetingBubble(false);
              }}
              className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
              P
            </div>
            <div>
              <p className="font-bold text-sky-600 dark:text-sky-400">
                Pawan Dai · Master Technician
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                Namaste! Need quick repair advice or price quote? Tap to chat or call live!
              </p>
            </div>
          </div>
        )}

        {/* Facebook Messenger Floating Circle Icon */}
        {!isOpen && (
          <button
            onClick={handleOpen}
            aria-label="Open Facebook Messenger Support & Live Call"
            className="group relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#0084FF] via-[#0099FF] to-[#A033FF] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer ring-4 ring-sky-400/20"
          >
            {/* Pulsing ring animation */}
            <span className="absolute inset-0 rounded-full bg-[#0084FF] animate-ping opacity-25 pointer-events-none" />

            {/* Messenger SVG Logo Icon */}
            <svg
              className="w-7 h-7 drop-shadow-md"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.477 2 2 6.145 2 11.259c0 2.913 1.454 5.512 3.726 7.202V22l3.394-1.863c.915.253 1.884.39 2.88.39 5.523 0 10-4.145 10-9.259C22 6.145 17.523 2 12 2zm1.066 12.443l-2.556-2.727-4.99 2.727 5.485-5.823 2.617 2.727 4.929-2.727-5.485 5.823z" />
            </svg>

            {/* Active Green Dot */}
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />

            {/* Unread Counter Badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shadow-md animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Main Facebook Messenger Chat Window & Call Modal */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ${
            isMinimized
              ? 'bottom-20 sm:bottom-6 right-4 sm:right-6 w-72 h-14 rounded-2xl shadow-xl'
              : 'bottom-0 sm:bottom-6 right-0 sm:right-6 w-full sm:w-96 sm:max-w-[400px] h-[85vh] sm:h-[560px] rounded-none sm:rounded-3xl shadow-2xl'
          } bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden`}
        >
          {/* Messenger Top Header */}
          <div className="bg-gradient-to-r from-[#0084FF] to-[#0066CC] text-white p-3.5 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Pawan Kumar"
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold leading-tight flex items-center gap-1">
                  <span>Pawan Mobile Care</span>
                  <span className="text-[10px] bg-white/20 px-1 rounded-sm">Official</span>
                </h3>
                <p className="text-[10px] text-sky-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  <span>Active Now · Pawan Dai</span>
                </p>
              </div>
            </div>

            {/* Quick Call Actions and Window Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => startVoiceCall('audio')}
                title="Start Voice Call"
                className="p-2 rounded-full hover:bg-white/20 transition-colors cursor-pointer text-white"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => startVoiceCall('video')}
                title="Start Video Diagnostic Call"
                className="p-2 rounded-full hover:bg-white/20 transition-colors cursor-pointer text-white"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand Chat' : 'Minimize'}
                className="p-2 rounded-full hover:bg-white/20 transition-colors cursor-pointer text-white"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Messenger"
                className="p-2 rounded-full hover:bg-white/20 transition-colors cursor-pointer text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* If Window is Not Minimized */}
          {!isMinimized && (
            <>
              {/* Active Call In-Progress Screen Overlay */}
              {callState !== 'idle' && (
                <div className="absolute inset-0 z-30 bg-gradient-to-b from-slate-950 via-slate-900 to-sky-950 text-white flex flex-col justify-between p-6">
                  {/* Top Call Status */}
                  <div className="text-center pt-4 space-y-1">
                    <span className="text-[11px] font-mono tracking-widest uppercase text-sky-400">
                      {callType === 'video' ? 'LIVE VIDEO BENCH' : 'MESSENGER AUDIO CALL'}
                    </span>
                    <h4 className="text-lg font-bold">Pawan Kumar (Shop Owner)</h4>
                    <p className="text-xs text-slate-400">
                      {callState === 'calling' && 'Ringing Pawan Mobile Lab...'}
                      {callState === 'connected' && `Call in progress · ${formatDuration(callDuration)}`}
                      {callState === 'ended' && 'Call Ended'}
                    </p>
                  </div>

                  {/* Center Technician Avatar with Pulsing Waves */}
                  <div className="relative my-auto flex flex-col items-center">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      {callState === 'calling' && (
                        <>
                          <span className="absolute inset-0 rounded-full border-2 border-sky-400/40 animate-ping" />
                          <span className="absolute -inset-3 rounded-full border border-sky-400/20 animate-pulse" />
                        </>
                      )}
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                        alt="Pawan Kumar"
                        className="w-24 h-24 rounded-full border-4 border-sky-500 object-cover shadow-2xl relative z-10"
                      />
                    </div>

                    <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>HD Encrypted Voice · Nepal Telecom & Khalti Verified</span>
                    </div>

                    {/* Direct phone fallback link */}
                    <a
                      href="tel:+977-9812345678"
                      className="mt-2 text-[11px] text-sky-300 underline hover:text-white flex items-center gap-1"
                    >
                      <span>Prefer Direct Phone Dial (+977-9812345678)?</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Call Control Buttons */}
                  <div className="flex items-center justify-center gap-6 pb-6">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                        isMuted ? 'bg-rose-500/80 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      }`}
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={endCall}
                      className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                      title="End Call"
                    >
                      <PhoneOff className="w-7 h-7" />
                    </button>

                    <button
                      onClick={() => setIsSpeaker(!isSpeaker)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                        !isSpeaker ? 'bg-amber-500/80 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      }`}
                      title="Toggle Speaker"
                    >
                      {isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Chat Message Thread */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50 dark:bg-slate-950/60">
                {/* Notice banner */}
                <div className="text-center py-1">
                  <span className="text-[10px] text-slate-400 bg-slate-200/60 dark:bg-slate-800/60 px-2.5 py-0.5 rounded-full font-mono">
                    Facebook Messenger Live Support · Biratnagar / Kathmandu
                  </span>
                </div>

                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'customer' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                        msg.sender === 'customer'
                          ? 'bg-[#0084FF] text-white rounded-br-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-200 dark:border-slate-700/60'
                      }`}
                    >
                      {msg.image && (
                        <div className="mb-2 rounded-xl overflow-hidden border border-white/20">
                          <img
                            src={msg.image}
                            alt="Uploaded problem"
                            className="w-full max-h-48 object-cover"
                          />
                        </div>
                      )}
                      <p>{msg.text}</p>
                    </div>

                    <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-400">
                      <span>{msg.time}</span>
                      {msg.sender === 'customer' && (
                        <CheckCheck className="w-3 h-3 text-[#0084FF]" />
                      )}
                    </div>
                  </div>
                ))}

                {/* Technician typing indicator */}
                {isTyping && (
                  <div className="flex items-center gap-1.5 p-2 rounded-2xl bg-white dark:bg-slate-800 max-w-[70px] border border-slate-200 dark:border-slate-700">
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Action Suggestion Pills (Facebook Messenger Style) */}
              <div className="p-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/60 text-slate-700 dark:text-slate-300 hover:text-sky-600 text-[11px] font-medium border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Bottom Input Area */}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
              >
                {/* Photo Upload Attachment */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach Photo of Broken Phone"
                  className="p-2 text-slate-500 hover:text-[#0084FF] transition-colors cursor-pointer rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                {/* Direct Dial WhatsApp Shortcut */}
                <a
                  href="https://wa.me/9779812345678"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Chat directly on WhatsApp"
                  className="p-2 text-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                >
                  <PhoneCall className="w-4 h-4" />
                </a>

                {/* Text Input */}
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Type a message or issue..."
                  className="flex-1 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0084FF]"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2 rounded-xl bg-[#0084FF] hover:bg-[#0070D6] disabled:opacity-40 text-white transition-all cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};
