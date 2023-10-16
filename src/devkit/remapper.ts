import { Socket } from "socket.io-client";
import { Message } from "../common/adapters";

export class Remapper {
  socket: Socket;
  constructor(socket: Socket) {
    this.socket = socket;
  }
  newMessage(refID: string, message: Message) {
    this.propAppend.send(refID, message);
    this.propAppend.reply(refID, message);
  }
  private propAppend = {
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
}
