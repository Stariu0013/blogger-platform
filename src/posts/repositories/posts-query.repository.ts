import {PostsQueryInput} from "../router/input/posts-query.input";
import {PostModel} from "../types/posts.dto";
import {postsCollection} from "../../core/db/mongo.db";
import {mapToPostViewModal} from "../router/mapper/map-to-post-view-modal";
import {ObjectId, WithId} from "mongodb";
import {injectable} from "inversify";

@injectable()
export class PostsQueryRepository {
    async findMany(queryDto: PostsQueryInput): Promise<{items: PostModel[]; totalCount: number}> {
        const {pageSize, sortBy, sortDirection, pageNumber} = queryDto;
        const skip = pageSize * (pageNumber - 1);

        const posts = await postsCollection
            .find()
            .skip(skip)
            .sort({[sortBy]: sortDirection})
            .limit(pageSize)
            .toArray();
        const totalCount = await postsCollection.countDocuments();

        return {items: posts.map(item => mapToPostViewModal(item)), totalCount};
    }

    async findByIdOrFail(id: string): Promise<WithId<PostModel> | null> {
        return postsCollection.findOne({_id: new ObjectId(id)});
    }
}
