/** @type {typeof import("./parsing_tl")} */
const {
    TD_API: {
        functions,
        constructors,
        classes,
    },
} = require("./parsing_tl.js");
function handleParamTypeDefinition(type) {
    "use strict";
    if (type["@type"] === "constructorParamType") {
        return type.constructorName;
    } else if (type["@type"] === "classParamType") {
        return type.className;
    } else {
        return "Array<" + handleParamTypeDefinition(type.of_type) + ">";
    }
}
function createStarComment(description) {
    "use strict";
    description = description || "";
    const lines = description.split(/\r?\n/).filter(value => !!value);
    if (lines.length === 0) {
        return "";
    } else if (lines.length === 1) {
        return `/** ${lines[0]} */`;
    } else {
        return `/**\n * ${lines.join("\n * ")}\n */`;
    }
}
let result = `\
//#region primitives
export type Bool = boolean;
export type boolTrue = true;
export type boolFalse = false;
export type String = string;
export type int32 = number;
export type int53 = number;
export type double = number;
/** You should convert this to BigInt if a calculation must be done on this number. When sending data of this type to TDLib, you should explicitly turn the value into a string */
export type int64 = string;
/** You should use Buffer.from(data, "base64") to decode this value. When transmitting a Buffer to tdlib, you should convert it into a base64 string with buffer.toString("base64") */
export type bytes = string;
//#endregion
//#region constructors
`;
const all_constructor_names_in_constructors = new Set();
for (const i of constructors) {
    if (i["@type"] !== "constructorTypeObject") {
        throw new TypeError("Object type expected");
    }
    if (i.description) {
        result += createStarComment(i.description) + "\n";
    }
    result += `export interface ${i.name} {
    "@type": "${i.name}";
    "@extra"?: any;`;
    for (const param of i.parameters) {
        if (param.description) {
            result += `
    ${createStarComment(param.description).replace(/\n/g, "\n    ")}`;
        }
        result += `
    ${param.name}: ${handleParamTypeDefinition(param.type)}${(param.description && param.description.includes("may be null")) ? " | null" : ""};`;
    }
    result += `
}
export namespace ${i.name} {
    export type constructs = ${i.constructs};
}
`;
    all_constructor_names_in_constructors.add(i.name);
}
result += `\
export type _CONSTRUCTORS = ${[...all_constructor_names_in_constructors].join(" | ") || "never"};
//#endregion
//#region classes
`;
const all_class_names_in_classes = new Set();
for (const i of classes) {
    if (i["@type"] !== "classType") {
        throw new TypeError("Class type expected");
    }
    if (i.description) {
        result += createStarComment(i.description) + "\n";
    }
    result += `export type ${i.name} = ${i.constructors.join(" | ") || "never"};
export namespace ${i.name} {
    export type functions = ${i.functions.join(" | ") || "never"};
}
`;
    all_class_names_in_classes.add(i.name);
}
result += `\
export type _CLASSES = ${[...all_class_names_in_classes].join(" | ") || "never"};
//#endregion
//#region functions
`;
const all_function_names_in_functions = new Set();
const all_function_return_types = new Map();
for (const i of functions) {
    if (i["@type"] !== "constructorTypeFunction") {
        throw new TypeError("Function type expected");
    }
    if (i.description) {
        result += createStarComment(i.description) + "\n";
    }
    result += `export interface ${i.name} {
    "@type": "${i.name}";
    "@extra"?: any;`;
    for (const param of i.parameters) {
        if (param.description) {
            result += "\n    " + createStarComment(param.description).replace(/\n/g, "\n    ");
        }
        result += `
    ${param.name}: ${handleParamTypeDefinition(param.type)}${(param.description && param.description.includes("may be null")) ? " | null" : ""};`;
    }
    result += `
}
export namespace ${i.name} {
    export type returns = ${i.returns};
}
`;
    all_function_names_in_functions.add(i.name);
    all_function_return_types.set(i.name, i.returns);
}
result += `\
export type _FUNCTIONS = ${[...all_function_names_in_functions].join(" | ") || "never"};
//#endregion

/**
 * Native Node.JS TDLib interface.
 *
 * All methods in class must strictly the exact number of arguments requested,
 * no more and no less.
 * You should not allow the client to be garbage collected even if it is closed.
 * The client will be properly and silently closed when the process exits.
 */
export class TelegramClient {
    public constructor();
    /** 
     * Currently not stable,
     * for now you may use the \`close\` function in TDLib.
     */
    private destroy();
    /** Sets the log level of TDLib. 0 for no logging; 5 for most logging; larger than 5 for special circumstances */
    public static setLogLevel(level: number): void;
    /** Set the callback function for data received that does not have a correlating request */
    public listen(callback: (this: this, data: Update | undefined, error: undefined | Error) => void): void;
    /** Starts polling for updates */
    public start(): void;
    //#region functions`;
for (const i of functions) {
    if (i.description) {
        result += `
        ${createStarComment(i.description).replace(/\n/g,"\n    ")}`;
    }
    result += `
    public send(request: ${i.name}): Promise<${i.returns}>;`;
}
result += `
    //#endregion
}

`;
exports.result = result;
