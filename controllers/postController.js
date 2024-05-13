const {
    getAllPostInDb, insertPostToDb, updatePostInDb, deletePostInDb,
    getPostInDb } = require('../models/postModel')

const getPostList = async (req, res) => {
    try {
        const data = req.query
        const result = await getAllPostInDb(data);
        if (result) {
            res.json({
                status: 200,
                data: result
            })
        } else {
            res.status(400).json({ error: 'Hệ thống lỗi' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const getPostDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await getPostInDb(id);
        if (result) {
            res.json({
                status: 200,
                data: result
            })
        } else {
            res.status(400).json({ error: 'Hệ thống lỗi' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
const createPost = async (req, res) => {
    try {
        const data = req.body;
        const result = await insertPostToDb(data);
        if (result) {
            res.json({
                status: 200,
                data: {
                    id: result
                }
            })
        } else {
            res.status(400).json({ error: 'Hệ thống lỗi' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
const updatePost = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const result = await updatePostInDb(id, status);
        if (result) {
            res.json({
                status: 200,
            })
        } else {
            res.status(400).json({ error: 'Hệ thống lỗi' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
const deletePost = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await deletePostInDb(id);
        if (result) {
            res.json({
                status: 200,
            })
        } else {
            res.status(400).json({ error: 'Hệ thống lỗi' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getPostList,
    createPost,
    updatePost,
    deletePost,
    getPostDetail
}