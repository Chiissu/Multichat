import { BaseAdapter, CommandInfoSchema } from "./adapters";
import { Server } from "socket.io";
import RefID from "./refID";
import { Result, Ok, Err } from "ts-results";
import { safeParse } from "valibot";

export { DjsAdapter } from "./adapters/djs";
export { GuildedAdapter } from "./adapters/guilded";
export { BaseAdapter };
export { Embed } from "./adapters";

interface ExtConfig {
  port?: number;
  fallbackPrefix?: string;
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
  canRegisterCommand: (info: ExtInfo) => boolean;
}

export class ExtHandler {
  socket: Server;
  clients: BaseAdapter[] = [];
  refID = new RefID<any>();
  config: ExtConfig;
  constructor(controller: ExtController, config?: ExtConfig) {
    this.config = config ?? {};
    this.socket = new Server();
    this.socket.listen(config?.port || 4334);
    this.socket.on("connection", (socket) => {
      let authDataOption = parseExtInfo(socket.handshake.headers.auth);
      if (authDataOption.err || !controller.extAuth(authDataOption.val))
        return socket.disconnect();

      let authData = authDataOption.unwrap();

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

      socket.on("registerCommand", (rawConfig) => {
        if (!controller.canRegisterCommand(authData))
          return console.warn(
            "Permission Error: Block an unauthorised extension from registering command",
          );
        let config = safeParse(CommandInfoSchema, rawConfig);
        if (!config.success)
          return console.warn(
            "Type Error: Command info is invalid and has been blocked by Valibot",
          );
        let commandInfo = config.output;
        for (let client of this.clients) {
          client.registerCommand(commandInfo);
          client.on("commandInteraction", (interaction) => {
            if (interaction.name != commandInfo.name) return;
            this.socket.emit(
              "commandInteraction",
              interaction,
              this.refID.cache(interaction),
            );
          });
        }
      });

      socket.on("interactionReply", (content, refID) => {
        let interaction = this.refID.get(refID);
        if (interaction.err) return console.log(interaction.val);
        interaction.val.reply(content);
      });

      socket.onAny((eventName: string, ...args) => {
        if (
          [
            "reply",
            "sendMessage",
            "registerCommand",
            "interactionReply",
          ].includes(eventName)
        )
          return;
        this.socket.emit(authData.val.id + ":" + eventName, ...args);
      });
    });
  }
  registerClients(clients: BaseAdapter[]) {
    for (let client of clients) {
      client.fallbackPrefix = this.config.fallbackPrefix ?? "!";
      this.clients.push(client);
      client.on("messageCreate", (message) => {
        this.socket.emit("messageCreate", message, this.refID.cache(message));
      });
    }
  }
}
