export const selectSearchState = (state) => state.ui.search;

export const selectSearchQueries = (state) => state.ui.search.queries;
export const selectSearchFilters = (state) => state.ui.search.filters;
export const selectSearchSort = (state) => state.ui.search.sort;
export const selectSearchQueryByContext = (context) => (state) => state.ui.search.queries[context];
