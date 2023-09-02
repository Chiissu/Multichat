export { DjsAdapter } from "./adapters/djs";
export { GuildedAdapter } from "./adapters/guilded";
import { BaseAdapter } from "./adapters";
export { BaseAdapter };
export { Embed } from "./adapters";
import { Server } from "socket.io";
import RefID from "./refID";

interface ExtConfig {
  port?: number;
}

export interface ExtController {
  extAuth: (info?: { name?: string; id?: string; token?: string }) => boolean;
}

export class ExtHandler {
  socket: Server;
  refID = new RefID<any>();
  constructor(controller: ExtController, config?: ExtConfig) {
    // Create Socket here
    this.socket = new Server();
    this.socket.listen(config?.port || 4334);
    this.socket.on("connection", (socket) => {
      let auth = socket.handshake.headers.auth;
      if (
        !controller.extAuth(
          typeof auth == "string" ? JSON.parse(auth) : undefined,
        )
      )
        return socket.disconnect(true);
      socket.on("reply", (content, refID) => {
        let message = this.refID.get(refID);
        if (message.err) return console.error(message.val);
        message.val.reply(content);
      });
      socket.on("sendMessage", (content, refID) => {
        let message = this.refID.get(refID);
        if (message.err) return console.error(message.val);
        message.val.send(content);
      });
    });
  }
  registerClients(clients: BaseAdapter[]) {
    for (let client of clients) {
      client.on("messageCreate", (message) => {
        this.socket.emit("messageCreate", message, this.refID.cache(message));
      });
    }
  }
}
