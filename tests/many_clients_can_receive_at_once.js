"use strict";
const { TdNode } = require("./");
const client1 = new TdNode;
const client2 = new TdNode;
// deal with update options
(async () => {
    "use strict";
    while (true) {
        const data = await client1.receive(1);
        if (!data) break;
    }
    while (true) {
        const data = await client2.receive(1);
        if (!data) break;
    }
    const [a, b] = await Promise.all([
        client1.receive(1),
        client2.receive(1),
    ]);
})();
