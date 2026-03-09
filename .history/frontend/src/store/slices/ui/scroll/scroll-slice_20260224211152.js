import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  positions: {}, // { '/page': 250 }
  locked: false,
};

const scrollSlice = createSlice({
  name: "ui/scroll",
  initialState,
  reducers: {
    setScrollPosition: (state, action) => {
      const { path, position } = action.payload;
      state.positions[path] = position;
    },
    setScrollLock: (state, action) => {
      state.locked = action.payload;
    },
  },
});

export const { setScrollPosition, setScrollLock } = scrollSlice.actions;

export default scrollSlice.reducer;
