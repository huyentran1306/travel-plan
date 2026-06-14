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
  guide?: string;
  order_index?: number;
}

export interface DayPlan {
  day: number;
  date: string;
  title: string;
  locations: Location[];
}

export interface Trip {
  id: string;
  name: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  imageUrl?: string;
}

export const DEFAULT_TRIPS: Trip[] = [
  {
    id: 'phu-yen-2026',
    name: 'Phú Yên - Hoa Vàng Cỏ Xanh 🌾',
    description: 'Chuyến hành trình về miền xứ sở hoa vàng trên cỏ xanh mộc mạc, yên bình và nồng ấm tình người.',
    startDate: '2026-06-18',
    endDate: '2026-06-21',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'da-lat-2026',
    name: 'Đà Lạt Sương Mù & Săn Mây ☁️',
    description: 'Tận hưởng cái lạnh mát mẻ của cao nguyên lâm viên, săn mây đồi chè và chill sườn dốc quán cafe.',
    startDate: '2026-07-24',
    endDate: '2026-07-27',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'vung-tau-2026',
    name: 'Vũng Tàu Team building rực lửa 🔥',
    description: 'Chuyến viễn chinh bãi biển sôi động ngập tràn nắng gió, thưởng thức cua ghẹ ngập tràn năng lượng.',
    startDate: '2026-04-12',
    endDate: '2026-04-14',
    imageUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80'
  }
];

export const DALAT_ITINERARY: DayPlan[] = [
  {
    day: 1,
    date: '24/07/2026 (Thứ 6)',
    title: 'Khởi hành - Check-in homestay view thung lũng',
    locations: [
      {
        id: 'dl-t1-1',
        name: 'Xe Thành Bưởi xuất phát từ Sài Sòn',
        time: '23:00',
        description: 'Bắt đầu chuyến đi lên thành phố sương mù trên xe limousine giường nằm cao cấp.',
        lat: 10.8220,
        lng: 106.6860,
        type: 'travel',
        guide: 'Lên xe đúng giờ tại văn phòng Lê Hồng Phong',
        suggestions: ['Mang tất ấm', 'Mang khẩu trang giữ ẩm']
      },
      {
        id: 'dl-t1-2',
        name: 'Đón bình minh tại đồi sương',
        time: '06:00',
        description: 'Tới Đà Lạt, check-in sớm, đón những ánh nắng ấm áp xuyên qua rặng thông xanh mướt.',
        lat: 11.9404,
        lng: 108.4583,
        type: 'rest',
        guide: 'Xe trung chuyển đưa thẳng về homestay Phường 11'
      }
    ]
  },
  {
    day: 2,
    date: '25/07/2026 (Thứ 7)',
    title: 'Săn mây Cầu Đất & Tiệc BBQ tối',
    locations: [
      {
        id: 'dl-t2-1',
        name: 'Săn mây thảm gỗ Cầu Đất',
        time: '04:30',
        description: 'Trải nghiệm ngắm biển mây cuồn cuộn trắng xóa tuyệt đẹp giữa núi đồi.',
        lat: 11.8902,
        lng: 108.5601,
        type: 'activity',
        guide: 'Mặc ấm (nhiệt độ tầm 14-16 độ C)',
        suggestions: ['Chụp hình với quạt gió khổng lồ']
      },
      {
        id: 'dl-t2-2',
        name: 'Ăn mì quảng ếch nóng hổi',
        time: '07:30',
        description: 'Lấp đầy chiếc bụng đói sau chuyến săn mây lạnh cóng.',
        lat: 11.9430,
        lng: 108.4350,
        type: 'food'
      },
      {
        id: 'dl-t2-3',
        name: 'BBQ Homestay thung lũng ấm áp',
        time: '18:00',
        description: 'Quây quần đốt lửa trại thịt nướng xèo xèo, khoai lang nướng thơm nức mũi.',
        lat: 11.9350,
        lng: 108.4600,
        type: 'party',
        guide: 'Thịt bò tơ dồi dào, uống rượu cần thơm nhẹ'
      }
    ]
  }
];

