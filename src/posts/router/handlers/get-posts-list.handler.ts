import {HttpStatuses} from "../../../core/types/http-statuses";
import {Request, Response} from "express";
import PostsRepository from "../../repositories/posts.repository";

export const getPostsListHandler = (req: Request, res: Response) => {
    const blogs = PostsRepository.getAllPosts();

    res.status(HttpStatuses.OK).send(blogs);
};