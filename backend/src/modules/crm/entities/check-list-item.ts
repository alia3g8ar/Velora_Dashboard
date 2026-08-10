import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsString } from 'class-validator';

@ObjectType('CheckListItem')
export class CheckListItem {
    @Field()
    title: string;

    @Field()
    checked: boolean;
}

@InputType('ChecklistItemInput')
export class ChecklistItemInput {
    @Field()
    @IsString()
    title: string;

    @Field()
    @IsBoolean()
    checked: boolean;
}
