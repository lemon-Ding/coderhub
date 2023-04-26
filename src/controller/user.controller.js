const userService = require('../service/user.service')
const fileService = require('../service/file.service')
const fs = require('fs')
const {AVATAR_PATH} = require('../constants/file-path')

class UserController {
    async create(ctx, next) {
        //获取用户请求传递的参数
        const user = ctx.request.body


        //查询数据
        const result = await userService.create(user)

        //返回数据
        ctx.body = result

    }

    async avatarInfo(ctx, next) {
        // 1.用户的头像是哪一个文件呢?
        const { userId } = ctx.params;
        const avatarInfo = await fileService.getAvatarByUserId(userId);
        console.log(avatarInfo);

        //提供图像信息 
        //浏览器访问    http://localhost:8000/users/15/avatar
        ctx.response.set('content-type',avatarInfo.mimetype)
        ctx.body = fs.createReadStream(`${AVATAR_PATH}/${avatarInfo.filename}`);//文件下载


    }
}

module.exports = new UserController()