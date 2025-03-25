import { SerializerDeserializer, SerializerDeserializerBuilder } from './types';

export const arrayStringSerializer: SerializerDeserializer<string[], string> =
    new SerializerDeserializerBuilder<string[], string>()
        .serializer((languages: string[]) => languages.join('|'))
        .deserializer((languageString: string) => languageString.split('|'))
        .build();
