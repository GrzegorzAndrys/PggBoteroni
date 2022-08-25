require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')
const cheerio = require('cheerio')
var LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./scratch');

const {TOKEN, SERVER_URL} = process.env
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`
const URI = `/webhook/${TOKEN}`
const WEBHOOK_URL= SERVER_URL+URI
const app = express()
let neverending=1
let msg = ""
let statecheck=1;
let chatids = [];

localStorage.chatstrg==null ? localStorage.setItem("chatstrg", JSON.stringify(chatids)) : chatids = JSON.parse(localStorage.getItem("chatstrg"));



console.log(JSON.stringify(chatids))
app.use(bodyParser.json())


async function sendit(){
    noOfProperties==0 ? msg = "Pojawił się! Powodzenia :)" : msg = "Skończył się :(" 
    for (const element of chatids) {
        console.log(element)
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: element,
            text: msg
        })
      }
    
}

const statepgg = async () => {
    while (neverending==true) {
    const response = await axios.get("https://sprawdzwegiel.pl/");
    const $ = cheerio.load(response.data);
    noOfProperties = $('ul').text().indexOf("Dostępny");
    console.log(noOfProperties)
    if (noOfProperties==0&&statecheck==0) {
        sendit() 
        statecheck=1
    }
    else if(noOfProperties==-1&&statecheck==1){
        sendit() 
        statecheck=0
    }
     
    }
        
    
}
const init = async () => {
    
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
    console.log(res.data, `${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
    statepgg()
}

app.post(URI, async(req, res) => {
    
    if (!chatids.includes(req.body.message.chat.id)) {
        chatids.push(req.body.message.chat.id)
        localStorage.setItem("chatstrg", JSON.stringify(chatids));
      }
    
      
   
    return res.send()
  
    
})



app.listen(process.env.PORT || 5000, async () => {
    console.log('app running on port', process.env.PORT || 5000)
    await init()
})