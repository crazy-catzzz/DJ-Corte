import { readdirSync } from "fs";
import { resolve } from "path";

export class CommandHandler {
    commands = new Map();

    async init() {
        const commandsPath = resolve("./commands");
        const files = readdirSync(commandsPath).filter(file => file.endsWith(".js"));

        for(const file of files) {
            const { default: command } = await import(`../commands/${file}`);
            console.log(`Loaded: ${command.name}`);
            if(!command?.name) continue;

            this.commands.set(command.name, command);
        }
        console.log(`Done! Loaded ${this.commands.size} commands.`)
    }

    async handle(commandName, interaction) {
        try {
            const command = this.commands.get(commandName);

            if(command.nsfw && !interaction.channel.nsfw) return interaction.reply("This command can only be used in an NSFW channel!");

            command?.execute(interaction);
        } catch(error) {
            await console.log(`${error}`);
        }
    }
}