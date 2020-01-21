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

template <typename parentObject, typename propertyName>
Napi::Value ConvertInt53ToJavaScript(Napi::Env env, int64_t &data, parentObject parent, const propertyName property);
template <typename parentObject, typename propertyName>
Napi::Value ConvertInt53ToJavaScript(Napi::Env env, uint64_t &data, parentObject parent, const propertyName property);
template <typename parentObject, typename propertyName>
Napi::Value ConvertInt53ToJavaScript(Napi::Env env, std::vector<int64_t> &data, parentObject parent, const propertyName property);
template <typename parentObject, typename propertyName>
Napi::Value ConvertInt53ToJavaScript(Napi::Env env, std::vector<uint64_t> &data, parentObject parent, const propertyName property);
template <typename parentObject, typename propertyName>
Napi::Value ConvertInt53ToJavaScript(Napi::Env env, std::vector<std::vector<int64_t>> &data, parentObject parent, const propertyName property);
template <typename parentObject, typename propertyName>
Napi::Value ConvertInt53ToJavaScript(Napi::Env env, std::vector<std::vector<uint64_t>> &data, parentObject parent, const propertyName property);

template <typename parentObject, typename propertyName>
Napi::Value ConvertInt64ToJavaScript(Napi::Env env, int64_t &data, parentObject parent, const propertyName property);
template <typename parentObject, typename propertyName>
Napi::Value ConvertInt64ToJavaScript(Napi::Env env, uint64_t &data, parentObject parent, const propertyName property);
template <typename parentObject, typename propertyName>
Napi::Value ConvertInt64ToJavaScript(Napi::Env env, std::vector<int64_t> &data, parentObject parent, const propertyName property);
template <typename parentObject, typename propertyName>
Napi::Value ConvertInt64ToJavaScript(Napi::Env env, std::vector<uint64_t> &data, parentObject parent, const propertyName property);
template <typename parentObject, typename propertyName>
Napi::Value ConvertInt64ToJavaScript(Napi::Env env, std::vector<std::vector<int64_t>> &data, parentObject parent, const propertyName property);
template <typename parentObject, typename propertyName>
Napi::Value ConvertInt64ToJavaScript(Napi::Env env, std::vector<std::vector<uint64_t>> &data, parentObject parent, const propertyName property);

template <typename T, typename parentObject, typename propertyName>
Napi::Value ConvertTelegramToJavaScript(Napi::Env env, std::vector<T> &data, parentObject parent, const propertyName property);
template <typename parentObject, typename propertyName>
Napi::Value ConvertTelegramToJavaScript(Napi::Env env, int32_t &data, parentObject parent, const propertyName property);
template <typename parentObject, typename propertyName>
Napi::Value ConvertTelegramToJavaScript(Napi::Env env, uint32_t &data, parentObject parent, const propertyName property);
template <typename parentObject, typename propertyName>
Napi::Value ConvertTelegramToJavaScript(Napi::Env env, double &data, parentObject parent, const propertyName property);
template <typename parentObject, typename propertyName>
Napi::Value ConvertTelegramToJavaScript(Napi::Env env, bool &data, parentObject parent, const propertyName property);
template <typename parentObject, typename propertyName>
Napi::Value ConvertTelegramToJavaScript(Napi::Env env, std::string &data, parentObject parent, const propertyName property);

template <typename parentObject, typename propertyName>
Napi::Value ConvertUnknownTelegramToJavaScript(Napi::Env env, td::td_api::object_ptr<td::td_api::Object> &data, parentObject parent, const propertyName property);
`;
for (const i of constructors) {
    result += `
template <typename parentObject, typename propertyName>
Napi::Value ConvertTelegramToJavaScript(Napi::Env env, td::td_api::object_ptr<td::td_api::${i.name}> &data, parentObject parent, const propertyName property);`;
}
for (const i of classes) {
    if (i.constructors.length > 1) {
        result += `
template <typename parentObject, typename propertyName>
Napi::Value ConvertTelegramToJavaScript(Napi::Env env, td::td_api::object_ptr<td::td_api::${i.name}> &data, parentObject parent, const propertyName property);`;
    }
}
result += "\n";
let result2 = `\
#pragma once

#include "node-td-conversions.h"

