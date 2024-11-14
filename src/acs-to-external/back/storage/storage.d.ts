import type { CommunicationUserToken } from "@azure/communication-common";

export interface Storage {
  get(key: string): Promise<CommunicationUserToken>;
  set(key: string, value: CommunicationUserToken): Promise<void>;
  remove(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
}
