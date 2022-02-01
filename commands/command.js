export default class Command {
    name = "";
    nsfw = false;

    execute(interaction) {
        throw new TypeError("Command not implemented.");
    }
}