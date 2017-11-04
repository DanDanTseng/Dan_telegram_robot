const TelegramBot = require('node-telegram-bot-api');
let bot;
if(process.env.dev=='Y'){
    const token = process.env.BOT_TOKEN;
    bot = new TelegramBot(token, {polling: true});
}else{
    const token = process.env.BOT_TOKEN;
    const webHook = { port: process.env.PORT || 443 };
    const url = process.env.NOW_URL || 'https://dandanrobot.now.sh';

    bot = new TelegramBot(token, { webHook });
    bot.setWebHook(`${url}/bot${token}`);
}

bot.onText(/\/start/, (msg, match) => {
    // 'match' is the result of executing the regexp above on the text content
    // of the message
    const username=msg.from.first_name;
    const chatId = msg.chat.id;
    //const resp = match[1]; // the captured "whatever"
    const resp="Hi "+username;

    bot.sendMessage(chatId, resp);
});

bot.onText(/hi/i, (msg,match) => {

    const chatId = msg.chat.id;

    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, 'YOLO',{parse_mode:'HTML'});


});
bot.on('sticker', sticker => {
    const chatId = sticker.chat.id;
    const stickerid=sticker.sticker.file_id;
    bot.sendSticker(chatId, stickerid);
});

