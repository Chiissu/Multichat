import { BaseAdapter, CommandInfo, ConcreteBaseAdapter } from "../";
import { Client } from "guilded.js";
import { adaptMessage } from "./toCommon";
import { contentToMessage } from "./toPlatform";

export class GuildedAdapter extends ConcreteBaseAdapter implements BaseAdapter {
  commands: string[] = [];
  constructor(client: Client) {
    super();
    client.on("messageCreated", (message) => {
      if (message.content.startsWith(this.fallbackPrefix)) {
        let command = message.content
          .replace(this.fallbackPrefix, "")
          .split(" ")[0];
        if (this.commands.includes(command))
          return this.emit("commandInteraction", {
            name: command,
            reply: (content) => {
              let remappedContent = contentToMessage(content);
              remappedContent && message.reply(remappedContent);
            },
          });
      }
      this.emit("messageCreate", adaptMessage(message, client));
    });
  }
  registerCommand(commandInfo: CommandInfo) {
    this.commands.push(commandInfo.name);
  }
}
