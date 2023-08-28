import { Emitter } from "strict-event-emitter";

export type MessageContent = string | { baseU64: string } | Embed;

export interface User {
  name: string | null;
  isBot: boolean | null;
}

interface EmbedData {
  author?: { name: string; link?: string; icon?: string } | string;
  title?: string;
  link?: string;
  description?: string;
  thumbnail?: string | { url: string };
  contents?: Array<{ key?: string; value: string; inline?: boolean } | string>;
  image?: string | { url: string };
  footer?: string | { text: string; icon?: string };
  timestamp?: true | Date | string | number;
  color?: number;
}

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
  content: string;
  author: User;
  mentions: {
    me: boolean;
    everyone: boolean;
  };
  reply: (content: MessageContent) => void;
  send: (content: MessageContent) => void;
}

export type AdapterEvents = {
  messageCreate: [message: Message];
};

export class BaseAdapter extends Emitter<AdapterEvents> {}
