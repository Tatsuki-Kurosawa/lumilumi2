import React, { useState } from 'react';
import SignUpModal from './SignUpModal';
import NewLoginModal from './NewLoginModal';

interface AuthModalsProps {
  showLogin: boolean;
  showSignUp: boolean;
  onClose: () => void;
}

const AuthModals: React.FC<AuthModalsProps> = ({ 
  showLogin, 
  showSignUp, 
  onClose 
}) => {
  const [currentModal, setCurrentModal] = useState<'login' | 'signup' | null>(
    showLogin ? 'login' : showSignUp ? 'signup' : null
  );

  const handleClose = () => {
    setCurrentModal(null);
    onClose();
  };

  const switchToLogin = () => {
    setCurrentModal('login');
  };

  const switchToSignUp = () => {
    setCurrentModal('signup');
  };

  // 外部から状態が変更された場合の同期
  React.useEffect(() => {
    if (showLogin && currentModal !== 'login') {
      setCurrentModal('login');
    } else if (showSignUp && currentModal !== 'signup') {
      setCurrentModal('signup');
    } else if (!showLogin && !showSignUp && currentModal) {
      setCurrentModal(null);
    }
  }, [showLogin, showSignUp, currentModal]);

  if (currentModal === 'login') {
    return (
      <NewLoginModal
        onClose={handleClose}
        onSwitchToSignUp={switchToSignUp}
      />
    );
  }

  if (currentModal === 'signup') {
    return (
      <SignUpModal
        onClose={handleClose}
        onSwitchToLogin={switchToLogin}
      />
    );
  }

  return null;
};

export default AuthModals;