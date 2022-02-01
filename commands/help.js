import Command from "./command.js";
import { MessageEmbed } from "discord.js";
import commands from "./slashCommandList.json";

export default new class extends Command {
    name = "help";
    
    async execute(interaction) {
        const helpEmbed = new MessageEmbed()
        .setTitle("Comandi")
        .setDescription("Questi sono i comandi.");
        
        commands.commands.forEach(command => {
            helpEmbed.addField(command.name, command.description);
        });


        interaction.reply({ embeds: [helpEmbed] });
    }
}

