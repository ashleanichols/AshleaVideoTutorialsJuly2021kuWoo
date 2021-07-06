const env = process.env.NODE_ENV || 'development';

const config = {
    development: {
        port: process.env.PORT || 4500,
        dbUser: 'admin',
        dbPassword: 'admin12345',
        dbName: 'video',
        dbAddress: 'mongodb+srv://admin:admin12345@video.1m0tq.mongodb.net/video?retryWrites=true&w=majority',
        tokenKey: 'kingsland'
    },
    production: {}
}

module.exports = config[env];