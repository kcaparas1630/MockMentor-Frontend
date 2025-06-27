/**
 * @fileoverview Utility function for formatting a duration in seconds as MM:SS string for interview timers and UI.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file provides a helper function to format a duration in seconds into a MM:SS string, used for displaying timers in the interview room and related components.
 *
 * Plays a crucial role in presenting readable time durations for interview sessions and recordings.
 *
 * @see {@link src/Components/InterviewRoom/InterviewRoom.tsx}
 *
 * Dependencies:
 * - None (pure utility)
 */

/**
 * Formats a duration in seconds as a MM:SS string.
 *
 * @function
 * @param {number} seconds - The duration in seconds to format.
 * @returns {string} The formatted duration as MM:SS.
 * @example
 * formatDuration(75) // "01:15"
 * @remarks
 * Side Effects: None (pure function)
 */
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export default formatDuration;
