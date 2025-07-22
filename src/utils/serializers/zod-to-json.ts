import { ZodSchema } from 'zod';
import { SerializerDeserializer, SerializerDeserializerBuilder } from './types';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { jsonSchemaToZod } from 'json-schema-to-zod';

const zodToJsonSerializerDeserializer: SerializerDeserializer<
    ZodSchema,
    Record<string, any>
> = new SerializerDeserializerBuilder<ZodSchema, Record<string, any>>()
    .serializer((schema: ZodSchema) => {
        const jsonSchema = zodToJsonSchema(schema);
        return jsonSchema;
    })
    .deserializer((data: Record<string, any>) => {
        const schema = jsonSchemaToZod(data, {
            name: 'mySchema',
            module: 'esm',
            type: true,
        });

        return JSON.parse(schema);
    })
    .build();

export default zodToJsonSerializerDeserializer;
