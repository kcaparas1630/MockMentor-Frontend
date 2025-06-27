import { useContext } from 'react';
import { MediaDevicesContext } from '../Context/MediaDevicesContext';
import { UseMediaDevicesReturn } from './useMediaDevices';

// Custom hook to use the context
const useMediaDevicesContext = (): UseMediaDevicesReturn => {
  const context = useContext(MediaDevicesContext);
  if (context === undefined) {
    throw new Error('useMediaDevicesContext must be used within a MediaDevicesProvider');
  }
  return context;
}; 

export default useMediaDevicesContext;
