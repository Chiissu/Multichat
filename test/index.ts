// This file is only an example of how to use the extension system, please
// see the src/ directory for the source.
import {
  Client as DjsClient,
  Events as DjsEvents,
  GatewayIntentBits as DjsGatewayIntentBits,
} from "discord.js";
import { Client as GuildedClient } from "guilded.js";
import {
  ExtHandler,
  DjsAdapter,
  GuildedAdapter,
  ExtController,
  BaseAdapter,
} from "../src";
import { readFileSync } from "fs";
import "dotenv/config";

console.log(readFileSync(import.meta.dir + "/Chiissu").toString());

const PORT = 4664;
const RUN = ["GUILDED", "DJS"];

let clients: BaseAdapter[] = [];

if (RUN.indexOf("DJS") != -1) {
  // Example of adding DiscordJS to the Extension Protocol
  const djs = new DjsClient({
    intents: [
      DjsGatewayIntentBits.Guilds,
      DjsGatewayIntentBits.GuildMessages,
      DjsGatewayIntentBits.MessageContent,
      DjsGatewayIntentBits.DirectMessages,
    ],
  });
  djs.once(DjsEvents.ClientReady, (c) => {
    console.log(`Logged in to Discord as ${c.user.tag}`);
  });
  djs.login(process.env.DISCORD_TOKEN);
  if (!process.env.DISCORD_ID) throw "DISCORD_ID is not found in .env"
  clients.push(new DjsAdapter(djs, process.env.DISCORD_ID));
}

// Example of adding Guilded to the Extension Protocol
if (RUN.indexOf("GUILDED") != -1 && process.env.GUILDED_TOKEN) {
  const guilded = new GuildedClient({ token: process.env.GUILDED_TOKEN });
  guilded.once("ready", () => {
    console.log(`Logged in to Guilded as ${guilded.user?.name}`);
  });
  guilded.login();
  clients.push(new GuildedAdapter(guilded));
}

// Start the extension protocol
let controller: ExtController = {
  extAuth: (extInfo) => {
    if (extInfo.id == "Chi.TestExt" && extInfo.token == "test-token") {
      console.log("Test extension connected");
      return true;
    }
    console.log(
      `Extensions ${extInfo.id} has invalid authentication, kicking extension`,
    );
    return false;
  },
};
new ExtHandler(controller, { port: PORT }).registerClients(clients);

// Launch example extension
const workerURL = new URL("testExt.ts", import.meta.url).href;
const worker = new Worker(workerURL);
worker.postMessage({ port: PORT });
worker.onmessage = (event) => {
  console.log(event.data);
};
