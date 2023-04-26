const connection = require('../app/database')

class  CommentService{
    async create(momentId,content,userId){
        const statement = `insert into comment(content,moment_id,user_id) values(?,?,?)`
        const [result]  = await connection.execute(statement,[content,momentId,userId])
        return result
 
    }
    async reply(momentId,content,userId,commentId){
        const statement = `insert into comment(content,moment_id,user_id,comment_id) values(?,?,?,?)`
        const [result]  = await connection.execute(statement,[content,momentId,userId,commentId])
        return result 
 
    }
    async update(content,commentId){
        const statement = `update comment set content=? where id = ?`
        const [result]  = await connection.execute(statement,[content,commentId])
        return result 
 
    }

    async remove(commentId){
        const statement = `delete from comment where id = ?`
        const [result]  = await connection.execute(statement,[commentId])
        return result 
 
    }

    async getCommentsByMomentId(momentId){
        // 获取动态详情同时获取评论列表 
        //如何获取评论列表，方式一：动态接口和评论接口是分开的，开发两个接口:分别是获取动态接口和评论接口
        const statement = `
        SELECT
            m.id, m.content,m.comment_id commendId, m.createAt createTime,
            JSON_OBJECT('id', u.id, 'name', u.name) user
        FROM comment m
        LEFT JOIN user u ON u.id = m.user_id 
        WHERE moment_id = ?;
        `
        const [result]  = await connection.execute(statement,[momentId])
        return result 
 
    }

}

module.exports = new CommentService()