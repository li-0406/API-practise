const toRegister = require("../models/register_model");
const Check = require("../sevice/member_check");
const encryption = require("../models/encryption");
const loginAction = require("../models/login_model");
const jwt = require("jsonwebtoken");
const config = require("../config/development_config");
const verifyToken = require("../models/verification");
const updateAction = require("../models/update_model");
const formidable = require("formidable");
const fs = require("fs");
// Rest of your code using formidable

module.exports = class Member {
  postRegister(req, res, next) {
    //進行加密
    const password = encryption(req.body.password);
    // 獲取client端資料
    const memberData = {
      name: req.body.name,
      email: req.body.email,
      password: password,
      create_date: onTime(),
    };

    const checkEmail = Check.checkEmail(memberData.email);
    //不符合email格式
    if (!checkEmail) {
      res.json({
        result: {
          status: "註冊失敗。",
          err: "請輸入正確的Eamil格式。(如1234@email.com)",
        },
      });
    } else if (checkEmail) {
      // 將資料寫入資料庫
      toRegister(memberData).then(
        (result) => {
          // 若寫入成功則回傳
          res.json({
            status: "註冊成功。",
            result: result,
          });
        },
        (err) => {
          // 若寫入失敗則回傳
          res.json({
            result: err,
          });
        }
      );
    }
  }

  postlogin(req, res, next) {
    const password = encryption(req.body.password);
    const memberData = {
      email: req.body.email,
      password: password,
    };
    loginAction(memberData)
      .then((rows) => {
        const token = jwt.sign(
          {
            algorithm: "HS256",
            exp: Math.floor(Date.now() / 1000) + 60 * 60, // token一個小時後過期。
            data: rows[0].id,
          },
          config.secret
        );
        res.setHeader("token", token);
        res.json({
          result: {
            status: "登入成功。",
            loginMember: "歡迎 " + rows[0].name + " 的登入！",
          },
        });
      })
      .catch((err) => {
        console.log(err);
        res.json({
          result: {
            status: "登入失敗。",
            err: "請輸入正確的帳號或密碼。",
          },
        });
      });
  }

  putUpdate(req, res, next) {
    const token = req.headers["token"];
    //確定是否有輸入
    if (Check.checkNull(token)) {
      res.json({
        err: "請輸入token！",
      });
    } else if (!Check.checkNull(token)) {
      verifyToken(token).then((tokenResult) => {
        if (!tokenResult) {
          res.json({
            result: {
              status: "token錯誤。",
              err: "請重新登入。",
            },
          });
        } else {
          const id = tokenResult;
          // 進行加密
          const password = encryption(req.body.password);
          const memberUpdateData = {
            name: req.body.name,
            password: password,
            update_date: onTime(),
          };

          updateAction(id, memberUpdateData).then((result) => {
            res.json({
              result: result,
            });
          }),
            (err) => {
              res.json({
                result: err,
              });
            };
        }
      });
    }
  }

  putUpdateImage(req, res, next) {
    const form = new formidable.IncomingForm();
    const token = req.headers["token"];
    //確定是否有輸入
    if (Check.checkNull(token)) {
      res.json({
        err: "請輸入token！",
      });
    } else if (!Check.checkNull(token)) {
      verifyToken(token).then((tokenResult) => {
        if (!tokenResult) {
          res.json({
            result: {
              status: "token錯誤。",
              err: "請重新登入。",
            },
          });
        } else {
          form.parse(req, async function (err, fields, files) {
            // 確認檔案大小是否小於1MB
            if (Check.checkFileSize(files.file.size)) {
              res.json({
                result: {
                  status: "上傳檔案失敗。",
                  err: "請上傳小於1MB的檔案",
                },
              });
              return;
            }
            // 確認檔案型態是否為png, jpg, jpeg
            if (Check.checkFileType) {
              const id = tokenResult;
              try {
                const data = await fileToBase64(files.file.filepath);
                const memberUpdateData = {
                  img: data,
                  update_date: onTime(),
                };
                const result = await updateAction(id, memberUpdateData);

                res.json({
                  result: result,
                  file: files.file,
                });
              } catch (error) {
                res.json({
                  result: err,
                });
              }
            } else {
              res.json({
                result: {
                  status: "上傳檔案失敗。",
                  err: "請選擇正確的檔案格式。如：png, jpg, jpeg等。",
                },
              });
              return;
            }
          });
        }
      });
    }
  }
};

//取得現在時間，並將格式轉成YYYY-MM-DD HH:MM:SS
const onTime = () => {
  const date = new Date();
  const mm = date.getMonth() + 1;
  const dd = date.getDate();
  const hh = date.getHours();
  const mi = date.getMinutes();
  const ss = date.getSeconds();

  return [
    date.getFullYear(),
    "-" + (mm > 9 ? "" : "0") + mm,
    "-" + (dd > 9 ? "" : "0") + dd,
    " " + (hh > 9 ? "" : "0") + hh,
    ":" + (mi > 9 ? "" : "0") + mi,
    ":" + (ss > 9 ? "" : "0") + ss,
  ].join("");
};

//圖片轉成Base64
const fileToBase64 = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "base64", function (err, data) {
      resolve(data);
    });
  });
};
