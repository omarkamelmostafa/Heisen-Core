// frontend/src/store/slices/ui/scroll/scroll-selectors.js
export const selectScroll = (state) => state.ui.scroll;
export const selectScrollPositions = (state) => state.ui.scroll.positions;
export const selectScrollLocked = (state) => state.ui.scroll.locked;

export const selectScrollPosition = (path) => (state) =>
  state.ui.scroll.positions[path] || 0;
