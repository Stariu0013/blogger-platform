import {blackListCollection, blogsCollection, commentsCollection, postsCollection, rateLimitCollection, sessionsCollection, usersCollection} from "../../core/db/mongo.db";

class TestingRepository {
    async deleteAllData() {
        await postsCollection.deleteMany({});
        await blogsCollection.deleteMany({});
        await usersCollection.deleteMany({});
        await commentsCollection.deleteMany({});
        await blackListCollection.deleteMany({});
        await sessionsCollection.deleteMany({});
        await rateLimitCollection.deleteMany({});
    }
}

export default new TestingRepository();