var express = require("express");
var router = express.Router();

const MemberModifyMethod = require("../controllers/modify_controller");

const memberModifyMethod = new MemberModifyMethod();
// 會員登入
router.post("/member/login", memberModifyMethod.postlogin);
// 註冊新會員
router.post("/member", memberModifyMethod.postRegister);
// 更新會員資料
router.put("/member", memberModifyMethod.putUpdate);
// 更新會員資料（檔案上傳示範，可直接取代/member的PUT method）
router.put("/updateimg", memberModifyMethod.putUpdateImage);

module.exports = router;
