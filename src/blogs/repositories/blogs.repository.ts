import {BlogInputModel} from "../types/blogs.input-dto";
import {BlogModel} from "../types/blogs.dto";
import {blogsCollection} from "../../core/db/mongo.db";
import {ObjectId, WithId} from "mongodb";

class BlogsRepository {
    async getAllBlogs(): Promise<WithId<BlogModel>[]> {
        return blogsCollection.find().toArray();
    }

    async getBlogById(id: string): Promise<WithId<BlogModel> | null> {
        return blogsCollection.findOne({_id: new ObjectId(id)});
    }

    async createBlog(blog: BlogInputModel): Promise<WithId<BlogModel>> {
        const insertResult = await blogsCollection.insertOne(blog);

        return {
            ...blog,
            _id: insertResult.insertedId,
        };
    }

    async updateBlog(id: string, blog: BlogModel): Promise<void> {
        const updatedBlog = await blogsCollection.updateOne({
            _id: new ObjectId(id),
        }, {
            $set: {
                ...blog
            }
        });

        if (updatedBlog.matchedCount < 1) {
            throw new Error("Blog not found");
        }

        return;
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