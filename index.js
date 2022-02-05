// Imports and requirements
const { app, BrowserWindow } = require("electron");
const dotenv = require("dotenv");
dotenv.config();
const fetchService = require("./service/fetch");
const client = require("discord-rich-presence")(
  `${process.env.DISCORD_CLIENT_ID}`
);

// Global variables
let mainWindow;
let nombre;
let titulo;
let htmlData;
const baseURL = "https://platzi.com/";

// Scrapping data -> Not yet implemented
const ScrappingData = async () => {
  try {
    await fetchService.GetData(baseURL).then((data) => {
      htmlData = data.data;
    });
  } catch (error) {
    throw new Error(error);
  }
  return htmlData;
};

// Update Discord Presence
const updateRPC = (updatedTitle) => {
  client.updatePresence({
    state: updatedTitle,
    largeImageKey: "icon",
    instance: false,
    startTimestamp: Date.now(),
  });
  return updateTitle;
};

// Update Title
const updateTitle = (event, title) => {
  let data = title;
  if (data.includes(" - Platzi")) {
    nombre = data.split(" - Platzi")[0];
    titulo = `Clase: ${nombre}`;
  } else if (
    data.includes("Cursos Online Profesionales de Tecnología")
      ? (nombre = "En la pagina de inicio")
      : (nombre = "No esta viendo nada")
  ) {
    titulo = nombre;
  }
  updateRPC(titulo);
};

// Create the browser window
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: "Loading...",
    icon: "icon.png",
    webPreferences: { nodeIntegration: false },
  });
  mainWindow.loadURL(baseURL); // Load the url
  mainWindow.webContents.on("did-finish-load", ScrappingData);
  mainWindow.on("page-title-updated", updateTitle);
  mainWindow.setMenu(null);
  mainWindow.on("closed", () => (mainWindow = null));
};

app.on("ready", createWindow); // When the app is ready, create the window
app.on("activate", () => (mainWindow() ? createWindow() : null)); // When the app is activated, create the window
app.on("window-all-closed", () => app.quit()); // When the app is closed, quit the app
