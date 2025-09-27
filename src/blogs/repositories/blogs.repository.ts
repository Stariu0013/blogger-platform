import {BlogInputModel} from "../types/blogs.input-dto";
import {BlogModel} from "../types/blogs.dto";
import {blogsCollection, postsCollection} from "../../core/db/mongo.db";
import {ObjectId, WithId} from "mongodb";
import {BlogsQueryInput} from "../router/input/blogs-query.input";
import {PostModel} from "../../posts/types/posts.dto";
import {PostInputModel} from "../../posts/types/post-input.model";

class BlogsRepository {
    async findMany(queryDto: BlogsQueryInput): Promise<{
        items: WithId<BlogModel>[],
        totalCount: number
    }> {
        const {
            searchNameTerm,
            pageSize,
            sortBy,
            pageNumber,
            sortDirection
        } = queryDto;
        const filter: any = {};
        const skip = pageSize * (pageNumber - 1);

        if (searchNameTerm) {
            filter.name = {
                $regex: searchNameTerm,
                $options: "i"
            }
        }

        const blogs = await blogsCollection.find(filter).sort({[sortBy]: sortDirection}).skip(skip).limit(pageSize).toArray();
        const totalCount = await blogsCollection.countDocuments(filter);

        return {
            items: blogs,
            totalCount
        };
    }

    async findByIdOrFail(id: string): Promise<WithId<BlogModel> | null> {
        const res = blogsCollection.findOne({_id: new ObjectId(id)});

        if (!res) {
            throw new Error("Blog not found");
        }

        return res;
    }

    async findPostsByBlogId(id: string, queryDto: BlogsQueryInput): Promise<{
        items: WithId<PostModel>[],
        totalCount: number
    }> {
        const {
            pageSize,
            sortBy,
            pageNumber,
            sortDirection
        } = queryDto;
        const skip = pageSize * (pageNumber - 1);

        const items = await postsCollection.find({_id: new ObjectId(id), blogId: id}).sort({[sortBy]: sortDirection}).skip(skip).limit(pageSize).toArray();
        const totalCount = await postsCollection.countDocuments({_id: new ObjectId(id), blogId: id});

        return {
            items,
            totalCount
        };
    }

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