#ifndef TdNode_TdNode_CODE
#define TdNode_TdNode_CODE

#include "libraries.h"
#include "TdNode.h"
#include "td-to-js.cpp"
#include "js-to-td.cpp"


TdNode::TelegramManager::TelegramManager() {
}
TdNode::TelegramManager::~TelegramManager() noexcept {
    while (js_alive || worker_alive) {
        is_receive_locked = true;
        std::this_thread::yield();
    }
    is_receive_locked = true;
    delete client;
}
td::Client::Response TdNode::TelegramManager::receive(double timeout) {
    return std::move(client->receive(timeout));
}
td::td_api::object_ptr<td::td_api::Object> execute(td::td_api::object_ptr<td::td_api::Function> request) {
    return std::move(td::Client::execute({ 0, std::move(request)}).object);
}
void TdNode::TelegramManager::send(td::Client::Request request) {
    client->send(std::move(request));
}
Napi::Value TdNode::TelegramManager::ConvertResultToJavaScript(Napi::Env env, td::Client::Response tg_response) {
    Napi::EscapableHandleScope scope(env);
    Napi::Value result = ToJavaScript::AnyUnknownObject(env, std::move(tg_response.object));
    if (tg_response.id) {
        auto it = request_ids.find(tg_response.id);
        if (it != request_ids.end()) {
            const RequestExtraData req_info = std::move(it->second);
            request_ids.erase(it);
            if (result.IsObject()) {
                result.As<Napi::Object>().Set("@extra", req_info.GetValue(env));
            } else {
                // fallback object if we get null from conversion to allow for @extra
                Napi::Object fallbackObject = Napi::Object::New(env);
                fallbackObject.Set("@extra", req_info.GetValue(env));
                fallbackObject.Set("@helpInfo", Napi::String::New(env, "Normally it should be impossible to get an object like this, however when converting to javascript, we somehow ended up with null. The @extra field has been provided to assist in debugging"));
                return scope.Escape(fallbackObject);
            }
        }
    }
    return scope.Escape(result);
}
void TdNode::TelegramManager::StartJavaScriptLifetime() {
    if (++js_alive == 0) {
        js_alive = 0b11111111;
        throw std::runtime_error("JavaScript lifetimes exceeds uint8 limit");
    }
}
void TdNode::TelegramManager::EndJavaScriptLifetime() {
    if (--js_alive == 0b11111111) {
        js_alive = 0;
        throw std::runtime_error("JavaScript lifetimes went below 0");
    }
}
void TdNode::TelegramManager::StartWorkerLifetime() {
    if (++worker_alive == 0) {
        worker_alive = 0b11111111;
        throw std::runtime_error("Worker lifetimes exceeds uint8 limit");
    }
}
void TdNode::TelegramManager::EndWorkerLifetime() {
    if (--worker_alive == 0b11111111) {
        worker_alive = 0;
        throw std::runtime_error("Worker lifetimes went below 0");
    }
}
Napi::Object TdNode::JavaScriptManager::Init(Napi::Env env, Napi::Object exports) {
    Napi::Function func = DefineClass(env, "TdNode", {
        InstanceMethod("send", &TdNode::JavaScriptManager::tg_send),
        InstanceMethod("receive", &TdNode::JavaScriptManager::tg_receive),
        InstanceMethod("receiveSync", &TdNode::JavaScriptManager::tg_receive_sync),
        StaticMethod("execute", &TdNode::JavaScriptManager::execute)
    });
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
    exports.Set("TdNode", func);
    return exports;
}
TdNode::JavaScriptManager::JavaScriptManager(const Napi::CallbackInfo &info) : Napi::ObjectWrap<TdNode::JavaScriptManager>(info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);
    bool did_set_client = false;
    if (info.Length() >= 1) {
        Napi::HandleScope scope(env);
        Napi::Value arg_0 = info[0];
        if (arg_0.IsObject()) {
            Napi::HandleScope scope(env);
            Napi::Object obj_arg_0 = arg_0.As<Napi::Object>();
            if (obj_arg_0.InstanceOf(constructor.Value())) {
                Napi::HandleScope scope(env);
                TdNode::JavaScriptManager *old_instance = Unwrap(obj_arg_0);
                if (old_instance == nullptr) {
                    Napi::TypeError::New(env, "Cannot clone client: client was destroyed already").ThrowAsJavaScriptException();
                    return;
                } else {
                    tg = old_instance->tg;
                    did_set_client = true;
                }
            } else {
                Napi::TypeError::New(env, "Cannot clone client: client is not an instance of TdNode").ThrowAsJavaScriptException();
                return;
            }
        } else if (!arg_0.IsUndefined() && !arg_0.IsNull()) {
            Napi::TypeError::New(env, "Cannot clone client: client was not an object").ThrowAsJavaScriptException();
            return;
        }
    }
    if (!did_set_client) {
        tg = new TelegramManager();
    }
    try {
        tg->StartJavaScriptLifetime();
    } catch (std::runtime_error e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
        return;
    }
}
void TdNode::JavaScriptManager::Finalize(Napi::Env env) {
    tg->EndJavaScriptLifetime();
}
Napi::FunctionReference TdNode::JavaScriptManager::constructor;
void TdNode::JavaScriptManager::tg_send(const Napi::CallbackInfo &info) {
    if (info.Length() >= 1) {
        Napi::Object param = info[0].As<Napi::Object>();
        td::td_api::object_ptr<td::td_api::Function> request;
        try {
            request = std::move(ToTelegram::AnyUnknownFunction(param));
        } catch (std::runtime_error e) {
            Napi::Error::New(info.Env(), e.what()).ThrowAsJavaScriptException();
            return;
        }
        auto request_id = ++next_request_id;
        if (param.Has("@extra")) {
            Napi::Value reqId = param.Get("@extra");
            switch (reqId.Type()) {
                case napi_valuetype::napi_undefined:
                case napi_valuetype::napi_null:
                    break;
                default:
                    Napi::TypeError::New(info.Env(), "Request ID must be a string, bigint, or number").ThrowAsJavaScriptException();
                    return;
                case napi_valuetype::napi_object:
                case napi_valuetype::napi_bigint:
                case napi_valuetype::napi_string:
                case napi_valuetype::napi_number:
                    tg->request_ids.emplace(request_id, RequestExtraData(reqId));
            }
        }
        tg->send({ request_id, std::move(request) });
    } else {
        Napi::RangeError::New(info.Env(), ERROR_REASON_NOT_ENOUGH_ARGUMENTS).ThrowAsJavaScriptException();
    }
}
Napi::Value TdNode::JavaScriptManager::tg_receive(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::EscapableHandleScope scope(env);
    double timeout = 60.0;
    if (info.Length() >= 1) {
        Napi::Value arg_0 = info[0];
        if (arg_0.IsNumber()) {
            timeout = arg_0.As<Napi::Number>().DoubleValue();
        } else if (ToTelegram::IsNotNullish(arg_0)) {
            Napi::Promise::Deferred defer = Napi::Promise::Deferred::New(env);
            defer.Reject(Napi::TypeError::New(env, "Timeout must be a number").Value());
            return scope.Escape(defer.Promise());
        }
    }
    td::Client::Response immediate_response = std::move(tg->receive(0.0));
    if (immediate_response.id || immediate_response.object) {
        Napi::Promise::Deferred defer = Napi::Promise::Deferred::New(env);
        defer.Resolve(tg->ConvertResultToJavaScript(env, std::move(immediate_response)));
        return scope.Escape(defer.Promise());
    } else {
        ReceiverAsyncWorker *worker = new ReceiverAsyncWorker(env, tg, timeout);
        worker->Queue();
        return scope.Escape(worker->GetPromise());
    }
}
Napi::Value TdNode::JavaScriptManager::tg_receive_sync(const Napi::CallbackInfo &info) {
    const Napi::Env env = info.Env();
    td::Client::Response response = std::move(tg->receive(0.0));
    if (response.id || response.object) {
        return tg->ConvertResultToJavaScript(env, std::move(response));
    } else {
        return env.Null();
    }
}
Napi::Value TdNode::JavaScriptManager::execute(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::EscapableHandleScope scope(env);
    if (info.Length() < 1) {
        Napi::RangeError::New(env, ERROR_REASON_NOT_ENOUGH_ARGUMENTS).ThrowAsJavaScriptException();
        return env.Undefined();
    }
    td::td_api::object_ptr<td::td_api::Function> request;
    try {
        request = std::move(ToTelegram::AnyUnknownFunction(info[0]));
    } catch (std::runtime_error e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
        return env.Undefined();
    }
    td::Client::Response result = td::Client::execute({ 0, std::move(request) });
    Napi::Value RESULT = scope.Escape(ToJavaScript::AnyUnknownObject(env, std::move(result.object)));
    if (RESULT.IsObject() && RESULT.As<const Napi::Object>().Get("@type").As<const Napi::String>().Utf8Value() == "error") {
        Napi::Error err = Napi::Error(env, RESULT);
        err.ThrowAsJavaScriptException();
        return RESULT;
    } else {
        return RESULT;
    }
}
TdNode::ReceiverAsyncWorker::ReceiverAsyncWorker(Napi::Env env, TelegramManager *client, double timeout) : Napi::AsyncWorker(env), tg(client), js_promise(Napi::Promise::Deferred::New(env)), timeout(timeout) {
    client->StartWorkerLifetime();
}
Napi::Promise TdNode::ReceiverAsyncWorker::GetPromise() {
    return js_promise.Promise();
}
void TdNode::ReceiverAsyncWorker::Execute() {
    tg_response = std::move(tg->receive(timeout));
}
void TdNode::ReceiverAsyncWorker::OnOK() {
    Napi::Env env = Env();
    Napi::HandleScope scope(env);
    Napi::Value result = tg->ConvertResultToJavaScript(env, std::move(tg_response));
    js_promise.Resolve(result);
    tg->EndWorkerLifetime();
}
TdNode::RequestExtraData::RequestExtraData(const std::int64_t value) noexcept : type(BigInt), value_ptr(new std::int64_t(value)) {
}
TdNode::RequestExtraData::RequestExtraData(const double value) noexcept : type(Number), value_ptr(new double(value)) {
}
TdNode::RequestExtraData::RequestExtraData(const std::string value) noexcept : type(String), value_ptr(new std::string(value)) {
}
TdNode::RequestExtraData::RequestExtraData(const std::string& value) noexcept : type(String), value_ptr(new std::string(value)) {
}
TdNode::RequestExtraData::RequestExtraData(const char *value) noexcept : type(String), value_ptr(new std::string(value)) {
}
TdNode::RequestExtraData::RequestExtraData(const Napi::Value value) {
    switch (value.Type()) {
        case napi_valuetype::napi_bigint:
            type = BigInt;
            value_ptr = new std::int64_t(std::stoll(value.ToString()));
            return;
        case napi_valuetype::napi_number:
            type = Number;
            value_ptr = new double(value.As<const Napi::Number>().DoubleValue());
            return;
        case napi_valuetype::napi_string:
            type = String;
            value_ptr = new std::string(value.As<const Napi::String>().Utf8Value());
            return;
        case napi_valuetype::napi_object:
            type = Object;
            value_ptr = new Napi::ObjectReference(Napi::Persistent(value.As<Napi::Object>()));
            return;
        default:
            std::cout << std::endl
                      << "Invalid code point, a crash may be inbound" << std::endl
                      << "File: " << __FILE__ << std::endl
                      << "Function: " << __func__ << std::endl;
            return;
    }
}
TdNode::RequestExtraData::RequestExtraData(const RequestExtraData &value) noexcept {
    switch (type = value.type) {
        case BigInt:
            value_ptr = new std::int64_t(*(std::int64_t *)value.value_ptr);
            return;
        case Number:
            value_ptr = new double(*(double *)value.value_ptr);
            return;
        case String:
            value_ptr = new std::string(*(std::string *)value.value_ptr);
            return;
        case Object:
            value_ptr = value.value_ptr;
            std::cout << std::endl
                      << "Cannot clone an ObjectReference, a crash or memory leak may be inbound" << std::endl
                      << "File: " << __FILE__ << std::endl
                      << "Function: " << __func__ << std::endl;
            return;
        default:
            std::cout << std::endl
                      << "Invalid code point, a crash may be inbound" << std::endl
                      << "File: " << __FILE__ << std::endl
                      << "Function: " << __func__ << std::endl;
            return;
    }
}
const TdNode::RequestExtraData::ValueType TdNode::RequestExtraData::GetType() const noexcept {
    return type;
}
Napi::Value TdNode::RequestExtraData::GetValue(Napi::Env env) const noexcept {
    switch (type) {
        case BigInt:
            return env.Global().Get("BigInt").As<Napi::Function>().Call({ Napi::String::New(env, std::to_string(*(std::int64_t *) value_ptr)) });
        case Number:
            return Napi::Number::New(env, *(double *) value_ptr);
        case String:
            return Napi::String::New(env, *(std::string *) value_ptr);
        case Object:
            {
                const Napi::ObjectReference& value = *(const Napi::ObjectReference *)value_ptr;
                if (value.IsEmpty()) {
                    return env.Null();
                } else {
                    return value.Value();
                }
            }
        default:
            std::cout << std::endl
                      << "Invalid code point, a crash may be inbound" << std::endl
                      << "File: " << __FILE__ << std::endl
                      << "Function: " << __func__ << std::endl;
            return env.Null();
    }
}
TdNode::RequestExtraData::~RequestExtraData() noexcept {
    if (value_ptr == nullptr) return;
    switch (type) {
        case BigInt:
            delete (std::int64_t *) value_ptr;
            return;
        case Number:
            delete (double *) value_ptr;
            return;
        case String:
            delete (std::string *) value_ptr;
            return;
        case Object:
            {
                Napi::ObjectReference &ref = *(Napi::ObjectReference *)value_ptr;
                if (ref.Unref() == 0) {
                    delete (Napi::ObjectReference *) value_ptr;
                }
                break;
            }
        default:
            std::cout << std::endl
                      << "Invalid code point, a crash may be inbound" << std::endl
                      << "File: " << __FILE__ << std::endl
                      << "Function: " << __func__ << std::endl;
            return;
    }
}
TdNode::RequestExtraData::RequestExtraData(RequestExtraData &&value) noexcept : type(value.type), value_ptr(value.value_ptr) {
    value.value_ptr = nullptr;
}
TdNode::RequestExtraData& TdNode::RequestExtraData::operator =(const RequestExtraData &value) noexcept {
    switch (type = value.type) {
        case BigInt:
            value_ptr = new std::int64_t(*(std::int64_t *)value.value_ptr);
            return *this;
        case Number:
            value_ptr = new double(*(double *)value.value_ptr);
            return *this;
        case String:
            value_ptr = new std::string(*(std::string *)value.value_ptr);
            return *this;
        case Object:
            value_ptr = value.value_ptr;
            std::cout << std::endl
                      << "Cannot clone an ObjectReference, a crash or memory leak may be inbound" << std::endl
                      << "File: " << __FILE__ << std::endl
                      << "Function: " << __func__ << std::endl;
            return *this;
        default:
            std::cout << std::endl
                      << "Invalid code point, a crash may be inbound" << std::endl
                      << "File: " << __FILE__ << std::endl
                      << "Function: " << __func__ << std::endl;
            return *this;
    }
}
TdNode::RequestExtraData& TdNode::RequestExtraData::operator =(RequestExtraData&& value) noexcept {
    type = value.type;
    value_ptr = value.value_ptr;
    value.value_ptr = nullptr;
    return *this;
}
Napi::Object InitALL(Napi::Env env, Napi::Object exports) {
    TdNode::JavaScriptManager::Init(env, exports);
    return exports;
}

NODE_API_MODULE(TdNode, InitALL)
#endif
