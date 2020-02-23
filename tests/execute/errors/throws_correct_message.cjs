const { TdNode } = require("./index.cjs");

try {
    TdNode.execute({
        "@type": "testReturnError",
        error: {
            "@type": "error",
            code: 123,
            message: "456",
        },
    });
} catch (e) {
    if (e.message !== "456") {
        throw "Message does not match";
    }
}
