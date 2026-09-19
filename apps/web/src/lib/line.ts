export function sendViaLine(message: string): void {
  const url = `https://line.me/R/share?text=${encodeURIComponent(message)}`;
  window.location.href = url;
}

export async function copyMessage(message: string): Promise<void> {
  await navigator.clipboard.writeText(message);
}

export function isMobileDevice(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}
