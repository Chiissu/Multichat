import { Embed, MessageContent } from "../";
import { EmbedBuilder } from "discord.js";

export function messageRebuild(content: MessageContent) {
  if (typeof content == "string") return content;

  if ((content as { baseU64: string }).baseU64)
    return console.log("Message content of non-string is not yet supported");

  // is embed
  return { embeds: [embedRebuild(content as Embed)] };
}

export function embedRebuild(embed: Embed) {
  let discordEmbed = new EmbedBuilder({
    title: embed.title,
    url: embed.link,
    description: embed.description,
    thumbnail: embed.thumbnail,
    fields: embed.contents?.map((val) => {
      return {
        name: val.key ?? "",
        value: val.value,
        inline: !!val.inline,
      };
    }),
    image: embed.image,
    timestamp: embed.timestamp?.toString(),
    color: embed.color,
  });

  if (embed.author) discordEmbed.setAuthor({
    name: embed.author.name,
    iconURL: embed.author.icon,
    url: embed.author.link,
  });

  if (embed.footer) discordEmbed.setFooter({
    text: embed.footer.text,
    iconURL: embed.footer.icon,
  });

  return discordEmbed;
}
