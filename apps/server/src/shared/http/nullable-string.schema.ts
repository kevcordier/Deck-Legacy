import { z } from 'zod';

/**
 * `string | null`. The explicit OpenAPI 3.0 form is needed: `@nestjs/swagger` reads zod's
 * `type: ['string', 'null']` as an array of strings.
 */
export const nullableStringSchema = z.string().nullable().meta({ type: 'string', nullable: true });
