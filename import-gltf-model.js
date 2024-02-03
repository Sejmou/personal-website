import { existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import readline from 'readline';
import util from 'util';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * A helper script for importing a glTF model into the project.
 * Uses the latest version of @threlte/gltf (via npx) to convert the glTF file to a .glb file and create a Svelte component for it.
 *
 * At the end, the model component is placed in the expected location in the src directory,
 * while the .glb file is placed in the public folder so that it is accesible to the browser.
 *
 * References to the file are updated in the component.
 */
async function main() {
  const outfolder = join(process.cwd(), 'public/models');
  const infolder = join(process.cwd(), 'tmp');
  if (!existsSync(infolder)) {
    throw new Error(
      `Folder '${infolder}' does not exist. Create it and place your model files there.`
    );
  }
  // cd into the infolder as otherwise output of the @threlte/gltf is placed in the root folder (couldn't figure out how to change that behavior; --output flag doesn't seem to work)
  process.chdir(infolder);

  if (!existsSync(outfolder)) {
    mkdirSync(outfolder, { recursive: true });
  }

  const filepaths = readDirectoryRecursively(infolder);
  const gltfFiles = filepaths.filter(fp => fp.endsWith('.gltf'));
  if (gltfFiles.length > 1) {
    throw new Error(
      `Multiple .gltf files found in '${infolder}'. Only one is supported by this script currently, sorry!`
    );
  }
  const gltfFile = gltfFiles[0];

  if (!gltfFile) {
    throw new Error(
      `No .gltf file found in '${infolder}'. Add one to import the contained model.`
    );
  }

  const command = `npx @threlte/gltf@latest "${gltfFile}" --transform`;
  console.log('this will execute:', command);
  askYesNoQuestion('Continue?', async isConfirmed => {
    if (isConfirmed) {
      await executeCommand(command);
    }
    process.exit();
  });
}

function readDirectoryRecursively(directory) {
  let files = [];

  readdirSync(directory).forEach(file => {
    const filePath = join(directory, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      files = files.concat(readDirectoryRecursively(filePath));
    } else {
      files.push(filePath);
    }
  });

  return files;
}

const execAsync = util.promisify(exec);

async function executeCommand(command) {
  try {
    const { stdout, stderr } = await execAsync(command);
    console.log('\nDone!\n');
    console.log(`stdout: ${stdout}\n`);
    console.error(`stderr: ${stderr}`);
  } catch (error) {
    console.error(`Error while executing: ${error}`);
  }
}

function askYesNoQuestion(question, callback) {
  rl.question(`${question} (Y/N): `, answer => {
    const normalizedAnswer = answer.trim().toLowerCase();
    if (normalizedAnswer === 'y' || normalizedAnswer === 'yes') {
      callback(true);
    } else if (normalizedAnswer === 'n' || normalizedAnswer === 'no') {
      callback(false);
    } else {
      console.log('Invalid input. Please enter Y or N.');
      askYesNoQuestion(question, callback);
    }
  });
}

main();
