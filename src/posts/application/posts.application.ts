import {PostsQueryInput} from "../router/input/posts-query.input";
import {WithId} from "mongodb";
import {PostModel} from "../types/posts.dto";
import postsRepository from "../repositories/posts.repository";
import {BlogsService} from "../../blogs/application/blogs.application";
import {postsQueryRepository} from "../repositories/posts-query.repository";
import {blogsQueryRepository} from "../../blogs/repositories/blogs-query.repository";

export const PostsService = {
    async findMany(queryDto: PostsQueryInput): Promise<{
        items: PostModel[]
        totalCount: number
    }> {
        return await postsQueryRepository.findMany(queryDto);
    },
    async findByIdOrFail(id: string): Promise<WithId<PostModel> | null> {
        return await postsQueryRepository.findByIdOrFail(id);
    },
    async createPost(post: PostModel): Promise<WithId<PostModel>> {
        const { blogId } = post;

        const blogItem = await blogsQueryRepository.findByIdOrFail(blogId as string);

        post.blogName = blogItem?.name || post.title;

        return await postsRepository.createPost(post);
    },
    async updatePost(id: string, post: PostModel): Promise<boolean> {
        return await postsRepository.updatePost(id, post);
    },
    deletePostById(id: string): Promise<void> {
        return postsRepository.deletePost(id);
    }
}