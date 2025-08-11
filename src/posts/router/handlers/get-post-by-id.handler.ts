import {HttpStatuses} from "../../../core/types/http-statuses";
import {Request, Response} from "express";
import {PostInputModel} from "../../types/post-input.model";
import PostsRepository from "../../repositories/posts.repository";
import {mapToPostViewModal} from "../mapper/map-to-post-view-modal";

export const getPostByIdHandler = async (
    req: Request<{id: string}, PostInputModel, {}, {}>, res: Response
) => {
    const {id} = req.params;

    const post = await PostsRepository.getPostById(id);

    if (!post) {
        res.sendStatus(HttpStatuses.NOT_FOUND);

        return;
    }

    const mappedPost = mapToPostViewModal(post);

    res.status(HttpStatuses.OK).send(mappedPost);
};