import { AdapterEvents } from "../adapters";

export interface ExtConfig {
  /**
   * The unique ID of your extension
   * Make sure this ID is registered on the extension host
   */
  id: string;
  /**
   * The token to run your extension
   * This should be issued by the admin of the extension host
   */
  token?: string;
}

export type Events = AdapterEvents & {
  ready: [];
  disconnect: [];
};
