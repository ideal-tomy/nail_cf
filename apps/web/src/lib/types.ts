export type Customer = {
  id: string;
  name: string;
  nameKana: string | null;
  phone: string | null;
  lineName: string | null;
  birthday: string | null;
  preference: string | null;
  note: string | null;
  contactIntervalDays: number;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VisitPhoto = {
  id: string;
  path: string;
  thumbPath: string;
  sortOrder: number;
  createdAt: string;
};

export type Visit = {
  id: string;
  customerId: string;
  bookingId: string | null;
  visitedOn: string;
  menu: string | null;
  design: string | null;
  note: string | null;
  price: number | null;
  createdAt: string;
  updatedAt: string;
  photos: VisitPhoto[];
};

export type CustomerInput = {
  name: string;
  nameKana?: string;
  phone?: string;
  lineName?: string;
  birthday?: string;
  preference?: string;
  note?: string;
  contactIntervalDays?: number;
};

export type VisitInput = {
  visitedOn: string;
  menu?: string;
  design?: string;
  note?: string;
  price?: number | null;
};

export type MessageTemplate = {
  id: string;
  title: string;
  body: string;
  sortOrder: number;
};

export type ContactRecommendation = {
  customerId: string;
  name: string;
  daysSince: number;
  lastVisit: string;
  lastDesign: string | null;
  contactIntervalDays: number;
  latestVisitId: string;
  thumbPath: string | null;
  photoPath: string | null;
};

export type Booking = {
  id: string;
  customerId: string | null;
  customerName: string | null;
  startsAt: string;
  endsAt: string;
  menu: string | null;
  note: string | null;
  status: 'reserved' | 'done' | 'canceled' | string;
  createdAt: string;
  updatedAt: string;
};

export type BookingInput = {
  customerId?: string | null;
  startsAt: string;
  durationMin?: number;
  menu?: string;
  note?: string;
  status?: string;
};

export type HomeResponse = {
  todayBookings: Booking[];
  contactRecommendations: ContactRecommendation[];
};
