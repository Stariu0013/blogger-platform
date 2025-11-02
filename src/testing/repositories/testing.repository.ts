import {blogsCollection, commentsCollection, postsCollection, usersCollection} from "../../core/db/mongo.db";

class TestingRepository {
    async deleteAllData() {
        await postsCollection.deleteMany();
        await blogsCollection.deleteMany();
        await usersCollection.deleteMany();
        await commentsCollection.deleteMany();
    }
}

export default new TestingRepository();