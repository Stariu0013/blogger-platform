import {BlogsQueryInput} from "../router/input/blogs-query.input";
import {BlogModel} from "../types/blogs.dto";
import {blogsCollection, postsCollection} from "../../core/db/mongo.db";
import {mapToBlogViewModal} from "../router/mapper/map-to-blog-view-modal";
import {ObjectId, WithId} from "mongodb";
import {PostModel} from "../../posts/types/posts.dto";
import {mapToPostViewModal} from "../../posts/router/mapper/map-to-post-view-modal";

export const blogsQueryRepository = {
    async findMany(queryDto: BlogsQueryInput): Promise<{
        items: BlogModel[],
        totalCount: number
    }> {
        const {
            searchNameTerm,
            pageSize,
            sortBy,
            pageNumber,
            sortDirection
        } = queryDto;

        const filter: any = {};
        const skip = pageSize * (pageNumber - 1);

        if (searchNameTerm) {
            filter.name = {
                $regex: searchNameTerm,
                $options: "i"
            }
        }

        const blogs = await blogsCollection.find(filter).sort({[sortBy]: sortDirection}).skip(skip).limit(pageSize).toArray();
        const totalCount = await blogsCollection.countDocuments(filter);
        const mapperBlogs = blogs.map(item => mapToBlogViewModal(item));

        return {
            items: mapperBlogs,
            totalCount
        };
    },

    async findByIdOrFail(id: string): Promise<WithId<BlogModel> | null> {
        const res = blogsCollection.findOne({_id: new ObjectId(id)});

        if (!res) {
            throw new Error("Blog not found");
        }

        return res;
    },

    async findPostsByBlogId(id: string, queryDto: BlogsQueryInput): Promise<{
        items: PostModel[],
        totalCount: number
    }> {
        const {
            pageSize,
            sortBy,
            pageNumber,
            sortDirection
        } = queryDto;
        const skip = pageSize * (pageNumber - 1);

        const items = await postsCollection.find({ blogId: id}).sort({[sortBy]: sortDirection}).skip(skip).limit(pageSize).toArray();
        const totalCount = await postsCollection.countDocuments({ blogId: id});
        const mappedItems = items.map(item => mapToPostViewModal(item));

        return {
            items: mappedItems,
            totalCount
        };
    }
}