/**
 * Module-level mutable ref shared between TopBar (writer) and
 * GlobalSearchModal (reader).  Using a plain object instead of
 * React.createRef so it is stable across renders and accessible
 * outside the React tree.
 */
export const searchBarRef: { current: HTMLButtonElement | null } = { current: null };
