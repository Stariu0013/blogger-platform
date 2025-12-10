import {Collection, Db, MongoClient} from "mongodb";
import {PostModel} from "../../posts/types/posts.dto";
import {BlogModel} from "../../blogs/types/blogs.dto";
import {Settings} from "../settings/settings";
import {UserViewModel} from "../../users/types/types.dto";
import {CommentViewModal} from "../../comments/types";
import {TokenBlackList} from "../../tokenBlackList/types";

const POSTS_COLLECTION_NAME = "posts";
const BLOGS_COLLECTION_NAME = "blogs";
const USERS_COLLECTION_NAME = "users";
const COMMENTS_COLLECTION_NAME = "comments";
const TOKENS_BLACK_LIST_COLLECTION_NAME = "tokens_black_list";

let mongoClient: MongoClient;
export let postsCollection: Collection<PostModel>;
export let blogsCollection: Collection<BlogModel>;
export let usersCollection: Collection<UserViewModel>;
export let commentsCollection: Collection<CommentViewModal>;
export let blackListCollection: Collection<TokenBlackList>;

export async function runDB(mongoUrl: string) {
    mongoClient = new MongoClient(mongoUrl);
    const db: Db = mongoClient.db(Settings.DB_NAME);

    postsCollection = db.collection(POSTS_COLLECTION_NAME);
    blogsCollection = db.collection(BLOGS_COLLECTION_NAME);
    usersCollection = db.collection(USERS_COLLECTION_NAME);
    commentsCollection = db.collection(COMMENTS_COLLECTION_NAME);
    blackListCollection = db.collection(TOKENS_BLACK_LIST_COLLECTION_NAME);

    try {
        await mongoClient.connect();
        await db.command({ping: 1});
        console.log('✅ Connected to the database');
    } catch (e) {
        await mongoClient.close();
        throw new Error(`❌ Database not connected: ${e}`);
    }
}

export async function stopDb() {
    await mongoClient.close();
}

export async function dropDb() {
    try {
        const dbCollections = await mongoClient.db(Settings.DB_NAME).listCollections().toArray();

        for (const collection of dbCollections) {
            const collectionName = collection.name;

            await mongoClient.db(Settings.DB_NAME).collection(collectionName).deleteMany({});
        }
    } catch(e) {
        console.error('Error in drop db: ', e);
        await stopDb();
    }
}
