const client = require('../db')
const AvatarDefault = 'https://icon-library.com/images/avatar-icon-images/avatar-icon-images-4.jpg'
const ImageDefault = 'https://static.vecteezy.com/system/resources/previews/021/548/095/original/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg'
const loginDB = async (email, password) => {
    try {
        const res = await client.query(
            `SELECT "user".id, "user".user_name, "user".first_name, "user".last_name, "user".email, "user".avatar, "user".role_id,"user".status, "role".name as role_name
            FROM "user"
            JOIN "role" ON "user".role_id = "role".id
            where email= $1   and password = $2`,
            [email, password]
        );
        if (res.rows) {
            return res.rows[0];
        }
        else {
            return null;
        }
    } catch (error) {
        // Xử lý lỗi truy vấn
        console.error(error);
        throw error;
    }
}

const getListAccount = async (Keyword, Type = 10) => {
    let sql = `SELECT 
    "user".id AS id,
    "user".user_name,
    "user".first_name,
    "user".last_name,
    "user".image,
    "user".hot_hint,
    "user".price,
    "user".gender,
    "user".age,
    "user".email,
    "user".address,
    "user"."phone",
    "user"."province",
    "user"."district",
    "user"."ward",
    "user"."facebook",
    "user"."personal_price_session",
    "user"."personal_price_day",
    "user"."group_price_avge",
    "user"."group_price_session",
    "user"."group_price_day",
    "user"."destination_id",
    "user".flag AS flag
    FROM public."user"
    `;
    if (Type == 10) {
        sql += `WHERE "user".role_id = 1`;
    } else if (Type == 20) {
        sql += `WHERE "user".role_id = 2`;
    } else if (Type == 30) {
        sql += `WHERE "user".role_id = 4`;
    }
    if (Keyword) {
        sql += `AND "user".user_name LIKE '%${Keyword}%'`;
    }
    const queryResult = await client.query(sql);
    return queryResult;
}
const getListAccountRequestHint = async (Keyword) => {
    let sql = `SELECT 
    "user".id AS id,
    "user".user_name,
    "user".first_name,
    "user".last_name,
    "user".image,
    "user".hot_hint,
    "user".price,
    "user".gender,
    "user".age,
    "user".email,
    "user".address,
    "user"."phone",
    "user"."province",
    "user"."district",
    "user"."ward",
    "user"."facebook",
    "user"."personal_price_session",
    "user"."personal_price_day",
    "user"."group_price_avge",
    "user"."group_price_session",
    "user"."group_price_day",
    "user"."destination_id",
    "user".flag AS flag,
    destination.name AS destination_name
    FROM public."user"
    JOIN destination ON "user"."destination_id"::int = destination.id
    WHERE "user".role_id = 4
    `;
    if (Keyword) {
        sql += `AND "user".user_name LIKE '%${Keyword}%'`;
    }
    const queryResult = await client.query(sql);
    return queryResult;
}
const requestToPgt = async (req, res) => {
    const { id } = req.params;
    const { categories, price } = req.body;
    try {
        await updateInfoPricePgt(id, price);
        await updateCategoryListForPgt(id, categories);
        return res.status(200).json({
            status: 200,
        });
    } catch (error) {
        res.status(400).json({ error: 'Hệ thống lỗi' });
    }
}

const updatePhotoListInDb = async (id, data) => {
    try {
        const existingPhotos = await client.query(
            'SELECT id,user_id FROM public.galery WHERE user_id = $1',
            [id]
        );

        // Delete existing photos
        for (let i = 0; i < existingPhotos.rows.length; i++) {
            const idDelete = existingPhotos.rows[i].id;
            const respRemove = await client.query(
                'DELETE FROM public.galery WHERE id= $1',
                [idDelete]
            );
            if (respRemove.rowCount !== 1) {
                // If deletion fails, you might want to handle it appropriately
                console.error("Deletion failed for id:", idDelete);
            }
        }
        // Insert new photos
        for (let i = 0; i < data.length; i++) {
            const link = data[i];
            const respAdd = await client.query(
                'INSERT INTO public.galery (user_id, link) VALUES ($1, $2)',
                [id, link]
            );
            if (respAdd.rowCount !== 1) {
                // If insertion fails, you might want to handle it appropriately
                console.error("Insertion failed for link:", link);
            }
        }
        // Return status after both deletion and insertion
        return {
            status: 200
        };
    } catch (error) {
        throw error;
    }
}

