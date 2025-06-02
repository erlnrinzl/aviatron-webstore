const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const app = express();
const port = 3000;

// Koneksi ke MySQL
const db = mysql.createConnection({
  host: "localhost", // Ganti dengan host MySQL Anda
  user: "root", // Ganti dengan username MySQL Anda
  password: "", // Ganti dengan password MySQL Anda
  database: "user_db", // Nama database yang telah Anda buat
});

db.connect((err) => {
  if (err) {
    console.error("Gagal terhubung ke database: " + err.stack);
    return;
  }
  console.log("Terhubung ke database MySQL!");
});

// Middleware untuk parsing request body
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware untuk session
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Middleware untuk file statis (CSS, JS, dll)
app.use(express.static(path.join(__dirname, "public")));

// Halaman utama (root) - jika pengguna sudah login, arahkan ke products-admin
app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/products-admin"); // Jika sudah login, langsung arahkan ke products-admin
  }
  res.sendFile(path.join(__dirname, "views", "index.html")); // Jika belum login, tampilkan index.html
});

// Halaman login
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Proses login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Cek kredensial di database
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      return res.send("Terjadi kesalahan dalam verifikasi login.");
    }

    if (results.length > 0) {
      // Dapatkan data pengguna dari hasil query
      const user = results[0];

      // Verifikasi password yang terenkripsi
      bcrypt.compare(password, user.password, (err, match) => {
        if (err) {
          return res.send("Terjadi kesalahan saat memverifikasi password.");
        }

        if (match) {
          req.session.user = { email }; // Simpan data pengguna dalam sesi
          res.redirect("/products-admin"); // Arahkan ke halaman products-admin setelah login
        } else {
          // Password salah
          res.send("Password salah. Silakan coba lagi.");
        }
      });
    } else {
      // Email tidak ditemukan, arahkan kembali ke halaman login
      res.redirect("/login"); // Kembali ke halaman login jika email tidak ditemukan
    }
  });
});

// Halaman produk admin (hanya bisa diakses setelah login)
app.get("/products-admin", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login"); // Jika pengguna belum login, arahkan ke login
  }
  res.sendFile(path.join(__dirname, "protected", "products-admin.html")); // Tampilkan halaman products-admin
});

// Halaman edit produk (hanya bisa diakses setelah login)
app.get("/edit-products", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login"); // Jika pengguna belum login, arahkan ke login
  }
  res.sendFile(path.join(__dirname, "protected", "edit-products.html")); // Tampilkan halaman edit-products
});

// Fitur logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send("Gagal logout");
    }
    res.clearCookie("connect.sid"); // Menghapus cookie sesi di browser
    res.redirect("/login"); // Kembali ke halaman login setelah logout
  });
});

// Halaman pendaftaran pengguna baru
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

// Proses pendaftaran pengguna baru
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // Mengenkripsi password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.send("Terjadi kesalahan saat mengenkripsi password.");
    }

    // Simpan email dan password terenkripsi ke dalam database
    db.query(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashedPassword],
      (err, result) => {
        if (err) {
          return res.send("Gagal menambahkan pengguna.");
        }

        // Setelah pendaftaran berhasil, arahkan ke halaman login
        res.redirect("/login"); // Mengarahkan pengguna kembali ke halaman login
      }
    );
  });
});

// Menangani halaman tidak ditemukan (404)
app.use((req, res, next) => {
  res.status(404).send("Halaman tidak ditemukan.");
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
