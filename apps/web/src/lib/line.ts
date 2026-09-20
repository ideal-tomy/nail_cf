export async function copyMessage(message: string): Promise<void> {
  await navigator.clipboard.writeText(message);
}
