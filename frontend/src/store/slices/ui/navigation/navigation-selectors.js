export const selectNavigationState = (state) => state.ui.navigation;

export const selectLayout = (state) => state.ui.navigation.layout;
export const selectSidebarCollapsed = (state) => state.ui.navigation.layout.sidebar.collapsed;
export const selectCurrentPage = (state) => state.ui.navigation.navigation.currentPage;
export const selectBreadcrumbs = (state) => state.ui.navigation.navigation.breadcrumbs;
export const selectScrollPositions = (state) => state.ui.navigation.scroll.positions;
export const selectGlobalError = (state) => state.ui.navigation.errors.globalError;
