const express = require('express');
const cors = require('cors');
const accountRoutes = require('./routes/account.routes');
const categoryRoutes = require('./routes/categoryRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const hintRoutes = require('./routes/hintRoutes');
const postRoutes = require('./routes/postRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

app.use(express.json());
// Cấu hình CORS
app.use(cors());

// Đăng ký các tuyến đường
app.use('/account', accountRoutes);
app.use('/categories', categoryRoutes);
app.use('/destination', destinationRoutes);
app.use('/hint', hintRoutes);
app.use('/post', postRoutes);
app.use('/booking', bookingRoutes);
app.use('/banner', bannerRoutes);
app.use('/payment', paymentRoutes);

app.listen(4096, () => {
    console.log('Server is running on port 4096');
});
