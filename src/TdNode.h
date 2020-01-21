#pragma once

#include <queue>
#include <map>
#include <td/telegram/Client.h>
#include <td/telegram/td_api.h>
#include <td/telegram/td_api.hpp>
#include <napi.h>
#include "node-td-conversions.h"
#include "td-node-conversions.h"
namespace NodeTd {
    constexpr const char *ERROR_REASON_TELEGRAM_MANAGER_NOT_ACCESSIBLE = "Telegram manager is not accessible";
    constexpr const char *ERROR_REASON_NOT_ENOUGH_ARGUMENTS = "Not enough arguments";
    constexpr const char *ERROR_REASON_TOO_MANY_ARGUMENTS = "Too many arguments";
    constexpr const char *ERROR_REASON_TDLIB_CLIENT_DESTROYED = "TDLib client has been destroyed";
    constexpr const char *ERROR_REASON_RECEIVING_ALREADY_STARTED = "The receiver is already started";
    constexpr const char *ERROR_REASON_CLIENT_LEFT_JS_SCOPE = "Client has already left JavaScript";
    constexpr const char *ERROR_REASON_NO_CALLBACK_FUNCTION_SET = "No callback function to listen to";
    class TelegramManager {
        public:
            TelegramManager() noexcept;
            ~TelegramManager() noexcept;
            void Start();
            const bool IsDestroyed() const noexcept;
            const bool IsReceiving() const noexcept;
            const bool HasLeftJavaScript() const noexcept;
            std::queue<td::Client::Response> responses;
            void LeaveJavaScriptContext();
            td::Client *client;
        private:
            void FinaliseClient();
            bool is_td_destroyed = false;
            bool is_receiving = false;
            bool has_left_js = false;
    };
    class JavaScriptManager : public Napi::ObjectWrap<JavaScriptManager> {
        friend class AsyncUpdateController;
        public:
            static Napi::Object Init(Napi::Env env, Napi::Object exports);
            JavaScriptManager(const Napi::CallbackInfo &info);
            void Finalize(Napi::Env env);
        private:
            static Napi::FunctionReference constructor;

            Napi::FunctionReference callback_function;
            bool is_callback_set = false;
            TelegramManager *client;
            bool is_accessible = false;
            std::map<uint64_t, Napi::Promise::Deferred> pending_requests;
            uint64_t next_request_id = 1;

            void Start(const Napi::CallbackInfo &info);
            void Destroy(const Napi::CallbackInfo &info);
            void Listen(const Napi::CallbackInfo &info);
            Napi::Value Send(const Napi::CallbackInfo &info);
            static void SetLogLevel(const Napi::CallbackInfo &info);
    };
    class AsyncUpdateController : public Napi::AsyncWorker {
        public:
            AsyncUpdateController(Napi::Env env, JavaScriptManager *js_client, TelegramManager *td_client);
            void Execute();
            void OnOK();
            void OnError(const Napi::Error &e);
        private:
            JavaScriptManager *js_manager;
            TelegramManager *td_manager;
    };
}
Napi::Object InitALL(Napi::Env env, Napi::Object exports);
