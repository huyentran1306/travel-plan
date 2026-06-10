export interface Location {
  id: string;
  name: string;
  time: string;
  description: string;
  lat: number;
  lng: number;
  type: 'hotel' | 'food' | 'activity' | 'travel' | 'cafe' | 'party' | 'rest';
  suggestions?: string[];
  address?: string;
}

export interface DayPlan {
  day: number;
  date: string;
  title: string;
  locations: Location[];
}

export const ITINERARY: DayPlan[] = [
  {
    day: 1,
    date: '27/2 (Thứ 6)',
    title: 'Khởi hành SG → Đà Lạt',
    locations: [
      {
        id: 'departure',
        name: 'Rời Ftown 3 - TP. HCM',
        time: '18:00',
        description: 'Tự lái xe xuất phát từ Ftown 3 đi Đà Lạt.',
        lat: 10.8411,
        lng: 106.8100,
        type: 'travel',
        address: 'Ftown 3, Quận 9, TP. HCM'
      },
      {
        id: 'dinner-way',
        name: 'Nghỉ ăn tối dọc đường',
        time: '20:30',
        description: 'Dừng chân nghỉ ngơi và ăn tối tại Bảo Lộc hoặc dọc QL20.',
        lat: 11.5450,
        lng: 107.8050,
        type: 'food'
      },
      {
        id: 'hotel-checkin',
        name: 'Check-in Là Đà Lạt',
        time: '23:30 – 00:00',
        description: 'Tới Đà Lạt, làm thủ tục nhận phòng và nghỉ ngơi.',
        lat: 11.9796,
        lng: 108.4451,
        type: 'hotel',
        address: 'Ladalat Hotel, 106 Mai Anh Đào, Phường 8, Đà Lạt'
      }
    ]
  },
  {
    day: 2,
    date: '28/2 (Thứ 7)',
    title: 'Ngày ăn chơi chính',
    locations: [
      {
        id: 'breakfast-2',
        name: 'Bún Bò Huế Thiên Trang',
        time: '08:00',
        description: 'Ăn sáng món bún bò Huế trứ danh.',
        lat: 11.9385,
        lng: 108.4345,
        type: 'food',
        address: '2 Hồ Tùng Mậu, Phường 3, Đà Lạt'
      },
      {
        id: 'morning-cafe',
        name: 'An Cafe',
        time: '09:00 – 10:00',
        description: 'Cafe sáng nhẹ nhàng, không gian xanh mát.',
        lat: 11.9420,
        lng: 108.4340,
        type: 'cafe',
        address: '63Bis Ba Tháng Hai, Phường 1, Đà Lạt'
      },
      {
        id: 'hoa-ban',
        name: 'Ngắm Hoa Ban Trắng',
        time: '10:00 – 11:00',
        description: 'Dạo khu Trần Phú — Hoàng Văn Thụ ngắm hoa nở rộ.',
        lat: 11.9365,
        lng: 108.4355,
        type: 'activity'
      },
      {
        id: 'church',
        name: 'Nhà thờ Con Gà Đà Lạt',
        time: '11:00 – 11:30',
        description: 'Tham quan kiến trúc độc đáo của nhà thờ Chánh Tòa.',
        lat: 11.9375,
        lng: 108.4375,
        type: 'activity',
        address: '15 Trần Phú, Phường 3, Đà Lạt'
      },
      {
        id: 'lunch-2',
        name: 'Cơm Linh Đà Lạt',
        time: '12:00 – 13:00',
        description: 'Ăn trưa món Việt đậm đà hương vị gia đình.',
        lat: 11.9420,
        lng: 108.4360,
        type: 'food',
        address: 'Cơm Linh Đà Lạt'
      },
      {
        id: 'cafe-still',
        name: 'Still Cafe',
        time: '14:00 – 15:30',
        description: 'Cafe nghỉ ngơi trong không gian phong cách Nhật Bản.',
        lat: 11.9455,
        lng: 108.4335,
        type: 'cafe',
        address: '59 Nguyễn Trãi, Phường 9, Đà Lạt'
      },
      {
        id: 'lake-walk',
        name: 'Dạo Hồ Xuân Hương',
        time: '16:30',
        description: 'Tận hưởng không khí mát lạnh ven hồ.',
        lat: 11.9389,
        lng: 108.4447,
        type: 'activity'
      },
      {
        id: 'back-hotel',
        name: 'Về khách sạn nghỉ ngơi',
        time: '17:30',
        description: 'Tắm rửa, thay đồ chuẩn bị cho buổi tối.',
        lat: 11.9796,
        lng: 108.4451,
        type: 'rest',
        address: 'Ladalat Hotel'
      },
      {
        id: 'dinner-bbq',
        name: 'Quán Nướng Chill in Dalat',
        time: '18:30',
        description: 'Thưởng thức nướng BBQ trong không gian chill.',
        lat: 11.9475,
        lng: 108.4425,
        type: 'food',
        address: 'Chill in Dalat BBQ'
      },
      {
        id: 'hot-milk',
        name: 'Sữa Đậu Nành Hoa Sữa',
        time: '20:00',
        description: 'Thưởng thức sữa nóng đặc trưng Đà Lạt.',
        lat: 11.9420,
        lng: 108.4360,
        type: 'cafe',
        address: '64 Tăng Bạt Hổ, Phường 1, Đà Lạt'
      },
      {
        id: 'night-market',
        name: 'Dạo Chợ Đà Lạt',
        time: '21:00',
        description: 'Ăn vặt nhẹ, mua sắm đồ len, dạo phố đêm.',
        lat: 11.9425,
        lng: 108.4361,
        type: 'activity'
      },
      {
        id: 'hotel-party',
        name: 'Tiệc thân mật tại Khách sạn',
        time: '22:00',
        description: 'Giao lưu tại phòng với snack, trái cây và nhạc chill.',
        lat: 11.9796,
        lng: 108.4451,
        type: 'party',
        address: 'Ladalat Hotel'
      }
    ]
  },
  {
    day: 3,
    date: '1/3 (Chủ nhật)',
    title: 'Chill nhẹ rồi về SG',
    locations: [
      {
        id: 'morning-cafe-3',
        name: 'An Cafe',
        time: '08:00',
        description: 'Cafe sáng cuối tuần thư giãn.',
        lat: 11.9420,
        lng: 108.4340,
        type: 'cafe',
        address: '63Bis Ba Tháng Hai, Phường 1, Đà Lạt'
      },
      {
        id: 'breakfast-3',
        name: 'Bánh Mì Xíu Mại Hoàng Diệu',
        time: '09:00',
        description: 'Ăn sáng món bánh mì xíu mại nổi tiếng.',
        lat: 11.9468,
        lng: 108.4315,
        type: 'food',
        address: '26 Hoàng Diệu, Phường 5, Đà Lạt'
      },
      {
        id: 'checkout-souvenirs',
        name: 'Mua đặc sản & Check-out',
        time: '09:30 – 11:30',
        description: 'Mua quà lưu niệm và trả phòng.',
        lat: 11.9425,
        lng: 108.4361,
        type: 'activity'
      },
      {
        id: 'lunch-final',
        name: 'Lẩu Gà Lá É Tao Ngộ',
        time: '11:30',
        description: 'Bữa trưa cuối cùng tại Đà Lạt.',
        lat: 11.9355,
        lng: 108.4485,
        type: 'food',
        address: 'Lẩu Gà Lá É Tao Ngộ'
      },
      {
        id: 'return-sg-start',
        name: 'Khởi hành về SG',
        time: '12:30',
        description: 'Tạm biệt Đà Lạt, bắt đầu hành trình về lại Sài Gòn.',
        lat: 11.9796,
        lng: 108.4451,
        type: 'travel'
      },
      {
        id: 'afternoon-snack',
        name: 'Dừng ăn chiều - Gà Nướng Cây Xoài',
        time: '16:30 – 17:30',
        description: 'Nghỉ ngơi và ăn chiều tại QL1A.',
        lat: 10.9500,
        lng: 106.8000,
        type: 'food',
        address: 'Gà Nướng Cây Xoài, QL1A'
      },
      {
        id: 'home',
        name: 'Về tới TP. HCM',
        time: '21:00',
        description: 'Kết thúc chuyến đi tốt đẹp.',
        lat: 10.8411,
        lng: 106.8100,
        type: 'travel'
      }
    ]
  }
];
