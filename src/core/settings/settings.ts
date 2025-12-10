export const Settings = {
    PORT: process.env.PORT || 3000,
    DB_NAME: process.env.DB_NAME || "uber-back-education",
    MONGO_URL: process.env.MONGO_URL || "mongodb+srv://admin:admin@cluster0.77xdtkw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    JWT_SECRET: process.env.JWT_SECRET || "secret",
    JWT_EXPIRATION_TIME: process.env.JWT_EXPIRATION_TIME || 10,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "refreshTokenSecret",
    REFRESH_TOKEN_EXPIRATION_TIME: process.env.REFRESH_TOKEN_EXPIRATION_TIME || 30,
}