export function extractData(response) {
  return response?.data?.data ?? response?.data ?? response;
}

export function extractArray(
  response,
  keys = ['places', 'results', 'items', 'users', 'feedback', 'history', 'expenses', 'trips']
) {
  const data = extractData(response);

  if (Array.isArray(data)) {
    return data;
  }

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

export function extractMessage(error, fallbackMessage) {
  return error?.response?.data?.message || error?.message || fallbackMessage;
}
