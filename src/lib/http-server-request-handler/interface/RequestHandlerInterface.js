export interface RequestHandlerInterface {
  config: Object,
  processData(): void,
  responseData(data: Object): void,
}
