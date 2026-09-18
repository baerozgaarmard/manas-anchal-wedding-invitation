export type ScheduleItem = {
  label?: string;
  time?: string;
  text?: string; // For text-based items e.g. "Followed by Dinner" or "Vivah Sanskar — Shubh Lagnanusar"
};

export type LocationId = "familyResidence" | "sharmaFarms";

export type VenueLocation = {
  id: LocationId;
  name: string;
  address: string[];
  googleMapsUrl: string;
  embedUrl?: string;
};

export type WeddingEvent = {
  id: string;
  locationId: LocationId;
  title: string;
  date: string;
  shortDate: string;
  fullDate: string;
  chapter: string;
  line: string;
  scheduleLabel?: string;
  schedule: ScheduleItem[];
  venueLabel?: string;
  venueTitle?: string;
  venueAddress: string[];
  baratRoute?: string[];
  isMainVenueEmphasized?: boolean;
  time?: string;
  venue?: string;
  address?: string;
  mapUrl?: string;
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
  locations: {
    familyResidence: {
      id: "familyResidence" as const,
      name: "Family Residence",
      address: [
        "Village & Post Rudrapur",
        "Vikas Nagar, Dehradun",
      ],
      googleMapsUrl:
        "https://maps.app.goo.gl/s63AymCiJmfkugBp9?g_st=ic",
      embedUrl:
        "https://maps.google.com/maps?q=30.4469800,77.8533330&hl=en&z=16&output=embed",
    },
    sharmaFarms: {
      id: "sharmaFarms" as const,
      name: "Sharma Farms",
      address: [
        "Bahuwala, Dehradun",
      ],
      googleMapsUrl: "https://maps.app.goo.gl/RHxXSteNytH2wAbE9",
      embedUrl:
        "https://maps.google.com/maps?cid=2478930000041440583&hl=en&z=16&output=embed",
    },
  },
  location: {
    venue: "Sharma Farms",
    address: "Bahuwala, Dehradun",
    googleMapsUrl: "https://maps.app.goo.gl/RHxXSteNytH2wAbE9",
    embedUrl:
      "https://maps.google.com/maps?cid=2478930000041440583&hl=en&z=16&output=embed",
  },
  musicUrl: "",
  events: [
    {
      id: "mata",
      locationId: "familyResidence" as const,
      title: "Mata Ki Chowki",
      date: "30 October",
      shortDate: "30 OCTOBER",
      fullDate: "FRIDAY · 30 OCTOBER 2026",
      chapter: "With blessings",
      line: "An evening of devotion. A beginning blessed with love.",
      scheduleLabel: "SCHEDULE",
      schedule: [
        {
          label: "Jyoti Prajavalan",
          time: "3:00 PM",
        },
        {
          label: "Dinner",
          time: "7:00 PM onwards",
        },
      ],
      venueLabel: "VENUE",
      venueTitle: "Family Residence",
      venueAddress: ["Village & Post Rudrapur", "Vikas Nagar, Dehradun"],
      venue: "Family Residence, Rudrapur, Vikas Nagar",
      address: "Village & Post Rudrapur, Vikas Nagar, Dehradun",
      mapUrl: "https://maps.app.goo.gl/s63AymCiJmfkugBp9?g_st=ic",
    },
    {
      id: "mehendi",
      locationId: "familyResidence" as const,
      title: "Mehandi & Cocktail",
      date: "31 October",
      shortDate: "31 OCTOBER",
      fullDate: "SATURDAY · 31 OCTOBER 2026",
      chapter: "Under the stars",
      line: "Henna on our hands. A little magic in the air.",
      scheduleLabel: "TIME",
      schedule: [
        {
          text: "7:00 PM onwards",
        },
        {
          text: "Followed by Dinner",
        },
      ],
      venueLabel: "VENUE",
      venueTitle: "Family Residence",
      venueAddress: ["Village & Post Rudrapur", "Vikas Nagar, Dehradun"],
      venue: "Family Residence, Rudrapur, Vikas Nagar",
      address: "Village & Post Rudrapur, Vikas Nagar, Dehradun",
      mapUrl: "https://maps.app.goo.gl/s63AymCiJmfkugBp9?g_st=ic",
    },
    {
      id: "haldi",
      locationId: "familyResidence" as const,
      title: "Haldi Hath & Mangal Snan",
      date: "01 November",
      shortDate: "01 NOVEMBER",
      fullDate: "SUNDAY · 01 NOVEMBER 2026",
      chapter: "A little sunshine",
      line: "Bathed in turmeric, laughter, and the love of our own.",
      scheduleLabel: "SCHEDULE",
      schedule: [
        {
          label: "Haldi Hath",
          time: "9:00 AM",
        },
        {
          label: "Mangal Snan",
          time: "10:00 AM",
        },
        {
          label: "Preetibhoj / Lunch",
          time: "1:00 PM",
        },
      ],
      venueLabel: "VENUE",
      venueTitle: "Family Residence",
      venueAddress: ["Village & Post Rudrapur", "Dehradun"],
      venue: "Family Residence, Rudrapur",
      address: "Village & Post Rudrapur, Dehradun",
      mapUrl: "https://maps.app.goo.gl/s63AymCiJmfkugBp9?g_st=ic",
    },
    {
      id: "vivah",
      locationId: "sharmaFarms" as const,
      title: "Vivah Sanskar",
      date: wedding.dateLabel,
      shortDate: "02 NOVEMBER",
      fullDate: "MONDAY · 02 NOVEMBER 2026",
      chapter: "The beginning of forever",
      line: "Two hearts. Seven promises. A lifetime together.",
      scheduleLabel: "SCHEDULE",
      schedule: [
        {
          label: "Mandha Poojan",
          time: "10:00 AM",
        },
        {
          label: "Sehrabandi",
          time: "4:00 PM",
        },
        {
          label: "Barat Departure",
          time: "6:00 PM",
        },
        {
          label: "Dinner",
          time: "8:00 PM",
        },
        {
          label: "Vivah Sanskar",
          time: "Shubh Lagnanusar",
        },
      ],
      baratRoute: [
        "Family Residence, Rudrapur",
        "Opp. S.G.R.R. Inter College, Bhauwala",
        "Sharma Farms",
      ],
      venueLabel: "MAIN VENUE",
      venueTitle: "SHARMA FARMS",
      venueAddress: ["Bahuwala, Dehradun"],
      isMainVenueEmphasized: true,
      venue: "SHARMA FARMS, Bahuwala",
      address: "Bahuwala, Dehradun",
      mapUrl: "https://maps.app.goo.gl/RHxXSteNytH2wAbE9",
    },
  ] as WeddingEvent[],
};
