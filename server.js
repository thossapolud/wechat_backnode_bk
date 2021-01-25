const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const request = require('request')
const ofirebase = require("./firebase/setData")
// const firebase = require('firebase')

// require("firebase/firestore");

// const firebaseConfig = {
//   apiKey: "AIzaSyBR0kstVOmbMCE6WuaSiXImg5hCAcTpowM",
//   authDomain: "messages-d18e7.firebaseapp.com",
//   databaseURL: "https://messages-d18e7-default-rtdb.firebaseio.com",
//   projectId: "messages-d18e7",
//   storageBucket: "messages-d18e7.appspot.com",
//   messagingSenderId: "344571973812",
//   appId: "1:344571973812:web:606441221459ed5fa787e1",
//   measurementId: "G-MXKDDZHQ2X"
// };

// Initialize Firebase
// firebase.initializeApp(firebaseConfig);

// var db = firebase.firestore();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))


app.get('/', function (req, res) {
  res.send('Hello World!')
})


app.post('/webhook', (req, res) => {
    let reply_token = req.body.events[0].replyToken //ส่งกลับไปยัง user ที่ไลน์เข้ามา
    let reply_message = req.body.events[0].message.text //msg สำหรับการ reply หรือเอาไปเก็บที่ data base
    let reply_line_userID = req.body.events[0].source.userId
    let type = req.body.events[0].source.type
    let timestamp = req.body.events[0].timestamp //เวลาส่งไลน์
    let mode =req.body.events[0].mode

    console.log('req = ',req.body.events[0].source)
    console.log('reply_token = ', reply_token);
    // reply(reply_token,reply_message)
    
    // res.sendStatus(200)
    res.send('test=')
    // console.log('test ===', req.body.events)
    // console.log('test_message ===', test_message.text)
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

app.post("/savedata/",function(req,res){
    ofirebase.saveData(req.body,function(err,data) {
        console.log(req.body)
        res.send(data);
        res.send('test')
    })
})

app.post("/reply/",(req,res)=>{ // นำ reply_token ที่ได้ไปเก็บใน Firebase จากนั้นทำการกำหนด reply_message ส่งกลับไป ส่งได้ 5 message ต่อ 1 Token
    let reply_token = '39e26f8f9afd4530a295ac4758224beb'
    let reply_message = 'ได้บ้างไม่ได้บ้าง ห่า'

    reply(reply_token,reply_message)
    
    res.sendStatus(200)

})


function reply(reply_token,reply_message) {
    // const reply_token = '5c24c5b1b61a4516b30a83679c564c23'
    // const reply_message = 'ทดสอบยิง'
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer rFAGe4VwQUA4972XjGQN1fTbtPEBAYp15hpo36+CpNezcj0+BBHI05gdRkefF0pQA3AwsU1Rz3vwZON0hJ12TAkiEWE8yHMD51YD+TkRWsBqHrmwYi+w/JkSenQcYZSybbPiAtJLOQfgGcoPfR2DGgdB04t89/1O/w1cDnyilFU="'
    }
    let body = JSON.stringify({
        replyToken: reply_token,
        messages: [{
            type: 'text',
            text: reply_message
        }]
    }) 
    console.log('headers = ', headers)
    console.log('body = ', body)

    request.post({
        url: 'https://api.line.me/v2/bot/message/reply',
        // url: 'https://api.line.me/v2/bot/message/push',
        headers: headers,
        body: body
       
    }, (err, res, body) => {
        // console.log('body = ', body)
        console.log('status = ' + res.statusCode);
    })
}

