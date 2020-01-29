#ifndef _TdNode_TdNode_HEADER
#define _TdNode_TdNode_HEADER

#include "libraries.h"

namespace TdNode {
    class TelegramManager;
    class JavaScriptManager;
    class ReceiverAsyncWorker;
    class RequestExtraData;
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
            std::map<std::uint64_t, RequestExtraData> request_ids;
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
    class RequestExtraData {
        public:
            static enum ValueType { BigInt, Number, String };
            const ValueType GetType() const noexcept;
            Napi::Value GetValue(Napi::Env env) const;
            RequestExtraData(const int64_t value) noexcept;
            RequestExtraData(const double_t value) noexcept;
            RequestExtraData(const std::string value) noexcept;
            RequestExtraData(const std::string& value) noexcept;
            RequestExtraData(const char *value) noexcept;
            RequestExtraData(const Napi::Value value);
            RequestExtraData(const RequestExtraData &value) noexcept;
        private:
            int64_t bigint_value;
            double_t number_value;
            std::string string_value;
            ValueType type;
    };
}

Napi::Object InitALL(Napi::Env env, Napi::Object exports);
#include "td-to-js.h"
#include "js-to-td.h"
#endif
