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
/** A primitive type */
export type Bool = boolean;
/** A primitive type */
export type boolTrue = true;
/** A primitive type */
export type boolFalse = false;
/** A primitive type */
export type String = string;
/** A primitive type */
export type int32 = number;
/** A primitive type */
export type int53 = number;
/** A primitive type */
export type double = number;
/** A primitive type */
export type int64 = bigint;
/** A primitive type */
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
    /**
     * Helps consuming code know that this is a ${i.name} object
     */
    "@type": "${i.name}";
    /**
     * Applies to objects received from TdNode.
     * This does not require you to specify it yourself
     */
    [Symbol.toStringTag]?: "${i.name}";`;
    let extra_tag_applicable = false;
    thing: for (const j of classes) {
        if (j.name === i.constructs) {
            for (const funct of functions) {
                if (funct.returns === j.name || funct.returns === i.name) {
                    extra_tag_applicable = true;
                    break thing;
                }
            }
        }
    }
    if (extra_tag_applicable) {
        result += `
    /**
     * Extra data from the request that generated this result.
     * This will only be present on the top level object of the received data.
     */
    "@extra"?: undefined | bigint | number | string | object;`;
    }
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
    /**
     * The type of class this constructor belongs to.
     */
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
    /**
     * A list of the functions that return this class.
     */
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
    /**
     * Helps consuming code know that this is a ${i.name} object.
     */
    "@type": "${i.name}";
    /**
     * The value here will be added to the top level of the object received upon the request being finished.
     */
    "@extra"?: undefined | bigint | number | string | object;`;
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
    /**
     * If successful, the function will result in this type
     */
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
    /**
     * Receive data from TDLib
     * @param timeout the amount of seconds to wait for data from tdlib until it gives up and resolves the promise with null.
     * Depending on your CPU and how many clients are receiving simultaniously, this could exceed the specified time.
     * Defaults to 60 seconds.
     */
    public receive(timeout?: number | undefined): Promise<null | _CONSTRUCTORS>;
    /** Receive data from TDLib if any is immediately available */
    public receiveSync(): null | _CONSTRUCTORS;
    /** Sends data to TDLib */
    public send(request: _FUNCTIONS): void;
    /** Execute a request synchronously, will only work for certain requests. Not bound to any particular client */
    public static execute(request: _FUNCTIONS): _CONSTRUCTORS;
}

`;
exports.result = result;
