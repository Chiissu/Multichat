import { Platform, AdapterEvents } from "./common/adapters";
import { SocketConfig, SocketRunner } from "./websocket";
import { PanelConfig, PanelRunner } from "./panel";
import { CombinedEmitter } from "./froxKit";
import { readFileSync } from "fs";

interface MtcConfig {
  socket?: SocketConfig;
  panel?: PanelConfig;
  defaultPrefix?: string;
  disableStatementLogging?: boolean;
}

export class MtcHost {
  socket: SocketRunner;
  panel: PanelRunner;
  event: CombinedEmitter<AdapterEvents>;
  constructor(config?: MtcConfig) {
	this.event = new CombinedEmitter(Platform.eventList);
    this.socket = new SocketRunner(this.event, config?.socket);
    this.panel = new PanelRunner(config?.panel);
    if (!config?.disableStatementLogging){
      console.log("===========================Multichat===========================")
      console.log(" " + readFileSync(import.meta.dir + "/Chiissu").toString().replaceAll("\n", "\n "));
      console.log(" Copyright 2023 by Chiissu team. All rights reserved. Any\n unauthorised distribution of this software may and will\n result in legal action.");
      console.log("===============================================================")
    }
  }
  registerPlatforms(platforms: Platform[]) {
    this.event.addEmitters(platforms);
  }
}
