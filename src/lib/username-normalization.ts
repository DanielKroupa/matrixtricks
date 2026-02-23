const combiningDiacriticMarksRegex = /\p{M}+/gu;

export function normalizeUsernameIdentifier(value: string) {
  return value
    .trim()
    .normalize("NFD")
    .replace(combiningDiacriticMarksRegex, "")
    .toLowerCase();
}
