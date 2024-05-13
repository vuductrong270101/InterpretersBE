const client = require('../db')

const getCategories = async (Keyword) => {
    try {
        let sql = 'SELECT * FROM Category';
        const values = [];
        if (Keyword) {
            sql += ' WHERE name ILIKE $1';
            values.push(`%${Keyword}%`);
        }
        const res = await client.query(sql, values);
        return res.rows;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const createCategoryInDb = async (Name, Image) => {
    try {
        const sql = `
            INSERT INTO public.category(name, image)
            VALUES($1, $2)
            ;
        `;
        const res = await client.query(sql, [Name, Image]);
        if (res.rowCount == 1){
            return {
                status: 200
            };
        }else{
            return {
                status: 210
            };
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const updateCategoryInDb = async (Id,Name, Image) => {
    try {
        const sql = `
            UPDATE public.category
            SET name=$2, image=$3
            WHERE id = $1 ;
        `;
        const res = await client.query(sql, [Id,Name, Image]);
        if (res.rowCount == 1){
            return {
                status: 200
            };
        }else{
            return {
                status: 210
            };
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const deleteCategoryInDb = async (id) => {
    try {
        let sql = `
        DELETE FROM public.category
	    WHERE id = ${id};
        `;
        const res = await client.query(sql);
        if (res.rowCount === 1) {
            return {
                status: 200,
                message: "Xóa lĩnh vực thành công.",
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

module.exports = { getCategories, createCategoryInDb, deleteCategoryInDb ,updateCategoryInDb}