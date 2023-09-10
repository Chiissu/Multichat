export { DjsAdapter } from "./adapters/djs";
export { GuildedAdapter } from "./adapters/guilded";
import { BaseAdapter } from "./adapters";
export { BaseAdapter };
export { Embed } from "./adapters";
import { Server } from "socket.io";
import RefID from "./refID";
import { Result, Ok, Err } from "ts-results";

interface ExtConfig {
  port?: number;
}

interface ExtInfo {
  id: string;
  token?: string;
  [key: string]: any;
}

function parseExtInfo(
  input: any,
): Result<
  ExtInfo,
  "InvalidType" | "ParsingError" | "InvalidID" | "InvalidToken"
> {
  if (typeof input != "string") return Err("InvalidType");
  try {
    let parsed = JSON.parse(input);
    if (
      !parsed.id ||
      typeof parsed.id != "string" ||
      !parsed.id.match(/^[A-Z0-9][a-zA-Z0-9]*\.[A-Z0-9][a-zA-Z0-9]*$/)
    )
      return Err("InvalidID");
    if (parsed.token != undefined && typeof parsed.token != "string")
      return Err("InvalidToken");
    return Ok(parsed);
  } catch {
    return Err("ParsingError");
  }
}

export interface ExtController {
  extAuth: (info: ExtInfo) => boolean;
}

export class ExtHandler {
  socket: Server;
  refID = new RefID<any>();
  constructor(controller: ExtController, config?: ExtConfig) {
    // Create Socket here
    this.socket = new Server();
    this.socket.listen(config?.port || 4334);
    this.socket.on("connection", (socket) => {
      let authData = parseExtInfo(socket.handshake.headers.auth);
      if (!authData.ok || !controller.extAuth(authData.val)) {
        console.log(authData.val);
        return socket.disconnect();
      }

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
      socket.onAny((eventName: string, ...args) => {
        if (["reply", "sendMessage"].includes(eventName)) return;
        this.socket.emit(authData.val.id + ":" + eventName, ...args);
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
