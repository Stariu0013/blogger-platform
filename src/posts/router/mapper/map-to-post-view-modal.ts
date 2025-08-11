import {WithId} from "mongodb";
import {PostInputModel} from "../../types/post-input.model";
import {PostModel} from "../../types/posts.dto";

export const mapToPostViewModal = (input: WithId<PostInputModel>): PostModel => {
    return {
        id: input._id.toString(),
        blogName: input.blogName,
        blogId: input.blogId,
        title: input.title,
        shortDescription: input.shortDescription,
        content: input.content,
        createdAt: input.createdAt,
    }
};