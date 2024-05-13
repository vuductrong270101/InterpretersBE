const client = require('../db')

const groupByProvinceId = (data) => {
    const groupedData = {};

    data.forEach(item => {
        const { province } = item;
        if (!groupedData[province]) {
            groupedData[province] = [];
        }
        groupedData[province].push(item);
    });

    return Object.keys(groupedData).map(province => ({
        province: parseInt(province),
        destinations: groupedData[province]
    }));
};

const getDestination = async (Keyword, province, type) => {
    console.log("🚀 ~ getDestination ~ type:", type)
    try {
        let sql = 'SELECT * FROM destination';
        const values = [];
        if (province) {
            sql += ' WHERE province = $1';
            values.push(`${province}`);
        }
        const res = await client.query(sql, values);
        if (type == 2) {
            const sortedData = groupByProvinceId(res.rows);
            return sortedData
        } else {
            return res.rows;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};
const getDestinationDetail = async (id) => {
    try {
        let sql = `SELECT * FROM destination WHERE id = ${id}`;
        const res = await client.query(sql);
        return res.rows;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const createDestinationDB = async (Name, latitude, longitude, time_start, time_end, price, experience, image, province) => {
    try {
        const sql = `
            INSERT INTO public.destination(
                name, latitude, longitude, time_start, time_end, price, experience, image , province)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
            ;
        `;
        const res = await client.query(sql, [Name, latitude, longitude, time_start, time_end, price, experience, image, province]);
        if (res.rowCount == 1) {
            return {
                status: 200
            };
        } else {
            return {
                status: 210
            };
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const updateCategoryInDb = async (Id, Name, Image) => {
    try {
        const sql = `
            UPDATE public.category
            SET name=$2, image=$3
            WHERE id = $1 ;
        `;
        const res = await client.query(sql, [Id, Name, Image]);
        if (res.rowCount == 1) {
            return {
                status: 200
            };
        } else {
            return {
                status: 210
            };
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const deleteDestinationInDb = async (id) => {
    try {
        let sql = `
        DELETE FROM public.destination
	    WHERE id = ${id};
        `;
        const res = await client.query(sql);
        if (res.rowCount === 1) {
            return {
                status: 200,
                message: "Xóa địa điểm thành công.",
            };
        } else {
            return {
                status: 400,
                message: "Hệ thống lỗi",
            };
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

module.exports = { getDestination, getDestinationDetail, createDestinationDB, deleteDestinationInDb, updateCategoryInDb }