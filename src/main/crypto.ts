import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { app, safeStorage } from 'electron'

function getKeyPath(): string {
  return path.join(app.getPath('userData'), 'app-crypt.key')
}

function getOrCreateKey(): Buffer {
  const keyPath = getKeyPath()
  if (fs.existsSync(keyPath)) {
    return fs.readFileSync(keyPath)
  }
  const key = crypto.randomBytes(32)
  fs.writeFileSync(keyPath, key, { mode: 0o600 })
  return key
}

export function encryptString(plaintext: string): Buffer {
  if (safeStorage.isEncryptionAvailable()) {
    return safeStorage.encryptString(plaintext)
  }
  const key = getOrCreateKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf-8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, encrypted])
}

export function decryptString(buffer: Buffer): string | null {
  try {
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(buffer)
    }
    const key = getOrCreateKey()
    const iv = buffer.subarray(0, 12)
    const authTag = buffer.subarray(12, 28)
    const encrypted = buffer.subarray(28)
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(authTag)
    return decipher.update(encrypted) + decipher.final('utf-8')
  } catch {
    return null
  }
}
