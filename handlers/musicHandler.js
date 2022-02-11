import ytdl from "ytdl-core";
import { MessageEmbed } from "discord.js";
import { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } from "@discordjs/voice";

const queue = new Map(); // Map delle queue
const player = createAudioPlayer(); // Crea il player audio

export class MusicHandler {
    async getSong(query, url) {
        if (url) {
            console.log(query); // Inutile
        } else {
            const songInfo = await ytdl.getInfo(query); // Ottieni info dell'URL del video
            const song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url,
            }
            return song; // Ridai al programma la canzone trovata
        }
    }

    async addToQueue(song, guildId, interaction) {
        const serverQueue = queue.get(guildId); // Prendi la queue del server dalla map di queue

        if (!serverQueue) { // Se la queue non esiste, creala
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
                
                queueConstruct.connection = connection; // Inserisci la connessione nel costrutto della queue

                connection.subscribe(player);

                this.playSong(interaction.guild, await queueConstruct.songs[0], interaction); // Riproduci la canzone data

            } catch (err) {
                console.log(err);
                queue.delete(guildId);
            }
        } else {
            serverQueue.songs.push(await song); // Aggiungi la canzone alla queue
            //console.log(serverQueue.songs);
            interaction.reply(`**${(await song).title}** è stata aggiunta alla queue!`);
        }
    }

    async playSong(guild, song, interaction) {
        const serverQueue = queue.get(guild.id);
        
        if (!song) {
            return player.stop(); // Ferma il player per evitare errori (?)
        }

        player.play(createAudioResource(ytdl((await song).url, { filter: "audioonly", quality: "lowestaudio" })));
        player.on(AudioPlayerStatus.Idle, (oldState, newState) => {
            //console.log(oldState);
            if (oldState.status == AudioPlayerStatus.Playing) {
                serverQueue.songs.shift(); // Porta indietro di 1 l'array di canzoni
                this.playSong(guild, serverQueue.songs[0], player, undefined); // Riproduci la canzone
            }
        });
        player.on("error", error => {
            console.log(error);
            serverQueue.connection.destroy(); // Esci dalla vc
            queue.delete(guild.id); // Elimina la queue
            return serverQueue.textChannel.send(`Si è verificato un errore!`);
        });

        if (interaction === undefined) serverQueue.textChannel.send(`Inizio a riprodurre **${(await song).title}**`);
        else interaction.reply(`Inizio a riprodurre **${(await song).title}**`);
    }

    async skip(guild, interaction) {
        const serverQueue = queue.get(guild.id);

        if (!serverQueue.songs[1] || !serverQueue) return interaction.reply("Non ci sono altre canzoni da riprodurre!");

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