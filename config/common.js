const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const connection = require("./database");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

var common = {
  upload: multer({ storage }),

authenticateToken: function (req, res, next) {
  const bearerToken = req.header("Authorization");

  if (!bearerToken) return res.status(401).send("Access denied.");

  const token = bearerToken.split(" ")[1];
  if (!token) return res.status(401).send("Access denied.");

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid token.");

    const userId = user.id;
    const query = `SELECT id FROM tbl_user WHERE id = ?`;

    connection.query(query, [userId], (err, results) => {
      if (results.length === 0) return common.success(res, 0, "User does not exist.", null);
      req.user_id = userId;
      next();
    });
  });
},
  calculateReferralPoints: function (referralCode) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM tbl_user WHERE referralCode = ? LIMIT 1`;
      connection.query(query, [referralCode], (err, results) => {
        if (err) 
          return reject(err);

        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 6; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        if (results.length > 0) {
          resolve({referralPoints: 10,referrerPoints: 20,referralPointsId: results[0].id,referrerCode: text});
        } else {
          resolve({referralPoints: 0,referrerPoints: 0,referralPointsId: 0,referrerCode: text});
        }
      });
    });
  },

 success: function (res, code, message = "Success", data = {}, statusCode = 200) {
    return res.status(statusCode).json({code, message, result: data });
  },

  error: function (res, err, statusCode = 500) {
    const message = err?.sqlMessage || err?.message || "Something went wrong";
    return res.status(statusCode).json({ message });
  },
};

module.exports = common;
