import {
    Entity,
    Column,
    BaseEntity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
} from 'typeorm';

@Entity()
@Unique(['userId', 'articleId'])
export class Bookmark extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    userId: string;

    @Column({ nullable: false })
    articleId: number;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;
}
