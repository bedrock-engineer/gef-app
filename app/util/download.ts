/**
 * Generic utility for downloading content as a file in the browser
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  // Create blob and download
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(link.href);
}
