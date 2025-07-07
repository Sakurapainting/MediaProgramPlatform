import express from 'express';
const router = express.Router();

// 占位路由，避免导入错误
router.get('/', (req, res) => {
  res.json({ message: 'Content routes' });
});

export default router;
