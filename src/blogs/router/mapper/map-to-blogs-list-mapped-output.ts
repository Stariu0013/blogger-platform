import {BlogModel} from "../../types/blogs.dto";

export function mapToBlogsListMappedOutput(
    blogs: BlogModel[],
    meta: {
        pageNumber: number,
        pageSize: number,
        totalCount: number,
    }) {
    return {
        items: blogs,
        totalCount: meta.totalCount,
        page: +meta.pageNumber,
        pageSize: meta.pageSize,
        pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
    };
}