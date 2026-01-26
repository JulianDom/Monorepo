import type { Translations } from './es';

/**
 * Traducciones en Inglés
 */
export const en: Translations = {
  // Common
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    search: 'Search',
    filter: 'Filter',
    loading: 'Loading...',
    noResults: 'No results found',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    actions: 'Actions',
    yes: 'Yes',
    no: 'No',
    all: 'All',
    none: 'None',
    select: 'Select',
    close: 'Close',
    refresh: 'Refresh',
    export: 'Export',
    import: 'Import',
    download: 'Download',
    upload: 'Upload',
  },

  // Auth
  auth: {
    login: 'Log in',
    logout: 'Log out',
    register: 'Sign up',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot your password?',
    rememberMe: 'Remember me',
    loginSuccess: 'Logged in successfully',
    loginError: 'Invalid credentials',
    logoutSuccess: 'Logged out successfully',
  },

  // Validation
  validation: {
    required: 'This field is required',
    email: 'Enter a valid email address',
    minLength: 'Minimum {{min}} characters',
    maxLength: 'Maximum {{max}} characters',
    min: 'Minimum value is {{min}}',
    max: 'Maximum value is {{max}}',
    pattern: 'Invalid format',
    passwordMismatch: 'Passwords do not match',
  },

  // Errors
  errors: {
    generic: 'An unexpected error occurred',
    network: 'Connection error. Check your internet.',
    notFound: '{{entity}} not found',
    unauthorized: 'You do not have permission for this action',
    forbidden: 'Access denied',
    serverError: 'Server error. Try again later.',
  },

  // Success messages
  success: {
    created: '{{entity}} created successfully',
    updated: '{{entity}} updated successfully',
    deleted: '{{entity}} deleted successfully',
    saved: '{{entity}} saved successfully',
  },

  // Confirmation dialogs
  confirm: {
    deleteTitle: 'Delete {{entity}}?',
    deleteDescription:
      'This action cannot be undone. The {{entity}} will be permanently deleted.',
    unsavedChangesTitle: 'Discard changes?',
    unsavedChangesDescription:
      'You have unsaved changes. Are you sure you want to leave?',
  },

  // Pagination
  pagination: {
    showing: 'Showing',
    of: 'of',
    results: 'results',
    page: 'Page',
    itemsPerPage: 'Items per page',
    goToPage: 'Go to page',
  },

  // Table
  table: {
    noData: 'No data to display',
    loading: 'Loading data...',
    error: 'Error loading data',
    sortAsc: 'Sort ascending',
    sortDesc: 'Sort descending',
  },

  // Dates
  dates: {
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    daysAgo: '{{count}} days ago',
    hoursAgo: '{{count}} hours ago',
    minutesAgo: '{{count}} minutes ago',
    justNow: 'Just now',
  },

  // File upload
  upload: {
    dragDrop: 'Drag files here or click to select',
    maxSize: 'Max size: {{size}}',
    invalidType: 'File type not allowed',
    tooLarge: 'File exceeds maximum size',
    uploading: 'Uploading...',
    uploaded: 'File uploaded successfully',
    error: 'Error uploading file',
  },
};
