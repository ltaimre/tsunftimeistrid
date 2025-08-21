export function filterObject(obj, allowedKeys) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([key, value]) =>
        allowedKeys.includes(key) && value != null && value !== ""
    )
  );
}
