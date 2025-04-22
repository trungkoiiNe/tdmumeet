import { toast } from "@baronha/ting";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  getFirestore,
  Timestamp,
} from "@react-native-firebase/firestore";
import { create } from "zustand";

const db = getFirestore();

type ToastType = "done" | "error";
const showToast = (type: ToastType, message: string) => {
  toast({ preset: type, message });
};
const handleError = (error: unknown, message: string): null => {
  console.error(`${message}:`, error);
  showToast("error", message);
  return null;
};

export type Visibility = "public" | "team" | "private";

export type Post = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  updatedAt: number;
  imageBase64: string;
  likes: number;
  likedBy: string[];
  commentsCount: number;
  tags: string[];
  isPinned: boolean;
  visibility: "public" | "team" | "private";
  attachmentUrls: string[];
};

type PostStore = {
  posts: Post[];
  loading: boolean;
  listenToPosts: (teamId: string) => () => void;
  fetchPosts: (teamId: string) => Promise<void>;
  getPostById: (teamId: string, postId: string) => Promise<Post | null>;
  addPost: (teamId: string, post: Omit<Post, "id" | "createdAt" | "updatedAt">) => Promise<string | null>;
  updatePost: (teamId: string, post: Post) => Promise<void>;
  deletePost: (teamId: string, postId: string) => Promise<void>;
  likePost: (teamId: string, postId: string, userId: string) => Promise<void>;
  unlikePost: (teamId: string, postId: string, userId: string) => Promise<void>;
};

// Comment type
export type Comment = {
  commentId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: number;
  parentId: string;
  replyToName: string;
  likes: number;
  likedBy: string[];
  isDeleted: boolean;
  childrenCount: number;
};

// Comment store methods
export type CommentStore = {
  fetchComments: (teamId: string, postId: string, parentId?: string) => Promise<Comment[]>;
  addComment: (teamId: string, postId: string, comment: Omit<Comment, 'commentId' | 'createdAt' | 'likes' | 'likedBy' | 'isDeleted' | 'childrenCount'>) => Promise<string | null>;
  updateComment: (teamId: string, postId: string, commentId: string, content: string) => Promise<void>;
  deleteComment: (teamId: string, postId: string, commentId: string) => Promise<void>;
  likeComment: (teamId: string, postId: string, commentId: string, userId: string) => Promise<void>;
  unlikeComment: (teamId: string, postId: string, commentId: string, userId: string) => Promise<void>;
  getCommentById: (teamId: string, postId: string, commentId: string) => Promise<Comment | null>;
};

