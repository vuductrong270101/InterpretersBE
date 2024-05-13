const client = require('../db')

const getAllPostInDb = async (data) => {
    let sql = `SELECT p.id ,p.image, p.user_id,p.create_at, p.title, p.content, u.first_name, u.last_name, p.status
	FROM public.post p 
    INNER JOIN public."user" u ON p.user_id = u.id
    `;

    if (data.user_id) {
        sql += `WHERE p.user_id = ${data.user_id} `
    }
    if (data.status) {
        sql += `AND p.status = ${data.status}`
    }
    if (data.Keyword) {
        sql += `AND p.title LIKE '%${data.Keyword}%'`;
    }
    if (data.date) {
        const formattedDate = new Date(data.date).toISOString().split('T')[0]; // Lấy chỉ ngày
        sql += `
        AND DATE(p.create_at) = '${formattedDate}'`;
    }
    const queryResult = await client.query(sql);
    if (queryResult?.rows) {
        return queryResult?.rows;
    } else {
        return null;
    }
}
const getPostInDb = async (id) => {
    let sql = `SELECT p.id ,p.image, p.user_id,p.create_at, p.title, p.content, u.first_name, u.last_name
    FROM public."post" p
   INNER JOIN public."user" u ON p.user_id = u.id
   WHERE p.id = $1`;
    const queryResult = await client.query(sql, [id]);
    if (queryResult?.rows) {
        return queryResult?.rows;
    } else {
        return null;
    }
}
const updatePostInDb = async (id, status) => {
    const sql = `UPDATE public.post
	SET  status=$2
	WHERE id  = $1`
    const queryResult = await client.query(sql, [id, status]);
    if (queryResult?.rowCount === 1) {
        return true /* cập nhật thành công */
    } else {
        return false;  /* cập nhật thất bại */
    }
}
const insertPostToDb = async (data) => {
    const {
        title,
        content,
        image,
        user_id
    } = data
    const sql = 'INSERT INTO public.post(user_id, content, title,image) VALUES($1, $2, $3,$4) RETURNING id';
    const queryResult = await client.query(sql, [user_id, content, title, image]);
    if (queryResult.rowCount === 1) {
        const insertedId = queryResult.rows[0].id;
        return insertedId;
    } else {
        // Xử lý khi không chèn được bản ghi
        console.error("Failed to insert post.");
        return null;
    }
}

const deletePostInDb = async (id) => {
    try {
        let sql = `
        DELETE FROM public.post
	    WHERE id = $1;
        `;
        const res = await client.query(sql, [id]);
        if (res.rowCount === 1) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

module.exports = {
    getAllPostInDb,
    insertPostToDb,
    updatePostInDb,
    getPostInDb,
    deletePostInDb,
}