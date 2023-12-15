const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.CONNECT_DB_LINK);

export default mongoose;