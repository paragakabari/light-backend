const config = require("../config/config");
const moment = require("moment");
const fs = require("fs");


const saveFile = (files, uploadPath) => {
    let fileUploadPath = config.filePath + '/images/' + uploadPath;
    const fileName = files.name.split('.').shift() + "-" + moment().unix() + Math.floor(1000 + Math.random() * 9000) + '.' + files.name.split('.').pop();

    if (!fs.existsSync(fileUploadPath)) {
        fs.mkdirSync(fileUploadPath, { recursive: true });
    }

    return new Promise(async (resolve, reject) => {
        fileUploadPath = fileUploadPath + '/' + fileName;
        files.mv(fileUploadPath, async (err) => {
            if (err) {
                reject(err);
            } else {
                resolve({
                    upload_path: '/images/' + uploadPath + '/' + fileName,
                    file_name: fileName
                });
            }
        });
    })
}

module.exports = {
    saveFile
}