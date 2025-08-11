import {Collection, Db, MongoClient} from "mongodb";
import {PostModel} from "../../posts/types/posts.dto";
import {BlogModel} from "../../blogs/types/blogs.dto";
import {Settings} from "../settings/settings";

const POSTS_COLLECTION_NAME = "posts";
const BLOGS_COLLECTION_NAME = "blogs";

let mongoClient: MongoClient
export let postsCollection: Collection<PostModel>;
export let blogsCollection: Collection<BlogModel>;

async function runDB(mongoUrl: string) {
    mongoClient = new MongoClient(mongoUrl);
    const db: Db = mongoClient.db(Settings.DB_NAME);

    postsCollection = db.collection(POSTS_COLLECTION_NAME);
    blogsCollection = db.collection(BLOGS_COLLECTION_NAME);

    try {
        await mongoClient.connect();
        await db.command({ ping: 1 });
        console.log('✅ Connected to the database');
    } catch (e) {
        await mongoClient.close();
        throw new Error(`❌ Database not connected: ${e}`);
    }
}

export default runDB;