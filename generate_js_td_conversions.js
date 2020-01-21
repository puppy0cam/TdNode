/** @type {typeof import("./parsing_tl").TD_API} */
const {
    constructors,
    functions,
    classes,
} = require("./td_api.json");

let result = `\
#pragma once

#include <napi.h>
#include <td/telegram/Client.h>
#include <td/telegram/td_api.h>
#include <td/telegram/td_api.hpp>
#include <napi.h>
#include <type_traits>
#include <vector>
#include "base64.h"

const bool IsNotNullish(const Napi::Value value) {
    return !value.IsNull() && !value.IsUndefined();
}
td::td_api::object_ptr<td::td_api::Function> GetArbitraryFunction(const Napi::Value value);
namespace JavaScriptToTelegram {
    #pragma region double
    using double_t = double;
    double_t double_(const Napi::Value value);

    using Double_t = double_t;
    constexpr auto &&Double_ = double_;
    #pragma endregion
    #pragma region string
    using string_t = std::string;
    string_t string_(const Napi::Value value);

    using String_t = string_t;
    constexpr auto &&String_ = string_;
    #pragma endregion
    #pragma region int64
    using int64_t = std::int64_t;
    int64_t int64_(const Napi::Value value);

    using Int64_t = int64_t;
    constexpr auto &&Int64_ = int64_;
    #pragma endregion
    #pragma region int53
    using int53_t = std::int64_t;
    int53_t int53_(const Napi::Value value);

    using Int53_t = int53_t;
    constexpr auto &&Int53_ = int53_;
    #pragma endregion
    #pragma region int32
    using int32_t = std::int32_t;
    int32_t int32_(const Napi::Value value);

    using Int32_t = int32_t;
    constexpr auto &&Int32_ = int32_;
    #pragma endregion
    #pragma region bool
    using boolFalse_t = bool;
    constexpr const boolFalse_t boolFalse = false;
    boolFalse_t boolFalse_(const Napi::Value value);

    using boolTrue_t = bool;
    constexpr const boolTrue_t boolTrue = true;
    boolTrue_t boolTrue_(const Napi::Value value);

    using Bool_t = bool;
    Bool_t Bool_(const Napi::Value value);
    #pragma endregion
    #pragma region bytes
    using bytes_t = std::string;
    bytes_t bytes_(const Napi::Value value);

    using Bytes_t = bytes_t;
    constexpr auto &&Bytes_ = bytes_;
    #pragma endregion
    #pragma region vector
    template <class T>
    using vector_t = std::vector<T>;
    template <auto Callback(const Napi::Value)>
    vector_t<std::invoke_result_t<decltype(Callback), const Napi::Value>>
    vector_(const Napi::Value value);

    template <class T>
    using Vector_t = vector_t<T>;

    template <auto Callback(const Napi::Value)>
    constexpr auto &&Vector_ = vector_<Callback>;
    #pragma endregion
    #pragma region tdlib
`;
for (const i of constructors) {
    result += `
    using ${i.name}_t = td::td_api::${i.name};
    td::td_api::object_ptr<${i.name}_t> ${i.name}_(const Napi::Value value);`;
}
for (const i of functions) {
    result += `
    using ${i.name}_t = td::td_api::${i.name};
    td::td_api::object_ptr<${i.name}_t> ${i.name}_(const Napi::Value value);`;
}
for (const i of classes) {
    if (i.constructors.length <= 1) continue;
    result += `
    using ${i.name}_t = td::td_api::${i.name};
    td::td_api::object_ptr<${i.name}_t> ${i.name}_(const Napi::Value value);`;
}
result += `
    #pragma endregion
}
`;
let result2 = `\
#pragma once
#include "td-node-conversions.h"
#include "base64.cpp"

JavaScriptToTelegram::double_t JavaScriptToTelegram::double_(const Napi::Value value) {
    return value.As<const Napi::Number>().DoubleValue();
}
JavaScriptToTelegram::string_t JavaScriptToTelegram::string_(const Napi::Value value) {
    return value.As<const Napi::String>().Utf8Value();
}
JavaScriptToTelegram::int64_t JavaScriptToTelegram::int64_(const Napi::Value value) {
    switch (value.Type()) {
        case napi_valuetype::napi_bigint:
            return std::stoll(value.ToString());
        case napi_valuetype::napi_number:
            return value.As<const Napi::Number>().Int64Value();
        case napi_valuetype::napi_string:
            return std::stoll(value.As<const Napi::String>());
        default:
            Napi::Error::New(value.Env(), "Cannot coerce JS value of such type to int64").ThrowAsJavaScriptException();
            throw std::exception("Cannot coerce JS value of such type to int64");
    }
}
JavaScriptToTelegram::int53_t JavaScriptToTelegram::int53_(const Napi::Value value) {
    switch (value.Type()) {
        case napi_valuetype::napi_bigint:
            return std::stoll(value.ToString());
        case napi_valuetype::napi_number:
            return value.As<const Napi::Number>().Int64Value();
        case napi_valuetype::napi_string:
            return std::stoll(value.As<const Napi::String>());
        default:
            Napi::Error::New(value.Env(), "Cannot coerce JS value of such type to int53").ThrowAsJavaScriptException();
            throw std::exception("Cannot coerce JS value of such type to int53");
    }
}
JavaScriptToTelegram::int32_t JavaScriptToTelegram::int32_(const Napi::Value value) {
    switch (value.Type()) {
        case napi_valuetype::napi_bigint:
            return std::stoi(value.ToString());
        case napi_valuetype::napi_number:
            return value.As<const Napi::Number>().Int32Value();
        case napi_valuetype::napi_string:
            return std::stoi(value.As<const Napi::String>());
        default:
            Napi::Error::New(value.Env(), "Cannot coerce JS value of such type to int32").ThrowAsJavaScriptException();
            throw std::exception("Cannot coerce JS value of such type to int32");
    }
}
JavaScriptToTelegram::boolFalse_t JavaScriptToTelegram::boolFalse_(const Napi::Value value) {
    if (value.As<const Napi::Boolean>().Value() == boolFalse) {
        return boolFalse;
    } else {
        Napi::Error::New(value.Env(), "Value is not false").ThrowAsJavaScriptException();
        throw std::exception("Value is not false");
    }
}
JavaScriptToTelegram::boolTrue_t JavaScriptToTelegram::boolTrue_(const Napi::Value value) {
    if (value.As<const Napi::Boolean>().Value() == boolTrue) {
        return boolTrue;
    } else {
        Napi::Error::New(value.Env(), "Value is not true").ThrowAsJavaScriptException();
        throw std::exception("Value is not true");
    }
}
JavaScriptToTelegram::Bool_t JavaScriptToTelegram::Bool_(const Napi::Value value) {
    return value.As<Napi::Boolean>().Value();
}
JavaScriptToTelegram::bytes_t JavaScriptToTelegram::bytes_(const Napi::Value value) {
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
JavaScriptToTelegram::vector_t<std::invoke_result_t<decltype(Callback), const Napi::Value>>
JavaScriptToTelegram::vector_(Napi::Value value) {
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
    result2 += `
