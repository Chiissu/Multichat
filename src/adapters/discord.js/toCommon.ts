import { Message, User } from "../";
import { Client, Message as DiscordMessage, GuildMember, User as DiscordUser } from "discord.js";
import { messageRebuild } from "./toPlatform";

export function adaptMessage(message: DiscordMessage, client: Client): Message {
  return {
    type: "Message",
    platform: { name: "Discord", host: "discord.com" },
    content: message.content,
    author: adaptUser(message.author, client),
    mentions: {
      me:
        client.user && message.mentions.members
          ? message.mentions.members.has(client.user.id)
          : false,
      everyone: message.mentions.everyone,
    },
    id: message.id,
    reply: (content) => {
      let remappedContent = messageRebuild(content);
      remappedContent && message.reply(remappedContent);
    },
    send: (content) => {
      let remappedContent = messageRebuild(content);
      remappedContent && message.channel.send(remappedContent);
    },
  };
}

export function adaptUser(user: DiscordUser, client: Client): User {
  return {
    name: user.displayName,
    isBot: user.bot,
    id: user.id,
    avatarURL: user.avatarURL(),
  }
}