template <typename parentObject, typename propertyName>
Napi::Value ConvertInt53ToJavaScript(Napi::Env env, int64_t &data, parentObject parent, const propertyName property) {
    Napi::Number result = Napi::Number::New(env, data);
    parent.Set(property, result);
    return result;
}
template <typename parentObject, typename propertyName>
Napi::Value ConvertInt53ToJavaScript(Napi::Env env, uint64_t &data, parentObject parent, const propertyName property) {
    Napi::Number result = Napi::Number::New(env, data);
    parent.Set(property, result);
    return result;
}
template <typename parentObject, typename propertyName>
Napi::Value ConvertInt53ToJavaScript(Napi::Env env, std::vector<int64_t> &data, parentObject parent, const propertyName property) {
    Napi::HandleScope scope(env);
    const auto data_size = data.size();
    Napi::Array result = Napi::Array::New(env, data_size);
    for (auto i = 0; i < data_size; i++) {
        ConvertInt53ToJavaScript(env, data[i], result, i);
    }
    parent.Set(property, result);
    return result;
}
template <typename parentObject, typename propertyName>
Napi::Value ConvertInt53ToJavaScript(Napi::Env env, std::vector<uint64_t> &data, parentObject parent, const propertyName property) {
    Napi::HandleScope scope(env);
    const auto data_size = data.size();
    Napi::Array result = Napi::Array::New(env, data_size);
    for (auto i = 0; i < data_size; i++) {
        ConvertInt53ToJavaScript(env, data[i], result, i);
    }
    parent.Set(property, result);
    return result;
}
template <typename parentObject, typename propertyName>
Napi::Value ConvertInt53ToJavaScript(Napi::Env env, std::vector<std::vector<int64_t>> &data, parentObject parent, const propertyName property) {
    Napi::HandleScope scope(env);
    const auto data_size = data.size();
    Napi::Array result = Napi::Array::New(env, data_size);
    for (auto i = 0; i < data_size; i++) {
        ConvertInt53ToJavaScript(env, data[i], result, i);
    }
    parent.Set(property, result);
    return result;
}
template <typename parentObject, typename propertyName>
Napi::Value ConvertInt53ToJavaScript(Napi::Env env, std::vector<std::vector<uint64_t>> &data, parentObject parent, const propertyName property) {
    Napi::HandleScope scope(env);
    const auto data_size = data.size();
    Napi::Array result = Napi::Array::New(env, data_size);
    for (auto i = 0; i < data_size; i++) {
        ConvertInt53ToJavaScript(env, data[i], result, i);
    }
    parent.Set(property, result);
    return result;
}

template <typename parentObject, typename propertyName>
Napi::Value ConvertInt64ToJavaScript(Napi::Env env, int64_t &data, parentObject parent, const propertyName property) {
    Napi::Value result = env.Global().Get("BigInt").As<Napi::Function>().Call({ Napi::String::New(env, std::to_string(data)) });
    parent.Set(property, result);
    return result;
}
template <typename parentObject, typename propertyName>
Napi::Value ConvertInt64ToJavaScript(Napi::Env env, uint64_t &data, parentObject parent, const propertyName property) {
    Napi::Value result = env.Global().Get("BigInt").As<Napi::Function>().Call({ Napi::String::New(env, std::to_string(data)) });
    parent.Set(property, result);
    return result;
}
template <typename parentObject, typename propertyName>
Napi::Value ConvertInt64ToJavaScript(Napi::Env env, std::vector<int64_t> &data, parentObject parent, const propertyName property) {
    Napi::HandleScope scope(env);
    const auto data_size = data.size();
    Napi::Array result = Napi::Array::New(env, data_size);
    for (auto i = 0; i < data_size; i++) {
        ConvertInt64ToJavaScript(env, data[i], result, i);
    }
    parent.Set(property, result);
    return result;
}
template <typename parentObject, typename propertyName>
Napi::Value ConvertInt64ToJavaScript(Napi::Env env, std::vector<uint64_t> &data, parentObject parent, const propertyName property) {
    Napi::HandleScope scope(env);
    const auto data_size = data.size();
    Napi::Array result = Napi::Array::New(env, data_size);
    for (auto i = 0; i < data_size; i++) {
        ConvertInt64ToJavaScript(env, data[i], result, i);
    }
    parent.Set(property, result);
    return result;
}
template <typename parentObject, typename propertyName>
Napi::Value ConvertInt64ToJavaScript(Napi::Env env, std::vector<std::vector<int64_t>> &data, parentObject parent, const propertyName property) {
    Napi::HandleScope scope(env);
    const auto data_size = data.size();
    Napi::Array result = Napi::Array::New(env, data_size);
    for (auto i = 0; i < data_size; i++) {
        ConvertInt64ToJavaScript(env, data[i], result, i);
    }
    parent.Set(property, result);
    return result;
}
template <typename parentObject, typename propertyName>
Napi::Value ConvertInt64ToJavaScript(Napi::Env env, std::vector<std::vector<uint64_t>> &data, parentObject parent, const propertyName property) {
    Napi::HandleScope scope(env);
    const auto data_size = data.size();
    Napi::Array result = Napi::Array::New(env, data_size);
    for (auto i = 0; i < data_size; i++) {
        ConvertInt64ToJavaScript(env, data[i], result, i);
    }
    parent.Set(property, result);
    return result;
}

