import * as core from '@actions/core'
import * as process from 'process'
import * as child_process from 'child_process'
import * as path from 'path'

const ICU_PACKAGE = 'icu4c-data'
const TEMP_DIR = 'sarisia-setup-icu'

function run() {
    // inputs
    const noexport = core.getInput('noexport').trim().toLowerCase() === 'true'

    // @ts-ignore
    const icuMajor = process.config.variables.icu_ver_major
    if (!icuMajor) {
        core.error(`icuMajor is missing (process.config.variables.icu_ver_major=${icuMajor})`)
        return
    }
    // @ts-ignore
    const icuEnd: string = process.config.variables.icu_endianness.toLowerCase()
    if (!icuEnd || 'lbe'.indexOf(icuEnd) === -1) {
        core.error(`icuEnd is missing or not supported (process.config.variables.icu_endianness=${icuEnd})`)
        return
    }
    const runnerTemp = process.env['RUNNER_TEMP']
    if (!runnerTemp) {
        core.error('RUNNER_TEMP is missing. Is this running on GitHub Actions?')
    }

    const icuPackage = `${ICU_PACKAGE}@${icuMajor}${icuEnd}`
    const targetPathPrefix = `${runnerTemp}${path.sep}${TEMP_DIR}`
    const targetPath = `${targetPathPrefix}${path.sep}node_modules${path.sep}${ICU_PACKAGE}`
    core.startGroup(`Try installing ${icuPackage} to ${targetPath}`)
    try {
        core.info(
            child_process.execSync(`npm --prefix ${targetPathPrefix} install ${icuPackage}`, {timeout: 60000}).toString()
        )
    } catch(e) {
        core.endGroup()
        core.error(`failed to execute npm: ${e}: ${e.message}`)
        return
    } 
    core.endGroup()

    if (noexport) {
        core.info('`noexport` is set. Skip exporting...')
    } else {
        core.info(`Exporting NODE_ICU_DATA=${targetPath}`)
        core.exportVariable('NODE_ICU_DATA', targetPath)
    }

    core.startGroup('Setting outputs')
        console.log(`icu-data-dir: ${targetPath}`)
        core.setOutput('icu-data-dir', targetPath)
    core.endGroup()

    core.info('Done!')
}

run()
