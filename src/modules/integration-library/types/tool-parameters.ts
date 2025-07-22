import { z } from 'zod';

export type ToolParameterType = 'string' | 'number' | 'boolean' | 'array' | 'nested';

export class ToolParameter {
    key: string;
    type: ToolParameterType;
    nestedType?: ToolParameter[];
    required: boolean;
    description: string;
    default?: any;
}

export class ToolParameterDefinition {
    parameters: ToolParameter[];

    constructor(parameters: ToolParameter[]) {
        this.parameters = parameters;
    }

    toZodDefinition(parameters: ToolParameter[] = this.parameters): z.ZodType<any, any, any> {
        const zod = z.object({});

        parameters.forEach((parameter) => {
            let zodDefinition: z.ZodType<any>;
            switch (parameter.type) {
                case 'string':
                    zodDefinition = z.string();
                    break;
                case 'number':
                    zodDefinition = z.number();
                    break;
                case 'boolean':
                    zodDefinition = z.boolean();
                    break;
                case 'array':
                    zodDefinition = z.array(this.toZodDefinition(parameter.nestedType));
                    break;
                case 'nested':
                    zodDefinition = this.toZodDefinition(parameter.nestedType);
                    break;
            }

            if (!parameter.required) {
                zodDefinition = zodDefinition.optional();
            }

            zod.extend({
                [parameter.key]: zodDefinition,
            });
        });

        return zod;
    }
}
