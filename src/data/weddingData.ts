export type WeddingEvent = {
  id: string;
  title: string;
  date: string;
  chapter: string;
  line: string;
  time?: string;
  venue?: string;
  address?: string;
  mapUrl?: string;
  startsAt?: string;
  endsAt?: string;
};
export type WeddingDateConfig = {
  year: number | null;
  month: number;
  day: number;
  dateLabel: string;
  time: string | null;
  timezone: string;
  todayMessage: string;
  pastMessage: string;
};

const wedding: WeddingDateConfig = {
  // Set the confirmed year here. Never infer the next occurrence automatically.
  year: 2026,
  month: 11,
  day: 2,
  dateLabel: "02 November",
  // Local HH:mm ceremony time. Null counts to the start of the wedding DAY,
  // once the year is confirmed; midnight is never presented as a ceremony time.
  time: null,
  timezone: "Asia/Kolkata",
  todayMessage: "Our forever begins today.",
  pastMessage: "And so our forever began.",
};

export const weddingData = {
  couple: { groom: "Manas", bride: "Anchal" },
  wedding,
  familyDetails: "",
  closing: { message: "Join us as we begin our forever." },
  location: {
    venue: "",
    address: "",
    googleMapsUrl: "",
    embedUrl: "",
  },
  musicUrl: "",
  events: [
    {
      id: "mata",
      title: "Mata Ki Chowki",
      date: "30 October",
      chapter: "With blessings",
      line: "An evening of devotion. A beginning blessed with love.",
    },
    {
      id: "mehendi",
      title: "Mehandi & Cocktail",
      date: "31 October",
      chapter: "Under the stars",
      line: "Henna on our hands. A little magic in the air.",
    },
    {
      id: "haldi",
      title: "Haldi Hath & Mangal Snan",
      date: "01 November",
      chapter: "A little sunshine",
      line: "Bathed in turmeric, laughter, and the love of our own.",
    },
    {
      id: "vivah",
      title: "Vivah Sanskar",
      date: wedding.dateLabel,
      chapter: "The beginning of forever",
      line: "Two hearts. Seven promises. A lifetime together.",
    },
  ] as WeddingEvent[],
};
