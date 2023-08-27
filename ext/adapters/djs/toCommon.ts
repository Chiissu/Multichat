import { Message } from "../";
import { Client, Message as DiscordMessage } from "discord.js";
import { contentToMessage } from "./toPlatform";

export function adaptMessage(message: DiscordMessage, client: Client): Message {
  return {
    content: message.content,
    author: { name: message.author.displayName, isBot: message.author.bot },
    mentions: {
      me:
        client.user && message.mentions.members
          ? message.mentions.members.has(client.user.id)
          : false,
      everyone: message.mentions.everyone,
    },
    reply: (content) => {
      let remappedContent = contentToMessage(content);
      remappedContent && message.reply(remappedContent);
    },
    send: (content) => {
      let remappedContent = contentToMessage(content);
      remappedContent && message.channel.send(remappedContent);
    },
  };
}
