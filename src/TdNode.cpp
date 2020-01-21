#pragma once

#include <queue>
#include <map>
#include <td/telegram/Client.h>
#include <td/telegram/td_api.h>
#include <td/telegram/td_api.hpp>
#include <napi.h>
#include "node-td-conversions.h"
#include "td-node-conversions.h"
#include "TdNode.h"
NodeTd::TelegramManager::TelegramManager() noexcept {
    client = new td::Client();
}
NodeTd::TelegramManager::~TelegramManager() noexcept {
    if (!is_td_destroyed) {
        delete client;
    }
}
void NodeTd::TelegramManager::Start() {
    if (is_td_destroyed) throw std::exception(ERROR_REASON_TDLIB_CLIENT_DESTROYED);
    if (is_receiving) throw std::exception(ERROR_REASON_RECEIVING_ALREADY_STARTED);
    if (has_left_js) throw std::exception(ERROR_REASON_CLIENT_LEFT_JS_SCOPE);
    is_receiving = true;
    std::thread([this]() {
        while (!is_td_destroyed && !has_left_js) {
            td::Client::Response response = client->receive(60.0);
            if (response.object) {
                responses.push(std::move(response));
            }
        }
        is_receiving = false;
        FinaliseClient();
    }).detach();
}
const bool NodeTd::TelegramManager::IsDestroyed() const noexcept {
    return is_td_destroyed;
}
const bool NodeTd::TelegramManager::IsReceiving() const noexcept {
    return is_receiving;
}
const bool NodeTd::TelegramManager::HasLeftJavaScript() const noexcept {
    return has_left_js;
}
void NodeTd::TelegramManager::LeaveJavaScriptContext() {
    if (has_left_js) throw std::exception(ERROR_REASON_CLIENT_LEFT_JS_SCOPE);
    has_left_js = true;
    FinaliseClient();
}
void NodeTd::TelegramManager::FinaliseClient() {
    if (!is_receiving && has_left_js) {
        if (!is_td_destroyed) {
            delete client;
        }
        delete this;
    }
}
Napi::Object NodeTd::JavaScriptManager::Init(Napi::Env env, Napi::Object exports) {
    Napi::Function func = DefineClass(env, "TelegramClient", {
        InstanceMethod("listen", &JavaScriptManager::Listen),
        InstanceMethod("start", &JavaScriptManager::Start),
        InstanceMethod("destroy", &JavaScriptManager::Destroy),
        InstanceMethod("send", &JavaScriptManager::Send),
        StaticMethod("setLogLevel", &JavaScriptManager::SetLogLevel)
    });
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
    exports.Set("TelegramClient", func);
    return exports;
}
NodeTd::JavaScriptManager::JavaScriptManager(const Napi::CallbackInfo &info) : Napi::ObjectWrap<JavaScriptManager>(info) {
    client = new TelegramManager();
    is_accessible = true;
}
void NodeTd::JavaScriptManager::Finalize(Napi::Env env) {
    if (is_callback_set) {
        callback_function.Unref();
    }
    if (is_accessible) {
        try {
            client->LeaveJavaScriptContext();
        } catch (std::exception e) {
            // ignore the exception if it comes.
        }
    }
}
Napi::FunctionReference NodeTd::JavaScriptManager::constructor;
void NodeTd::JavaScriptManager::Start(const Napi::CallbackInfo &info) {
    if (info.Length() == 0) {
        if (is_accessible) {
            if (is_callback_set) {
                try {
                    client->Start();
                    new AsyncUpdateController(info.Env(), this, client);
                } catch (std::exception e) {
                    Napi::Error::New(info.Env(), e.what()).ThrowAsJavaScriptException();
                }
            } else {
                Napi::Error::New(info.Env(), ERROR_REASON_NO_CALLBACK_FUNCTION_SET).ThrowAsJavaScriptException();
            }
        } else {
            Napi::Error::New(info.Env(), ERROR_REASON_TELEGRAM_MANAGER_NOT_ACCESSIBLE).ThrowAsJavaScriptException();
        }
    } else {
        Napi::RangeError::New(info.Env(), ERROR_REASON_TOO_MANY_ARGUMENTS).ThrowAsJavaScriptException();
    }
}
void NodeTd::JavaScriptManager::Destroy(const Napi::CallbackInfo &info) {
    if (info.Length() == 0) {
        if (is_accessible) {
            try {
                client->LeaveJavaScriptContext();
                is_accessible = false;
            } catch (std::exception e) {
                Napi::Error::New(info.Env(), e.what()).ThrowAsJavaScriptException();
            }
        } else {
            Napi::Error::New(info.Env(), ERROR_REASON_TELEGRAM_MANAGER_NOT_ACCESSIBLE).ThrowAsJavaScriptException();
        }
    } else {
        Napi::RangeError::New(info.Env(), ERROR_REASON_TOO_MANY_ARGUMENTS).ThrowAsJavaScriptException();
    }
}
void NodeTd::JavaScriptManager::Listen(const Napi::CallbackInfo &info) {
    if (info.Length() == 1) {
        if (is_accessible) {
            Napi::Function func = info[0].As<Napi::Function>();
            if (is_callback_set) {
                callback_function.Unref();
            }
            callback_function = Napi::Persistent(func);
            is_callback_set = true;
        } else {
            Napi::Error::New(info.Env(), ERROR_REASON_TELEGRAM_MANAGER_NOT_ACCESSIBLE).ThrowAsJavaScriptException();
        }
    } else if (info.Length() == 0) {
        Napi::RangeError::New(info.Env(), ERROR_REASON_NOT_ENOUGH_ARGUMENTS).ThrowAsJavaScriptException();
    } else {
        Napi::RangeError::New(info.Env(), ERROR_REASON_TOO_MANY_ARGUMENTS).ThrowAsJavaScriptException();
    }
}
Napi::Value NodeTd::JavaScriptManager::Send(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    if (info.Length() == 1) {
        if (is_accessible) {
            td::td_api::object_ptr<td::td_api::Function> request = GetArbitraryFunction(info[0]);
            uint64_t request_id = next_request_id++;
            Napi::Promise::Deferred deferred = Napi::Promise::Deferred::New(env);
            client->client->send({ request_id, std::move(request) });
            pending_requests.emplace(request_id, std::move(deferred));
            return pending_requests.find(request_id)->second.Promise();
        } else {
            Napi::Error::New(env, ERROR_REASON_TELEGRAM_MANAGER_NOT_ACCESSIBLE).ThrowAsJavaScriptException();
            return env.Undefined();
        }
    } else if (info.Length() == 0) {
        Napi::RangeError::New(env, ERROR_REASON_NOT_ENOUGH_ARGUMENTS).ThrowAsJavaScriptException();
        return env.Undefined();
    } else {
        Napi::RangeError::New(env, ERROR_REASON_TOO_MANY_ARGUMENTS).ThrowAsJavaScriptException();
        return env.Undefined();
    }
}
void NodeTd::JavaScriptManager::SetLogLevel(const Napi::CallbackInfo &info) {
    if (info.Length() == 1) {
        const Napi::Value new_log_level = info[0];
        const std::int32_t set_log_level_to = new_log_level.As<Napi::Number>().Int32Value();
        td::Client::execute({ 0, td::td_api::make_object<td::td_api::setLogVerbosityLevel>(set_log_level_to)});
    } else if (info.Length() == 0) {
        Napi::RangeError::New(info.Env(), ERROR_REASON_NOT_ENOUGH_ARGUMENTS).ThrowAsJavaScriptException();
    } else {
        Napi::RangeError::New(info.Env(), ERROR_REASON_TOO_MANY_ARGUMENTS).ThrowAsJavaScriptException();
    }
}
NodeTd::AsyncUpdateController::AsyncUpdateController(Napi::Env env, JavaScriptManager *js_client, TelegramManager *td_client) : Napi::AsyncWorker(env), js_manager(js_client), td_manager(td_client) {
    Queue();
    js_client->Ref();
}
void NodeTd::AsyncUpdateController::Execute() {
    while (td_manager->responses.empty()) {
        if (td_manager->HasLeftJavaScript()) {
            return;
        }
        std::this_thread::sleep_for(std::chrono::milliseconds(1));
    }
}
void NodeTd::AsyncUpdateController::OnOK() {
    Napi::Env env = Env();
    if (td_manager->HasLeftJavaScript()) {
        js_manager->Unref();
    } else {
        if (!td_manager->responses.empty()) {
            Napi::HandleScope scope(env);
            std::uint32_t entry_id = 0;
            Napi::Array results = Napi::Array::New(env, td_manager->responses.size());
            Napi::Object js_client = js_manager->Value();
            js_client.Set("last_receive_result", results);
            while (!td_manager->responses.empty()) {
                td::Client::Response response = std::move(td_manager->responses.front());

                ConvertUnknownTelegramToJavaScript(env, response.object, results, Napi::Number::New(env, entry_id));
                Napi::Value entry = results.Get(entry_id);
                bool did_promise = false;
                if (response.id) {
                    auto it = js_manager->pending_requests.find(response.id);
                    if (it != js_manager->pending_requests.end()) {
                        Napi::Promise::Deferred prom = std::move(it->second);
                        js_manager->pending_requests.erase(it);
                        did_promise = true;
                        if (entry.IsObject() && entry.As<const Napi::Object>().Get("@type").As<Napi::String>().Utf8Value() == "error") {
                            prom.Reject(entry);
                        } else {
                            prom.Resolve(entry);
                        }
                    }
                }
                if (!did_promise) {
                    js_manager->callback_function.MakeCallback(js_client, { entry, env.Undefined() });
                }

                td_manager->responses.pop();
                entry_id++;
            }
        }
        SuppressDestruct();
        Queue();
    }
}
void NodeTd::AsyncUpdateController::OnError(const Napi::Error &e) {
    Napi::Env env = e.Env();
    Napi::HandleScope scope(env);
    js_manager->callback_function.MakeCallback(js_manager->Value(), { env.Undefined(), e.Value() });
}
Napi::Object InitALL(Napi::Env env, Napi::Object exports) {
    NodeTd::JavaScriptManager::Init(env, exports);
    return exports;
}
#include "node-td-conversions.cpp"
#include "td-node-conversions.cpp"

NODE_API_MODULE(TdNode, InitALL)
