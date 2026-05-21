/**
 * Resolves obfuscator.io string array patterns.
 *
 * Handles two variants:
 * A) Function-wrapped string array with rotation IIFE (modern obfuscator.io)
 *    - function _0x4c81() { const a = [...]; _0x4c81 = function() { return a; }; return _0x4c81(); }
 *    - function _0x483b(idx) { const a = _0x4c81(); return _0x483b = function(i) { i = i - OFFSET; return a[i]; }, _0x483b(idx); }
 *    - (function(arr, target) { while(true) { ... arr.push(arr.shift()) ... } }(_0x4c81, TARGET))
 *
 * B) Simple direct array declaration (older obfuscator.io)
 *    - var _0x4c81 = ['str1', 'str2', ...]
 *    - function _0x483b(i) { return _0x4c81[i - OFFSET]; }
 *
 * In both cases, the resolver:
 * 1. Extracts the setup code (array + accessor + rotation)
 * 2. Executes it safely via Function() to get a working accessor
 * 3. Finds all accessor aliases throughout the code
 * 4. Replaces all _0xAccessor(0xNN) calls with the resolved string literals
 * 5. Concatenates adjacent string literals
 */
export function resolveObfuscatorIO(code: string): string {
  // Try advanced resolver (function-wrapped arrays with rotation)
  const advanced = resolveAdvanced(code);
  if (advanced !== code) return advanced;

  // Fall back to simple resolver (direct array declarations)
  return resolveSimple(code);
}

// ============================================================
// Advanced resolver — handles modern obfuscator.io output
// ============================================================

