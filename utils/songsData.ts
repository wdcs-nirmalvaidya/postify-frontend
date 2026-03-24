export interface Song {
    id: string;
    title: string;
    artist: string;
    audioUrl: string; // URL to a 20-30s audio snippet
}

export const PREDEFINED_SONGS: Song[] = [
    {
        id: "kesariya-brahmastra",
        title: "Kesariya (Cover/Vibe)",
        artist: "Acoustic Mix",
        audioUrl: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3",
    },
    {
        id: "tum-hi-ho-aashiqui-2",
        title: "Tum Hi Ho (Lofi Edit)",
        artist: "Chill Beats",
        audioUrl: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Algorithms.mp3",
    },
    {
        id: "channa-mereya",
        title: "Channa Mereya (Instrumental)",
        artist: "Piano Covers",
        audioUrl: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Kai_Engel/Sails/Kai_Engel_-_02_-_Daedalus.mp3",
    },
    {
        id: "raabta",
        title: "Raabta (Upbeat mix)",
        artist: "DJ Synth",
        audioUrl: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Jahzzar/Tumbler/Jahzzar_-_01_-_Siesta.mp3",
    },
    {
        id: "kal-ho-naa-ho",
        title: "Kal Ho Naa Ho (Flute Ver)",
        artist: "Classical",
        audioUrl: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/WFMU/Broke_For_Free/Directionless_EP/Broke_For_Free_-_01_-_Night_Owl.mp3",
    },
    {
        id: "chaiyya-chaiyya",
        title: "Chaiyya Chaiyya (Remix)",
        artist: "Bass Boosted",
        audioUrl: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Kevin_MacLeod/Jazz_Sampler/Kevin_MacLeod_-_AcidJazz.mp3",
    }
];

export const getSongById = (id: string): Song | undefined => {
    return PREDEFINED_SONGS.find(song => song.id === id);
}
