export const mockProducts = [
    { id: 1, title: 'iPhone 13 Pro', price: 18000, condition: '九成新', category: '3C', image: '📱', seller: '資工系 王同學', rating: 4.8, dept: '資工系' },
    { id: 2, title: '微積分課本', price: 300, condition: '八成新', category: '教科書/筆記', image: '📚', seller: '數學系 李同學', rating: 5.0, dept: '數學系' },
    { id: 3, title: '電風扇', price: 500, condition: '全新', category: '宿舍用品', image: '🌀', seller: '企管系 陳同學', rating: 4.5, dept: '企管系' },
    { id: 4, title: '木吉他', price: 3500, condition: '九成新', category: '社團器材', image: '🎸', seller: '音樂社 張同學', rating: 4.9, dept: '中文系' },
    { id: 5, title: '棉麻洋裝', price: 450, condition: '八成新', category: '服飾', image: '👗', seller: '經濟系 林同學', rating: 4.7, dept: '經濟系' },
    { id: 6, title: '檯燈', price: 280, condition: '九成新', category: '宿舍用品', image: '💡', seller: '物理系 黃同學', rating: 4.6, dept: '物理系' },
];

export const mockNotifications = [
    { id: 1, type: 'message', title: '新訊息', content: '資工系 王同學：請問還有嗎？', time: '5分鐘前', read: false },
    { id: 2, type: 'like', title: '有人收藏了你的物品', content: '「iPhone 13 Pro」被收藏了', time: '1小時前', read: false },
    { id: 3, type: 'system', title: '交易提醒', content: '記得與買家約定面交時間喔', time: '2小時前', read: true },
    { id: 4, type: 'review', title: '收到新評價', content: '數學系 李同學給了你 5 星好評', time: '昨天', read: true },
];

export const categories = ['全部', '3C', '服飾', '教科書/筆記', '宿舍用品', '社團器材', '食品', '其他'];
export const departments = ['全部系所', '資工系', '數學系', '企管系', '中文系', '物理系', '化學系', '經濟系'];
export const meetingPoints = ['中大湖', '女十四舍', '正門警衛室', '圖書館', '學生餐廳'];
