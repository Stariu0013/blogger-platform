import {WithId} from "mongodb";
import {PostModel} from "../../types/posts.dto";

export function mapToPostsListMappedOutput(
    items: WithId<PostModel>[],
    meta: {
        totalCount: number,
        pageSize: number,
        pageNumber: number,
    }
) {
    return {
        items,
        ...meta,
        pageCount: Math.ceil(meta.totalCount / meta.pageSize),
    }
}