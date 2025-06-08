import React, { createContext, ReactNode } from 'react';
import { useMediaDevices, UseMediaDevicesReturn } from '../Hooks/useMediaDevices';

// Create the context
const MediaDevicesContext = createContext<UseMediaDevicesReturn | undefined>(undefined);

// Provider component
interface MediaDevicesProviderProps {
  children: ReactNode;
}

export const MediaDevicesProvider: React.FC<MediaDevicesProviderProps> = ({ children }) => {
  const mediaDevices = useMediaDevices();
  
  return (
    <MediaDevicesContext.Provider value={mediaDevices}>
      {children}
    </MediaDevicesContext.Provider>
  );
};

// Export context for use in separate hook file
export { MediaDevicesContext };
