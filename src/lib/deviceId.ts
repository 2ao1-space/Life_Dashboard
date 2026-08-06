let _id: string | null = null;

export function getDeviceId(): string {
  if (_id) return _id;
  if (typeof window === "undefined") return "server";

  const stored = localStorage.getItem("_device_id");
  if (stored) {
    _id = stored;
    return _id;
  }

  const id =
    "dev_" +
    Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  localStorage.setItem("_device_id", id);
  _id = id;
  return _id;
}
