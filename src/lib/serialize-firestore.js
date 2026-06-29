export function serializeFirestoreData(value) {
  if (value === null || value === undefined) return value;

  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (
    typeof value?.latitude === "number" &&
    typeof value?.longitude === "number"
  ) {
    return {
      latitude: value.latitude,
      longitude: value.longitude,
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeFirestoreData(item));
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key,
        serializeFirestoreData(val),
      ])
    );
  }

  return value;
}