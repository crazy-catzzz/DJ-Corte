import ytdl from "ytdl-core";
import { MessageEmbed } from "discord.js";
import { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } from "@discordjs/voice";

const queue = new Map();
const player = createAudioPlayer();

export class MusicHandler {
    async getSong(query, url) {
        if (url) {
            console.log(query);
        } else {
            const songInfo = await ytdl.getInfo(query);
            const song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url,
            }
            return song;
        }
    }

    async addToQueue(song, guildId, interaction) {
        const serverQueue = queue.get(guildId);

        if (!serverQueue) {
            const queueConstruct = {
                textChannel: interaction.channel,
                voiceChannel: interaction.member.voice.channel,
                connection: null,
                songs: [],
                volume: 5,
                playing: true,
            };

            queue.set(guildId, queueConstruct);
            queueConstruct.songs.push(song);

            try {

                const connection = joinVoiceChannel({
                    channelId: interaction.member.voice.channel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.member.voice.channel.guild.voiceAdapterCreator,
                });
                
                queueConstruct.connection = connection;

                connection.subscribe(player);

                this.playSong(interaction.guild, await queueConstruct.songs[0]);

            } catch (err) {
                console.log(err);
                queue.delete(guildId);
            }
        } else {
            serverQueue.songs.push(await song);
            //console.log(serverQueue.songs);
            interaction.reply(`**${(await song).title}** è stata aggiunta alla queue!`);
        }
    }

    async playSong(guild, song) {
        const serverQueue = queue.get(guild.id);
        
        if (!song) {
            player.stop();
        }

        player.play(createAudioResource(ytdl((await song).url, { filter: "audioonly", quality: "lowestaudio" })));
        player.on(AudioPlayerStatus.Idle, (oldState, newState) => {
            console.log(oldState);
            if (oldState.status == AudioPlayerStatus.Playing) {
                serverQueue.songs.shift();
                this.playSong(guild, serverQueue.songs[0], player);
            }
        });
        player.on("error", error => {
            console.log(error);
            serverQueue.connection.destroy();
            queue.delete(guild.id);
            return serverQueue.textChannel.send(`Si è verificato un errore!`);
        });

        serverQueue.textChannel.send(`Inizio a riprodurre **${(await song).title}**`)
    }

    async skip(guild, interaction) {
        const serverQueue = queue.get(guild.id);

        if (!serverQueue.songs[1]) return interaction.reply("Non ci sono altre canzoni da riprodurre!");

        serverQueue.songs.shift();
        player.play(createAudioResource(ytdl((await serverQueue.songs[0]).url, { filter: "audioonly", quality: "lowestaudio" })));
        interaction.reply(`Ho skippato la canzone precedente!`);
    }

    async showQueue(guildId, interaction) {
        const serverQueue = queue.get(guildId);

        if (!serverQueue) return interaction.reply("Non ci sono canzoni nella queue!");

        const queueEmbed = new MessageEmbed()
            .setTitle("Ecco la queue:");

        serverQueue.songs.forEach(async song => {
            queueEmbed.addField((await song).title, ".");
        });

        interaction.reply({ embeds: [queueEmbed] });
    }

    async stop(guild, interaction) {
        const serverQueue = queue.get(guild);

        if (!serverQueue) return interaction.reply("Non ci sono canzoni da stoppare!");

        serverQueue.connection.destroy();
        queue.delete(guild);
        return interaction.reply(`Player stoppato e queue ripulita.`);
    }
}