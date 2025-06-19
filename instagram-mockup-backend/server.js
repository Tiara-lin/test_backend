require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const interactionRoutes = require('./routes/interactions');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/api/interactions', interactionRoutes);

// === 資料模型 ===
const Like = mongoose.model('Like', new mongoose.Schema({
  user_id: String,
  post_id: String,
  like_count: { type: Number, default: 1 },
  ip_address: String,
  timestamp: { type: Date, default: Date.now },
}));
const Comment = mongoose.model('Comment', new mongoose.Schema({
  user_id: String,
  post_id: String,
  comment_content: String,
  ip_address: String,
  timestamp: { type: Date, default: Date.now },
}));
const Share = mongoose.model('Share', new mongoose.Schema({
  user_id: String,
  post_id: String,
  share_count: { type: Number, default: 1 },
  platform: String,
  ip_address: String,
  timestamp: { type: Date, default: Date.now },
}));

// === API ===
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
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/comment', async (req, res) => {
  const { user_id, post_id, comment_content } = req.body;
  const ip_address = req.ip || req.headers['x-forwarded-for'];
  try {
    const comment = new Comment({ user_id, post_id, comment_content, ip_address });
    await comment.save();
    res.status(200).json({ message: 'Comment recorded', comment });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/comments/:post_id', async (req, res) => {
  try {
    const comments = await Comment.find({ post_id: req.params.post_id }).sort({ timestamp: -1 });
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

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
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/stats/:post_id', async (req, res) => {
  try {
    const { post_id } = req.params;
    const likes = await Like.find({ post_id });
    const comments = await Comment.find({ post_id });
    const shares = await Share.find({ post_id });

    const total_likes = likes.reduce((sum, r) => sum + r.like_count, 0);
    const total_shares = shares.reduce((sum, r) => sum + r.share_count, 0);

    res.status(200).json({
      post_id,
      total_likes,
      total_comments: comments.length,
      total_shares,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ 總是啟動伺服器（不管 Mongo 成功或失敗）
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ✅ 連線 Mongo（錯誤也不會卡住整個服務）
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB error:', err.message));
