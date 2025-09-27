import {BlogModel} from "../../types/blogs.dto";
import {WithId} from "mongodb";

export function mapToBlogsListMappedOutput(
    blogs: WithId<BlogModel>[],
    meta: {
        pageNumber: number,
        pageSize: number,
        totalCount: number,
    }) {
    return {
        items: blogs,
        totalCount: meta.totalCount,
        page: meta.pageNumber,
        pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
    };
}