const format = require('date-fns/format');
const TelegramBot = require('node-telegram-bot-api');

const fetch = require('node-fetch');
let bot;

const getQuote=()=>{

    const quoteAPIURL='http://api.forismatic.com/api/1.0/?method=getQuote&key=457653&format=json&lang=en';
    return fetch(quoteAPIURL)
        .then(response => response.json())
        .then(json => {
            return json;
        })
        .catch(err => {
            bot.sendMessage(chatId, 'API goes wrong. Contact Admin');
        });
};
const getWeather=(location,msg)=>{
    const chatId=msg.chat.id;
    let weatherobj={};
    let arg=`select * from weather.forecast where woeid in (select woeid from geo.places(1) where text=\"${location}\") and u=\"c\"`;
    let url=`https://query.yahooapis.com/v1/public/yql?q=${arg}&format=json`;
    fetch(url)
        .then(response => response.json())
        .then(json => {
            if (json['error']) {
                throw json;
            }
            const date=(format(json.query.results.channel.item.condition.date, 'YYYY-MM-DD'));
            const title=json.query.results.channel.title.replace('Yahoo! Weather -','');
            weatherobj=json.query.results.channel.item.condition;
            console.log(weatherobj);
            bot.sendMessage(chatId, `${title}\nDate: ${date}\nTemp: ${weatherobj.temp}`,{parse_mode:'HTML'});

        });

};

if(process.env.dev=='Y'){
    const token = process.env.BOT_TOKEN;
    bot = new TelegramBot(token, {polling: true});
}else{
    const token = process.env.BOT_TOKEN;
    const webHook = { port: process.env.PORT || 443 };
    const url = process.env.NOW_URL || 'https://danrobot-185312.appspot.com';

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

bot.onText(/weather/i, (msg, match) => {
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    getWeather('taipei',msg);

    //b

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

bot.onText(/quote/i, (msg,match) => {
    const chatId = msg.chat.id;
    getQuote().then(rtn_json=>{
        const quoteObj=rtn_json;
        bot.sendMessage(chatId, "\""+quoteObj.quoteText+"\"")
            .then(()=>{
                bot.sendMessage(chatId, "- "+quoteObj.quoteAuthor);
            })
            .then(()=>{
                const replyMarkup = JSON.stringify(
                    {
                        inline_keyboard:
                            [
                                [
                                    {
                                        text: 'Another Quote',
                                        callback_data:'anotherQuote'
                                    }
                                ]
                            ]
                    }
                );

                bot.sendMessage(chatId, 'Click to get another quote!', {
                    reply_markup: replyMarkup,
                    parse_mode: 'markdown'
                });
            });
    });
});
bot.on('callback_query', message => {
    const chatId=message.message.chat.id;
    switch (message.data)
    {
        case 'anotherQuote' :{

            getQuote().then(rtn_json=>{
                const quoteObj=rtn_json;
                bot.sendMessage(chatId, "\""+quoteObj.quoteText+"\"")
                    .then(()=>{
                        bot.sendMessage(chatId, "- "+quoteObj.quoteAuthor);
                    })
            });
            break;
        }
    }
});
