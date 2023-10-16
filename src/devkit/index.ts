import { io, Socket } from "socket.io-client";
import { Emitter } from "strict-event-emitter";
import { AdapterEvents, Message } from "../common/adapters";
import { Events, ExtConfig } from "./protocol";

class Remapper {
  socket: Socket;
  constructor(socket: Socket) {
    this.socket = socket;
  }
  message(refID: string, message: Message) {
    message.send = (content) => {
      this.socket.emit("send", refID, content);
    };
    message.reply = (content) => {
      this.socket.emit("reply", refID, content);
    };
    return message;
  }
}

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
        this.emit("messageCreate", this.remapper.message(refID, message));
      });
    });
    this.socket.on("disconnect", () => {
      this.emit("disconnect");
    });
    this.socket.on("connect_error", (err) => {
      console.log(err);
    });
  }
  registerGlobalCommand() {}
  disconnect() {
    this.socket.disconnect();
  }
}
