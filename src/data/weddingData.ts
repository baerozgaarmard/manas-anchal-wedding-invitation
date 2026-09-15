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
export const weddingData = {
  couple: { groom: "Manas", bride: "Anchal" },
  year: null as number | null,
  familyDetails: "",
  rsvpEndpoint: "",
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
      date: "02 November",
      chapter: "The beginning of forever",
      line: "Two hearts. Seven promises. A lifetime together.",
    },
  ] as WeddingEvent[],
};
