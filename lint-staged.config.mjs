import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.dirname(fileURLToPath(import.meta.url));
const prettierBin = path.join(repositoryRoot, 'node_modules', 'prettier', 'bin', 'prettier.cjs');

/** @type {import('lint-staged').Configuration} */
export default {
  '*.{js,jsx,ts,tsx,mjs,cjs,json,css,md,yml,yaml}': (files) => {
    const quotedFiles = files.map((file) => `"${file}"`).join(' ');
    return [`node "${prettierBin}" --write --ignore-unknown ${quotedFiles}`];
  },
};
