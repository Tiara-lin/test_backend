require('dotenv').config(); // ⬅️ 載入環境變數

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const interactionRoutes = require('./routes/interactions');

const app = express();

app.use(cors({ origin: '*' })); // ⬅️ 建議部署時先允許所有來源
app.use(express.json());
app.use('/api/interactions', interactionRoutes);

// 資料模型（你保留原本的即可）
const LikeSchema = new mongoose.Schema({
  user_id: String,
  post_id: String,
  like_count: { type: Number, default: 1 },
  ip_address: String,
  timestamp: { type: Date, default: Date.now },
});
const Like = mongoose.model('Like', LikeSchema);

const CommentSchema = new mongoose.Schema({
  user_id: String,
  post_id: String,
  comment_content: String,
  ip_address: String,
  timestamp: { type: Date, default: Date.now },
});
const Comment = mongoose.model('Comment', CommentSchema);

const ShareSchema = new mongoose.Schema({
  user_id: String,
  post_id: String,
  share_count: { type: Number, default: 1 },
  platform: String,
  ip_address: String,
  timestamp: { type: Date, default: Date.now },
});
const Share = mongoose.model('Share', ShareSchema);

// API：記錄愛心
app.post('/api/like', async (req, res) => {
  const { user_id, post_id } = req.body;
  const ip_address = req.ip || req.headers['x-forwarded-for'];
  try {
    let like = await Like.findOne({ user_id, post_id });
    if (like) {
      like.like_count += 1;
      like.timestamp = new Date();
      await like.save();
    } else {
      like = new Like({ user_id, post_id, ip_address });
      await like.save();
    }
    res.status(200).json({ message: 'Like recorded', like_count: like.like_count });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// API：記錄留言
app.post('/api/comment', async (req, res) => {
  const { user_id, post_id, comment_content } = req.body;
  const ip_address = req.ip || req.headers['x-forwarded-for'];
  try {
    const comment = new Comment({ user_id, post_id, comment_content, ip_address });
    await comment.save();
    res.status(200).json({ message: 'Comment recorded', comment });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// API：取得留言
app.get('/api/comments/:post_id', async (req, res) => {
  const { post_id } = req.params;
  try {
    const comments = await Comment.find({ post_id }).sort({ timestamp: -1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// API：記錄分享
app.post('/api/share', async (req, res) => {
  const { user_id, post_id, platform } = req.body;
  const ip_address = req.ip || req.headers['x-forwarded-for'];
  try {
    let share = await Share.findOne({ user_id, post_id, platform });
    if (share) {
      share.share_count += 1;
      share.timestamp = new Date();
      await share.save();
    } else {
      share = new Share({ user_id, post_id, platform, ip_address });
      await share.save();
    }
    res.status(200).json({ message: 'Share recorded', share_count: share.share_count });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// API：取得貼文統計
app.get('/api/stats/:post_id', async (req, res) => {
  const { post_id } = req.params;
  try {
    const likes = await Like.find({ post_id });
    const comments = await Comment.find({ post_id });
    const shares = await Share.find({ post_id });
    const total_likes = likes.reduce((sum, record) => sum + record.like_count, 0);
    const total_shares = shares.reduce((sum, record) => sum + record.share_count, 0);
    res.status(200).json({
      post_id,
      total_likes,
      total_comments: comments.length,
      total_shares,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ 啟動伺服器（支援 Render 所需 PORT）
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
  }
}

startServer();