export const usePostStore = create<PostStore & CommentStore>((set, get) => ({

  posts: [],
  loading: false,

  // Fetch comments (optionally by parentId)
  fetchComments: async (teamId, postId, parentId = "") => {
    try {
      const commentsRef = collection(db, "teams", teamId, "posts", postId, "comments");
      let q = query(commentsRef, orderBy("createdAt", "asc"));
      const snapshot = await getDocs(q);
      let comments: Comment[] = snapshot.docs.map((doc) => ({
        commentId: doc.id,
        ...doc.data(),
      })) as Comment[];
      if (parentId !== "") {
        comments = comments.filter((c) => c.parentId === parentId);
      }
      return comments;
    } catch (error) {
      handleError(error, "Không thể tải bình luận");
      return [];
    }
  },

  // Add comment
  addComment: async (teamId, postId, comment) => {
    try {
      const commentsRef = collection(db, "teams", teamId, "posts", postId, "comments");
      const now = Date.now();
      const newComment = {
        ...comment,
        createdAt: now,
        likes: 0,
        likedBy: [],
        isDeleted: false,
        childrenCount: 0,
      };
      const docRef = await addDoc(commentsRef, newComment);
      showToast("done", "Đã thêm bình luận");
      return docRef.id;
    } catch (error) {
      handleError(error, "Không thể thêm bình luận");
      return null;
    }
  },

  // Update comment content
  updateComment: async (teamId, postId, commentId, content) => {
    try {
      const commentRef = doc(db, "teams", teamId, "posts", postId, "comments", commentId);
      await updateDoc(commentRef, { content });
      showToast("done", "Đã cập nhật bình luận");
    } catch (error) {
      handleError(error, "Không thể cập nhật bình luận");
    }
  },

  // Mark comment as deleted
  deleteComment: async (teamId, postId, commentId) => {
    try {
      const commentRef = doc(db, "teams", teamId, "posts", postId, "comments", commentId);
      await updateDoc(commentRef, { isDeleted: true, content: "" });
      showToast("done", "Đã xoá bình luận");
    } catch (error) {
      handleError(error, "Không thể xoá bình luận");
    }
  },

  // Like comment
  likeComment: async (teamId, postId, commentId, userId) => {
    try {
      const commentRef = doc(db, "teams", teamId, "posts", postId, "comments", commentId);
      const commentSnap = await getDoc(commentRef);
      if (!commentSnap.exists) return;
      const data = commentSnap.data();
      const likedByArr = Array.isArray(data.likedBy) ? data.likedBy : [];
      if (likedByArr.includes(userId)) return;
      await updateDoc(commentRef, {
        likes: (data.likes || 0) + 1,
        likedBy: [...(data.likedBy || []), userId],
      });
    } catch (error) {
      handleError(error, "Không thể like bình luận");
    }
  },

  // Unlike comment
  unlikeComment: async (teamId, postId, commentId, userId) => {
    try {
      const commentRef = doc(db, "teams", teamId, "posts", postId, "comments", commentId);
      const commentSnap = await getDoc(commentRef);
      if (!commentSnap.exists) return;
      const data = commentSnap.data();
      const likedByArr = Array.isArray(data.likedBy) ? data.likedBy : [];
      if (!likedByArr.includes(userId)) return;
      await updateDoc(commentRef, {
        likes: Math.max(0, (data.likes || 1) - 1),
        likedBy: likedByArr.filter((id: string) => id !== userId),
      });
    } catch (error) {
      handleError(error, "Không thể bỏ like bình luận");
    }
  },

  // Get comment by id
  getCommentById: async (teamId, postId, commentId) => {
    try {
      const commentRef = doc(db, "teams", teamId, "posts", postId, "comments", commentId);
      const docSnap = await getDoc(commentRef);
      if (!docSnap.exists) return null;
      return { commentId: docSnap.id, ...docSnap.data() } as Comment;
    } catch (error) {
      handleError(error, "Không thể lấy bình luận");
      return null;
    }
  },

  listenToPosts: (teamId) => {
    const postsRef = collection(db, "teams", teamId, "posts");
    const q = query(postsRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts: Post[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      set({ posts });
    });
    return unsubscribe;
  },

  fetchPosts: async (teamId) => {
    set({ loading: true });
    try {
      const postsRef = collection(db, "teams", teamId, "posts");
      const q = query(postsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const posts: Post[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      set({ posts });
    } catch (error) {
      handleError(error, "Không thể tải bài viết");
    } finally {
      set({ loading: false });
    }
  },

  getPostById: async (teamId, postId) => {
    try {
      const postRef = doc(db, "teams", teamId, "posts", postId);
      const docSnap = await getDoc(postRef);
      if (!docSnap.exists) return null;
      return { id: docSnap.id, ...docSnap.data() } as Post;
    } catch (error) {
      handleError(error, "Không thể lấy bài viết");
      return null;
    }
  },

  addPost: async (teamId, post) => {
    try {
      const now = Date.now();
      const postsRef = collection(db, "teams", teamId, "posts");
      const newPost = {
        ...post,
        createdAt: now,
        updatedAt: now,
        likes: 0,
        likedBy: [],
        commentsCount: 0,
        attachmentUrls: post.attachmentUrls ?? [],
      };
      const docRef = await addDoc(postsRef, newPost);
      showToast("done", "Đã đăng bài viết!");
      return docRef.id;
    } catch (error) {
      handleError(error, "Không thể đăng bài viết");
      return null;
    }
  },

  updatePost: async (teamId, post) => {
    try {
      const postRef = doc(db, "teams", teamId, "posts", post.id);
      await updateDoc(postRef, {
        ...post,
        updatedAt: Date.now(),
      });
      showToast("done", "Đã cập nhật bài viết!");
    } catch (error) {
      handleError(error, "Không thể cập nhật bài viết");
    }
  },

  deletePost: async (teamId, postId) => {
    try {
      const postRef = doc(db, "teams", teamId, "posts", postId);
      await deleteDoc(postRef);
      showToast("done", "Đã xóa bài viết!");
    } catch (error) {
      handleError(error, "Không thể xóa bài viết");
    }
  },

  likePost: async (teamId, postId, userId) => {
    try {
      const postRef = doc(db, "teams", teamId, "posts", postId);
      await updateDoc(postRef, {
        likes: (await getDoc(postRef)).data()?.likes + 1 || 1,
        likedBy: [...((await getDoc(postRef)).data()?.likedBy || []), userId],
      });
    } catch (error) {
      handleError(error, "Không thể thích bài viết");
    }
  },

  unlikePost: async (teamId, postId, userId) => {
    try {
      const postRef = doc(db, "teams", teamId, "posts", postId);
      const postSnap = await getDoc(postRef);
      const likedBy = postSnap.data()?.likedBy || [];
      await updateDoc(postRef, {
        likes: Math.max((postSnap.data()?.likes || 1) - 1, 0),
        likedBy: likedBy.filter((id: string) => id !== userId),
      });
    } catch (error) {
      handleError(error, "Không thể bỏ thích bài viết");
    }
  },
}));
