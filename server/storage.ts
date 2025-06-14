import { users, products, cartItems, type User, type InsertUser, type Product, type InsertProduct, type CartItem, type InsertCartItem } from "@shared/schema";
import { db } from "./db";
import { eq, sql, and } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;

  // Cart methods
  getCartItems(userId: number): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(userId: number, productId: number, quantity: number): Promise<void>;
  removeFromCart(userId: number, productId: number): Promise<void>;
  clearCart(userId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private userIdCounter: number;
  private productIdCounter: number;
  private cartIdCounter: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.userIdCounter = 1;
    this.productIdCounter = 1;
    this.cartIdCounter = 1;
    
    this.seedProducts();
  }

  private seedProducts() {
    const sampleProducts: Omit<Product, 'id'>[] = [
      {
        name: "Computador Gamer RGB Pro",
        description: "Intel i7, 16GB RAM, RTX 4070, SSD 1TB",
        price: "3499.00",
        image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
        category: "computadores",
        specifications: ["Intel Core i7-12700F", "16GB DDR4 3200MHz", "NVIDIA RTX 4070 8GB", "SSD 1TB NVMe", "Fonte 650W 80+ Bronze", "Gabinete Mid Tower com RGB"],
        inStock: true,
      },
      {
        name: "Notebook Dell Inspiron 15",
        description: "Intel i5, 8GB RAM, SSD 256GB, Tela 15.6\"",
        price: "2299.00",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
        category: "notebooks",
        specifications: ["Intel Core i5-1135G7", "8GB DDR4", "SSD 256GB", "Tela 15.6\" Full HD", "Windows 11", "Bateria 3 células"],
        inStock: true,
      },
      {
        name: "Teclado Mecânico Gamer RGB",
        description: "Switch Blue, LED RGB, ABNT2",
        price: "349.00",
        image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
        category: "perifericos",
        specifications: ["Switch Mecânico Blue", "LED RGB customizável", "Layout ABNT2", "Anti-ghosting", "Cabo USB removível"],
        inStock: true,
      },
      {
        name: "Monitor Gamer 27\" 144Hz",
        description: "Full HD, 1ms, FreeSync, Curvo",
        price: "899.00",
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
        category: "perifericos",
        specifications: ["27 polegadas", "Resolução Full HD 1920x1080", "Taxa de atualização 144Hz", "Tempo de resposta 1ms", "AMD FreeSync", "Curvatura 1500R"],
        inStock: true,
      },
      {
        name: "Mouse Gamer RGB Pro",
        description: "16000 DPI, 7 Botões, RGB Customizável",
        price: "199.00",
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
        category: "perifericos",
        specifications: ["Sensor óptico 16000 DPI", "7 botões programáveis", "LED RGB customizável", "Ergonomia para destros", "Cabo trançado 1.8m"],
        inStock: true,
      },
      {
        name: "Headset Gamer Surround",
        description: "7.1 Virtual, Microfone Noise Cancelling",
        price: "299.00",
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
        category: "perifericos",
        specifications: ["Som surround 7.1 virtual", "Microfone com cancelamento de ruído", "Drivers 50mm", "Almofadas em couro", "Compatível PC e consoles"],
        inStock: true,
      },
    ];

    sampleProducts.forEach(product => {
      const id = this.productIdCounter++;
      this.products.set(id, { ...product, id });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const id = this.userIdCounter++;
    const user: User = {
      ...insertUser,
      id,
      password: hashedPassword,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.category === category);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.products.values())
      .filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      );
  }

  async getCartItems(userId: number): Promise<(CartItem & { product: Product })[]> {
    const userCartItems = Array.from(this.cartItems.values())
      .filter(item => item.userId === userId);
    
    return userCartItems.map(item => ({
      ...item,
      product: this.products.get(item.productId)!
    }));
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values())
      .find(item => item.userId === insertCartItem.userId && item.productId === insertCartItem.productId);

    if (existingItem) {
      // Update quantity
      existingItem.quantity += insertCartItem.quantity || 1;
      this.cartItems.set(existingItem.id, existingItem);
      return existingItem;
    } else {
      // Add new item
      const id = this.cartIdCounter++;
      const cartItem: CartItem = { ...insertCartItem, quantity: insertCartItem.quantity || 1, id };
      this.cartItems.set(id, cartItem);
      return cartItem;
    }
  }

  async updateCartItemQuantity(userId: number, productId: number, quantity: number): Promise<void> {
    const item = Array.from(this.cartItems.values())
      .find(item => item.userId === userId && item.productId === productId);
    
    if (item) {
      if (quantity <= 0) {
        this.cartItems.delete(item.id);
      } else {
        item.quantity = quantity;
        this.cartItems.set(item.id, item);
      }
    }
  }

  async removeFromCart(userId: number, productId: number): Promise<void> {
    const item = Array.from(this.cartItems.values())
      .find(item => item.userId === userId && item.productId === productId);
    
    if (item) {
      this.cartItems.delete(item.id);
    }
  }

  async clearCart(userId: number): Promise<void> {
    const userCartItems = Array.from(this.cartItems.entries())
      .filter(([, item]) => item.userId === userId);
    
    userCartItems.forEach(([id]) => {
      this.cartItems.delete(id);
    });
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.category, category));
  }

  async searchProducts(query: string): Promise<Product[]> {
    return await db.query.products.findMany({
      where: (products, { or, ilike }) => or(
        ilike(products.name, `%${query}%`),
        ilike(products.description, `%${query}%`)
      ),
    });
  }

  async getCartItems(userId: number): Promise<(CartItem & { product: Product })[]> {
    return await db.query.cartItems.findMany({
      where: eq(cartItems.userId, userId),
      with: {
        product: true,
      },
    });
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = await db.query.cartItems.findFirst({
      where: (cartItems, { and, eq }) => and(
        eq(cartItems.userId, insertCartItem.userId),
        eq(cartItems.productId, insertCartItem.productId)
      ),
    });

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + (insertCartItem.quantity || 1) })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Add new item
      const [cartItem] = await db
        .insert(cartItems)
        .values({
          ...insertCartItem,
          quantity: insertCartItem.quantity || 1,
        })
        .returning();
      return cartItem;
    }
  }

  async updateCartItemQuantity(userId: number, productId: number, quantity: number): Promise<void> {
    if (quantity <= 0) {
      await db
        .delete(cartItems)
        .where(
          and(eq(cartItems.userId, userId), eq(cartItems.productId, productId))
        );
    } else {
      await db
        .update(cartItems)
        .set({ quantity })
        .where(
          and(eq(cartItems.userId, userId), eq(cartItems.productId, productId))
        );
    }
  }

  async removeFromCart(userId: number, productId: number): Promise<void> {
    await db
      .delete(cartItems)
      .where(
        and(eq(cartItems.userId, userId), eq(cartItems.productId, productId))
      );
  }

  async clearCart(userId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }
}

export const storage = new DatabaseStorage();
