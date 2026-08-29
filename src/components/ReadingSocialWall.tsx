import React, { useState } from 'react';
import {
  Sparkles, Heart, MessageCircle, Share2, Star, Trophy, BookOpen, Crown,
  Send, Plus, CheckCircle2, User, Flame, Filter, Volume2, X, ThumbsUp,
  Gift, Layers, Smile
} from 'lucide-react';
import { UserProfile, Book, CollectibleItem, SocialPost, SocialThemeBackground } from '../types';
import { THEME_CONFIGS, INITIAL_SOCIAL_POSTS } from '../data/socialPosts';
import { playStarChime, speakText } from '../utils/audio';

interface ReadingSocialWallProps {
  profile: UserProfile;
  books: Book[];
  onSelectBook: (book: Book, startPage?: number) => void;
  darkMode?: boolean;
}

export const ReadingSocialWall: React.FC<ReadingSocialWallProps> = ({
  profile,
  books,
  onSelectBook,
  darkMode = false,
}) => {
  const [posts, setPosts] = useState<SocialPost[]>(() => {
    // Check if user has saved posts in local memory or localStorage
    const saved = localStorage.getItem('child_reading_social_posts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_SOCIAL_POSTS;
  });

  const [activeTab, setActiveTab] = useState<'feed' | 'my_posts' | 'friends_books' | 'theme_gallery'>('feed');
  const [selectedThemeFilter, setSelectedThemeFilter] = useState<SocialThemeBackground | 'all'>('all');

  // Share Post Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [selectedCollectibleId, setSelectedCollectibleId] = useState<string>('');
  const [thoughtsInput, setThoughtsInput] = useState('');
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [selectedTheme, setSelectedTheme] = useState<SocialThemeBackground>('starry');
  const [selectedTagList, setSelectedTagList] = useState<string[]>(['#好書推薦', '#收藏紀念品']);

  // Comment Input State per Post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [selectedSticker, setSelectedSticker] = useState<Record<string, string>>({});

  // Helper to persist posts
  const updatePostsAndSave = (newPosts: SocialPost[]) => {
    setPosts(newPosts);
    try {
      localStorage.setItem('child_reading_social_posts', JSON.stringify(newPosts));
    } catch (e) {
      // ignore
    }
  };

  // Get completed books list
  const completedBooks = books.filter((b) => profile.readBookIds.includes(b.id));

  // Handle Likes
  const handleToggleLike = (postId: string) => {
    playStarChime();
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const isLiked = p.isLikedByMe;
        return {
          ...p,
          isLikedByMe: !isLiked,
          likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1,
        };
      }
      return p;
    });
    updatePostsAndSave(updated);
  };

  // Handle Add Comment
  const handleAddComment = (postId: string) => {
    const text = (commentInputs[postId] || '').trim();
    const sticker = selectedSticker[postId] || '';
    if (!text && !sticker) return;

    playStarChime();
    const newComment = {
      id: `c-${Date.now()}`,
      authorName: profile.name || '童心小讀者',
      authorAvatar: profile.avatar || '👦🏻',
      content: text || '這本繪本超棒！給高分好評判！',
      createdAt: '剛剛',
      sticker,
    };

    const updated = posts.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...p.comments, newComment],
        };
      }
      return p;
    });

    updatePostsAndSave(updated);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    setSelectedSticker((prev) => ({ ...prev, [postId]: '' }));
  };

  // Open Share Modal Initialization
  const handleOpenShareModal = () => {
    setIsShareModalOpen(true);
    if (completedBooks.length > 0) {
      setSelectedBookId(completedBooks[0].id);
    } else if (books.length > 0) {
      setSelectedBookId(books[0].id);
    }

    if (profile.collectibles && profile.collectibles.length > 0) {
      setSelectedCollectibleId(profile.collectibles[0].id);
    }
    setThoughtsInput('');
    setRatingInput(5);
  };

  // Create & Publish Post
  const handlePublishPost = () => {
    if (!selectedBookId) return;

    const chosenBook = books.find((b) => b.id === selectedBookId);
    if (!chosenBook) return;

    const bookTitleStr = typeof chosenBook.title === 'string'
      ? chosenBook.title
      : (chosenBook.title['zh-TW'] || chosenBook.title.en);

    const chosenCollectible = profile.collectibles?.find((c) => c.id === selectedCollectibleId);

    const newPost: SocialPost = {
      id: `post-me-${Date.now()}`,
      authorName: profile.name || '小讀者',
      authorAvatar: profile.avatar || '👦🏻',
      isMe: true,
      bookId: chosenBook.id,
      bookTitle: bookTitleStr,
      bookCover: chosenBook.coverImage,
      collectibleItem: chosenCollectible,
      thoughts: thoughtsInput.trim() || `我剛完讀了《${bookTitleStr}》，故事超級精采！大家也快來一起讀吧～`,
      ratingStars: ratingInput,
      themeBackground: selectedTheme,
      createdAt: '剛剛',
      likesCount: 1,
      isLikedByMe: true,
      tags: selectedTagList,
      comments: [
        {
          id: `c-init-${Date.now()}`,
          authorName: '童心讀書會AI領航員 🤖',
          authorAvatar: '🤖',
          content: `恭喜 ${profile.name || '小讀者'} 解鎖了《${bookTitleStr}》紀念品與閱讀星章！`,
          createdAt: '剛剛',
          sticker: '🎉',
        },
      ],
    };

    playStarChime();
    updatePostsAndSave([newPost, ...posts]);
    setIsShareModalOpen(false);
  };

  // Filtered posts based on tabs
  const displayedPosts = posts.filter((p) => {
    if (activeTab === 'my_posts') return p.isMe || p.authorName === profile.name;
    if (selectedThemeFilter !== 'all') return p.themeBackground === selectedThemeFilter;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn" id="reading-social-wall-container">
      {/* 🌟 Section Header Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${
        darkMode
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-indigo-500/50 shadow-xl'
          : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-xl border-2 border-amber-300'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3.5 rounded-2xl bg-white/20 backdrop-blur-md shrink-0 shadow-md">
              <Share2 className="w-7 h-7 text-white animate-bounce" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>童心愛閱讀「閱讀社交牆」</span>
                </h2>
                <span className="text-[10px] font-black bg-black/30 text-amber-200 px-3 py-1 rounded-full border border-white/20 uppercase tracking-wider">
                  Community Feed
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold opacity-95 text-amber-100 leading-relaxed">
                與好朋友分享剛完讀的繪本、獲得的珍貴數位紀念品，並探索大家最愛的奇幻書單與主題背景！
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-open-share-modal"
            onClick={handleOpenShareModal}
            className="px-5 py-3 rounded-2xl bg-white text-orange-950 font-black text-xs sm:text-sm shadow-lg hover:bg-amber-50 transition-all transform hover:scale-105 flex items-center justify-center gap-2 cursor-pointer shrink-0 border-2 border-amber-200"
          >
            <Plus className="w-5 h-5 text-orange-600" />
            <span>分享我完讀的繪本與紀念品</span>
          </button>
        </div>

        {/* Community Stats Bar */}
        <div className="mt-6 pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-amber-100">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-xl">
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>繪本動態：{posts.length} 篇</span>
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-xl">
              <Crown className="w-4 h-4 text-yellow-300" />
              <span>展示紀念品：{posts.filter((p) => p.collectibleItem).length} 個</span>
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-xl">
              <Heart className="w-4 h-4 text-rose-300 fill-rose-300" />
              <span>點讚互動：{posts.reduce((acc, curr) => acc + curr.likesCount, 0)} 次</span>
            </span>
          </div>

          <div className="text-[11px] font-extrabold bg-white/20 px-3 py-1 rounded-full">
            💡 讀完繪本即可解鎖專屬紀念品並發布分享哦！
          </div>
        </div>
      </div>

      {/* 🧭 Navigation Tab Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-amber-200/80 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'feed', label: '🌟 好朋友社群動態', icon: Sparkles },
            { id: 'my_posts', label: '👑 我的分享紀錄', icon: Crown },
            { id: 'friends_books', label: '📚 好朋友熱門書單', icon: BookOpen },
            { id: 'theme_gallery', label: '🎨 主題背景展示', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-600 shadow-md scale-105'
                    : darkMode
                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    : 'bg-white text-amber-950 border-amber-200 hover:bg-amber-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Theme Filter Dropdown/Pills if in Feed Tab */}
        {activeTab === 'feed' && (
          <div className="flex items-center gap-1.5 text-xs font-bold shrink-0">
            <span className={darkMode ? 'text-slate-400' : 'text-amber-900/80'}>篩選主題：</span>
            <select
              value={selectedThemeFilter}
              onChange={(e) => setSelectedThemeFilter(e.target.value as any)}
              className={`px-3 py-1.5 rounded-xl border font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-amber-200 text-amber-950'
              }`}
            >
              <option value="all">🌈 全部主題背景</option>
              {Object.values(THEME_CONFIGS).map((tc) => (
                <option key={tc.id} value={tc.id}>
                  {tc.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* TAB CONTENT 1 & 2: Social Feed & My Posts */}
      {(activeTab === 'feed' || activeTab === 'my_posts') && (
        <div className="space-y-6">
          {displayedPosts.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-800 border-2 border-dashed border-amber-300 dark:border-slate-700 space-y-3">
              <div className="text-5xl">📖</div>
              <h3 className="font-black text-base sm:text-lg text-slate-800 dark:text-slate-200">
                {activeTab === 'my_posts' ? '你尚未發布任何繪本分享' : '目前尚無符合主題條件的貼文'}
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                點擊上方「分享我完讀的繪本與紀念品」按鈕，成為第一個在社交牆上展示成果的小小閱讀明星！
              </p>
              <button
                type="button"
                onClick={handleOpenShareModal}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md transition-colors"
              >
                立即發布第一篇分享
              </button>
            </div>
          ) : (
            displayedPosts.map((post) => {
              const themeConfig = THEME_CONFIGS[post.themeBackground] || THEME_CONFIGS.starry;
              const matchingBook = books.find((b) => b.id === post.bookId);

              return (
                <div
                  key={post.id}
                  className={`rounded-3xl border-2 p-6 sm:p-7 transition-all duration-300 shadow-xl relative overflow-hidden bg-gradient-to-br ${
                    darkMode ? themeConfig.darkBgGradient : themeConfig.bgGradient
                  } ${themeConfig.borderColor} ${themeConfig.textColor}`}
                >
                  {/* Floating Ambient Theme Icons Background Decor */}
                  <div className="absolute -top-4 -right-4 text-7xl opacity-15 pointer-events-none select-none">
                    {themeConfig.bgDecorativeIcons[0]}
                  </div>
                  <div className="absolute bottom-2 right-12 text-6xl opacity-10 pointer-events-none select-none">
                    {themeConfig.bgDecorativeIcons[1]}
                  </div>

                  {/* Post Top Bar: Author & Theme Badge */}
                  <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/20 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-md border border-white/30 shrink-0">
                        {post.authorAvatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-base text-white">
                            {post.authorName}
                          </span>
                          {post.isMe && (
                            <span className="text-[10px] font-black bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                              我的分享
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-bold opacity-80 flex items-center gap-2">
                          <span>{post.createdAt}</span>
                          <span>•</span>
                          <span>完讀心得分享</span>
                        </div>
                      </div>
                    </div>

                    {/* Book Theme Background Label Badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-black backdrop-blur-md border border-white/30 flex items-center gap-1.5 shadow-xs ${themeConfig.badgeBg}`}>
                      <span>{themeConfig.icon}</span>
                      <span className="hidden sm:inline">{themeConfig.name}</span>
                    </div>
                  </div>

                  {/* Post Main Grid: Book Card + Collectible Souvenir */}
                  <div className="py-5 grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                    
                    {/* Left: Book Info Card */}
                    <div className="p-4 rounded-2xl bg-black/30 backdrop-blur-md border border-white/20 flex gap-3.5 items-center">
                      <img
                        src={post.bookCover || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400'}
                        alt={post.bookTitle}
                        className="w-20 h-28 object-cover rounded-xl shadow-lg border border-white/30 shrink-0"
                      />
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
                          📖 閱讀繪本作品
                        </div>
                        <h4 className="font-black text-sm sm:text-base text-white truncate leading-snug">
                          {post.bookTitle}
                        </h4>

                        {/* Rating Stars */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: post.ratingStars || 5 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                          <span className="text-xs font-black text-amber-200 ml-1">
                            {post.ratingStars || 5}.0 推薦
                          </span>
                        </div>

                        {matchingBook && (
                          <button
                            type="button"
                            onClick={() => {
                              playStarChime();
                              onSelectBook(matchingBook, 1);
                            }}
                            className="mt-2 w-full py-1.5 px-3 rounded-xl bg-white text-slate-900 font-black text-xs hover:bg-amber-100 transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                            <span>一起線上試讀繪本</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right: Unlocked Collectible Souvenir Badge */}
                    {post.collectibleItem ? (
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 via-yellow-400/20 to-amber-600/30 backdrop-blur-md border border-amber-300/60 flex items-center gap-3.5 shadow-md">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-amber-300/80 flex items-center justify-center text-4xl shadow-inner shrink-0 animate-pulse">
                          {post.collectibleItem.icon}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 uppercase">
                              👑 {post.collectibleItem.rarity === 'legendary' ? '傳說紀念品' : '珍稀紀念品'}
                            </span>
                            <span className="text-[10px] font-bold text-amber-200">
                              {post.collectibleItem.category}
                            </span>
                          </div>
                          <h4 className="font-black text-sm sm:text-base text-white truncate">
                            {post.collectibleItem.name}
                          </h4>
                          <p className="text-[11px] font-medium text-white/90 line-clamp-2 leading-relaxed">
                            {post.collectibleItem.description}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-center p-3">
                        <div className="space-y-1">
                          <div className="text-2xl">🌟</div>
                          <div className="text-xs font-black text-amber-200">完成閱讀獎章</div>
                          <div className="text-[10px] font-medium opacity-80">獲贈 +5 ⭐ 智慧童心星星</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Thoughts / Review Text */}
                  <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 my-2 space-y-2 relative z-10">
                    <div className="text-xs font-black text-amber-300 flex items-center gap-1">
                      <span>💬 小讀者心得筆記：</span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-white leading-relaxed whitespace-pre-wrap">
                      {post.thoughts}
                    </p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        {post.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg bg-white/15 text-amber-200 border border-white/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reaction Bar & Comments */}
                  <div className="pt-3 border-t border-white/20 space-y-4 relative z-10">
                    <div className="flex items-center justify-between gap-3">
                      {/* Like Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleLike(post.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                          post.isLikedByMe
                            ? 'bg-rose-500 text-white scale-105 shadow-rose-500/40'
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.isLikedByMe ? 'fill-white' : ''}`} />
                        <span>{post.isLikedByMe ? '已給心心讚' : '給好朋友掌聲讚'}</span>
                        <span className="ml-1 bg-black/30 px-2 py-0.5 rounded-full text-[10px]">
                          {post.likesCount}
                        </span>
                      </button>

                      {/* Comment Counter */}
                      <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments.length} 則歡樂迴響</span>
                      </span>
                    </div>

                    {/* Existing Comments List */}
                    {post.comments.length > 0 && (
                      <div className="space-y-2 bg-black/25 p-3 rounded-2xl border border-white/15">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex items-start gap-2.5 text-xs text-white">
                            <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-sm shrink-0 mt-0.5">
                              {comment.authorAvatar}
                            </div>
                            <div className="flex-1 bg-white/10 p-2.5 rounded-xl border border-white/10 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-black text-amber-200">{comment.authorName}</span>
                                <span className="text-[10px] opacity-70">{comment.createdAt}</span>
                              </div>
                              <p className="font-medium text-white/95">{comment.content}</p>
                              {comment.sticker && (
                                <span className="inline-block text-xl pt-0.5">{comment.sticker}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment Input Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="flex items-center gap-1 bg-black/30 p-1 rounded-2xl border border-white/20 overflow-x-auto">
                        {['🎉', '👏', '🌟', '💖', '🚀', '👑'].map((stk) => (
                          <button
                            key={stk}
                            type="button"
                            onClick={() =>
                              setSelectedSticker((prev) => ({
                                ...prev,
                                [post.id]: prev[post.id] === stk ? '' : stk,
                              }))
                            }
                            className={`p-1.5 rounded-xl text-sm transition-all ${
                              selectedSticker[post.id] === stk
                                ? 'bg-amber-400 scale-125'
                                : 'hover:bg-white/20'
                            }`}
                          >
                            {stk}
                          </button>
                        ))}
                      </div>

                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(post.id);
                          }}
                          placeholder="給好朋友留下溫馨鼓勵或想法..."
                          className="flex-1 px-4 py-2 rounded-xl bg-black/30 border border-white/20 text-white placeholder-white/60 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(post.id)}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>發送</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB CONTENT 3: Friends' Top Reading List (好朋友熱門書單) */}
      {activeTab === 'friends_books' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border-2 border-amber-200 dark:border-slate-700 space-y-6 shadow-md">
          <div className="space-y-1">
            <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>📚 社群好朋友最愛繪本推薦榜</span>
              <span className="text-xs bg-amber-500 text-white px-2.5 py-0.5 rounded-full font-bold">
                Hot Book List
              </span>
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              來看看大家近期在討論與收藏哪些經典故事，點擊一鍵開啟雙語閱讀！
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {books.map((book) => {
              const readers = [
                { name: '妮妮', avatar: '👧🏻' },
                { name: '睿睿', avatar: '👦🏻' },
                { name: '樂樂', avatar: '👧🏼' },
                { name: '小威', avatar: '👦🏼' },
              ].slice(0, Math.floor(Math.random() * 3) + 2);

              const bookTitleStr = typeof book.title === 'string' ? book.title : (book.title['zh-TW'] || book.title.en);

              return (
                <div
                  key={book.id}
                  className="p-4 rounded-2xl border-2 border-amber-100 dark:border-slate-700 hover:border-amber-400 transition-all bg-amber-50/50 dark:bg-slate-900/50 flex gap-4 items-center shadow-xs"
                >
                  <img
                    src={book.coverImage}
                    alt={bookTitleStr}
                    className="w-20 h-28 object-cover rounded-xl shadow-md border border-amber-200 shrink-0"
                  />
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-[10px] font-black text-amber-700 dark:text-amber-300">
                      <span>🏷️ {book.category}</span>
                      <span>•</span>
                      <span>適合 {book.targetAge}</span>
                    </div>
                    <h4 className="font-black text-base text-slate-900 dark:text-slate-100 truncate">
                      {bookTitleStr}
                    </h4>
                    
                    {/* Friends who read this */}
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300">
                      <span className="text-[11px]">熱門讀者：</span>
                      <div className="flex -space-x-1">
                        {readers.map((r, i) => (
                          <span
                            key={i}
                            title={r.name}
                            className="w-6 h-6 rounded-full bg-amber-200 border border-white flex items-center justify-center text-xs"
                          >
                            {r.avatar}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        playStarChime();
                        onSelectBook(book, 1);
                      }}
                      className="py-1.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>線上點讀此繪本</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: Theme Gallery (主題背景選輯) */}
      {activeTab === 'theme_gallery' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border-2 border-amber-200 dark:border-slate-700 space-y-6 shadow-md">
          <div className="space-y-1">
            <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>🎨 繪本主題背景展覽館</span>
              <span className="text-xs bg-amber-500 text-white px-2.5 py-0.5 rounded-full font-bold">
                Book Theme Backgrounds
              </span>
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              發布貼文時可自由選擇獨具情境風格的繪本背景，展現不一樣的閱讀想像！
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {Object.values(THEME_CONFIGS).map((tc) => (
              <div
                key={tc.id}
                className={`p-6 rounded-3xl border-2 shadow-lg bg-gradient-to-br ${tc.bgGradient} ${tc.borderColor} ${tc.textColor} space-y-3 relative overflow-hidden transform hover:-translate-y-1 transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-4xl">{tc.icon}</div>
                  <span className="text-xs font-black bg-white/20 px-3 py-1 rounded-full backdrop-blur-xs">
                    背景風格
                  </span>
                </div>
                <h4 className="font-black text-lg text-white">{tc.name}</h4>
                <div className="flex items-center gap-2">
                  {tc.bgDecorativeIcons.map((ico, idx) => (
                    <span key={idx} className="text-xl">{ico}</span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTheme(tc.id);
                    handleOpenShareModal();
                  }}
                  className="w-full py-2.5 rounded-2xl bg-white text-slate-900 font-black text-xs hover:bg-amber-100 transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-orange-600" />
                  <span>套用此背景發布貼文</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📝 Share & Publish Post Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
          <div className={`relative max-w-2xl w-full rounded-3xl border-2 p-6 sm:p-8 shadow-2xl space-y-6 my-8 ${
            darkMode
              ? 'bg-slate-900 border-amber-500/80 text-slate-100'
              : 'bg-white border-amber-300 text-slate-900'
          }`}>
            <button
              type="button"
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 text-slate-500 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-amber-200 dark:border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-900 dark:text-slate-100">
                  發布繪本完讀心得與數位紀念品
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  選擇你完成的繪本作品，搭配專屬獲得的裝飾，分享給廣大閱讀好朋友！
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* 1. Select Book */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-1">
                  <span>📖 1. 選擇你剛讀完的繪本：</span>
                </label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className={`w-full p-3 rounded-2xl border font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-amber-50/80 border-amber-200 text-amber-950'
                  }`}
                >
                  {books.map((b) => {
                    const titleStr = typeof b.title === 'string' ? b.title : (b.title['zh-TW'] || b.title.en);
                    const isRead = profile.readBookIds.includes(b.id);
                    return (
                      <option key={b.id} value={b.id}>
                        {isRead ? '✅ [已完讀] ' : '📖 '} {titleStr}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* 2. Select Digital Collectible Souvenir */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-1">
                  <span>👑 2. 選擇展示的數位裝飾紀念品：</span>
                </label>
                {profile.collectibles && profile.collectibles.length > 0 ? (
                  <select
                    value={selectedCollectibleId}
                    onChange={(e) => setSelectedCollectibleId(e.target.value)}
                    className={`w-full p-3 rounded-2xl border font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-amber-50/80 border-amber-200 text-amber-950'
                    }`}
                  >
                    {profile.collectibles.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name} ({c.bookTitle})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 rounded-2xl bg-amber-100/70 text-amber-900 text-xs font-bold border border-amber-200">
                    💡 完讀繪本後即可解鎖豐富主題紀念品，目前將以「童心智慧榮譽星章」預設展示！
                  </div>
                )}
              </div>

              {/* 3. Choose Book Theme Background (書本主題背景) */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-1">
                  <span>🎨 3. 選擇繪本主題背景風格：</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.values(THEME_CONFIGS).map((tc) => {
                    const isSelected = selectedTheme === tc.id;
                    return (
                      <button
                        key={tc.id}
                        type="button"
                        onClick={() => setSelectedTheme(tc.id)}
                        className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-2 cursor-pointer bg-gradient-to-r ${tc.bgGradient} ${
                          isSelected ? 'border-amber-400 scale-105 shadow-md ring-2 ring-amber-400' : 'border-transparent opacity-80'
                        }`}
                      >
                        <span className="text-xl">{tc.icon}</span>
                        <span className="text-xs font-black text-white truncate">{tc.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Rating Stars & Thoughts */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-amber-900 dark:text-amber-300">
                    ⭐ 4. 給這本繪本的歡樂評分：
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingInput(star)}
                        className="p-1 hover:scale-125 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= ratingInput ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={thoughtsInput}
                  onChange={(e) => setThoughtsInput(e.target.value)}
                  rows={3}
                  placeholder="寫下你的閱讀心得與感受（例如：我最喜歡主角對抗強敵時展現的勇氣...）"
                  className={`w-full p-3 rounded-2xl border font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-amber-50/50 border-amber-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Quick Tags Selector */}
              <div className="flex items-center gap-2 flex-wrap text-xs font-bold">
                <span className="text-amber-900 dark:text-amber-300">加入心得標籤：</span>
                {['#哲理啟蒙', '#奇幻冒險', '#自信勇氣', '#收穫滿滿', '#五星大推薦'].map((tg) => {
                  const hasTag = selectedTagList.includes(tg);
                  return (
                    <button
                      key={tg}
                      type="button"
                      onClick={() => {
                        if (hasTag) {
                          setSelectedTagList(selectedTagList.filter((t) => t !== tg));
                        } else {
                          setSelectedTagList([...selectedTagList, tg]);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all border ${
                        hasTag
                          ? 'bg-amber-500 text-white border-amber-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300'
                      }`}
                    >
                      {tg}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                id="btn-publish-post-submit"
                onClick={handlePublishPost}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-sm shadow-md transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-white" />
                <span>立即發布到閱讀社交牆</span>
              </button>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
