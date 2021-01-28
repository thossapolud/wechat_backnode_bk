const express = require('express')
const app = express()
const request = require('request')
const lineAccessToken = "rFAGe4VwQUA4972XjGQN1fTbtPEBAYp15hpo36+CpNezcj0+BBHI05gdRkefF0pQA3AwsU1Rz3vwZON0hJ12TAkiEWE8yHMD51YD+TkRWsBqHrmwYi+w/JkSenQcYZSybbPiAtJLOQfgGcoPfR2DGgdB04t89/1O/w1cDnyilFU="
const firebase = require('firebase')
const mysql = require('mysql'); 

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

  
var con = mysql.createConnection({ //mysql
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'wechat',
    port : '3306',
})

con.connect((err)=>{
if(err){
    console.log('Error connect to Db', err)
    return 
}
console.log('Connection success')
})
  
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
    let data
    let reply_token = req.body.events[0].replyToken //ส่งกลับไปยัง user ที่ไลน์เข้ามา
    let message = req.body.events[0].message.text //msg สำหรับการ reply หรือเอาไปเก็บที่ data base
    let lineUserId = req.body.events[0].source.userId
    let typeMessage = req.body.events[0].source.type
    let timestamp = req.body.events[0].timestamp //เวลาส่งไลน์
    let mode =req.body.events[0].mode
    let lineAdId =req.body.destination


    // console.log('req = ',req.body.events[0].message)
    console.log('req body = ', req.body)
    // console.log('reply_token = ', reply_token)
    // reply(reply_token,reply_message)
    writeLineData(reply_token,message,lineUserId,typeMessage,timestamp,mode,lineAdId)
    // writeLineData(data)

    res.sendStatus(200)
    // res.send('test=')
    console.log('test ===', req.body.events)
    // console.log('test_message ===', test_message.text)
})

app.get('/', function (req, res) {
    res.send('Hello World!')
  })

app.get('/getAllGroupLine', function (req, res) {
    con.query("SELECT * FROM groupline where active = 1 ", function (err, result, fields) {
        if (err) throw err;
        // console.log(result);
        res.json(result)
      });
 })


 //----- group line

 app.post('/setGroupLine', function(req,res){
  //  res.send('test')
  let groupline_lineid = req.body.groupline_lineid
  let groupline_secret = req.body.groupline_secret
  let groupline_name = req.body.groupline_name
  let groupline_token = req.body.groupline_token
  let url = req.body.url
  let groupline_chatcolor = req.body.groupline_chatcolor
  let groupline_textcolor = req.body.groupline_textcolor
  let groupline_rich_menu_a = req.body.groupline_rich_menu_a
  let groupline_rich_menu_b = req.body.groupline_rich_menu_b
  let groupline_itf_auth = req.body.groupline_itf_auth
  let groupline_url = req.body.groupline_url
  let s_token = req.body.s_token

  let vinsert = "INSERT INTO `groupline`( `groupline_lineid`, `groupline_secret`, `groupline_name`, `groupline_token`, `url`, `groupline_chatcolor`, `groupline_textcolor`, `groupline_rich_menu_a`, `groupline_rich_menu_b`, `groupline_itf_auth`, `groupline_url`, `s_token`)"
  let vvalue = "VALUES ('"+req.body.groupline_lineid+"','"+req.body.groupline_secret+"','"+req.body.groupline_name+"','"+req.body.groupline_token+"','"+req.body.url+"','"+req.body.groupline_chatcolor+"','"+req.body.groupline_textcolor+"','"+req.body.groupline_rich_menu_a+"','"+req.body.groupline_rich_menu_b+"','"+req.body.groupline_itf_auth+"','"+req.body.groupline_url+"','"+req.body.s_token+"')"
  let queryString = vinsert+" "+vvalue
  console.log('test === ', req.body)
  // console.log('test == ', vinsert+" "+vvalue);

  con.query(queryString, (err, results) => {
    if (err) {
     return res.sendStatus(500)
     console.log('success')
    }
    // res.send(`Solution = ${results.message}`)
    res.end(JSON.stringify(results))
    console.log('success')
   })
 })


app.post('/updateGroupLine', function(req,res){
  console.log('req = ',req.body)
  // res.send('test')
  let queryString = "UPDATE `groupline` SET `groupline_lineid`= '"+req.body.groupline_lineid+" ',`groupline_secret`='"+req.body.groupline_secret+"',`groupline_name`='"+req.body.groupline_name+"',`groupline_token`='"+req.body.groupline_token+"',`url`='"+req.body.url+"',`groupline_chatcolor`='"+req.body.groupline_chatcolor+"',`groupline_textcolor`='"+req.body.groupline_textcolor+"',`groupline_rich_menu_a`='"+req.body.groupline_rich_menu_a+"',`groupline_rich_menu_b`='"+req.body.groupline_rich_menu_b+"',`groupline_itf_auth`='"+req.body.groupline_itf_auth+"',`groupline_url`='"+req.body.groupline_url+"',`s_token`='"+req.body.s_token+"' WHERE `groupline_id`='"+req.body.groupline_id+"'"
  
  con.query(queryString, (err, results) => {
    if (err) {
     return res.sendStatus(500)
     console.log('success')
    }
    // res.send(`Solution = ${results.message}`)
    res.end(JSON.stringify(results))
    console.log('success')
   })
   
})

