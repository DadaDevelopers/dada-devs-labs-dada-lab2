export function formatWalletName(name?: string | null): string {
  return name?.replace(/^user-/i, "") ?? "";
}
