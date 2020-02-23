/** @type {typeof import("./parsing_tl")} */
const {
    TD_API: {
        functions,
        constructors,
        classes,
    },
} = require("./parsing_tl.cjs");
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
// tslint:disable:class-name
// tslint:disable:interface-name
// tslint:disable:max-line-length
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
    "@extra"?: undefined | bigint | number | string | object;`;
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
 */
export class TdNode {
    public constructor();
    /** Receive data from TDLib */
    public receive(timeout?: number | undefined): Promise<null | _CONSTRUCTORS>;
    /** Sends data to TDLib */
    public send(request: _FUNCTIONS): void;
    /** Execute a request synchronously, will only work for certain requests. Not bound to any particular client */
    public static execute(request: _FUNCTIONS): _CONSTRUCTORS;
}

`;
exports.result = result;
