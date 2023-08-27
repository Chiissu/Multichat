import { MessageContent, Embed } from "../";
import { EmbedPayload as GuildedEmbed } from "guilded.js";

export function contentToMessage(content: MessageContent) {
  if (typeof content == "string") return content;
  if ((content as { baseU64: string }).baseU64)
    return console.log("Message content of non-string is not yet supported");
  // is embed
  return { embeds: [embedRebuild(content as Embed)] };
}

export function embedRebuild(embed: Embed): GuildedEmbed {
  return {
    title: embed.title,
    description: embed.description,
    url: embed.link,
  };
}
