export type CommentInputModel = {
    content: string;
}

export type CommentViewModal = {
    id?: string;
    content: string;
    commentatorInfo: CommentatorInfo;
    createdAt: string;
}

export type CommentatorInfo = {
    userId: string;
    userLogin: string;
}