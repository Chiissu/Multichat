import { Result } from "ts-results";

export interface PanelConfig {
  onByDefault?: boolean;
  port?: number;
}

export type LoginValidator = (
  username: string,
  psw: string,
) => Result<any, number>;

export class PanelRunner {
  isOn: boolean;
  validator?: LoginValidator;
  constructor(config?: PanelConfig) {
    this.isOn = !!config?.onByDefault;
    if (this.isOn) {
      this.start();
    }
  }
  start() {
    this.isOn = true;
  }
  /**
   * Shuts this extension server down
   */
  destroy() {}
}
