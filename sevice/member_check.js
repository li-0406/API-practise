module.exports = class Check {
  //判斷email格式
  static checkEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const result = re.test(email);
    return result;
  }

  static checkNull(data) {
    for (var key in data) {
      // 不為空
      return false;
    }
    // 為空值
    return true;
  }

  //判斷檔案大小
  static checkFileSize(fileSize) {
    var maxSize = 1 * 1024 * 1024; //1MB
    if (fileSize > maxSize) {
      return true;
    }
    return false;
  }

  //判斷型態是否符合jpg, jpeg, png
  static checkFileType(fileType) {
    if (
      fileType === "image/png" ||
      fileType === "image/jpg" ||
      fileType === "image/jpeg"
    ) {
      return true;
    }
    return false;
  }
};
