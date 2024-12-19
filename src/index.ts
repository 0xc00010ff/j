#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { translateCommand } from "./services/openai";
import { executeCommand } from "./utils/executor";
import dotenv from "dotenv";
import { version } from "../package.json";
import { removeApiKey, setApiKey } from "./utils/config";

dotenv.config({ path: ".env.local" });

const program = new Command();

program
  .name("j")
  .description("j tell me what to do and i'll do it")
  .version(version)
  .allowUnknownOption()
  .argument("[args...]", "Command to translate and execute")
  .option("-d, --dry-run", "Show the command without executing it")
  .option("-v, --verbose", "Show detailed output")
  .option(
    "-k, --key [key]",
    "Set OpenAI API key (or remove if no key provided)"
  )
  .action(async (args: string[], options) => {
    if (!args.length) {
      program.help();
      return;
    }

    const input = args.join(" ");
    const spinner = ora("Translating command...").start();
    try {
      const translatedCommand = await translateCommand(input);
      spinner.succeed("Command translated");

      if (options.verbose) {
        console.log(
          chalk.cyan("\nTranslated command:"),
          chalk.yellow(translatedCommand)
        );
      }

      if (options.dryRun) {
        console.log(
          chalk.cyan("\nCommand (dry run):"),
          chalk.yellow(translatedCommand)
        );
        return;
      }

      console.log(
        chalk.cyan("\nExecuting command:"),
        chalk.yellow(translatedCommand)
      );
      await executeCommand(translatedCommand);
    } catch (error) {
      spinner.fail("Command failed");
      console.error(
        chalk.red("Error:"),
        error instanceof Error ? error.message : "Unknown error"
      );
      process.exit(1);
    }
  });

program.hook("preAction", (thisCommand) => {
  const options = thisCommand.opts();
  if (options.key !== undefined) {
    try {
      if (options.key === true) {
        removeApiKey();
      } else {
        setApiKey(options.key);
      }
      process.exit(0);
    } catch (error: any) {
      console.error(chalk.red(`\nError: ${error.message}\n`));
      process.exit(1);
    }
  }
});

program.parse();
