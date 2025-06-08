import styled from "@emotion/styled";

// Audio status indicator for non-user video
export const AudioStatusIndicator = styled.aside`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
`;

// Required indicators container for user video
export const RequiredIndicatorsContainer = styled.aside`
  position: absolute;
  bottom: 0.75rem;
  left: 0.75rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

// Icon wrapper for disabled states
export const DisabledIconWrapper = styled.span`
  display: flex;
  align-items: center;
  gap: 2px;
`;

// Required label
export const RequiredLabel = styled.span`
  margin-left: 0.25rem;
  font-size: 0.625rem;
`;

// X icon for disabled states
export const DisabledIcon = styled.span`
  color: #ef4444;
`;

// Placeholder text styles
export const PlaceholderText = styled.p`
  font-size: 0.875rem;
  margin: 0;
`;

export const PlaceholderError = styled.p`
  font-size: 0.75rem;
  margin: 0.5rem 0 0 0;
  color: #ef4444;
`;
