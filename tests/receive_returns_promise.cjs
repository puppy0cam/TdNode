"use strict";
const { TdNode } = require("./index.cjs");
const client = new TdNode();
if (!(client.receive() instanceof Promise)) {
    throw "Not a promise";
}
