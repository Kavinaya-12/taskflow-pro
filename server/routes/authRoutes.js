const express=require("express");
const router=express.Router();
const {
registerUser,
loginUser,
getMe,
deleteAccount,
updatePassword,
}=require("../controllers/authController");
const {protect,}=require("../middleware/authMiddleware");

router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/me",protect,getMe);
router.delete("/delete-account",protect,deleteAccount);
router.put("/update-password",protect,updatePassword);

module.exports=router;