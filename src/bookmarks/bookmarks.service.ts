import { getRepository } from 'typeorm';
import { Bookmark } from './bookmark.entity';

export const findAll = async (userId: string): Promise<any> => {
    return await getRepository(Bookmark).find({ select: ['articleId'], where: { userId }, order: { id: 'DESC' } });
};
