# TdNode

TdNode is a Node.JS interface for [TDLib](https://github.com/tdlib/td)

It natively wraps around TDLib and eliminates the need for external dependencies such as tdjson.

Currently, the module is only available on Windows, and community support would be appreciated to help improve `install.js` to support other platforms.

## Usage

The module exports a TelegramClient class. It is recommended that immediately upon loading the module, you use the static sync setLogVerbosityLevel method in order to disable TDLib logging.
```JavaScript
TdNode.execute({
    "@type": "setLogVerbosityLevel",
    new_verbosity_level: 0,
});
```
When you create a `new TdNode();`, you must handle updates manually in a similar fashion to tdjson.

## Receiving

The `receive` method takes a single optional number parameter to indicate the maximum amount of seconds the client will poll TDLib before giving up.
Note: The timeout may be longer than specified if you have many clients receiving all at once.
By default, the timeout is 60.0 seconds.

When called, the method will return a Promise object for the data to receive.
If there is data available immediately, the promise will be returned in an already resolved state.

```JavaScript
async function loop(client, timeout) {
    while (true) {
        const data = await client.receive(60);
        if (!data) { // data will be null if the timeout expires
            continue;
        }
        // do something with the data.
    }
}
```

## Sending

The `send` method takes a single required parameter containing the request to send to TDLib.
You may optionally supply an `@extra` field in the request in the form of a string, number, or bigint.
While you may reuse an id you used previously, it is not recommended.

Methods that can be executed synchronously may be done with the static `execute` method.
The `execute` method does not support the `@extra` field.
If TDLib returns an error, that error will be returned instead of thrown.

Note: Most fields in TDLib are required, and leaving those values null or undefined may lead to unexpected behaviour up to and including a crash
without `process.on("exit")` listeners being called.
If the field is specified, but is simply not the correct type, this method will throw an error.

```JavaScript
TdNode.execute({
    "@type": "setLogVerbosityLevel",
    new_verbosity_level: 0,
});
client.send({
    "@type": "setTdlibParameters",
    "@extra": 123,
    parameters: {
        "@type": "tdlibParameters",
        use_test_dc: false,
        database_directory: "database",
        files_directory: "files",
        use_file_database: true,
        use_chat_info_database: true,
        use_message_database: true,
        use_secret_chats: false,
        api_id: NaN,
        api_hash: "",
        system_language_code: "",
        device_model: "",
        system_version: "",
        application_version: "",
        enable_storage_optimizer: true,
        ignore_file_names: true,
    },
});
```

## Data types

For primitive types in TDLib, here is a table for what types you can expect to see from them

| TDLib | JavaScript |
| - | - |
| double | number |
| string | string |
| int32 | number |
| int53 | number |
| int64 | bigint |
| bytes | string |
| boolFalse | boolean |
| boolTrue | boolean |
| Bool | boolean |
| vector | Array |

