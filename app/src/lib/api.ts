const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export class ApiRequestError extends Error {
  status: number;
  path: string;

  constructor(path: string, status: number) {
    super(`API request failed: ${status} (${path})`);
    this.name = 'ApiRequestError';
    this.status = status;
    this.path = path;
  }
}

interface ApiListResponse<T> {
  data: T[];
  total: number;
}

interface ApiItemResponse<T> {
  data: T;
}

export interface AuthUser {
  id: string;
  role: 'client' | 'artist';
  artistId?: string;
  name: string;
  email: string;
  location: string;
}

export interface BookingRecord {
  id: string;
  artistId: string;
  clientId?: string;
  clientName: string;
  service: string;
  date: string;
  time: string;
  status: string;
  paymentStatus?: string;
  location: string;
  notes?: string;
  serviceAmount?: number;
  bookingFee?: number;
  totalAmount?: number;
  refundAmount?: number;
  rematchEligible?: boolean;
  priceProtectionLimit?: number;
}

export interface ConversationRecord {
  id: string;
  artistId: string;
  artistName: string;
  messages: {
    id: string;
    sender: string;
    text: string;
    sentAt: string;
  }[];
}

export interface ArtistRequestRecord {
  id: string;
  artistId: string;
  clientName: string;
  service: string;
  eventDate: string;
  eventTime: string;
  location: string;
  budget: string;
  status: string;
  note: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers ?? undefined);

  if (!headers.has('Content-Type') && init?.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...init,
  });

  if (!response.ok) {
    throw new ApiRequestError(path, response.status);
  }

  return response.json() as Promise<T>;
}

export async function fetchArtists<T>() {
  return request<ApiListResponse<T>>('/artists');
}

export async function fetchBookings<T>() {
  return request<ApiListResponse<T>>('/bookings');
}

export async function fetchArtistRequests(artistId: string) {
  return request<ApiListResponse<ArtistRequestRecord>>(`/requests?artistId=${artistId}`);
}

export async function createBooking<T>(payload: {
  artistId: string;
  clientId?: string;
  clientName: string;
  service: string;
  date: string;
  time: string;
  location: string;
  notes?: string;
  quotedAmount?: number;
}) {
  return request<ApiItemResponse<T>>('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateBookingStatus<T>(bookingId: string, action: 'accept' | 'decline' | 'cancel_by_artist') {
  return request<ApiItemResponse<T>>(`/bookings/${bookingId}`, {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  });
}

export async function fetchSavedArtists<T>(clientId = 'client-1') {
  return request<ApiListResponse<T>>(`/saved-artists?clientId=${clientId}`);
}

export async function saveArtist(clientId: string, artistId: string) {
  return request<ApiItemResponse<{ clientId: string; artistId: string }>>('/saved-artists', {
    method: 'POST',
    body: JSON.stringify({ clientId, artistId }),
  });
}

export async function removeSavedArtist(clientId: string, artistId: string) {
  return request<ApiItemResponse<{ clientId: string; artistId: string }>>('/saved-artists', {
    method: 'DELETE',
    body: JSON.stringify({ clientId, artistId }),
  });
}

export async function fetchConversations() {
  return request<ApiListResponse<ConversationRecord>>('/conversations');
}

export async function sendMessage<T>(payload: {
  conversationId?: string;
  artistId?: string;
  sender: string;
  text: string;
}) {
  return request<ApiItemResponse<T>>('/messages', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function login(payload: {
  role: 'client' | 'artist';
  email: string;
  password: string;
}) {
  return request<ApiItemResponse<AuthUser>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateArtistProfile<T>(artistId: string, payload: Partial<T>) {
  return request<ApiItemResponse<T>>(`/artists/${artistId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function uploadPortfolioImages(payload: {
  artistId: string;
  files: { name: string; dataUrl: string }[];
}) {
  const response = await request<ApiItemResponse<{ id: string; url: string; caption: string; style: string }[]>>(
    '/uploads/portfolio',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );

  return {
    ...response,
    data: response.data.map((item) => ({
      ...item,
      url: item.url.startsWith('http') ? item.url : `${API_BASE_URL}${item.url}`,
    })),
  };
}

export { API_BASE_URL };
