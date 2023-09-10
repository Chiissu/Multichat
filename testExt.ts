import { io } from "socket.io-client";
import { Embed } from "./ext";

let auth = {
  name: "Test Ext",
  id: "Chi.TestExt",
  token: "test-token", // Normally, the token should be in a .env file
};

self.addEventListener("message", (config) => {
  let socket = io("ws://localhost:" + config.data.port, {
    extraHeaders: { auth: JSON.stringify(auth) },
  });
  socket.on("connect", () => {
    console.log("[Ext]: Connected to extension host");
  });
  socket.on("disconnect", () => {
    console.log("[Ext]: Socket disconnected");
  });

  socket.on("messageCreate", (message, refID) => {
    if (message.content == "ping") {
      socket.emit("sendMessage", "pong", refID);
    }

    if (message.content.toLowerCase() == "frox is a weeb") {
      socket.emit("reply", "No, he is NOT a weeb", refID);
    }

    if (message.mentions.everyone)
      socket.emit(
        "reply",
        "https://tenor.com/view/discord-meme-nichijou-everyone-anime-gif-16416228",
        refID,
      );

    if (message.mentions.me)
      socket.emit(
        "reply",
        "https://tenor.com/view/discord-triggered-notification-angry-dog-noises-dog-girl-gif-11710406",
        refID,
      );

    if (message.content.toLowerCase() == "fnw!info")
      socket.emit(
        "reply",
        new Embed({
          title: "Bot information",
          description:
            message.author.name + " forcing me to stalk on myself lmao",
          author: {
            name: "Frox",
            icon: "https://cdn.discordapp.com/avatars/958981729153089566/4ec4ae50d2d8373652cf9fd2adc5e470.webp",
            link: "https://github.com/froxcey/",
          },
          link: "https://github.com/Chiissu/Nebula",
          thumbnail: message.author.avatarURL,
          image:
            "https://cdn.discordapp.com/avatars/1079612529589895260/eb824c724e34ef139686b642fdd616bf.webp",
          contents: [
            { key: "Made by", value: "Frox!" },
            { key: "Version", value: "0.2-dev", inline: true },
            { key: "Vendor", value: "TroxCorp", inline: true },
            "",
            { key: "Organised", value: "Nebula Corporation", inline: true },
            { key: "License", value: "All rights reserved", inline: true },
          ],
          color: 0x696969,
          timestamp: true,
          footer: {
            text: "ChiissuOrg",
            icon: "https://cdn.discordapp.com/icons/1079612082636472420/b8d7ae70d84a52eedb2d36d2e5ffd28b.webp",
          },
        }),
        refID,
      );

    if (message.content == "Chiissu!") socket.emit("Greet", message, refID);
  });
  socket.on("Chi.TestExt:Greet", (message, refID) => {
    socket.emit("reply", `> ${message.content} \nちーっす！`, refID);
  });
});
