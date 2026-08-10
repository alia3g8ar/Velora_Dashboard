import { SetMetadata } from '@nestjs/common';

export const PUBLIC_KEY = 'isPublic';

export const IsPublic = () => SetMetadata(PUBLIC_KEY, true);
