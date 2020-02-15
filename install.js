const execSync = require("child_process").execSync;
const fs = require("fs");
const os = require("os");
const _path = require("path");
const process = require("process");
function del(path) {
    let info;
    try {
        info = fs.statSync(path);
    } catch (e) {
        console.log("Failed to get info for " + path);
        console.log("Will assume it just does not exist");
        console.log(e);
        return;
    }
    if (info.isDirectory()) {
        const dir = fs.readdirSync(path);
        for (let i = 0; i < dir.length; i++) {
            del(_path.join(path, dir[i]));
        }
        fs.rmdirSync(path);
    } else if (info.isFile() || info.isSymbolicLink()) {
        fs.unlinkSync(path);
    } else {
        throw new Error("Only know how to use files and directories");
    }
}
/**
 * @param {string} command
 * @param {string=} cwd
 */
function exec(command, cwd) {
    if (cwd) {
        console.log("  " + cwd + ":");
    } else {
        cwd = process.cwd();
    }
    console.log("  " + command);
    execSync(command, {
        stdio: "inherit",
        cwd,
    });
}
console.log("Note: Building can take a LONG time.");

if (process.platform === "win32") {
    if (!process.env.VCPKG_DOWNLOADS) {
        console.warn("Note: If installing this module to multiple places in the system, it is recommended that you set the VCPKG_DOWNLOADS environment variable to a dedicated folder. Doing so can reduce future build times significantly.");
    }
    console.log("Executing vcpkg bootstrap");
    exec("bootstrap-vcpkg.bat", "./vcpkg");
    console.log("Installing vcpkg dependencies");
    exec("vcpkg.exe install openssl:" + os.arch() + "-windows zlib:" + os.arch() + "-windows", "./vcpkg");
    console.log("Deleting last TDLib build");
    del("./td/build");
    console.log("Creating new TDLib build directory");
    fs.mkdirSync("./td/build");
    console.log("Executing cmake preparation");
    exec("cmake -A " + process.arch + " -DCMAKE_INSTALL_PREFIX:PATH=../../tdlib -DCMAKE_TOOLCHAIN_FILE:FILEPATH=../../vcpkg/scripts/buildsystems/vcpkg.cmake ..", "./td/build");
    console.log("Executing cmake build");
    exec("cmake --build . --target install --config Release", "./td/build");
    console.log("Copying dll files up to module root");
    for (const i of fs.readdirSync("./td/build/Release")) {
        if (i.endsWith(".dll")) {
            console.log("  " + i);
            fs.copyFileSync("./td/build/Release/" + i, "./" + i);
        }
    }
    console.log("Parsing the schema");
    const schema = require("./parsing_tl.js");
    console.log("Saving JSON schema to td_api.json");
    fs.writeFileSync("./td_api.json", JSON.stringify(schema.TD_API));
    console.log("Generating TypeScript definitions for schema");
    const ts_def = require("./generate_tl_ts.js");
    console.log("Saving TypeScript definitions for schema");
    fs.writeFileSync("./index.d.ts", ts_def.result);
    require("./generate_converters.js");

    console.log("Configuring TdNode build");
    exec("cmake-js configure", ".");
    console.log("Building TdNode");
    exec("cmake-js build", ".");
    console.log("Copying build result");
    fs.copyFileSync("./build/Release/TdNode.node", "./TdNode.node");
} else {
    throw new Error("Platform does not support an automatic build. You can contribute to the project by creating a set of build instructions for your system and submitting a pull request at https://github.com/puppy0cam/TdNode");
}
console.log("Done. Now running tests.");
require("./tests.js");
