import {CommentViewModal} from "../../types";
import {mapToCommentViewModal} from "./map-to-comment-view-modal";
import {WithId} from "mongodb";

export function mapToCommentListMappedOutput(
    items: WithId<CommentViewModal>[],
    meta: {
        totalCount: number,
        pageSize: number,
        pageNumber: number,
    }
) {
    return {
        items: items.map(item => {
            return mapToCommentViewModal(item);
        }),
        totalCount: meta.totalCount,
        page: meta.pageNumber,
        pageSize: meta.pageSize,
        pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
    }
}