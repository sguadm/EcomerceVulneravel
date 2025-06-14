import { db } from "./db";
import { products } from "@shared/schema";

const sampleProducts = [
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

export async function seedDatabase() {
  try {
    // Check if products already exist
    const existingProducts = await db.select().from(products);
    
    if (existingProducts.length === 0) {
      console.log("Seeding database with initial products...");
      await db.insert(products).values(sampleProducts);
      console.log("Database seeded successfully!");
    } else {
      console.log("Products already exist in database, skipping seed.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}