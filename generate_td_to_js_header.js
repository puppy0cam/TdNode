/** @type {typeof import("./parsing_tl").TD_API} */
const {
    constructors,
    functions,
    classes,
} = require("./td_api.json");

let result = `
#pragma once

#include <napi.h>
#include <td/telegram/td_api.h>
#include <vector>

namespace TdNode {
    namespace ToJavaScript {
        Napi::Value int64_(Napi::Env env, const std::int64_t value);
        Napi::Value vector_int64_(Napi::Env env, const std::vector<std::int64_t> &value);
        Napi::Value vector_vector_int64_(Napi::Env env, const std::vector<std::vector<std::int64_t>> &value);
        constexpr auto &&Int64_ = int64_;
        constexpr auto &&vector_Int64_ = vector_int64_;
        constexpr auto &&Vector_Int64_ = vector_int64_;
        constexpr auto &&Vector_int64_ = vector_int64_;
        constexpr auto &&vector_vector_Int64_ = vector_vector_int64_;
        constexpr auto &&vector_Vector_Int64_ = vector_vector_int64_;
        constexpr auto &&vector_Vector_int64_ = vector_vector_int64_;
        constexpr auto &&Vector_vector_Int64_ = vector_vector_int64_;
        constexpr auto &&Vector_Vector_Int64_ = vector_vector_int64_;
        constexpr auto &&Vector_Vector_int64_ = vector_vector_int64_;

        Napi::Value int53_(Napi::Env env, const std::int64_t value);
        Napi::Value vector_int53_(Napi::Env env, const std::vector<std::int64_t> &value);
        Napi::Value vector_vector_int53_(Napi::Env env, const std::vector<std::vector<std::int64_t>> &value);
        constexpr auto &&Int53_ = int53_;
        constexpr auto &&vector_Int53_ = vector_int53_;
        constexpr auto &&Vector_Int53_ = vector_int53_;
        constexpr auto &&Vector_int53_ = vector_int53_;
        constexpr auto &&vector_vector_Int53_ = vector_vector_int53_;
        constexpr auto &&vector_Vector_Int53_ = vector_vector_int53_;
        constexpr auto &&vector_Vector_int53_ = vector_vector_int53_;
        constexpr auto &&Vector_vector_Int53_ = vector_vector_int53_;
        constexpr auto &&Vector_Vector_Int53_ = vector_vector_int53_;
        constexpr auto &&Vector_Vector_int53_ = vector_vector_int53_;

        Napi::Value int32_(Napi::Env env, const std::int32_t value);
        Napi::Value vector_int32_(Napi::Env env, const std::vector<std::int32_t> &value);
        Napi::Value vector_vector_int32_(Napi::Env env, const std::vector<std::vector<std::int32_t>> &value);
        constexpr auto &&Int32_ = int32_;
        constexpr auto &&vector_Int32_ = vector_int32_;
        constexpr auto &&Vector_Int32_ = vector_int32_;
        constexpr auto &&Vector_int32_ = vector_int32_;
        constexpr auto &&vector_vector_Int32_ = vector_vector_int32_;
        constexpr auto &&vector_Vector_Int32_ = vector_vector_int32_;
        constexpr auto &&vector_Vector_int32_ = vector_vector_int32_;
        constexpr auto &&Vector_vector_Int32_ = vector_vector_int32_;
        constexpr auto &&Vector_Vector_Int32_ = vector_vector_int32_;
        constexpr auto &&Vector_Vector_int32_ = vector_vector_int32_;

        Napi::Value double_(Napi::Env env, const std::double_t value);
        Napi::Value vector_double_(Napi::Env env, const std::vector<std::double_t> &value);
        Napi::Value vector_vector_double_(Napi::Env env, const std::vector<std::vector<std::double_t>> &value);
        constexpr auto &&Double_ = double_;
        constexpr auto &&vector_Double_ = vector_double_;
        constexpr auto &&Vector_Double_ = vector_double_;
        constexpr auto &&Vector_double_ = vector_double_;
        constexpr auto &&vector_vector_Double_ = vector_vector_double_;
        constexpr auto &&vector_Vector_Double_ = vector_vector_double_;
        constexpr auto &&vector_Vector_double_ = vector_vector_double_;
        constexpr auto &&Vector_vector_Double_ = vector_vector_double_;
        constexpr auto &&Vector_Vector_Double_ = vector_vector_double_;
        constexpr auto &&Vector_Vector_double_ = vector_vector_double_;

        Napi::Value string_(Napi::Env env, const std::string &&value);
        Napi::Value vector_string_(Napi::Env env, const std::vector<std::string> &value);
        Napi::Value vector_vector_string_(Napi::Env env, const std::vector<std::vector<std::string>> &value);
        constexpr auto &&String_ = string_;
        constexpr auto &&vector_String_ = vector_string_;
        constexpr auto &&Vector_String_ = vector_string_;
        constexpr auto &&Vector_string_ = vector_string_;
        constexpr auto &&vector_vector_String_ = vector_vector_string_;
        constexpr auto &&vector_Vector_String_ = vector_vector_string_;
        constexpr auto &&vector_Vector_string_ = vector_vector_string_;
        constexpr auto &&Vector_vector_String_ = vector_vector_string_;
        constexpr auto &&Vector_Vector_String_ = vector_vector_string_;
        constexpr auto &&Vector_Vector_string_ = vector_vector_string_;

        Napi::Value Bool_(Napi::Env env, const bool value);
        Napi::Value vector_Bool_(Napi::Env env, const std::vector<bool> &value);
        Napi::Value vector_vector_Bool_(Napi::Env env, const std::vector<std::vector<bool>> &value);
        constexpr auto &&Vector_Bool_ = vector_Bool_;
        constexpr auto &&vector_Vector_Bool_ = vector_Bool_;
        constexpr auto &&Vector_vector_Bool_ = vector_Bool_;
        constexpr auto &&Vector_Vector_Bool_ = vector_Bool_;

        Napi::Value bytes_(Napi::Env env, const std::string &&value);
        Napi::Value vector_bytes_(Napi::Env env, const std::vector<std::string> &value);
        Napi::Value vector_vector_bytes_(Napi::Env env, const std::vector<std::vector<std::string>> &value);
        constexpr auto &&Bytes_ = bytes_;
        constexpr auto &&vector_Bytes_ = vector_bytes_;
        constexpr auto &&Vector_Bytes_ = vector_bytes_;
        constexpr auto &&Vector_bytes_ = vector_bytes_;
        constexpr auto &&vector_vector_Bytes_ = vector_vector_bytes_;
        constexpr auto &&vector_Vector_Bytes_ = vector_vector_bytes_;
        constexpr auto &&vector_Vector_bytes_ = vector_vector_bytes_;
        constexpr auto &&Vector_vector_Bytes_ = vector_vector_bytes_;
        constexpr auto &&Vector_Vector_Bytes_ = vector_vector_bytes_;
        constexpr auto &&Vector_Vector_bytes_ = vector_vector_bytes_;
`;
for (const i of constructors) {
    result += `
        Napi::Value ${i.name}_(Napi::Env env, const td::td_api::object_ptr<td::td_api::${i.name}> &&value);
        Napi::Value vector_${i.name}_(Napi::Env env, const std::vector<td::td_api::object_ptr<td::td_api::${i.name}>> &value);
        Napi::Value vector_vector_${i.name}_(Napi::Env env, const std::vector<std::vector<td::td_api::object_ptr<td::td_api::${i.name}>>> &value);
        constexpr auto &&Vector_${i.name}_ = vector_${i.name}_;
        constexpr auto &&Vector_vector_${i.name}_ = vector_vector_${i.name}_;
        constexpr auto &&vector_Vector_${i.name}_ = vector_vector_${i.name}_;
        constexpr auto &&Vector_Vector_${i.name}_ = vector_vector_${i.name}_;`;
}
for (const i of classes) {
    if (i.constructors.length === 1) continue;
    result += `
        Napi::Value ${i.name}_(Napi::Env env, const td::td_api::object_ptr<td::td_api::${i.name}> &&value);
        Napi::Value vector_${i.name}_(Napi::Env env, const std::vector<td::td_api::object_ptr<td::td_api::${i.name}>> &value);
        Napi::Value vector_vector_${i.name}_(Napi::Env env, const std::vector<std::vector<td::td_api::object_ptr<td::td_api::${i.name}>>> &value);
        constexpr auto &&Vector_${i.name}_ = vector_${i.name}_;
        constexpr auto &&Vector_vector_${i.name}_ = vector_vector_${i.name}_;
        constexpr auto &&vector_Vector_${i.name}_ = vector_vector_${i.name}_;
        constexpr auto &&Vector_Vector_${i.name}_ = vector_vector_${i.name}_;`;
}
for (const i of functions) {
    result += `
        Napi::Value ${i.name}_(Napi::Env env, const td::td_api::object_ptr<td::td_api::${i.name}> &&value);`;
}
result += `
        Napi::Value AnyUnknownObject(Napi::Env env, const td::td_api::object_ptr<td::td_api::Object> &&value);
    }
}
`;
require("fs").writeFileSync("./src/td-to-js.h", result);
