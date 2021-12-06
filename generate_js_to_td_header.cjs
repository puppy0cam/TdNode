/** @type {typeof import("./parsing_tl").TD_API} */
const {
    constructors,
    functions,
    classes,
} = require("./td_api.json");

let result = `\
#ifndef _TdNode_JS_TO_TD_HEADER
#define _TdNode_JS_TO_TD_HEADER

#include "libraries.h"

namespace TdNode {
    namespace ToTelegram {
        inline const bool IsNotNullish(const Napi::Value value);
        td::td_api::object_ptr<td::td_api::Function> AnyUnknownFunction(const Napi::Value value);
        td::td_api::object_ptr<td::td_api::Object> AnyUnknownObject(const Napi::Value value);

        #pragma region double
        using double_t = double;
        inline double_t double_(const Napi::Value value);

        using Double_t = double_t;
        constexpr auto &&Double_ = double_;
        #pragma endregion
        #pragma region string
        using string_t = std::string;
        inline string_t string_(const Napi::Value value);

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
        inline Bool_t Bool_(const Napi::Value value);
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

        template <class T>
        using Vector_t = vector_t<T>;
        #pragma endregion`;

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
    }
}
#endif
`;

require("fs").writeFileSync("./src/js-to-td.h", result);
