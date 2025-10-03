// Constants for the ProjectsWorking component

export const PROJECT_TYPES = {
  RESIDENTIAL: 'Residential',
  COMMERCIAL: 'Commercial'
};

export const CONSTRUCTION_STATUS = {
  UNDER_CONSTRUCTION: 'UnderConstruction',
  READY_TO_MOVE: 'ReadyToMove'
};

export const CONSTRUCTION_STATUS_LABELS = {
  [CONSTRUCTION_STATUS.UNDER_CONSTRUCTION]: 'Under Construction',
  [CONSTRUCTION_STATUS.READY_TO_MOVE]: 'Ready to Move'
};

export const PROJECT_TYPE_OPTIONS = [
  { value: PROJECT_TYPES.RESIDENTIAL, label: PROJECT_TYPES.RESIDENTIAL },
  { value: PROJECT_TYPES.COMMERCIAL, label: PROJECT_TYPES.COMMERCIAL }
];

export const CONSTRUCTION_STATUS_OPTIONS = [
  { value: CONSTRUCTION_STATUS.UNDER_CONSTRUCTION, label: CONSTRUCTION_STATUS_LABELS[CONSTRUCTION_STATUS.UNDER_CONSTRUCTION] },
  { value: CONSTRUCTION_STATUS.READY_TO_MOVE, label: CONSTRUCTION_STATUS_LABELS[CONSTRUCTION_STATUS.READY_TO_MOVE] }
];

export const DEFAULT_FILTERS = {
  projectType: PROJECT_TYPES.COMMERCIAL,
  constructionStatus: CONSTRUCTION_STATUS.READY_TO_MOVE
};

export const GRID_BREAKPOINTS = {
  SM: 'grid-cols-1',
  MD: 'md:grid-cols-2', 
  LG: 'lg:grid-cols-3',
  XL: 'xl:grid-cols-4'
};

export const ERROR_MESSAGES = {
  NO_DATA_FOUND: 'No data found for',
  API_ERROR: 'Failed to fetch project data',
  NETWORK_ERROR: 'Check your internet connection',
  AUTH_ERROR: 'Verify API authentication token',
  CONTACT_SUPPORT: 'Contact support if the issue persists'
};

export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 300,
  LOADING_SPINNER_SIZE: 'h-12 w-12',
  ICON_SIZE: 'h-8 w-8',
  SMALL_ICON_SIZE: 'h-4 w-4'
};