const connection = require("../config/database");
const jwt = require("jsonwebtoken");

const User = {
  addUser: function (req) {
    return new Promise((resolve, reject) => {
      const params = {
        name: req.name,
        mobile: req.mobile,
        referralCode: req.referrerCode,
        gender: req.gender,
        technology: JSON.stringify(req.technology),
        profilePic: JSON.stringify(req.profilePic),
        dob: req.dob,
        points: req.referrerPoints,
      };

      connection.query(`INSERT INTO tbl_user SET ?`, params, async (err, result) => {
        if (err) return reject(err);

        const accessToken = jwt.sign(
          { id: result.insertId },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        const refreshToken = jwt.sign({ id: result.insertId },process.env.REFRESH_SECRET,{ expiresIn: "14d" });

        params.tokens = { accessToken, refreshToken };

        if (req.referralPointsId == 0) {
          return resolve(params);
        }

        connection.query("UPDATE tbl_user SET points = points + ? WHERE id = ?", [req.referralPoints, req.referralPointsId],(err1) => {
            if (err1) return reject(err1);
            resolve(params);
          }
        );
      });
    });
  },

getReferrals: function (req) {
  return new Promise((resolve, reject) => {
    const page = req.page || 1;
    const limit = parseInt(req.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `SELECT * FROM tbl_user LIMIT ?, ?`;

    connection.query(query, [offset, limit], (err, results) => {
      if (err) return reject(err);

      const formatted = results.map(user => {
        const pics = JSON.parse(user.profilePic || "[]");
        return {
          ...user,
          profilePic: pics.length > 0 ? `http://localhost/project/normalProject/uploads/${pics[0]}` : null,
        };
      });

      resolve(formatted);
    });
  });
},


  removeUser: function (id) {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM tbl_user WHERE id = ?`;
        connection.query(query, [id], (err, result) => {
        if (err) return reject(err);
        resolve(1);
      });
    });
  },

  updateUser: function (req) {
    return new Promise((resolve, reject) => {
      const params = {
        name: req.name,
        mobile: req.mobile,
        gender: req.gender,
        technology: JSON.stringify(req.technology),
        profilePic: JSON.stringify(req.profilePic),
        dob: req.dob,
      };

      const query = `UPDATE tbl_user SET ? WHERE id = ?`;
      connection.query(query, [params, req.id], async (err, result) => {
        if (err) return reject(err);
        const data = await User.profileDetails(req.id)
        resolve(data);
      });
    });
  },

  profileDetails: function (id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM tbl_user WHERE id = ?`;
      connection.query(query, [id], (err, results) => {
        if (err) return reject(err);
        resolve((results.length > 0) ? results[0] : 0);
      });
    });
  },
};

module.exports = User;