export const VUNGTAU_ITINERARY: DayPlan[] = [
  {
    day: 1,
    date: '12/04/2026 (Thứ 2)',
    title: 'Khám phá Ngọn Hải Đăng & Thưởng thức hải sản',
    locations: [
      {
        id: 'vt-t1-1',
        name: 'Khởi hành xe Limousine Sài Gòn - Vũng Tàu',
        time: '08:00',
        description: 'Di chuyển 2 tiếng êm ái trên cao tốc Long Thành Giầu Dây đi thẳng bãi Sau.',
        lat: 10.7760,
        lng: 106.6960,
        type: 'travel'
      },
      {
        id: 'vt-t1-2',
        name: 'Ăn bánh khọt cô Ba Vũng Tàu',
        time: '11:00',
        description: 'Thưởng thức bánh khọt tôm mực giòn rụm đu đủ bào thanh mát nổi danh Vũng Tàu.',
        lat: 10.3420,
        lng: 107.0850,
        type: 'food',
        guide: '12 Hoàng Hoa Thám'
      },
      {
        id: 'vt-t1-3',
        name: 'Lên ngọn Hải Đăng Vũng Tàu ngắm biển rộng',
        time: '15:30',
        description: 'Tận hưởng toàn cảnh bờ biển cát vàng và những con tàu cá tấp nập dưới chân đồi.',
        lat: 10.3340,
        lng: 107.0780,
        type: 'activity',
        suggestions: ['Ăn sữa chua dẻo trứng lòng đào cô Tiên']
      }
    ]
  }
];

