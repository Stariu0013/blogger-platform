import {WithId} from "mongodb";
import {BlogModel} from "../../types/blogs.dto";
import {BlogInputModel} from "../../types/blogs.input-dto";

export const mapToBlogViewModal = (input: WithId<BlogInputModel>): BlogModel => {
    return {
        id: input._id.toString(),
        name: input.name,
        websiteUrl: input.websiteUrl,
        description: input.description,
    }
};