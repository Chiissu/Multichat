import {
  Client,
  PermissionFlagsBits,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
import { BaseAdapter, CommandInfo, ConcreteBaseAdapter } from "../";
import { adaptMessage } from "./toCommon";
import { messageRebuild } from "./toPlatform";

export class DjsAdapter extends ConcreteBaseAdapter implements BaseAdapter {
  client: Client;
  rest: REST;
  clientID: string;
  constructor(client: Client, clientID: string) {
    super();
    client.on("messageCreate", (message) => {
      this.emit("messageCreate", adaptMessage(message, client));
    });
    client.on("interactionCreate", (interaction) => {
      if (interaction.isChatInputCommand()) {
        this.emit("commandInteraction", {
          name: interaction.commandName,
          reply: (content) => {
            let remappedContent = messageRebuild(content);
            remappedContent && interaction.reply(remappedContent);
          },
        });
      }
    });
    this.client = client;

    if (this.client.token) this.rest = new REST().setToken(this.client.token);
    this.clientID = clientID;
  }
  registerCommand(commandInfo: CommandInfo) {
    let command = new SlashCommandBuilder()
      .setName(commandInfo.name)
      .setDescription(
        commandInfo.description ?? "An awesome command of some sort",
      )
      .setDefaultMemberPermissions(
        commandInfo.adminOnly ? PermissionFlagsBits.Administrator : 0,
      );
    this.rest.put(Routes.applicationCommands(this.clientID), {
      body: [command.toJSON()],
    });
  }
}
