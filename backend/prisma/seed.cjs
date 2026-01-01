const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user1 = await prisma.user.create({
    data: {
      email: 'wang@cs.ncu.edu.tw',
      password: 'hashed_password_123',
      name: '資工系 王同學',
      department: '資工系',
      avatar: '👤'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'li@math.ncu.edu.tw',
      password: 'hashed_password_123',
      name: '數學系 李同學',
      department: '數學系',
      avatar: '👤'
    }
  });
  
  const user3 = await prisma.user.create({
      data: {
        email: 'chen@ba.ncu.edu.tw',
        password: 'hashed_password_123',
        name: '企管系 陳同學',
        department: '企管系',
        avatar: '👤'
      }
    });

  await prisma.product.create({
    data: {
      title: 'iPhone 13 Pro',
      price: 18000,
      description: '九成新',
      category: '3C',
      images: JSON.stringify(['📱']),
      status: 'active',
      sellerId: user1.id
    }
  });

  await prisma.product.create({
    data: {
      title: '微積分課本',
      price: 300,
      description: '八成新',
      category: '教科書/筆記',
      images: JSON.stringify(['📚']),
      status: 'active',
      sellerId: user2.id
    }
  });
  
    await prisma.product.create({
    data: {
      title: '電風扇',
      price: 500,
      description: '全新',
      category: '宿舍用品',
      images: JSON.stringify(['🌀']),
      status: 'active',
      sellerId: user3.id
    }
  });

  const chat1 = await prisma.chat.create({
    data: {
      participants: {
        connect: [{ id: user1.id }, { id: user2.id }]
      }
    }
  });
  
  await prisma.message.create({
      data: {
          content: '請問還有嗎？',
          senderId: user2.id,
          chatId: chat1.id,
          read: false
      }
  });
  
  await prisma.notification.create({
      data: {
          userId: user1.id,
          type: 'message',
          title: '新訊息',
          content: '數學系 李同學：請問還有嗎？',
          read: false
      }
  });

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
