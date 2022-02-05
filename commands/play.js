import Command from "./command.js";
import { mHandler } from "../index.js";

export default new class extends Command {
    name = "play";

    async execute(interaction) {
        if (!interaction.member.voice.channel) return interaction.reply("Devi essere in un canale vocale per riprodurre musica!");

        const songURL = interaction.options.getString('song');

        const song = mHandler.getSong(songURL);

        mHandler.addToQueue(song, interaction.guild.id, interaction);
    }
}