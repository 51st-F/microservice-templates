// MongoDB 初始化腳本
db = db.getSiblingDB('testdb');

// 創建用戶
db.createUser({
  user: 'appuser',
  pwd: 'apppassword',
  roles: [
    {
      role: 'readWrite',
      db: 'testdb'
    }
  ]
});

// 創建示例集合
db.createCollection('items');

// 插入示例數據
db.items.insertMany([
  {
    name: '示例項目 1',
    description: '這是一個示例項目',
    price: 99.99
  },
  {
    name: '示例項目 2',
    description: '另一個示例項目',
    price: 149.99
  }
]);

print('MongoDB 初始化完成！');
