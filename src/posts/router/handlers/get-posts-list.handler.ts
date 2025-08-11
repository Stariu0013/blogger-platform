import {HttpStatuses} from "../../../core/types/http-statuses";
import {Request, Response} from "express";
import PostsRepository from "../../repositories/posts.repository";

export const getPostsListHandler = (req: Request, res: Response) => {
    try {
        const blogs = PostsRepository.getAllPosts();

        res.status(HttpStatuses.OK).send(blogs);
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);
    }
};