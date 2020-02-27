import { Context } from 'mali';
import { findAll } from './bookmarks.service';

export const findAllBookmarks = async (context: Context): Promise<void> => {
    const bookmarks = await findAll();

    context.res = { bookmarks };
};