function resolveAdvanced(code: string): string {
  // 1. Detect the accessor function and the array function it references
  //    Pattern: function _0xACCESSOR(...) { const _0xN = _0xARRAY(); ... }
  const accessorDefMatch = code.match(
    /function\s+(_0x[a-f0-9]+)\s*\([^)]+\)\s*\{\s*(?:const|var|let)\s+_0x[a-f0-9]+\s*=\s*(_0x[a-f0-9]+)\s*\(\)/i
  );
  if (!accessorDefMatch) return code;

  const accessorName = accessorDefMatch[1]; // e.g., _0x483b
  const arrayFnName = accessorDefMatch[2]; // e.g., _0x4c81

  // 2. Extract the accessor function using brace matching
  const accessorStart = code.indexOf('function ' + accessorName);
  if (accessorStart === -1) return code;

  const accessorOpenBrace = code.indexOf('{', accessorStart);
  if (accessorOpenBrace === -1) return code;

  const accessorEndPos = findClosing(code, accessorOpenBrace, '{', '}');
  if (accessorEndPos === -1) return code;

  const accessorCode = code.substring(accessorStart, accessorEndPos);

  // 3. Extract the array function (usually at the end of the code, hoisted)
  const arrayFnStart = code.lastIndexOf('function ' + arrayFnName);
  if (arrayFnStart === -1) return code;

  const arrayOpenBrace = code.indexOf('{', arrayFnStart);
  if (arrayOpenBrace === -1) return code;

  const arrayEndPos = findClosing(code, arrayOpenBrace, '{', '}');
  if (arrayEndPos === -1) return code;

  const arrayFnCode = code.substring(arrayFnStart, arrayEndPos);

  // 4. Extract the rotation IIFE (right after the accessor function)
  let afterAccessor = accessorEndPos;
  // Skip whitespace and semicolons
  while (afterAccessor < code.length && /[\s;]/.test(code[afterAccessor])) {
    afterAccessor++;
  }

  let rotationCode = '';
  let appCodeStart = afterAccessor;

  // The rotation IIFE starts with (function
  if (code.substring(afterAccessor, afterAccessor + 9) === '(function') {
    const iifeEnd = findClosing(code, afterAccessor, '(', ')');
    if (iifeEnd !== -1) {
      rotationCode = code.substring(afterAccessor, iifeEnd);
      appCodeStart = iifeEnd;
      // Skip trailing semicolons/whitespace
      while (appCodeStart < code.length && /[\s;]/.test(code[appCodeStart])) {
        appCodeStart++;
      }
    }
  }

  // 5. Execute the setup code to get a working accessor function
  //    The setup code is: arrayFn + accessorFn + rotationIIFE
  //    Function declarations are hoisted, so order doesn't matter much,
  //    but we put arrayFn first for clarity.
  let accessor: ((index: number) => string) | null = null;
  try {
    const setupScript =
      arrayFnCode +
      '\n' +
      accessorCode +
      '\n' +
      rotationCode +
      '\nreturn function(__idx__) { return ' +
      accessorName +
      '(__idx__); };';

    accessor = new Function(setupScript)() as (index: number) => string;
  } catch {
    return code; // Setup execution failed — return unchanged
  }

  if (!accessor) return code;

  // 6. Extract the "app code" (between rotation IIFE end and array function start)
  //    The array function is at the end; app code is between the setup and it.
  const appCodeEnd = arrayFnStart;
  let appCode = code.substring(appCodeStart, appCodeEnd).trim();

  if (!appCode) return code;

  // 7. Find ALL aliases of the accessor function (transitive)
  //    obfuscator.io creates chains: _0x2fa882 = _0x1de007 = _0x483b
  //    We need to follow ALL levels of aliasing.
  const aliases = new Set<string>([accessorName]);
  let aliasesChanged = true;
  while (aliasesChanged) {
    aliasesChanged = false;
    for (const knownAlias of Array.from(aliases)) {
      // Match: const/let/var _0xNEW = _0xKNOWN
      // Also match comma-continuation: , _0xNEW = _0xKNOWN
      const pattern = new RegExp(
        '(?:const|let|var|,)\\s*(_0x[a-f0-9]+)\\s*=\\s*' +
          escapeRegex(knownAlias) +
          '(?:\\s*[,;)\\n]|\\s*$)',
        'gi'
      );
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(appCode)) !== null) {
        if (!aliases.has(m[1])) {
          aliases.add(m[1]);
          aliasesChanged = true;
        }
      }
    }
  }

  // 8. Replace all accessor calls with resolved string literals
  //    Handles: _0x483b(0x200), _0x1c0ce2(0x1d6), _0x483b('0x200')
  const namePattern = Array.from(aliases).map(escapeRegex).join('|');
  const callPattern = new RegExp(
    '(?:' + namePattern + ')\\s*\\(\\s*[\'"]?0x([0-9a-fA-F]+)[\'"]?\\s*\\)',
    'g'
  );

  appCode = appCode.replace(callPattern, (match, hexArg) => {
    try {
      const index = parseInt(hexArg, 16);
      const resolved = accessor!(index);
      if (typeof resolved === 'string') {
        return JSON.stringify(resolved);
      }
    } catch {
      // Leave unresolved if accessor throws
    }
    return match;
  });

  // 9. Concatenate adjacent string literals: "a" + "b" → "ab"
  appCode = concatenateAdjacentStrings(appCode);

  return appCode;
}

// ============================================================
// Simple resolver — handles older obfuscator.io output
// ============================================================

