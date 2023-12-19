import { Emitter } from "strict-event-emitter";

export type MessageContent = string;

export interface User {
  name: string | null;
  isBot: boolean | null;
  id: string;
  avatarURL: string | null;
}

export interface Message {
  type: "Message";
  /**
   * Information on the platform that the message was sent on
   */
  platform: {
    /**
     * The name of the platform
     */
    name: "Discord" | "Guilded" | string;
    /**
     * The location of the platform
     * For decentralised platforms, this might come in handy
     */
    host: string;
  };
  content: string;
  author: User;
  mentions: {
    /**
     * True if the bot was mentioned
     */
    me: boolean;
    /**
     * True if everyone got mentioned
     */
    everyone: boolean;
  };
  /**
   * A special id of the message issued by the extension host
   */
  id: string;
  /**
   * Send a reply to the message
   * @param content The message to reply with
   */
  reply: (content: MessageContent) => void;
  /**
   * Send a message in the same place as the message
   * @param content The message to send
   */
  send: (content: MessageContent) => void;
}

export type AdapterEvents = {
  messageCreate: [message: Message];
};

export class BaseAdapter extends Emitter<AdapterEvents> {
  static eventList: (keyof AdapterEvents)[] = ["messageCreate"];
}

export abstract class Platform extends BaseAdapter {
  //registerCommand(commandInfo: CommandInfo): void {}
}
