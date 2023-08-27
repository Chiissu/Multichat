import { Client } from "discord.js";
import { BaseAdapter } from "../";
import { adaptMessage } from "./toCommon";

export class DjsAdapter extends BaseAdapter {
  constructor(client: Client) {
    super();
    client.on("messageCreate", (message) => {
      this.emit("messageCreate", adaptMessage(message, client));
    });
  }
}
