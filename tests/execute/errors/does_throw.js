"use strict";
const { TdNode } = require(".");
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
    return;
}
throw "Did not throw";
