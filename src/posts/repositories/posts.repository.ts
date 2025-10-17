import {PostInputModel} from "../types/post-input.model";
import {postsCollection} from "../../core/db/mongo.db";
import {PostModel} from "../types/posts.dto";
import {ObjectId, WithId} from "mongodb";
import {PostsQueryInput} from "../router/input/posts-query.input";
import {mapToPostViewModal} from "../router/mapper/map-to-post-view-modal";

class PostsRepository {
    async createPost(post: PostInputModel): Promise<WithId<PostModel>> {
        const newPost = {
            ...post,
            createdAt: new Date().toISOString(),
        };

        const insertResult = await postsCollection.insertOne(newPost);

        return {
            ...newPost,
            _id: insertResult.insertedId,
        };
    }

    async updatePost(id: string, post: PostInputModel): Promise<boolean> {
        const updateResult = await postsCollection.updateOne({
            _id: new ObjectId(id),
        }, {
            $set: {
                ...post
            }
        })

        return updateResult.matchedCount >= 1;
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