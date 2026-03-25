// frontend/src/store/slices/ui/confirmation/confirmation-selectors.js
export const selectConfirmation = (state) => state.ui.confirmation;
export const selectConfirmationVisible = (state) => state.ui.confirmation.visible;
export const selectConfirmationTitle = (state) => state.ui.confirmation.title;
export const selectConfirmationMessage = (state) => state.ui.confirmation.message;
export const selectConfirmationType = (state) => state.ui.confirmation.type;
