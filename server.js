const express = require('express')
const app = express()
const request = require('request')
const lineAccessToken = "rFAGe4VwQUA4972XjGQN1fTbtPEBAYp15hpo36+CpNezcj0+BBHI05gdRkefF0pQA3AwsU1Rz3vwZON0hJ12TAkiEWE8yHMD51YD+TkRWsBqHrmwYi+w/JkSenQcYZSybbPiAtJLOQfgGcoPfR2DGgdB04t89/1O/w1cDnyilFU="
const firebase = require('firebase')
const imageToBase64 = require('image-to-base64');
// const mysql = require('mysql'); 
const mysql = require('mysql');
const firebaseKey = require("firebase-key");
const axios = require('axios');
var port = process.env.PORT || 8000
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
  const fs = require('fs')
  


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
app.post('/webhook', async (req, res) => {
  // let checkData = []
  // checkData = req.body.events
  // console.log('req =', req)
  console.log('data = ', req.body.events.length)
  if(req.body.events.length === 0){
    console.log('true')
    res.send('test')
  }else if(req.body.events.length >= 1){
    writeLineData(req.body.events[0],req.body.destination)
    insertGuoupLine(req.body.destination,req.body.events[0].message.text)
    res.json({'message':'success'})
    // }
    
  }
    
})

app.get('/', function (req, res) {
    res.send('Hello World!')
  })

