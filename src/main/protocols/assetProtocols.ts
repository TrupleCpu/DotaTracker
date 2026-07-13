import { app, net, protocol } from 'electron'
import { join } from 'path'
import fs from 'fs'
import { pathToFileURL } from 'url'

function resolveBasePath(subdir: string): string {
  return app.isPackaged
    ? join(app.getAppPath().replace('app.asar', 'app.asar.unpacked'), 'src/main/data', subdir)
    : join(app.getAppPath(), 'src/main/data', subdir)
}

function registerAssetProtocol(scheme: string, subdir: string, useHostname = false): void {
  protocol.handle(scheme, (request) => {
    let relPath: string

    if (useHostname) {
      const url = new URL(request.url)
      relPath = decodeURIComponent((url.hostname + url.pathname).replace(/\/+$/, ''))
    } else {
      relPath = decodeURIComponent(request.url.replace(`${scheme}://`, ''))
    }

    const filePath = join(resolveBasePath(subdir), relPath)

    if (!fs.existsSync(filePath)) {
      return new Response('Not found', { status: 404 })
    }
    return net.fetch(pathToFileURL(filePath).toString())
  })
}

export function registerSchemesAsPrivileged(): void {
  protocol.registerSchemesAsPrivileged(
    ['hero-asset', 'item-asset', 'hero-model', 'ability-asset'].map((scheme) => ({
      scheme,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true
      }
    }))
  )
}

export function registerAssetProtocols(): void {
    registerAssetProtocol('hero-asset', 'hero-assets')
    registerAssetProtocol('item-asset', 'item-assets')
    registerAssetProtocol('ability-asset', 'abilities', true)
    registerAssetProtocol('hero-model', 'hero-models', true)
}
