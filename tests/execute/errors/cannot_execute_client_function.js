"use strict";
const { TdNode } = require("./");
try {
    TdNode.execute({
        "@type": "sendMessage",
        chat_id: 777000,
        input_message_content: {
            "@type": "inputMessageText",
            clear_draft: false,
            disable_web_page_preview: true,
            text: {
                "@type": "formattedText",
                entities: [
                    {
                        "@type": "textEntity",
                        length: 1,
                        offset: 0,
                        type: {
                            "@type": "textEntityTypeBold",
                        },
                    },
                ],
                text: "Hello World!",
            },
        },
        options: {
            "@type": "sendMessageOptions",
            disable_notification: true,
            from_background: true,
            scheduling_state: null,
        },
        reply_markup: null,
        reply_to_message_id: 0,
    });
} catch (e) {
    return;
}
throw "Was able to execute function";
