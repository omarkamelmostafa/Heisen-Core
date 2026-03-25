// frontend/src/store/slices/ui/pagination/pagination-selectors.js
export const selectPaginationState = (state) => state.ui.pagination;

export const selectPaginationPages = (state) => state.ui.pagination.pages;
export const selectPaginationLimits = (state) => state.ui.pagination.limits;
export const selectPaginationTotals = (state) => state.ui.pagination.totals;
export const selectPageByContext = (context) => (state) => state.ui.pagination.pages[context];
