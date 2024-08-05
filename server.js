require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { sql, poolPromise } = require("./db");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

app.all("/", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401); // Nếu không có token, trả về 401 Unauthorized

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Nếu token không hợp lệ, trả về 403 Forbidden
    req.user = user;
    next(); // Nếu token hợp lệ, tiếp tục với middleware hoặc route handler
  });
}

// Test route
app.get("/", (req, res) => {
  res.send("Welcome to ShopEase API");
});

// Search Products
app.get("/api/products/search", async (req, res) => {
  const { productName, description } = req.query;

  if (!productName && !description) {
    return res
      .status(400)
      .send({ message: "Please provide at least one search parameter" });
  }

  try {
    const pool = await poolPromise;
    let query = "SELECT * FROM Products WHERE 1=1";
    const parameters = [];

    if (productName && productName.trim() !== "") {
      query += " AND ProductName LIKE @productName";
      parameters.push({
        name: "productName",
        type: sql.NVarChar,
        value: `%${productName}%`,
      });
    }

    if (description && description.trim() !== "") {
      query += " AND Description LIKE @description";
      parameters.push({
        name: "description",
        type: sql.NVarChar,
        value: `%${description}%`,
      });
    }

    const request = pool.request();
    parameters.forEach((param) =>
      request.input(param.name, param.type, param.value)
    );

    const result = await request.query(query);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
});

// Get all users
app.get("/api/users", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query(
        "SELECT Username, Email, FullName, Address, PhoneNumber FROM Users"
      );
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// User Sign In
app.post("/api/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .send({ message: "Please provide email and password" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM Users WHERE Email = @email");

    if (result.recordset.length === 0) {
      return res.status(401).send({ message: "Invalid email or password" });
    }

    const user = result.recordset[0];
    const passwordMatch = await bcrypt.compare(password, user.PasswordHash);

    if (!passwordMatch) {
      return res.status(401).send({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.UserId, username: user.Username, email: user.Email },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.cookie('token', token, { httpOnly: true });

    // Return token along with username
    res.json({
      token,
      username: user.Username,
      email: user.Email,
      address: user.Address, // Include Address
      fullname: user.FullName, // Include FullName
      phoneNumber: user.PhoneNumber // Include PhoneNumber
    });
  } catch (err) {
    console.error(err); // Log the error for debugging purposes
    res.status(500).send({ message: err.message });
  }
});

// API thêm sản phẩm vào danh sách yêu thích
app.post("/api/wishlist/add", authenticateToken, async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.userId;

  if (!productId) {
    return res.status(400).send({ message: "Please provide productId" });
  }

  try {
    const pool = await poolPromise;

    // Tìm danh sách yêu thích của người dùng
    let wishlistIdResult = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("SELECT WishlistId FROM Wishlists WHERE UserId = @userId");

    let wishlistId = wishlistIdResult.recordset[0]?.WishlistId;

    // Nếu không có danh sách yêu thích, tạo mới
    if (!wishlistId) {
      let newWishlistResult = await pool
        .request()
        .input("userId", sql.Int, userId)
        .query(
          "INSERT INTO Wishlists (UserId) OUTPUT INSERTED.WishlistId VALUES (@userId)"
        );
      wishlistId = newWishlistResult.recordset[0].WishlistId;
    }

    // Thêm sản phẩm vào danh sách yêu thích
    await pool
      .request()
      .input("wishlistId", sql.Int, wishlistId)
      .input("productId", sql.Int, productId)
      .query(
        "INSERT INTO WishlistItems (WishlistId, ProductId) VALUES (@wishlistId, @productId)"
      );

    res.send({ message: "Product added to wishlist" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
});

// API xóa sản phẩm khỏi danh sách yêu thích
app.delete("/api/wishlist/remove", authenticateToken, async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.userId;

  if (!productId) {
    return res.status(400).send({ message: "Please provide productId" });
  }

  try {
    const pool = await poolPromise;

    // Tìm danh sách yêu thích của người dùng
    const wishlistResult = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("SELECT WishlistId FROM Wishlists WHERE UserId = @userId");

    const wishlistId = wishlistResult.recordset[0]?.WishlistId;

    if (!wishlistId) {
      return res.status(404).send({ message: "Wishlist not found" });
    }

    // Xóa sản phẩm khỏi danh sách yêu thích
    const result = await pool
      .request()
      .input("wishlistId", sql.Int, wishlistId)
      .input("productId", sql.Int, productId).query(`
        DELETE FROM WishlistItems 
        WHERE WishlistId = @wishlistId AND ProductId = @productId
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send({ message: "Product not found in wishlist" });
    }

    res.send({ message: "Product removed from wishlist" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
});

// API lấy danh sách yêu thích của người dùng
app.get("/api/wishlist", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const pool = await poolPromise;

    // Tìm danh sách yêu thích của người dùng
    const wishlistResult = await pool.request().input("userId", sql.Int, userId)
      .query(`
        SELECT w.WishlistId, p.ProductId, p.ProductName, p.Description, p.Price, p.ImageUrl, p.StockQuantity
        FROM Wishlists w
        INNER JOIN WishlistItems wi ON w.WishlistId = wi.WishlistId
        INNER JOIN Products p ON wi.ProductId = p.ProductId
        WHERE w.UserId = @userId
      `);

    const wishlistItems = wishlistResult.recordset;

    res.json(wishlistItems);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
});

// API to check if a product is in the wishlist
app.get("/api/wishlist/check", authenticateToken, async (req, res) => {
  const { productId } = req.query;
  const userId = req.user.userId;

  if (!productId) {
    return res.status(400).send({ message: "Please provide productId" });
  }

  try {
    const pool = await poolPromise;

    // Find the user's wishlist
    const wishlistResult = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("SELECT WishlistId FROM Wishlists WHERE UserId = @userId");

    const wishlistId = wishlistResult.recordset[0]?.WishlistId;

    if (!wishlistId) {
      return res.status(404).send({ message: "Wishlist not found" });
    }

    // Check if the product is in the wishlist
    const productResult = await pool
      .request()
      .input("wishlistId", sql.Int, wishlistId)
      .input("productId", sql.Int, productId).query(`
        SELECT 1 
        FROM WishlistItems 
        WHERE WishlistId = @wishlistId AND ProductId = @productId
      `);

    const isInWishlist = productResult.recordset.length > 0;
    res.send({ isInWishlist });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
});

// API to get cart items
app.get("/api/cart", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const pool = await poolPromise;

    // Get cart items for the user
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT ci.CartItemId, ci.Quantity, p.ProductId, p.ProductName, p.Price, p.ImageUrl
        FROM CartItems ci
        JOIN ShoppingCart sc ON ci.CartId = sc.CartId
        JOIN Products p ON ci.ProductId = p.ProductId
        WHERE sc.UserId = @userId
      `);

    res.send(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
});

// API to update cart item quantity
app.put("/api/cart/update", authenticateToken, async (req, res) => {
  const { cartItemId, quantity } = req.body;

  if (!cartItemId || !quantity) {
    return res.status(400).send({ message: "Please provide cartItemId and quantity" });
  }

  try {
    const pool = await poolPromise;

    await pool
      .request()
      .input("cartItemId", sql.Int, cartItemId)
      .input("quantity", sql.Int, quantity)
      .query(`
        UPDATE CartItems 
        SET Quantity = @quantity 
        WHERE CartItemId = @cartItemId
      `);

    res.send({ message: "Cart item quantity updated" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
});

// API to add a product to the shopping cart
app.post("/api/cart/add", authenticateToken, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.userId;

  if (!productId || !quantity) {
    return res.status(400).send({ message: "Please provide productId and quantity" });
  }

  try {
    const pool = await poolPromise;

    // Find or create a shopping cart for the user
    let cartResult = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("SELECT CartId FROM ShoppingCart WHERE UserId = @userId");

    let cartId = cartResult.recordset[0]?.CartId;

    if (!cartId) {
      cartResult = await pool
        .request()
        .input("userId", sql.Int, userId)
        .query("INSERT INTO ShoppingCart (UserId) OUTPUT INSERTED.CartId VALUES (@userId)");

      cartId = cartResult.recordset[0].CartId;
    }

    // Check if the product is already in the cart
    const cartItemResult = await pool
      .request()
      .input("cartId", sql.Int, cartId)
      .input("productId", sql.Int, productId)
      .query("SELECT Quantity FROM CartItems WHERE CartId = @cartId AND ProductId = @productId");

    if (cartItemResult.recordset.length > 0) {
      // Update the quantity of the existing item
      await pool
        .request()
        .input("cartId", sql.Int, cartId)
        .input("productId", sql.Int, productId)
        .input("quantity", sql.Int, quantity)
        .query("UPDATE CartItems SET Quantity = Quantity + @quantity WHERE CartId = @cartId AND ProductId = @productId");
    } else {
      // Insert a new item into the cart
      await pool
        .request()
        .input("cartId", sql.Int, cartId)
        .input("productId", sql.Int, productId)
        .input("quantity", sql.Int, quantity)
        .query("INSERT INTO CartItems (CartId, ProductId, Quantity) VALUES (@cartId, @productId, @quantity)");
    }

    res.send({ message: "Product added to cart" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
});

// API to remove a product from the shopping cart
app.delete("/api/cart/remove", authenticateToken, async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.userId;

  if (!productId) {
    return res.status(400).send({ message: "Please provide productId" });
  }

  try {
    const pool = await poolPromise;

    // Find the user's shopping cart
    let cartResult = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("SELECT CartId FROM ShoppingCart WHERE UserId = @userId");

    let cartId = cartResult.recordset[0]?.CartId;

    if (!cartId) {
      return res.status(404).send({ message: "Shopping cart not found" });
    }

    // Check if the product is in the cart
    const cartItemResult = await pool
      .request()
      .input("cartId", sql.Int, cartId)
      .input("productId", sql.Int, productId)
      .query("SELECT Quantity FROM CartItems WHERE CartId = @cartId AND ProductId = @productId");

    if (cartItemResult.recordset.length === 0) {
      return res.status(404).send({ message: "Product not found in cart" });
    }

    // Remove the product from the cart
    await pool
      .request()
      .input("cartId", sql.Int, cartId)
      .input("productId", sql.Int, productId)
      .query("DELETE FROM CartItems WHERE CartId = @cartId AND ProductId = @productId");

    res.send({ message: "Product removed from cart" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
});

app.get("/api/userinfo", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("SELECT * FROM Users WHERE UserId = @userId");

    if (result.recordset.length === 0) {
      return res.status(404).send({ message: "User not found" });
    }

    const user = result.recordset[0];
    res.json({
      email: user.Email,
      username: user.Username,
      fullname: user.FullName,
      address: user.Address,
      phonenumber: user.PhoneNumber,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
});

// Put userinfo
app.put("/api/userinfo", authenticateToken, async (req, res) => {
  const { username, fullname, address, phonenumber } = req.body;
  const userId = req.user.userId;

  if (!username || !fullname || !address || !phonenumber) {
    return res
      .status(400)
      .send({ message: "Please provide all required fields" });
  }

  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("username", sql.NVarChar, username)
      .input("fullname", sql.NVarChar, fullname)
      .input("address", sql.NVarChar, address)
      .input("phonenumber", sql.NVarChar, phonenumber).query(`
        UPDATE Users
        SET Username = @username,
            FullName = @fullname,
            Address = @address,
            PhoneNumber = @phonenumber
        WHERE UserId = @userId
      `);

    if (result.rowsAffected[0] === 0) {
      return res
        .status(404)
        .send({ message: "User not found or no changes made" });
    }

    res.send({ message: "User information updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
});

// Get user by ID
app.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM Users WHERE Id = @id");
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Validate input
    if (!username || !password || !email) {
      return res.status(400).send({
        message:
          "Please provide all required fields (username, password, email)",
      });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const pool = await poolPromise;
    await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("password", sql.NVarChar, hashedPassword)
      .input("email", sql.NVarChar, email)
      .query(
        "INSERT INTO Users (Username, PasswordHash, Email) VALUES (@username, @password, @email)"
      );

    res.status(201).send({ message: "User created successfully" });
  } catch (err) {
    console.error(err); // Log the error for debugging purposes
    res.status(500).send({ message: err.message });
  }
});

// Update user by ID
app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar, name)
      .input("email", sql.NVarChar, email)
      .query("UPDATE Users SET Name = @name, Email = @email WHERE Id = @id");
    if (result.rowsAffected[0] > 0) {
      res.send({ message: "User updated successfully" });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Delete user by ID
app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Users WHERE Id = @id");
    if (result.rowsAffected[0] > 0) {
      res.send({ message: "User deleted successfully" });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Products");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Get product by ID
app.get("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM Products WHERE ProductId = @id");
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send({ message: "Product not found" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Create a product
app.post("/api/products", async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      brand,
      countInStock,
      rating,
      numReviews,
      image,
    } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input("name", sql.NVarChar, name)
      .input("description", sql.NVarChar, description)
      .input("price", sql.Decimal(18, 2), price)
      .input("category", sql.NVarChar, category)
      .input("brand", sql.NVarChar, brand)
      .input("countInStock", sql.Int, countInStock)
      .input("rating", sql.Decimal(3, 2), rating)
      .input("numReviews", sql.Int, numReviews)
      .input("image", sql.NVarChar, image)
      .query(
        "INSERT INTO Products (Name, Description, Price, Category, Brand, CountInStock, Rating, NumReviews, Image, CreatedAt, UpdatedAt) VALUES (@name, @description, @price, @category, @brand, @countInStock, @rating, @numReviews, @image, GETDATE(), GETDATE())"
      );
    res.status(201).send({ message: "Product created successfully" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Update product by ID
app.put("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    price,
    category,
    brand,
    countInStock,
    rating,
    numReviews,
    image,
  } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar, name)
      .input("description", sql.NVarChar, description)
      .input("price", sql.Decimal(18, 2), price)
      .input("category", sql.NVarChar, category)
      .input("brand", sql.NVarChar, brand)
      .input("countInStock", sql.Int, countInStock)
      .input("rating", sql.Decimal(3, 2), rating)
      .input("numReviews", sql.Int, numReviews)
      .input("image", sql.NVarChar, image)
      .query(
        "UPDATE Products SET Name = @name, Description = @description, Price = @price, Category = @category, Brand = @brand, CountInStock = @countInStock, Rating = @rating, NumReviews = @numReviews, Image = @image, UpdatedAt = GETDATE() WHERE ProductId = @id"
      );
    if (result.rowsAffected[0] > 0) {
      res.send({ message: "Product updated successfully" });
    } else {
      res.status(404).send({ message: "Product not found" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Delete product by ID
app.delete("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Products WHERE ProductId = @id");
    if (result.rowsAffected[0] > 0) {
      res.send({ message: "Product deleted successfully" });
    } else {
      res.status(404).send({ message: "Product not found" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Get all Categories
app.get("/api/categories", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Categories");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Get id Categories
app.get("/api/categories/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM Categories WHERE CategoryId = @id");
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send({ message: "Category not found" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Get products by category ID
app.get("/api/products/category/:categoryId", async (req, res) => {
  const { categoryId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("categoryId", sql.Int, categoryId)
      .query("SELECT * FROM Products WHERE CategoryId = @categoryId");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Post Categories
app.post("/api/categories", async (req, res) => {
  try {
    const { categoryName, description } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input("categoryName", sql.NVarChar, categoryName)
      .input("description", sql.NVarChar, description)
      .query(
        "INSERT INTO Categories (CategoryName, Description) VALUES (@categoryName, @description)"
      );
    res.status(201).send({ message: "Category created successfully" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Put Categories
app.put("/api/categories/:id", async (req, res) => {
  const { id } = req.params;
  const { categoryName, description } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("categoryName", sql.NVarChar, categoryName)
      .input("description", sql.NVarChar, description)
      .query(
        "UPDATE Categories SET CategoryName = @categoryName, Description = @description WHERE CategoryId = @id"
      );
    if (result.rowsAffected[0] > 0) {
      res.send({ message: "Category updated successfully" });
    } else {
      res.status(404).send({ message: "Category not found" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Delete Categories
app.delete("/api/categories/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Categories WHERE CategoryId = @id");
    if (result.rowsAffected[0] > 0) {
      res.send({ message: "Category deleted successfully" });
    } else {
      res.status(404).send({ message: "Category not found" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Get all shopping carts
app.get("/api/carts", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM ShoppingCart");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Get shopping cart by UserId
app.get("/api/carts/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("SELECT * FROM ShoppingCart WHERE UserId = @userId");
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send({ message: "Shopping cart not found" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Create a shopping cart
app.post("/api/carts", async (req, res) => {
  const { userId } = req.body;
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("INSERT INTO ShoppingCart (UserId) VALUES (@userId)");
    res.status(201).send({ message: "Shopping cart created successfully" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Delete shopping cart by UserId
app.delete("/api/carts/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("DELETE FROM ShoppingCart WHERE UserId = @userId");
    if (result.rowsAffected[0] > 0) {
      res.send({ message: "Shopping cart deleted successfully" });
    } else {
      res.status(404).send({ message: "Shopping cart not found" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Get all cart items for a specific cart
app.get("/api/cart-items/:cartId", async (req, res) => {
  const { cartId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("cartId", sql.Int, cartId)
      .query("SELECT * FROM CartItems WHERE CartId = @cartId");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Add an item to the cart
app.post("/api/cart-items", async (req, res) => {
  const { cartId, productId, quantity } = req.body;
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("cartId", sql.Int, cartId)
      .input("productId", sql.Int, productId)
      .input("quantity", sql.Int, quantity)
      .query(
        "INSERT INTO CartItems (CartId, ProductId, Quantity) VALUES (@cartId, @productId, @quantity)"
      );
    res.status(201).send({ message: "Item added to cart successfully" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Update the quantity of an item in the cart
app.put("/api/cart-items/:cartItemId", async (req, res) => {
  const { cartItemId } = req.params;
  const { quantity } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("cartItemId", sql.Int, cartItemId)
      .input("quantity", sql.Int, quantity)
      .query(
        "UPDATE CartItems SET Quantity = @quantity WHERE CartItemId = @cartItemId"
      );
    if (result.rowsAffected[0] > 0) {
      res.send({ message: "Cart item updated successfully" });
    } else {
      res.status(404).send({ message: "Cart item not found" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Delete an item from the cart
app.delete("/api/cart-items/:cartItemId", async (req, res) => {
  const { cartItemId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("cartItemId", sql.Int, cartItemId)
      .query("DELETE FROM CartItems WHERE CartItemId = @cartItemId");
    if (result.rowsAffected[0] > 0) {
      res.send({ message: "Cart item deleted successfully" });
    } else {
      res.status(404).send({ message: "Cart item not found" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Create an order
app.post("/api/orders", async (req, res) => {
  try {
    const { userId, totalPrice, isPaid, paidAt, isDelivered, deliveredAt } =
      req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("totalPrice", sql.Decimal(18, 2), totalPrice)
      .input("isPaid", sql.Bit, isPaid)
      .input("paidAt", sql.DateTime, paidAt)
      .input("isDelivered", sql.Bit, isDelivered)
      .input("deliveredAt", sql.DateTime, deliveredAt)
      .query(
        "INSERT INTO Orders (UserId, TotalPrice, IsPaid, PaidAt, IsDelivered, DeliveredAt, CreatedAt, UpdatedAt) VALUES (@userId, @totalPrice, @isPaid, @paidAt, @isDelivered, @deliveredAt, GETDATE(), GETDATE())"
      );
    res.status(201).send({ message: "Order created successfully" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
