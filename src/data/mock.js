export const mockProducts = [
    { id: 1, title: 'iPhone 13 Pro', price: 18000, condition: '九成新', category: '3C', image: '📱', seller: '資工系 王同學', rating: 4.8, dept: '資訊工程學系' },
    { id: 2, title: '微積分課本', price: 300, condition: '八成新', category: '教科書/筆記', image: '📚', seller: '數學系 李同學', rating: 5.0, dept: '數學系' },
    { id: 3, title: '電風扇', price: 500, condition: '全新', category: '宿舍用品', image: '🌀', seller: '企管系 陳同學', rating: 4.5, dept: '企管學系' },
    { id: 4, title: '木吉他', price: 3500, condition: '九成新', category: '社團器材', image: '🎸', seller: '音樂社 張同學', rating: 4.9, dept: '中國文學系' },
    { id: 5, title: '棉麻洋裝', price: 450, condition: '八成新', category: '服飾', image: '👗', seller: '經濟系 林同學', rating: 4.7, dept: '經濟學系' },
    { id: 6, title: '檯燈', price: 280, condition: '九成新', category: '宿舍用品', image: '💡', seller: '物理系 黃同學', rating: 4.6, dept: '物理學系' },
];

export const mockNotifications = [
    { id: 1, type: 'message', title: '新訊息', content: '資工系 王同學：請問還有嗎？', time: '5分鐘前', read: false },
    { id: 2, type: 'like', title: '有人收藏了你的物品', content: '「iPhone 13 Pro」被收藏了', time: '1小時前', read: false },
    { id: 3, type: 'system', title: '交易提醒', content: '記得與買家約定面交時間喔', time: '2小時前', read: true },
    { id: 4, type: 'review', title: '收到新評價', content: '數學系 李同學給了你 5 星好評', time: '昨天', read: true },
];

export const categories = ['全部', '教科書與書籍', '3C 電子與周邊', '生活家電', '家具與收納', '交通工具', '服飾與包包', '美妝', '票券', '其他'];

export const conditions = ['全新', '近全新', '二手'];

// College and department hierarchy for NCU
export const colleges = [
    { name: '全部學院', departments: [] },
    {
        name: '文學院',
        departments: ['文學院學士學位學程', '中國文學系', '英美語文學系', '法國語文學系', '哲學研究所', '藝術學研究所', '歷史研究所', '學習與教學研究所', '亞際文化研究國際碩士學位學程', '師資培育中心']
    },
    {
        name: '理學院',
        departments: ['理學院聯合學士學位學程', '物理學系', '數學系', '化學系', '光電科學與工程學系', '統計研究所', '天文研究所', '國際光電博士學位學程']
    },
    {
        name: '工學院',
        departments: ['工學院學士學位學程', '化學工程與材料工程學系', '土木工程學系', '機械工程學系', '能源工程研究所', '環境工程研究所', '材料科學與工程研究所']
    },
    {
        name: '管理學院',
        departments: ['企業管理學系', '資訊管理學系', '財務金融學系', '經濟學系', '會計研究所', '產業經濟研究所', '人力資源管理研究所', '工業管理研究所', '國際經營管理碩士班', '高階主管企管碩士班']
    },
    {
        name: '資訊電機學院',
        departments: ['資電學院學士學位學程', '電機工程學系', '資訊工程學系', '通訊工程學系', '網路學習科技研究所', '人工智慧國際碩士學位學程']
    },
    {
        name: '地球科學學院',
        departments: ['地球系統科學學士學位學程', '地球科學系', '大氣科學系', '太空科學與工程學系', '應用地質研究所', '水文與海洋科學研究所', '地球系統科學國際博士學位學程']
    },
    {
        name: '客家學院',
        departments: ['客家語文暨社會科學學系', '法律與政府研究所']
    },
    {
        name: '生醫理工學院',
        departments: ['生命科學系', '認知神經科學研究所', '跨領域神經科學國際博士學位學程', '生醫科學與工程學系']
    },
    {
        name: '永續與綠能科技研究學院',
        departments: ['永續領導力碩/博士學位學程', '永續去碳科技碩/博士學位學程', '永續綠能科技碩/博士學位學程']
    },
    {
        name: '其他分類',
        departments: ['其他']
    },
];

