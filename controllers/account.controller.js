const { StatusCodes } = require("http-status-codes");
const accountModel = require('../models/accountModel');
const sendEmail = require("./utils/Utils");
function isValidEmail(email) {
  // Sử dụng biểu thức chính quy để kiểm tra định dạng email
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

const parseDataListHint = async (queryResult, queryListGameOfPgt, Type) => {
  const users = {};
  for (let row of queryResult.rows) {
    const userId = row.id;

    if (!users[userId]) {
      users[userId] = {
        id: userId,
        user_name: row.user_name,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        image: row.image,
        price: row.price,
        age: row.age,
        gender: row.gender,
        phone: row.phone,
        flag: row.flag,
        avatar: row.avatar,
        image: row.image,
        textShort: row.text_short,
        rate: row.rate,
        star: 4.5,
        comment: 452,
        price: {
          personal_price_session: row.personal_price_session,
          personal_price_day: row.personal_price_day,
          group_price_avge: row.group_price_avge,
          group_price_session: row.group_price_session,
          group_price_day: row.group_price_day,
        },
        listgame: [],
        photoList: [],
      };
      if (Type == 30) {
        users[userId].destination_id = row.destination_id;
        users[userId].destination = row.destination_name;
      }
      const photoList = await accountModel.getPhotoDegreeListInDb(userId);
      users[userId].photoList = photoList;
    }
  }

  for (let game of queryListGameOfPgt.rows) {
    if (users[game.id]) {
      users[game.id].listgame.push({
        id: game.category_id,
        name: game.category_name,
        image: game.image_category
      });
    }
  }

  return Object.values(users)
}

const accountController = {
  getListAccount: async (req, res) => {
    const { Keyword, Type } = req.query
    try {
      let response = [];
      if (Type == 10) {
        const resp = await accountModel.getListAccount(Keyword);
        response = resp.rows;
      }
      else {
        let queryListHint
        if (Type == 30) {
          queryListHint = await accountModel.getListAccountRequestHint(Keyword)
        } else {
          queryListHint = await accountModel.getListAccount(Keyword, Type);
        }

        const queryListGameOfHint = await accountModel.getListCategoryFromDb(Type);
        const dataE = await parseDataListHint(queryListHint, queryListGameOfHint, Type);
        if (dataE.length > 0) {
          response = dataE
        }

      }
      res.status(200).json({
        status: 200,
        data: response
      });
    } catch (error) {
      console.log("🚀 ~ getListAccount: ~ error:", error)
      // res.status(error.code).json({ error: error.message });
    }
  },
  signupAccount: async (req, res) => {
    try {
      const { email, password } = req.body;

      const signupResult = await accountModel.signupDB(email, password);

      if (signupResult.status === 200) {
        const email = signupResult.email;
        const subject = 'Chào mừng bạn đến với ứng dụng!';
        const message = 'Cảm ơn bạn đã đăng ký tài khoản.';
        await sendEmail(email, subject, message);
        res.status(200).json({ status: 200, message: signupResult.message });
      } else {
        res.status(signupResult.status).json({ status: 210, message: signupResult.message });
      }
    } catch (error) {
      console.error('Error signing up:', error);
      res.status(500).json({ success: false, message: 'Đã có lỗi xảy ra.' });
    }
  },
  // login
  loginAccount: async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await accountModel.loginDB(email, password);
      if (user) {
        res.status(StatusCodes.OK).json({ user });
      }
      else {
        res.status(210).json({ error: 'Tên tài khoản hoặc mật khẩu không chính xác' });
      }
    } catch (error) {
      res.status(400).json({ error: 'Hệ thống lỗi' });
    }
  },
  // update
  updateAccountInfo: async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
      // cập nhật thông tin tài khoản
      const user = await accountModel.updateAccountInfoDb(id, updateData);
      // cập nhật danh sách lĩnh vực
      const updateCategory = await accountModel.updateCategoryListForPgt(id, updateData.listgame);
      if (user.message) {
        return res.status(200).json({
          status: 210,
          message: user.message
        });
      }
      else if (user) {
        return res.status(200).json({
          status: 200,
          user
        });
      } else {
        return res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(400).json({ error: 'Hệ thống lỗi' });
    }
  },


  //update photo list
  updateAccountPhotoList: async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
      const resp = await accountModel.updatePhotoListInDb(id, updateData);
      if (resp) {
        return res.status(200).json({
          status: resp.status,
        });
      } else {
        return res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(400).json({ error: 'Hệ thống lỗi' });
    }
  },
};

module.exports = accountController;
