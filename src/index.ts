import { Platform, AdapterEvents } from "./common/adapters";
import { SocketConfig, SocketRunner } from "./websocket";
import { PanelConfig, PanelRunner } from "./panel";
import { CombinedEmitter } from "./froxKit";

interface MtcConfig {
  socket?: SocketConfig;
  panel?: PanelConfig;
  defaultPrefix?: string;
}

export class MtcHost {
  socket: SocketRunner;
  panel: PanelRunner;
  event: CombinedEmitter<AdapterEvents>;
  constructor(config?: MtcConfig) {
	this.event = new CombinedEmitter(Platform.eventList);
    this.socket = new SocketRunner(this.event, config?.socket);
    this.panel = new PanelRunner(config?.panel);
  }
  registerPlatforms(platforms: Platform[]) {
    this.event.addEmitters(platforms);
  }
}
