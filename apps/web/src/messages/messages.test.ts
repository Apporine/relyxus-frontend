import { describe, expect, it } from 'vitest';

import arabicMessages from './ar.json';
import englishMessages from './en.json';

type MessageTree = { [key: string]: string | MessageTree };

function flattenMessages(messages: MessageTree, prefix = ''): Map<string, string> {
  const flattened = new Map<string, string>();
  for (const [key, value] of Object.entries(messages)) {
    const path = prefix === '' ? key : `${prefix}.${key}`;
    if (typeof value === 'string') {
      flattened.set(path, value);
    } else {
      flattenMessages(value, path).forEach((nestedValue, nestedPath) =>
        flattened.set(nestedPath, nestedValue),
      );
    }
  }
  return flattened;
}

/** ICU argument names: `{name}` or `{name, plural, …}`, not words inside plural branches. */
function placeholdersIn(message: string): string[] {
  return [...message.matchAll(/\{\s*(\w+)\s*[,}]/g)].map((match) => match[1] ?? '').sort();
}

const englishCatalogue = flattenMessages(englishMessages);
const arabicCatalogue = flattenMessages(arabicMessages);

describe('message catalogues', () => {
  it('define the same keys in English and Arabic', () => {
    expect([...arabicCatalogue.keys()].sort()).toEqual([...englishCatalogue.keys()].sort());
  });

  it.each([...englishCatalogue.keys()])(
    '%s uses the same ICU arguments in both languages',
    (key) => {
      expect(placeholdersIn(arabicCatalogue.get(key) ?? '')).toEqual(
        placeholdersIn(englishCatalogue.get(key) ?? ''),
      );
    },
  );

  it('has no empty Arabic messages', () => {
    const emptyKeys = [...arabicCatalogue].filter(([, message]) => message.trim() === '');
    expect(emptyKeys).toEqual([]);
  });
});
