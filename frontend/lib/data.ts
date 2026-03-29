export type Pantry = {
  id: string;
  name: string;
  address: string;
  hours: string;
  note: string;
  lat: number;
  lng: number;
};

/** When present (e.g. from Google Places), enables per-day hours UI. */
export type LibraryDayHours = {
  day: string;
  hours: string;
};

export type LibrarySpot = {
  id: string;
  name: string;
  address: string;
  hours: string;
  hoursByDay?: LibraryDayHours[];
  wifi: string;
  noise: "Quiet" | "Moderate" | "Lively";
  vibe: "Solo Focus" | "Group Friendly" | "Café Energy";
  lat: number;
  lng: number;
};

export type Apartment = {
  id: string;
  address: string;
  image: number;
  rent: number;
  bedrooms: number;
  bathrooms: string;
};

export const pantries: Pantry[] = [
  {
    id: "p1",
    name: "Queens College Food Pantry",
    address: "65-30 Kissena Blvd, Flushing, NY 11367",
    hours: "Mon–Thu 10am–4pm",
    note: "Student ID required; dry goods and produce when available.",
    lat: 40.7386,
    lng: -73.8185,
  },
  {
    id: "p2",
    name: "La Jornada Food Pantry",
    address: "133-36 Roosevelt Ave, Flushing, NY 11354",
    hours: "Tue–Sat 9am–2pm",
    note: "Multilingual staff; bring reusable bag.",
    lat: 40.7598,
    lng: -73.8314,
  },
  {
    id: "p3",
    name: "Hour Children Community Pantry",
    address: "27-18 12th St, Long Island City, NY 11102",
    hours: "Wed & Fri 12pm–5pm",
    note: "Priority for families; appointment recommended.",
    lat: 40.747,
    lng: -73.942,
  },
  {
    id: "p4",
    name: "Astoria Food Pantry @ Mosaic",
    address: "38-01 23rd St, Astoria, NY 11101",
    hours: "Mon/Wed/Fri 11am–3pm",
    note: "Hot meal vouchers on Thursdays.",
    lat: 40.7574,
    lng: -73.9365,
  },
  {
    id: "p5",
    name: "Sunnyside Community Services Pantry",
    address: "43-31 39th St, Sunnyside, NY 11104",
    hours: "Tue–Thu 10am–1pm",
    note: "Nutrition workshops monthly.",
    lat: 40.7447,
    lng: -73.9204,
  },
  {
    id: "p6",
    name: "Elmhurst Hospital Mobile Pantry Stop",
    address: "79-01 Broadway, Elmhurst, NY 11373",
    hours: "1st & 3rd Sat 8am–11am",
    note: "Near campus shuttle stop; arrive early.",
    lat: 40.7465,
    lng: -73.8912,
  },
  {
    id: "p7",
    name: "Forest Hills Community House",
    address: "108-25 62nd Dr, Forest Hills, NY 11375",
    hours: "Mon–Fri 9am–5pm",
    note: "Household goods closet on-site.",
    lat: 40.7276,
    lng: -73.8456,
  },
  {
    id: "p8",
    name: "Brooklyn Queens Land Trust – Jackson Heights",
    address: "34th Ave & 93rd St, Jackson Heights, NY 11372",
    hours: "Sat 10am–1pm (seasonal)",
    note: "Fresh produce from community gardens.",
    lat: 40.7528,
    lng: -73.8761,
  },
];

