import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDBk7Njz9W1Gd6q97S-XtxqnXrkStbJZnk",
  authDomain: "super-fruit-center-69794.firebaseapp.com",
  projectId: "super-fruit-center-69794",
  storageBucket: "super-fruit-center-69794.appspot.com",
  messagingSenderId: "334494456886",
  appId: "1:334494456886:web:super-fruit-center-69794"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleProducts = [
  {
    name: "Fresh Apples",
    category: "Fruits",
    price: 120,
    displayPrice: "₹120",
    unit: "kg",
    imageUrls: [
      "https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=400"
    ],
    inStock: true,
    description: "Fresh, crispy red apples perfect for snacking and cooking."
  },
  {
    name: "Fresh Bananas",
    category: "Fruits", 
    price: 60,
    displayPrice: "₹60",
    unit: "kg",
    imageUrls: [
      "https://images.pexels.com/photos/61127/pexels-photo-61127.jpeg?auto=compress&cs=tinysrgb&w=400"
    ],
    inStock: true,
    description: "Ripe yellow bananas rich in potassium and natural sweetness."
  },
  {
    name: "Fresh Oranges",
    category: "Fruits",
    price: 80,
    displayPrice: "₹80", 
    unit: "kg",
    imageUrls: [
      "https://images.pexels.com/photos/1414110/pexels-photo-1414110.jpeg?auto=compress&cs=tinysrgb&w=400"
    ],
    inStock: true,
    description: "Juicy oranges packed with vitamin C and refreshing flavor."
  },
  {
    name: "Fresh Mangoes",
    category: "Fruits",
    price: 200,
    displayPrice: "₹200",
    unit: "kg", 
    imageUrls: [
      "https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=400"
    ],
    inStock: true,
    description: "Sweet and juicy mangoes, the king of fruits."
  },
  {
    name: "Fresh Grapes",
    category: "Fruits",
    price: 150,
    displayPrice: "₹150",
    unit: "kg",
    imageUrls: [
      "https://images.pexels.com/photos/708777/pexels-photo-708777.jpeg?auto=compress&cs=tinysrgb&w=400"
    ],
    inStock: true,
    description: "Sweet purple grapes perfect for snacking."
  },
  {
    name: "Fresh Strawberries",
    category: "Fruits",
    price: 300,
    displayPrice: "₹300",
    unit: "kg",
    imageUrls: [
      "https://images.pexels.com/photos/89778/strawberries-red-fruit-royalty-free-89778.jpeg?auto=compress&cs=tinysrgb&w=400"
    ],
    inStock: true,
    description: "Fresh red strawberries bursting with flavor."
  }
];

async function seedProducts() {
  try {
    console.log('Adding sample products to Firestore...');
    
    for (const product of sampleProducts) {
      const docRef = await addDoc(collection(db, 'products'), product);
      console.log(`Added product: ${product.name} with ID: ${docRef.id}`);
    }
    
    console.log('All sample products added successfully!');
  } catch (error) {
    console.error('Error adding products:', error);
  }
}

seedProducts();