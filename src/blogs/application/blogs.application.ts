import {BlogsRepository} from "../repositories/blogs.repository";
import {BlogsQueryRepository} from "../repositories/blogs-query.repository";
import {BlogInputModel} from "../types/blogs.input-dto";
import {BlogModel} from "../types/blogs.dto";
import {WithId} from "mongodb";
import {PostInputModel} from "../../posts/types/post-input.model";
import {PostModel} from "../../posts/types/posts.dto";
import {injectable, inject} from "inversify";
import {TYPES} from "../../core/types/di-tokens";

@injectable()
export class BlogsService {
    constructor(
        @inject(TYPES.BlogsRepository)      private blogsRepository: BlogsRepository,
        @inject(TYPES.BlogsQueryRepository) private blogsQueryRepository: BlogsQueryRepository,
    ) {}

    async createBlog(blog: BlogInputModel): Promise<WithId<BlogModel>> {
        return this.blogsRepository.createBlog(blog);
    }

    async createPostForBlog(post: PostInputModel): Promise<WithId<PostModel>> {
        return this.blogsRepository.createPostForBlog(post);
    }

    async updateBlog(id: string, blog: BlogInputModel): Promise<boolean> {
        return this.blogsRepository.updateBlog(id, blog);
    }

    async deleteBlogById(id: string): Promise<void> {
        return this.blogsRepository.deleteBlog(id);
    }
}
