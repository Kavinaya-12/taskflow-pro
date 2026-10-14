const express=require("express");
const router=express.Router();
const {
registerUser,
loginUser,
getMe,
deleteAccount,
updatePassword,
logoutUser,
updateProfile,
}=require("../controllers/authController");
const {protect,}=require("../middleware/authMiddleware");
const authRateLimit = require('../middleware/authRateLimit')

router.post("/register",authRateLimit,registerUser);
router.post("/login",authRateLimit,loginUser);
router.get("/me",protect,getMe);
router.delete("/delete-account",protect,deleteAccount);
router.put("/update-password",protect,updatePassword);
router.post("/logout",protect,logoutUser);
router.put("/profile",protect,updateProfile);

module.exports=router;
