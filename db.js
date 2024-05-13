const { Client } = require('pg');

// Thông tin kết nối đến cơ sở dữ liệu PostgreSQL
const client = new Client({
  user: 'admin',
  host: 'dpg-co7sbh21hbls73ef6ql0-a.singapore-postgres.render.com',
  database: 'hint_dev_0102',
  password: 'JHa2QwrAmIAh7oevWvVDQWmGdUgcswrc',
  port: 5432,
  ssl: {
    sslmode: 'no-verify' // Thêm tùy chọn SSL để bỏ qua việc xác minh chứng chỉ SSL
  }
});

// Kết nối vào cơ sở dữ liệu
client.connect()
  .then(() => console.log('Kết nối cơ sở dữ liệu thành công'))
  .catch(err => console.error('Lỗi kết nối:', err.message));

module.exports = client;
