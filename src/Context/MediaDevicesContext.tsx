/**
 * @fileoverview React context provider for managing media device access and state across the application.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file serves as a React context provider that centralizes media device management including
 * camera and microphone access, permissions, and stream state. It provides a consistent interface
 * for media device operations across components and manages the lifecycle of media streams.
 * It plays a crucial role in the interview and video testing functionality.
 *
 * @see {@link src/Hooks/useMediaDevices.ts}
 * @see {@link src/Hooks/useMediaDevicesContext.ts}
 *
 * Dependencies:
 * - React
 * - useMediaDevices hook
 */

import React, { createContext, ReactNode } from 'react';
import { useMediaDevices, UseMediaDevicesReturn } from '../Hooks/useMediaDevices';

/**
 * React context for media device state and operations.
 * @constant {React.Context<UseMediaDevicesReturn | undefined>} MediaDevicesContext
 */
const MediaDevicesContext = createContext<UseMediaDevicesReturn | undefined>(undefined);

/**
 * Props interface for the MediaDevicesProvider component.
 * @interface MediaDevicesProviderProps
 * @property {ReactNode} children - Child components that will have access to media device context.
 */
interface MediaDevicesProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the application with media device context.
 *
 * @component
 * @param {MediaDevicesProviderProps} props - Provider configuration props.
 * @param {ReactNode} props.children - Child components to be wrapped with context.
 * @returns {JSX.Element} The context provider with media device state.
 * @example
 * // Usage in main.tsx:
 * <MediaDevicesProvider>
 *   <App />
 * </MediaDevicesProvider>
 *
 * @throws {Error} No errors thrown - this is a pure provider component.
 * @remarks
 * Side Effects: 
 * - Initializes media device state
 * - Sets up device support checking
 * - Manages media stream lifecycle
 *
 * Known Issues/Limitations:
 * - No error boundary for media device failures
 * - Assumes browser supports media devices API
 * - No fallback for unsupported browsers
 *
 * Design Decisions/Rationale:
 * - Uses React context for global state management
 * - Delegates logic to useMediaDevices hook
 * - Provides undefined as default context value
 * - Wraps entire app for consistent access
 */
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
