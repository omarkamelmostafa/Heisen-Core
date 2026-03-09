import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  dirty: {},
  submitting: {},
  errors: {},
};

const formSlice = createSlice({
  name: "ui/form",
  initialState,
  reducers: {
    setFormDirty: (state, action) => {
      const { formId, isDirty } = action.payload;
      state.dirty[formId] = isDirty;
    },
    setFormSubmitting: (state, action) => {
      const { formId, isSubmitting } = action.payload;
      state.submitting[formId] = isSubmitting;
    },
    setFormError: (state, action) => {
      const { formId, error } = action.payload;
      state.errors[formId] = error;
    },
    clearFormState: (state, action) => {
      const formId = action.payload;
      delete state.dirty[formId];
      delete state.submitting[formId];
      delete state.errors[formId];
    },
  },
});

export const {
  setFormDirty,
  setFormSubmitting,
  setFormError,
  clearFormState,
} = formSlice.actions;

export default formSlice.reducer;
