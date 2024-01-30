import { Platform, BaseAdapter } from "../";
import { Client } from "guilded.js";
import { adaptMessage } from "./toCommon";

export class GuildedAdapter extends BaseAdapter implements Platform {
  commands: string[] = [];
  fallbackPrefix = "!";
  constructor(client: Client) {
    super();
    client.on("messageCreated", (message) => {
      this.emit("messageCreate", adaptMessage(message, client));
    });
  }
}
