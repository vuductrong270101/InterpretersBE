const client = require('../db')

const getAllBannerInDb = async () => {
    let sql = `SELECT id, url, create_at
	FROM public.banner`;
    const queryResult = await client.query(sql);
    if (queryResult?.rows){
        return queryResult?.rows;
    }else{
        return null;
    }
}

const updateBannerInDb = async (id, url) => {
    const sql = `UPDATE public.banner
	SET  url=$2
	WHERE id  = $1`
    const queryResult = await client.query(sql,[id,url]);
    if (queryResult?.rowCount === 1){
        return true /* cập nhật thành công */
    }else{
        return false;  /* cập nhật thất bại */
    }
}
const insertBannerToDb = async (url) => {
    const sql = 'INSERT INTO public.banner(url) VALUES ($1)';
    const queryResult = await client.query(sql, [url]);
    if (queryResult?.rowCount === 1){
        return true
    }
    else{
        return null;
    }
}

const deleteBannerInDb = async (id) => {
    try {
        let sql = `
        DELETE FROM public.banner
	    WHERE id = $1;
        `;
        const res = await client.query(sql,[id]);
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
    getAllBannerInDb,
    insertBannerToDb,
    updateBannerInDb,
    deleteBannerInDb,
}