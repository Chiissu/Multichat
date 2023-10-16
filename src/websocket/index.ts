import { Server, Socket } from "socket.io";
import { Result } from "ts-results";
import {
  BaseAdapter,
  CommandInteraction,
  Message,
  Platform,
} from "../common/adapters";
import { RefID } from "../froxKit";

export interface SocketConfig {
  port?: number;
}

export interface ExtInfo {
  id: string;
  token?: string;
  ip: string;
  permissions: Perms;
  socket: Socket;
  kick(message?: string): void;
}

interface Perms {
  registerGlobalCommands: boolean;
  customEvents: boolean;
}

type ExtensionValidator = (extInfo: ExtInfo) => Result<Perms, number>;

export class SocketRunner {
  validator?: ExtensionValidator;
  private socket: Server;
  extensionList: ExtInfo[] = [];
  port: number;
  private unifiedEmitter: BaseAdapter;
  private cacher: RefID<Message | CommandInteraction>;
  constructor(unifiedEmitter: BaseAdapter, config?: SocketConfig) {
    this.port = config?.port || 4289;
    this.socket = new Server();
    this.unifiedEmitter = unifiedEmitter;
    this.cacher = new RefID();
  }
  start(port?: number) {
    if (port) this.port = port;
    this.socket.listen(this.port);

    // register extensions
    this.socket.on("connect", (socket) => {
      if (typeof socket.handshake.headers.auth != "string") return;
      let headerAuthOptions = JSON.parse(socket.handshake.headers.auth) as {
        id: string;
        token: string;
      };
      let extInfo: ExtInfo = {
        id: headerAuthOptions.id,
        token: headerAuthOptions.token,
        ip: socket.handshake.address,
        permissions: {
          registerGlobalCommands: false,
          customEvents: false,
        },
        socket,
        kick: () => {
          socket.disconnect(true);
          this.extensionList = this.extensionList.filter(
            (val) => val.id != extInfo.id,
          );
        },
      };
      if (this.extensionList.filter((val) => val.id == extInfo.id).length != 0)
        return extInfo.kick();
      if (this.validator) {
        let val = this.validator(extInfo);
        if (val.err) return extInfo.kick();
        extInfo.permissions = val.val;
      }
      this.extensionList.push(extInfo);

      // Receive events
      socket.on("send", (id, content) => {
        let item = this.cacher.get(id);
        if (item.err) return;
        item.val.send(content);
      });
      socket.on("reply", (id, content) => {
        let item = this.cacher.get(id);
        if (item.err) return;
        item.val.reply(content);
      });
    });

    // Remap events
    for (let eventName of Platform.eventList) {
      this.unifiedEmitter.on(eventName, (message) => {
        this.socket.emit(eventName, this.cacher.cache(message), message);
      });
    }

    return this;
  }
  /**
   * Shuts this extension server down
   */
  stop() {
    for (let extension of this.extensionList) {
      extension.kick();
    }
    this.socket.on("connection", (socket) => {
      socket.disconnect(true);
    });
  }
}
