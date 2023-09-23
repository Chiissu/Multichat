import { Embed, EmbedDataSchema, MessageContent, EmbedData } from "../";
import { EmbedBuilder } from "discord.js";
import { safeParse } from "valibot";

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

  if (embed.author)
    discordEmbed.setAuthor({
      name: embed.author.name,
      iconURL: embed.author.icon,
      url: embed.author.link,
    });

  if (embed.footer)
    discordEmbed.setFooter({
      text: embed.footer.text,
      iconURL: embed.footer.icon,
    });

  return discordEmbed;
}
