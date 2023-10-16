import { io, Socket } from "socket.io-client";
import { Emitter } from "strict-event-emitter";
import { Events, ExtConfig } from "./protocol";
import { Remapper } from "./remapper";

export class MtcClient extends Emitter<Events> {
  private socket: Socket;
  private remapper: Remapper;
  constructor(location: URL | string, config: ExtConfig) {
    super();
    this.socket = io(location, {
      extraHeaders: {
        auth: JSON.stringify({ id: config.id, token: config.token }),
      },
    });

    this.remapper = new Remapper(this.socket);

    this.socket.on("connect", () => {
      this.emit("connect");

      this.socket.on("messageCreate", (refID, message) => {
        this.remapper.newMessage(refID, message);
        this.emit("messageCreate", message);
      });
    });

    this.socket.on("disconnect", () => {
      this.emit("disconnect");
    });

    this.socket.on("connect_error", (err) => {
      console.error(err);
    });
  }
  disconnect() {
    this.socket.disconnect();
  }
}
