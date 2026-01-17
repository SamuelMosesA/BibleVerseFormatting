import { Verse } from './types';

const verse_parsing_regex = RegExp(/\[(?<verse_num>\d+)\](?<text>[^[\]]+)/, 'g');
const double_newline = RegExp(/\n\s*\n/, 'g');

function parse_api_result(passage_str: string): Verse[] {
  const passage_str_trim = passage_str.replace(double_newline, '\n');
  const matched_verses = passage_str_trim.matchAll(verse_parsing_regex);
  const result: Verse[] = [];
  matched_verses.forEach((val) => {
    if (val.groups) {
      result.push({
        verseNumber: val.groups.verse_num,
        text: val.groups.text,
      });
    }
  });
  return result;
}

async function decodeApiKey(encodedString: string, password: string) {
  try {
    const decodedBytes = new Uint8Array(
      atob(encodedString)
        .split('')
        .map((char) => char.charCodeAt(0))
    );

    const salt = decodedBytes.slice(0, 8);
    const iv = decodedBytes.slice(8, 20);
    const ciphertext = decodedBytes.slice(20);

    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBytes,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    const decryptedBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);

    const decoder = new TextDecoder();
    const apiKey = decoder.decode(decryptedBuffer);

    return apiKey;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

// async function encodeApiKey(apiKey: string, password: string): Promise<string | null> {
//   try {
//     const encoder = new TextEncoder();
//     const apiKeyBytes = encoder.encode(apiKey);
//     const passwordBytes = encoder.encode(password);

//     const keyMaterial = await crypto.subtle.importKey(
//       'raw',
//       passwordBytes,
//       { name: 'PBKDF2' },
//       false,
//       ['deriveKey']
//     );

//     const salt = crypto.getRandomValues(new Uint8Array(8));
//     const key = await crypto.subtle.deriveKey(
//       {
//         name: 'PBKDF2',
//         salt,
//         iterations: 100000,
//         hash: 'SHA-256',
//       },
//       keyMaterial,
//       { name: 'AES-GCM', length: 256 },
//       false,
//       ['encrypt']
//     );

//     const iv = crypto.getRandomValues(new Uint8Array(12));

//     const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, apiKeyBytes);

//     const combinedArray = new Uint8Array(salt.byteLength + iv.byteLength + ciphertext.byteLength);
//     combinedArray.set(salt, 0);
//     combinedArray.set(iv, salt.byteLength);
//     combinedArray.set(new Uint8Array(ciphertext), salt.byteLength + iv.byteLength);

//     // Convert Uint8Array to a regular number array
//     const numberArray = Array.from(combinedArray);

//     const base64Encoded = btoa(String.fromCharCode.apply(null, numberArray));
//     return base64Encoded;
//   } catch (error) {
//     console.error('Encryption failed:', error);
//     return null;
//   }
// }

export async function get_bible_verses_from_api(query: string, password: string): Promise<Verse[]> {
  const encodedApiKey =
    '5+98EbNfsk1VtoaQuAL2bygcFlO+KAYF3a9WXIXPpUYrLzJZKY9673Qw3QjKrH7DWfVKVX4LEc2lnVEcpD6gZy2WcAiMk1KI7+abqQ==';
  const apiKey = await decodeApiKey(encodedApiKey, password);

  const myHeaders = new Headers();
  myHeaders.append('Authorization', `Token ${apiKey}`);

  // 1. Create search parameters
  const params = new URLSearchParams();
  params.append('q', query);
  params.append('include-passage-references', 'false');
  params.append('include-footnotes', 'false');
  params.append('include-footnote-body', 'false');
  params.append('include-headings', 'false');
  params.append('include-short-copyright', 'false');
  params.append('include-selahs', 'false');
  params.append('indent-poetry', 'true');
  params.append('indent-using', 'tab');

  // 2. Combine the base path with the parameters to create a relative URL string
  const relativeURL = `/verse_api/v3/passage/text/?${params.toString()}`;

  // 3. Use the relative URL string in the Request object
  const apiRequest = new Request(relativeURL, {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow',
  });

  const response = await fetch(apiRequest);
  if (!response.ok) {
    const errorMsg = await response.text();
    throw new Error(`API request failed with status ${response.status}: ${errorMsg}`);
  }

  const content = await response.json();
  if (!content.passages || content.passages.length < 1) {
    throw new Error('Could not find data in passages response');
  }
  return parse_api_result(content.passages.at(0));
}
