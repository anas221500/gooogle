const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = "admin123";
const USERS_FILE = path.join(__dirname, 'users.json');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// التأكد من وجود ملف المستخدمين
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

function readUsers() {
    return JSON.parse(fs.readFileSync(USERS_FILE));
}

function writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// API Routes
app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }
    const users = readUsers();
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'البريد الإلكتروني موجود مسبقاً' });
    }
    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        timestamp: new Date().toISOString()
    };
    users.push(newUser);
    writeUsers(users);
    res.json({ success: true, message: 'تم التسجيل بنجاح' });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'البريد وكلمة المرور مطلوبة' });
    }
    const users = readUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        res.json({ success: true, message: `مرحباً ${user.name}` });
    } else {
        res.status(401).json({ error: 'بيانات غير صحيحة' });
    }
});

app.post('/api/admin/users', (req, res) => {
    const { adminKey } = req.body;
    if (adminKey !== ADMIN_KEY) {
        return res.status(403).json({ error: 'غير مصرح' });
    }
    const users = readUsers();
    res.json({ users });
});

// 🟢 خدمة الملفات الثابتة (لـ index.html)
app.use(express.static(__dirname));

// 🟢 إعادة توجيه أي طلب آخر إلى index.html (لتفادي 404)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ الخادم يعمل على المنفذ ${PORT}`);
    console.log(`👑 كلمة مرور المشرف: ${ADMIN_KEY}`);
});