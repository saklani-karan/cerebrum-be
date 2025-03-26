export interface SignPasswordStrategyInterface {
    sign(password: string): Promise<string>;
    compare(password: string, hash: string): Promise<boolean>;
}
