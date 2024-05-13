const categoryModel = require('../models/categoryModel')

const getCategoryList = async (req, res) => {
    const {Keyword} = req.query
    try {
        const categories = await categoryModel.getCategories(Keyword)
        res.status(200).json(categories)
    } catch(err) {
        res.status(500).json({message: err.message})
    }
}

const createCategory = async (req, res) => {
    const { name,image} = req.body
    try {
        const resp = await categoryModel.createCategoryInDb(name,image)
        if (resp.status === 200){
            res.status(200).json({status: 200})
        }
        else{
            res.status(200).json({status: 210})
        }
    } catch(err) {
        res.status(500).json({message: err.message})
    }
}
const updateCategory = async (req, res) => {
    const {id} = req.params
    const { name,image} = req.body
    try {
        const resp = await categoryModel.updateCategoryInDb(id,name,image)
        if (resp.status === 200){
            res.status(200).json({status: 200})
        }
        else{
            res.status(200).json({status: 210})
        }
    } catch(err) {
        res.status(500).json({message: err.message})
    }
}
const deleteCategory = async (req, res) => {
    const id = req.params.id
    try {
        const categories = await categoryModel.deleteCategoryInDb(id )
        res.status(200).json(categories)
    } catch(err) {
        res.status(500).json({message: err.message})
    }
}

module.exports = {
    getCategoryList,
    createCategory,
    deleteCategory,
    updateCategory,
}