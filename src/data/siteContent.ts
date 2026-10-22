/**
 * ==============================================================================
 * UNTIL OUR WORLDS MEET ✦
 * MASTER PERSONALIZATION & CONFIGURATION FILE
 * ==============================================================================
 * 
 * Edit this file to customize personal notes, images, voice recording,
 * memory entries, and optional call details for Bot's birthday.
 * 
 * 💡 TIPS:
 * - Place custom photos/screenshots into: `public/images/memories/`
 * - Place your personal voice note into: `public/audio/birthday-voice.mp3`
 * - If an image or voice file is missing, the site gracefully falls back to
 *   an elegant celestial illustration without breaking or showing empty boxes.
 */

export interface MemoryItem {
  id: string;
  type: 'photo' | 'message' | 'joke' | 'note';
  mediaType?: 'image' | 'video';
  orientation?: 'vertical' | 'horizontal';
  title: string;
  subtitle: string;
  /**
   * Path relative to public folder (e.g. '/memories/1792580021104.jpg')
   */
  imagePath?: string | null;
  /**
   * Path to video clip if applicable (e.g. '/memories/VID_20260703_013414_130.mp4')
   */
  videoPath?: string | null;
  duration?: string;
  badge?: string;
  hasAudio?: boolean;
  /**
   * Short excerpt or genuine snippet
   */
  snippet: string;
  /**
   * Revealed note when the user taps on this memory item
   */
  revealedNote: string;
  accent: string;
}

export interface ConstellationStar {
  id: number;
  label: string;
  thought: string;
  /**
   * Coordinates in percentage (0 to 100) for responsive placement
   */
  x: number;
  y: number;
}

export interface SiteConfiguration {
  recipient: {
    nickname: string;
    birthdayDate: string; // e.g. "November 8"
    callsign: string;
  };
  siteMeta: {
    title: string;
    tagline: string;
  };
  audio: {
    /**
     * Path to voice recording in public directory
     * Standard path: "/audio/birthday-voice.mp3"
     */
    src: string;
    durationEstimateSec?: number;
    title: string;
    subtitle: string;
  };
  planets: {
    herWorld: {
      label: string;
      title: string;
      imagePath: string | null; // e.g. '/images/planet-you.webp'
      personalNote: string;
      color: string;
      glowColor: string;
      cityName?: string; // Optional: disabled by default
    };
    myWorld: {
      label: string;
      title: string;
      imagePath: string | null; // e.g. '/images/planet-me.webp'
      personalNote: string;
      color: string;
      glowColor: string;
      cityName?: string; // Optional: disabled by default
    };
  };
  memories: MemoryItem[];
  constellation: {
    heading: string;
    subheading: string;
    stars: ConstellationStar[];
  };
  letter: {
    salutation: string;
    paragraphs: string[];
    closing: string;
    signature: string;
  };
  contact: {
    /**
     * Set to true and provide callUrl (e.g. 'tel:+123456789' or 'https://wa.me/...')
     * if you want the "Call me when you're ready" button displayed after the letter.
     */
    enableCallOption: boolean;
    callUrl?: string;
    callButtonText: string;
  };
}

