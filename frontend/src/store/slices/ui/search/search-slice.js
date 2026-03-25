// frontend/src/store/slices/ui/search/search-slice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  queries: {},
  filters: {},
  sort: {},
};

const searchSlice = createSlice({
  name: "ui/search",
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      const { context, query } = action.payload;
      state.queries[context] = query;
    },
    setFilters: (state, action) => {
      const { context, filters } = action.payload;
      state.filters[context] = filters;
    },
    setSort: (state, action) => {
      const { context, field, order } = action.payload;
      state.sort[context] = { field, order };
    },
    clearSearch: (state, action) => {
      const context = action.payload;
      delete state.queries[context];
      delete state.filters[context];
      delete state.sort[context];
    },
  },
});

export const {
  setSearchQuery,
  setFilters,
  setSort,
  clearSearch,
} = searchSlice.actions;

export default searchSlice.reducer;
