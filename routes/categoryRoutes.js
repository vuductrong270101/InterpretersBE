const express = require('express')

const categoryController = require('../controllers/categoryController')

const router = express.Router()
// get list 
router.get('/', categoryController.getCategoryList)
// create category
router.post('/', categoryController.createCategory)
// update category
router.put('/:id', categoryController.updateCategory)
// delete category
router.delete('/:id', categoryController.deleteCategory)

module.exports = router