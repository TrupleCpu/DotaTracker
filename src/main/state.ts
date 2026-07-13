import { BrowserWindow } from "electron";
import { loadConfig } from "./config";

export const state = {
    mainWindow: null as BrowserWindow | null,
    controlWindow: null as BrowserWindow | null,
    config: loadConfig(),
    isQuitting: false
}