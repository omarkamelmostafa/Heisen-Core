import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pages: {},
  limits: {},
  totals: {},
};

const paginationSlice = createSlice({
  name: "ui/pagination",
  initialState,
  reducers: {
    setPage: (state, action) => {
      const { context, page } = action.payload;
      state.pages[context] = page;
    },
    setLimit: (state, action) => {
      const { context, limit } = action.payload;
      state.limits[context] = limit;
    },
    setTotal: (state, action) => {
      const { context, total } = action.payload;
      state.totals[context] = total;
    },
  },
});

export const {
  setPage,
  setLimit,
  setTotal,
} = paginationSlice.actions;

export default paginationSlice.reducer;
