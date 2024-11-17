import { Client, UserType } from "guilded.js";
import { BaseAdapter, Platform } from "../";
import { adaptMessage, adaptUser } from "./toCommon";

export class GuildedAdapter extends BaseAdapter implements Platform {
  commands: string[] = [];
  fallbackPrefix = "!";

  constructor(client: Client) {
    super();
    client.on("messageCreated", (message) => {
      this.emit("messageCreate", adaptMessage(message, client));
    });
    client.on("memberJoined", (member) => {
      this.emit("memberJoin", {
        member: adaptUser(member.user!, client),
        send: (msg) => {
          if (member.user?.type == UserType.Bot) return;
        },
      });
    });
  }
}
