/**
 * Minimal markdown → safe HTML for admin-authored posts.
 * Supports: headings, bold, italic, links, lists, paragraphs.
 */
export function markdownToHtml(source: string): string {
  const escaped = source
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const blocks = escaped.replace(/\r\n/g, "\n").split(/\n{2,}/);

  const html = blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";

      if (/^### /.test(trimmed)) {
        return `<h3>${inline(trimmed.slice(4))}</h3>`;
      }
      if (/^## /.test(trimmed)) {
        return `<h2>${inline(trimmed.slice(3))}</h2>`;
      }
      if (/^# /.test(trimmed)) {
        return `<h2>${inline(trimmed.slice(2))}</h2>`;
      }

      const lines = trimmed.split("\n");
      if (lines.every((l) => /^[-*] /.test(l))) {
        const items = lines.map((l) => `<li>${inline(l.replace(/^[-*] /, ""))}</li>`).join("");
        return `<ul>${items}</ul>`;
      }

      return `<p>${inline(lines.join("<br />"))}</p>`;
    })
    .join("");

  return html;
}

function inline(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}
