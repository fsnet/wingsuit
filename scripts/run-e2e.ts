/* eslint-disable no-irregular-whitespace */
import path from 'path';
import { remove, ensureDir, pathExists, writeFile, readJSON, writeJSON } from 'fs-extra';
import { prompt } from 'enquirer';
import pLimit from 'p-limit';

import shell from 'shelljs';
import { serve } from './utils/serve';
import { exec } from './utils/command';
// @ts-ignore
import { listOfPackages } from './utils/list-packages';

import * as configs from './run-e2e-config';

const logger = console;

export interface Parameters {
  name: string;
  version: string;
  generator: string;
  autoDetect?: boolean;
  preBuildCommand?: string;
  /** When cli complains when folder already exists */
  ensureDir?: boolean;
  /** Dependencies to add before building Storybook */
  additionalDeps?: string[];
}

export interface Options extends Parameters {
  cwd?: string;
}

const rootDir = path.join(__dirname, '..');
const siblingDir = path.join(__dirname, '..', '..', 'wingsuit-e2e-testing');

const prepareDirectory = async ({
  cwd,
  ensureDir: ensureDirOption = false,
}: Options): Promise<boolean> => {
  const siblingExists = await pathExists(siblingDir);

  if (!siblingExists) {
    await ensureDir(siblingDir);
    await exec('git init', { cwd: siblingDir });
    await exec('npm init -y', { cwd: siblingDir });
    await writeFile(path.join(siblingDir, '.gitignore'), 'node_modules\n');
  }

  const cwdExists = await pathExists(cwd);

  if (cwdExists) {
    return true;
  }

  if (ensureDirOption) {
    await ensureDir(cwd);
  }

  return false;
};

const cleanDirectory = async ({ cwd }: Options): Promise<void> => {
  await remove(cwd);
};

const generate = async ({ cwd, name, version, generator }: Options) => {
  const command = generator.replace(/{{name}}/g, name).replace(/{{version}}/g, version);
  logger.info(`🏗  Bootstrapping ${name} project`);
  const branch =  process.env.CIRCLE_BRANCH != null  ? process.env.CIRCLE_BRANCH : 'master';
  const execCommand = `${command} --folder ${name}-v${version} --branch ${branch}`;
  logger.debug(execCommand);

  try {
    await exec(execCommand, { cwd });
  } catch (e) {
    logger.error(`🚨 Bootstrapping ${name} failed`);
    throw e;
  }
};

const initStorybook = async ({ cwd, autoDetect = true, name }: Options) => {
  logger.info(`🎨 Initializing Storybook with @wingsuit-designsystem/cli`);
  try {
    const type = autoDetect ? '' : `--type ${name}`;
    await exec(`npx -p @wingsuit-designsystem/cli ws init --skip-install ${type}`, { cwd });
  } catch (e) {
    logger.error(`🚨 Storybook initialization failed`);
    throw e;
  }
};

// Verdaccio doesn't resolve *
// So we set resolutions manually in package.json
const setResolutions = async ({ cwd }: Options) => {
  logger.info(`🔒 Setting yarn resolutions`);

  const packages = await listOfPackages();

  const packageJsonPath = path.resolve(cwd, 'package.json');
  const packageJson = await readJSON(packageJsonPath, { encoding: 'utf8' });

  packageJson.resolutions = {
    ...packageJson.resolutions,
    ...packages.reduce(
      (acc, { name, version }) => ({
        ...acc,
        [name]: version,
      }),
      {}
    ),
  };

  await writeJSON(packageJsonPath, packageJson, { encoding: 'utf8', spaces: 2 });
};

const addRequiredDeps = async ({ cwd, additionalDeps }: Options) => {
  logger.info(`🌍 Adding needed deps & installing all deps`);
  try {
    if (additionalDeps && additionalDeps.length > 0) {
      await exec(`yarn add -D ${additionalDeps.join(' ')} --silent`, {
        cwd,
      });
    } else {
      await exec(`yarn install --silent`, {
        cwd,
      });
    }
  } catch (e) {
    logger.error(`🚨 Dependencies installation failed`);
    throw e;
  }
};

const buildDrupal = async ({ cwd, preBuildCommand }: Options) => {
  logger.info(`👷 Building Drupal`);
  try {
    if (preBuildCommand) {
      await exec(preBuildCommand, { cwd });
    }
    await exec(`yarn build:drupal`, { cwd });
  } catch (e) {
    logger.error(`🚨 Drupal build failed`);
    throw e;
  }
};

