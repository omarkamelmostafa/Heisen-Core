export const selectModalState = (state) => state.ui.modal;

export const selectActiveModals = (state) => state.ui.modal.active;
export const selectIsModalOpen = (modalId) => (state) =>
  state.ui.modal.active.some((modal) => modal.id === modalId);
export const selectConfirmation = (state) => state.ui.modal.confirmation;
export const selectIsConfirmationVisible = (state) => state.ui.modal.confirmation.visible;
