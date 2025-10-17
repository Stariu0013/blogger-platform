import {blogsCollection, postsCollection, usersCollection} from "../../core/db/mongo.db";

class TestingRepository {
    async deleteAllData() {
        await postsCollection.deleteMany();
        await blogsCollection.deleteMany();
        await usersCollection.deleteMany();
    }
}

export default new TestingRepository();