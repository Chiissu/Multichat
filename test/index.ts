import { MtcHost } from "../src";
import { Platform } from "../src/common/adapters";
import {
  Client as DjsClient,
  Events as DjsEvents,
  GatewayIntentBits as DjsGatewayIntentBits,
} from "discord.js";
import { Client as GuildedClient } from "guilded.js";
import { DjsAdapter } from "../src/common/adapters/discord.js";
import { GuildedAdapter } from "../src/common/adapters/guilded.js";
import { Err, Ok } from "ts-results";

const RUN = ["GUILDED", "DJS"];

let platforms: Platform[] = [];

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
  if (!process.env.DISCORD_ID) throw "DISCORD_ID is not found in .env";
  platforms.push(new DjsAdapter(djs, process.env.DISCORD_ID));
}

// Example of adding Guilded to the Extension Protocol
if (RUN.indexOf("GUILDED") != -1 && process.env.GUILDED_TOKEN) {
  const guilded = new GuildedClient({ token: process.env.GUILDED_TOKEN });
  guilded.once("ready", () => {
    console.log(`Logged in to Guilded as ${guilded.user?.name}`);
  });
  guilded.login();
  platforms.push(new GuildedAdapter(guilded));
}

// This is on the host side
const PORT = 4289
let app = new MtcHost();
app.registerPlatforms(platforms);
app.socket.start(PORT).validator = (extInfo) =>
  extInfo.id === "Chi.TestExt"
    ? Ok({ registerGlobalCommands: true, customEvents: true })
    : Err(405);

const workerURL = new URL("testExt.ts", import.meta.url).href;
const worker = new Worker(workerURL);
worker.postMessage({ port: PORT });
worker.onmessage = (event) => {
  console.log(event.data);
};
