import {db} from "../../db";
import {PostInputModel} from "../types/post-input.model";

class PostsRepository {
    getAllPosts() {
        return db.posts;
    }

    getPostById(id: string) {
        return db.posts.find(post => post.id === id) ?? null;
    }

    createPost(post: PostInputModel) {
        const newPost = {
            ...post,
            blogName: post.title,
            id: (db.posts.length + 1).toString(),
        }
        db.posts.push(newPost);

        return newPost;
    }

    updatePost(id: string, post: PostInputModel) {
        const targetPost = db.posts.find(post => post.id === id);

        if (!targetPost) {
            throw new Error("Post not found");
        }

        targetPost.title = post.title;
        targetPost.content = post.content;
        targetPost.blogId = post.blogId;
        targetPost.blogName = post.blogName;
        targetPost.shortDescription = post.shortDescription;

        return;
    }

    deletePost(id: string) {
        const targetPostIndex = db.posts.findIndex(post => post.id === id);

        if (targetPostIndex === -1) {
            throw new Error("Post not found");
        }

        db.posts.splice(targetPostIndex, 1);
        return;
    }
}

export default new PostsRepository();