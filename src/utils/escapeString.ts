const SPECIAL_CHARS = [
  '\\',
  '_',
  '*',
  '[',
  ']',
  '(',
  ')',
  '~',
  '>',
  '<',
  '&',
  '#',
  '+',
  '-',
  '=',
  '|',
  '{',
  '}',
  '.',
  '!'
]

const escapeString = (text: string) => {
  SPECIAL_CHARS.forEach(char => (text = text.replaceAll(char, `\\${char}`).replace(/([`/])/g, "\$1")))
  return text
}

export default escapeString;
