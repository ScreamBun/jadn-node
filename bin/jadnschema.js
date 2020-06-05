#!/usr/bin/env node
/** @ignore *//** */
/* eslint no-console:off */


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
const getErrorMessage = error => {

  // Lazy loading because those are used only if error happened.
  const fs = require("fs");
  const path = require("path");
  const util = require("util");
  const lodash = require("lodash");

  // Foolproof -- thirdparty module might throw non-object.
  if (typeof error !== "object" || error === null) {
    return String(error);
  }

  // Use templates if `error.messageTemplate` is present.
  if (typeof error.messageTemplate === "string") {
    try {
      const templateFilePath = path.resolve(
        __dirname,
        `../messages/${error.messageTemplate}.txt`
      );

      // Use sync API because Node.js should exit at this tick.
      const templateText = fs.readFileSync(templateFilePath, "utf-8");
      const template = lodash.template(templateText);

      return template(error.messageData || {});
    } catch {

      // Ignore template error then fallback to use `error.stack`.
    }
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
const onFatalError = error => {
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
  process.exitCode = await require("../dist/cli").execute(
    process.argv,
    process.argv.includes("--stdin") ? await readStdin() : null
  );
}()).catch(onFatalError);
