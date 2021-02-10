const express = require('express')
const app = express()
const request = require('request')
const lineAccessToken = "rFAGe4VwQUA4972XjGQN1fTbtPEBAYp15hpo36+CpNezcj0+BBHI05gdRkefF0pQA3AwsU1Rz3vwZON0hJ12TAkiEWE8yHMD51YD+TkRWsBqHrmwYi+w/JkSenQcYZSybbPiAtJLOQfgGcoPfR2DGgdB04t89/1O/w1cDnyilFU="
const firebase = require('firebase')
// const mysql = require('mysql'); 
const firebaseKey = require("firebase-key");
const axios = require('axios');
var port = process.env.PORT || 3000
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
const { response } = require('express')
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
    let data
    let reply_token = req.body.events[0].replyToken //ส่งกลับไปยัง user ที่ไลน์เข้ามา
    let message = req.body.events[0].message.text //msg สำหรับการ reply หรือเอาไปเก็บที่ data base
    let lineUserId = req.body.events[0].source.userId
    let typeMessage = req.body.events[0].source.type
    let timestamp = req.body.events[0].timestamp //เวลาส่งไลน์
    let mode =req.body.events[0].mode
    let lineAdId =req.body.destination
    // console.log('firebaseKey = ', firebaseKey.key());

    // var messageListRef = firebase.database().ref('message_list');
    // var newMessageRef = messageListRef.push();
    // newMessageRef.set({
    //   'user_id': 'ada',
    //   'text': 'Example of text.'
    // });
    // var postID = newPostRef.key
    console.log('webhook replyToken= ',req.body.events[0].replyToken)
    // console.log('req source = ', req.body.events[0].source)
    // console.log('body = ', req.body)
    // testReply(reply_token,message)
    // console.log('test ===', req)
    writeLineData(reply_token,message,lineUserId,typeMessage,timestamp,mode,lineAdId)
    insertGuoupLine(lineAdId,message)
    // writeLineData(data)

    res.sendStatus(200)
//     res.send('test=')
    
    // console.log('test_message ===', test_message.text)
})

app.get('/', function (req, res) {
    res.send('Hello World!')
  })



// app.listen(3000, function () {
//   console.log('Example app listening on port 3000!')
// })

app.listen(port, function() {
  console.log("App is running on port " + port);
});


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
    let data
    let reply_token = req.body.reply_token
    let message = req.body.message
    let lineUserId = req.body.lineUserId
    let typeMessage = req.body.typeMessage
    let vmod = req.body.lineAdId 
    let type = req.body.type
    let read = req.body.read 
    let createdAt = req.body.createdAt
    let accessToken = req.body.accessToken
    console.log('req ==', req.body)

    data = {
        'reply_token' : reply_token,
        'accessToken' : accessToken,
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
      accessToken : accessToken,
      message : message,
      lineUserId : lineUserId,
      typeMessage : typeMessage,
      vmod : vmod,
      type : type,
      read : read,
      createdAt : createdAt
    })

    replyDev(data)
    
    res.sendStatus(200)

})

app.post("/getProfile1", async (req,res)=>{
  // console.log('test == req == ', req.body)
let userWeb = req.body.userWeb
let userWebdata =[]

const test = await firestore.collection("responsible").where('user','==',userWeb).get()
test.forEach(doc => {
  if (doc.data().active === 1) {
    userWebdata.push(doc.data())
  }
})

for (let index = 0; index < userWebdata.length; index++) { //หา body ของ group line
  // console.log('test = ', data)
  let response = await firestore.collection("groupLine").where('groupLine_LineId','==',userWebdata[index].groupLine_UserId).get()
  response.forEach(doc => {
    Object.assign(userWebdata[index], {'groupLineBody' : doc.data()})
  })
  
  let response2 = await firestore.collection("memberLineGroup").where('lineAdId','==',userWebdata[index].groupLine_UserId).get()
  let member =[]
  response2.forEach(doc => {
    // Object.assign(userWebdata[index], {'member' : [doc.data()]})
    if(userWebdata[index].groupLine_UserId === doc.data().lineAdId){
      member.push(doc.data())
    }
    Object.assign(userWebdata[index], {'member' : [member]})
   
    // console.log(doc.data())
  })
}
// res.json({data: member})
res.json(userWebdata)
})



