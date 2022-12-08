const express = require("express");
const auth = require("../middleWares/auth-middleware");

const { Op } = require("sequelize");
const { User, Posts, Comments } = require("../models");

const router = express.Router();


// [댓글 작성 API]  

router.post('/:Id', auth, async (req, res) => {
  
  let { Id } = req.params

  try{
    const posts = await Posts.findAll({
      where: {
        [Op.or] : [{postId : Id}]
      }
    })

    if(posts.length === 0 ) {
      return res.status(404).json({message: "게시글 조회을 조회할 수 없습니다."})
    }

    if(req.body.content === undefined || req.body.content.length === 0){
      return res.status(400).json({message : "댓글 내용을 입력해주세요."})
    }

    const postId  = req.params.Id
    const content = req.body.content

    await Comments.create({ 
      postId : postId, userId : res.locals.user.userId, content : content
    })

    res.status(201).json({message : "댓글이 작성하였습니다."})

    } catch(error) {
      console.log(error)
      res.status(400).json({errorMessage: "댓글 작성에 실패하였습니다."})
    }

})


// [댓글 목록 조회 API]

router.get('/:Id', async (req,res) => {

  let { Id } = req.params

  try {
    const posts = await Posts.findOne({
      where: {
      [Op.or] : [{postId : Id}] 
      },
      order: [['createdAt', 'desc']]
    })

    if(posts === null ) {
      return res.status(404).json({message: "게시글 조회을 조회할 수 없습니다."})
    }

    const Comment = await Comments.findAll({
      where : {
        [Op.or] : [{postId : Id}]
      },
      include: [{
        model : User,
        attributes : ['nickname']
      }] 
    })

    if(Comment.length === 0 ) {
      return res.status(404).json({message: "댓글을 조회할 수 없습니다."})
    }

    const results = Comment.map((Comments) => {
      return {
        CommentsId: Comments.commentId,      
        userId : Comments.userId,
        nickname : Comments.User.nickname,    
        content: Comments.content,     
        createdAt: Comments.createdAt
      }  
    })
      res.json({data : results})

    } catch (error) {
      res.status(500).json(error)
    }
})


// [댓글 수정 API]

router.put('/:CommentsId',auth, async (req,res) => {

  let { CommentsId } = req.params

  try {
    const comments = await Comments.findOne({
      where: {
        [Op.or] : [{CommentsId : CommentsId}]
      }
    })
    
    if(comments === null){
      return res.status(404).json({message : "댓글을 조회할 수 없습니다."})
    }

    if(res.locals.user.userId !== comments.userId) {
      return res.status(412).json({errorMessage : "댓글을 작성을 작성할 수 없습니다."})
    }

    if(req.body.content === undefined || req.body.content.length === 0){
      return res.status(412).json({errorMessage: "데이터 형식이 올바르지 않습니다."})
    }

      await Comments.update({content : req.body.content }, {where: {CommentsId : CommentsId}});
    
    res.json({ message: "댓글을 수정하였습니다."})
  } catch(error) {
    console.log(error)
    res.status(500).json({error})
  }
})


// [댓글 삭제 API]

router.delete('/:CommentsId', auth, async (req,res) => {
  let { CommentsId } = req.params

  try {
    const comments = await Comments.findOne({
      where: {
      [Op.or] : [{CommentsId : CommentsId}]
      }
    })

    if(comments === null){
      return res.status(404).json({message : "댓글을 조회할 수 없습니다."})
    }

    if(res.locals.user.userId !== comments.userId) {
      return res.status(412).json({errorMessage : "댓글을 삭제할 수 없습니다."})
    }

    if(comments !== null){
    await Comments.destroy({
      where: {CommentsId : CommentsId}
      })
    }

    res.status(200).json({message: "댓글을 삭제하였습니다."})

  } catch(error) {
    console.log(error)
    res.status(400).json({errorMessage: "댓글 삭제에 실패하였습니다."})
  }
})


module.exports = router;