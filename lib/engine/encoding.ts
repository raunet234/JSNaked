export function decodeEncoding(code: string): string {
  let result = code;

  // Decode \xNN hex escapes
  result = result.replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );

  // Decode \uNNNN unicode escapes
  result = result.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );

  // Decode atob("...") calls — replace with the decoded string literal
  result = result.replace(/atob\s*\(\s*['"]([A-Za-z0-9+/=]+)['"]\s*\)/g, (_, b64) => {
    try {
      const decoded =
        typeof atob !== 'undefined'
          ? atob(b64)
          : Buffer.from(b64, 'base64').toString('utf-8');
      return JSON.stringify(decoded);
    } catch {
      return `atob("${b64}")`;
    }
  });

  return result;
}
