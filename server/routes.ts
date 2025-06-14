import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertCartItemSchema } from "@shared/schema";
import jwt from "jsonwebtoken";

// VULNERABILIDADE: Chave JWT fraca e hardcoded
const JWT_SECRET = process.env.JWT_SECRET || "weak123";

// VULNERABILIDADE: Middleware JWT inseguro
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  // VULNERABILIDADE: Aceita algoritmo "none" 
  jwt.verify(token, JWT_SECRET, { algorithms: ['HS256', 'none'] }, (err: any, user: any) => {
    if (err) {
      // VULNERABILIDADE: Log detalhado do erro JWT
      console.log('JWT Error:', err.message, 'Token:', token);
      return res.status(403).json({ message: 'Invalid or expired token', error: err.message });
    }
    req.user = user;
    next();
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      // VULNERABILIDADE: JWT sem expiração adequada e informações sensíveis
      const token = jwt.sign({ 
        userId: user.id, 
        email: user.email, 
        name: user.name,
        role: 'user',
        password: user.password // VULNERABILIDADE: Senha no JWT
      }, JWT_SECRET, { expiresIn: '365d' }); // VULNERABILIDADE: Expiração muito longa
      
      res.json({ 
        user: { id: user.id, name: user.name, email: user.email },
        token 
      });
    } catch (error: any) {
      // VULNERABILIDADE: Exposição de detalhes do erro
      console.log('Registration error:', error);
      res.status(400).json({ 
        message: "Invalid user data", 
        error: error.message,
        stack: error.stack 
      });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(loginData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await storage.verifyPassword(loginData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // VULNERABILIDADE: JWT com informações sensíveis
      const token = jwt.sign({ 
        userId: user.id, 
        email: user.email, 
        name: user.name,
        role: 'user',
        password: user.password // VULNERABILIDADE: Senha no JWT
      }, JWT_SECRET, { expiresIn: '365d' }); // VULNERABILIDADE: Expiração muito longa
      
      res.json({ 
        user: { id: user.id, name: user.name, email: user.email },
        token 
      });
    } catch (error: any) {
      // VULNERABILIDADE: Exposição de detalhes do erro
      console.log('Login error:', error);
      res.status(400).json({ 
        message: "Invalid login data", 
        error: error.message,
        stack: error.stack 
      });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ id: user.id, name: user.name, email: user.email });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, search } = req.query;
      
      let products;
      if (search) {
        products = await storage.searchProducts(search as string);
      } else if (category) {
        products = await storage.getProductsByCategory(category as string);
      } else {
        products = await storage.getAllProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Cart routes
  app.get("/api/cart", authenticateToken, async (req: any, res) => {
    try {
      const cartItems = await storage.getCartItems(req.user.userId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart/add", authenticateToken, async (req: any, res) => {
    try {
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId: req.user.userId
      });
      
      const cartItem = await storage.addToCart(cartItemData);
      res.json(cartItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid cart item data" });
    }
  });

  app.put("/api/cart/:productId", authenticateToken, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const { quantity } = req.body;
      
      await storage.updateCartItemQuantity(req.user.userId, productId, quantity);
      res.json({ message: "Cart updated successfully" });
    } catch (error) {
      res.status(400).json({ message: "Failed to update cart" });
    }
  });

  app.delete("/api/cart/:productId", authenticateToken, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.productId);
      
      await storage.removeFromCart(req.user.userId, productId);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(400).json({ message: "Failed to remove item from cart" });
    }
  });

  app.delete("/api/cart", authenticateToken, async (req: any, res) => {
    try {
      await storage.clearCart(req.user.userId);
      res.json({ message: "Cart cleared successfully" });
    } catch (error) {
      res.status(400).json({ message: "Failed to clear cart" });
    }
  });

  // VULNERABILIDADE: Endpoint para debug JWT (expõe informações sensíveis)
  app.get("/api/debug/jwt", (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.json({ message: "No token provided", secret: JWT_SECRET });
    }

    try {
      // VULNERABILIDADE: Decodifica JWT sem verificação
      const decoded = jwt.decode(token, { complete: true });
      res.json({
        message: "JWT Debug Info",
        secret: JWT_SECRET,
        token: token,
        decoded: decoded,
        header: decoded?.header,
        payload: decoded?.payload
      });
    } catch (error: any) {
      res.json({
        message: "JWT Decode Error",
        secret: JWT_SECRET,
        token: token,
        error: error.message
      });
    }
  });

  // VULNERABILIDADE: Endpoint de admin sem autenticação adequada
  app.get("/api/admin/users", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json({
        message: "All users data",
        users: allUsers, // VULNERABILIDADE: Expõe senhas hasheadas
        total: allUsers.length
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