const buildStorybook = async ({ cwd, preBuildCommand }: Options) => {
  logger.info(`👷 Building Storybook`);
  try {
    if (preBuildCommand) {
      await exec(preBuildCommand, { cwd });
    }
    await exec(`yarn build:storybook --quiet`, { cwd });
  } catch (e) {
    logger.error(`🚨 Storybook build failed`);
    throw e;
  }
};

const serveStorybook = async ({ cwd }: Options, port: string) => {
  const staticDirectory = path.join(cwd, 'dist/app-storybook');
  logger.info(`🌍 Serving ${staticDirectory} on http://localhost:${port}`);

  return serve(staticDirectory, port);
};

const runCypress = async ({ name, version }: Options, location: string, open: boolean) => {
  const cypressCommand = open ? 'open' : 'run';
  logger.info(`🤖 Running Cypress tests`);
  try {
    await exec(
      `yarn cypress ${cypressCommand} --config --spec "cypress/generated/*" --env location="${location}"`,
      { cwd: rootDir }
    );
    logger.info(`✅ E2E tests success`);
    logger.info(`🎉 Storybook is working great with ${name} ${version}!`);
  } catch (e) {
    logger.error(`🚨 E2E tests fails`);
    throw e;
  }
};

const runTests = async ({ name, version, ...rest }: Parameters) => {
  const options = {
    name,
    version,
    ...rest,
    cwd: path.join(siblingDir, `${name}-v${version}`),
  };

  logger.info(`🏃‍♀️ Starting for ${name} ${version}`);
  logger.log();
  logger.debug(options);
  logger.log();

  if (!(await prepareDirectory(options))) {
    await generate({ ...options, cwd: siblingDir });
    logger.log();

    // await initStorybook(options);
    // logger.log();

//    await setResolutions(options);
//    logger.log();

//    await addRequiredDeps(options);
//    logger.log();

    await buildStorybook(options);
    logger.log();

    await buildDrupal(options);
    logger.log();

  }

  const server = await serveStorybook(options, '4000');
  logger.log();

  let open = false;
  if (!process.env.CI) {
    ({ open } = await prompt({
      type: 'confirm',
      name: 'open',
      message: 'Should open cypress?',
    }));
  }

  await runCypress(options, 'http://localhost:4000', open);
  logger.log();

  server.close();
};

// Run tests!
const runE2E = (parameters: Parameters) =>
  runTests(parameters)
    .then(async () => {
      if (!process.env.CI) {
        const { name, version } = parameters;
        const cwd = path.join(siblingDir, `${name}-v${version}`);

        // @ts-ignore
        const { cleanup } = await prompt({
          type: 'confirm',
          name: 'cleanup',
          message: 'Should perform cleanup?',
        });

        if (cleanup) {
          logger.log();
          logger.info(`🗑  Cleaning ${cwd}`);
          await cleanDirectory({ ...parameters, cwd });
        } else {
          logger.log();
          logger.info(`🚯 No cleanup happened: ${cwd}`);
        }
      }
    })
    .catch((e) => {
      logger.error(`🛑 an error occurred:\n${e}`);
      logger.log();
      logger.error(e);
      logger.log();
      process.exitCode = 1;
    });

const frameworkArgs = process.argv.slice(2);
const typedConfigs: { [key: string]: Parameters } = configs;
let e2eConfigs: { [key: string]: Parameters } = {};

console.log(frameworkArgs);
if (frameworkArgs.length > 0) {
  // eslint-disable-next-line no-restricted-syntax
  for (const [framework, version = 'latest'] of frameworkArgs.map((arg) => arg.split('@'))) {
    e2eConfigs[framework] = {
      ...typedConfigs[framework],
      version,
    };
  }
} else {
  e2eConfigs = typedConfigs;
  // FIXME: For now Yarn 2 E2E tests must be run by explicitly call `yarn test:e2e-framework yarn2Cra@latest`
  //   Because it is telling Yarn to use version 2
  delete e2eConfigs.yarn2Cra;
}

const perform = () => {
  const limit = pLimit(1);
  const narrowedConfigs = Object.values(e2eConfigs);
  const [a, b] = [+process.env.CIRCLE_NODE_INDEX || 0, +process.env.CIRCLE_NODE_TOTAL || 1];
  const step = Math.ceil(narrowedConfigs.length / b);
  const offset = step * a;

  const list = narrowedConfigs.slice().splice(offset, step);

  logger.info(`📑 Assigning jobs ${list.map((c) => c.name).join(', ')} to node ${a} (on ${b})`);

  return Promise.all(list.map((config) => limit(() => runE2E(config))));
};

perform().then(() => {
  process.exit(process.exitCode || 0);
});
