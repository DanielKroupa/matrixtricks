export function isAdminRole(role?: string | null) {
  return role?.trim().toLowerCase() === "admin";
}
