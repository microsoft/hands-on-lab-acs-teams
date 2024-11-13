/** @typedef {typeof import('@azure/communication-identity').CommunicationUserToken} CommunicationUserToken */

/**
 * In-memory storage to map ACS IDs to their display names
 * @type () => Storage
 */
export const inMemory = () => new Map();
