import {db} from "../../db";
import {BlogInputModel} from "../types/blogs.input-dto";
import {BlogModel} from "../types/blogs.dto";

class BlogsRepository {
    getAllBlogs() {
        return db.blogs;
    }

    getBlogById(id: string) {
        return db.blogs.find(blog => blog.id === id) ?? null;
    }

    createBlog(blog: BlogInputModel) {
        const newBlog = {
            ...blog,
            id: (db.blogs.length + 1).toString(),
        };

        db.blogs.push(newBlog);

        return newBlog;
    }

    updateBlog(id: string, blog: BlogModel) {
        const targetBlog = db.blogs.find(blog => blog.id === id);

        if (!targetBlog) {
            throw new Error("Blog not found");
        }

        targetBlog.name = blog.name;
        targetBlog.description = blog.description;
        targetBlog.websiteUrl = blog.websiteUrl;

        return;
    }

    deleteBlog(id: string) {
        const targetBlogIndex = db.blogs.findIndex(blog => blog.id === id);

        if (targetBlogIndex === -1) {
            throw new Error("Blog not found");
        }

        db.blogs.splice(targetBlogIndex, 1);
        return;
    }
}

export default new BlogsRepository();