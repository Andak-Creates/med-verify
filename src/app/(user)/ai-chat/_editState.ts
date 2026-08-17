/**
 * Tiny module-level flag to signal that the AI Chat setup screen
 * should open in 'edit' mode (pre-filled, coming from the settings
 * gear in the chat header).
 *
 * Using a module ref avoids passing URL params that can stick around
 * in the tab navigator's history and cause the edit form to show
 * unexpectedly on subsequent tab taps.
 */
export const aiChatEditState = {
  /** Set to true before navigating to the setup screen from chat settings. */
  isEdit: false,
};
