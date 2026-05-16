import React, { createContext, useContext } from 'react';
import { MeetingRole } from '../utils/peerUtils';

export interface MeetingConfig {
  roomId: string;
  title: string;
  subtitle?: string;
  role: MeetingRole;
}

interface MeetingContextValue {
  config: MeetingConfig | null;
}

const MeetingContext = createContext<MeetingContextValue | undefined>(undefined);

export const MeetingProvider: React.FC<{ config: MeetingConfig | null; children: React.ReactNode }> = ({ config, children }) => (
  <MeetingContext.Provider value={{ config }}>
    {children}
  </MeetingContext.Provider>
);

export const useMeetingContext = () => {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error('useMeetingContext must be used inside MeetingProvider');
  }
  return context;
};
