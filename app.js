const express = require("express");
const app = express()
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const cookieParser = require("cookie-parser")
app.use(cookieParser());


require('dotenv').config();


app.use('/api/posts', require('./routes/posts'))
app.use('/api/comments', require('./routes/comment'))
app.use('/api/users', require('./routes/users'))
app.use('/api/likes', require('./routes/like'))

app.listen(process.env.PORT, ()=> {
  console.log(process.env.PORT, '포트로 서버가 열렸습니다.')
})

app.get('/', (req,res) => {
  res.send("hello world")
})