// Flat list of all departments for profile dropdown
export const departments = [
    '選擇系所',
    '文學院學士學位學程',
    '中國文學系',
    '英美語文學系',
    '法國語文學系',
    '哲學研究所',
    '藝術學研究所',
    '歷史研究所',
    '學習與教學研究所',
    '亞際文化研究國際碩士學位學程',
    '師資培育中心',
    '理學院聯合學士學位學程',
    '物理學系',
    '數學系',
    '化學系',
    '光電科學與工程學系',
    '統計研究所',
    '天文研究所',
    '國際光電博士學位學程',
    '工學院學士學位學程',
    '化學工程與材料工程學系',
    '土木工程學系',
    '機械工程學系',
    '能源工程研究所',
    '環境工程研究所',
    '材料科學與工程研究所',
    '企業管理學系',
    '資訊管理學系',
    '財務金融學系',
    '經濟學系',
    '會計研究所',
    '產業經濟研究所',
    '人力資源管理研究所',
    '工業管理研究所',
    '國際經營管理碩士班',
    '高階主管企管碩士班',
    '資電學院學士學位學程',
    '電機工程學系',
    '資訊工程學系',
    '通訊工程學系',
    '網路學習科技研究所',
    '人工智慧國際碩士學位學程',
    '地球系統科學學士學位學程',
    '地球科學系',
    '大氣科學系',
    '太空科學與工程學系',
    '應用地質研究所',
    '水文與海洋科學研究所',
    '地球系統科學國際博士學位學程',
    '客家語文暨社會科學學系',
    '法律與政府研究所',
    '生命科學系',
    '認知神經科學研究所',
    '跨領域神經科學國際博士學位學程',
    '生醫科學與工程學系',
    '永續領導力碩/博士學位學程',
    '永續去碳科技碩/博士學位學程',
    '永續綠能科技碩/博士學位學程',
    '其他',
];

export const meetingPointCategories = [
    {
        name: '文學院',
        locations: ['文學一館', '文學二館', '人文社會科學大樓']
    },
    {
        name: '理學院',
        locations: ['國鼎光電大樓', '鴻經館', '科學二館', '科學三館', '科學四館']
    },
    {
        name: '工學院',
        locations: ['工程一館', '工程三館', '工程四館', '工程五館']
    },
    {
        name: '管理學院',
        locations: ['管理一館 (志希館)', '管理二館']
    },
    {
        name: '資電學院',
        locations: ['工程二館', '工程五館']
    },
    {
        name: '地科學院',
        locations: ['科學一館', '科學二館', '科學三館', '科學四館']
    },
    {
        name: '客家學院',
        locations: ['客家學院大樓']
    },
    {
        name: '生醫理工學院 / 太空及遙測',
        locations: ['科學五館', '太空遙測中心']
    },
    {
        name: '行政單位',
        locations: ['行政大樓']
    },
    {
        name: '圖書館',
        locations: ['總圖書館', '中正圖書館', '國鼎圖書館']
    },
    {
        name: '餐飲設施',
        locations: ['松果餐廳', '松苑餐廳', '小木屋鬆餅']
    },
    {
        name: '宿舍區',
        locations: ['國際學生宿舍', '中大會館', '女1~4舍', '女十四舍', '男三舍', '男五舍', '男六舍', '男七舍', '男九舍', '男十一舍', '男十二舍', '男研舍']
    },
    {
        name: '其他',
        locations: ['其他']
    }
];

// Flat list for backward compatibility
export const meetingPoints = meetingPointCategories.flatMap(cat => cat.locations);
