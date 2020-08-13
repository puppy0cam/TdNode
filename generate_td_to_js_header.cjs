/** @type {typeof import("./parsing_tl").TD_API} */
const {
    constructors,
    functions,
    classes,
} = require("./td_api.json");

let result = `\
#ifndef _TdNode_TD_TO_JS_HEADER
#define _TdNode_TD_TO_JS_HEADER

#include "libraries.h"

namespace TdNode {
    namespace ToJavaScript {
        template <typename T, Napi::Value Callback(Napi::Env env, T value), const bool is_tdlib_value = true>
        Napi::Value vector_(Napi::Env env, std::vector<T> value);

        inline Napi::Value int64_(Napi::Env env, std::int64_t value);
        constexpr auto &&vector_int64_ = vector_<std::int64_t, &int64_, false>;
        constexpr auto &&vector_vector_int64_ = vector_<std::vector<std::int64_t>, &vector_int64_, false>;

        inline Napi::Value int53_(Napi::Env env, std::int64_t value);
        constexpr auto &&vector_int53_ = vector_<std::int64_t, &int53_, false>;
        constexpr auto &&vector_vector_int53_ = vector_<std::vector<std::int64_t>, &vector_int53_, false>;

        inline Napi::Value int32_(Napi::Env env, std::int32_t value);
        constexpr auto &&vector_int32_ = vector_<std::int32_t, &int32_, false>;
        constexpr auto &&vector_vector_int32_ = vector_<std::vector<std::int32_t>, &vector_int32_, false>;

        inline Napi::Value double_(Napi::Env env, double value);
        constexpr auto &&vector_double_ = vector_<double, &double_, false>;
        constexpr auto &&vector_vector_double_ = vector_<std::vector<double>, &vector_double_, false>;

        inline Napi::Value string_(Napi::Env env, std::string value);
        constexpr auto &&vector_string_ = vector_<std::string, &string_, false>;
        constexpr auto &&vector_vector_string_ = vector_<std::vector<std::string>, &vector_string_, false>;

        inline Napi::Value Bool_(Napi::Env env, bool value);
        constexpr auto &&vector_Bool_ = vector_<bool, &Bool_, false>;
        constexpr auto &&vector_vector_Bool_ = vector_<std::vector<bool>, &vector_Bool_, false>;

        constexpr auto &&bytes_ = string_;
        constexpr auto &&vector_bytes_ = vector_string_;
        constexpr auto &&vector_vector_bytes_ = vector_vector_string_;
`;
for (const i of constructors) {
    result += `
        Napi::Value ${i.name}_(Napi::Env env, td::td_api::object_ptr<td::td_api::${i.name}> value);
        constexpr auto &&vector_${i.name}_ = vector_<td::td_api::object_ptr<td::td_api::${i.name}>, &${i.name}_, true>;
        constexpr auto &&vector_vector_${i.name}_ = vector_<std::vector<td::td_api::object_ptr<td::td_api::${i.name}>>, &vector_${i.name}_, true>;`;
}
for (const i of classes) {
    if (i.constructors.length === 1) continue;
    result += `
        Napi::Value ${i.name}_(Napi::Env env, td::td_api::object_ptr<td::td_api::${i.name}> value);
        constexpr auto &&vector_${i.name}_ = vector_<td::td_api::object_ptr<td::td_api::${i.name}>, &${i.name}_, true>;
        constexpr auto &&vector_vector_${i.name}_ = vector_<std::vector<td::td_api::object_ptr<td::td_api::${i.name}>>, &vector_${i.name}_, true>;`;
}
for (const i of functions) {
    result += `
        Napi::Value ${i.name}_(Napi::Env env, td::td_api::object_ptr<td::td_api::${i.name}> value);`;
}
result += `
        Napi::Value AnyUnknownObject(Napi::Env env, td::td_api::object_ptr<td::td_api::Object> value);
        Napi::Value AnyUnknownObject(Napi::Env env, td::td_api::object_ptr<td::td_api::Function> value);
    }
}
#endif
`;
require("fs").writeFileSync("./src/td-to-js.h", result);
