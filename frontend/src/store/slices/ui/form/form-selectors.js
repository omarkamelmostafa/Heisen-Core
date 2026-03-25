// frontend/src/store/slices/ui/form/form-selectors.js
export const selectFormState = (state) => state.ui.form;

export const selectFormsDirty = (state) => state.ui.form.dirty;
export const selectIsFormDirty = (formId) => (state) => !!state.ui.form.dirty[formId];
export const selectFormsSubmitting = (state) => state.ui.form.submitting;
export const selectIsFormSubmitting = (formId) => (state) => !!state.ui.form.submitting[formId];
