import type { IProduct } from "../interfaces/IProduct";
import type { IStoreApi } from "./IStoreTypes";
export interface IProductApi extends Omit<IProduct, "store"> {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
    store: string | IStoreApi;
}
//# sourceMappingURL=IProductTypes.d.ts.map