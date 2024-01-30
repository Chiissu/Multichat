import { Result } from "ts-results";
import { SocketRunner } from "../websocket";

export interface PanelConfig {
  port?: number;
}

export type LoginValidator = (
  username: string,
  psw: string,
) => Result<{ avatar: URL }, number>;

export class PanelRunner {
  isOn: boolean = false;
  validator?: LoginValidator;
  constructor(socket: SocketRunner, config?: PanelConfig) {
    Bun.serve({
      port: config?.port || 8080,
      fetch(req) {
        const url = new URL(req.url);

        if (url.pathname.startsWith("/lib")) {
          return new Response(Bun.file("src/panel" + url.pathname));
        }

        if (url.pathname.startsWith("/api")) {
          return new Response();
        }

        switch (url.pathname) {
          case "/":
            return new Response("Hello World");
          case "/login":
            return new Response("Login page");
          case "/dashboard":
            return new Response("");
          case "/dashboard/users":
            return new Response("");
          default:
            return new Response("404!");
        }
      },
    });
  }
  start() {
    if (this.isOn) return;
    this.isOn = true;
  }
  /**
   * Shuts the control panel down
   */
  stop() {
    this.isOn = false;
  }
}
