import blogsRepository from "../repositories/blogs.repository";
import {BlogInputModel} from "../types/blogs.input-dto";
import {BlogModel} from "../types/blogs.dto";
import {WithId} from "mongodb";
import {BlogsQueryInput} from "../router/input/blogs-query.input";

export const BlogsService = {
    async findMany(queryDto: BlogsQueryInput): Promise<{
        items: WithId<BlogModel>[],
        totalCount: number
    }> {
        return await blogsRepository.findMany(queryDto);
    },

    async findByIdOrFail(id: string): Promise<WithId<BlogModel> | null> {
        return await blogsRepository.findByIdOrFail(id);
    },

    async createBlog(blog: BlogInputModel): Promise<BlogModel> {
        return await blogsRepository.createBlog(blog);
    },

    async updateBlog(id: string, blog: BlogInputModel): Promise<boolean> {
        return await blogsRepository.updateBlog(id, blog);
    },

    async deleteBlogById(id: string): Promise<void> {
        return await blogsRepository.deleteBlog(id);
    },
};