import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WhatsAppCallModal } from '../components/WhatsAppCallModal';

export type CallType = 'audio' | 'video';
export type CallStatus = 'idle' | 'calling' | 'connected' | 'ended';

interface WhatsAppCallContextType {
  isCallOpen: boolean;
  callType: CallType;
  callStatus: CallStatus;
  startCall: (type: CallType) => void;
  endCall: () => void;
  switchCallType: (type: CallType) => void;
  isMinimized: boolean;
  setIsMinimized: (val: boolean) => void;
}

const WhatsAppCallContext = createContext<WhatsAppCallContextType | undefined>(undefined);

export const WhatsAppCallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [callType, setCallType] = useState<CallType>('video');
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [isMinimized, setIsMinimized] = useState(false);

  const startCall = (type: CallType) => {
    setCallType(type);
    setIsCallOpen(true);
    setCallStatus('calling');
    setIsMinimized(false);
  };

  const endCall = () => {
    setCallStatus('ended');
    setTimeout(() => {
      setIsCallOpen(false);
      setCallStatus('idle');
      setIsMinimized(false);
    }, 1200);
  };

  const switchCallType = (type: CallType) => {
    setCallType(type);
  };

  return (
    <WhatsAppCallContext.Provider
      value={{
        isCallOpen,
        callType,
        callStatus,
        startCall,
        endCall,
        switchCallType,
        isMinimized,
        setIsMinimized
      }}
    >
      {children}
      {isCallOpen && (
        <WhatsAppCallModal
          callType={callType}
          callStatus={callStatus}
          onEndCall={endCall}
          onSwitchCallType={switchCallType}
          isMinimized={isMinimized}
          setIsMinimized={setIsMinimized}
        />
      )}
    </WhatsAppCallContext.Provider>
  );
};

export const useWhatsAppCall = (): WhatsAppCallContextType => {
  const context = useContext(WhatsAppCallContext);
  if (!context) {
    throw new Error('useWhatsAppCall must be used within a WhatsAppCallProvider');
  }
  return context;
};
