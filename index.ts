// Imports and requirements
import { app, BrowserWindow } from "electron";
import dotenv from "dotenv";
import puppeteer from "puppeteer";
dotenv.config();
const client = require("discord-rich-presence")(
  `${process.env.DISCORD_CLIENT_ID}`
);

// Global variables
let mainWindow: BrowserWindow | null = null;
let nombre: string;
let titulo: string;
let course: string;
let currentURL: string;
const baseURL: string = "https://platzi.com/";

// Update Discord Presence
const updateRPC = async (updatedTitle: string, curso: string) => {
  try {
    client.updatePresence({
      details: curso ? curso : "En la pagina de inicio",
      state: updatedTitle ? updatedTitle : "Platzi",
      largeImageKey: "icon",
      startTimestamp: Date.now(),
    });
  } catch (error: any) {
    throw new Error(error);
  }
  return await updatedTitle, curso;
};

// Starter RPC
const startRPC = () => {
  client.updatePresence({
    details: "En la pagina de inicio",
    state: "Platzi",
    largeImageKey: "icon",
    startTimestamp: Date.now(),
  });
};

// Update Title and RPC
const updateTitleAndRpc = async (event: Event, title: string) => {
  try {
    // Get the title of the page
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
    // Start Scraping
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36"
    );
    await page.goto(currentURL); // Go to the current URL
    await page.waitForSelector(".Header-course-info-content");
    const textContent = await page.evaluate(
      () =>
        document.querySelector(".Header-course-info-content > a > h2")!
          .textContent
    );
    course = textContent!; // Get the course name
    browser.close(); // Close the browser
    await updateRPC(titulo, course); // Update title and course
  } catch (error: any) {
    throw new Error(error);
  }
};

// Update the current URL
async function updateURL(event: any) {
  currentURL = await event?.sender.getURL();
  return currentURL;
}

// Create the browser window
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: "Loading...",
    icon: "assets/icon.png",
    webPreferences: { nodeIntegration: false },
  });
  mainWindow.loadURL(baseURL); // Load the url
  mainWindow.webContents.on("did-navigate", () =>
    titulo === "En la pagina de inicio" ? null : startRPC()
  ); // Start the RPC
  mainWindow.webContents.on("did-navigate", (event: any) => updateURL(event)); // Update the current URL
  mainWindow.on("page-title-updated", updateTitleAndRpc);
  mainWindow.setMenu(null);
  mainWindow.on("closed", () => (mainWindow = null!));
};

app.on("ready", createWindow); // When the app is ready, create the window
app.on("window-all-closed", () => app.quit()); // When the app is closed, quit the app
app.on("activate", () => (mainWindow ? createWindow() : null)); // When the app is activated, create the window
