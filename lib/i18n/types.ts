export type Language = 'pt' | 'en';

export interface Translations {
  appName: string;
  tagline: string;
  anonymousGuarantee: string;
  quickExit: string;
  navHome: string;
  navNewCase: string;
  navTrack: string;
  navAdmin: string;
  switchLanguage: string;
  
  // Home
  heroTitle: string;
  heroSubtitle: string;
  btnStartAnonymous: string;
  btnTrackCase: string;
  safetyTitle: string;
  safetyDesc: string;
  empathyTitle: string;
  empathyDesc: string;
  trackingTitle: string;
  trackingDesc: string;
  
  // New Case
  newCaseTitle: string;
  newCaseSubtitle: string;
  categoryLabel: string;
  categorySocialSupport: string;
  categoryComplaint: string;
  categoryGrievance: string;
  categorySuggestion: string;
  categoryOther: string;
  priorityLabel: string;
  priorityLow: string;
  priorityMedium: string;
  priorityHigh: string;
  priorityUrgent: string;
  titleLabel: string;
  titlePlaceholder: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  privacyReminder: string;
  voluntaryIdentifyToggle: string;
  voluntaryIdentifyDesc: string;
  contactNameLabel: string;
  contactChannelLabel: string;
  btnSubmit: string;
  submitting: string;
  
  // Success / Tracking Generation
  caseSubmittedTitle: string;
  caseSubmittedSubtitle: string;
  trackingCodeLabel: string;
  accessPinLabel: string;
  copySuccess: string;
  saveCredentialsWarning: string;
  btnGoToTrack: string;
  
  // Track Case
  trackTitle: string;
  trackSubtitle: string;
  trackInputPlaceholder: string;
  pinInputPlaceholder: string;
  btnSearch: string;
  caseNotFound: string;
  statusLabel: string;
  statusSubmitted: string;
  statusInTriage: string;
  statusInProgress: string;
  statusWaitingInfo: string;
  statusReferred: string;
  statusResolved: string;
  statusClosed: string;
  messagesTitle: string;
  noMessagesYet: string;
  sendFollowupTitle: string;
  sendFollowupPlaceholder: string;
  btnSendMessage: string;
  sendingMessage: string;
  
  // Admin / Backoffice
  adminLoginTitle: string;
  adminLoginSubtitle: string;
  emailLabel: string;
  passwordLabel: string;
  btnLogin: string;
  dashboardTitle: string;
  dashboardSubtitle: string;
  statTotalCases: string;
  statNewCases: string;
  statInTriage: string;
  statResolved: string;
  filterAll: string;
  assignedToLabel: string;
  unassigned: string;
  btnViewDetails: string;
  caseDetailsTitle: string;
  statusUpdateLabel: string;
  assignToLabel: string;
  forwardDepartmentLabel: string;
  btnSaveUpdates: string;
  officialReplyTitle: string;
  officialReplyPlaceholder: string;
  btnSendOfficialReply: string;
  internalNotesTitle: string;
  internalNotesDesc: string;
  internalNotePlaceholder: string;
  btnAddInternalNote: string;
  notificationsTitle: string;
  newCaseAlert: string;
  newMessageAlert: string;
  markAsRead: string;
  noNotifications: string;
}
