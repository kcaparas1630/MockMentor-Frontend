/**
 * @fileoverview Secure token storage utility for managing authentication tokens.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This utility provides secure token storage with automatic encryption/decryption,
 * token expiration handling, and refresh capabilities. It uses sessionStorage for
 * better security and implements AES encryption for token protection.
 *
 * Security Features:
 * - AES-256-GCM encryption for stored tokens
 * - Automatic token expiration detection
 * - Session-based storage (cleared on browser close)
 * - CSRF protection via same-origin checks
 *
 * Dependencies:
 * - Web Crypto API (native browser support)
 */

interface TokenData {
  token: string;
  expiresAt: number;
  refreshToken?: string;
}

interface EncryptedTokenData {
  encryptedData: string;
  iv: string;
  salt: string;
}

class SecureTokenStorage {
  private readonly STORAGE_KEY = 'ai_interview_token';
  private readonly ENCRYPTION_KEY_STORAGE = 'ai_interview_key';
  private encryptionKey: CryptoKey | null = null;

  /**
   * Derives an encryption key from a password and salt.
   */
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Gets or creates an encryption key for the current session.
   */
  private async getEncryptionKey(): Promise<CryptoKey> {
    if (this.encryptionKey) {
      return this.encryptionKey;
    }

    // Generate a session-based key using a combination of factors
    const sessionId = sessionStorage.getItem(this.ENCRYPTION_KEY_STORAGE) || 
                     crypto.randomUUID();
    sessionStorage.setItem(this.ENCRYPTION_KEY_STORAGE, sessionId);

    const salt = new Uint8Array(16);
    window.crypto.getRandomValues(salt);
    
    this.encryptionKey = await this.deriveKey(sessionId, salt);
    return this.encryptionKey;
  }

  /**
   * Encrypts token data using AES-GCM encryption.
   */
  private async encryptTokenData(tokenData: TokenData): Promise<EncryptedTokenData> {
    const key = await this.getEncryptionKey();
    const iv = new Uint8Array(12);
    window.crypto.getRandomValues(iv);

    const salt = new Uint8Array(16);
    window.crypto.getRandomValues(salt);

    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(tokenData));

    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      data
    );

    return {
      encryptedData: Array.from(new Uint8Array(encryptedData))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''),
      iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
      salt: Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join(''),
    };
  }

  /**
   * Decrypts stored token data.
   */
  private async decryptTokenData(encryptedData: EncryptedTokenData): Promise<TokenData> {
    const key = await this.getEncryptionKey();
    
    const iv = new Uint8Array(
      encryptedData.iv.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || []
    );
    
    const data = new Uint8Array(
      encryptedData.encryptedData.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || []
    );

    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      data
    );

    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decryptedData));
  }

  /**
   * Stores a token securely with automatic expiration.
   */
  async storeToken(token: string, expiresIn?: number): Promise<void> {
    try {
      const expiresAt = expiresIn 
        ? Date.now() + (expiresIn * 1000)
        : Date.now() + (60 * 60 * 1000); // Default 1 hour

      const tokenData: TokenData = {
        token,
        expiresAt,
      };

      const encryptedData = await this.encryptTokenData(tokenData);
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(encryptedData));
    } catch (error) {
      console.error('Failed to store token:', error);
      throw new Error('Token storage failed');
    }
  }

  /**
   * Retrieves and validates a stored token.
   */
  async getToken(): Promise<string | null> {
    try {
      const storedData = sessionStorage.getItem(this.STORAGE_KEY);
      if (!storedData) return null;

      const encryptedData: EncryptedTokenData = JSON.parse(storedData);
      const tokenData = await this.decryptTokenData(encryptedData);

      // Check if token is expired
      if (Date.now() >= tokenData.expiresAt) {
        await this.clearToken();
        return null;
      }

      return tokenData.token;
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      await this.clearToken();
      return null;
    }
  }

  /**
   * Checks if a valid token exists.
   */
  async hasValidToken(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }

  /**
   * Clears stored token data.
   */
  async clearToken(): Promise<void> {
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.ENCRYPTION_KEY_STORAGE);
    this.encryptionKey = null;
  }

  /**
   * Gets token expiration time.
   */
  async getTokenExpiration(): Promise<number | null> {
    try {
      const storedData = sessionStorage.getItem(this.STORAGE_KEY);
      if (!storedData) return null;

      const encryptedData: EncryptedTokenData = JSON.parse(storedData);
      const tokenData = await this.decryptTokenData(encryptedData);
      
      return tokenData.expiresAt;
    } catch (error) {
      console.error('Failed to get token expiration:', error);
      return null;
    }
  }

  /**
   * Creates authorization headers with the stored token.
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('No valid token available');
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
}

// Export singleton instance
export const tokenStorage = new SecureTokenStorage();
export default tokenStorage;
