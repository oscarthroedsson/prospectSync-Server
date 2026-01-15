"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeTimeValues = normalizeTimeValues;
// Try to parse a string as a date
function parseTimeGeneric(v) {
    // Using Date.parse which handles most common formats
    const parsed = new Date(v);
    if (!isNaN(parsed.getTime())) {
        return parsed;
    }
    return null;
}
// NormalizeTimeValues recursively traverses an unmarshalled JSON object
// and converts all valid time strings into Date objects
function normalizeTimeValues(data) {
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
        const result = {};
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
//# sourceMappingURL=normalize-time-values.js.map