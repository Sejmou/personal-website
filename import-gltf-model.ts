import { promises as fs, existsSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import readline from 'readline';
import util from 'util';

// as we are using ES Module syntax, __dirname is undefined (I guess you never stop learning about weird JS BS lol)
const __dirname = new URL('.', import.meta.url).pathname;

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
async function main(gltfFile: string) {
  // make sure the gltf file path is absolute
  if (!gltfFile.startsWith('/')) {
    gltfFile = join(__dirname, gltfFile);
  }

  const staticFilesDir = join(__dirname, 'public');
  /**
   * The directory where the .glb files for the models in this project are located (accessed by the client browser at runtime)
   */
  const modelGlbFilesDir = join(staticFilesDir, 'models');
  if (!existsSync(modelGlbFilesDir)) {
    // sync fs API has no recursive option - gotta love Node.js lol
    fs.mkdir(modelGlbFilesDir, { recursive: true });
  }

  const appComponentsDir = join(__dirname, 'src', 'components', 'MainPageApp');
  /**
   * The directory where the Svelte components for the Threlte 3D models in this project are located
   */
  const modelComponentsDir = join(appComponentsDir, 'models');
  if (!existsSync(modelComponentsDir)) {
    await fs.mkdir(modelComponentsDir, { recursive: true });
  }

  /**
   * A temporary directory for storing intermediate files created while running this script.
   */
  const tmpDir = join(__dirname, 'tmp', 'gltf-import');

  if (!existsSync(tmpDir)) {
    // sync fs API has no recursive option - gotta love Node.js lol
    await fs.mkdir(tmpDir, { recursive: true });
  }

  // switch to the tmp directory
  process.chdir(tmpDir);
  const gltfConversionCmd = `npx @threlte/gltf@latest "${gltfFile}" --transform`;
  await executeCommand(gltfConversionCmd);
  // command should create two files in tmpDir:
  // - a .glb file (with the same name as the .gltf file, but with the .glb extension instead of .gltf, and '-transformed' appended to the name)
  // - a .svelte file (with the same name as the .gltf file, but with the .svelte extension instead of .gltf)
  const originalFileNameNoExt = gltfFile.split('/').pop()!.split('.')[0];
  const glbFile = join(tmpDir, `${originalFileNameNoExt}-transformed.glb`);
  if (!existsSync(glbFile)) {
    throw new Error(
      `'${glbFile}' should have been created at this point, but it hasn't. Cannot proceed, sorry.`
    );
  }
  const svelteFile = join(tmpDir, `${originalFileNameNoExt}.svelte`);
  if (!existsSync(svelteFile)) {
    throw new Error(
      `'${glbFile}' should have been created at this point, but it hasn't. Cannot proceed, sorry.`
    );
  }

  // allow user to rename the output files
  const userFilename = await askQuestion(
    `The new component will be called ${originalFileNameNoExt}. Enter a new name if you wish, otherwise press Enter to keep the original name:`
  );
  const fileNameNoExt = userFilename || originalFileNameNoExt;

  // the .glb file should be moved to the folder where the client can access it
  const newGlbFile = join(modelGlbFilesDir, `${fileNameNoExt}.glb`);
  if (
    !existsSync(newGlbFile) ||
    (await askYesNoQuestion(
      `A file already exists at '${newGlbFile}'. Overwrite it?`
    ))
  ) {
    // TIL: renaming and moving are the same thing
    await fs.rename(glbFile, newGlbFile);
  }

  // the .svelte file should reference the new location of the .glb file
  // look for useGltf('/' followed by the original file name without extension, add 'models/' in front of the path
  const svelteFileContent = await fs.readFile(svelteFile, 'utf8');
  const newSvelteFileContent = svelteFileContent.replace(
    //-transformed is added to the file name, so we need to remove it
    `useGltf('/${originalFileNameNoExt}-transformed`,
    `useGltf('/models/${fileNameNoExt}`
  );
  const newSvelteFile = join(`${modelComponentsDir}/${fileNameNoExt}.svelte`);
  if (
    !existsSync(newSvelteFile) ||
    (await askYesNoQuestion(
      `A file already exists at '${newSvelteFile}'. Overwrite it?`
    ))
  ) {
    // write the new content to the new file
    await fs.writeFile(newSvelteFile, newSvelteFileContent, 'utf8');
  }
  await fs.unlink(svelteFile);

  if (newSvelteFileContent === svelteFileContent) {
    console.warn(
      `CAUTION: No references to the original .glb file found in '${svelteFile}'.\nYou will need to check and adjust '${newSvelteFile}' manually.`
    );
  }

  process.exit();
}

const execAsync = util.promisify(exec);

async function executeCommand(command: string) {
  try {
    const { stdout, stderr } = await execAsync(command);
    const stdOutTrimmed = stdout.trim();
    if (stdOutTrimmed) console.log(stdOutTrimmed);
    const stdErrTrimmed = stderr.trim();
    if (stdErrTrimmed) console.error(stdErrTrimmed);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

async function askQuestion(question: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

function askYesNoQuestion(question: string): Promise<boolean> {
  return new Promise(resolve => {
    rl.question(`${question} (Y/N): `, answer => {
      const normalizedAnswer = answer.trim().toLowerCase();
      if (normalizedAnswer === 'y' || normalizedAnswer === 'yes') {
        resolve(true);
      } else if (normalizedAnswer === 'n' || normalizedAnswer === 'no') {
        resolve(false);
      } else {
        console.log('Invalid input. Please enter Y or N.');
        resolve(askYesNoQuestion(question));
      }
    });
  });
}

// read first passed argument (it should be the path to the file to process)
const filepath = process.argv[2];

if (!filepath) {
  throw new Error(
    'No file path provided. Please provide the path to the .gltf file you want to import.'
  );
}

if (!existsSync(filepath)) {
  throw new Error(
    `No file found at '${filepath}'. Please provide the path to the .gltf file you want to import.`
  );
}

main(filepath);
