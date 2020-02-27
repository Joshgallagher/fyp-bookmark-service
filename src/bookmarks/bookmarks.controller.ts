import { Context } from 'mali';
import { findAll } from './bookmarks.service';

export const findAllBookmarks = async (context: Context): Promise<void> => {
    const { subject } = context.request.req;

    const bookmarks = await findAll(subject);

    context.res = { bookmarks };
};
