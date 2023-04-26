const jwt = require('jsonwebtoken')

const errorTypes = require('../constants/error-types')
const userService = require('../service/user.service')
const authService = require('../service/auth.service')
const md5password = require('../utils/password-handle')
const { PUBLIC_KEY } = require('../app/config')

const verifyLogin = async (ctx, next) => {
    //1.获取用户名和密码
    const { name, password } = ctx.request.body

    // 2.判断用户名和密码是否空
    if (!name || !password) {
        const error = new Error(errorTypes.NAME_OR_PASSWORD_IS_REQUIRED);
        return ctx.app.emit('error', error, ctx);
    }


    // 3.判断用户是否存在(用户不存在)
    const result = await userService.getUserByName(name)
    const user = result[0]
    console.log(user);
    if (!user) {
        const error = new Error(errorTypes.USER_DOES_NOT_EXISTS)
        return ctx.app.emit('error', error, ctx);
    }


    // 4.判断密码是否和数据库中的密码是一致(加密)
    if (md5password(password) !== user.password) {
        const error = new Error(errorTypes.PASSWORD_IS_INCORRECT)
        return ctx.app.emit('error', error, ctx);
    }

    ctx.user = user

    await next()

}

//验证授权函数
const verifyAuth = async (ctx, next) => {
    console.log("验证授权的middleware");
    //取出header中的token
    //  console.log(ctx.headers);
    const authorization = ctx.headers.authorization;
    if (!authorization) {
        const error = new Error(errorTypes.UNAUTHORIZATION)
        return ctx.app.emit('error', error, ctx);
    }
    const token = authorization.replace("Bearer ", "");

    //2.验证token(id/name/creadat/exp)
    try {
        //验证token 
        const result = jwt.verify(token, PUBLIC_KEY, {
            algorithms: ["RS256"]
        });
        console.log(result);
        ctx.user = result;
        console.log(ctx.user);
        await next()
    } catch (error) {
        const err = new Error(errorTypes.UNAUTHORIZATION)
        return ctx.app.emit('error', err, ctx);
    }
}

/**
 * 1.很多的内容都需要验证权限:修改/删除动态,修改/删除评论
 * 2.接口:业务接口系统/后端管理系统
 * 一对一:user-->-role
 * 多对多:role -> -menu(删除动态/修改动态)
 */

//验证权限
const verifyPermission = async (ctx, next) => {
    console.log("验证权限的middleware");
    console.log(ctx.user);

    //1.获取参数  ctx.params {commentId:'1'}
    const [resourceKey] = Object.keys(ctx.params);
    const tableName =  resourceKey.replace('Id','');
    const resourceId = ctx.params[resourceKey];
    const { id } = ctx.user



    //2.查询是否具备权限
    try {
        //这是动态权限验证
        const isPermission = await authService.checkResource(tableName,resourceId, id)
        if (!isPermission) throw new Error()
        await next()
    } catch (error) {
        const err = new Error(errorTypes.UNPERMISSION)
        return ctx.app.emit('error', err, ctx);
    }


    
}

module.exports = {
    verifyLogin,
    verifyAuth,
    verifyPermission
}