export const libraries: LibrarySpot[] = [
  {
    id: "l1",
    name: "Benjamin S. Rosenthal Library (QC)",
    address: "65-30 Kissena Blvd, Flushing, NY 11367",
    hours: "Mon–Thu 8am–11pm · Fri 8am–7pm · Sun 12pm–8pm",
    wifi: "Eduroam + guest",
    noise: "Quiet",
    vibe: "Solo Focus",
    lat: 40.7389,
    lng: -73.8178,
  },
  {
    id: "l2",
    name: "Queens Public Library – Central",
    address: "89-11 Merrick Blvd, Jamaica, NY 11432",
    hours: "Mon–Thu 10am–8pm · Sat 10am–5pm",
    wifi: "Free public",
    noise: "Moderate",
    vibe: "Group Friendly",
    lat: 40.7057,
    lng: -73.7939,
  },
  {
    id: "l3",
    name: "Hunter College Libraries (remote pickup)",
    address: "695 Park Ave, New York, NY 10065",
    hours: "Stacks vary; study zones 24/7 card access",
    wifi: "CUNY secure",
    noise: "Quiet",
    vibe: "Solo Focus",
    lat: 40.7685,
    lng: -73.9646,
  },
  {
    id: "l4",
    name: "Astoria Bookshop Study Nook",
    address: "31-29 31st St, Astoria, NY 11106",
    hours: "Daily 9am–9pm (café)",
    wifi: "Purchase encouraged",
    noise: "Lively",
    vibe: "Café Energy",
    lat: 40.7612,
    lng: -73.9264,
  },
  {
    id: "l5",
    name: "Brooklyn Public Library – Business & Career Center",
    address: "10 Grand Army Plaza, Brooklyn, NY 11238",
    hours: "Tue–Thu 9am–8pm",
    wifi: "Free",
    noise: "Moderate",
    vibe: "Group Friendly",
    lat: 40.6727,
    lng: -73.9686,
  },
  {
    id: "l6",
    name: "NYPL – Stavros Niarchos Foundation Library",
    address: "455 Fifth Ave, New York, NY 10016",
    hours: "Mon–Sat 8am–8pm",
    wifi: "Free",
    noise: "Quiet",
    vibe: "Solo Focus",
    lat: 40.752,
    lng: -73.9827,
  },
  {
    id: "l7",
    name: "WeWork Gotham (day pass study)",
    address: "214 W 29th St, New York, NY 10001",
    hours: "Mon–Fri 9am–6pm hot desks",
    wifi: "Enterprise",
    noise: "Moderate",
    vibe: "Café Energy",
    lat: 40.7469,
    lng: -73.9941,
  },
  {
    id: "l8",
    name: "Think Coffee – Morningside",
    address: "123 La Salle St, New York, NY 10027",
    hours: "Daily 7am–8pm",
    wifi: "Free with purchase",
    noise: "Lively",
    vibe: "Café Energy",
    lat: 40.8126,
    lng: -73.9601,
  },
];

/*
export const apartments: Apartment[] = [
  {
    id: "a1",
    neighborhood: "Flushing",
    price: 1450,
    bedrooms: 1,
    distanceMiles: 0.4,
    description:
      "Walk to Kissena corridor; laundry in building; heat included.",
    amenities: ["Laundry", "Heat included", "Near shuttle"],
  },
  {
    id: "a2",
    neighborhood: "Murray Hill (Queens)",
    price: 1325,
    bedrooms: 2,
    distanceMiles: 1.1,
    description: "Shared unit with separate study nook; quiet block.",
    amenities: ["Roommates OK", "Furnished common"],
  },
  {
    id: "a3",
    neighborhood: "Forest Hills",
    price: 1895,
    bedrooms: 1,
    distanceMiles: 2.3,
    description: "Elevator building; 24hr doorman; express bus to Manhattan.",
    amenities: ["Doorman", "Elevator", "Gym"],
  },
  {
    id: "a4",
    neighborhood: "Elmhurst",
    price: 1199,
    bedrooms: 1,
    distanceMiles: 1.8,
    description: "Basement studio; private entrance; utilities split.",
    amenities: ["Private entrance", "Utilities split"],
  },
  {
    id: "a5",
    neighborhood: "Sunnyside",
    price: 1650,
    bedrooms: 2,
    distanceMiles: 3.0,
    description: "Top floor; cross-ventilation; pet-friendly with deposit.",
    amenities: ["Pet friendly", "Dishwasher"],
  },
  {
    id: "a6",
    neighborhood: "Long Island City",
    price: 2100,
    bedrooms: 1,
    distanceMiles: 4.5,
    description: "Luxury amenities; roof deck; 7 train two blocks.",
    amenities: ["Roof deck", "Gym", "Lounge"],
  },
];
*/
