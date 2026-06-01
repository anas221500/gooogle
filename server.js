const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = "admin123";
const USERS_FILE = path.join(__dirname, 'users.json');

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// التأكد من وجود ملف المستخدمين
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

// Helper functions
function readUsers() {
    const data = fs.readFileSync(USERS_FILE);
    return JSON.parse(data);
}

function writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// API: تسجيل مستخدم جديد
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

// API: تسجيل الدخول
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

// API: جلب جميع المستخدمين (للمشرف)
app.post('/api/admin/users', (req, res) => {
    const { adminKey } = req.body;
    if (adminKey !== ADMIN_KEY) {
        return res.status(403).json({ error: 'غير مصرح' });
    }
    const users = readUsers();
    res.json({ users });
});

// تقديم صفحة الواجهة الأمامية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// بدء الخادم
app.listen(PORT, () => {
    console.log(`✅ الخادم يعمل على http://localhost:${PORT}`);
    console.log(`👑 كلمة مرور المشرف: ${ADMIN_KEY}`);
});