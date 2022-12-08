const express = require("express");
const auth = require("../middleWares/auth-middleware");

const { Op } = require("sequelize");
const { Posts, Likes, User } = require("../models")

const router = express.Router();


// [전체 게시물 조회 API]

router.get('/', async (req,res) => {

  try{
    const posts = await Posts.findAll({
      include: [{
        model : User,
        attributes : ['nickname']
      }],
      order: [['updatedAt', 'desc']]
    })

    if(posts.length === 0){
      return res.status(200).json({message: "게시글 내용을 작성해주세요."})
    }

    const results =  await Promise.all(posts.map( async (posts)=> {

    const count = await Likes.count({
      where: {
        [Op.or] : [{ postId : posts.postId }]
      }
    })
      return {
        postId : posts.postId,
        userId : posts.userId,
        nickname : posts.User.nickname,
        title : posts.title,
        like : count,
        createdAt : posts.createdAt,       
        updatedAt : posts.updatedAt
      }
    }))

    res.json({
      data :  results

    })} catch (error){
      console.log(error)
      res.status(400).json({errorMessage: "게시글 조회을 조회할 수 없습니다."})
    }
})


// [게시물 상세 조회 API] 

router.get('/:Id', async (req,res) => {
  
  let { Id } = req.params;

  try{
  const posts = await Posts.findAll({
    where: {
      [Op.or] : [{postId : Id}]
    },
    include: [{
      model : User,
      attributes : ['nickname']
    }]
  })

  if(posts.length === 0 ) {
    return res.status(400).json({message: "게시글이 존재하지 않습니다." })
  } else {

  const results =  await Promise.all(posts.map( async (posts)=> {

  const count = await Likes.count({
    where: {
      [Op.or] : [{ postId : posts.postId }]
    }
  })
    return {
      postId : posts.postId,
      userId : posts.userId,
      nickname : posts.User.nickname,
      title : posts.title,
      content : posts.content,
      like : count,
      createdAt : posts.createdAt,
      updatedAt : posts.updatedAt
    }
  }))

  res.json({
    data : results
  
  })}} catch (error) {
    console.log(error)
    res.status(400).json({errorMessage: "게시글 조회을 조회할 수 없습니다."})
  }
})


// [게시물 작성 API] 

router.post('/', auth, async (req, res) => {

  try{
    if(req.body.title === undefined || req.body.content === undefined || req.body.title.length === 0 || req.body.content.length === 0 ){
      return res.status(412).json({errorMessage: "데이터의 형식이 올바르지 않습니다.."})
    }

  await Posts.create({
    title : req.body.title, 
    content : req.body.content, 
    userId : res.locals.user.userId, 
    nickname :res.locals.user.nickname  
  })
  
  res.status(201).json({message: "게시글을 작성하였습니다."})

  } catch(error){
    console.log(error.message)
    res.status(400).json({errorMessage: "게시글 작성을 작성할 수 없습니다."})
  }
})


// [게시물 수정 API]

router.put('/:Id', auth, async (req,res) => {

  try {
    let { Id } = req.params;

    const posts = await Posts.findOne({
    where: {
      [Op.or] : [{postId : Id}]
    },
    include: [{
      model : User,
      attributes : ['nickname']
    }]
  })
     
    if(posts === null ) {
      return res.status(404).json({message: "게시글 조회할 수 없습니다."})
    }

    if(res.locals.user.userId !== posts.userId) {
      return res.status(412).json({errorMessage : "게시글을 작성할 수 없습니다."})
    }
    
    if(req.body.content === undefined && req.body.title === undefined){
      return res.status(400).json({errorMessage: "데이터 형식이 올바르지 않습니다."})
    }

    if(posts.title === req.body.title && posts.content === req.body.content){
      return res.status(400).json({message: "게시글을 변경할 수 없습니다."})
    }
    
    await Posts.update({title : req.body.title, content : req.body.content}, {where: {postId : Id}});
   
  res.json({ message: "게시물을 수정하였습니다."})

  } catch (error){
    console.log(error)
    res.status(400).json({errorMessage: "게시글 수정에 실패하였습니다."})
  }
})


// [게시물 삭제 API]

router.delete('/:Id', auth, async (req,res) => {

  let { Id } = req.params

  try{
    const posts = await Posts.findOne({
      where: {
        [Op.or] : [{postId : Id}]
      }
    })
 
  if(posts === null ) {
    return res.status(404).json({message: "게시글 조회할 수 없습니다."})
  }

  if(res.locals.user.userId !== posts.userId) {
    return res.status(412).json({errorMessage : "게시글 작성을 작성할 수 없습니다."})
  }
  
  if([posts].length > 0){
    await Posts.destroy({
      where: {postId : Id }
    })
  }

  res.json({message : "게시물을 삭제하였습니다."})

} catch(error) {
  console.log(error)
  res.status(400).json({errorMessage: "게시글 삭제에 실패하였습니다."})
 }
})


module.exports = router;