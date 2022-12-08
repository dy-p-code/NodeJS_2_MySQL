const jwt = require("jsonwebtoken");
const { User } = require("../models");

module.exports = (req, res, next) => {

  
  const { authorization } = req.cookies;
  
  const [authType, authToken] = (authorization || "").split("%");
  try{
  if (authToken && authType === "Bearer") {    
    const { userId } = jwt.verify(authToken, process.env.SECRET);
    User.findByPk(userId).then((user) => {
      if(user){
        console.log(user)
        res.status(401).send({errorMessage: "이미 로그인이 되어있습니다."});
      } 
    });
    return;
  }  
    next();
  } 
  catch (error){
    console.log(error)
    if(error.message === 'jwt expired'){
      next();
    } else {
    res.status(400).send({errorMessage: "데이터의 형식이 올바르지 않습니다."})}
  }
};