import { AdapterEvents } from "../adapters";

export interface ExtConfig {
  id: string;
  token?: string;
}

export type Events = AdapterEvents & {
  ready: [];
  disconnect: [];
};
