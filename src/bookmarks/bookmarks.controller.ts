import { Context } from 'mali';
import { create, findAll, remove } from './bookmarks.service';

export const createBookmark = async (context: Context): Promise<void> => {
    const bookmarked = await create(context.request.req);

    context.res = { bookmarked };
};

export const findAllBookmarks = async (context: Context): Promise<void> => {
    const { subject } = context.request.req;
    const bookmarks = await findAll(subject);

    context.res = { bookmarks };
};

export const removeBookmark = async (context: Context): Promise<void> => {
    const removed = await remove(context.request.req);

    context.res = { removed };
};
