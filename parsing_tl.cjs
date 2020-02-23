"use strict";
const fs = require("fs");
const td_api_tl = (fs.readFileSync("./td/td/generate/scheme/td_api.tl", {
    encoding: "utf-8"
})
.replace("double ? = Double;", "")
.replace("string ? = String;", "")
.replace("int32 = Int32;", "")
.replace("int53 = Int53;", "")
.replace("int64 = Int64;", "")
.replace("bytes = Bytes;", "")
.replace("boolFalse = Bool;", "")
.replace("boolTrue = Bool;", "")
.replace("vector {t:Type} # [ t ] = Vector t;", "")
.replace(/ @/g, "\n//@")
.replace(/@description/g, "@@description")
.replace(/@class/g, "@@class")
.replace(/@param_/g, "@")
.replace(/\/@([a-zA-Z0-9_]+)/g, "/@param $1")
.split(/\r?\n/)
.filter(function (value) { return !!value; }));
let current_type_mode = "Constructor";
function parseComment(line) {
    "use strict";
    if (line.startsWith("//")) {
        if (line.startsWith("//@@description")) {
            return {
                "@type": "descriptionComment",
                description: line.slice(16)
            };
        }
        else if (line.startsWith("//@@class")) {
            return {
                "@type": "classComment",
                name: line.slice(10)
            };
        }
        else if (line.startsWith("//@param")) {
            var _a = line.split(" "), parameter = _a[1], descriptionWords = _a.slice(2);
            return {
                "@type": "parameterComment",
                parameter: parameter,
                description: descriptionWords.join(" ")
            };
        }
        else {
            return {
                "@type": "emptyComment"
            };
        }
    }
    else {
        throw new Error("Line is not a comment");
    }
}
const constructors = [];
const known_classes = [];
let pending_comments = [];
mainIteration: for (var i = 0; i < td_api_tl.length; i++) {
    var line = td_api_tl[i];
    if (line === "---functions---") {
        current_type_mode = "Function";
    }
    else if (line === "---types---") {
        current_type_mode = "Constructor";
    }
    if (line.startsWith("//")) {
        var comment = parseComment(line);
        pending_comments.push(comment);
        if (comment["@type"] === "classComment") {
            continue mainIteration;
        }
    }
    { // check for class and it's description.
        var classComment = void 0;
        var descriptionComment = void 0;
        for (var j = 0; j < pending_comments.length; j++) {
            var comment = pending_comments[j];
            if (comment["@type"] === "classComment") {
                classComment = comment;
            }
            else if (comment["@type"] === "descriptionComment") {
                descriptionComment = comment;
            }
        }
        if (classComment) {
            pending_comments = [];
            for (var k = 0; k < known_classes.length; k++) {
                var knownClass = known_classes[k];
                if (knownClass.name === classComment.name) {
                    if (descriptionComment && descriptionComment.description) {
                        known_classes[k].description = descriptionComment.description;
                    }
                    continue mainIteration;
                }
            }
            var new_class = {
                "@type": "classType",
                name: classComment.name
            };
            if (descriptionComment && descriptionComment.description) {
                new_class.description = descriptionComment.description;
            }
            known_classes.push(new_class);
            continue mainIteration;
        }
    }
    constructorCheck: { // constructor check
        if (!line.endsWith(";") || line.startsWith("//")) {
            break constructorCheck;
        }
        var _a = line.split(/[ =]+/), constructorName = _a[0], constructorParams = _a.slice(1);
        var constructorClassName = constructorParams.pop().slice(0, -1);
        var constructor = void 0;
        if (current_type_mode === "Constructor") {
            constructor = {
                "@type": "constructorTypeObject",
                name: constructorName,
                type_mode: current_type_mode,
                parameters: [],
                constructs: constructorClassName
            };
        }
        else if (current_type_mode === "Function") {
            constructor = {
                "@type": "constructorTypeFunction",
                name: constructorName,
                parameters: [],
                type_mode: current_type_mode,
                returns: constructorClassName
            };
        }
        for (var j = 0; j < pending_comments.length; j++) {
            var pending_comment = pending_comments[j];
            if (pending_comment["@type"] === "descriptionComment") {
                if (pending_comment.description) {
                    constructor.description = pending_comment.description;
                }
            }
        }
        classCheck: { // check to make sure the class exists
            for (var j = 0; j < known_classes.length; j++) {
                var knownClass = known_classes[j];
                if (knownClass.name === constructorClassName)
                    break classCheck;
            }
            known_classes.push({
                "@type": "classType",
                name: constructorClassName
            });
        }
        for (var j = 0; j < constructorParams.length; j++) {
            var constructorParam = constructorParams[j];
            var _b = constructorParam.split(":"), paramName = _b[0], paramType = _b[1];
            var param_description = void 0;
            paramdescriptionrun: for (var k = 0; k < pending_comments.length; k++) {
                var pending_comment = pending_comments[k];
                if (pending_comment["@type"] === "parameterComment") {
                    if (pending_comment.parameter === paramName) {
                        if (pending_comment.description) {
                            param_description = pending_comment.description;
                            break paramdescriptionrun;
                        }
                    }
                }
                else if (pending_comment["@type"] === "descriptionComment") {
                    if (pending_comment.description) {
                        constructor.description = pending_comment.description;
                    }
                }
            }
            var paramData = {
                "@type": "parameter",
                name: paramName,
                type: handleParamType(paramType)
            };
            if (param_description) {
                paramData.description = param_description;
            }
            constructor.parameters.push(paramData);
        }
        constructors.push(constructor);
        pending_comments = [];
        continue mainIteration;
    }
}
function handleParamType(type) {
    "use strict";
    if (type.startsWith("vector<") && type.endsWith(">")) {
        return {
            "@type": "vectorParamType",
            of_type: handleParamType(type.slice(7, -1))
        };
    }
    else if (type[0] === type[0].toUpperCase()) {
        return {
            "@type": "classParamType",
            className: type
        };
    }
    else if (type[0] === type[0].toLowerCase()) {
        return {
            "@type": "constructorParamType",
            constructorName: type
        };
    }
    else {
        throw new Error("Unknown type");
    }
}
const __functions = [];
const __constructors = [];
const __classes = [];
for (var i = 0; i < known_classes.length; i++) {
    var _class = known_classes[i];
    _class.constructors = [];
    _class.functions = [];
    for (var j = 0; j < constructors.length; j++) {
        var constructor = constructors[j];
        if (constructor["@type"] === "constructorTypeObject" && constructor.constructs === _class.name) {
            _class.constructors.push(constructor.name);
        }
        else if (constructor["@type"] === "constructorTypeFunction" && constructor.returns === _class.name) {
            _class.functions.push(constructor.name);
        }
    }
    __classes.push(_class);
}
for (var i = 0; i < constructors.length; i++) {
    var constructor = constructors[i];
    if (constructor["@type"] === "constructorTypeFunction") {
        __functions.push(constructor);
    }
    else if (constructor["@type"] === "constructorTypeObject") {
        __constructors.push(constructor);
    }
}
exports.TD_API = {
    functions: __functions,
    constructors: __constructors,
    classes: __classes
};
