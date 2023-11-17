import React from 'react';
import { useModal } from '../../context/Modal';

function DeleteConfirmationModal({ onConfirm, onCancel, itemName }) {
  const { closeModal } = useModal();

  const handleConfirm = () => {
    onConfirm();
    closeModal();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    closeModal();
  };

  return (
    <>
      <h1>Confirm Deletion</h1>
      <p>Are you sure you want to delete {itemName}?</p>
      <div>
        <button onClick={handleConfirm}>Confirm</button>
        <button onClick={handleCancel}>Cancel</button>
      </div>
    </>
  );
}

export default DeleteConfirmationModal;
