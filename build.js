import esbuild from 'esbuild';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

async function loadMetadata() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const metadataPath = join(__dirname, 'userscript-metadata.json');
    const metadata = JSON.parse(await readFile(metadataPath, 'utf-8'));

    let metadataString = '// ==UserScript==\n';
    for (const [key, value] of Object.entries(metadata)) {
      if (Array.isArray(value)) {
        value.forEach(item => {
          metadataString += `// @${key.padEnd(15)} ${item}\n`;
        });
      } else {
        metadataString += `// @${key.padEnd(15)} ${value}\n`;
      }
    }
    metadataString += '// ==/UserScript==';

    return metadataString;
  } catch (error) {
    console.error('Error loading metadata:', error);
    process.exit(1);
  }
}

async function build() {
  try {
    const outfile = 'dist/x-saiaku.user.js';
    const userscriptMetadata = await loadMetadata();

    await esbuild.build({
      entryPoints: ['src/main.ts'],
      bundle: true,
      outfile,
      format: 'iife',
      platform: 'browser',
      minify: false,
      // sourcemap: "both",
      // minify: true,
      // minifyWhitespace: true,
      // minifyIdentifiers: true,
      // minifySyntax: true,
      charset: 'utf8',
      banner: {
        js: userscriptMetadata
      },
    });
    console.log(`Build successful! Output file: ${outfile}`);
  } catch (error) {
    console.error(`Build failed: ${error}`);
    process.exit(1);
  }
}

build().catch(console.error);