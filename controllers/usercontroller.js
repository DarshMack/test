const UserModel = require("../models/usermodel");
const Common = require("../config/common");

const saveUserData = (req, res) => {
  const { name, referralCode } = req.body;
  Common.calculateReferralPoints(referralCode).then(({ referralPoints, referrerPoints, referralPointsId, referrerCode }) => {
      req.body.referralPoints = referralPoints;
      req.body.referrerPoints = referrerPoints;
      req.body.referralPointsId = referralPointsId;
      req.body.referrerCode = referrerCode;

      return UserModel.addUser(req.body);
    })
    .then((result) => {
      if (result == 0) {
        return Common.success(res, 0, "Something went wrong!", result);
      }else{
        return Common.success(res, 1, "User add", result);
      }
    })
    .catch((error) => {
      return Common.error(res, err);
    });
};

const fetchReferralUsers = (req, res) => {
  const { page = 1, limit = 10 } = req.body;

  UserModel.getReferrals(page, limit)
    .then((result) => {
      if (result == 0) {
        return Common.success(res, 0, "No Data Found", null);
      } else {
        return Common.success(res, 1, "User Listing", result);
      }
    })
    .catch((error) => {
      return Common.error(res, error);
    });
};


const deleteUser = (req, res) => {
  const id = req.user_id;
  UserModel.removeUser(id)
    .then((result) => {
      return Common.success(res, 1, "User Delete", null);
    })
    .catch((error) => {
      return Common.error(res, error);
    });
};

const updateProfile = (req, res) => {
  req.body.id = req.user_id;
  UserModel.updateUser(req.body)
    .then((result) => {
      return Common.success(res, 1, "Profile updated", result);
    })
    .catch((error) => {
      return Common.error(res, error);
    });
};

const profile = (req, res) => {
   const id = req.user_id;
  UserModel.profileDetails(id)
    .then((result) => {
      if (result == 0) {
        return Common.success(res, 0, "No data found", null);
      }else{
        return Common.success(res, 1, "Get Details", result);
      }
    })
    .catch((error) => {
      return Common.error(res, error);
    });
};

const uploadImages = (req, res) => {
  if (!req.files || req.files.length === 0) {
    return Common.error(res, "No files uploaded");
  }

  const filePaths = req.files.map(file => file.path);
  return Common.success(res, 1, "Files uploaded successfully", filePaths);
};

// Group all controllers
const UserController = {
  saveUserData,
  fetchReferralUsers,
  deleteUser,
  updateProfile,
  profile,
  uploadImages,
};

module.exports = UserController;
