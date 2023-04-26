const mysql = require('mysql2')
const config = require('./config')

const connections = mysql.createPool({
    host: config.MYSQL_HOST,
    port: config.MYSQL_PORT,
    database: config.MYSQL_DATABASE,
    user: config.MYSQL_USER,
    password: config.MYSQL_PASSWORD
})


connections.getConnection(function (err, conn) {
    conn.connect((err)=>{
        if(err){
            console.log("连接失败:",err);
        }else{
            console.log("数据库连接成功~");
        }
    })
    // Do something with the connection
    // conn.query(/* ... */);
    // Don't forget to release the connection when finished!
    // pool.releaseConnection(conn);
})

module.exports = connections.promise()