import { io, Socket } from "socket.io-client";
import { Emitter } from "strict-event-emitter";
import { Events, ExtConfig } from "./protocol";

export class MtcClient extends Emitter<Events> {
  private socket: Socket;
  /**
   * Helps you connect to the Nebula extension host
   * @param location The location of the extension host
   * @param config Configurations of your extension
   */
  constructor(location: URL | string, config: ExtConfig) {
    super();
    this.socket = io(location, {
      extraHeaders: {
        auth: JSON.stringify({ id: config.id, token: config.token }),
      },
    });

    this.socket.on("connect", () => {
      this.emit("ready");

      this.socket.on("messageCreate", (refID, message) => {
        this.registerNetFunctions(refID, message, ["send", "reply"])
        this.emit("messageCreate", message);
      });

      this.socket.on("memberJoin", (refID, message) => {
        this.registerNetFunctions(refID, message, ["send"])
        this.emit("memberJoin", message);
      });
    });

    this.socket.on("disconnect", () => {
      this.emit("disconnect");
    });

    this.socket.on("connect_error", (err) => {
      console.error(err);
    });
  }

  /**
   * Disconnect this extension from the extension host
   */
  disconnect() {
    this.socket.disconnect();
  }

  /**
   * Reconnect this extension after disconnecting
   * WARNING: You normally shouldn't need this
   */
  reconnect() {
    this.socket.connect();
  }

  private registerNetFunctions(refID: string, obj: any, methods: string[]) {
    for (let method of methods) {
      obj[method] = (...args: any[]) => {
        this.socket.emit(method, refID, ...args)
      }
    }
  }
}
