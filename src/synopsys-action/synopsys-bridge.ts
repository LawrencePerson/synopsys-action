import {exec} from '@actions/exec'
import {SYNOPSYS_BRIDGE_PATH} from './inputs'
import {debug, info} from '@actions/core'
import {SYNOPSYS_BRIDGE_DEFAULT_PATH_LINUX, SYNOPSYS_BRIDGE_DEFAULT_PATH_MAC, SYNOPSYS_BRIDGE_DEFAULT_PATH_WINDOWS} from '../application-constants'
import {tryGetExecutablePath} from '@actions/io/lib/io-util'
import path from 'path'

export class SynopsysBridge {
  bridgeExecutablePath: string

  constructor() {
    this.bridgeExecutablePath = ''
  }

  private async checkIfSynopsysBridgeExists(): Promise<boolean> {
    let synopsysBridgePath = SYNOPSYS_BRIDGE_PATH
    if (!SYNOPSYS_BRIDGE_PATH) {
      info('Synopsys Bridge path not found in configuration')
      info('Looking for synopsys bridge in default path')
      console.log(`This platform is ${process.platform}`);

      const osName = process.platform
      if (osName === 'darwin') {
        synopsysBridgePath = path.join(process.env['HOME'] as string, SYNOPSYS_BRIDGE_DEFAULT_PATH_MAC) //exOp.stdout;
      } else if (osName === 'linux') {
        synopsysBridgePath = SYNOPSYS_BRIDGE_DEFAULT_PATH_LINUX
      } else if (osName === 'win32') {
        synopsysBridgePath = SYNOPSYS_BRIDGE_DEFAULT_PATH_WINDOWS
      }

      info(`Path is - ${synopsysBridgePath}`)

      this.bridgeExecutablePath = await tryGetExecutablePath(synopsysBridgePath.concat('/bridge'), [])

      if (osName === 'win32') {
        this.bridgeExecutablePath = await tryGetExecutablePath(synopsysBridgePath.concat('\\bridge'), ['.exe'])
      }
      info(this.bridgeExecutablePath)

      if (this.bridgeExecutablePath) {
        info(`Bridge executable found at ${synopsysBridgePath}`)
        return true
      } else {
        info('Bridge executable could not be found at '.concat(synopsysBridgePath))
      }
    }

    return false
  }

  async executeBridgeCommand(bridgeCommand: string): Promise<number> {
    if (await this.checkIfSynopsysBridgeExists()) {
      const osName: string = process.platform
      if (osName === 'darwin' || osName === 'linux' || osName === 'win32') {
        info('In bridge execution if....')
        return await exec(this.bridgeExecutablePath.concat(' ', bridgeCommand))
      }
    } else {
      throw new Error('Bridge could not be found')
    }

    return -1
  }
}
