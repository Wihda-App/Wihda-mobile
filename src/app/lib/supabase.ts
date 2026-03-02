import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey);

export const API_BASE = `${supabaseUrl}/functions/v1/make-server-b33448f7`;

// Always use the anon key for Authorization so the Supabase gateway never rejects us.
// Pass the real user access token in a custom header (x-user-token) for our server to read.
function buildHeaders(userToken?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${publicAnonKey}`,
  };
  if (userToken) {
    headers['x-user-token'] = userToken;
  }
  return headers;
}

async function getAccessToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  } catch {
    return null;
  }
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = await getAccessToken();

  // Extract any explicit user token passed via options headers
  const customHeaders = (options.headers || {}) as Record<string, string>;
  const explicitToken = customHeaders['x-user-token']
    || (customHeaders['Authorization']
      ? customHeaders['Authorization'].replace('Bearer ', '')
      : null);

  const effectiveToken = explicitToken || token;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...buildHeaders(effectiveToken),
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 401) {
      console.log(`Auth required for ${path} (401) — user not logged in`);
    } else {
      console.error(`API error ${res.status} on ${path}:`, errText);
    }
    throw new Error(errText || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export async function apiUpload(path: string, formData: FormData) {
  const token = await getAccessToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      ...buildHeaders(token),
    },
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 401) {
      console.log(`Auth required for ${path} (401) — user not logged in`);
    } else {
      console.error(`Upload error ${res.status} on ${path}:`, errText);
    }
    throw new Error(errText || `Upload failed with status ${res.status}`);
  }

  return res.json();
}
