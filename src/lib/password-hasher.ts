/**
 * Universal Password Hasher
 * Uses bcrypt for Next.js and Web Crypto API for Cloudflare Workers
 */

// Environment detection
function isNextJS(): boolean {
  return typeof process !== 'undefined' && process.env !== undefined && 
         typeof require !== 'undefined';
}

function isWorkers(): boolean {
  return !isNextJS() && 
         typeof globalThis !== 'undefined' && 
         'crypto' in globalThis && 
         'subtle' in globalThis.crypto;
}

/**
 * Hash a password using the appropriate method for the environment
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  if (isNextJS()) {
    // Use bcrypt for Next.js
    const bcrypt = await import('bcrypt');
    return await bcrypt.hash(plainPassword, 12);
  } else if (isWorkers()) {
    // Use Web Crypto API for Workers
    return await hashPasswordWebCrypto(plainPassword);
  } else {
    throw new Error('Unsupported environment for password hashing');
  }
}

/**
 * Verify a password using the appropriate method for the environment
 */
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  if (isNextJS()) {
    // Use bcrypt for Next.js (supports both bcrypt and Web Crypto hashes)
    if (hashedPassword.startsWith('pbkdf2:')) {
      // This is a Web Crypto hash, verify using Web Crypto
      return await verifyPasswordWebCrypto(plainPassword, hashedPassword);
    } else {
      // This is a bcrypt hash, use bcrypt
      const bcrypt = await import('bcrypt');
      return await bcrypt.compare(plainPassword, hashedPassword);
    }
  } else if (isWorkers()) {
    // Use Web Crypto API for Workers
    return await verifyPasswordWebCrypto(plainPassword, hashedPassword);
  } else {
    throw new Error('Unsupported environment for password verification');
  }
}

/**
 * Hash password using Web Crypto API (for Cloudflare Workers)
 * Uses PBKDF2 with SHA-256
 */
async function hashPasswordWebCrypto(password: string): Promise<string> {
  // Generate a random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Convert password to ArrayBuffer
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  // Import the password as a key
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  // Derive the key using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000, // 100k iterations (equivalent to bcrypt cost 12)
      hash: 'SHA-256'
    },
    keyMaterial,
    256 // 32 bytes = 256 bits
  );
  
  // Combine salt and hash
  const hashArray = new Uint8Array(derivedBits);
  const combined = new Uint8Array(salt.length + hashArray.length);
  combined.set(salt);
  combined.set(hashArray, salt.length);
  
  // Convert to base64 with a prefix to identify the format
  return 'pbkdf2:' + btoa(String.fromCharCode(...combined));
}

/**
 * Verify password using Web Crypto API (for Cloudflare Workers)
 */
async function verifyPasswordWebCrypto(password: string, hashedPassword: string): Promise<boolean> {
  try {
    // Check if this is a bcrypt hash (from Next.js) or our Web Crypto hash
    if (hashedPassword.startsWith('$2b$') || hashedPassword.startsWith('$2a$')) {
      // This is a bcrypt hash, but we're in Workers
      // For migration purposes, we'll need to handle this
      throw new Error('bcrypt hashes are not supported in Workers environment. Please reset password.');
    }
    
    if (!hashedPassword.startsWith('pbkdf2:')) {
      return false;
    }
    
    // Remove prefix and decode
    const hashData = hashedPassword.substring(7); // Remove 'pbkdf2:' prefix
    const combined = new Uint8Array(atob(hashData).split('').map(char => char.charCodeAt(0)));
    
    // Extract salt and hash
    const salt = combined.slice(0, 16);
    const storedHash = combined.slice(16);
    
    // Convert password to ArrayBuffer
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    // Import the password as a key
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits']
    );
    
    // Derive the key using PBKDF2
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );
    
    const computedHash = new Uint8Array(derivedBits);
    
    // Compare hashes
    if (computedHash.length !== storedHash.length) {
      return false;
    }
    
    let isEqual = true;
    for (let i = 0; i < computedHash.length; i++) {
      if (computedHash[i] !== storedHash[i]) {
        isEqual = false;
      }
    }
    
    return isEqual;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Check if a password hash is compatible with the current environment
 */
export function isHashCompatible(hashedPassword: string): boolean {
  if (isWorkers()) {
    return hashedPassword.startsWith('pbkdf2:');
  } else if (isNextJS()) {
    return hashedPassword.startsWith('$2b$') || hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('pbkdf2:');
  }
  return false;
}

/**
 * Migrate a bcrypt hash to Web Crypto format (requires the plain password)
 */
export async function migratePasswordHash(plainPassword: string, oldHashedPassword: string): Promise<string | null> {
  // Verify the password against the old hash first
  if (isNextJS()) {
    const bcrypt = await import('bcrypt');
    const isValid = await bcrypt.compare(plainPassword, oldHashedPassword);
    if (isValid) {
      // Hash with Web Crypto format for Workers compatibility
      return await hashPasswordWebCrypto(plainPassword);
    }
  }
  return null;
}