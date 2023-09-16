import { BaseAdapter } from "./adapters";
import { Server } from "socket.io";

interface ServerToExtension {}

interface ExtensionToServer {
  sendMessage: () => void;
}

interface InterServerEvents {}

interface ExtensionData {}
