import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import { encryptString, decryptString } from './crypto'

export function getStratzToken(): string | null {
  const tokenPath = path.join(app.getPath('userData'), 'stratz-token.enc')
  if (!fs.existsSync(tokenPath)) return null
  try {
    const buffer = fs.readFileSync(tokenPath)
    return decryptString(buffer)
  } catch (err) {
    console.error('Failed to read Stratz token', err)
    return null
  }
}

export function saveStratzToken(token: string): void {
  const tokenPath = path.join(app.getPath('userData'), 'stratz-token.enc')
  try {
    fs.writeFileSync(tokenPath, encryptString(token))
  } catch (err) {
    console.error('Failed to save Stratz token', err)
  }
}
