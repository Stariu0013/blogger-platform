import {PostInputModel} from "../types/post-input.model";
import {postsCollection} from "../../core/db/mongo.db";
import {PostModel} from "../types/posts.dto";
import {ObjectId, WithId} from "mongodb";

class PostsRepository {
    async getAllPosts(): Promise<WithId<PostModel>[]> {
        const res = await postsCollection.find().toArray();
        console.log(res);
        return res;
    }

    async getPostById(id: string): Promise<WithId<PostModel> | null> {
        return postsCollection.findOne({
            _id: new ObjectId(id)
        });
    }

    async createPost(post: PostInputModel): Promise<WithId<PostModel>> {
        const newPost = {
            ...post,
            blogName: post.title,
        };

        const insertResult = await postsCollection.insertOne(newPost);

        return {
            ...newPost,
            _id: insertResult.insertedId,
        };
    }

    async updatePost(id: string, post: PostInputModel): Promise<void> {
        const updateResult = await postsCollection.updateOne({
            _id: new ObjectId(id),
        }, {
            $set: {
                ...post
            }
        })

        if (updateResult.matchedCount < 1) {
            throw new Error("Post not found");
        }

        return;
    }

    async deletePost(id: string): Promise<void> {
        const deleteResult = await postsCollection.deleteOne({
            _id: new ObjectId(id),
        });

        if (deleteResult.deletedCount < 1) {
            throw new Error("Post not found");
        }

        return;
    }
}

export default new PostsRepository();