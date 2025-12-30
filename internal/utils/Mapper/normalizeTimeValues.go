package mapper

import (
	"time"
)

// Lista över tidsformat vi vill stödja
var timeFormats = []string{
	time.RFC3339Nano,                // 2025-12-30T09:31:29.214605Z
	time.RFC3339,                    // 2025-12-30T09:31:29Z
	"2006-01-02 15:04:05",           // vanlig SQL datetime
	"2006-01-02 15:04:05.999999-07", // Postgres timestamptz
}

// Försök parse:a en sträng med alla formats i listan
func parseTimeGeneric(v string) (time.Time, bool) {
	for _, f := range timeFormats {
		t, err := time.Parse(f, v)
		if err == nil {
			return t, true
		}
	}
	return time.Time{}, false
}

// NormalizeTimeValues recursively traverses an unmarshalled JSON object
// and converts all valid time strings into time.Time
func NormalizeTimeValues(data interface{}) interface{} {
	switch v := data.(type) {
	case string:
		// Om det är en tidssträng → konvertera till time.Time
		if t, ok := parseTimeGeneric(v); ok {
			return t
		}
		return v
	case map[string]interface{}:
		// Gå igenom alla keys rekursivt
		for key, val := range v {
			v[key] = NormalizeTimeValues(val)
		}
		return v
	case []interface{}:
		// Gå igenom alla element i arrayen rekursivt
		for i, val := range v {
			v[i] = NormalizeTimeValues(val)
		}
		return v
	default:
		// Annars lämna värdet som det är
		return v
	}
}
