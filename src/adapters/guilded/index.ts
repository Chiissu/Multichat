import { BaseAdapter, CommandInfo, ConcreteBaseAdapter } from "../";
import { Client } from "guilded.js";
import { adaptMessage } from "./toCommon";

export class GuildedAdapter extends ConcreteBaseAdapter implements BaseAdapter {
  constructor(client: Client) {
    super();
    client.on("messageCreated", (message) => {
      this.emit("messageCreate", adaptMessage(message, client));
    });
  }
  registerCommand(commandInfo: CommandInfo) {
    
  }
}