app.post("/getProfile", async (req,res)=>{
  let profile = []
  let headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer '+req.body.lineToken
  }
  try {
    const response = await axios.get('https://api.line.me/v2/bot/profile/'+req.body.lineUserId,{headers})
    console.log(response.data);
    profile = response.data
  } catch (error) {
    console.error(error);
  }
  res.json({'profile' : profile})
  })

  app.get("/test",(req,res)=>{
    res.send({'test' : 'test'})
  })



app.post("/broadcast",(req,res)=>{
 let msg = "ทดสอบ บอร์ดแคส"
 broadcast(msg)
})

// app.get("/testapi",(req,res)=>{
// //   let headers = {
// //     'Content-Type': 'application/json',
// //     'Authorization': 'Bearer rFAGe4VwQUA4972XjGQN1fTbtPEBAYp15hpo36+CpNezcj0+BBHI05gdRkefF0pQA3AwsU1Rz3vwZON0hJ12TAkiEWE8yHMD51YD+TkRWsBqHrmwYi+w/JkSenQcYZSybbPiAtJLOQfgGcoPfR2DGgdB04t89/1O/w1cDnyilFU='
// // }

// //   request.get({ //ดึงโปรไฟล์
// //     url: 'https://api.line.me/v2/bot/profile/U24f73bc2b54e8d62bf34b892e6d67500',
// //     headers: headers
   
// // }, (err, res, body) => {
// //   // res.json(body)
// //   // test.push(res)
// //     // console.log('body = ', test)
// //     console.log('respornc = ', JSON.parse(body))
// // })

// })




async function writeLineData(reply_token,message,lineUserId,typeMessage,timestamp,mode,lineAdId) { //เก็บข้อมูลของ message
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
}

async function insertGuoupLine(lineAdId,message) {
  let docId = ''
  let groupLineName = ''
  const checkGroup = await firestore.collection("groupLine").where('groupLine_name','==',message).onSnapshot((querySnapshot)=>{
    querySnapshot.forEach((doc) => {
      // console.log('data = ',doc.data)
      docId = doc.id
      groupLineName = doc.data().groupLine_name
      // data = doc.data().groupLine_name
    })
    // console.log('docId = ', docId)
    // console.log('groupLineName = ', groupLineName)
    if(groupLineName === message){
      firestore.collection("groupLine").doc(docId).update({
        groupLine_LineId : lineAdId
      })
    }else console.log('log no result')
  })
}






function reply(data) {
  console.log('data = ', data)
    // const reply_token = '5c24c5b1b61a4516b30a83679c564c23'
    // const reply_message = 'ทดสอบยิง'
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+lineAccessToken+''
    }
    let body = JSON.stringify({
        replyToken: reply_token,
        // to: data.lineUserId,
        messages: [{
            type: 'text',
            text: data.message
        }]
    }) 
    // console.log('headers = ', headers)
    // console.log('body = ', body)

    request.post({
        url: 'https://api.line.me/v2/bot/message/reply',
        // url: 'https://api.line.me/v2/bot/message/push',
        headers: headers,
        body: body
       
    }, (err, res, body) => {
        // console.log('body = ', body)
        console.log('status = ' + res.statusCode);
    })

    //
}

function replyDev(data) {
  console.log('data = ', data)
  let headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer '+data.accessToken+''
  }
  let replyBody = JSON.stringify({
    replyToken: data.reply_token,
    messages: [{
        type: 'text',
        text: data.message
    }]
  }) 
  let pushBody = JSON.stringify({
    to: data.lineUserId,
    messages: [{
        type: 'text',
        text: data.message
    }]
  }) 
  console.log('reply token = ', data.reply_token)
  axios.post('https://api.line.me/v2/bot/message/reply',replyBody,{headers}).then(response => {
    console.log('Reply response = ', response.status)

  }).catch(err =>{
    console.log('Reply statusCode =',err.response.status)
    console.log('statusMessage =',err.response.data.message)
    // console.log('err = ',err)
    // statusCode: 401,
    //   statusMessage: 'Unauthorized',
    axios.post('https://api.line.me/v2/bot/message/push',pushBody,{headers}).then(response => {
        console.log('Push response = ', response.status)

      }).catch(err =>{
        console.log('statusCode =',err.response.status)
        // console.log('statusMessage =',err.response.data.message)
        // console.log('err = ',err)
        // statusCode: 401,
        //   statusMessage: 'Unauthorized',
        console.log('statusMessage =',err.response.data.message)
        console.log('Push test catch ')
      })
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

}








