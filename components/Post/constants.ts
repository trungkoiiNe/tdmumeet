// Post visibility options
export const VISIBILITY_OPTIONS = ["public", "team", "private"];

// Tag options
export const TAG_OPTIONS = ["math", "science", "discussion", "news", "event"];

// Initial post form state
export const INITIAL_POST_STATE = {
  title: "",
  content: "",
  tags: [],
  visibility: "team",
  imageBase64: "",
  attachmentUrls: [],
};

// Helper function to get visibility icon
export const getVisibilityIcon = (visibility) => {
  switch (visibility) {
    case 'public': return '🌐';
    case 'team': return '👥';
    case 'private': return '🔒';
    default: return '👥';
  }
};

console.log("Created posts/constants.js");