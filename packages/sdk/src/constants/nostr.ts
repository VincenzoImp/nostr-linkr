/** Nostr event kind used for NostrLinkr identity linking. */
export const NOSTR_LINKR_EVENT_KIND = 13372;

/** Standard Nostr event kinds referenced by the SDK. */
export const NOSTR_EVENT_KINDS = {
  METADATA: 0,
  TEXT_NOTE: 1,
  REACTION: 7,
  LINKR: 13372,
} as const;

/** Maximum future timestamp tolerance in seconds (10 minutes). */
export const MAX_FUTURE_TOLERANCE = 600;

/** Maximum past timestamp tolerance in seconds (24 hours). */
export const MAX_PAST_TOLERANCE = 86400;
