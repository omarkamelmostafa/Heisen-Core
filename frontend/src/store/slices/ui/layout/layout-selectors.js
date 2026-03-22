// Layout selectors
export const selectLayout = (state) => state.ui.layout;
export const selectSidebar = (state) => state.ui.layout.sidebar;
export const selectSidebarCollapsed = (state) => state.ui.layout.sidebar.collapsed;
export const selectSidebarWidth = (state) => state.ui.layout.sidebar.width;
export const selectHeaderVisible = (state) => state.ui.layout.header.visible;
export const selectFooterVisible = (state) => state.ui.layout.footer.visible;

export const selectCurrentSidebarWidth = (state) =>
  state.ui.layout.sidebar.collapsed
    ? state.ui.layout.sidebar.collapsedWidth
    : state.ui.layout.sidebar.width;

export const selectResponsive = (state) => state.ui.layout.responsive;
export const selectScreenSize = (state) => state.ui.layout.responsive.screenSize;
export const selectOrientation = (state) => state.ui.layout.responsive.orientation;
export const selectTouchDevice = (state) => state.ui.layout.responsive.touchDevice;