td::td_api::object_ptr<JavaScriptToTelegram::${i.name}_t> JavaScriptToTelegram::${i.name}_(const Napi::Value value) {
    const Napi::Object object = value.As<const Napi::Object>();
    td::td_api::object_ptr<${i.name}_t> result = td::td_api::make_object<${i.name}_t>();`;
    for (const j of i.parameters) {
        result2 += `
    if (const Napi::Value field = object.Get("${j.name}"); IsNotNullish(field)) {
        result->${j.name}_ = std::move(${GetFunctionForTransformation(j.type)}(object.Get("${j.name}")));
    }`;
    }
    result2 += `
    return result;
}`
}
for (const i of functions) {
    result2 += `
td::td_api::object_ptr<JavaScriptToTelegram::${i.name}_t> JavaScriptToTelegram::${i.name}_(const Napi::Value value) {
    const Napi::Object object = value.As<const Napi::Object>();
    td::td_api::object_ptr<${i.name}_t> result = td::td_api::make_object<${i.name}_t>();`;
    for (const j of i.parameters) {
        result2 += `
    if (const Napi::Value field = object.Get("${j.name}"); IsNotNullish(field)) {
        result->${j.name}_ = std::move(${GetFunctionForTransformation(j.type)}(object.Get("${j.name}")));
    }`;
    }
    result2 += `
    return result;
}`
}
for (const i of classes) {
    if (i.constructors.length <= 1) continue;
    result2 += `
td::td_api::object_ptr<JavaScriptToTelegram::${i.name}_t> JavaScriptToTelegram::${i.name}_(const Napi::Value value) {
    const Napi::Object object = value.As<const Napi::Object>();
    std::string type = object.Get("@type").As<const Napi::String>().Utf8Value();`;
    for (const j of i.constructors) {
        result2 += `
    if (type == "${j}") {
        return std::move(${j}_(value));
    }`
    }
    result2 += `
    Napi::Error::New(value.Env(), "Invalid @type for ${i.name}").ThrowAsJavaScriptException();
    throw std::exception("Invalid @type for ${i.name}");
}`
}
result2 += `
td::td_api::object_ptr<td::td_api::Function> GetArbitraryFunction(const Napi::Value value) {
    const std::string type = value.As<const Napi::Object>().Get("@type").As<const Napi::String>().Utf8Value();`;
for (const i of functions) {
    result2 += `
    if (type == "${i.name}") {
        return std::move(JavaScriptToTelegram::${i.name}_(value));
    }`
}
result2 += `
    Napi::Error::New(value.Env(), "No valid @type for function").ThrowAsJavaScriptException();
    throw std::exception("No valid @type for function");
}
`
require("fs").writeFileSync("./src/td-node-conversions.h", result);
require("fs").writeFileSync("./src/td-node-conversions.cpp", result2);