const getPhotoDegreeListInDb = async (id) => {
    try {
        const qiest = `SELECT * FROM public.galery WHERE user_id = ${id} and degree = true`
        const existingPhotos = await client.query(qiest);
        // Extract URLs from the query result
        const urls = existingPhotos.rows.map(row => row.link);
        // Transform URLs into an array of objects
        let photoList = []
        photoList = urls.map(url => ({ url }));
        return photoList;
    } catch (error) {
        throw error;
    }
}
const updateAccountInfoDb = async (id, inputValues) => {
    try {
        let queryText = 'UPDATE public."user" SET ';
        const queryValues = [id];
        let queryFields = [];
        let counter = 2;
        let newPassword = null;

        // Duyệt qua đối tượng inputValues, tạo phần SQL cho mỗi trường không phải là null
        for (const key in inputValues) {
            if (!Array.isArray(inputValues[key]) && inputValues[key] !== null && inputValues[key] !== undefined) {
                if (key === 'password' && inputValues['new_password'] !== undefined) {
                    const passwordMatch = await checkPasswordMatch(id, inputValues['password']);
                    if (passwordMatch) {
                        // Set the new password for update
                        newPassword = inputValues['new_password'];
                    } else {
                        return {
                            message: 'Mật khẩu cũ không đúng'
                        };
                    }
                } else if (key !== 'new_password' && key !== 'password') {
                    queryValues.push(inputValues[key]);
                    queryFields.push(`"${key}"=$${counter}`);
                    counter++;
                }
            }
        }

        // Add the new password to the queryValues and queryFields if it is set
        if (newPassword !== null) {
            queryValues.push(newPassword);
            queryFields.push(`"password"=$${counter}`);
        }

        if (queryFields.length === 0) {
            throw new Error('No valid fields provided for update');
        }

        // Combine all parts of the query
        queryText += queryFields.join(', ') + ' WHERE id = $1 RETURNING *';

        // Gửi câu lệnh SQL đến cơ sở dữ liệu
        const res = await client.query(queryText, queryValues);

        // Xử lý kết quả trả về từ cơ sở dữ liệu
        if (res.rows.length > 0) {
            return res.rows[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};


const checkPasswordMatch = async (id, password) => {
    try {
        const user = await client.query('SELECT password FROM public."user" WHERE id = $1', [id]);
        if (user.rows.length > 0) {
            // Compare the passwords (you may need to use a secure password comparison method)
            if (user.rows[0].password === password) {
                return true;
            } else {
                return false;
            }
        } else {
            throw new Error('User not found.');
        }
    } catch (error) {
        throw error;
    }
};

const updateCategoryListForPgt = async (id, list) => {
    let queryResult;
    if (list?.length > 0) {
        try {
            // Get the current categoryList from the database
            const getCurrentCategoriesSql = `
                SELECT category_id FROM public.categorylist
                WHERE user_id = $1;
            `;
            const currentCategoriesParams = [id];
            const currentCategoriesResult = await client.query(getCurrentCategoriesSql, currentCategoriesParams);
            const currentCategories = currentCategoriesResult.rows.map(row => row.category_id);

            // Identify categories to be added and deleted
            const categoriesToAdd = list.filter(item => !currentCategories.includes(item));
            const categoriesToDelete = currentCategories.filter(item => !list.includes(item));

            // Insert new categories
            if (categoriesToAdd.length > 0) {
                const insertSql = `
                    INSERT INTO public.categorylist(user_id, category_id)
                    VALUES ${categoriesToAdd.map(categoryId => `(${id}, ${categoryId})`).join(', ')}
                    RETURNING *;
                `;
                const insertResult = await client.query(insertSql);
                // Handle the query result if needed
                console.log('Inserted categories:', insertResult.rows);
            }

            // Delete old categories
            if (categoriesToDelete.length > 0) {
                const deleteSql = `
                    DELETE FROM public.categorylist
                    WHERE user_id = $1 AND category_id IN (${categoriesToDelete.join(', ')})
                    RETURNING *;
                `;
                const deleteParams = [id];
                const deleteResult = await client.query(deleteSql, deleteParams);
                // Handle the query result if needed
                console.log('Deleted categories:', deleteResult.rows);
            }

            queryResult = { success: true, message: 'CategoryList updated successfully' };
        } catch (error) {
            // Handle the error if any query fails
            console.error('Error updating CategoryList:', error.message);
            queryResult = { success: false, message: 'Error updating CategoryList' };
        }
    }
    return queryResult;
};
const signupDB = async (email, password) => {
    try {
        // Kiểm tra xem có bản ghi với địa chỉ email đã tồn tại không
        const emailCheck = await client.query(`
        SELECT * FROM public."user" WHERE email = $1;`,
            [email]);
        if (emailCheck.rows.length > 0) {
            return {
                status: 210,
                message: "Địa chỉ email đã tồn tại"
            };
        }

        // Nếu địa chỉ email không tồn tại, thì tiến hành tạo tài khoản
        const username = email.split('@')[0];
        const res = await client.query(`
            INSERT INTO public."user"(email, password, avatar, image,user_name,role_id,introduction)
            VALUES ($1, $2, $3, $4,$5,1,'Xin chào mọi người ❤️')
            RETURNING *;`, [email, password, AvatarDefault, ImageDefault, username]
        );
        if (res.rows.length > 0) {
            return {
                status: 200,
                message: "Đăng ký thành công",
                email: res.rows[0].email
            };
        } else {
            return {
                status: -1,
                message: "Đăng ký thất bại"
            };
        }
    } catch (error) {
        // Xử lý lỗi truy vấn
        console.error(error);
        throw error;
    }
}

const getListCategoryFromDb = async (Type) => {
    let sql = `SELECT 
        "user".id as id, 
        "category".name as category_name,
        "category".id as category_id,
        "category".image as image_category
    FROM "user"
    LEFT JOIN  "categorylist" ON  "user".id = categorylist.user_id
    LEFT JOIN  "category" ON "categorylist".category_id = "category"."id"
    `;

    if (Type == 30) {
        sql += ` WHERE "user".role_id = 4`;
    } else {
        sql += ` WHERE "user".role_id = 2`;
    }
    const queryResult = await client.query(sql);
    return queryResult;
};

const getCommentCountListFromDb = async (Type) => {
    let sqlComment = `SELECT 
    hint_id as id, COUNT(*) AS booking_count,
    AVG(booking.rate) AS average_rating
    FROM public.booking
    GROUP BY hint_id;
    `;
    // WHERE status = 5
    const queryResult = await client.query(sqlComment);
    return queryResult;
};


module.exports = {
    loginDB,
    getPhotoDegreeListInDb,
    signupDB,
    getListAccount,
    getListCategoryFromDb,
    requestToPgt,
    updateAccountInfoDb,
    updateCategoryListForPgt,
    getCommentCountListFromDb,
    getListAccountRequestHint,
    updatePhotoListInDb
}