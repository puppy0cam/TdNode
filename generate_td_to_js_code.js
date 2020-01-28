/** @type {typeof import("./parsing_tl").TD_API} */
const {
    constructors,
    functions,
    classes,
} = require("./td_api.json");

let result = `\
#ifndef _TdNode_TD_TO_JS_CODE
#define _TdNode_TD_TO_JS_CODE
#include "libraries.h"
#include "td-to-js.h"

template <typename T, Napi::Value Callback(Napi::Env env, T value), const bool is_tdlib_value = true>
Napi::Value TdNode::ToJavaScript::vector_(Napi::Env env, std::vector<T> value) {
    Napi::EscapableHandleScope scope(env);
    const auto size = value.size();
    Napi::Array result = Napi::Array::New(env, size);
    for (auto i = 0; i < size; i++) {
        Napi::HandleScope scope(env);
        if constexpr(is_tdlib_value) {
            result.Set(i, Callback(env, std::move(value[i])));
        } else {
            result.Set(i, Callback(env, value[i]));
        }
    }
    return scope.Escape(result);
}

Napi::Value TdNode::ToJavaScript::int64_(Napi::Env env, std::int64_t value) {
    return env.Global().Get("BigInt").As<Napi::Function>().Call({ Napi::String::New(env, std::to_string(value)) });
}
Napi::Value TdNode::ToJavaScript::int32_(Napi::Env env, std::int32_t value) {
    return Napi::Number::New(env, value);
}
Napi::Value TdNode::ToJavaScript::double_(Napi::Env env, std::double_t value) {
    return Napi::Number::New(env, value);
}
Napi::Value TdNode::ToJavaScript::string_(Napi::Env env, std::string value) {
    return Napi::String::New(env, value);
}
Napi::Value TdNode::ToJavaScript::Bool_(Napi::Env env, bool value) {
    return Napi::Boolean::New(env, value);
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
            case "String":
            case "Bytes":
                return dataRef;
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
            case "string":
            case "bytes":
                return dataRef;
            default:
                return `std::move(${dataRef})`;
        }
    } else if (type["@type"] === "vectorParamType") {
        return `std::move(${dataRef})`;
    } else {
        throw new Error("Invalid param type");
    }
}
for (const i of constructors) {
    result += `
Napi::Value TdNode::ToJavaScript::${i.name}_(Napi::Env env, td::td_api::object_ptr<td::td_api::${i.name}> value) {
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
for (const i of functions) {
    result += `
Napi::Value TdNode::ToJavaScript::${i.name}_(Napi::Env env, td::td_api::object_ptr<td::td_api::${i.name}> value) {
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
Napi::Value TdNode::ToJavaScript::${i.name}_(Napi::Env env, td::td_api::object_ptr<td::td_api::${i.name}> value) {
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
Napi::Value TdNode::ToJavaScript::AnyUnknownObject(Napi::Env env, td::td_api::object_ptr<td::td_api::Object> value) {
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
result += `
    }
}
Napi::Value TdNode::ToJavaScript::AnyUnknownObject(Napi::Env env, td::td_api::object_ptr<td::td_api::Function> value) {
    if (!value) {
        return env.Null();
    }
    switch (value->get_id()) {
        default:
            throw std::exception("Could not get a valid type for unknown function");`;

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
#endif
`
require("fs").writeFileSync("./src/td-to-js.cpp", result);
