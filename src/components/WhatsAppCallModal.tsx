import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
  RotateCw,
  Lock,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Wrench,
  Camera,
  MessageSquare
} from 'lucide-react';
import { CallType, CallStatus } from '../context/WhatsAppCallContext';
import { sounds } from '../utils/soundEffects';

interface WhatsAppCallModalProps {
  callType: CallType;
  callStatus: CallStatus;
  onEndCall: () => void;
  onSwitchCallType: (type: CallType) => void;
  isMinimized: boolean;
  setIsMinimized: (val: boolean) => void;
}

export const WhatsAppCallModal: React.FC<WhatsAppCallModalProps> = ({
  callType,
  callStatus: initialCallStatus,
  onEndCall,
  onSwitchCallType,
  isMinimized,
  setIsMinimized
}) => {
  const [internalStatus, setInternalStatus] = useState<CallStatus>(initialCallStatus);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isTechnicianSpeaking, setIsTechnicianSpeaking] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Sync internal status with prop
  useEffect(() => {
    setInternalStatus(initialCallStatus);
  }, [initialCallStatus]);

  // Handle WhatsApp Ringtone and connection timing
  useEffect(() => {
    if (internalStatus === 'calling') {
      sounds.startWhatsAppRingtone();

      const connectTimer = setTimeout(() => {
        sounds.stopRingtone();
        sounds.playConnectedSound();
        setInternalStatus('connected');
      }, 3000);

      return () => {
        clearTimeout(connectTimer);
        sounds.stopRingtone();
      };
    } else if (internalStatus === 'ended') {
      sounds.stopRingtone();
      sounds.playHangupSound();
    }
  }, [internalStatus]);

  // Duration Timer
  useEffect(() => {
    let timer: number;
    if (internalStatus === 'connected') {
      timer = window.setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [internalStatus]);

  // Technician voice cadence simulation
  useEffect(() => {
    let cadenceInterval: number;
    if (internalStatus === 'connected') {
      cadenceInterval = window.setInterval(() => {
        setIsTechnicianSpeaking(prev => !prev);
      }, 2500);
    }
    return () => clearInterval(cadenceInterval);
  }, [internalStatus]);

  // Request user camera stream for Video Call PiP
  useEffect(() => {
    if (callType === 'video' && !isVideoMuted && internalStatus !== 'ended') {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: cameraFacing }, audio: false })
        .then(stream => {
          mediaStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          setHasCameraPermission(true);
        })
        .catch(() => {
          setHasCameraPermission(false);
        });
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [callType, isVideoMuted, cameraFacing, internalStatus]);

  const toggleFlipCamera = () => {
    setCameraFacing(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Minimized PiP View
  if (isMinimized) {
    return (
      <div className="fixed bottom-24 right-6 z-50 bg-[#111b21] text-white p-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-fade-in w-72">
        <div className="relative w-12 h-12 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-emerald-500/50 flex items-center justify-center">
          {callType === 'video' ? (
            <Video className="w-5 h-5 text-emerald-400 animate-pulse" />
          ) : (
            <Phone className="w-5 h-5 text-emerald-400" />
          )}
          <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white truncate">Pawan Mobile Lab</p>
          <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{internalStatus === 'connected' ? formatTimer(duration) : 'Calling...'}</span>
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(false)}
            title="Maximize Call"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onEndCall}
            title="End Call"
            className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-lg h-[92vh] sm:h-[650px] bg-[#111b21] rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/30 flex flex-col justify-between">
        {/* WhatsApp Top Navigation Bar */}
        <div className="relative z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 via-black/30 to-transparent text-white">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer"
            title="Minimize to Picture-in-Picture"
          >
            <Minimize2 className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <Lock className="w-3 h-3" />
            <span>End-to-end encrypted</span>
          </div>

          <a
            href="https://wa.me/9779812345678"
            target="_blank"
            rel="noopener noreferrer"
            title="Open in WhatsApp Mobile App"
            className="p-2 rounded-full bg-emerald-600/60 hover:bg-emerald-600 text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Center Calling Area */}
        <div className="relative flex-1 flex flex-col items-center justify-center px-6">
          {/* VIDEO CALL MODE: Live Lab Bench Microscope Stream & User PiP */}
          {callType === 'video' ? (
            <div className="absolute inset-0 z-10 overflow-hidden bg-slate-950 flex items-center justify-center">
              {/* Simulated Live Bench Inspection Video */}
              <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-sky-950">
                {/* Visual circuit board microscope feed overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-25" />

                {/* Microscope reticle & diagnostic HUD */}
                <div className="relative text-center p-6 space-y-3">
                  <div className="relative w-36 h-36 mx-auto rounded-full border-2 border-emerald-500/40 p-2 flex items-center justify-center">
                    <div className="w-full h-full rounded-full border border-sky-400/30 flex items-center justify-center relative">
                      <Smartphone className="w-16 h-16 text-sky-400 animate-pulse" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-full h-0.5 bg-emerald-400/40" />
                        <div className="h-full w-0.5 bg-emerald-400/40 absolute" />
                      </div>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-emerald-500/40 text-emerald-400 text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>LIVE LAB BENCH · PAWAN KUMAR (LEAD TECH)</span>
                  </div>

                  <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                    Point your camera at your phone screen, battery, or charging port for live optical diagnosis.
                  </p>
                </div>

                {/* Self Camera PiP in Top Right */}
                <div className="absolute top-16 right-4 z-20 w-32 h-44 rounded-2xl bg-slate-900 border-2 border-white/40 shadow-2xl overflow-hidden">
                  {!isVideoMuted && hasCameraPermission ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-slate-900 text-slate-400 text-center">
                      <Camera className="w-6 h-6 mb-1 text-slate-500" />
                      <span className="text-[10px]">Your Camera</span>
                      {isVideoMuted && <span className="text-[9px] text-rose-400">Off</span>}
                    </div>
                  )}

                  {/* Flip camera button inside PiP */}
                  <button
                    onClick={toggleFlipCamera}
                    title="Flip Camera"
                    className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 cursor-pointer"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* AUDIO CALL MODE: Authentic WhatsApp Concentric Rings & Equalizer */
            <div className="relative z-10 text-center space-y-6 my-auto">
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Pawan Mobile Workshop
                </h3>
                <p className="text-xs text-slate-400 font-mono">+977 981-2345678</p>
                <p className="text-xs text-emerald-400 font-medium">
                  {internalStatus === 'calling' && 'WhatsApp Audio Calling...'}
                  {internalStatus === 'connected' && `WhatsApp Call · ${formatTimer(duration)}`}
                  {internalStatus === 'ended' && 'Call Ended'}
                </p>
              </div>

              {/* Pulsing Concentric Audio Rings */}
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                {isTechnicianSpeaking && internalStatus === 'connected' && (
                  <>
                    <span className="absolute inset-0 rounded-full border-2 border-emerald-500/40 animate-ping" />
                    <span className="absolute -inset-4 rounded-full border border-emerald-500/20 animate-pulse" />
                  </>
                )}
                {internalStatus === 'calling' && (
                  <span className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-ping" />
                )}

                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                  alt="Pawan Kumar"
                  className="w-32 h-32 rounded-full border-4 border-emerald-500 object-cover shadow-2xl relative z-10"
                />
              </div>

              {/* Dynamic Sound Wave Equalizer Bars */}
              {internalStatus === 'connected' && (
                <div className="flex items-center justify-center gap-1.5 h-6">
                  {[12, 24, 16, 28, 14, 20, 10].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 bg-emerald-400 rounded-full transition-all duration-300"
                      style={{
                        height: isTechnicianSpeaking ? `${h}px` : '4px',
                        opacity: isTechnicianSpeaking ? 1 : 0.4
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating WhatsApp Call Controls Dock */}
        <div className="relative z-20 p-5 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col items-center gap-4">
          {/* Call Controls Dock Container */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 bg-[#202c33]/90 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-2xl">
            {/* Switch Camera Flip */}
            {callType === 'video' && (
              <button
                onClick={toggleFlipCamera}
                title="Flip Camera"
                className="p-3 rounded-full bg-[#111b21] hover:bg-slate-800 text-white transition-transform active:scale-90 cursor-pointer"
              >
                <RotateCw className="w-5 h-5" />
              </button>
            )}

            {/* Video Toggle */}
            <button
              onClick={() => {
                if (callType === 'audio') {
                  onSwitchCallType('video');
                } else {
                  setIsVideoMuted(!isVideoMuted);
                }
              }}
              title={callType === 'video' && !isVideoMuted ? 'Turn off camera' : 'Turn on camera'}
              className={`p-3 rounded-full transition-all cursor-pointer ${
                callType === 'video' && !isVideoMuted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#111b21] hover:bg-slate-800 text-slate-300'
              }`}
            >
              {callType === 'video' && !isVideoMuted ? (
                <Video className="w-5 h-5" />
              ) : (
                <VideoOff className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {/* Mic Mute / Unmute */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              className={`p-3 rounded-full transition-all cursor-pointer ${
                isMuted ? 'bg-rose-600 text-white' : 'bg-[#111b21] hover:bg-slate-800 text-white'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Speakerphone Toggle */}
            <button
              onClick={() => setIsSpeaker(!isSpeaker)}
              title={isSpeaker ? 'Speaker On' : 'Speaker Off'}
              className={`p-3 rounded-full transition-all cursor-pointer ${
                isSpeaker ? 'bg-[#111b21] hover:bg-slate-800 text-white' : 'bg-slate-800 text-slate-500'
              }`}
            >
              {isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Switch between Video and Audio Call */}
            <button
              onClick={() => onSwitchCallType(callType === 'video' ? 'audio' : 'video')}
              title={callType === 'video' ? 'Switch to Audio Call' : 'Switch to Video Call'}
              className="p-3 rounded-full bg-[#111b21] hover:bg-slate-800 text-emerald-400 transition-all cursor-pointer"
            >
              {callType === 'video' ? <Phone className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            {/* Red Hangup Call Button */}
            <button
              onClick={onEndCall}
              title="End Call"
              className="p-3.5 rounded-full bg-[#ea0038] hover:bg-rose-700 text-white shadow-lg shadow-rose-600/40 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Direct Link to WhatsApp Messenger */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Prefer real WhatsApp app?</span>
            <a
              href="https://wa.me/9779812345678?text=Namaste%20Pawan%20Dai,%20I%20need%20mobile%20repair%20diagnosis"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-1"
            >
              <span>Direct WhatsApp Chat</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
