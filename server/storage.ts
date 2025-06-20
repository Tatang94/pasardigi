import {
  users,
  categories,
  products,
  orders,
  orderItems,
  cartItems,
  type User,
  type InsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type CartItem,
  type InsertCartItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getProducts(filters?: {
    categoryId?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    offset?: number;
  }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  getProductsBySeller(sellerId: number): Promise<Product[]>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  getOrderWithItems(orderId: number): Promise<Order & { orderItems: (OrderItem & { product: Product })[] } | undefined>;
  updateOrderStatus(orderId: number, status: string): Promise<void>;
  
  // Cart operations
  getCartItems(userId: number): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  removeFromCart(userId: number, productId: number): Promise<void>;
  clearCart(userId: number): Promise<void>;
  
  // Admin operations
  getUserCount(): Promise<number>;
  getProductCount(): Promise<number>;
  getOrderCount(): Promise<number>;
  getTotalRevenue(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      console.log("Storage: Looking for email:", email);
      const [user] = await db.select().from(users).where(eq(users.email, email));
      console.log("Storage: Found user:", user ? user.id : "none");
      return user;
    } catch (error) {
      console.error("Storage getUserByEmail error:", error);
      throw error;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Product operations
  async getProducts(filters?: {
    categoryId?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    let query = db.select().from(products).where(eq(products.isActive, true));

    if (filters) {
      const conditions = [eq(products.isActive, true)];

      if (filters.categoryId) {
        conditions.push(eq(products.categoryId, filters.categoryId));
      }

      if (filters.search) {
        conditions.push(
          like(products.title, `%${filters.search}%`)
        );
      }

      if (filters.minPrice) {
        conditions.push(sql`${products.price} >= ${filters.minPrice}`);
      }

      if (filters.maxPrice) {
        conditions.push(sql`${products.price} <= ${filters.maxPrice}`);
      }

      if (conditions.length > 1) {
        query = query.where(and(...conditions));
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.offset(filters.offset);
      }
    }

    return await query.orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getProductsBySeller(sellerId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.sellerId, sellerId));
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db.insert(orderItems).values(orderItem).returning();
    return newOrderItem;
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrderWithItems(orderId: number): Promise<Order & { orderItems: (OrderItem & { product: Product })[] } | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) return undefined;

    const items = await db
      .select({
        orderItem: orderItems,
        product: products,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    return {
      ...order,
      orderItems: items.map(item => ({ ...item.orderItem, product: item.product }))
    };
  }

  async updateOrderStatus(orderId: number, status: string): Promise<void> {
    await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId));
  }

  // Cart operations
  async getCartItems(userId: number): Promise<(CartItem & { product: Product })[]> {
    const items = await db
      .select({
        cartItem: cartItems,
        product: products,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));

    return items.map(item => ({ ...item.cartItem, product: item.product }));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, cartItem.userId),
          eq(cartItems.productId, cartItem.productId)
        )
      );

    if (existingItem.length > 0) {
      return existingItem[0];
    }

    const [newCartItem] = await db.insert(cartItems).values(cartItem).returning();
    return newCartItem;
  }

  async removeFromCart(userId: number, productId: number): Promise<void> {
    await db
      .delete(cartItems)
      .where(
        and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId)
        )
      );
  }

  async clearCart(userId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Admin operations
  async getUserCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(users);
    return result.count;
  }

  async getProductCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(products);
    return result.count;
  }

  async getOrderCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(orders);
    return result.count;
  }

  async getTotalRevenue(): Promise<number> {
    const [result] = await db
      .select({ total: sql<number>`coalesce(sum(${orders.totalAmount}), 0)` })
      .from(orders)
      .where(eq(orders.status, "completed"));
    return result.total;
  }
}

export const storage = new DatabaseStorage();
