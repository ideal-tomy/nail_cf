export type CustomerRow = {
  id: string;
  name: string;
  name_kana: string | null;
  phone: string | null;
  line_name: string | null;
  birthday: string | null;
  preference: string | null;
  note: string | null;
  contact_interval_days: number;
  archived: number;
  created_at: string;
  updated_at: string;
};

export type VisitRow = {
  id: string;
  customer_id: string;
  booking_id: string | null;
  visited_on: string;
  menu: string | null;
  design: string | null;
  note: string | null;
  price: number | null;
  created_at: string;
  updated_at: string;
};

export type VisitPhotoRow = {
  id: string;
  visit_id: string;
  path: string;
  thumb_path: string;
  sort_order: number;
  created_at: string;
};

export type CustomerInput = {
  name?: string;
  name_kana?: string | null;
  phone?: string | null;
  line_name?: string | null;
  birthday?: string | null;
  preference?: string | null;
  note?: string | null;
  contact_interval_days?: number;
};

export type VisitInput = {
  visited_on?: string;
  menu?: string | null;
  design?: string | null;
  note?: string | null;
  price?: number | null;
};

export type BookingRow = {
  id: string;
  customer_id: string | null;
  starts_at: string;
  ends_at: string;
  menu: string | null;
  note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type BookingInput = {
  customerId?: string | null;
  startsAt?: string;
  durationMin?: number;
  endsAt?: string;
  menu?: string | null;
  note?: string | null;
  status?: string;
};
