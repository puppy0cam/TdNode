const { TdNode } = require("../..");

const result = TdNode.execute({
    "@type": "setLogVerbosityLevel",
    new_verbosity_level: 0,
    "@extra": "extra_data",
});
if (result["@extra"] === "extra_data") {
    throw "@extra is returned in execute";
}
