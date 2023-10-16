import { Emitter } from "strict-event-emitter";
import {
  string,
  object,
  optional,
  Input,
  union,
  array,
  boolean,
  date,
  number,
} from "valibot";

export type MessageContent = string | { baseU64: string } | Embed;

export interface User {
  name: string | null;
  isBot: boolean | null;
  id: string;
  avatarURL: string | null;
}

export const EmbedDataSchema = object({
  author: union([
    object({
      name: string(),
      link: optional(string()),
      icon: optional(string()),
    }),
    string(),
  ]),
  title: optional(string()),
  link: optional(string()),
  description: optional(string()),
  thumbnail: optional(union([string(), object({ url: string() })])),
  contents: array(
    union([
      string(),
      object({
        value: string(),
        key: optional(string()),
        inline: optional(boolean()),
      }),
    ]),
  ),
  image: optional(union([string(), object({ url: string() })])),
  footer: optional(
    union([string(), object({ text: string(), icon: optional(string()) })]),
  ),
  timestamp: optional(union([boolean(), date(), string(), number()])),
  color: optional(number()),
});

export type EmbedData = Input<typeof EmbedDataSchema>;

export class Embed implements EmbedData {
  author;
  title;
  link;
  description;
  thumbnail;
  contents;
  image;
  footer;
  timestamp;
  color;
  constructor(content: EmbedData) {
    this.author =
      typeof content.author == "string"
        ? { name: content.author }
        : content.author;
    this.title = content?.title;
    this.link = content?.link;
    this.description = content?.description;
    this.thumbnail =
      typeof content?.thumbnail == "string"
        ? { url: content.thumbnail }
        : content.thumbnail;
    this.contents = content?.contents?.map((val) => {
      return typeof val == "string" ? { value: val } : val;
    });
    this.image =
      typeof content?.image == "string"
        ? { url: content.image }
        : content.image;
    this.footer =
      typeof content?.footer == "string"
        ? { text: content.footer }
        : content.footer;
    this.timestamp =
      content?.timestamp == true ? new Date() : content.timestamp;
    this.color = content?.color;
  }
}

export interface Message {
  type: "Message";
  platform: "discord" | "guilded";
  content: string;
  author: User;
  mentions: {
    me: boolean;
    everyone: boolean;
  };
  id: string;
  reply: (content: MessageContent) => void;
  send: (content: MessageContent) => void;
}

export interface CommandInteraction {
  type: "CommandInteraction";
  name: string;
  send: (content: MessageContent) => void;
  reply: (content: MessageContent) => void;
}

export const CommandInfoSchema = object({
  name: string(),
  description: optional(string()),
  adminOnly: optional(boolean()),
});

export type CommandInfo = Input<typeof CommandInfoSchema>;

export type AdapterEvents = {
  messageCreate: [message: Message];
  commandInteraction: [interaction: CommandInteraction];
};

export class BaseAdapter extends Emitter<AdapterEvents> {
  static eventList: (keyof AdapterEvents)[] = [
    "messageCreate",
    "commandInteraction",
  ];
}

export abstract class Platform extends BaseAdapter {
  registerCommand(commandInfo: CommandInfo): void {}
}
