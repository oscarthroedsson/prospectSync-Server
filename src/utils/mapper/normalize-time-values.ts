// Try to parse a string as a date
function parseTimeGeneric(v: string): Date | null {
  // Using Date.parse which handles most common formats
  const parsed = new Date(v);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  return null;
}

// NormalizeTimeValues recursively traverses an unmarshalled JSON object
// and converts all valid time strings into Date objects
export function normalizeTimeValues(data: any): any {
  if (typeof data === "string") {
    // If it's a time string → convert to Date
    const parsed = parseTimeGeneric(data);
    if (parsed) {
      return parsed;
    }
    return data;
  }

  if (Array.isArray(data)) {
    // Go through all elements in the array recursively
    return data.map((val) => normalizeTimeValues(val));
  }

  if (data && typeof data === "object") {
    // Go through all keys recursively
    const result: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = normalizeTimeValues(data[key]);
      }
    }
    return result;
  }

  // Otherwise leave the value as is
  return data;
}
