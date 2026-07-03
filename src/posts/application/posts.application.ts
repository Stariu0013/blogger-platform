import {PostsQueryInput} from "../router/input/posts-query.input";
import {WithId} from "mongodb";
import {PostModel} from "../types/posts.dto";
import {PostsRepository} from "../repositories/posts.repository";
import {PostsQueryRepository} from "../repositories/posts-query.repository";
import {BlogsQueryRepository} from "../../blogs/repositories/blogs-query.repository";
import {injectable, inject} from "inversify";
import {TYPES} from "../../core/types/di-tokens";

@injectable()
export class PostsService {
    constructor(
        @inject(TYPES.PostsRepository)      private postsRepository: PostsRepository,
        @inject(TYPES.PostsQueryRepository) private postsQueryRepository: PostsQueryRepository,
        @inject(TYPES.BlogsQueryRepository) private blogsQueryRepository: BlogsQueryRepository,
    ) {}

    async findMany(queryDto: PostsQueryInput): Promise<{items: PostModel[]; totalCount: number}> {
        return this.postsQueryRepository.findMany(queryDto);
    }

    async findByIdOrFail(id: string): Promise<WithId<PostModel> | null> {
        return this.postsQueryRepository.findByIdOrFail(id);
    }

    async createPost(post: PostModel): Promise<WithId<PostModel>> {
        const {blogId} = post;
        const blogItem = await this.blogsQueryRepository.findByIdOrFail(blogId as string);
        post.blogName = blogItem?.name || post.title;
        return this.postsRepository.createPost(post);
    }

    async updatePost(id: string, post: PostModel): Promise<boolean> {
        return this.postsRepository.updatePost(id, post);
    }

    deletePostById(id: string): Promise<void> {
        return this.postsRepository.deletePost(id);
    }
}
