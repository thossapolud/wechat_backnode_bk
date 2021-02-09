const express = require('express')
const app = express()
const request = require('request')
const lineAccessToken = "rFAGe4VwQUA4972XjGQN1fTbtPEBAYp15hpo36+CpNezcj0+BBHI05gdRkefF0pQA3AwsU1Rz3vwZON0hJ12TAkiEWE8yHMD51YD+TkRWsBqHrmwYi+w/JkSenQcYZSybbPiAtJLOQfgGcoPfR2DGgdB04t89/1O/w1cDnyilFU="
const firebase = require('firebase')
// const mysql = require('mysql'); 
const firebaseKey = require("firebase-key");

const firebaseConfig = { //firebase
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
  
//-------

const bodyParser = require('body-parser')
const { date, func } = require('joi')
// const { default: col } = require('framework7-vue/cjs/components/col')
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


//-----line
app.post('/webhook', (req, res) => {
//     let data
//     let reply_token = req.body.events[0].replyToken //ส่งกลับไปยัง user ที่ไลน์เข้ามา
//     let message = req.body.events[0].message.text //msg สำหรับการ reply หรือเอาไปเก็บที่ data base
//     let lineUserId = req.body.events[0].source.userId
//     let typeMessage = req.body.events[0].source.type
//     let timestamp = req.body.events[0].timestamp //เวลาส่งไลน์
//     let mode =req.body.events[0].mode
//     let lineAdId =req.body.destination
//     // console.log('firebaseKey = ', firebaseKey.key());

//     // var messageListRef = firebase.database().ref('message_list');
//     // var newMessageRef = messageListRef.push();
//     // newMessageRef.set({
//     //   'user_id': 'ada',
//     //   'text': 'Example of text.'
//     // });
//     // var postID = newPostRef.key
//     // console.log('req  message= ',req.body.events[0].message)
//     // console.log('req source = ', req.body.events[0].source)
//     // console.log('body = ', req.body)
//     // reply(reply_token,reply_message)
//     // console.log('test ===', req)
//     writeLineData(reply_token,message,lineUserId,typeMessage,timestamp,mode,lineAdId)
//     // writeLineData(data)

//     res.sendStatus(200)
    res.send('test=')
    
    // console.log('test_message ===', test_message.text)
})

app.get('/', function (req, res) {
    res.send('Hello World!')
  })

// app.get('/getAllGroupLine', function (req, res) {
//     con.query("SELECT * FROM groupline where active = 1 ", function (err, result, fields) {
//         if (err) throw err;
//         // console.log(result);
//         res.json(result)
//       });
//  })



app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})


// insert Message Line
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
    // let reply_token = ''
    // let reply_message = req.body.message
    // let reply_to = req.body.sendTo
    // let destination = req.body.senderlineUserId
    // let reply_token : req.body.
    let data
    let reply_token = req.body.reply_token
    let message = req.body.message
    let lineUserId = req.body.lineUserId
    let typeMessage = req.body.typeMessage
    let vmod = req.body.lineAdId 
    let type = req.body.type
    let read = req.body.read 
    let createdAt = req.body.createdAt
    // console.log('req ==', req.body)

    data = {
        'reply_token' : reply_token,
        'message' : message,
        'lineUserId' : lineUserId,
        'typeMessage' : typeMessage,
        'vmod' : vmod,
        'type' : type,
        'read' : read,
        'createdAt' : createdAt
      }

    firestore.collection("lineMessage").doc().set({
      reply_token : reply_token,
      message : message,
      lineUserId : lineUserId,
      typeMessage : typeMessage,
      vmod : vmod,
      type : type,
      read : read,
      createdAt : createdAt
    })

    reply(data)
    
    res.sendStatus(200)

})

app.post("/getProfile",(req,res)=>{
  // console.log('test == req == ', req.body)
let userWeb = req.body.userWeb
let userWebdata =[]
let groupLinedata = []
let reqProfile =[]

firestore.collection("responsible").where('user','==',userWeb).onSnapshot((querySnapshot)=>{
  querySnapshot.forEach((doc) => {
    userWebdata.push(doc.data())
  })
  

  for (let index = 0; index < userWebdata.length; index++) {
    // console.log('test = ', data)
    firestore.collection("groupLine").where('groupLine_LineId','==',userWebdata[index].groupLine_UserId).onSnapshot((querySnapshot)=>{
      querySnapshot.forEach((doc) => {
        userWebdata.push({'data' : doc.data()})
        console.log('groupLinedata = ', userWebdata)
        // console.log('userWebdata = ', userWebdata)
    //     // data[index].push({'accessToken' : doc.data().groupLine_token})
      })
    })


  }

  for(let index = 0; index < userWebdata.length; index++){

  }

})
// res.send(req)
res.sendStatus(200)
})

app.post("/broadcast",(req,res)=>{
 let msg = "ทดสอบ บอร์ดแคส"
 broadcast(msg)
})

app.get("/testapi",(req,res)=>{
  let headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer rFAGe4VwQUA4972XjGQN1fTbtPEBAYp15hpo36+CpNezcj0+BBHI05gdRkefF0pQA3AwsU1Rz3vwZON0hJ12TAkiEWE8yHMD51YD+TkRWsBqHrmwYi+w/JkSenQcYZSybbPiAtJLOQfgGcoPfR2DGgdB04t89/1O/w1cDnyilFU='
}

  request.get({ //ดึงโปรไฟล์
    url: 'https://api.line.me/v2/bot/profile/U24f73bc2b54e8d62bf34b892e6d67500',
    headers: headers
   
}, (err, res, body) => {
  // res.json(body)
  // test.push(res)
    // console.log('body = ', test)
    console.log('respornc = ', JSON.parse(body))
})
})


