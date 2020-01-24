/** @type {typeof import("./parsing_tl").TD_API} */
const {
    constructors,
    functions,
    classes,
} = require("./td_api.json");

let result = `
#pragma once

#include "td-to-js.h"
#include <td/telegram/td_api.hpp>

Napi::Value TdNode::ToJavaScript::int64_(Napi::Env env, const std::int64_t value) {
    return env.Global().Get("BigInt").As<Napi::Function>().Call({ Napi::String::New(env, std::to_string(value)) });
}
Napi::Value TdNode::ToJavaScript::vector_int64_(Napi::Env env, const std::vector<std::int64_t> &value) {
    Napi::EscapableHandleScope scope(env);
    const size_t size = value.size();
    Napi::Array result = Napi::Array::New(env, size);
    for (size_t i = 0; i < size; i++) {
        result[i] = int64_(env, value[i]);
    }
    return scope.Escape(result);
}
Napi::Value TdNode::ToJavaScript::vector_vector_int64_(Napi::Env env, const std::vector<std::vector<std::int64_t>> &value) {
    Napi::EscapableHandleScope scope(env);
    const size_t size = value.size();
    Napi::Array result = Napi::Array::New(env, size);
    for (size_t i = 0; i < size; i++) {
        Napi::HandleScope scope(env);
        result[i] = vector_int64_(env, value[i]);
    }
    return scope.Escape(result);
}
Napi::Value TdNode::ToJavaScript::int53_(Napi::Env env, const std::int64_t value) {
    return Napi::Number::New(env, value);
}
Napi::Value TdNode::ToJavaScript::vector_int53_(Napi::Env env, const std::vector<std::int64_t> &value) {
    Napi::EscapableHandleScope scope(env);
    const size_t size = value.size();
    Napi::Array result = Napi::Array::New(env, size);
    for (size_t i = 0; i < size; i++) {
        result[i] = int53_(env, value[i]);
    }
    return scope.Escape(result);
}
Napi::Value TdNode::ToJavaScript::vector_vector_int53_(Napi::Env env, const std::vector<std::vector<std::int64_t>> &value) {
    Napi::EscapableHandleScope scope(env);
    const size_t size = value.size();
    Napi::Array result = Napi::Array::New(env, size);
    for (size_t i = 0; i < size; i++) {
        Napi::HandleScope scope(env);
        result[i] = vector_int53_(env, value[i]);
    }
    return scope.Escape(result);
}
Napi::Value TdNode::ToJavaScript::int32_(Napi::Env env, const std::int32_t value) {
    return Napi::Number::New(env, value);
}
Napi::Value TdNode::ToJavaScript::vector_int32_(Napi::Env env, const std::vector<std::int32_t> &value) {
    Napi::EscapableHandleScope scope(env);
    const size_t size = value.size();
    Napi::Array result = Napi::Array::New(env, size);
    for (size_t i = 0; i < size; i++) {
        result[i] = int32_(env, value[i]);
    }
    return scope.Escape(result);
}
Napi::Value TdNode::ToJavaScript::vector_vector_int32_(Napi::Env env, const std::vector<std::vector<std::int32_t>> &value) {
    Napi::EscapableHandleScope scope(env);
    const size_t size = value.size();
    Napi::Array result = Napi::Array::New(env, size);
    for (size_t i = 0; i < size; i++) {
        Napi::HandleScope scope(env);
        result[i] = vector_int32_(env, value[i]);
    }
    return scope.Escape(result);
}
Napi::Value TdNode::ToJavaScript::double_(Napi::Env env, const std::double_t value) {
    return Napi::Number::New(env, value);
}
Napi::Value TdNode::ToJavaScript::vector_double_(Napi::Env env, const std::vector<std::double_t> &value) {
    Napi::EscapableHandleScope scope(env);
    const size_t size = value.size();
    Napi::Array result = Napi::Array::New(env, size);
    for (size_t i = 0; i < size; i++) {
        result[i] = double_(env, value[i]);
    }
    return scope.Escape(result);
}
Napi::Value TdNode::ToJavaScript::vector_vector_double_(Napi::Env env, const std::vector<std::vector<std::double_t>> &value) {
    Napi::EscapableHandleScope scope(env);
    const size_t size = value.size();
    Napi::Array result = Napi::Array::New(env, size);
    for (size_t i = 0; i < size; i++) {
        Napi::HandleScope scope(env);
        result[i] = vector_double_(env, value[i]);
    }
    return scope.Escape(result);
}
Napi::Value TdNode::ToJavaScript::string_(Napi::Env env, const std::string &&value) {
    return Napi::String::New(env, value);
}
Napi::Value TdNode::ToJavaScript::vector_string_(Napi::Env env, const std::vector<std::string> &value) {
    Napi::EscapableHandleScope scope(env);
    const size_t size = value.size();
    Napi::Array result = Napi::Array::New(env, size);
    for (size_t i = 0; i < size; i++) {
        result[i] = string_(env, std::move(value[i]));
    }
    return scope.Escape(result);
}
Napi::Value TdNode::ToJavaScript::vector_vector_string_(Napi::Env env, const std::vector<std::vector<std::string>> &value) {
    Napi::EscapableHandleScope scope(env);
    const size_t size = value.size();
    Napi::Array result = Napi::Array::New(env, size);
    for (size_t i = 0; i < size; i++) {
        Napi::HandleScope scope(env);
        result[i] = vector_string_(env, value[i]);
    }
    return scope.Escape(result);
}
Napi::Value TdNode::ToJavaScript::Bool_(Napi::Env env, const bool value) {
    return Napi::Boolean::New(env, value);
}
Napi::Value TdNode::ToJavaScript::vector_Bool_(Napi::Env env, const std::vector<bool> &value) {
    Napi::EscapableHandleScope scope(env);
    const size_t size = value.size();
    Napi::Array result = Napi::Array::New(env, size);
    for (size_t i = 0; i < size; i++) {
        result[i] = Bool_(env, value[i]);
    }
    return scope.Escape(result);
}
Napi::Value TdNode::ToJavaScript::vector_vector_Bool_(Napi::Env env, const std::vector<std::vector<bool>> &value) {
    Napi::EscapableHandleScope scope(env);
    const size_t size = value.size();
    Napi::Array result = Napi::Array::New(env, size);
    for (size_t i = 0; i < size; i++) {
        Napi::HandleScope scope(env);
        result[i] = vector_Bool_(env, value[i]);
    }
    return scope.Escape(result);
}
Napi::Value TdNode::ToJavaScript::bytes_(Napi::Env env, const std::string &&value) {
    return Napi::String::New(env, value);
}
Napi::Value TdNode::ToJavaScript::vector_bytes_(Napi::Env env, const std::vector<std::string> &value) {
    Napi::EscapableHandleScope scope(env);
    const size_t size = value.size();
    Napi::Array result = Napi::Array::New(env, size);
    for (size_t i = 0; i < size; i++) {
        result[i] = bytes_(env, std::move(value[i]));
    }
    return scope.Escape(result);
}
Napi::Value TdNode::ToJavaScript::vector_vector_bytes_(Napi::Env env, const std::vector<std::vector<std::string>> &value) {
    Napi::EscapableHandleScope scope(env);
    const size_t size = value.size();
    Napi::Array result = Napi::Array::New(env, size);
    for (size_t i = 0; i < size; i++) {
        Napi::HandleScope scope(env);
        result[i] = vector_bytes_(env, value[i]);
    }
    return scope.Escape(result);
}
`;
/** @param {import("./parsing_tl").TD_API.ParameterType} type */
function getFunctionForType(type) {
    "use strict";
    if (type["@type"] === "classParamType") {
        return `${type.className}_`;
    } else if (type["@type"] === "constructorParamType") {
        return `${type.constructorName}_`;
    } else if (type["@type"] === "vectorParamType") {
        return `vector_${getFunctionForType(type.of_type)}`;
    } else {
        throw new Error("Invalid param type");
    }
}
/** @param {import("./parsing_tl").TD_API.ParameterType} type */
function wrapConstructorAssignmentFieldType(type, dataRef) {
    "use strict";
    if (type["@type"] === "classParamType") {
        switch (type.className) {
            case "Int64":
            case "Int53":
            case "Int32":
            case "Double":
            case "Bool":
                return dataRef;
            case "String":
            case "Bytes":
            default:
                return `std::move(${dataRef})`;
        }
    } else if (type["@type"] === "constructorParamType") {
        switch (type.constructorName) {
            case "int64":
            case "int53":
            case "int32":
            case "double":
            case "boolTrue":
            case "boolFalse":
                return dataRef;
            case "string":
            case "bytes":
            default:
                return `std::move(${dataRef})`;
        }
    } else if (type["@type"] === "vectorParamType") {
        return dataRef;
    } else {
        throw new Error("Invalid param type");
    }
}
for (const i of constructors) {
    result += `
Napi::Value TdNode::ToJavaScript::${i.name}_(Napi::Env env, const td::td_api::object_ptr<td::td_api::${i.name}> &&value) {
    if (!value) {
        return env.Null();
    }
    Napi::EscapableHandleScope scope(env);
    Napi::Object result = Napi::Object::New(env);
    result.Set("@type", Napi::String::New(env, "${i.name}"));`;
    for (const j of i.parameters) {
        result += `
    result.Set("${j.name}", ${getFunctionForType(j.type)}(env, ${wrapConstructorAssignmentFieldType(j.type, `value->${j.name}_`)}));`;
    }
    result += `
    return scope.Escape(result);
}
Napi::Value TdNode::ToJavaScript::vector_${i.name}_(Napi::Env env, const std::vector<td::td_api::object_ptr<td::td_api::${i.name}>> &value) {
    Napi::EscapableHandleScope scope(env);
    const size_t size = value.size();
    Napi::Array result = Napi::Array::New(env, size);
    for (size_t i = 0; i < size; i++) {
        Napi::HandleScope scope(env);
        result[i] = ${i.name}_(env, std::move(value[i]));
    }
    return scope.Escape(result);
}
Napi::Value TdNode::ToJavaScript::vector_vector_${i.name}_(Napi::Env env, const std::vector<std::vector<td::td_api::object_ptr<td::td_api::${i.name}>>> &value) {
    Napi::EscapableHandleScope scope(env);
    const size_t size = value.size();
    Napi::Array result = Napi::Array::New(env, size);
    for (size_t i = 0; i < size; i++) {
        Napi::HandleScope scope(env);
        result[i] = vector_${i.name}_(env, value[i]);
    }
    return scope.Escape(result);
}
`
}
for (const i of functions) {
    result += `
Napi::Value TdNode::ToJavaScript::${i.name}_(Napi::Env env, const td::td_api::object_ptr<td::td_api::${i.name}> &&value) {
    if (!value) {
        return env.Null();
    }
    Napi::EscapableHandleScope scope(env);
    Napi::Object result = Napi::Object::New(env);
    result.Set("@type", Napi::String::New(env, "${i.name}"));`;
    for (const j of i.parameters) {
        result += `
    result.Set("${j.name}", ${getFunctionForType(j.type)}(env, ${wrapConstructorAssignmentFieldType(j.type, `value->${j.name}_`)}));`;
    }
    result += `
    return scope.Escape(result);
}
`
}
for (const i of classes) {
    if (i.constructors.length === 1) continue;
    result += `
Napi::Value TdNode::ToJavaScript::${i.name}_(Napi::Env env, const td::td_api::object_ptr<td::td_api::${i.name}> &&value) {
    if (!value) {
        return env.Null();
    }
    switch (value->get_id()) {
        default:
            throw std::exception("Invalid type for ${i.name}");`;
    for (const j of i.constructors) {
        result += `
        case td::td_api::${j}::ID:
            return ${j}_(env, td::td_api::move_object_as<td::td_api::${j}>(value));`;
    }
    result += `
    }
}
`;
}
result += `
Napi::Value TdNode::ToJavaScript::AnyUnknownObject(Napi::Env env, const td::td_api::object_ptr<td::td_api::Object> &&value) {
    if (!value) {
        return env.Null();
    }
    switch (value->get_id()) {
        default:
            throw std::exception("Could not get a valid type for unknown object");`;
for (const i of constructors) {
    result += `
        case td::td_api::${i.name}::ID:
            return ${i.name}_(env, td::td_api::move_object_as<td::td_api::${i.name}>(value));`;
}
for (const i of functions) {
    result += `
        case td::td_api::${i.name}::ID:
            return ${i.name}_(env, td::td_api::move_object_as<td::td_api::${i.name}>(value));`;
}
result += `
    }
}
`;
result += `
`
require("fs").writeFileSync("./src/td-to-js.cpp", result);
