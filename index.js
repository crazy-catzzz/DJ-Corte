//djs v13 is a fucking joke to humanity (it does support slash commands though)

import config from "./config.json";

import dotenv from "dotenv";
dotenv.config();

import { MusicHandler } from "./handlers/musicHandler.js";
export const mHandler = new MusicHandler();

import { CommandHandler } from "./handlers/commandHandler.js";
const commandHandler = new CommandHandler();

import { Client } from "discord.js";
const bot = new Client({
    intents: [config.bot.intents],
    partials: [config.bot.partials]
});

//Log the bot in
bot.login()

bot.on("ready", () => {
    console.log("Ready!");
});

//Initialize command handler
commandHandler.init();

//Listen for interactions
bot.on("interactionCreate", async interaction => {

    if(interaction.isCommand())
        commandHandler.handle(interaction.commandName, interaction);
});