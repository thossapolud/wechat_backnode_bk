const express = require('express')
const app = express()
const request = require('request')
const lineAccessToken = "rFAGe4VwQUA4972XjGQN1fTbtPEBAYp15hpo36+CpNezcj0+BBHI05gdRkefF0pQA3AwsU1Rz3vwZON0hJ12TAkiEWE8yHMD51YD+TkRWsBqHrmwYi+w/JkSenQcYZSybbPiAtJLOQfgGcoPfR2DGgdB04t89/1O/w1cDnyilFU="
const firebase = require('firebase')
const mysql = require('mysql');

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
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
    apiKey: "AIzaSyBR0kstVOmbMCE6WuaSiXImg5hCAcTpowM",
    authDomain: "messages-d18e7.firebaseapp.com",
    databaseURL: "https://messages-d18e7-default-rtdb.firebaseio.com",
    projectId: "messages-d18e7",
    storageBucket: "messages-d18e7.appspot.com",
    messagingSenderId: "344571973812",
    appId: "1:344571973812:web:606441221459ed5fa787e1",
    measurementId: "G-MXKDDZHQ2X"
  };
  firebase.initializeApp(firebaseConfig);
  const firestore = firebase.firestore();

  
//   var mysql      = require('mysql');
//   var connection = mysql.createConnection({
//     host     : 'localhost',
//     user     : 'root',
//     password : '',
//     database : 'bacc9_line',
//     port: 8080
//   });
  
//   connection.connect();

// var mysql = require('mysql');

// var mysql = require('mysql');
// var pool  = mysql.createPool({
//   connectionLimit : 10,
//   host            : 'localhost',
//   user            : 'root',
//   password        : '1234',
//   database        : 'bacc9_line'
// });
// pool.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//   if (error) throw error;
//   console.log('The solution is: ', results[0].solution);
// });
var con = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '1234',
    database : 'bacc9_line',
    port : '80',
})

con.connect((err)=>{
if(err){
    console.log('Error connect to Db', err)
    return 
}
console.log('Connection success')
})



// con.connect(function(err) {
//        console.log('test = ',err);
// });

// var connection = mysql.createConnection({
//        host: 'localhost',
//        user: 'root',
//        password: '',
//        database: 'bacc9_line'
// });
// connection.connect(function(err) {
//        console.log('test = ',err);
// });
  


const bodyParser = require('body-parser')
const { date } = require('joi')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())



app.use(function (req, res, next) { // แก้ Access-Control-Allow-Origin
    /*var err = new Error('Not Found');
     err.status = 404;
     next(err);*/
  
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
  
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');
  
  //  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  
    // Pass to next layer of middleware
    next();
  });

app.post('/webhook', (req, res) => {
    let reply_token = req.body.events[0].replyToken //ส่งกลับไปยัง user ที่ไลน์เข้ามา
    let reply_message = req.body.events[0].message.text //msg สำหรับการ reply หรือเอาไปเก็บที่ data base
    let reply_line_userID = req.body.events[0].source.userId
    let type = req.body.events[0].source.type
    let timestamp = req.body.events[0].timestamp //เวลาส่งไลน์
    let mode =req.body.events[0].mode
    let destination =req.body.destination

    console.log('req = ',req.body.events[0].message)
    console.log('req body = ', req.body)
    console.log('reply_token = ', reply_token)
    // reply(reply_token,reply_message)
    writeLineData(reply_token,reply_message,reply_line_userID,type,timestamp,mode,destination)


    res.sendStatus(200)
    // res.send('test=')
    // console.log('test ===', req.body.events)
    // console.log('test_message ===', test_message.text)
})

app.get('/', function (req, res) {
    res.send('Hello World!')
  })

app.get('/testquery', function (req, res) {
    con.query("SELECT * FROM user", function (err, result, fields) {
        if (err) throw err;
        console.log(result);
      });
 })

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

// insert
app.post("/message", async (req, res) => {
    try {
      const data = req.body;
  
    //   ชื่อ collection ที่ต้องการ insert
      await firestore.collection("message").doc().set(data);
      
      // ถ้ามี message อยู่ใน body json
      if (data.message) {
        // broadcast ไปที่ไลน์บอท
        broadcast(data.message);
      }
      res.json({ success: true, message: "insert success" });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

app.post("/reply/",(req,res)=>{ // นำ reply_token ที่ได้ไปเก็บใน Firebase จากนั้นทำการกำหนด reply_message ส่งกลับไป ส่งได้ 5 message ต่อ 1 Token
    let reply_token = ''
    let reply_message = req.body.message
    let reply_to = req.body.sendTo
    let destination = req.body.senderlineUserId

    firestore.collection("lineMessage").doc().set({
        vreply_message : reply_message,
        vreply_line_userID : reply_to,
        vdestination : destination,
        statusMessage : 'send',
        read : 0,
        createdAt : new Date()
    })
    

    reply(reply_token,reply_message,reply_to)
    
    res.sendStatus(200)

})

app.post("/broadcast",(req,res)=>{
 let msg = "ทดสอบ บอร์ดแคส"
 broadcast(msg)
})

app.post("/testapi",(req,res)=>{
    console.log('test', req.body)
})


function writeLineData(reply_token,reply_message,reply_line_userID,type,timestamp,mode,destination) {
    firestore.collection("lineMessage").doc().set({
        vreply_token : reply_token,
        vreply_message : reply_message,
        vreply_line_userID : reply_line_userID,
        vtype : type,
        vtimesLinetamp : timestamp,
        vmode : mode,
        vdestination : destination,
        statusMessage : 'receive',
        read : 0,
        createdAt : new Date()
        
    })
    // console.log('status = ' + res.statusCode);
}


function reply(reply_token,reply_message,reply_to) {
    // const reply_token = '5c24c5b1b61a4516b30a83679c564c23'
    // const reply_message = 'ทดสอบยิง'
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer rFAGe4VwQUA4972XjGQN1fTbtPEBAYp15hpo36+CpNezcj0+BBHI05gdRkefF0pQA3AwsU1Rz3vwZON0hJ12TAkiEWE8yHMD51YD+TkRWsBqHrmwYi+w/JkSenQcYZSybbPiAtJLOQfgGcoPfR2DGgdB04t89/1O/w1cDnyilFU="'
    }
    let body = JSON.stringify({
        // replyToken: reply_token,
        to: reply_to,
        messages: [{
            type: 'text',
            text: reply_message
        }]
    }) 
    console.log('headers = ', headers)
    console.log('body = ', body)

    request.post({
        // url: 'https://api.line.me/v2/bot/message/reply',
        url: 'https://api.line.me/v2/bot/message/push',
        headers: headers,
        body: body
       
    }, (err, res, body) => {
        // console.log('body = ', body)
        console.log('status = ' + res.statusCode);
    })
}

function broadcast(msg) {
    let headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + lineAccessToken,
    };
    let body = JSON.stringify({
      messages: [
        {
          type: "text",
          text: msg,
        },
      ],
    });
    request.post(
      {
        url: "https://api.line.me/v2/bot/message/broadcast",
        headers: headers,
        body: body,
      },
      async (err, res, body) => {
        console.log("status = " + res.statusCode);
  
        // save message to firebase
        await firestore
          .collection("message")
          .doc()
          .set({ message: msg, reply_token: null });
      }
    )
}



