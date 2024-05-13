const express = require('express')

const postController = require('../controllers/postController')

const router = express.Router()
// lấy danh sách post
router.get('/', postController.getPostList)
//  lấy thông tin  post
router.get('/:id', postController.getPostDetail)
// 
router.post("/", postController.createPost);
// update post 
router.put("/:id", postController.updatePost);
// delete post 
router.delete("/:id", postController.deletePost);

module.exports = router