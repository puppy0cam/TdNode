"use strict";
const { TdNode } = require("./");
const client = new TdNode();
if (!(client.receive() instanceof Promise)) {
    throw "Not a promise";
}
