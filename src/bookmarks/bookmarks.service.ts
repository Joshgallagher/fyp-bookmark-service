import { getRepository } from 'typeorm';
import { Bookmark } from './bookmark.entity';

export const findAll = async (): Promise<any> => {
    const bookmarks: any = await getRepository(Bookmark).find({ select: ['articleId'] });

    return bookmarks;
};
