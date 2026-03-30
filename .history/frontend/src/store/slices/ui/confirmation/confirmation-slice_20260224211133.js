import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  visible: false,
  title: "",
  message: "",
  type: "warning", // 'info' | 'warning' | 'danger'
  confirmText: "Confirm",
  cancelText: "Cancel",
  callbackId: null,
};

const confirmationSlice = createSlice({
  name: "ui/confirmation",
  initialState,
  reducers: {
    showConfirmation: (state, action) => {
      return { ...state, visible: true, ...action.payload };
    },
    hideConfirmation: (state) => {
      state.visible = false;
    },
  },
});

export const { showConfirmation, hideConfirmation } =
  confirmationSlice.actions;

export default confirmationSlice.reducer;
