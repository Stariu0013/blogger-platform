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
        ...meta,
        pageCount: Math.ceil(meta.totalCount / meta.pageSize),
    };
}