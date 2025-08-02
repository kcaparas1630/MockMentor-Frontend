import styled from "@emotion/styled";

const TextAreaContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #27272A;
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  min-height: 180px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

  &:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &::placeholder {
    color: #6c757d;
    line-height: 1.4;
  }
`;

const CharCounter = styled.div<{ count: number; maxCount: number }>`
  text-align: right;
  font-size: 12px;
  margin-top: 4px;
  color: ${props => {
    if (props.count > props.maxCount) return '#dc3545';
    if (props.count > props.maxCount * 0.9) return '#ffc107';
    return '#6c757d';
  }};
`;

const StartButton = styled.button<{ enabled: boolean }>`
  background: ${props => props.enabled ? '#28a745' : '#6c757d'};
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: ${props => props.enabled ? 'pointer' : 'not-allowed'};
  width: 100%;
  margin-top: 20px;
  opacity: ${props => props.enabled ? 1 : 0.6};
  transition: all 0.15s ease;

  &:hover {
    background: ${props => props.enabled ? '#218838' : '#6c757d'};
  }
`;

const ClearButton = styled.button`
  background: transparent;
  color: #dc3545;
  border: 1px solid #dc3545;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  margin-left: 8px;
  transition: all 0.15s ease;

  &:hover {
    background: #dc3545;
    color: white;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

const PreviewButton = styled.button`
  background: #17a2b8;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #138496;
  }
`;

const SaveIndicator = styled.span<{ show: boolean }>`
  font-size: 12px;
  color: #28a745;
  opacity: ${props => props.show ? 1 : 0};
  transition: opacity 0.3s ease;
`;

export {
  TextAreaContainer,
  Label,
  TextArea,
  CharCounter,
  StartButton,
  ClearButton,
  ActionsRow,
  PreviewButton,
  SaveIndicator,
};
