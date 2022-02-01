import Command from "./command.js";
import { mHandler } from "../index.js";

export default new class extends Command {
    name = "skip";

    async execute(interaction) {
        if (!interaction.member.voice.channel) return interaction.reply("Devi essere in un canale vocale per skippare musica!");
        mHandler.skip(interaction.guild, interaction);
    }
}