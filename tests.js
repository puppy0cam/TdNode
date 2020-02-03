"use strict";
const fs = require("fs");
const child_process = require("child_process");
const PATH = require("path");
function runTestsInDirectory(path) {
    "use strict";
    const dirents = fs.readdirSync(path, {
        encoding: "utf8",
        withFileTypes: true,
    });
    while (dirents.length) {
        const dirent = dirents.pop();
        if (dirent.isDirectory()) {
            runTestsInDirectory(PATH.join(path, dirent.name));
        } else if (dirent.isFile()) {
            if (dirent.name === "index.js") continue;
            console.group(PATH.join(path, dirent.name));
            runTestOnFile(path, dirent.name);
            console.groupEnd(PATH.join(path, dirent.name));
        } else {
            throw new Error("Not a file or directory");
        }
    }
}
function runTestOnFile(path, file) {
    "use strict";
    console.log("Testing...");
    try {
        child_process.execSync("node " + file, {
            stdio: "ignore",
            cwd: path,
            encoding: "utf8",
        });
    } catch (e) {
        console.error("Failed");
        return;
    }
    console.log("Passed");
}
runTestsInDirectory("tests");
