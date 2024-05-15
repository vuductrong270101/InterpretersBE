const { getListCategoryFromDb, getCommentCountListFromDb } = require('../models/accountModel');
const { getListImageUserFromDB, getAllHintFromDb, getUserFromDB, updateCategoryListForHint, updateInfoRequestHint, getFeedbackFromDb, updateInfoHint, updatePhotoRequest } = require('../models/hintModel')

const parseDataHint = (queryResult, queryListGameOfHint, listImage) => {
    const users = {};
    for (let row of queryResult.rows) {
        const userId = row.id;
        if (!users[userId]) {
            users[userId] = {
                id: userId,
                destination_id: row.destination_id,
                destination: row.destination_name,
                user_name: row.user_name,
                age: row.age,
                gender: row.gender,
                first_name: row.first_name,
                last_name: row.last_name,
                email: row.email,
                image: row.image,
                avatar: row.avatar,
                address: row.address,
                province: row.province,
                district: row.district,
                ward: row.ward,
                facebook: row.facebook,
                tiktok: row.tiktok,
                youtube: row.youtube,
                instagram: row.instagram,
                phone: row.phone,
                textShort: row.text_short,
                star: row.star,
                flag: row.flag,
                price: {
                    personal_price_session: row.personal_price_session,
                    personal_price_day: row.personal_price_day,
                    group_price_avge: row.group_price_avge,
                    group_price_session: row.group_price_session,
                    group_price_day: row.group_price_day,
                },
                follower: row?.follower,
                introduction: row?.introduction,
                status: row?.status,
                countRental: 6280,
                countComment: 2323,
                listImage: listImage,
                listgame: [],

            };
        }
    }
    for (let game of queryListGameOfHint.rows) {
        if (users[game.id]) {
            users[game.id].listgame.push({
                id: game.category_id,
                name: game.category_name,
                image: game.image_category
            });
        }
    }
    return Object.values(users);
}
const parseDataListHint = (queryResult, queryListcategoriesOfHint, queryCommentCountList) => {
    const users = {};
    for (let row of queryResult.rows) {
        const userId = row.id;
        if (!users[userId]) {
            users[userId] = {
                id: userId,
                username: row.user_name,
                avatar: row.avatar,
                hot_hint: row?.hot_hint,
                image: row.image,
                textShort: row.text_short,
                star: 4.5,
                comment: 0,
                listcategories: []
            };
        }
    }

    for (let categories of queryListcategoriesOfHint.rows) {
        if (users[categories.id]) {
            users[categories.id].listcategories.push({
                id: categories.category_id,
                name: categories.category_name,
                image: categories.image_category
            });
        }
    }
    for (let comment of queryCommentCountList.rows) {
        if (users[comment.id]) {
            users[comment.id].comment = comment.booking_count
        }
    }
    return Object.values(users);

}

const getHintFeedbackList = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await getFeedbackFromDb(id);
        if (result?.status) {
            res.status(200).json({ data: result.data, status: result.status, rate: result.rate });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getHintList = async (req, res) => {
    try {
        const { Type, KeyWord, Category, Rate, Comment } = req.query
        const queryListHint = await getAllHintFromDb(Type, KeyWord, Category, Rate, Comment);
        const queryListGameOfHint = await getListCategoryFromDb();
        const queryCommentCountList = await getCommentCountListFromDb();
        const userList = parseDataListHint(queryListHint, queryListGameOfHint, queryCommentCountList);
        res.json(userList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getHintDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const infoHint = await getUserFromDB(id);
        console.log("🚀 ~ getHintDetail ~ infoHint:", infoHint)
        const listImage = await getListImageUserFromDB(id);
        const queryListGameOfHint = await getListCategoryFromDb();
        const userList = parseDataHint(infoHint, queryListGameOfHint, listImage);
        res.json(userList);

    } catch (error) {
        console.error(error);

        res.status(500).json({ error: 'Internal server error' });
    }
};

const requestToHint = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        await updateInfoHint(id, data);
        await updatePhotoRequest(id, data.images);
        await updateCategoryListForHint(id, data.categories);
        return res.status(200).json({
            status: 200,
        });
    } catch (error) {
        res.status(400).json({ error: 'Hệ thống lỗi' });
    }
}



const deleteRequestToHint = async (req, res) => {
    const { id } = req.params;
    try {
        const resp = await updateInfoRequestHint(id, 2);
        return res.status(200).json({
            status: 200,
        });
    } catch (error) {
        res.status(400).json({ error: 'Hệ thống lỗi' });
    }
}

const acceptInfoRequestBooking = async (req, res) => {
    const { id } = req.params;
    const { Type } = req.query;
    try {
        const resp = await updateInfoRequestHint(id, parseInt(Type));
        if (resp == 1) {
            return res.status(200).json({
                status: 200,
            });
        }
    } catch (error) {
        res.status(400).json({ error: 'Hệ thống lỗi' });
    }
}
module.exports = {
    getHintList,
    getHintDetail,
    requestToHint,
    deleteRequestToHint,
    getHintFeedbackList,
    acceptInfoRequestBooking
}