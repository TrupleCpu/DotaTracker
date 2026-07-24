import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'

const CFG_FILENAME = 'gamestate_integration_myserver.cfg'
const DOTA_RELATIVE = path.join(
  'steamapps',
  'common',
  'dota 2 beta',
  'game',
  'dota',
  'cfg',
  'gamestate_integration'
)
const REG_KEY = 'Software\\AncientEye'
const REG_VALUE = 'InstallGsiConfig'

function log(msg: string): void {
  console.log(`[GSI] ${msg}`)
}

function readRegistryFlag(): boolean {
  try {
    if (process.platform !== 'win32') {
      log('not Windows')
      return false
    }
    const output = execFileSync('reg', ['query', `HKCU\\${REG_KEY}`, '/v', REG_VALUE], {
      encoding: 'utf-8',
      timeout: 5000
    })
    log(`reg query raw output: ${output.slice(0, 200)}`)
    const match = output.match(/InstallGsiConfig\s+REG_SZ\s+(.+)/i)
    if (match) {
      const val = match[1].trim()
      log(`registry value: "${val}"`)
      return val === '1'
    }
    log('regex did not match registry output')
    return false
  } catch (err) {
    log(`reg query failed: ${err instanceof Error ? err.message : String(err)}`)
    return false
  }
}

function getSteamPath(): string | null {
  try {
    if (process.platform !== 'win32') return null
    const output = execFileSync(
      'reg',
      ['query', 'HKCU\\Software\\Valve\\Steam', '/v', 'SteamPath'],
      { encoding: 'utf-8', timeout: 5000 }
    )
    const match = output.match(/SteamPath\s+REG_SZ\s+(.+)/i)
    const result = match ? match[1].trim().replace(/\\\\/g, '\\') : null
    log(`Steam path: ${result ?? 'not found'}`)
    return result
  } catch (err) {
    log(`Steam registry query failed: ${err instanceof Error ? err.message : String(err)}`)
    return null
  }
}

function getLibraryFolders(steamPath: string): string[] {
  const folders: string[] = [steamPath]
  const vdfPath = path.join(steamPath, 'steamapps', 'libraryfolders.vdf')
  log(`looking for libraryfolders.vdf at: ${vdfPath}`)
  try {
    const content = fs.readFileSync(vdfPath, 'utf-8')
    const pathRegex = /"path"\s+"([^"]+)"/g
    let m: RegExpExecArray | null
    while ((m = pathRegex.exec(content)) !== null) {
      const libPath = m[1].replace(/\\\\/g, '\\')
      if (libPath !== steamPath) {
        log(`additional Steam library: ${libPath}`)
        folders.push(libPath)
      }
    }
  } catch (err) {
    log(`could not read libraryfolders.vdf: ${err instanceof Error ? err.message : String(err)}`)
  }
  log(`total Steam libraries to check: ${folders.length}`)
  return folders
}

function findDotaCfgDir(): string | null {
  const steamPath = getSteamPath()
  if (!steamPath) return null
  for (const lib of getLibraryFolders(steamPath)) {
    const candidate = path.join(lib, DOTA_RELATIVE)
    log(`checking: ${candidate} -> ${fs.existsSync(candidate) ? 'FOUND' : 'not found'}`)
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}

function cfgSourcePath(): string {
  const result = app.isPackaged
    ? path.join(process.resourcesPath, CFG_FILENAME)
    : path.join(app.getAppPath(), 'resources', CFG_FILENAME)
  log(`cfg source path: ${result} (packaged: ${app.isPackaged})`)
  return result
}

export async function installGsiConfigIfNeeded(): Promise<void> {
  log('starting GSI config install check')

  if (process.platform !== 'win32') {
    log('not Windows - skipping')
    return
  }

  const flag = readRegistryFlag()
  log(`registry install flag: ${flag}`)
  if (!flag) return

  const sourcePath = cfgSourcePath()
  if (!fs.existsSync(sourcePath)) {
    log(`source cfg not found at: ${sourcePath}`)
    return
  }
  log('source cfg found')

  const dotaCfgDir = findDotaCfgDir()
  if (!dotaCfgDir) {
    log('Dota 2 cfg directory not found')
    return
  }
  log(`Dota 2 cfg dir: ${dotaCfgDir}`)

  const targetPath = path.join(dotaCfgDir, CFG_FILENAME)
  if (fs.existsSync(targetPath)) {
    log('target cfg already exists, skipping')
    return
  }

  try {
    if (!fs.existsSync(dotaCfgDir)) {
      fs.mkdirSync(dotaCfgDir, { recursive: true })
      log('created gamestate_integration directory')
    }
    fs.copyFileSync(sourcePath, targetPath)
    log(`cfg installed successfully to ${targetPath}`)
  } catch (err) {
    log(`install failed: ${err instanceof Error ? err.message : String(err)}`)
  }
}