template <typename T, typename parentObject, typename propertyName>
Napi::Value ConvertTelegramToJavaScript(Napi::Env env, std::vector<T> &data, parentObject parent, const propertyName property) {
    Napi::HandleScope scope(env);
    const auto data_size = data.size();
    Napi::Array result = Napi::Array::New(env, data_size);
    for (auto i = 0; i < data_size; i++) {
        ConvertTelegramToJavaScript(env, data[i], result, i);
    }
    parent.Set(property, result);
    return result;
}
template <typename parentObject, typename propertyName>
Napi::Value ConvertTelegramToJavaScript(Napi::Env env, int32_t &data, parentObject parent, const propertyName property) {
    Napi::Number result = Napi::Number::New(env, data);
    parent.Set(property, result);
    return result;
}
template <typename parentObject, typename propertyName>
Napi::Value ConvertTelegramToJavaScript(Napi::Env env, uint32_t &data, parentObject parent, const propertyName property) {
    Napi::Number result = Napi::Number::New(env, data);
    parent.Set(property, result);
    return result;
}
template <typename parentObject, typename propertyName>
Napi::Value ConvertTelegramToJavaScript(Napi::Env env, double &data, parentObject parent, const propertyName property) {
    Napi::Number result = Napi::Number::New(env, data);
    parent.Set(property, result);
    return result;
}
template <typename parentObject, typename propertyName>
Napi::Value ConvertTelegramToJavaScript(Napi::Env env, bool &data, parentObject parent, const propertyName property) {
    Napi::Boolean result = Napi::Boolean::New(env, data);
    parent.Set(property, result);
    return result;
}
template <typename parentObject, typename propertyName>
Napi::Value ConvertTelegramToJavaScript(Napi::Env env, std::string &data, parentObject parent, const propertyName property) {
    Napi::String result = Napi::String::New(env, data);
    parent.Set(property, result);
    return result;
}
`;
/** @param {import("./parsing_tl").TD_API.classParamType | import("./parsing_tl").TD_API.constructorParamType | import("./parsing_tl").TD_API.vectorParamType} type */
function determineFunctionForType(type) {
    "use strict";
    if (type["@type"] === "classParamType") {
        if (type.className === "Int53") {
            return "ConvertInt53ToJavaScript";
        } else if (type.className === "Int64") {
            return "ConvertInt64ToJavaScript";
        } else {
            return "ConvertTelegramToJavaScript";
        }
    } else if (type["@type"] === "constructorParamType") {
        if (type.constructorName === "int53") {
            return "ConvertInt53ToJavaScript";
        } else if (type.constructorName === "int64") {
            return "ConvertInt64ToJavaScript";
        } else {
            return "ConvertTelegramToJavaScript";
        }
    } else if (type["@type"] === "vectorParamType") {
        return determineFunctionForType(type.of_type);
    } else {
        throw new Error("Invalid param type");
    }
}
for (const i of constructors) {
    result2 += `
template <typename parentObject, typename propertyName>
Napi::Value ConvertTelegramToJavaScript(Napi::Env env, td::td_api::object_ptr<td::td_api::${i.name}> &data, parentObject parent, const propertyName property) {
    if (!data) {
        Napi::Value result = env.Null();
        parent.Set(property, result);
        return result;
    }
    Napi::HandleScope scope(env);
    Napi::Object result = Napi::Object::New(env);
    result.Set("@type", Napi::String::New(env, "${i.name}"));`;
    for (const j of i.parameters) {
        result2 += `
    ${determineFunctionForType(j.type)}(env, data->${j.name}_, result, "${j.name}");`;
    }
    result2 += `
    parent.Set(property, result);
    return result;
}`;
}
for (const i of classes) {
    if (i.constructors.length > 1) {
        result2 += `
template <typename parentObject, typename propertyName>
Napi::Value ConvertTelegramToJavaScript(Napi::Env env, td::td_api::object_ptr<td::td_api::${i.name}> &data, parentObject parent, const propertyName property) {
    if (!data) {
        Napi::Value result = env.Null();
        parent.Set(property, result);
        return result;
    }
    Napi::HandleScope scope(env);
    switch (data->get_id()) {
        default:
            throw std::exception("Invalid type for ${i.name}");`;
        for (const j of i.constructors) {
            result2 += `
        case td::td_api::${j}::ID:
            return ConvertTelegramToJavaScript(env, td::td_api::move_object_as<td::td_api::${j}>(data), parent, property);`;
        }
        result2 += `
    }
}`;
    }
}
result2 += `

template <typename parentObject, typename propertyName>
Napi::Value ConvertUnknownTelegramToJavaScript(Napi::Env env, td::td_api::object_ptr<td::td_api::Object> &data, parentObject parent, const propertyName property) {
    if (!data) {
        Napi::Value result = env.Null();
        parent.Set(property, result);
        return result;
    }
    switch (data->get_id()) {
        default:
            throw std::exception("Invalid type");`;
for (const i of constructors) {
    result2 += `
        case td::td_api::${i.name}::ID:
            return ConvertTelegramToJavaScript(env, td::td_api::move_object_as<td::td_api::${i.name}>(data), parent, property);`
}
result2 += `
    }
}
`;
require("fs").writeFileSync("./src/node-td-conversions.h", result);
require("fs").writeFileSync("./src/node-td-conversions.cpp", result2);
