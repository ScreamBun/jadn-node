#!/usr/bin/env node
/* eslint no-console: 0 */

// to use V8's code cache to speed up instantiation time
require("v8-compile-cache");

// must do this initialization *before* other requires in order to work
if (process.argv.includes("--debug")) {
  require("debug").enable("eslint:*,-eslint:code-path");
}

// Helpers
//------------------------------------------------------------------------------
/**
 * Read data from stdin til the end.
 */
const readStdin = () => {
  return new Promise((resolve, reject) => {
    let content = "";
    let chunk = "";

    process.stdin
      .setEncoding("utf8")
      .on("readable", () => {
        while ((chunk = process.stdin.read()) !== null) {
          content += chunk;
        }
      })
      .on("end", () => resolve(content))
      .on("error", reject);
  });
}

/**
 * Get the error message of a given value.
 * @param {any} error The value to get.
 * @returns {string} The error message.
 */
const getErrorMessage = (error: Error) => {
  // Lazy loading because those are used only if error happened.
  const util = require("util");

  // Foolproof -- thirdparty module might throw non-object.
  if (typeof error !== "object" || error === null) {
    return String(error);
  }

  // Use the stacktrace if it's an error object.
  if (typeof error.stack === "string") {
    return error.stack;
  }

  // Otherwise, dump the object.
  return util.format("%o", error);
}

/**
 * Catch and report unexpected error.
 * @param {any} error The thrown error object.
 * @returns {void}
 */
const onFatalError = (error: Error) => {
  process.exitCode = 2;
  const { version } = require("../package.json");
  const message = getErrorMessage(error);

  console.error(`Oops! Something went wrong! :(\nJADN Schema: ${version}\n${message}`);
}

// Execution
//------------------------------------------------------------------------------
(async function main() {
  process.on("uncaughtException", onFatalError);
  process.on("unhandledRejection", onFatalError);

  // Call the CLI
  process.exitCode = await require("../lib/cli").execute(
    process.argv,
    process.argv.includes("--stdin") ? await readStdin() : null
  );
}()).catch(onFatalError);
