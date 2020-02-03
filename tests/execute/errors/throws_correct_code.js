const { TdNode } = require("../../..");

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
    if (e.code !== 123) {
        throw "Code does not match";
    }
}
