// sgsst.Client/src/components/RegistroDeEmpresa/WelcomeModal.tsx
import React from 'react';
import styles from './WelcomeModal.module.css'; // <-- Importa el módulo CSS

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, userName }) => {
  if (!isOpen) {
    return null;
  }

  return (
    // Usa la clase del módulo CSS para el overlay
    <div className={styles.modalOverlay}>
      {/* Usa la clase del módulo CSS para el contenido del modal */}
      <div className={styles.modalContent}>
        <h2>¡Bienvenido, {userName}!</h2>
        <p>Has iniciado sesión exitosamente en el sistema SGSST.</p>
        <button
          onClick={onClose}
          className={styles.modalButton} // <-- Usa la clase del módulo CSS para el botón
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;