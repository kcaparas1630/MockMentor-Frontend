/**
 * @fileoverview Custom hook for accessing media device context with error handling and type safety.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file serves as a custom hook that provides safe access to the MediaDevicesContext with
 * proper error handling when used outside of the provider. It ensures type safety and provides
 * clear error messages for development debugging. It plays a crucial role in providing
 * consistent access to media device state across components.
 *
 * @see {@link src/Context/MediaDevicesContext.tsx}
 * @see {@link src/Hooks/useMediaDevices.ts}
 *
 * Dependencies:
 * - React
 * - MediaDevicesContext
 * - UseMediaDevicesReturn type
 */

import { useContext } from 'react';
import { MediaDevicesContext } from '../Context/MediaDevicesContext';
import { UseMediaDevicesReturn } from './useMediaDevices';

/**
 * Custom hook to safely access media device context with error handling.
 *
 * @function
 * @returns {UseMediaDevicesReturn} Media device state and operations.
 * Example Return Value: `{ videoEnabled: true, audioEnabled: false, streamReady: true, ... }`
 * @example
 * // Usage in components:
 * const { videoEnabled, toggleVideo, startStream } = useMediaDevicesContext();
 * 
 * // Check if video is enabled
 * console.log(videoEnabled);
 * 
 * // Toggle video state
 * toggleVideo();
 *
 * @throws {Error} Throws if hook is used outside of MediaDevicesProvider.
 * @remarks
 * Side Effects: None - this is a pure hook that only accesses context.
 *
 * Known Issues/Limitations:
 * - Requires MediaDevicesProvider to be present in component tree
 * - No fallback behavior if context is undefined
 *
 * Design Decisions/Rationale:
 * - Uses React useContext for context access
 * - Provides clear error message for debugging
 * - Ensures type safety with UseMediaDevicesReturn
 * - Follows React hooks naming convention
 */
const useMediaDevicesContext = (): UseMediaDevicesReturn => {
  const context = useContext(MediaDevicesContext);
  if (context === undefined) {
    throw new Error('useMediaDevicesContext must be used within a MediaDevicesProvider');
  }
  return context;
}; 

export default useMediaDevicesContext;