export const ITINERARY: DayPlan[] = [
  {
    day: 1,
    date: '18/06/2026 (Thứ 5)',
    title: 'Khởi hành đêm từ Sài Gòn 🌙',
    locations: [
      {
        id: 'py-t1-1',
        name: 'Xe xuất phát từ Bến xe Miền Đông Mới',
        time: '20:00',
        description: 'Đoàn lên xe khách chất lượng cao đi Phú Yên, bắt đầu chuyến vi vu mùa hè ngập nắng gió.',
        lat: 10.8812,
        lng: 106.8085,
        type: 'travel',
        address: 'Bến xe Miền Đông Mới, TP.HCM',
        guide: 'Lên xe đúng giờ (Phuong Trang), chuẩn bị đồ dùng cá nhân gọn nhẹ',
        suggestions: ['Mang dép tông thoải mái', 'Ăn nhẹ trước khi lên xe']
      }
    ]
  },
  {
    day: 2,
    date: '19/06/2026 (Thứ 6)',
    title: '🏞️ Đón bình minh Tuy Hòa - Trải nghiệm Suối Hoang Sơ',
    locations: [
      {
        id: 'py-t2-1',
        name: 'Di chuyển thong thả trên xe',
        time: '05:00 - 08:00',
        description: 'Xe lăn bánh qua những cung đường ven biển tuyệt đẹp của duyên hải Trung Bộ, đón những tia hừng đông đầu tiên.',
        lat: 12.3000,
        lng: 109.0000,
        type: 'travel',
        guide: 'Nghỉ ngơi, ngủ nốt giấc sâu giữ sức khỏe dồi dào'
      },
      {
        id: 'py-t2-2',
        name: 'Tới Bến Xe Nam Tuy Hòa',
        time: '08:00',
        description: 'Cập bến xe Nam Tuy Hòa, tập trung hành lý của nhóm gọn gàng và bắt đầu dời hành trình bằng TAXI HOA về Tây Hòa.',
        lat: 13.0645,
        lng: 109.3039,
        type: 'travel',
        address: 'Bến xe Nam Tuy Hòa, Phú Yên',
        guide: 'Chuyển dời sang xe Taxi Hoa đưa thẳng về phía Tây Hòa mộc mạc',
        suggestions: ['Kiểm tra hành lý cẩn thận', 'Rửa mặt cho tỉnh táo']
      },
      {
        id: 'py-t2-3',
        name: 'Tới nhà Liền nghỉ ngơi & Ăn sáng',
        time: '09:00 - 10:30',
        description: 'Về tới nhà Liền ấm cáp, nghỉ chân rửa mặt, thưởng thức bữa ăn sáng nóng hổi chất phác nông thôn Phú Yên và ngủ bù 1 tiếng.',
        lat: 13.0185,
        lng: 109.1235,
        type: 'rest',
        address: 'Nhà Liền, Hòa Mỹ, Tây Hòa',
        guide: 'Một nhóm nghỉ ngơi, một số còn lại cùng chuẩn bị đồ ăn mang theo dã ngoại dọn suối',
        suggestions: ['Ăn tô bún nóng ấm bụng']
      },
      {
        id: 'py-t2-4',
        name: '🏞️ ĐI SUỐI: Tắm suối mát + Nướng thịt BBQ',
        time: '10:30 - 15:00',
        description: 'Hoạt động dã ngoại chính: Hòa mình vào suối mát lạnh (Suối Tiên/Suối Trầm), nhóm lửa hồng nướng ba rọi BBQ cực thơm ngon.',
        lat: 12.9130,
        lng: 109.0768,
        type: 'activity',
        address: 'Một con suối mát vùng Tuy An/Tây Hòa',
        guide: 'Mang theo quần áo bơi dự phòng và dép chống trượt. CẦN XÁC NHẬN địa điểm suối cụ thể với locals trước khi xuất phát!',
        suggestions: ['Nướng thịt ba rọi xiên que cực cuốn', 'Tuyệt đối thu dọn vỏ lon, rác đem về']
      },
      {
        id: 'py-t2-5',
        name: 'Xế chiều: Tiếp tục giao luận bờ suối hoặc về nhà',
        time: '15:30 - 18:00',
        description: 'Vui vẻ trò chuyện gắn kết tình cảm bạn bè, nếu còn chưa say thì có thể mang đồ về sân nhà Liền tụ tập lai rai tiếp.',
        lat: 13.0185,
        lng: 109.1235,
        type: 'party',
        address: 'Suối thiên nhiên hoặc nhà Liền'
      },
      {
        id: 'py-t2-6',
        name: 'Tối: Ăn tối sum vầy mộc mạc',
        time: '18:30 - 21:00',
        description: 'Dùng bữa tối nồng ấm tại nhà Liền hoặc ra quán uống cafe giải trí địa phương nhẹ nhàng.',
        lat: 13.0185,
        lng: 109.1235,
        type: 'food',
        address: 'Nhà Liền, Hòa Mỹ'
      },
      {
        id: 'py-t2-7',
        name: 'Về phòng nghỉ ngơi sớm chuẩn bị sức',
        time: '21:30',
        description: 'Nghỉ ngơi sớm để chuẩn bị năng lượng tốt nhất cho chuyến vi hành Vịnh biển Vũng Rô kỳ vĩ ngày tiếp theo.',
        lat: 13.0185,
        lng: 109.1235,
        type: 'rest',
        guide: 'Sạc đầy pin các thiết bị điện thoại chuẩn bị săn ảnh đẹp'
      }
    ]
  },
  {
    day: 3,
    date: '20/06/2026 (Thứ 7)',
    title: '🏖️ Khám phá Vịnh Vũng Rô - Đêm lãng mạn Làng Lô',
    locations: [
      {
        id: 'py-t3-1',
        name: 'Thức dậy & Ăn sáng đầy năng lượng',
        time: '07:00 - 08:00',
        description: 'Nhận bình minh trong lành chốn Tây Hòa. Ăn sáng bánh bèo chén, bánh hỏi lòng heo nức tiếng.',
        lat: 13.0185,
        lng: 109.1235,
        type: 'food',
        address: 'Nhà Liền hoặc quán ăn gần đó',
        guide: 'Mặc trang phục năng động đi biển, bôi kem chống nắng đầy đủ'
      },
      {
        id: 'py-t3-2',
        name: '🏖️ Khởi hành đi Vịnh Vũng Rô tham quan',
        time: '08:30 - 11:30',
        description: 'Cùng check-in Vịnh Vũng Rô di tích tích đường biển Không Số hào hùng dưới chân Đèo Cả hùng vĩ.',
        lat: 12.8600,
        lng: 109.4150,
        type: 'activity',
        address: 'Vịnh Vũng Rô, Đông Hòa, Phú Yên',
        guide: 'Cano trung chuyển rước ra các bè biển khoảng 25-30k/khách',
        suggestions: ['Check-in mỏm đá nhô ra biển cực xịn', 'Ngắm sắc xanh lục bảo của vịnh']
      },
      {
        id: 'py-t3-3',
        name: '🏨 Check-in Hotel / Homestay Làng Lô',
        time: '12:00 - 13:00',
        description: 'Làm thủ tục nhận phòng xinh xắn sát bãi biển làng chài chầm chậm thanh bình tại Làng Lô.',
        lat: 12.8650,
        lng: 109.4210,
        type: 'hotel',
        address: 'Làng Lô (Làng Chài), Vịnh Vũng Rô, Phú Yên',
        guide: 'Tắm rửa sơ cho sảng khoái mát mẻ'
      },
      {
        id: 'py-t3-4',
        name: 'Ăn trưa đại tiệc cua ghẹ tươi rói',
        time: '13:30 - 14:30',
        description: 'Bữa trưa ngập tràn hải sản tại bến tàu cá Làng Lô: cua luộc ngọt thịt, cá bớp hấp hành và hàu nướng mỡ hành.',
        lat: 12.8655,
        lng: 109.4220,
        type: 'food',
        address: 'Nhà hàng biển tại Làng Lô',
        suggestions: ['Hỏi giá hải sản tươi sống trước khi bắt', 'Nên làm ly nước lá tía tô hạ nhiệt']
      },
      {
        id: 'py-t3-5',
        name: 'Nghỉ ngơi lấy tĩnh tại phòng',
        time: '15:00 - 16:30',
        description: 'Tránh nắng gắt bóng xế chiều, tận hưởng một giấc chợp mắt dịu tai bên tiếng sóng vỗ.',
        lat: 12.8650,
        lng: 109.4210,
        type: 'rest',
        guide: 'Thời tiết buổi trưa nóng ẩm, nên xả máy lạnh thư giãn'
      },
      {
        id: 'py-t3-6',
        name: '🌅 Săn hoàng hôn thơ mộng trên biển Làng Chài',
        time: '17:00 - 18:30',
        description: 'Khoảnh khắc mặt trời đỏ dịu rủ bóng vàng xuống mặt biển mờ sương, thuyền chài tụ họp lấp loáng xa xăm.',
        lat: 12.8660,
        lng: 109.4200,
        type: 'activity',
        address: 'Làng Lô (Làng Chài), Phú Yên',
        suggestions: ['Chụp ảnh phơi sáng mặt biển đỏ rực', 'Tự do dạo bờ cát vàng mịn màng']
      },
      {
        id: 'py-t3-7',
        name: 'Ăn tối dã vị mộc mạc và Cafe bờ biển',
        time: '19:00 - 21:00',
        description: 'Lai rai tối với các món ăn vặt đặc trưng của làng chài mộc mạc, hóng gió biển khơi dạt dào lộng lẫy buổi tối.',
        lat: 12.8670,
        lng: 109.4230,
        type: 'food',
        address: 'Nhà hàng / Quán ăn vặt Làng Lô',
        suggestions: ['Thưởng thức chè hột sen mát lạnh', 'Làm ly sinh tố vừa đi bộ bờ biển']
      },
      {
        id: 'py-t3-8',
        name: 'Về homestay nghỉ ngơi thư thái',
        time: '21:30',
        description: 'Tận hưởng đêm yên tĩnh dạt dào sảng khoái thấu xương của làng biển, chìm vào giấc mơ mộc mạc.',
        lat: 12.8650,
        lng: 109.4210,
        type: 'rest',
        guide: 'Ngủ đủ giấc sẵn sàng cho nửa ngày khám phá nội ô hôm sau'
      }
    ]
  },
  {
    day: 4,
    date: '21/06/2026 (Chủ nhật)',
    title: 'Sống ảo nội thành Tuy Hòa - Kết thúc trọn vẹn ✨',
    locations: [
      {
        id: 'py-t4-1',
        name: 'Thưởng thức điểm tâm sáng ngắm hừng đông',
        time: '06:00 - 08:00',
        description: 'Đón trọn vẹn tia nắng bình minh dịu ngọt chân trời Làng Lô, thưởng thức cháo hải sản hoặc bún chả sứa dai ngon.',
        lat: 12.8650,
        lng: 109.4210,
        type: 'food',
        address: 'Bãi biển Làng Lô hoặc quán ăn sáng sát biển',
        suggestions: ['Nếu mệt mỏi có thể ngủ thêm đến trưa, tự do xả hơi']
      },
      {
        id: 'py-t4-2',
        name: 'Trả phòng Check-out homestay gọn ghẽ',
        time: '09:00 - 10:00',
        description: 'Đóng gói đồ đạc chỉnh chu lịch sử cá nhân, dọn sạch phòng trước khi nói lời tạm biệt mảnh đất nồng hậu Làng Lô.',
        lat: 12.8650,
        lng: 109.4210,
        type: 'hotel',
        address: 'Homestay của bạn tại Làng Lô',
        guide: 'Nhớ đảo mắt rà soát kỹ sạc cáp, tư trang cá nhân kẻo quên'
      },
      {
        id: 'py-t4-3',
        name: '🎯 Sống ảo thả ga các điểm Cafe xinh đẹp nội thành',
        time: '10:30 - 12:00',
        description: 'Dừng chân check-in quán cafe có view sống ảo cực thơ được giới trẻ ưa chuộng cuồng bạo.',
        lat: 13.0910,
        lng: 109.3080,
        type: 'cafe',
        address: 'Alice Tea Room (28-30-32 Cần Vương) hoặc The Urban Cafe (392 Hùng Vương), Tuy Hòa',
        guide: 'Alice Tea Room: 0934 842 227 - The Urban Cafe view vườn rợp lãng mạn',
        suggestions: ['Chụp ảnh phong thái quý tộc cùng hoa hồng ở quán Alice']
      },
      {
        id: 'py-t4-4',
        name: '🍴 Bữa trưa đại tiệc đặc sản Phú Yên lần cuối',
        time: '12:00 - 13:30',
        description: 'Tận hưởng đại tiệc gà luộc niêu nước dừa ngọt thơm khôn nguôi hoặc cơm gà Tuy Hòa đậm đà sướng miệng.',
        lat: 13.0980,
        lng: 109.3140,
        type: 'food',
        address: 'Hoa Vàng Restaurant (357-359 Hùng Vương) hoặc Ms. Tam (289 Lê Duẩn), Tuy Hòa',
        guide: 'Hãy gọi hotline của Hoa Vàng đặt bàn trước: 0981 357 359',
        suggestions: ['Thịt cơm gà dẻo dẻo giòn da siêu ngon']
      },
      {
        id: 'py-t4-5',
        name: '☕ Tự tình thư thái thung lũng cafe sách mát mẻ',
        time: '13:30 - 15:00',
        description: 'Có những phút giây thong thả trao nhau những cái bàn luận, nhai trân châu nói chuyện rôm rả.',
        lat: 13.1110,
        lng: 109.3250,
        type: 'cafe',
        address: 'PHD Book & Coffee (An Dương Vương) hoặc Gozo Brew House hoành tráng',
        suggestions: ['Ghé hóng mát húp ngụm trà mát lạnh sảng khoái']
      },
      {
        id: 'py-t4-6',
        name: '🏠 Quay lại nhà Liền tắm rửa chuẩn bị lên xe',
        time: '15:00 - 15:30',
        description: 'Thu xếp về nhà Liền gội rửa sạch sẽ mát rượi làn da trước khi bắt đầu hành trình dài dặc quay về Sài Gòn phồn hoa.',
        lat: 13.0185,
        lng: 109.1235,
        type: 'rest',
        address: 'Nhà Liền, Hòa Mỹ, Tây Hòa',
        guide: 'Xếp hành lý chặt tay chân bảo toàn đồ đạc'
      },
      {
        id: 'py-t4-7',
        name: '🍜 Thưởng thức tô phở dặm lòng trước giờ bến nỏ',
        time: '15:30 - 16:00',
        description: 'Làm ấm lòng tột bực với tô phở đầy đặn dẻo dai hoặc món Bánh hỏi bánh tráng chấm Hòa Đa nức danh nồng nàn.',
        lat: 13.0185,
        lng: 109.1235,
        type: 'food',
        address: 'Tiệm phở gần nhà Liền hoặc điểm bánh hỏi Hòa Đa QL1A',
        guide: 'Bữa ăn mộc mạc kết thúc lịch trình đáng yêu'
      },
      {
        id: 'py-t4-8',
        name: '🚐 Lên xe trung chuyển TAXI HOA về bến xe Tuy Hòa',
        time: '16:00',
        description: 'Xe TAXI HOA ghé đón đoàn thẳng tiến ra ga bến xe Nam Tuy Hòa.',
        lat: 13.0185,
        lng: 109.1235,
        type: 'travel',
        address: 'Từ nhà Liền ra bến xe Nam Tuy Hòa',
        guide: 'Xe 4 giờ chiều khởi hành đúng giờ siêu tốc'
      },
      {
        id: 'py-t4-9',
        name: '🚐 Xe lăn bánh rời xứ "Hoa Vàng Cỏ Xanh" thân thương',
        time: '16:30 - 17:00',
        description: 'Nhận vị trí gối nằm Phương Trang, vẫy tay chào tạm biệt mảnh đất võ êm đềm ấm nồng tình cảm hữu ái.',
        lat: 13.0645,
        lng: 109.3039,
        type: 'travel',
        address: 'Bến xe Nam Tuy Hòa, Phú Yên',
        guide: 'Cáo biệt đất biển thân thương Phượng Trang về Bến xe Miền Đông Mới'
      },
      {
        id: 'py-t4-10',
        name: '🏁 Xe cập bến Sài Gòn - Chúc mừng chuyến đi mỹ mãn!',
        time: '23:00 - 00:00',
        description: 'Xe cập bến xe Miền Đông Mới phồn hoa cực kỳ nhanh gọn. Kết thúc chuyến phiêu lưu tuyệt vời lẫy lừng!',
        lat: 10.8812,
        lng: 106.8085,
        type: 'travel',
        address: 'Bến xe Miền Đông Mới, TP.HCM',
        suggestions: ['Chú ý đặt Grab sớm về nhà kẻo tắc', 'Gửi lời cảm ơn chân thành tới gia đình và đồng đội!']
      }
    ]
  }
];

export const TRIP_ITINERARIES: Record<string, DayPlan[]> = {
  'phu-yen-2026': ITINERARY,
  'da-lat-2026': DALAT_ITINERARY,
  'vung-tau-2026': VUNGTAU_ITINERARY
};
