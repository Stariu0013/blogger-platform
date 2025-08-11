import {blogsCollection, postsCollection} from "../../core/db/mongo.db";

class TestingRepository {
    async deleteAllData() {
        await postsCollection.deleteMany();
        await blogsCollection.deleteMany();
    }
}

export default new TestingRepository();