import {db} from "../../db";

class TestingRepository {
    deleteAllData() {
        db.posts = [];
        db.blogs = [];
    }
}

export default new TestingRepository();