function writeLineData(reply_token,message,lineUserId,typeMessage,timestamp,mode,lineAdId) {
  // console.log('log data = ', item)
  let checkMember = ''
  let checkgroup = []
    firestore.collection("lineMessage").doc().set({
      reply_token : reply_token,
      message : message,
      lineUserId : lineUserId,
      typeMessage : typeMessage,
      timestamp : timestamp,
        vmode : mode,
        lineAdId : lineAdId,
        type : 'in',
        read : 0,
        createdAt : (new Date().toLocaleString("tr-TR", { timeZone: "UTC" }))
        
    })


firestore.collection("memberLineGroup").where('lineUserId','==',lineUserId).onSnapshot((querySnapshot)=>{
      // let lineAccessToken ='';
      // let allData = [];
      let data = ''
      querySnapshot.forEach((doc) => {
        // checkMember.push(doc.data())
        data = doc.data().lineUserId
        // allData.push(doc.data())
        })
        // console.log('checkMember data1 =',checkMember)
        checkMember=data
        // console.log('test = ',checkMember)
        if(checkMember === '' ){
          console.log('status = true')
        firestore.collection("memberLineGroup").doc().set({
            lineUserId : lineUserId,
            lineAdId : lineAdId,
            active : 1 ,
            createdAt : (new Date().toLocaleString("tr-TR", { timeZone: "UTC" }))
          })
        }else console.log('status = false')
    })
    // console.log('checkMember data =',checkMember)
    // saveLineMember(lineUserId,lineAdId)
    // get and set Profile member
    // getAccessToken
    // firestore.collection("groupLine").where('groupLine_LineId','==',lineAdId).onSnapshot((querySnapshot)=>{
    //   let lineAccessToken ='';
    //   // let allData = [];
    //   querySnapshot.forEach((doc) => {
    //     lineAccessToken = doc.data().groupLine_token
    //     })
    //     // allData=data
    //     console.log('lineAccessToken data =',lineAccessToken)
    // })

}


// function saveLineMember(lineUserId,lineAdId) {
  // console.log('lineUserId = ', lineUserId)
  // console.log('lineAdId = ', lineAdId)

  // let lineAccessToken = ''
  // let userID = ''
  // let displyName = ''
  // let pictureUrl = ''
  // let statusLine = ''
  // let vlineAdId = lineAdId

  // console.log('vlineAdId= ', vlineAdId)
  // firestore.collection("groupLine").where('groupLine_LineId','==' , vlineAdId).onSnapshot((querySnapshot)=>{
  //   let data
  //     querySnapshot.forEach((doc) => {
  //       lineAccessToken = doc.data().groupLine_LineId
  //       })
  //       console.log('lineAccessToken data =',lineAccessToken)
  //   })


  //   let headers = {
  //     'Content-Type': 'application/json',
  //     'Authorization': 'Bearer '+lineAccessToken+''
  // }

  //   request.get({ //ดึงโปรไฟล์
  //     url: 'https://api.line.me/v2/bot/profile/'+lineUserId,
  //     headers: headers
     
  // }, (err, res, body) => {
  //     console.log('body = ', JSON.parse(body))
  //     // console.log('respornc = ' + res);
  //     userID = JSON.parse(body.userID)
  //     displyName = JSON.parse(body.displyName)
  //     pictureUrl = JSON.parse(body.pictureUrl)
  //     statusLine = JSON.parse(body.statusLine)

  // })

  // firestore.collection("lineMember").doc().set({
  //   lineUserId : userID,
  //   displyName : displyName,
  //   pictureUrl : pictureUrl,
  //   statusLine : statusLine,
  //   lineAdId : lineAdId
  // })
  
// }




function reply(data) {
  console.log('data = ', data)
    // const reply_token = '5c24c5b1b61a4516b30a83679c564c23'
    // const reply_message = 'ทดสอบยิง'
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+lineAccessToken+''
    }
    let body = JSON.stringify({
        // replyToken: reply_token,
        to: data.lineUserId,
        messages: [{
            type: 'text',
            text: data.message
        }]
    }) 
    // console.log('headers = ', headers)
    // console.log('body = ', body)

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

function test() {
  let test = [];
  // firestore.collection("groupLine").where('groupLine_LineId','==','U24f73bc2b54e8d62bf34b892e6d67500').onSnapshot((querySnapshot)=>{
  //   let lineAccessToken = '';
  //   // let allData = [];
  //   querySnapshot.forEach((doc) => {
  //     lineAccessToken = doc.data().groupLine_token
  //     })
  //     // allData=data
  //     console.log('test data =',lineAccessToken)
  // })

  let headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer rFAGe4VwQUA4972XjGQN1fTbtPEBAYp15hpo36+CpNezcj0+BBHI05gdRkefF0pQA3AwsU1Rz3vwZON0hJ12TAkiEWE8yHMD51YD+TkRWsBqHrmwYi+w/JkSenQcYZSybbPiAtJLOQfgGcoPfR2DGgdB04t89/1O/w1cDnyilFU='
}

  request.get({ //ดึงโปรไฟล์
    url: 'https://api.line.me/v2/bot/profile/U24f73bc2b54e8d62bf34b892e6d67500',
    headers: headers
   
}, (err, res, body) => {
  // res.json(body)
  test.push(res)
    // console.log('body = ', test)
    console.log('respornc = ', res.body);
})
  
  // console.log('test data ',this.messageByUser.sort())
}








