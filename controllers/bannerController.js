const {
    getAllBannerInDb, insertBannerToDb, updateBannerInDb, deleteBannerInDb } = require('../models/bannerModel')

const getBannerList = async (req, res) => {
    try {
        const result = await getAllBannerInDb();
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

const createBanner = async (req, res) => {
    try {
        const {url} = req.body;
        const result = await insertBannerToDb(url);
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
const updateBanner = async (req, res) => {
    try {
        const id = req.params.id;
        const { url } = req.body;
        const result = await updateBannerInDb(id,url);
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
const deleteBanner = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await deleteBannerInDb(id);
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
    getBannerList,
    createBanner,
    updateBanner,
    deleteBanner,
}