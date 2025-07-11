const express = require('express');

const userRoutes = require('./routes/userroutes');

const app = express();

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/user', userRoutes);

app.listen(8089);
