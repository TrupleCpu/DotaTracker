import { safeStorage, app } from 'electron'
import fs from 'fs'
import path from 'path'

export function getStratzToken(): string | null {
  const tokenPath = path.join(app.getPath('userData'), 'stratz-token.enc')
  if (!fs.existsSync(tokenPath)) return null
  try {
    const buffer = fs.readFileSync(tokenPath)
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(buffer)
    } else {
      return Buffer.from(buffer.toString('utf-8'), 'base64').toString('utf-8')
    }
  } catch (err) {
    console.error('Failed to read Stratz token', err)
    return null
  }
}

export function saveStratzToken(token: string): void {
  const tokenPath = path.join(app.getPath('userData'), 'stratz-token.enc')
  try {
    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(token)
      fs.writeFileSync(tokenPath, encrypted)
    } else {
      fs.writeFileSync(tokenPath, Buffer.from(token, 'utf-8').toString('base64'))
    }
  } catch (err) {
    console.error('Failed to save Stratz token', err)
  }
}
