import { Client, REST } from "discord.js";
import { Platform, BaseAdapter } from "../";
import { adaptMessage } from "./toCommon";

export class DjsAdapter extends BaseAdapter implements Platform {
  client: Client;
  rest: REST;
  clientID: string;
  constructor(client: Client, clientID: string) {
    super();
    client.on("messageCreate", (message) => {
      this.emit("messageCreate", adaptMessage(message, client));
    });

    this.client = client;

    this.rest = new REST().setToken(this.client.token!);
    this.clientID = clientID;
  }
}
