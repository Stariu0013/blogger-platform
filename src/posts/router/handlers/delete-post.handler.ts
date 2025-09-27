import {Request, Response} from "express";
import {createErrorMessage} from "../../../core/utils/creaste-error-message";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {PostInputModel} from "../../types/post-input.model";
import {PostsService} from "../../application/posts.application";
import {BlogsService} from "../../../blogs/application/blogs.application";

export const deletePostHandler = async (
    req: Request<{id: string}, PostInputModel, {}, {}>,
    res: Response
) => {
    try {
        const {id} = req.params;

        const post = await PostsService.findByIdOrFail(id);

        if (!post) {
            res.status(HttpStatuses.NOT_FOUND).send(createErrorMessage(
                [
                    {
                        field: "post",
                        message: "Post not found"
                    }
                ]
            ));

            return;
        }

        BlogsService.deleteBlogById(id);

        res.sendStatus(HttpStatuses.NO_CONTENT);
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);
    }
};