import React from 'react';
import { useModal } from '../../context/Modal';
import { deleteSelectedGroup } from "../../store/group";
import { deleteSelectedEvent } from "../../store/event";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";


function DeleteConfirmationModal({ entityType }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const { closeModal } = useModal();

  const entityData = useSelector((state) => (
    entityType === 'group' ? state.groups.currGroup : state.events.currEvent
  ));

  const handleConfirm = async () => {
    if (entityType === 'group') {
      await dispatch(deleteSelectedGroup(entityData.id));
      history.push(`/groups`);
    } else if (entityType === 'event') {
      await dispatch(deleteSelectedEvent(entityData.id));
      history.push(`/events`);
    }
    closeModal();
  }

  const handleCancel = () => {
    closeModal();
  };

  return (
    <>
      <h1>Confirm Deletion</h1>

      <p>Are you sure you want to delete this {entityType}?</p>
      <div className='Confirm-Deletion-Buttons'>
        <button onClick={handleConfirm}>Yes (Delete {entityType})</button>
        <button onClick={handleCancel}>No (Keep {entityType})</button>
      </div>
    </>
  );
}

export default DeleteConfirmationModal;
