import { Socket } from "socket.io-client";
import { Message } from "../adapters";

export class Remapper {
  private socket: Socket;
  constructor(socket: Socket) {
    this.socket = socket;
  }
  newMessage(refID: string, message: Message) {
    this.propAppend(refID, message, ["send", "reply"]);
  }
  private appenders = {
    send: (refID: string, obj: any) => {
      obj.send = (content: any) => {
        this.socket.emit("send", refID, content);
      };
    },
    reply: (refID: string, obj: any) => {
      obj.reply = (content: any) => {
        this.socket.emit("reply", refID, content);
      };
    },
  };
  private propAppend(
    refID: string,
    obj: any,
    props: (keyof typeof this.appenders)[],
  ) {
    for (let prop of props) {
      this.appenders[prop](refID, obj);
    }
  }
}
