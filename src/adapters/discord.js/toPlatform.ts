import {  MessageContent } from "../";

export function messageRebuild(content: MessageContent) {
  if (typeof content == "string") return content;
}
