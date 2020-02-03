"use strict";
const { TdNode } = require("./");
const client = new TdNode;
(async () => {
    "use strict";
    while (true) {
        if (Date.now() - start > 30) {
            throw "Timed out";
        }
        const data = await client.receive(1);
        if (!data) continue;
        if (data["@extra"] === 1) {
            if (data["@type"] === "error") {
                throw "Returned an error";
            }
            return;
        }
    }
})().catch(reason => {
    "use strict";
    throw reason;
});
const start = Date.now();
client.send({
    "@type": "testNetwork",
    "@extra": 1,
});
