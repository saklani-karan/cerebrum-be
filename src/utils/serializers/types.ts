export class SerializerDeserializer<TInput, TOutput> {
    private serializer: (params: TInput) => TOutput;
    private deserializer: (params: TOutput) => TInput;
    constructor(
        serializer: (params: TInput) => TOutput,
        deserializer: (params: TOutput) => TInput,
    ) {
        this.serializer = serializer;
        this.deserializer = deserializer;
    }
    serialize(input: TInput): TOutput {
        return this.serializer(input);
    }
    deserialize(output: TOutput): TInput {
        return this.deserializer(output);
    }
}

export class SerializerDeserializerBuilder<TInput, TOutput> {
    private _serializer: (params: TInput) => TOutput = null;
    private _deserializer: (params: TOutput) => TInput = null;

    serializer(fn: (params: TInput) => TOutput): SerializerDeserializerBuilder<TInput, TOutput> {
        this._serializer = fn;
        return this;
    }

    deserializer(fn: (params: TOutput) => TInput): SerializerDeserializerBuilder<TInput, TOutput> {
        this._deserializer = fn;
        return this;
    }

    build(): SerializerDeserializer<TInput, TOutput> {
        if (!this._serializer) {
            throw new Error('Serializer not set before building');
        }
        if (!this._deserializer) {
            throw new Error('Deserializer not set before building');
        }
        return new SerializerDeserializer<TInput, TOutput>(this._serializer, this._deserializer);
    }
}
