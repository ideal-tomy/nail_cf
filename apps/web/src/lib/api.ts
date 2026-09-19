import type {
  Booking,
  BookingInput,
  ContactRecommendation,
  Customer,
  CustomerInput,
  HomeResponse,
  MessageTemplate,
  Visit,
  VisitInput,
} from './types';

export type HealthResponse = {
  ok: boolean;
  service: string;
  db: boolean;
  ts: string;
};

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

export async function fetchHealth(): Promise<HealthResponse> {
  return request<HealthResponse>('/api/health');
}

export async function fetchMe(): Promise<{ email: string } | null> {
  const res = await fetch('/api/auth/me', { credentials: 'include' });
  if (res.status === 401) return null;
  if (!res.ok) {
    throw new ApiError(res.status, '認証状態の取得に失敗しました');
  }
  const data = (await res.json()) as { authenticated: boolean; email?: string };
  return data.authenticated && data.email ? { email: data.email } : null;
}

export async function login(email: string, password: string): Promise<void> {
  await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(): Promise<void> {
  await request('/api/auth/logout', { method: 'POST' });
}

export async function listCustomers(q?: string): Promise<Customer[]> {
  const query = q?.trim() ? `?q=${encodeURIComponent(q.trim())}` : '';
  const data = await request<{ customers: Customer[] }>(`/api/customers${query}`);
  return data.customers;
}

export async function getCustomer(id: string): Promise<Customer> {
  const data = await request<{ customer: Customer }>(`/api/customers/${id}`);
  return data.customer;
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  const data = await request<{ customer: Customer }>('/api/customers', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.customer;
}

export async function updateCustomer(id: string, input: Partial<CustomerInput>): Promise<Customer> {
  const data = await request<{ customer: Customer }>(`/api/customers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return data.customer;
}

export async function listVisits(customerId: string): Promise<Visit[]> {
  const data = await request<{ visits: Visit[] }>(`/api/customers/${customerId}/visits`);
  return data.visits;
}

export async function createVisit(customerId: string, input: VisitInput): Promise<Visit> {
  const data = await request<{ visit: Visit }>(`/api/customers/${customerId}/visits`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.visit;
}

export async function fetchHome(): Promise<{
  todayBookings: Booking[];
  contactRecommendations: ContactRecommendation[];
}> {
  return request<HomeResponse>('/api/home');
}

export async function listBookings(from: string, to: string): Promise<Booking[]> {
  const params = new URLSearchParams({ from, to });
  const data = await request<{ bookings: Booking[] }>(`/api/bookings?${params}`);
  return data.bookings;
}

export async function createBooking(input: BookingInput): Promise<Booking> {
  const data = await request<{ booking: Booking }>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.booking;
}

export async function updateBooking(id: string, input: Partial<BookingInput>): Promise<Booking> {
  const data = await request<{ booking: Booking }>(`/api/bookings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return data.booking;
}

export async function deleteBooking(id: string): Promise<void> {
  await request(`/api/bookings/${id}`, { method: 'DELETE' });
}

export async function fetchTemplates(): Promise<MessageTemplate[]> {
  const data = await request<{ templates: MessageTemplate[] }>('/api/templates');
  return data.templates;
}

export async function createContactLog(input: {
  customerId: string;
  body: string;
  templateKey?: string | null;
  channel?: string;
}): Promise<void> {
  await request('/api/contact-logs', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function uploadVisitPhotos(
  visitId: string,
  display: Blob,
  thumb: Blob,
): Promise<void> {
  const form = new FormData();
  form.append('display', display, 'display.jpg');
  form.append('thumb', thumb, 'thumb.jpg');

  await request(`/api/visits/${visitId}/photos`, {
    method: 'POST',
    body: form,
  });
}

export { ApiError };
