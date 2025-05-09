import { Category, Product, User } from '../types/interfaces';

// Интерфейс для мок-пользователей с паролем
interface MockUser extends User {
  password: string;
}

// Базовые пользователи для начального заполнения
export const mockUsers: MockUser[] = [
  {
    id: 1,
    firstName: 'Александр',
    lastName: 'Иванов',
    email: 'alex@example.com',
    password: 'password123',
    phone: '+7 (999) 123-45-67',
    city: 'Москва',
    isAdmin: true
  },
  {
    id: 2,
    firstName: 'Елена',
    lastName: 'Петрова',
    email: 'elena@example.com',
    password: 'password123',
    phone: '+7 (999) 987-65-43',
    city: 'Санкт-Петербург',
    isAdmin: false
  },
  {
    id: 3,
    firstName: 'Сергей',
    lastName: 'Сидоров',
    email: 'sergey@example.com',
    password: 'password123',
    phone: '+7 (999) 555-55-55',
    city: 'Казань',
    isAdmin: false
  }
];

// Базовые категории для начального заполнения
const initialCategories: Category[] = [
  {
    id: 1,
    title: 'Беговые дорожки',
    image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 2,
    title: 'Велотренажеры',
    image: 'https://images.unsplash.com/photo-1517963628607-235ccdd5476c?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 3,
    title: 'Гантели и штанги',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 4, 
    title: 'Эллиптические тренажеры',
    image: 'https://images.unsplash.com/photo-1626289065600-cc2c0e94ac0b?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 5,
    title: 'Йога и пилатес',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 6,
    title: 'Теннис и бадминтон',
    image: 'https://images.unsplash.com/photo-1622279457486-28f24ae303b4?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 7,
    title: 'Горные лыжи и сноуборды',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 8,
    title: 'Туристическое снаряжение',
    image: 'https://images.unsplash.com/photo-1524750283918-acfbcce3c16b?q=80&w=800&auto=format&fit=crop'
  }
];

// Базовые товары для начального заполнения
const initialProducts: Product[] = [
  // Беговые дорожки (id: 1)
  {
    id: 1,
    categoryId: 1,
    name: 'Беговая дорожка KETTLER Air R',
    price: 690,
    image: 'https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?q=80&w=800&auto=format&fit=crop',
    available: true
  },
  {
    id: 2,
    categoryId: 1,
    name: 'Беговая дорожка NordicTrack X32i',
    price: 890,
    image: 'https://images.unsplash.com/photo-1641606346222-9867c3b1d772?q=80&w=800&auto=format&fit=crop',
    available: true
  },
  {
    id: 3,
    categoryId: 1,
    name: 'Беговая дорожка Life Fitness Platinum Club',
    price: 950,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop',
    available: true
  },
  
  // Велотренажеры (id: 2)
  {
    id: 4,
    categoryId: 2,
    name: 'Велотренажер Schwinn IC8',
    price: 550,
    image: 'https://images.unsplash.com/photo-1570829460005-c840387bb1ca?q=80&w=800&auto=format&fit=crop',
    available: true
  },
  {
    id: 5,
    categoryId: 2,
    name: 'Велотренажер Assault AirBike Elite',
    price: 620,
    image: 'https://images.unsplash.com/photo-1596357395916-c4a04328bca2?q=80&w=800&auto=format&fit=crop',
    available: true
  },
  {
    id: 6,
    categoryId: 2,
    name: 'Велотренажер Concept2 BikeErg',
    price: 580,
    image: 'https://images.unsplash.com/photo-1591741706823-3ebeca1a38d5?q=80&w=800&auto=format&fit=crop',
    available: true
  },
  
  // Гантели и штанги (id: 3)
  {
    id: 7,
    categoryId: 3,
    name: 'Набор гантелей Bowflex SelectTech 552',
    price: 120,
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=800&auto=format&fit=crop',
    available: true
  },
  {
    id: 8,
    categoryId: 3,
    name: 'Олимпийская штанга Eleiko',
    price: 250,
    image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=800&auto=format&fit=crop',
    available: true
  },
  {
    id: 9,
    categoryId: 3,
    name: 'Гантели с регулируемым весом NordicTrack',
    price: 180,
    image: 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?q=80&w=800&auto=format&fit=crop',
    available: true
  }
];

