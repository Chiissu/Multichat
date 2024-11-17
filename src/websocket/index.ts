import { Server, Socket } from "socket.io";
import { Result } from "ts-results";
import {
  BaseAdapter,
  MemberJoinEvent,
  Message,
  Platform,
  User,
} from "../adapters";
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
  private cacher: RefID<Message | MemberJoinEvent>;
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
      for (let event of ["send", "reply"]) {
        socket.on(event, (id, ...content) => {
          let item = this.cacher.get(id);
          if (item.err) return console.log("Can't find item with id of", id);
          item.val[event](...content);
        });
      }
    });

    // Remap events
    for (let eventName of Platform.eventList) {
      this.unifiedEmitter.on(eventName, (obj) => {
        this.socket.emit(eventName, this.cacher.cache(obj), obj);
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
