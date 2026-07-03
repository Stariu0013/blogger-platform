import {blackListCollection, blogsCollection, commentsCollection, postsCollection, rateLimitCollection, sessionsCollection, usersCollection} from "../../core/db/mongo.db";
import {injectable} from "inversify";

@injectable()
export class TestingRepository {
    async deleteAllData(): Promise<void> {
        await postsCollection.deleteMany({});
        await blogsCollection.deleteMany({});
        await usersCollection.deleteMany({});
        await commentsCollection.deleteMany({});
        await blackListCollection.deleteMany({});
        await sessionsCollection.deleteMany({});
        await rateLimitCollection.deleteMany({});
    }
}
