import { Client, REST } from "discord.js";
import { Platform, BaseAdapter } from "../";
import { adaptMessage, adaptUser } from "./toCommon";

export class DjsAdapter extends BaseAdapter implements Platform {
  client: Client;
  rest: REST;
  clientID: string;
  constructor(client: Client, clientID: string) {
    super();
    client.on("messageCreate", (message) => {
      this.emit("messageCreate", adaptMessage(message, client));
    });

    client.on("guildMemberAdd", (member) => {
      this.emit("memberJoin", {
        member: adaptUser(member.user, client), send: (msg) => {
          if (member.user.bot) return;
          member.dmChannel?.send(msg);
        }
      })
    })

    this.client = client;

    this.rest = new REST().setToken(this.client.token!);
    this.clientID = clientID;
  }
}
