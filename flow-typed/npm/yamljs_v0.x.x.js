// flow-typed signature: e1cbd27283dfda9a1441bc166cf9ebd4
// flow-typed version: b07d8c1d78/yamljs_v0.x.x/flow_>=v0.28.0

declare module "yamljs" {
  declare type Load = (path: string) => mixed;
  declare type Parse = (yaml: string) => mixed;
  declare type Stringify = (
    obj: mixed,
    inline?: number,
    spaces?: number
  ) => string;

  declare export default {
    load: Load,
    parse: Parse,
    stringify: Stringify
  }
}
