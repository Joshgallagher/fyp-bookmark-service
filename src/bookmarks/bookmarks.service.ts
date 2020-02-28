import { getRepository } from 'typeorm';
import { Bookmark } from './bookmark.entity';
import RpcException from 'grpc-error';
import { status } from 'grpc';

export const create = async (data: Record<string, any>): Promise<any> => {
    const { subject: userId, articleId } = data;

    if (!!(await getRepository(Bookmark).findOne({ where: { userId, articleId } }))) {
        throw new RpcException('BOOKMARK_EXISTS', status.ALREADY_EXISTS, {
            error: 'You have already bookmarked this article',
        });
    }

    try {
        await Bookmark.create({ userId, articleId }).save();
    } catch (e) {
        throw new RpcException('INTERNAL_ERROR', status.INTERNAL, {
            error: 'Something went wrong when attempting to save your bookmark',
        });
    }

    return true;
};

export const findAll = async (userId: string): Promise<any> => {
    return await getRepository(Bookmark).find({ select: ['articleId'], where: { userId }, order: { id: 'DESC' } });
};
