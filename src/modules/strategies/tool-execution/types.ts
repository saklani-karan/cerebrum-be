export type ExecuteToolRequest<TInput extends Record<string, any>> = {
    integrationKey: string;
    toolKey: string;
    params: TInput;
};

export interface ToolExecutionStrategy<
    TInput extends Record<string, any> = Record<string, any>,
    TOutput extends Record<string, any> = Record<string, any>,
> {
    execute(request: ExecuteToolRequest<TInput>): Promise<TOutput>;
}
