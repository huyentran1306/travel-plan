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

export const ITINERARY: DayPlan[] = [
  {
    day: 1,
    date: '18/06/2026 (Thứ 5)',
    title: 'Khởi hành hành trình Phú Yên',
    locations: [
      {
        id: 'py-t1-1',
        name: 'Xe xuất phát từ bến miền đông mới',
        time: '20:00',
        description: 'Bắt đầu chuyến đi Phú Yên xinh đẹp từ Sài Gòn trên chuyến xe giường nằm êm ái.',
        lat: 10.8812,
        lng: 106.8085,
        type: 'travel',
        address: 'Bến xe miền Đông mới, TP.HCM',
        guide: 'Lên xe khách Phương Trang, báo tới bến xe Phú Lâm',
        suggestions: ['Gối cổ ngủ ngon', 'Chuẩn bị đồ dùng cá nhân nhẹ']
      }
    ]
  },
  {
    day: 2,
    date: '19/06/2026 (Thứ 6)',
    title: 'Hướng ra Hòn Yến (Tuy An)',
    locations: [
      {
        id: 'py-t2-1',
        name: 'Tới bến xe Nam Tuy Hòa',
        time: '06:00',
        description: 'Đặt chân tới mảnh đất Phú Yên đầy nắng và gió đón bình minh sớm.',
        lat: 13.0645,
        lng: 109.3039,
        type: 'travel',
        address: '507 Nguyễn Văn Linh, Phú Lâm, TP. Tuy Hòa',
        guide: 'Xuống xe hỏi anh mặc áo xanh Phương Trang về xe trung chuyển TÂY HÒA',
        suggestions: ['Giữ ấm cổ khi xuống xe', 'Kiểm tra kỹ đầy đủ hành lý cá nhân']
      },
      {
        id: 'py-t2-2',
        name: 'Lên xe trung chuyển',
        time: '06:15',
        description: 'Trung chuyển đưa đoàn đi sâu vào vùng quê Tây Hòa mộc mạc.',
        lat: 13.0645,
        lng: 109.3039,
        type: 'travel',
        address: 'Bến xe Nam Tuy Hòa',
        guide: 'Nói đến "cây xăng Phú Thuận - Hòa Mỹ"',
        suggestions: ['Gọi trước cho gia đình Liền biết']
      },
      {
        id: 'py-t2-3',
        name: 'Tới nhà',
        time: '07:15',
        description: 'Về tới nhà Liền ấm cúng, chuẩn bị bắt đầu một ngày bùng nổ.',
        lat: 13.0185,
        lng: 109.1235,
        type: 'rest',
        address: 'Huyện Tây Hòa',
        guide: 'Vệ sinh cá nhân + ăn sáng',
        suggestions: ['Ăn tô bún nóng ấm bụng']
      },
      {
        id: 'py-t2-4',
        name: 'Khởi hành đi chơi',
        time: '09:00',
        description: 'Chuẩn bị xe cộ chỉnh chu, đổ đầy xăng và khởi hành lịch trình Tuy An.',
        lat: 13.0185,
        lng: 109.1235,
        type: 'travel',
        suggestions: ['Sạc đầy pin điện thoại', 'Bôi kem chống nắng kĩ']
      },
      {
        id: 'py-t2-5',
        name: 'Di chuyển ra Hòn Yến',
        time: '15:00',
        description: 'Hòn đảo kỳ vĩ với rặng san hô lộ thiên khi nước rút và cảnh sắc yên bình cực độ.',
        lat: 13.2263,
        lng: 109.3039,
        type: 'activity',
        address: 'Xã An Hòa Hải, huyện Tuy An, cách Tuy Hòa 20km',
        guide: 'Có thể thuê thuyền hoặc đi bộ khi thủy triều rút (nước đến đầu gối)',
        suggestions: ['Mang dép rọ tránh san hô sắc nhọn', 'Canh giờ thủy triều xuống tuyệt đẹp']
      },
      {
        id: 'py-t2-6',
        name: 'Bắt đầu quay về Tuy Hòa',
        time: '17:30',
        description: 'Di chuyển thong thả về lại trung tâm thành phố Tuy Hòa ngắm cảnh chiều tà.',
        lat: 13.0985,
        lng: 109.3248,
        type: 'travel',
        guide: 'Chuẩn bị ăn tối'
      },
      {
        id: 'py-t2-7',
        name: 'Ăn tối',
        time: '18:15',
        description: 'Bữa tối thịnh soạn với tất cả những đặc sản đường phố ngon nhất vùng đất Hoa Vàng Cỏ Xanh.',
        lat: 13.0920,
        lng: 109.3115,
        type: 'food',
        address: 'Khu vực trung tâm Tuy Hòa',
        guide: 'Ăn ốc (74B Nguyễn Huệ, P.5) hoặc hải sản (301-303 Hùng Vương, P.7) hoặc bánh canh hẹ',
        suggestions: ['Ốc xiên que cực phẩm', 'Nước chấm siêu cay']
      },
      {
        id: 'py-t2-8',
        name: 'Dạo TP - Tháp Nghinh Phong',
        time: '20:00',
        description: 'Chiêm ngưỡng kiến trúc Tháp Nghinh Phong lộng lẫy buổi tối với hệ thống đèn nghệ thuật chiếu LED rực rỡ.',
        lat: 13.1092,
        lng: 109.3240,
        type: 'activity',
        address: 'Quảng trường Nghinh Phong, giao Nguyễn Hữu Thọ và Độc Lập',
        guide: 'Miễn phí, mở cửa tự do. Ăn chè/xiên nướng gần đó',
        suggestions: ['Đón gió biển thổi lồng lộng', 'Ăn xiên nướng nóng nổi ngay quảng trường']
      },
      {
        id: 'py-t2-9',
        name: 'Đi về nhà',
        time: '21:30',
        description: 'Trở về nhà Liền nghỉ ngơi ấm áp sau một ngày trải nghiệm tuyệt vời.',
        lat: 13.0185,
        lng: 109.1235,
        type: 'rest',
        suggestions: ['Ngủ thật ngon chuẩn bị cho Vũng Rô ngày mai']
      }
    ]
  },
  {
    day: 3,
    date: '20/06/2026 (Thứ 7)',
    title: 'Hướng vào Vũng Rô hùng vĩ',
    locations: [
      {
        id: 'py-t3-1',
        name: 'Dậy và vệ sinh cá nhân',
        time: '06:00',
        description: 'Thức dậy cùng thiên nhiên hiền hòa Tây Hòa ấm áp.',
        lat: 13.0185,
        lng: 109.1235,
        type: 'rest'
      },
      {
        id: 'py-t3-2',
        name: 'Đi chợ ăn sáng',
        time: '06:30',
        description: 'Dạo quanh các sạp đồ ăn buổi sáng nóng hổi, hớp một ngụm trà nóng.',
        lat: 13.0160,
        lng: 109.1210,
        type: 'food',
        address: 'Chợ địa phương',
        guide: 'Nếu dậy trễ thì nhờ má mua đồ ăn',
        suggestions: ['Bánh hỏi heo quay', 'Trà đá mát lạnh']
      },
      {
        id: 'py-t3-3',
        name: 'Đi hướng vào Vũng Rô',
        time: '08:00',
        description: 'Cùng đoàn cưỡi xe máy trải nghiệm cung đường biển mộng mơ uốn lượn hướng về Vịnh Vũng Rô mang dấu ấn lịch sử tàu Không Số.',
        lat: 12.8600,
        lng: 109.4150,
        type: 'travel',
        address: 'Xã Xuân Hòa Nam, huyện Đông Hòa, cách Tuy Hòa 30-35km',
        guide: 'Phí ca nô 25k/người, phí giữ xe 5k/ngày. Di tích lịch sử cấp quốc gia',
        suggestions: ['Giữ tốc độ an toàn khi ôm cua biển', 'Chụp góc đèo siêu rộng ngắm đảo']
      },
      {
        id: 'py-t3-4',
        name: 'Ăn trưa ở bè Vũng Rô',
        time: '12:00',
        description: 'Thưởng thức hải sản tươi rực nấu ngay trên bè biển vịnh kín gió lồng lộng.',
        lat: 12.8600,
        lng: 109.4150,
        type: 'food',
        address: 'Trong vịnh Vũng Rô',
        guide: 'Hải sản tươi sống',
        suggestions: ['Hỏi giá trước khi chọn món', 'Ăn canh chua cá bớp siêu cuốn']
      },
      {
        id: 'py-t3-5',
        name: 'Đi quán cafe ở Đèo Cả',
        time: '13:30',
        description: 'Nhâm nhi cafe ngắm cảnh núi non trùng trùng điệp điệp bao bọc đại dương xanh ngắt.',
        lat: 12.8530,
        lng: 109.3900,
        type: 'cafe',
        address: 'Phía Bắc Vũng Rô, trên đường đến Vũng Rô',
        guide: 'Ngắm cảnh núi non hùng vĩ',
        suggestions: ['Chọn view sườn đồi chụp hình cực thơ']
      },
      {
        id: 'py-t3-6',
        name: 'Tắm biển Bãi Tiên, Làng Lò',
        time: '15:30',
        description: 'Rơi thẳng xuống thiên đường cát trắng hoang dã bãi Tiên, thả lỏng cơ thể.',
        lat: 12.8943,
        lng: 109.4312,
        type: 'activity',
        address: 'Xã Hòa Tâm, thị xã Đông Hòa, cách Tuy Hòa 26-30km',
        guide: 'Bãi cát trắng mịn, nước nông trong xanh an toàn. Cung đường đẹp nhất Phú Yên',
        suggestions: ['Bơi xa nhớ chú ý dốc sụt', 'Ghé thăm làng chài mộc mạc']
      },
      {
        id: 'py-t3-7',
        name: 'Cafe view cầu Đà Rằng',
        time: '17:00',
        description: 'Ngả người tại quán uống nước thư giãn ngắm hoàng hôn đỏ ối tấp nập trên cầu nối hai miền quê Phú Yên.',
        lat: 13.0800,
        lng: 109.2900,
        type: 'cafe',
        address: 'Phường Phú Lâm, TP. Tuy Hòa, trên Quốc lộ 1',
        guide: 'Cầu dài 1.105m, 21 nhịp. Đẹp khi lên đèn vào buổi tối',
        suggestions: ['Chờ đèn cầu bật lên lung linh']
      },
      {
        id: 'py-t3-8',
        name: 'Đi về nhà',
        time: '21:30',
        description: 'Di chuyển an toàn về gia đình chuẩn bị kết thúc ngày thứ 3 đầy ắp kỷ niệm.',
        lat: 13.0185,
        lng: 109.1235,
        type: 'rest'
      }
    ]
  },
  {
    day: 4,
    date: '21/06/2026 (Chủ nhật)',
    title: 'Đi suối mát miền Tây Hòa & Trở về',
    locations: [
      {
        id: 'py-t4-1',
        name: 'Dậy và vệ sinh cá nhân',
        time: '06:00',
        description: 'Vệ sinh tinh sương, đón gió suối thổi mát mẻ cực sảng khoái.',
        lat: 13.0185,
        lng: 109.1235,
        type: 'rest'
      },
      {
        id: 'py-t4-2',
        name: 'Đi chợ ăn sáng + mua đồ đi suối',
        time: '06:30',
        description: 'Chuẩn bị dã ngoại hoàn chỉnh, mua thêm hoa quả, đồ xiên lụi nướng cho buổi dã ngoại suối tự nhiên.',
        lat: 13.0160,
        lng: 109.1210,
        type: 'food',
        suggestions: ['Chuẩn bị túi rác màng bọc bảo vệ môi trường']
      },
      {
        id: 'py-t4-3',
        name: 'Chuẩn bị đi suối',
        time: '09:00',
        description: 'Bộ hành thẳng hướng rừng núi Tây Hòa tìm những con suối mướt xanh.',
        lat: 12.9130,
        lng: 109.0768,
        type: 'activity',
        suggestions: ['Ghi chú kiểm tra đồ bảo hộ dép rọ chống trơn trượt']
      },
      {
        id: 'py-t4-4',
        name: 'Tắm suối về',
        time: '14:00',
        description: 'Thỏa thích ngâm mình mát lạnh, quây quần nghe tiếng suối rì rào ca hát ngập tràn thư giãn.',
        lat: 12.9130,
        lng: 109.0768,
        type: 'activity'
      },
      {
        id: 'py-t4-5',
        name: 'Về nhà tắm rửa và soạn đồ lên xe',
        time: '15:00',
        description: 'Sắp xếp hết tất cả hành trang gọn ghẽ tuyệt đối.',
        lat: 13.0185,
        lng: 109.1235,
        type: 'rest',
        guide: 'Chuẩn bị hành lý về TP.HCM',
        suggestions: ['Mang quà đặc sản Phú Yên chia bạn bè']
      },
      {
        id: 'py-t4-6',
        name: 'Ăn cơm chiều',
        time: '17:15',
        description: 'Quây quần bữa cơm cuối cùng thân thương ấm áp ngập tràn lòng mến khách.',
        lat: 13.0185,
        lng: 109.1235,
        type: 'food',
        guide: 'Bữa ăn cuối trước khi lên xe'
      },
      {
        id: 'py-t4-7',
        name: 'Ra chỗ trung chuyển xe',
        time: '18:15',
        description: 'Đón xe trung chuyển khởi hành tạm biệt Phú Yên và những con người nồng ấm, thẳng hướng bến về Sài Gòn phồn hoa.',
        lat: 13.0185,
        lng: 109.1235,
        type: 'travel',
        address: 'Cây xăng Phú Thuận - Hòa Mỹ, Tây Hòa',
        guide: 'Xe về bến miền đông mới TP.HCM',
        suggestions: ['Mang mũ chống nắng nhẹ, chuẩn bị ngủ sâu giấc trên xe']
      }
    ]
  }
];
