import { useEffect } from 'react';

const useKeyboardShortcuts = ({ handleNumberClick, handleOperationClick, handleEquals, handleClear }) => {
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (/[0-9]/.test(e.key)) {
        handleNumberClick(e.key);
      } else {
        switch(e.key) {
          case '+':
          case '-':
            handleOperationClick(e.key);
            break;
          case '*':
            handleOperationClick('×');
            break;
          case '/':
            handleOperationClick('÷');
            break;
          case 'Enter':
            handleEquals();
            break;
          case 'Escape':
            handleClear();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleNumberClick, handleOperationClick, handleEquals, handleClear]);
};

export default useKeyboardShortcuts; 