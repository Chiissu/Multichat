import { AdapterEvents } from "../common/adapters";

export interface ExtConfig {
  id: string;
  token?: string;
}

export type Events = AdapterEvents & {
  connect: [];
  disconnect: [];
};
