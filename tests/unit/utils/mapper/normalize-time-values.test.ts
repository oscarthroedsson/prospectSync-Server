import { normalizeTimeValues } from "../../../../src/utils/mapper/normalize-time-values";

describe("Normalize Time Values", () => {
  it("should convert time strings to Date objects", () => {
    const data = {
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-02T12:30:45Z",
    };

    const result = normalizeTimeValues(data);

    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(result.createdAt.getTime()).toBe(new Date("2024-01-01T00:00:00Z").getTime());
  });

  it("should handle arrays with time strings", () => {
    const data = {
      dates: ["2024-01-01T00:00:00Z", "2024-01-02T00:00:00Z"],
    };

    const result = normalizeTimeValues(data);

    expect(result.dates).toHaveLength(2);
    expect(result.dates[0]).toBeInstanceOf(Date);
    expect(result.dates[1]).toBeInstanceOf(Date);
  });

  it("should handle nested objects", () => {
    const data = {
      job: {
        createdAt: "2024-01-01T00:00:00Z",
        nested: {
          updatedAt: "2024-01-02T00:00:00Z",
        },
      },
    };

    const result = normalizeTimeValues(data);

    expect(result.job.createdAt).toBeInstanceOf(Date);
    expect(result.job.nested.updatedAt).toBeInstanceOf(Date);
  });

  it("should leave non-time strings unchanged", () => {
    const data = {
      name: "John Doe",
      email: "john@example.com",
      createdAt: "2024-01-01T00:00:00Z",
    };

    const result = normalizeTimeValues(data);

    expect(result.name).toBe("John Doe");
    expect(result.email).toBe("john@example.com");
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it("should handle invalid time strings", () => {
    const data = {
      invalidDate: "not a date",
      validDate: "2024-01-01T00:00:00Z",
    };

    const result = normalizeTimeValues(data);

    expect(result.invalidDate).toBe("not a date");
    expect(result.validDate).toBeInstanceOf(Date);
  });

  it("should handle empty objects and arrays", () => {
    expect(normalizeTimeValues({})).toEqual({});
    expect(normalizeTimeValues([])).toEqual([]);
  });

  it("should handle primitive values", () => {
    expect(normalizeTimeValues("2024-01-01T00:00:00Z")).toBeInstanceOf(Date);
    expect(normalizeTimeValues(123)).toBe(123);
    expect(normalizeTimeValues(true)).toBe(true);
    expect(normalizeTimeValues(null)).toBe(null);
  });
});
