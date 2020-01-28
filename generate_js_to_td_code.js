/** @type {typeof import("./parsing_tl").TD_API} */
const {
    constructors,
    functions,
    classes,
} = require("./td_api.json");

let result = `\
#ifndef _TdNode_JS_TO_TD_CODE
#define _TdNode_JS_TO_TD_CODE

#include "libraries.h"
#include "js-to-td.h"

const bool TdNode::ToTelegram::IsNotNullish(const Napi::Value value) {
    return !value.IsNull() && !value.IsUndefined();
}
TdNode::ToTelegram::double_t TdNode::ToTelegram::double_(const Napi::Value value) {
    return value.As<const Napi::Number>().DoubleValue();
}
TdNode::ToTelegram::string_t TdNode::ToTelegram::string_(const Napi::Value value) {
    return value.As<const Napi::String>().Utf8Value();
}
TdNode::ToTelegram::int64_t TdNode::ToTelegram::int64_(const Napi::Value value) {
    switch (value.Type()) {
        case napi_valuetype::napi_bigint:
            return std::stoll(value.ToString());
        case napi_valuetype::napi_number:
            return value.As<const Napi::Number>().Int64Value();
        case napi_valuetype::napi_string:
            return std::stoll(value.As<const Napi::String>());
        default:
            throw std::exception("Cannot coerce JS value of such type to int64");
    }
}
TdNode::ToTelegram::int53_t TdNode::ToTelegram::int53_(const Napi::Value value) {
    switch (value.Type()) {
        case napi_valuetype::napi_bigint:
            return std::stoll(value.ToString());
        case napi_valuetype::napi_number:
            return value.As<const Napi::Number>().Int64Value();
        case napi_valuetype::napi_string:
            return std::stoll(value.As<const Napi::String>());
        default:
            throw std::exception("Cannot coerce JS value of such type to int53");
    }
}
TdNode::ToTelegram::int32_t TdNode::ToTelegram::int32_(const Napi::Value value) {
    switch (value.Type()) {
        case napi_valuetype::napi_bigint:
            return std::stoi(value.ToString());
        case napi_valuetype::napi_number:
            return value.As<const Napi::Number>().Int32Value();
        case napi_valuetype::napi_string:
            return std::stoi(value.As<const Napi::String>());
        default:
            throw std::exception("Cannot coerce JS value of such type to int32");
    }
}
TdNode::ToTelegram::boolFalse_t TdNode::ToTelegram::boolFalse_(const Napi::Value value) {
    if (value.As<const Napi::Boolean>().Value() == boolFalse) {
        return boolFalse;
    } else {
        throw std::exception("Value is not false");
    }
}
TdNode::ToTelegram::boolTrue_t TdNode::ToTelegram::boolTrue_(const Napi::Value value) {
    if (value.As<const Napi::Boolean>().Value() == boolTrue) {
        return boolTrue;
    } else {
        throw std::exception("Value is not true");
    }
}
TdNode::ToTelegram::Bool_t TdNode::ToTelegram::Bool_(const Napi::Value value) {
    return value.As<Napi::Boolean>().Value();
}
TdNode::ToTelegram::bytes_t TdNode::ToTelegram::bytes_(const Napi::Value value) {
    if (value.IsBuffer()) {
        const Napi::Buffer<const unsigned char> data = value.As<const Napi::Buffer<const unsigned char>>();
        const unsigned char *bytes = data.Data();
        return base64_encode(bytes, data.Length());
    } else if (value.IsTypedArray()) {
        Napi::ArrayBuffer data = value.As<const Napi::TypedArray>().ArrayBuffer();
        return base64_encode((const unsigned char *) data.Data(), data.ByteLength());
    } else if (value.IsArrayBuffer()) {
        Napi::ArrayBuffer data = value.As<Napi::ArrayBuffer>();
        return base64_encode((const unsigned char *)data.Data(), data.ByteLength());
    } else {
        return value.As<Napi::String>().Utf8Value();
    }
}
template<auto (*Callback)(Napi::Value)>
TdNode::ToTelegram::vector_t<std::invoke_result_t<decltype(Callback), const Napi::Value>>
TdNode::ToTelegram::vector_(Napi::Value value) {
    const Napi::Array array = value.As<const Napi::Array>();
    const auto size = array.Length();
    vector_t<std::invoke_result_t<decltype(Callback), const Napi::Value>> result(size);
    for (auto i = 0; i < size; i++) {
        result[i] = std::move(Callback(array[i]));
    }
    return result;
}

`;
/** @param {import("./parsing_tl").TD_API.classParamType | import("./parsing_tl").TD_API.constructorParamType | import("./parsing_tl").TD_API.vectorParamType} type */
function GetFunctionForTransformation(type) {
    "use strict";
    if (type["@type"] === "classParamType") {
        return type.className + "_";
    } else if (type["@type"] === "constructorParamType") {
        return type.constructorName + "_";
    } else if (type["@type"] === "vectorParamType") {
        return `vector_<&${GetFunctionForTransformation(type.of_type)}>`;
    } else {
        throw new Error("Invalid type");
    }
}
for (const i of constructors) {
    result += `
td::td_api::object_ptr<TdNode::ToTelegram::${i.name}_t> TdNode::ToTelegram::${i.name}_(const Napi::Value value) {
    const Napi::Object object = value.As<const Napi::Object>();
    td::td_api::object_ptr<${i.name}_t> result = td::td_api::make_object<${i.name}_t>();`;
    for (const j of i.parameters) {
        result += `
    if (const Napi::Value field = object.Get("${j.name}"); IsNotNullish(field)) {
        result->${j.name}_ = std::move(${GetFunctionForTransformation(j.type)}(object.Get("${j.name}")));
    }`;
    }
    result += `
    return result;
}`
}
for (const i of functions) {
    result += `
td::td_api::object_ptr<TdNode::ToTelegram::${i.name}_t> TdNode::ToTelegram::${i.name}_(const Napi::Value value) {
    const Napi::Object object = value.As<const Napi::Object>();
    td::td_api::object_ptr<${i.name}_t> result = td::td_api::make_object<${i.name}_t>();`;
    for (const j of i.parameters) {
        result += `
    if (const Napi::Value field = object.Get("${j.name}"); IsNotNullish(field)) {
        result->${j.name}_ = std::move(${GetFunctionForTransformation(j.type)}(object.Get("${j.name}")));
    }`;
    }
    result += `
    return result;
}`
}
for (const i of classes) {
    if (i.constructors.length <= 1) continue;
    result += `
td::td_api::object_ptr<TdNode::ToTelegram::${i.name}_t> TdNode::ToTelegram::${i.name}_(const Napi::Value value) {
    const Napi::Object object = value.As<const Napi::Object>();
    std::string type = object.Get("@type").As<const Napi::String>().Utf8Value();`;
    for (const j of i.constructors) {
        result += `
    if (type == "${j}") {
        return std::move(${j}_(value));
    }`
    }
    result += `
    throw std::exception("Invalid @type for ${i.name}");
}`
}
result += `
td::td_api::object_ptr<td::td_api::Function> TdNode::ToTelegram::AnyUnknownFunction(const Napi::Value value) {
    const std::string type = value.As<const Napi::Object>().Get("@type").As<const Napi::String>().Utf8Value();`;
for (const i of functions) {
    result += `
    if (type == "${i.name}") {
        return std::move(TdNode::ToTelegram::${i.name}_(value));
    }`
}
result += `
    throw std::exception("No valid @type for function");
}
td::td_api::object_ptr<td::td_api::Object> TdNode::ToTelegram::AnyUnknownObject(const Napi::Value value) {
    const std::string type = value.As<const Napi::Object>().Get("@type").As<const Napi::String>().Utf8Value();`;
for (const i of constructors) {
    result += `
    if (type == "${i.name}") {
        return std::move(${i.name}_(value));
    }`
}
result += `
    throw std::exception("No valid @type for object");
}
#endif
`;

require("fs").writeFileSync("./src/js-to-td.cpp", result);
