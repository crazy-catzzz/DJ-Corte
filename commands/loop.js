import Command from "./command.js";
import { mHandler } from "../index.js";

export default new class extends Command {
    name = "loop";
    
    async execute(interaction) {
        mHandler.loop(interaction.guild.id, interaction);
    }
}

