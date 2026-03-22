export const Settings = {
    PORT: process.env.PORT || 3000,
    DB_NAME: process.env.DB_NAME || "uber-back-education",
    MONGO_URL: process.env.MONGO_URL || "mongodb://admin:admin@ac-1h4bkgf-shard-00-00.77xdtkw.mongodb.net:27017,ac-1h4bkgf-shard-00-01.77xdtkw.mongodb.net:27017,ac-1h4bkgf-shard-00-02.77xdtkw.mongodb.net:27017/?ssl=true&replicaSet=atlas-145eb5-shard-0&authSource=admin&appName=Cluster0",
    JWT_SECRET: process.env.JWT_SECRET || "secret",
    JWT_EXPIRATION_TIME: process.env.JWT_EXPIRATION_TIME || 10,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "refreshTokenSecret",
    REFRESH_TOKEN_EXPIRATION_TIME: process.env.REFRESH_TOKEN_EXPIRATION_TIME || 20,
}