// Deliberately simple, literal (case-insensitive) substring matching — no
// attempt to parse negation ("not guaranteed" vs "guaranteed"). That's why
// every module's copy is written to avoid these words entirely, even in
// safe/negating sentences: a guard that tries to be clever about context
// can be wrong in exactly the case that matters. Re-run this over every
// fixture whenever template copy changes.
const BANNED_PATTERNS = [/guarantee/i, /will earn/i, /passive income/i, /risk-free/i, /get rich/i, /will make you money/i]

function collectStrings(value, acc = []) {
  if (typeof value === 'string') acc.push(value)
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, acc))
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => collectStrings(v, acc))
  return acc
}

export function scanCopyForBannedPhrases(input) {
  const strings = Array.isArray(input) && input.every((s) => typeof s === 'string') ? input : collectStrings(input)
  const violations = []
  for (const str of strings) {
    for (const pattern of BANNED_PATTERNS) {
      if (pattern.test(str)) violations.push(`"${str}" matched banned pattern ${pattern}`)
    }
  }
  return violations
}
