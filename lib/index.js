"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const process = __importStar(require("process"));
const child_process = __importStar(require("child_process"));
const path = __importStar(require("path"));
const ICU_PACKAGE = 'icu4c-data';
const TEMP_DIR = 'sarisia-setup-icu';
function run() {
    // inputs
    const noexport = core.getInput('noexport').trim().toLowerCase() === 'true';
    // @ts-ignore
    const icuMajor = process.config.variables.icu_ver_major;
    if (!icuMajor) {
        core.error(`icuMajor is missing (process.config.variables.icu_ver_major=${icuMajor})`);
        return;
    }
    // @ts-ignore
    const icuEnd = process.config.variables.icu_endianness.toLowerCase();
    if (!icuEnd || 'lbe'.indexOf(icuEnd) === -1) {
        core.error(`icuEnd is missing or not supported (process.config.variables.icu_endianness=${icuEnd})`);
        return;
    }
    const runnerTemp = process.env['RUNNER_TEMP'];
    if (!runnerTemp) {
        core.error('RUNNER_TEMP is missing. Is this running on GitHub Actions?');
    }
    const icuPackage = `${ICU_PACKAGE}@${icuMajor}${icuEnd}`;
    const targetPathPrefix = `${runnerTemp}${path.sep}${TEMP_DIR}`;
    const targetPath = `${targetPathPrefix}${path.sep}node_modules${path.sep}${ICU_PACKAGE}`;
    core.startGroup(`Try installing ${icuPackage} to ${targetPath}`);
    try {
        core.info(child_process.execSync(`npm --prefix ${targetPathPrefix} install ${icuPackage}`, { timeout: 60000 }).toString());
    }
    catch (e) {
        core.endGroup();
        core.error(`failed to execute npm: ${e}: ${e.message}`);
        return;
    }
    core.endGroup();
    if (noexport) {
        core.info('`noexport` is set. Skip exporting...');
    }
    else {
        core.info(`Exporting NODE_ICU_DATA=${targetPath}`);
        core.exportVariable('NODE_ICU_DATA', targetPath);
    }
    core.startGroup('Setting outputs');
    console.log(`icu-data-dir: ${targetPath}`);
    core.setOutput('icu-data-dir', targetPath);
    core.endGroup();
    core.info('Done!');
}
run();
