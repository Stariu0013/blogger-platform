import {BlogInputModel} from "../types/blogs.input-dto";
import {BlogModel} from "../types/blogs.dto";
import {blogsCollection, postsCollection} from "../../core/db/mongo.db";
import {ObjectId, WithId} from "mongodb";
import {BlogsQueryInput} from "../router/input/blogs-query.input";
import {PostModel} from "../../posts/types/posts.dto";
import {PostInputModel} from "../../posts/types/post-input.model";
import {mapToPostViewModal} from "../../posts/router/mapper/map-to-post-view-modal";
import {mapToBlogViewModal} from "../router/mapper/map-to-blog-view-modal";

class BlogsRepository {
    async createBlog(blog: BlogInputModel): Promise<WithId<BlogModel>> {
        const insertResult = await blogsCollection.insertOne(blog);

        return {
            ...blog,
            _id: insertResult.insertedId,
        };
    }

    async createPostForBlog(post: PostInputModel): Promise<WithId<PostModel>> {
        const insertResult = await postsCollection.insertOne(post);

        return {
            ...post,
            _id: insertResult.insertedId,
        };
    }

    async updateBlog(id: string, blog: BlogModel): Promise<boolean> {
        const updatedBlog = await blogsCollection.updateOne({
            _id: new ObjectId(id),
        }, {
            $set: {
                ...blog
            }
        });

        return updatedBlog.matchedCount >= 1;
    }

    async deleteBlog(id: string): Promise<void> {
        const blogDeleteResult = await blogsCollection.deleteOne({
            _id: new ObjectId(id),
        });

        if (blogDeleteResult.deletedCount < 1) {
            throw new Error("Blog not found");
        }
        return;
    }
}

export default new BlogsRepository();