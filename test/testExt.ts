// This is on the extension side

import { MtcClient } from "../src/devkit";

declare var self: Worker;

self.addEventListener("message", (config) => {
  console.log("[Ext]: Connecting to extension host...");

  let app = new MtcClient("ws://localhost:" + config.data.port, {
    id: "Chi.TestExt",
  });

  app.on("connect", ()=>{
	console.log("[Ext]: Connected to extension host")
  })

  app.on("messageCreate", (message) => {
    if (message.content.toLowerCase() === "ping") message.send("pong");
    if (message.content.toLowerCase() === "frox is a weeb")
      message.reply("NO he is NOT!!!");
  });
});
