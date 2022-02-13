/*
* deploy-commands.js: ONLY FOR TESTING PURPOSES! This is used to deploy slash commands to a ds server
*/

import { SlashCommandBuilder, SlashCommandStringOption } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import cmdFile from './commands/slashCommandList.json';
import dotenv from 'dotenv';
dotenv.config();

const commands = [];

cmdFile.commands.forEach(command => {

	const builder = new SlashCommandBuilder();

	command.options.forEach(option => {
		switch(option.type) {
			case "string":
				builder.addStringOption(
					new SlashCommandStringOption()
					.setName(option.name)
					.setDescription(option.description)
					.setRequired(option.required)
				);
				break;
		}
	})

	commands.push(builder.setName(command.name).setDescription(command.description));
})

commands.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
	try {
		await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
			{ body: commands },
		);

		console.log('Successfully registered application commands.');
	} catch (error) {
		console.error(error);
	}
})();
