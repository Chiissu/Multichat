import { MessageContent, Embed } from "../";
import { Embed as GuildedEmbed } from "guilded.js";

export function contentToMessage(content: MessageContent) {
  if (typeof content == "string") return content;
  if ((content as { baseU64: string }).baseU64)
    return console.log("Message content of non-string is not yet supported");
  // is embed
  return { embeds: [embedRebuild(content as Embed)] };
}

export function embedRebuild(embed: Embed) {
  let guildedEmbed = new GuildedEmbed({
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

  if (embed.author) guildedEmbed.setAuthor(embed.author.name, embed.author.icon, embed.author.link);
  if (embed.footer) guildedEmbed.setFooter(embed.footer.text, embed.footer.icon);

  return guildedEmbed;
}
