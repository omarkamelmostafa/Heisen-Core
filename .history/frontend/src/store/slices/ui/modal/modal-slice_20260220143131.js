import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  active: [],
  history: [],
  confirmation: {
    visible: false,
    title: "",
    message: "",
    type: "warning",
    confirmText: "Confirm",
    cancelText: "Cancel",
    callbackId: null,
  },
};

const modalSlice = createSlice({
  name: "ui/modal",
  initialState,
  reducers: {
    openModal: (state, action) => {
      const { id, props = {} } = action.payload;
      state.active.push({ id, props });
      state.history.push({ id, timestamp: Date.now() });
    },
    closeModal: (state, action) => {
      const modalId = action.payload;
      state.active = state.active.filter((modal) => modal.id !== modalId);
    },
    closeAllModals: (state) => {
      state.active = [];
    },
    closeLastModal: (state) => {
      state.active.pop();
    },
    showConfirmation: (state, action) => {
      state.confirmation = {
        ...state.confirmation,
        visible: true,
        ...action.payload,
      };
    },
    hideConfirmation: (state) => {
      state.confirmation.visible = false;
    },
  },
});

export const {
  openModal,
  closeModal,
  closeAllModals,
  closeLastModal,
  showConfirmation,
  hideConfirmation,
} = modalSlice.actions;

export default modalSlice.reducer;
