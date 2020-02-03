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
            return;
        }
    }
})();
client.send({
    "@type": "testCallEmpty",
    "@extra": 1,
});
