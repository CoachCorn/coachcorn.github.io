// Encrypts clips.json into data.enc.json (PBKDF2-SHA256 + AES-256-GCM) for the Install Grid page.
// Usage:  IG_PASS='your long passphrase' node build.mjs [input.json] [output.json]
// Defaults: input clips.json, output data.enc.json. Never commit the plaintext clips.json.
import { readFileSync, writeFileSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';

const input = process.argv[2] || 'clips.json';
const output = process.argv[3] || 'data.enc.json';
const pass = process.env.IG_PASS;
if (!pass) { console.error('Set IG_PASS to the coach passcode.'); process.exit(1); }

const data = JSON.parse(readFileSync(input, 'utf8'));
if (!Array.isArray(data.clips)) { console.error('Input needs a "clips" array.'); process.exit(1); }
const bad = data.clips.filter(c => !(c.id || (c.angles && c.angles.length && c.angles.every(a => a.id))));
if (bad.length) { console.error(bad.length + ' clip(s) have no Drive file id (use "id" or an "angles" array of {label, id}).'); process.exit(1); }

const ITER = 250000;
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const km = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(data))));
const b64 = u => Buffer.from(u).toString('base64');
writeFileSync(output, JSON.stringify({ v: 1, iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct) }));
console.log(`Encrypted ${data.clips.length} clips -> ${output}`);
