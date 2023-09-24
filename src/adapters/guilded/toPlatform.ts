import { MessageContent, Embed, EmbedDataSchema, EmbedData } from "../";
import { Embed as GuildedEmbed } from "guilded.js";
import { safeParse } from "valibot";
import {} from "discord.js";

export function messageRebuild(content: MessageContent) {
  if (typeof content == "string") return content;

  if (!content)
    return console.warn(
      "Type Error: Embed data is invalid and has been blocked",
    );

  if ((content as { baseU64: string }).baseU64)
    return console.log("Message content of non-string is not yet supported");

  // is embed
  let embedParsed = safeParse(EmbedDataSchema, content);
  if (!embedParsed.success)
    return console.warn(
      "Type Error: Embed data is invalid and has been blocked by Valibot",
    );
  return { embeds: [embedRebuild(embedParsed.output)] };
}

export function embedRebuild(embedData: EmbedData) {
  let embed = new Embed(embedData);
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

  if (embed.author)
    guildedEmbed.setAuthor(
      embed.author.name,
      embed.author.icon,
      embed.author.link,
    );
  if (embed.footer)
    guildedEmbed.setFooter(embed.footer.text, embed.footer.icon);

  return guildedEmbed;
}
