const { TdNode } = require("..");
try {
    const result = TdNode.execute({
        "@type": "testReturnError",
        error: {
            "@type": "error",
            code: 123,
            message: "ERROR.TEST",
        },
    });
    if (result["@type"] === "error") {
        throw "Returned";
    }
    throw "Bad type returned";
} catch (e) {
    if (e instanceof Error) {
        throw "JavaScript Error object"
    }
    if (typeof e !== "object" || e === null) {
        throw "Not an object";
    }
    if (e["@type"] !== "error") {
        throw "not an error object";
    }
    if (e.code !== 123) {
        throw "error code does not match input";
    }
    if (e.message !== "ERROR.TEST") {
        throw "error message does not match input";
    }
}
