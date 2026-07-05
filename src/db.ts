import Dexie, { type Table } from "dexie";
import type { Client, ClientPrice, Order, Product } from "./types";
import { SEED_PRODUCTS } from "./seedProducts";

class TuwaDatabase extends Dexie {
  products!: Table<Product, number>;
  clients!: Table<Client, number>;
  clientPrices!: Table<ClientPrice, number>;
  orders!: Table<Order, number>;

  constructor() {
    super("tuwa-cr-pro");

    this.version(1).stores({
      products: "++id, &code, description",
      clients: "++id, name",
      clientPrices: "++id, clientId, productId, [clientId+productId]",
      orders: "++id, clientId, createdAt",
    });

    this.version(2)
      .stores({
        products: "++id, &code, description",
        clients: "++id, name",
        clientPrices: "++id, clientId, productId, [clientId+productId]",
        orders: "++id, clientId, createdAt",
      })
      .upgrade(async (tx) => {
        await tx
          .table("products")
          .toCollection()
          .modify((p: Product & { price?: number }) => {
            p.distribuidorCRC = p.price ?? 0;
            p.veinsaRegularUSD = p.veinsaRegularUSD ?? 0;
            p.veinsaEspecialUSD = p.veinsaEspecialUSD ?? 0;
            p.agenteAutorizadoCRC = p.agenteAutorizadoCRC ?? 0;
            delete p.price;
          });
        await tx
          .table("clients")
          .toCollection()
          .modify((c: Client) => {
            c.priceCategory = c.priceCategory ?? "distribuidor";
          });
      });

    this.on("populate", () => {
      this.products.bulkAdd(SEED_PRODUCTS.map((p) => ({ ...p, createdAt: Date.now() })));
    });
  }
}

export const db = new TuwaDatabase();