app.post('/multicast', (req, res) => {
  try{
console.log('log = ', req.body)
let data = req.body
lineMulticast(data)
res.json({message : 'success'})
}catch(err){
  res.json({message : err})
}
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

app.post("/reply",(req,res)=>{ // นำ reply_token ที่ได้ไปเก็บใน Firebase จากนั้นทำการกำหนด reply_message ส่งกลับไป ส่งได้ 5 message ต่อ 1 Token
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

app.get("/getphoto",(req,res)=>{
  const headers = {
    // 'Content-Type': 'multipart/form-data',
    'Authorization': 'Bearer rFAGe4VwQUA4972XjGQN1fTbtPEBAYp15hpo36+CpNezcj0+BBHI05gdRkefF0pQA3AwsU1Rz3vwZON0hJ12TAkiEWE8yHMD51YD+TkRWsBqHrmwYi+w/JkSenQcYZSybbPiAtJLOQfgGcoPfR2DGgdB04t89/1O/w1cDnyilFU='
  }
 let data = null
     axios.get('https://api-data.line.me/v2/bot/message/13573457833197/content',{headers}).then(response => {
      console.log('response = ', response)
      // fs.writeFile('/desktop', 'abc', function (err,data) {
      //   if (err) {
      //     return console.log(err);
      //   }
      //   console.log(data);
      // });
      // console.log('base64 = ',Buffer.from(response.data).toString('base64'))
      res.json({'data' : Buffer.from(response.data).toString('base64')})
      // res.json({'data' : Buffer.from(response.data).toString('base64'))
     
      // var metadata = {
      //   contentType: 'image/jpeg',
      // };
      
      // Upload the file and metadata
      // var uploadTask = storageRef.child('images/mountains.jpg').put(response.data, metadata);
      //   }).catch(function (error) {
      //     console.log('error =' , error);
      //     // res.json(error, error.message)
      //     errormsg = error.message
      //     // res.json({'errormsg' : errormsg})
      //   })
  })
  
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
    res.json({'profile' : profile})
  } catch (error) {
    console.error(error);
  }
  })

  app.get("/test",(req,res)=>{
    res.send({'test' : 'test'})
  })



app.post("/broadcast",(req,res)=>{
 let msg = "ทดสอบ บอร์ดแคส"
 broadcast(msg)
})

// function writeLineData(reply_token,message,lineUserId,typeMessage,timestamp,mode,lineAdId,msgarray) { //เก็บข้อมูลของ message
async function writeLineData(msgarray,vlineAdId) { //เก็บข้อมูลของ message
  // console.log('log data = ', msgarray) 
  // let checkMember = ''
  // let checkgroup = []

  if(msgarray.message.type === 'sticker'){
      console.log('sticker')
      console.log('log = ',msgarray )

      // let headers = {
      //   'Content-Type': 'application/json',
      //   'Authorization': 'Bearer rFAGe4VwQUA4972XjGQN1fTbtPEBAYp15hpo36+CpNezcj0+BBHI05gdRkefF0pQA3AwsU1Rz3vwZON0hJ12TAkiEWE8yHMD51YD+TkRWsBqHrmwYi+w/JkSenQcYZSybbPiAtJLOQfgGcoPfR2DGgdB04t89/1O/w1cDnyilFU='
      // }
      // let replyBody = JSON.stringify({
      //   replyToken: msgarray.replyToken,
      //   messages: [{
      //       type: 'text',
      //       text: 'https://stickershop.line-scdn.net/stickershop/v1/sticker/'+msgarray.message.stickerId+'/iPhone/sticker@2x.png'
      //   }]
      // }) 
    //   axios.post('https://api.line.me/v2/bot/message/reply',replyBody,{headers}).then(response => {
    // console.log('test ')
    //   })
    firestore.collection("lineMessage").doc().set({
      reply_token : msgarray.replyToken,
      message : 'https://stickershop.line-scdn.net/stickershop/v1/sticker/'+msgarray.message.stickerId+'/iPhone/sticker@2x.png',
      lineUserId : msgarray.source.userId,
      typeMessage : msgarray.message.type,
      timestamp : msgarray.timestamp,
        vmode : msgarray.mode,
        lineAdId : vlineAdId,
        type : 'in',
        read : 0,
        createdAt : (new Date().toLocaleString("tr-TR", { timeZone: "UTC" }))
    })
      

    }else if(msgarray.message.type === 'text'){
      console.log('text')

    firestore.collection("lineMessage").doc().set({
          reply_token : msgarray.replyToken,
          message : msgarray.message.text,
          lineUserId : msgarray.source.userId,
          typeMessage : msgarray.message.type,
          timestamp : msgarray.timestamp,
            vmode : msgarray.mode,
            lineAdId : vlineAdId,
            type : 'in',
            read : 0,
            createdAt : (new Date().toLocaleString("tr-TR", { timeZone: "UTC" }))
        })

        firestore.collection("memberLineGroup").where('lineUserId','==',msgarray.source.userId).onSnapshot((querySnapshot)=>{
      let data = ''
      let index = ''
      querySnapshot.forEach((doc) => {
        // checkMember.push(doc.data())
        data = doc.data().lineUserId
        index = doc.id
        // allData.push(doc.data())
        })
        // console.log('checkMember data1 =',checkMember)
        checkMember=data
        // console.log('test = ',checkMember)
        if(checkMember === '' ){
          console.log('status = true')
        firestore.collection("memberLineGroup").doc().set({
                    lineUserId : msgarray.source.userId,
                    lineAdId : vlineAdId,
                    active : 1 ,
                    createdAt : (new Date().toLocaleString("tr-TR", { timeZone: "UTC" })),
                    latestMsg : (new Date().toLocaleString("tr-TR", { timeZone: "UTC" })),
                    lastMsg : msgarray.message.text
                  })
                }else firestore.collection("memberLineGroup").doc(index).update({
                  latestMsg : (new Date().toLocaleString("tr-TR", { timeZone: "UTC" })),
                  lastMsg : msgarray.message.text
              })
              console.log('status = false')
            })

    }else if(msgarray.message.type === 'image'){
      console.log('image')
      console.log('image = ',msgarray )
      firestore.collection("lineMessage").doc().set({
        reply_token : msgarray.replyToken,
        message :'https://api-data.line.me/v2/bot/message/'+msgarray.message.id+'/content',
        lineUserId : msgarray.source.userId,
        typeMessage : msgarray.message.type,
        timestamp : msgarray.timestamp,
          vmode : msgarray.mode,
          lineAdId : vlineAdId,
          type : 'in',
          read : 0,
          createdAt : (new Date().toLocaleString("tr-TR", { timeZone: "UTC" }))
      })
    }
}

async function insertGuoupLine(lineAdId,message) {
  let docId = ''
  let groupLineName = ''
  let lineAtID = ''
  const checkGroup = await firestore.collection("groupLine").where('lineAtID','==',message).onSnapshot((querySnapshot)=>{
    querySnapshot.forEach((doc) => {
      // console.log('data = ',doc.data)
      docId = doc.id
      groupLineName = doc.data().groupLine_name
      lineAtID = doc.data().lineAtID

      // data = doc.data().groupLine_name
    })
    // console.log('docId = ', docId)
    // console.log('groupLineName = ', groupLineName)
    if(lineAtID === message){
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
// function lineMulticast(userID,accessToken) {
function lineMulticast(data) {
  console.log('data = ', data)
  let headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer '+data.groupToken+''
  }
  let pushBody = JSON.stringify({
    to: data.SelectlineMember,
    messages: [{
        type: 'text',
        text: data.message
    }]
  }) 

  // console.log('userID = ',userID)

  // res.json({data : userID})
  axios.post('https://api.line.me/v2/bot/message/multicast',pushBody,{headers}).then(response => {
        console.log('Push response = ', response.status)
        firestore.collection("broadcast").doc().set({
                              'groupToken' : data.groupToken,
                                'message'  : data.message,
                        'SelectlineMember' : data.SelectlineMember,
                        'createdAt' : (new Date().toLocaleString("tr-TR", { timeZone: "UTC" }))
                    })     

      }).catch(err =>{
        console.log('statusCode =',err.response.status)
        console.log('statusMessage =',err.response.data.message)
        console.log('Push test catch ')
      })
      res.json({message : 'success'})
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








