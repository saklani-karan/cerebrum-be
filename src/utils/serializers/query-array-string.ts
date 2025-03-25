import { SerializerDeserializer, SerializerDeserializerBuilder } from "./types";

export const queryArrayStringSerializer: SerializerDeserializer<
	string[],
	string
> = new SerializerDeserializerBuilder<string[], string>()
	.serializer((queryString: string[]) => queryString.join(","))
	.deserializer((queryString: string) => queryString.split(","))
	.build();
