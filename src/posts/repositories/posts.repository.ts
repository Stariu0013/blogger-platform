import {PostInputModel} from "../types/post-input.model";
import {postsCollection} from "../../core/db/mongo.db";
import {PostModel} from "../types/posts.dto";
import {ObjectId, WithId} from "mongodb";
import {PostsQueryInput} from "../router/input/posts-query.input";
import {mapToPostViewModal} from "../router/mapper/map-to-post-view-modal";

class PostsRepository {
    async findMany(queryDto: PostsQueryInput): Promise<{
        items: PostModel[],
        totalCount: number
    }> {
        const {
            pageSize,
            sortBy,
            sortDirection,
            pageNumber
        } = queryDto;
        const skip = pageSize * (pageNumber - 1);

        const posts = await postsCollection.find().skip(skip).sort({
            [sortBy]: sortDirection,
            createdAt: -1,
            _id: 1
        }).limit(pageSize).toArray();
        const mappedPosts = posts.map(item => mapToPostViewModal(item));

        const totalCount = await postsCollection.countDocuments();

        return {
            items: mappedPosts,
            totalCount
        };
    }

    async findByIdOrFail(id: string): Promise<WithId<PostModel> | null> {
        return postsCollection.findOne({
            _id: new ObjectId(id)
        });
    }

    async createPost(post: PostInputModel): Promise<WithId<PostModel>> {
        const newPost = {
            ...post,
            blogName: post.title,
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