const execSync = require("child_process").execSync;
const fs = require("fs");
const os = require("os");
const _path = require("path");
function del(path) {
    let info;
    try {
        info = fs.statSync(path);
    } catch {
        console.log("Failed to get info for " + path);
        console.log("Will assume it just does not exist");
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
    console.log("Initiating the git repo");
    exec("git init");
    try {
        console.log("Attempting to add td submodule");
        exec("git submodule add https://github.com/tdlib/td.git");
        console.log("td submodule obtained");
    } catch {
        console.log("td submodule probably already exists, so will try to update it instead");
        exec("git submodule update --init --remote td");
        console.log("td submodule updated");
    }
    console.log("Checking out master");
    exec("git checkout master", "./td");
    console.log("Pulling changes from remote");
    exec("git pull", "./td");
    try {
        console.log("Attempting to add vcpkg submodule");
        exec("git submodule add https://github.com/Microsoft/vcpkg.git", "./td");
        console.log("vcpkg submodule obtained");
    } catch {
        console.log("vcpkg submodule likely already exists, so will try to update it instead");
        exec("git submodule update --init --remote vcpkg", "./td");
        console.log("vcpkg submodule updated");
    }
    console.log("Checking out master");
    exec("git checkout master", "./td/vcpkg");
    console.log("pulling changes from remote");
    exec("git pull", "./td/vcpkg");
    console.log("Executing vcpkg bootstrap");
    exec("bootstrap-vcpkg.bat", "./td/vcpkg");
    console.log("Installing vcpkg dependencies");
    exec("vcpkg.exe install openssl:" + os.arch() + "-windows zlib:" + os.arch() + "-windows", "./td/vcpkg");
    console.log("Deleting last TDLib build");
    del("./td/build");
    console.log("Deleting last TdNode build");
    del("./td/example/node");
    console.log("Creating new TDLib build directory");
    fs.mkdirSync("./td/build");
    console.log("Executing cmake preparation");
    exec("cmake -A " + process.arch + " -DCMAKE_INSTALL_PREFIX:PATH=../tdlib -DCMAKE_TOOLCHAIN_FILE:FILEPATH=../vcpkg/scripts/buildsystems/vcpkg.cmake ..", "./td/build");
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
    console.log("Creating working directory for TdNode build");
    fs.mkdirSync("./td/example/node");
    console.log("Copying source files for TdNode build");
    for (const i of fs.readdirSync("./src")) {
        console.log("  " + i);
        fs.copyFileSync("./src/" + i, "./td/example/node/" + i);
    }
    console.log("Preparing secondary TDLib build");
    exec("cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX:PATH=../example/node/td ..", "./td/build");
    console.log("Doing secondary build");
    exec("cmake --build . --target install --config Release", "./td/build");
    console.log("Doing Cmake-js install");
    exec("cmake-js install", "./td/example/node");
    console.log("Configuring TdNode");
    exec("cmake-js configure --CDNODE_ADDON_API_DIR="+ require("node-addon-api").include, "./td/example/node");
    console.log("Building TdNode");
    exec("cmake-js build", "./td/example/node");
    console.log("Copying TdNode.node");
    fs.copyFileSync("./td/example/node/build/Release/TdNode.node", "./TdNode.node");
} else {
    throw new Error("Platform does not support an automatic build. You can contribute to the project by creating a set of build instructions for your system and submitting a pull request");
}
console.log("Done");
