# 📚 Book-Store API

📝 About

Book-Store API is a professional Back-End project for an interactive online bookstore application.
It allows any registered user to buy and sell books from other users, with a credit transfer system, shopping cart, and full book management.

Developed using Bun.js + Express.js + MongoDB with JWT authentication and image uploading via Cloudinary.

🚀 Features

🔐 Login and registration with JWT Authentication
📚 Add / Edit / Delete / View books
❤️ Like and unlike books
🛒 Cart system to calculate total price and manage purchases
💰 Transfer balance between users
💳 Manual balance top-up (for testing purposes)
☁️ Upload book images to Cloudinary
⚙️ Fully ready API for connection with a professional Front-End

🧩 Technologies Used

Bun.js · Express · TypeScript · MongoDB · JWT · bcrypt · Multer · Cloudinary · dotenv · CORS

⚙️ Setup

1️⃣ Clone the repo

git clone origin https://github.com/ZenZN99/Book-Store-API.git
cd Book-Store-API


2️⃣ Install dependencies

bun install
### or
npm install


3️⃣ Environment variables (.env)

PORT=your_port
DB=your_mongodb_url
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret


4️⃣ Run the server

bun run start
### or
npm run start


🔗 Main API Endpoints

🔸 Auth
Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	Login user
GET	/api/auth/me	Get current user info
🔸 Books
Method	Endpoint	Description
GET	/api/book	Get all books
GET	/api/book/:id	Get single book
POST	/api/book	Create a book (registered users only)
PUT	/api/book/:id	Edit your book
DELETE	/api/book/:id	Delete your book
GET	/api/book/user/books	Get your uploaded books
POST	/api/book/like/:id	Like / Unlike book
🔸 Cart
Method	Endpoint	Description
POST	/api/cart/:bookId	Add book to cart
GET	/api/cart	View cart
DELETE	/api/cart/:bookId	Remove book from cart
POST	/api/cart/quantity/:bookId	Update book quantity in cart
🔸 Transactions
Method	Endpoint	Description
POST	/api/transaction/transfer	Transfer balance to another user (based on cart total)
POST	/api/transaction/balance	Recharge balance manually (for testing)

🧪 Testing (Postman)

Register a new user or log in to get a JWT Token.
Add the token to your request Headers:

Authorization: Bearer <your_token>


Try the routes above (add books, purchase, transfer balance, etc.).

💡 Transaction Example

User A balance: $300

Adds books to cart with a total price (totalPrice)

When calling /api/transaction/transfer to User B:

Amount is deducted from User A

Amount is added to User B

A transaction record is created

User A’s cart is cleared

🧾 License

MIT License © 2025 Zen Lahham
