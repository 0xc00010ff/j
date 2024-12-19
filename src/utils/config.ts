import os from 'os';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import readline from 'readline';

const CONFIG_DIR = path.join(os.homedir(), '.j-cli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

interface Config {
  openaiApiKey?: string;
}

export function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function loadConfig(): Config {
  ensureConfigDir();
  if (!fs.existsSync(CONFIG_FILE)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch (error) {
    return {};
  }
}

export function saveConfig(config: Config): void {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export async function setupApiKey(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(chalk.yellow('\nNo OpenAI API key found.'));
  console.log(chalk.blue('\nGet your API key from:'));
  console.log(chalk.cyan('https://platform.openai.com/api-keys'));
  
  const apiKey = await new Promise<string>((resolve) => {
    rl.question(chalk.green('\nEnter your OpenAI API key: '), (answer) => {
      resolve(answer.trim());
    });
  });

  rl.close();

  if (!apiKey) {
    throw new Error('API key is required');
  }

  const config = loadConfig();
  config.openaiApiKey = apiKey;
  saveConfig(config);

  console.log(chalk.green('\nAPI key saved successfully!\n'));
  return apiKey;
}

export function getApiKey(): string | undefined {
  // First check environment variable
  const envApiKey = process.env.OPENAI_API_KEY;
  if (envApiKey) {
    if (process.env.VERBOSE || process.argv.includes('--verbose') || process.argv.includes('-v')) {
      console.log(chalk.dim('Using API key from environment variable'));
    }
    return envApiKey;
  }

  // Then check config file
  const config = loadConfig();
  if (config.openaiApiKey && (process.env.VERBOSE || process.argv.includes('--verbose') || process.argv.includes('-v'))) {
    console.log(chalk.dim('Using API key from config file'));
  }
  return config.openaiApiKey;
}

export function removeApiKey(): void {
  if (process.env.OPENAI_API_KEY) {
    console.log(chalk.yellow('\nNote: OPENAI_API_KEY environment variable will still take precedence\n'));
  }
  const config = loadConfig();
  delete config.openaiApiKey;
  saveConfig(config);
  console.log(chalk.green('\nAPI key removed from config file\n'));
}

export function setApiKey(key: string): void {
  if (process.env.OPENAI_API_KEY) {
    console.log(chalk.yellow('\nNote: OPENAI_API_KEY environment variable will still take precedence\n'));
  }
  if (!key.trim()) {
    throw new Error('API key cannot be empty');
  }
  const config = loadConfig();
  config.openaiApiKey = key.trim();
  saveConfig(config);
  console.log(chalk.green('\nAPI key saved to config file\n'));
}
