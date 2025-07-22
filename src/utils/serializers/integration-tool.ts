import { SerializerDeserializer, SerializerDeserializerBuilder } from './types';

export const integrationToolSerializerDeserializer: SerializerDeserializer<
    {
        integrationKey: string;
        action: string;
    },
    string
> = new SerializerDeserializerBuilder<
    {
        integrationKey: string;
        action: string;
    },
    string
>()
    .serializer((params: { integrationKey: string; action: string }) => {
        return [params.integrationKey, params.action].join('$$');
    })
    .deserializer((val: string) => {
        const [integrationKey, action] = val.split('$$');
        return {
            integrationKey,
            action,
        };
    })
    .build();
