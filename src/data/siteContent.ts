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
  title: string;
  subtitle: string;
  /**
   * Path relative to public folder (e.g. '/images/memories/photo1.webp')
   * Leave as null/undefined to use the elegant abstract celestial placeholder.
   */
  imagePath?: string | null;
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
      label: "Your world",
      title: "Where you are",
      imagePath: null, // Set to "/images/planet-you.webp" when ready
      personalNote:
        "Under your sky, living your days, making everyone around you smile. Even from miles away, your presence brightens up my everyday life.",
      color: "#A78BFA", // Lavender
      glowColor: "rgba(167, 139, 250, 0.45)",
      cityName: undefined, // Keep undefined to respect privacy
    },
    myWorld: {
      label: "My world",
      title: "Where I am",
      imagePath: null, // Set to "/images/planet-me.webp" when ready
      personalNote:
        "Here in my city, looking up at the same stars and building this little corner of the universe for you. You're always on my mind.",
      color: "#93C5FD", // Soft Blue
      glowColor: "rgba(147, 197, 253, 0.45)",
      cityName: undefined, // Keep undefined to respect privacy
    },
  },

  /* -------------------------------------------------------------------------- */
  /* CHAPTER 3 — THE LITTLE THINGS (INTERACTIVE MEMORY OBJECTS)                  */
  /* -------------------------------------------------------------------------- */
  memories: [
    {
      id: "mem-photo",
      type: "photo",
      title: "A Picture You Shared",
      subtitle: "A glimpse into your day",
      imagePath: null, // Set to "/images/memories/real-photo.webp" when ready
      snippet: "That picture you sent that made me pause and smile for minutes.",
      revealedNote:
        "Every little picture you share gives me a window into your world. It's one of my favorite things in my day.",
      accent: "#A78BFA",
    },
    {
      id: "mem-msg",
      type: "message",
      title: "A Genuine Message",
      subtitle: "Words that stayed with me",
      imagePath: null,
      snippet: "The message that arrived right when I needed to hear from you.",
      revealedNote:
        "Sometimes just seeing your notification pop up completely resets whatever kind of day I was having. Thank you for that.",
      accent: "#93C5FD",
    },
    {
      id: "mem-joke",
      type: "joke",
      title: "Our Inside Joke",
      subtitle: "Something only we laugh at",
      imagePath: null,
      snippet: "The silly remark that made no sense to anyone else except us.",
      revealedNote:
        "I love the banter we have — how effortlessly we can tease each other and turn an ordinary conversation into laughter.",
      accent: "#FDE68A",
    },
    {
      id: "mem-redbull",
      type: "joke",
      title: "Bot's Starlight Fuel",
      subtitle: "The holy grail: Red Bull",
      imagePath: null,
      snippet: "How a cold silver-and-blue can became our sweetest late-night staple.",
      revealedNote:
        "Every time I see a can of Red Bull, I instantly think of you. Whether you're working hard, studying late, or talking with me, you are my favorite person in the whole universe to cheer for.",
      accent: "#38BDF8",
    },
    {
      id: "mem-note",
      type: "note",
      title: "A Quiet Thought",
      subtitle: "Written just for you",
      imagePath: null,
      snippet: "Knowing you are out there makes the whole universe feel warmer.",
      revealedNote:
        "You don't even have to try. Just being who you are is more than enough, and I appreciate you more than you know.",
      accent: "#F472B6",
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
      "I wish I could be there to celebrate with you today, to see your smile in person, and to make this day feel a little more special for you.",
      "Even though we're in different cities, I'm grateful that our paths crossed and that I get to be part of your world. I hope this next year brings you happiness, peace, beautiful surprises, and so many reasons to smile.",
      "We haven't met in person yet, and there's still so much we haven't experienced together. But I hope that, when that day comes, we get to turn some of these little hopes into real memories.",
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
