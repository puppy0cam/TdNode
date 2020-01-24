#pragma once

#include <queue>
#include <map>
#include <td/telegram/Client.h>
#include <td/telegram/td_api.h>
#include <td/telegram/td_api.hpp>
#include <napi.h>
#include "td-to-js.h"
#include "js-to-td.h"

namespace TdNode {
    class TelegramManager;
    class JavaScriptManager;
    class ReceiverAsyncWorker;
    constexpr const char *ERROR_REASON_RECEIVE_LOCKED = "RECEIVE_LOCKED - This client is already being received from";
    constexpr const char *ERROR_REASON_NOT_ENOUGH_ARGUMENTS = "Not enough arguments";
    class TelegramManager {
        public:
            TelegramManager();
            ~TelegramManager() noexcept;
            td::Client::Response receive(double timeout);
            static td::td_api::object_ptr<td::td_api::Object> execute(td::td_api::object_ptr<td::td_api::Function> request);
            void send(td::Client::Request request);
            Napi::Value ConvertResultToJavaScript(Napi::Env env, td::Client::Response tg_response);

            void StartJavaScriptLifetime();
            void EndJavaScriptLifetime();
            void StartWorkerLifetime();
            void EndWorkerLifetime();
            std::map<std::uint64_t, Napi::Number> request_ids;
        private:
            td::Client *client = new td::Client();
            bool is_receive_locked = false;
            uint8_t js_alive = true;
            uint8_t worker_alive = false;
    };
    class JavaScriptManager : public Napi::ObjectWrap<JavaScriptManager> {
        public:
            static Napi::Object Init(Napi::Env env, Napi::Object exports);
            JavaScriptManager(const Napi::CallbackInfo &info);
            void Finalize(Napi::Env env);
        private:
            static Napi::FunctionReference constructor;

            TelegramManager *tg;

            void tg_send(const Napi::CallbackInfo &info);
            Napi::Value tg_receive(const Napi::CallbackInfo &info);
            std::uint64_t next_request_id = 0;

            static Napi::Value execute(const Napi::CallbackInfo &info);
    };
    class ReceiverAsyncWorker : public Napi::AsyncWorker {
        public:
            ReceiverAsyncWorker(Napi::Env env, TelegramManager *client, double timeout);
            Napi::Promise GetPromise();
            void Execute();
            void OnOK();
        private:
            TelegramManager *tg;
            td::Client::Response tg_response;
            double timeout;
            Napi::Promise::Deferred js_promise;
    };
}

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
