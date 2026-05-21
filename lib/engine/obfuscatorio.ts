/**
 * Resolves obfuscator.io _0x string array patterns.
 *
 * Algorithm:
 * 1. Find the string array definition (var _0xXXXX = ['...', '...'])
 * 2. Find the rotation amount from the self-invoking rotation function
 * 3. Apply rotation (array.push(array.shift()) N times)
 * 4. Build index→string lookup map
 * 5. Find the accessor function name
 * 6. Replace all _0xYYYY('0xN') calls with the resolved string literal
 * 7. Concatenate adjacent string literals where possible
 */
export function resolveObfuscatorIO(code: string): string {
  // Step 1: Find the string array
  const arrayMatch = code.match(/var\s+(_0x[a-f0-9]+)\s*=\s*\[(['"][^'"]*['"](?:\s*,\s*['"][^'"]*['"])*)\]/i);
  if (!arrayMatch) return code;

  const arrayVarName = arrayMatch[1];
  const rawItems = arrayMatch[2];
  const stringArray: string[] = [];

  // Parse the array items preserving quote style
  const itemRegex = /(['"])((?:[^'"\\]|\\.)*)\1/g;
  let m: RegExpExecArray | null;
  while ((m = itemRegex.exec(rawItems)) !== null) {
    stringArray.push(m[2]);
  }

  if (stringArray.length === 0) return code;

  // Step 2: Find rotation amount
  const rotationMatch = code.match(
    new RegExp(
      String.raw`${arrayVarName}\s*\[.push.\]\s*\(\s*${arrayVarName}\s*\[.shift.\]\s*\([^)]*\)[^)]*\).*?(?:0x([0-9a-f]+)|(\d+))`,
      'i'
    )
  );
  let rotations = 0;
  if (rotationMatch) {
    const rotHex = rotationMatch[1];
    const rotDec = rotationMatch[2];
    rotations = rotHex ? parseInt(rotHex, 16) : parseInt(rotDec, 10);
    rotations = rotations % stringArray.length;
  }

  // Step 3: Apply rotation
  const rotated = [...stringArray];
  for (let i = 0; i < rotations; i++) {
    rotated.push(rotated.shift()!);
  }

  // Step 4: Build lookup map (hex index → string value)
  const lookup = new Map<number, string>();
  rotated.forEach((val, idx) => lookup.set(idx, val));

  // Step 5: Find accessor function name
  const accessorMatch = code.match(
    new RegExp(
      String.raw`var\s+(_0x[a-f0-9]+)\s*=\s*function\s*\([^)]+\)\s*\{[^}]*return\s+${arrayVarName}\s*\[`,
      'i'
    )
  );
  if (!accessorMatch) return code;
  const accessorName = accessorMatch[1];

  // Step 6: Replace all _0xYYYY('0xN') with resolved string
  let result = code;
  const callPattern = new RegExp(
    String.raw`${accessorName}\s*\(\s*'0x([0-9a-f]+)'\s*\)`,
    'gi'
  );
  result = result.replace(callPattern, (_, hexIdx) => {
    const idx = parseInt(hexIdx, 16);
    const val = lookup.get(idx);
    return val !== undefined ? `'${val}'` : `'[unresolved_0x${hexIdx}]'`;
  });

  // Step 7: Concatenate adjacent string literals 'a' + 'b' → 'ab'
  result = result.replace(/'([^']*)'\s*\+\s*'([^']*)'/g, (_, a, b) => `'${a}${b}'`);

  return result;
}