export const siteContent: SiteConfiguration = {
  recipient: {
    nickname: "Bot",
    birthdayDate: "November 8",
    callsign: "A LITTLE UNIVERSE, MADE FOR BOT",
  },

  siteMeta: {
    title: "Until Our Worlds Meet",
    tagline: "A little piece of my world for you",
  },

  /* -------------------------------------------------------------------------- */
  /* CHAPTER 4 — VOICE MESSAGE CONFIGURATION                                     */
  /* -------------------------------------------------------------------------- */
  audio: {
    // Put your voice note at: public/audio/birthday-voice.mp3
    src: "/audio/birthday-voice.mp3",
    title: "A Voice from My World",
    subtitle: "Recorded especially for your birthday",
    durationEstimateSec: 72,
  },

  /* -------------------------------------------------------------------------- */
  /* CHAPTER 2 — TWO WORLDS (HER WORLD & MY WORLD)                               */
  /* -------------------------------------------------------------------------- */
  planets: {
    herWorld: {
      label: "Chennai ✦ Her World",
      title: "The Marina Breeze • Chennai",
      imagePath: "/memories/1792580021104.jpg",
      personalNote:
        "Under the warm coastal sky of Chennai, celebrating your incredible resilience and strength. When we first met, you were navigating difficult times, yet you held onto an unwavering determination to earn, build your own path, and become an independent woman. Watching your courage turn hardship into a bright future inspires me every single day. Even across ~500 km, your spirit shines brighter than any star.",
      color: "#A78BFA", // Lavender
      glowColor: "rgba(167, 139, 250, 0.45)",
      cityName: "Chennai, Tamil Nadu",
    },
    myWorld: {
      label: "Coimbatore ✦ My World",
      title: "The Western Foothills • Kovai",
      imagePath: null, // Set to "/images/planet-me.webp" when ready
      personalNote:
        "Here in Coimbatore, under the cool mountain breeze from the Western Ghats, looking up at the very same Tamil Nadu sky that covers you in Chennai. Building this little universe for you, so proud of everything you've achieved, and counting down the days until our worlds meet in person.",
      color: "#93C5FD", // Soft Blue
      glowColor: "rgba(147, 197, 253, 0.45)",
      cityName: "Coimbatore, Tamil Nadu",
    },
  },

  /* -------------------------------------------------------------------------- */
  /* CHAPTER 3 & 10 — LIVING MEMORIES ARCHIVE                                    */
  /* -------------------------------------------------------------------------- */
  memories: [
    {
      id: "mem-starlight-portrait",
      type: "photo",
      mediaType: "image",
      orientation: "horizontal",
      title: "The Starlight Portrait",
      subtitle: "Elegance that stopped time",
      imagePath: "/memories/1792580021104.jpg",
      badge: "STILL PORTRAIT",
      snippet: "The picture where everything else in the room completely faded away.",
      revealedNote:
        "The traditional jewelry, the gentle focus, the sparkle in your eyes. Out of all the stars scattered across this midnight sky, you are easily the brightest one.",
      accent: "#C084FC",
    },
    {
      id: "mem-sunlit-laugh",
      type: "photo",
      mediaType: "image",
      orientation: "horizontal",
      title: "Sunlight & Your Laughter",
      subtitle: "My favourite sight in the universe",
      imagePath: "/memories/IMG_20260701_200747_397.jpg",
      badge: "GOLDEN HOUR",
      snippet: "That radiant, beaming laugh that feels like warm sunshine after months of cold.",
      revealedNote:
        "Look at that smile. It's completely unforced, pure, and genuinely contagious. Whenever I'm having a quiet or exhausting day, this one picture can reset everything in a heartbeat.",
      accent: "#FDE68A",
    },
    {
      id: "mem-night-glow-video",
      type: "message",
      mediaType: "video",
      orientation: "vertical",
      title: "The 01:34 AM Goodnight Glow",
      subtitle: "When the whole world goes quiet",
      videoPath: "/memories/VID_20260703_013414_130.mp4",
      duration: "0:02",
      badge: "01:34 AM VIDEO",
      hasAudio: false,
      snippet: "Those late-night moments when you smile at the camera and tuck your hair behind your ear.",
      revealedNote:
        "01:34 in the morning, the rest of the world fast asleep, and yet time completely halts. There's an unmatched softness in how you look when it's just the two of us talking across the distance.",
      accent: "#93C5FD",
    },
    {
      id: "mem-car-drive-video",
      type: "note",
      mediaType: "video",
      orientation: "vertical",
      title: "Highway Songs & Those Eyes",
      subtitle: "Earphones in, cruising through the afternoon",
      videoPath: "/memories/VID_20260901_105722_311.mp4",
      duration: "0:04",
      badge: "AUDIO STREAM",
      hasAudio: true,
      snippet: "The car breeze, your favourite songs, and that close zoom into your eyes.",
      revealedNote:
        "You listening to music with wired earphones, watching the trees glide by, and then that zoom into your eyes. You have the deepest, most expressive eyes I've ever seen.",
      accent: "#38BDF8",
    },
    {
      id: "mem-traditional-red-video",
      type: "photo",
      mediaType: "video",
      orientation: "vertical",
      title: "A Glimpse in Red",
      subtitle: "Traditional grace & that shy smile",
      videoPath: "/memories/VID_20260306_103009_216.mp4",
      duration: "0:03",
      badge: "TRADITIONAL CLIP",
      hasAudio: false,
      snippet: "The red patterned attire, the bindi, and that adorable little tilt of your head.",
      revealedNote:
        "You in traditional wear looks like something out of a classic poetry book. That shy little smile right before the camera cuts is my absolute favorite second in the world.",
      accent: "#F43F5E",
    },
    {
      id: "mem-candid-voice-video",
      type: "joke",
      mediaType: "video",
      orientation: "vertical",
      title: "Late Evening Candid",
      subtitle: "Gentle expressions & quiet smiles",
      videoPath: "/memories/VID_20260901_160804_563.mp4",
      duration: "0:02",
      badge: "EVENING CLIP",
      hasAudio: false,
      snippet: "Hand on your cheek, looking at the camera with that quiet, gentle smile — purely and genuinely you.",
      revealedNote:
        "The sweet little expressions, the way you look directly at the screen like you're right in front of me. Distance feels like nothing in quiet moments like this.",
      accent: "#F472B6",
    },
    {
      id: "mem-bgmi",
      type: "joke",
      title: "Dropping into the Zone",
      subtitle: "Where our story started",
      imagePath: null,
      badge: "BGMI SQUAD",
      snippet: "Two random players in a BGMI lobby who became each other's favorite person.",
      revealedNote:
        "Out of all the matches, all the maps, and all the chaos, meeting you in BGMI was the luckiest drop I ever made. You with your AMR, me watching your six — best duo partner in the world.",
      accent: "#EF4444",
    },
    {
      id: "mem-redbull",
      type: "joke",
      orientation: "vertical",
      title: "Bot's Starlight Fuel",
      subtitle: "The holy grail: Red Bull",
      imagePath: "/images/redbull-bot-can.jpg",
      badge: "STRENGTH & INDEPENDENCE",
      snippet: "How a cold silver-and-blue can fueled the tireless hustle and late-night determination to build your own future.",
      revealedNote:
        "Every time I see a can of Red Bull, I instantly think of you. You powered through the toughest times, stood tall when things were difficult, and worked relentlessly to build your own independence and earn your place in the world. Here's to your wings, Bot — you've earned every bit of your future.",
      accent: "#38BDF8",
    },
  ],

  /* -------------------------------------------------------------------------- */
  /* CHAPTER 5 — NOT YET, BUT SOMEDAY (CONSTELLATION OF 4 HOPES)                */
  /* -------------------------------------------------------------------------- */
  constellation: {
    heading: "A few things still waiting for us",
    subheading:
      "There's a whole collection of little things we haven't done together yet. I don't want to rush them or put dates on them. I just like knowing there are still so many possibilities waiting for us.",
    stars: [
      {
        id: 1,
        label: "First Hope",
        thought: "Our first photo together.",
        x: 22,
        y: 28,
      },
      {
        id: 2,
        label: "Second Hope",
        thought: "A walk where we don't have to say goodbye through a screen.",
        x: 74,
        y: 22,
      },
      {
        id: 3,
        label: "Third Hope",
        thought: "Sharing a meal at the same table.",
        x: 32,
        y: 72,
      },
      {
        id: 4,
        label: "Fourth Hope",
        thought: "Talking without a phone between us.",
        x: 80,
        y: 75,
      },
    ],
  },

  /* -------------------------------------------------------------------------- */
  /* CHAPTER 6 — THE BIRTHDAY LETTER                                             */
  /* -------------------------------------------------------------------------- */
  letter: {
    salutation: "Happy birthday, Bot. ❤️",
    paragraphs: [
      "Watching your journey — from the tough days when we first met to the fiercely independent woman you have fought to become — fills me with profound respect and pride. I know how hard you worked, how much quiet resilience you held inside, and how passionately you chased your dream of building your own future.",
      "From the shores of Chennai to the hills of Coimbatore, ~500 kilometers of Tamil Nadu lie between our worlds, but under this same sky, you never feel far away. I hope this birthday brings you deep peace, laughter, and endless excitement for everything your future holds.",
      "We haven't met in person yet, but knowing you are out there makes every day brighter. One day soon, whether it's a drive down the highway or a train pulling into the station, we'll turn all these late-night phone calls into real memories.",
      "Until our worlds meet, here's a little piece of mine for you.",
    ],
    closing: "Happy birthday, Bot. I'm really glad it's you. ❤️",
    signature: "Yours, always",
  },

  /* -------------------------------------------------------------------------- */
  /* OPTIONAL FINAL ACTION: CALL ME WHEN READY                                  */
  /* -------------------------------------------------------------------------- */
  contact: {
    // Set to true and supply a callUrl (e.g. 'tel:+1234567890' or 'https://wa.me/...') if desired
    enableCallOption: false,
    callUrl: undefined,
    callButtonText: "Call me when you're ready",
  },
};