app.post('/deleteGroupLine', function(req,res){
let queryString = "UPDATE `groupline` SET `active`= 0 WHERE groupline_id = '"+req.body.groupline_id+"' "

con.query(queryString, (err, results) => {
  if (err) {
   return res.sendStatus(500)
  }
  // res.send(`Solution = ${results.message}`)
  res.end(JSON.stringify(results))
  console.log('success')
 })
})

//------- Manage User

app.get('/getAllUser', function (req, res) {
  con.query("SELECT * FROM user WHERE active = 1", function (err, result, fields) {
      if (err) throw err;
      // console.log(result);
      res.json(result)
    });
})

app.post('/insertUser', function(req,res){
  console.log('log == ', req.body)
let queryString = "INSERT INTO `user`( `username`, `password`, `user_group`) VALUES ('"+req.body.username+"','"+req.body.password+"','"+req.body.user_group+"')"
con.query(queryString, (err, results) => {
  if (err) {
   return res.sendStatus(500)
  }
  // res.send(`Solution = ${results.message}`)
  res.end(JSON.stringify(results))
  console.log('success')
 })
})


app.post('/updatePasswordUser', function(req,res){
  console.log('log == ', req.body)
let queryString = "UPDATE `user` SET password = '"+req.body.password+"' WHERE user_id = '"+req.body.user_id+"'"
con.query(queryString, (err, results) => {
  if (err) {
   return res.sendStatus(500)
  }
  // res.send(`Solution = ${results.message}`)
  res.end(JSON.stringify(results))
  console.log('success')
 })
})

app.post('/deleteUser',(req,res)=>{
  let queryString = "UPDATE `user` SET `active`= 0 WHERE user_id = '"+req.body.userId+"' "

  con.query(queryString, (err, results) => {
    if (err) {
     return res.sendStatus(500)
    }
    // res.send(`Solution = ${results.message}`)
    res.end(JSON.stringify(results))
    console.log('success')
   })
})

    // responsible


app.get("/getAllResponsible",(req,res)=>{
  console.log('test == ', req.body)
  let queryString = "SELECT groupline_responsible.id, groupline_responsible.groupline_id ,groupline.groupline_name ,groupline_responsible.user_id, user.username   FROM `groupline_responsible` LEFT JOIN groupline ON groupline_responsible.groupline_id = groupline.groupline_id LEFT JOIN user on groupline_responsible.user_id = user.user_id"
  con.query(queryString, (err, result) => {
    if (err) throw err;
    // console.log(result);
    res.json(result)
  })
})

app.post("/getAllResponsibleByGroup",(req,res)=>{ //req groupline_responsible.groupline_id
  console.log('test == ', req.body)
  let queryString = "SELECT groupline_responsible.id, groupline_responsible.groupline_id ,groupline.groupline_name ,groupline_responsible.user_id, user.username   FROM `groupline_responsible` LEFT JOIN groupline ON groupline_responsible.groupline_id = groupline.groupline_id LEFT JOIN user on groupline_responsible.user_id = user.user_id WHERE groupline_responsible.groupline_id='"+req.body.groupline_id+"'"
  con.query(queryString, (err, result) => {
    if (err) throw err;
    // console.log(result);
    res.json(result)
  })
})

app.post("/getAllResponsibleByUser",(req,res)=>{ //req groupline_responsible.groupline_id
  console.log('test == ', req.body)
  let queryString = "SELECT groupline_responsible.id, groupline_responsible.groupline_id ,groupline.groupline_name ,groupline_responsible.user_id, user.username   FROM `groupline_responsible` LEFT JOIN groupline ON groupline_responsible.groupline_id = groupline.groupline_id LEFT JOIN user on groupline_responsible.user_id = user.user_id WHERE groupline_responsible.user_id ='"+req.body.user_id+"'"
  con.query(queryString, (err, result) => {
    if (err) throw err;
    // console.log(result);
    res.json(result)
  })
})

app.post("/insertResponsible",(req,res)=>{
  console.log('test == ', req.body)
  let queryString = "INSERT INTO `groupline_responsible`(`groupline_id`, `user_id`) VALUES ('"+req.body.groupline_id+"','"+req.body.user_id+"')"
  con.query(queryString, (err, results) => {
    if (err) {
     return res.sendStatus(500)
    }
    // res.send(`Solution = ${results.message}`)
    res.end(JSON.stringify(results))
    console.log('success')
   })
})




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

app.post("/broadcast",(req,res)=>{
 let msg = "ทดสอบ บอร์ดแคส"
 broadcast(msg)
})

app.post("/testapi",(req,res)=>{
    console.log('test', req.body)
})


function writeLineData(reply_token,message,lineUserId,typeMessage,timestamp,mode,lineAdId) {
  // console.log('log data = ', item)
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
        createdAt : new Date()
        
    })
}


function reply(data) {
  console.log('data = ', data)
    // const reply_token = '5c24c5b1b61a4516b30a83679c564c23'
    // const reply_message = 'ทดสอบยิง'
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer rFAGe4VwQUA4972XjGQN1fTbtPEBAYp15hpo36+CpNezcj0+BBHI05gdRkefF0pQA3AwsU1Rz3vwZON0hJ12TAkiEWE8yHMD51YD+TkRWsBqHrmwYi+w/JkSenQcYZSybbPiAtJLOQfgGcoPfR2DGgdB04t89/1O/w1cDnyilFU="'
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



