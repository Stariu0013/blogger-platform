import {PostModel} from "../../types/posts.dto";

export function mapToPostsListMappedOutput(
    items: PostModel[],
    meta: {
        totalCount: number,
        pageSize: number,
        pageNumber: number,
    }
) {
    return {
        items,
        totalCount: meta.totalCount,
        page: meta.pageNumber,
        pageSize: meta.pageSize,
        pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
    }
}