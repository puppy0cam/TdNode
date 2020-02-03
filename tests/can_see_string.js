"use strict";
const { TdNode } = require("./");
const client = new TdNode;
(async () => {
    "use strict";
    while (true) {
        const data = await client.receive(1);
        if (!data) continue;
        if (data["@extra"] === 1) {
            if (data["@type"] === "error") {
                throw "Returned an error";
            }
            if (data["@type"] !== "testString") {
                throw "Not a test string";
            }
            if (data.value !== "Hello World!") {
                throw "Value did not match";
            }
            return;
        }
    }
})();
client.send({
    "@type": "testCallString",
    x: "Hello World!",
    "@extra": 1,
});
