// Auto-redaction helper.
// Pure function: takes raw text, returns redacted text + a summary of what was masked.
// Order matters — structured/specific patterns run before fuzzy ones so they
// don't get mangled. Names/orgs/addresses are intentionally conservative;
// the manual review step is the safety net for anything missed.

const PATTERNS = [
  {
    label: 'EMAIL',
    // user@domain.tld
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  },
  {
    label: 'SSN',
    // 123-45-6789 or 123 45 6789
    regex: /\b\d{3}[-\s]\d{2}[-\s]\d{4}\b/g,
  },
  {
    label: 'PHONE',
    // (123) 456-7890, 123-456-7890, +1 123.456.7890, etc.
    regex: /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  },
  {
    label: 'ADDRESS',
    // number + up to a few words + a street suffix
    regex:
      /\b\d{1,6}\s+(?:[A-Za-z0-9.'-]+\s+){0,4}(?:Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl|Way|Terrace|Ter|Circle|Cir|Highway|Hwy|Suite|Ste)\b\.?/gi,
  },
  {
    label: 'ORG',
    // Capitalized run ending in a corporate suffix: "Acme Holdings LLC"
    regex:
      /\b(?:[A-Z][A-Za-z&.'-]*\s+){0,5}[A-Z][A-Za-z&.'-]*\s+(?:Inc|LLC|L\.L\.C\.|Ltd|Corp|Corporation|Company|Co|LLP|LP|PLC|GmbH|Group|Holdings|Partners|Associates)\b\.?/g,
  },
  {
    label: 'NAME',
    // Title + capitalized name(s): "Mr. John Smith", "Dr. Jane A. Doe"
    regex:
      /\b(?:Mr|Mrs|Ms|Miss|Dr|Prof)\.?\s+[A-Z][a-z]+(?:\s+[A-Z]\.?)?(?:\s+[A-Z][a-z]+)?/g,
  },
]

export function redactText(rawText) {
  if (!rawText) {
    return { redactedText: '', stats: {} }
  }

  let text = rawText
  const stats = {}

  for (const { label, regex } of PATTERNS) {
    text = text.replace(regex, (match) => {
      // Skip if this span was already redacted (avoids nested replacements)
      if (match.includes('[' + label + ']')) return match
      stats[label] = (stats[label] || 0) + 1
      return `[${label}]`
    })
  }

  return { redactedText: text, stats }
}