function resolveSimple(code: string): string {
  // Find: var _0xNNNN = ['...', '...', ...]
  const arrayMatch = code.match(
    /var\s+(_0x[a-f0-9]+)\s*=\s*\[((?:'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")(?:\s*,\s*(?:'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"))*)\]/i
  );
  if (!arrayMatch) return code;

  const arrayVarName = arrayMatch[1];
  const rawItems = arrayMatch[2];

  // Parse the array items
  const stringArray: string[] = [];
  const itemRegex = /(['"])((?:[^'"\\]|\\.)*)(\1)/g;
  let m: RegExpExecArray | null;
  while ((m = itemRegex.exec(rawItems)) !== null) {
    stringArray.push(m[2]);
  }
  if (stringArray.length === 0) return code;

  // Find rotation amount
  const rotationMatch = code.match(
    new RegExp(
      escapeRegex(arrayVarName) +
        '\\s*\\[.push.\\]\\s*\\(\\s*' +
        escapeRegex(arrayVarName) +
        '\\s*\\[.shift.\\]\\s*\\([^)]*\\)[^)]*\\).*?(?:0x([0-9a-f]+)|(\\d+))',
      'i'
    )
  );
  let rotations = 0;
  if (rotationMatch) {
    const rotHex = rotationMatch[1];
    const rotDec = rotationMatch[2];
    rotations = rotHex ? parseInt(rotHex, 16) : parseInt(rotDec!, 10);
    rotations = rotations % stringArray.length;
  }

  // Apply rotation
  const rotated = [...stringArray];
  for (let i = 0; i < rotations; i++) {
    rotated.push(rotated.shift()!);
  }

  // Build lookup map
  const lookup = new Map<number, string>();
  rotated.forEach((val, idx) => lookup.set(idx, val));

  // Find accessor function name
  const accessorMatch = code.match(
    new RegExp(
      'var\\s+(_0x[a-f0-9]+)\\s*=\\s*function\\s*\\([^)]+\\)\\s*\\{[^}]*return\\s+' +
        escapeRegex(arrayVarName) +
        '\\s*\\[',
      'i'
    )
  );
  if (!accessorMatch) return code;
  const accessorName = accessorMatch[1];

  // Replace all accessor calls (quoted hex args)
  let result = code;
  const callPattern = new RegExp(
    escapeRegex(accessorName) + "\\s*\\(\\s*'0x([0-9a-f]+)'\\s*\\)",
    'gi'
  );
  result = result.replace(callPattern, (_, hexIdx) => {
    const idx = parseInt(hexIdx, 16);
    const val = lookup.get(idx);
    return val !== undefined ? `'${val}'` : `'[unresolved_0x${hexIdx}]'`;
  });

  // Concatenate adjacent strings
  result = concatenateAdjacentStrings(result);

  return result;
}

// ============================================================
// Helpers
// ============================================================

/**
 * Finds the position right after the matching closing bracket.
 * Handles nested brackets and string literals (single and double quotes).
 *
 * @param code - Source code string
 * @param startIndex - Position of the opening bracket character
 * @param openChar - Opening bracket character (e.g., '{' or '(')
 * @param closeChar - Closing bracket character (e.g., '}' or ')')
 * @returns Position right after the closing bracket, or -1 if not found
 */
function findClosing(
  code: string,
  startIndex: number,
  openChar: string,
  closeChar: string
): number {
  let depth = 0;
  let i = startIndex;
  let inSingle = false;
  let inDouble = false;

  while (i < code.length) {
    const ch = code[i];

    // Skip escaped characters inside strings
    if ((inSingle || inDouble) && ch === '\\') {
      i += 2;
      continue;
    }

    if (!inSingle && !inDouble) {
      if (ch === "'") inSingle = true;
      else if (ch === '"') inDouble = true;
      else if (ch === openChar) depth++;
      else if (ch === closeChar) {
        depth--;
        if (depth === 0) return i + 1; // position right after closing bracket
      }
    } else {
      if (inSingle && ch === "'") inSingle = false;
      else if (inDouble && ch === '"') inDouble = false;
    }

    i++;
  }

  return -1; // unmatched
}

/**
 * Repeatedly concatenates adjacent string literals until no more can be merged.
 * Handles: "a" + "b" → "ab", 'a' + 'b' → 'ab', mixed quotes.
 */
function concatenateAdjacentStrings(code: string): string {
  let result = code;
  let prev = '';

  // Repeat until no more changes (handles chains like "a" + "b" + "c")
  while (result !== prev) {
    prev = result;
    // "a" + "b" → "ab"
    result = result.replace(/"((?:[^"\\]|\\.)*)"\s*\+\s*"((?:[^"\\]|\\.)*)"/g, (_, a, b) => `"${a}${b}"`);
    // 'a' + 'b' → 'ab'
    result = result.replace(/'((?:[^'\\]|\\.)*)'\s*\+\s*'((?:[^'\\]|\\.)*)'/g, (_, a, b) => `'${a}${b}'`);
    // "a" + 'b' → "ab"
    result = result.replace(/"((?:[^"\\]|\\.)*)"\s*\+\s*'((?:[^'\\]|\\.)*)'/g, (_, a, b) => `"${a}${b}"`);
    // 'a' + "b" → "ab"
    result = result.replace(/'((?:[^'\\]|\\.)*)'\s*\+\s*"((?:[^"\\]|\\.)*)"/g, (_, a, b) => `"${a}${b}"`);
  }

  return result;
}

/**
 * Escapes special regex characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
