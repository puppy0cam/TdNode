# TdNode

TdNode is a Node.JS interface for [TDLib](https://github.com/tdlib/td)

It natively wraps around TDLib and eliminates the need for external dependencies such as tdjson.

Currently, the module is only available on Windows, and community support would be appreciated to help improve `install.js` to support other platforms.

## Usage

The module exports a TelegramClient class. It is recommended that immediately upon loading the module, you use the static method `TelegramClient.setLogLevel(0)` in order to disable TDLib logging.

When you create a `new TelegramClient();`, you must set a function to handle updates from TDLib. The listener function will have two parameters, data and error respectively.
It will be called as if the function were a method of the class, so assuming it is not an arrow function, the `this` context will be the client.

Normally, you will never even see an error appear here, as TDLib has a habit of crashing the process instead of throwing an error.
WARNING: When TDLib crashses the process, process.on("exit") listeners WILL NOT BE EXECUTED!
```JavaScript
const { TelegramClient } = require("tdnode");

TelegramClient.setLogLevel(0);

const client1 = new TelegramClient();
const client2 = new TelegramClient();

function onReceiveData(data, error) {
    if (error) {
        console.error(error);
    } else if (data) { // data is possibly null even if there is no error
        // data is going to be an Update object.
        if (data["@type"] === "updateAuthorizationState") {
            this.authorization_state = data.authorization_state;
            // handle authorization state
        }
    }
}

client1.listen(onReceiveData);
client2.listen(onReceiveData);

client1.start();
client2.start();
```