// Ключи для localStorage
const CATEGORIES_STORAGE_KEY = 'sport_tech_categories';
const PRODUCTS_STORAGE_KEY = 'sport_tech_products';

// Загрузка категорий из localStorage или использование начальных данных
export const loadCategoriesFromStorage = (): Category[] => {
  try {
    const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (storedCategories) {
      return JSON.parse(storedCategories);
    }
  } catch (error) {
    console.error('Ошибка при загрузке категорий из localStorage:', error);
  }
  
  // Сохраняем начальные категории в localStorage, если данных там нет
  saveCategoriesInStorage(initialCategories);
  return initialCategories;
};

// Загрузка товаров из localStorage или использование начальных данных
export const loadProductsFromStorage = (): Product[] => {
  try {
    const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (storedProducts) {
      return JSON.parse(storedProducts);
    }
  } catch (error) {
    console.error('Ошибка при загрузке товаров из localStorage:', error);
  }
  
  // Сохраняем начальные товары в localStorage, если данных там нет
  saveProductsInStorage(initialProducts);
  return initialProducts;
};

// Сохранение категорий в localStorage
export const saveCategoriesInStorage = (categories: Category[]) => {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('Ошибка при сохранении категорий в localStorage:', error);
  }
};

// Сохранение товаров в localStorage
export const saveProductsInStorage = (products: Product[]) => {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('Ошибка при сохранении товаров в localStorage:', error);
  }
};

// Экспортируем категории и товары из localStorage
export const categories: Category[] = loadCategoriesFromStorage();
export const products: Product[] = loadProductsFromStorage();

// Функция для добавления новой категории
export const addCategory = (category: Omit<Category, 'id'>): Category => {
  const newCategoryId = categories.length > 0 
    ? Math.max(...categories.map(c => c.id)) + 1 
    : 1;
    
  const newCategory = {
    id: newCategoryId,
    ...category
  };
  
  // Добавляем в массив и сохраняем в localStorage
  categories.push(newCategory);
  saveCategoriesInStorage(categories);
  
  return newCategory;
};

// Функция для добавления нового товара
export const addProduct = (product: Omit<Product, 'id'>): Product => {
  const newProductId = products.length > 0 
    ? Math.max(...products.map(p => p.id)) + 1 
    : 1;
    
  const newProduct = {
    id: newProductId,
    ...product
  };
  
  // Добавляем в массив и сохраняем в localStorage
  products.push(newProduct);
  saveProductsInStorage(products);
  
  return newProduct;
};

// Функция для редактирования категории
export const updateCategory = (updatedCategory: Category): Category => {
  const index = categories.findIndex(c => c.id === updatedCategory.id);
  
  if (index === -1) {
    throw new Error(`Категория с ID ${updatedCategory.id} не найдена`);
  }
  
  // Обновляем категорию в массиве
  categories[index] = updatedCategory;
  saveCategoriesInStorage(categories);
  
  return updatedCategory;
};

// Функция для редактирования товара
export const updateProduct = (updatedProduct: Product): Product => {
  const index = products.findIndex(p => p.id === updatedProduct.id);
  
  if (index === -1) {
    throw new Error(`Товар с ID ${updatedProduct.id} не найден`);
  }
  
  // Обновляем товар в массиве
  products[index] = updatedProduct;
  saveProductsInStorage(products);
  
  return updatedProduct;
};

// Функция для удаления категории
export const deleteCategory = (categoryId: number): void => {
  const index = categories.findIndex(c => c.id === categoryId);
  
  if (index === -1) {
    throw new Error(`Категория с ID ${categoryId} не найдена`);
  }
  
  // Удаляем категорию из массива
  categories.splice(index, 1);
  saveCategoriesInStorage(categories);
  
  // Также удаляем все товары из этой категории
  const productsToRemove = products.filter(p => p.categoryId === categoryId);
  if (productsToRemove.length > 0) {
    productsToRemove.forEach(product => {
      deleteProduct(product.id);
    });
  }
};

// Функция для удаления товара
export const deleteProduct = (productId: number): void => {
  const index = products.findIndex(p => p.id === productId);
  
  if (index === -1) {
    throw new Error(`Товар с ID ${productId} не найден`);
  }
  
  // Удаляем товар из массива
  products.splice(index, 1);
  saveProductsInStorage(products);
}; 