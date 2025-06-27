/**
 * @fileoverview Google brand icon component for OAuth authentication buttons.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file serves as a reusable Google brand icon component that displays the official
 * Google logo in SVG format. It provides consistent branding for Google OAuth buttons
 * and maintains the official Google brand guidelines. It plays a crucial role in
 * authentication UI consistency and brand recognition.
 *
 * @see {@link src/Components/Auth/LoginForm.tsx}
 * @see {@link src/Components/Auth/SignUpForm.tsx}
 *
 * Dependencies:
 * - React
 */

import React from "react";

/**
 * Google brand icon component for OAuth authentication.
 *
 * @component
 * @returns {JSX.Element} The rendered Google logo SVG.
 * @example
 * // Usage in authentication buttons:
 * <GoogleButton>
 *   <GoogleIcon />
 *   Sign in with Google
 * </GoogleButton>
 *
 * @throws {Error} No errors thrown - this is a pure SVG component.
 * @remarks
 * Side Effects: None - this is a pure component that only renders SVG elements.
 *
 * Known Issues/Limitations:
 * - Fixed size (18x18 pixels)
 * - No color customization
 * - No accessibility features
 *
 * Design Decisions/Rationale:
 * - Uses official Google brand colors
 * - Implements SVG for crisp scaling
 * - Follows Google brand guidelines
 * - Provides consistent icon across app
 */
const GoogleIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 48 48"
  >
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
    />
    <path
      fill="#FF3D00"
      d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
    />
  </svg>
);

export default GoogleIcon;
