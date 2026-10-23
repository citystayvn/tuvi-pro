/**
 * CƠ SỞ DỮ LIỆU LUẬN GIẢI – phụ tinh (Lục cát, Lục sát, Tứ Hóa, Lộc Tồn – Thiên Mã, các sao nhỏ).
 * Cùng cấu trúc với vòng Thái Tuế / Bác Sĩ. Diễn giải theo truyền thống, mang tính tham khảo.
 * Chỉ áp dụng cho sao NGUYÊN CỤC.
 *
 * Lục sát tinh có ý nghĩa riêng khi Đắc / Hãm – chỉ dùng khi bảng Miếu Hãm đang dùng có quy định.
 * Thiên Sứ luôn ở Tật Ách, Thiên Thương luôn ở Nô Bộc: chỉ có câu luận cho cung đó.
 */
import { PALACE_ORDER, type ComboRule, type PalaceName } from "./cycle-stars";

export interface AuxStarInterpretation {
  id: string;
  name: string;
  group: string;
  core: string;
  positive: string;
  negative: string;
  palaces: Partial<Record<PalaceName, string>>;
  /** Ý nghĩa khi ở vị trí thuận lợi (Miếu / Vượng / Đắc) – chỉ với sao có bảng tra. */
  favorable?: string;
  /** Ý nghĩa khi ở vị trí bất lợi (Hãm). */
  unfavorable?: string;
  combos: ComboRule[];
}

const G = {
  CAT: "Lục cát tinh",
  SAT: "Lục sát tinh",
  HOA: "Tứ Hóa",
  LOC: "Lộc Tồn – Thiên Mã",
  PHU: "Phụ tinh",
} as const;

function full(lines: string[]): Record<PalaceName, string> {
  if (lines.length !== 12) throw new Error("Cần đúng 12 câu luận giải theo cung");
  return Object.fromEntries(PALACE_ORDER.map((n, i) => [n, lines[i]])) as Record<PalaceName, string>;
}

function star(id: string, name: string, group: string, core: string, positive: string, negative: string, lines: string[], extra: Partial<AuxStarInterpretation> = {}): AuxStarInterpretation {
  return { id, name, group, core, positive, negative, palaces: full(lines), combos: [], ...extra };
}


export const AUX_STAR_INTERPRETATIONS: AuxStarInterpretation[] = [
  // ======================= LỤC CÁT TINH =======================
  star("ta-phu", "Tả Phụ", G.CAT, "Trợ giúp, phò tá, hỗ trợ đắc lực cho chính tinh.", "Được người giúp, có tài tổ chức, sống độ lượng.", "Dễ phụ thuộc người khác, đôi khi thiếu chủ kiến.", [
    "Có tài phò tá, được nhiều người giúp đỡ, sống độ lượng.",
    "Cha mẹ hỗ trợ con nhiều, gia đình trên dưới thuận hòa.",
    "Gia tộc đùm bọc nhau; tinh thần luôn được nâng đỡ.",
    "Mua bán nhà đất có người giúp, dễ có thêm tài sản.",
    "Công việc có người cộng tác tốt, hợp vai trò phó, trợ lý.",
    "Bạn bè, cấp dưới tận tâm, giúp đỡ mình rất đắc lực.",
    "Ra ngoài dễ gặp người giúp, quan hệ xã hội rộng rãi.",
    "Khi ốm đau có người chăm sóc, nhờ vậy mau hồi phục.",
    "Tài chính có người hỗ trợ, dễ hùn hạp làm ăn chung.",
    "Con cái ngoan ngoãn, biết giúp đỡ cha mẹ việc nhà.",
    "Bạn đời đảm đang, biết hỗ trợ; nên giữ gìn sự chung thủy.",
    "Anh chị em đông, đoàn kết, hay giúp đỡ lẫn nhau.",
  ], { combos: [{ with: ["huu-bat"], scope: "tam-phuong", tone: "good", text: "Gặp Hữu Bật: Tả Hữu hội đủ, được nhiều người phò trợ." }] }),
  star("huu-bat", "Hữu Bật", G.CAT, "Phò tá, quý nhân giúp đỡ, tính tình hòa nhã.", "Độ lượng, khéo léo, được người khác giúp đỡ.", "Dễ dựa dẫm, đôi lúc thiếu quyết đoán.", [
    "Hòa nhã, độ lượng, có quý nhân âm thầm giúp đỡ.",
    "Cha mẹ hiền hòa, luôn quan tâm và nâng đỡ con cái.",
    "Phúc phần tốt, được họ hàng giúp đỡ khi gặp khó khăn.",
    "Nhà cửa êm ấm, dễ được giúp khi tạo dựng tài sản.",
    "Làm việc hợp tác tốt, có người hậu thuẫn ở phía sau.",
    "Có cộng sự đáng tin cậy, cấp dưới trung thành, tận tụy.",
    "Đi xa gặp người tốt, thường được đón tiếp nồng hậu.",
    "Có người chăm sóc chu đáo khi sức khỏe bị giảm sút.",
    "Tiền bạc có nguồn hỗ trợ, làm ăn gặp đối tác tốt.",
    "Con cái hiền hòa, biết đỡ đần cha mẹ việc trong nhà.",
    "Bạn đời hiền lành, khéo léo; nên vun đắp tình cảm chung thủy.",
    "Anh chị em hòa thuận, sẵn lòng giúp nhau lúc khó khăn.",
  ], { combos: [{ with: ["ta-phu"], scope: "tam-phuong", tone: "good", text: "Gặp Tả Phụ: Tả Hữu hội đủ, được nhiều người phò trợ." }] }),
  star("van-xuong", "Văn Xương", G.CAT, "Học vấn, văn chương, khoa cử, lễ nghi.", "Thông minh, học giỏi, ăn nói có văn hoa.", "Dễ thiên về lý thuyết, đa sầu đa cảm.", [
    "Thông minh, ham học, có khiếu văn chương, cư xử lịch sự.",
    "Cha mẹ có học thức, rất coi trọng việc học của con.",
    "Gia tộc có truyền thống khoa bảng; tinh thần thanh nhã.",
    "Nhà cửa ngăn nắp, có góc học tập; giấy tờ nhà rõ ràng.",
    "Lợi thi cử, hợp nghề giáo dục, văn hóa, hành chính.",
    "Bạn bè có học, thường giao du với người trí thức.",
    "Ra ngoài được kính trọng nhờ học thức và sự lịch thiệp.",
    "Dễ căng thẳng thần kinh do học hành, làm việc trí óc nhiều.",
    "Kiếm tiền bằng chữ nghĩa, bằng cấp và chuyên môn.",
    "Con cái thông minh, sáng dạ, học hành giỏi giang.",
    "Bạn đời có học, nho nhã; tình cảm thường lãng mạn.",
    "Anh chị em học giỏi, hay giúp nhau trong việc học.",
  ], { combos: [{ with: ["van-khuc"], scope: "tam-phuong", tone: "good", text: "Gặp Văn Khúc: Xương Khúc hội, lợi học vấn, văn chương, thi cử." }] }),
  star("van-khuc", "Văn Khúc", G.CAT, "Tài nghệ, ăn nói, âm nhạc, nghệ thuật.", "Khéo léo, đa tài, có duyên khi trình bày.", "Dễ lãng mạn, đôi khi thiếu thực tế.", [
    "Đa tài, khéo ăn nói, yêu nghệ thuật, có duyên với mọi người.",
    "Cha mẹ có năng khiếu, khéo léo, dạy con lời hay ý đẹp.",
    "Gia tộc có người làm nghệ thuật; tinh thần phong phú.",
    "Nhà cửa trang trí đẹp, thể hiện gu thẩm mỹ của chủ nhà.",
    "Hợp nghề nghệ thuật, truyền thông, thuyết trình, giảng dạy.",
    "Bạn bè vui vẻ, trong đó nhiều người có tài nghệ.",
    "Ra ngoài giao tiếp khéo, được nhiều người mến mộ.",
    "Dễ mệt vì suy nghĩ và cảm xúc; nên giữ tâm lý cân bằng.",
    "Kiếm tiền nhờ tài năng, sự khéo léo và kỹ năng mềm.",
    "Con cái có năng khiếu nghệ thuật, nhất là âm nhạc.",
    "Bạn đời tài hoa, khéo nói; tình cảm nhiều lãng mạn.",
    "Anh chị em khéo léo, mỗi người có một tài riêng.",
  ], { combos: [{ with: ["van-xuong"], scope: "tam-phuong", tone: "good", text: "Gặp Văn Xương: Xương Khúc hội, lợi học vấn, văn chương, thi cử." }] }),
  star("thien-khoi", "Thiên Khôi", G.CAT, "Quý nhân dương, được bậc trên nâng đỡ.", "Gặp người tốt giúp, nhiều cơ hội thăng tiến.", "Dễ ỷ lại vào sự giúp đỡ của người khác.", [
    "Có quý nhân nâng đỡ, tư chất nổi trội, dễ đứng đầu tập thể.",
    "Cha mẹ có địa vị hoặc được nhiều người trọng vọng.",
    "Gia tộc có người hiển đạt; tinh thần tự tin, vững vàng.",
    "Nhà cửa được người giúp tạo dựng, thường ở nơi tốt.",
    "Được cấp trên nâng đỡ, lợi thi cử và thăng chức.",
    "Kết giao với người có vị thế và được họ giúp đỡ.",
    "Ra ngoài gặp quý nhân, thường được người khác ưu đãi.",
    "Khi đau yếu gặp thầy giỏi, được giúp đỡ kịp thời.",
    "Tiền bạc có quý nhân chỉ lối, gặp nhiều cơ hội tốt.",
    "Con cái thông minh, có khả năng thành đạt về sau.",
    "Bạn đời có tài, có vị thế, giúp mình tiến lên.",
    "Anh chị em có người thành đạt, hay giúp đỡ nhau.",
  ], { combos: [{ with: ["thien-viet"], scope: "tam-phuong", tone: "good", text: "Gặp Thiên Việt: Khôi Việt hội, quý nhân phù trợ rõ rệt." }] }),
  star("thien-viet", "Thiên Việt", G.CAT, "Quý nhân âm, giúp đỡ một cách kín đáo.", "Gặp cơ hội bất ngờ, có người âm thầm giúp.", "Dễ trông chờ vào may mắn bất ngờ.", [
    "Thông minh, có quý nhân âm thầm giúp, hay gặp may bất ngờ.",
    "Cha mẹ âm thầm lo lắng, hỗ trợ con cái từ xa.",
    "Được phúc ấm tổ tiên che chở một cách kín đáo.",
    "Có cơ hội bất ngờ về nhà đất, được người mách nước.",
    "Gặp cơ hội đột xuất trong công việc, có người tiến cử.",
    "Có bạn bè tốt ở hậu trường, giúp đỡ một cách thầm lặng.",
    "Đi xa gặp người lạ giúp, có duyên với những nơi xa.",
    "Khi có bệnh thường được người giúp tìm cách chữa trị.",
    "Tài lộc đến bất ngờ, có người chỉ dẫn cách kiếm tiền.",
    "Con cái có duyên, được nhiều người thương mến.",
    "Bạn đời tinh tế, hiểu ý, hay giúp đỡ một cách kín đáo.",
    "Anh chị em quan tâm nhau, giúp đỡ không phô trương.",
  ], { combos: [{ with: ["thien-khoi"], scope: "tam-phuong", tone: "good", text: "Gặp Thiên Khôi: Khôi Việt hội, quý nhân phù trợ rõ rệt." }] }),

  // ======================= LỤC SÁT TINH =======================
  star("kinh-duong", "Kình Dương", G.SAT, "Cương mãnh, quyết liệt, dễ gây xung đột.", "Dũng cảm, dám đối đầu, quyết đoán.", "Nóng nảy, gây va chạm, dễ bị tổn thương.", [
    "Cương quyết, mạnh mẽ, dám làm nhưng nóng tính, dễ va chạm.",
    "Dễ xung khắc với cha mẹ, cha mẹ có tính khí mạnh.",
    "Gia tộc có người cương trực; tinh thần hay bất an.",
    "Nhà đất dễ có tranh chấp, nên cẩn thận khi xây sửa.",
    "Công việc cạnh tranh gay gắt, hợp ngành quân sự, kỹ thuật.",
    "Bạn bè, cấp dưới dễ chống đối hoặc cạnh tranh với mình.",
    "Ra ngoài dễ gặp va chạm, nên tránh tranh cãi không cần thiết.",
    "Đề phòng thương tích do vật sắc nhọn hoặc phải phẫu thuật.",
    "Kiếm tiền vất vả, nhiều cạnh tranh; dễ tranh chấp tài chính.",
    "Con cái cá tính mạnh, khó bảo, cha mẹ cần mềm mỏng.",
    "Vợ chồng dễ xung khắc, cần biết nhường nhịn nhau.",
    "Anh chị em dễ bất hòa và cạnh tranh với nhau.",
  ], {
    favorable: "Đắc địa: uy dũng, dám làm, hợp võ nghiệp, kỹ thuật, kinh doanh cạnh tranh.",
    unfavorable: "Hãm địa: dễ va chạm, tai nạn kim khí, tính khí cô độc.",
    combos: [{ with: ["thien-hinh", "bach-ho"], scope: "dong-cung", tone: "bad", text: "Đồng cung Thiên Hình hoặc Bạch Hổ: nên đề phòng thương tích, kiện tụng." }],
  }),
  star("da-la", "Đà La", G.SAT, "Trì trệ, dây dưa, ngấm ngầm cản trở.", "Bền bỉ, nhẫn nại, làm việc chắc chắn.", "Chậm trễ, vướng mắc, hay bị cản trở.", [
    "Nhẫn nại, bền bỉ nhưng chậm chạp, công việc hay dây dưa.",
    "Quan hệ với cha mẹ có điều khó nói, âm thầm bất đồng.",
    "Gia tộc có chuyện rắc rối kéo dài; tinh thần nặng nề.",
    "Mua bán nhà đất chậm, thủ tục thường bị kéo dài.",
    "Công việc tiến triển chậm, hay vướng phải cản trở ngầm.",
    "Bạn bè, cấp dưới dễ gây phiền phức một cách âm thầm.",
    "Ra ngoài hay bị chậm trễ, công việc dễ bị kẹt lại.",
    "Bệnh dễ dai dẳng, nên chú ý răng miệng và xương khớp.",
    "Tiền bạc thu về chậm, hay bị người khác nợ đọng.",
    "Con cái phát triển chậm một chút, cha mẹ cần kiên nhẫn dạy.",
    "Tình cảm vợ chồng có lúc lạnh nhạt, khó bày tỏ cảm xúc.",
    "Anh chị em ít gần gũi, hay có hiềm khích ngầm.",
  ], {
    favorable: "Đắc địa: bền bỉ, kiên trì, làm việc thâm trầm và chắc chắn.",
    unfavorable: "Hãm địa: công việc dây dưa, dễ bị ngấm ngầm cản trở.",
  }),
  star("dia-khong", "Địa Không", G.SAT, "Hư không, mất mát, ý tưởng khác thường.", "Sáng tạo, tư duy độc đáo, dám nghĩ lớn.", "Hao tán, thất bại bất ngờ, hay mơ mộng.", [
    "Tư duy khác người, sáng tạo nhưng dễ mơ mộng, đời nhiều thăng trầm.",
    "Ít được nhờ cha mẹ, hoặc sớm phải xa cách cha mẹ.",
    "Phúc phần mỏng; tinh thần hướng về tâm linh, triết lý.",
    "Nhà đất dễ hao hụt, nên thận trọng khi đầu tư bất động sản.",
    "Công việc thăng trầm bất ngờ, hợp các nghề sáng tạo.",
    "Bạn bè ít giúp được gì, dễ thất vọng vì người khác.",
    "Ra ngoài dễ mất đồ, kế hoạch hay phải thay đổi.",
    "Sức khỏe dễ suy giảm đột ngột, nên khám định kỳ.",
    "Tiền bạc khó giữ, dễ mất trắng nếu đầu cơ mạo hiểm.",
    "Hay lo nghĩ về con cái; con có lối tư duy độc lạ.",
    "Tình cảm dễ hụt hẫng, cần thực tế trong hôn nhân.",
    "Anh chị em ít, hoặc ít nhờ cậy được nhau.",
  ], {
    favorable: "Đắc địa: sáng tạo, có thể phát nhanh nhờ ý tưởng táo bạo.",
    unfavorable: "Hãm địa: hao tán, mất mát, kế hoạch dễ đổ vỡ.",
    combos: [{ with: ["dia-kiep"], scope: "tam-phuong", tone: "bad", text: "Gặp Địa Kiếp: Không Kiếp hội, thăng trầm và hao tán rõ hơn." }],
  }),
  star("dia-kiep", "Địa Kiếp", G.SAT, "Tai họa bất ngờ, hao tài, tính táo bạo.", "Gan dạ, dám mạo hiểm, chịu được thử thách.", "Hao tài, phá sản, biến cố đột ngột.", [
    "Gan dạ, dám mạo hiểm nhưng cuộc đời nhiều biến cố.",
    "Cha mẹ vất vả, gia cảnh có lúc bị sa sút.",
    "Gia tộc từng gặp biến cố; nên tu tâm tích đức.",
    "Nhà đất dễ biến động lớn, cần đề phòng mất mát.",
    "Công việc lên xuống thất thường, có lúc làm liều.",
    "Cần đề phòng bạn bè, cấp dưới gây thiệt hại cho mình.",
    "Ra ngoài nên cẩn trọng, tránh mạo hiểm không cần thiết.",
    "Đề phòng bệnh phát đột ngột và tai nạn bất ngờ.",
    "Tiền vào nhanh ra nhanh, dễ phá sản nếu quá liều lĩnh.",
    "Con cái lúc nhỏ khó nuôi, cha mẹ cần chăm sóc kỹ.",
    "Hôn nhân dễ trắc trở, có thể gặp biến cố bất ngờ.",
    "Anh chị em gặp nhiều khó khăn, ít hỗ trợ được nhau.",
  ], {
    favorable: "Đắc địa: gan dạ, dám làm lớn, có thể phát đạt đột ngột.",
    unfavorable: "Hãm địa: biến cố bất ngờ, hao tài, dễ trắng tay.",
    combos: [{ with: ["dia-khong"], scope: "tam-phuong", tone: "bad", text: "Gặp Địa Không: Không Kiếp hội, thăng trầm và hao tán rõ hơn." }],
  }),
  star("hoa-tinh", "Hỏa Tinh", G.SAT, "Nóng nảy, bộc phát, mạnh mẽ.", "Nhiệt huyết, hành động nhanh, quyết liệt.", "Bốc đồng, dễ xung đột, gặp tai họa bất ngờ.", [
    "Nhiệt huyết, hành động nhanh nhưng nóng tính, hay bốc đồng.",
    "Dễ nóng giận với cha mẹ, cần nhẫn nhịn nhiều hơn.",
    "Gia tộc có người tính khí nóng; tinh thần dễ bứt rứt.",
    "Nhà cửa cần đề phòng hỏa hoạn, chập điện, cháy nổ.",
    "Làm việc hăng hái, nhanh nhạy nhưng dễ mâu thuẫn với người khác.",
    "Bạn bè nóng tính, dễ cãi nhau vì những chuyện nhỏ.",
    "Ra ngoài tránh nóng giận, đề phòng va chạm giao thông.",
    "Dễ bị sốt, viêm nhiễm, bỏng; nên giữ thân nhiệt điều hòa.",
    "Tiền đến nhanh đi nhanh, hay chi tiêu theo cảm hứng.",
    "Con cái hiếu động, nóng nảy, cần dạy cách kiềm chế.",
    "Vợ chồng dễ cãi vã khi nóng giận, nên giữ bình tĩnh.",
    "Anh chị em nóng tính, dễ tranh cãi gay gắt với nhau.",
  ], {
    favorable: "Đắc địa: nhiệt huyết, can đảm, làm nên việc lớn nhanh chóng.",
    unfavorable: "Hãm địa: nóng nảy, dễ gặp tai họa, đề phòng hỏa hoạn.",
    combos: [{ with: ["tham-lang"], scope: "dong-cung", tone: "good", text: "Đồng cung Tham Lang (Hỏa Tham): theo truyền thống chủ phát đạt nhanh, bất ngờ." }],
  }),
  star("linh-tinh", "Linh Tinh", G.SAT, "Âm thầm, u uất, tai họa ngấm ngầm.", "Kiên trì, sâu sắc, có mưu lược.", "Hay u sầu, dễ gặp trở ngại ngầm.", [
    "Sâu sắc, có mưu lược nhưng hay u uất, khó cởi mở lòng mình.",
    "Quan hệ với cha mẹ có khoảng cách, ít khi tâm sự.",
    "Tinh thần hay nặng nề, lo âu không rõ nguyên do.",
    "Nhà cửa đề phòng hư hỏng ngầm, nhất là điện và nước.",
    "Công việc gặp trở ngại khó thấy trước, cần kiên trì vượt qua.",
    "Bạn bè khó đoán, nên đề phòng ganh ghét ngầm.",
    "Ra ngoài dễ gặp chuyện không vui một cách bất ngờ.",
    "Dễ suy nhược thần kinh, mất ngủ hoặc bệnh âm ỉ.",
    "Tiền bạc dễ hao hụt dần mà bản thân không hay biết.",
    "Con cái sống nội tâm, cần được quan tâm về cảm xúc.",
    "Tình cảm có nỗi buồn khó nói, vợ chồng cần chia sẻ.",
    "Anh chị em ít hòa hợp, dễ có hiềm khích với nhau.",
  ], {
    favorable: "Đắc địa: mưu lược, kiên nhẫn, làm việc lớn một cách âm thầm.",
    unfavorable: "Hãm địa: u uất, tai họa ngấm ngầm, dễ bị người hãm hại.",
    combos: [{ with: ["tham-lang"], scope: "dong-cung", tone: "good", text: "Đồng cung Tham Lang (Linh Tham): theo truyền thống chủ phát đạt về sau." }],
  }),

  // ======================= TỨ HÓA =======================
  star("hoa-loc", "Hóa Lộc", G.HOA, "Tài lộc, phúc khí, mọi việc hanh thông.", "Thuận lợi, dễ kiếm tiền, được người ưu ái.", "Dễ ham hưởng thụ, đôi khi tham lợi.", [
    "Có lộc, tính hòa nhã, dễ được ưu ái và gặp nhiều thuận lợi.",
    "Cha mẹ khá giả, con được nhờ cậy về mặt vật chất.",
    "Phúc lộc dồi dào, gia tộc sung túc, đời sống đầy đủ.",
    "Dễ tạo dựng và tích lũy nhà cửa, đất đai.",
    "Công việc sinh lời, dễ được thưởng hoặc tăng thu nhập.",
    "Bạn bè mang lại lợi ích, các mối quan hệ đều có lộc.",
    "Ra ngoài gặp nhiều cơ hội kiếm tiền, buôn bán thuận.",
    "Có lộc giảm bệnh; nên chú ý không ăn uống quá độ.",
    "Tiền bạc hanh thông, nguồn thu ổn định và dồi dào.",
    "Con cái có phúc, sau này giúp được cha mẹ nhiều.",
    "Bạn đời mang lại tài lộc, hôn nhân sung túc.",
    "Anh chị em khá giả, có thể hỗ trợ nhau tài chính.",
  ], { combos: [{ with: ["loc-ton"], scope: "tam-phuong", tone: "good", text: "Gặp Lộc Tồn: Song Lộc, tài lộc dồi dào hơn." }] }),
  star("hoa-quyen", "Hóa Quyền", G.HOA, "Quyền lực, uy thế, khả năng nắm giữ.", "Có năng lực, tự tin, được người nể phục.", "Dễ độc đoán, thích kiểm soát người khác.", [
    "Tự tin, có năng lực, thích nắm quyền chủ động trong mọi việc.",
    "Cha mẹ có uy, nghiêm khắc, ảnh hưởng lớn đến con cái.",
    "Gia tộc có người quyền thế; tinh thần mạnh mẽ, tự chủ.",
    "Có quyền quyết định về nhà đất, quyền sở hữu rõ ràng.",
    "Dễ nắm quyền quản lý, có tiếng nói trong công việc.",
    "Được bạn bè, cấp dưới nể phục và nghe theo.",
    "Ra ngoài có uy tín, dễ được giao trọng trách quan trọng.",
    "Sức chịu đựng tốt; tránh làm việc quá sức vì hiếu thắng.",
    "Chủ động trong tài chính, giỏi điều hành tiền bạc.",
    "Con cái có cá tính, có năng lực tự lập từ sớm.",
    "Bạn đời có năng lực, dễ tranh giành quyền quyết định.",
    "Anh chị em có người giỏi giang nhưng hay áp đặt.",
  ]),
  star("hoa-khoa", "Hóa Khoa", G.HOA, "Danh tiếng, học vấn, quý nhân, giải trừ tai ách.", "Có tiếng tốt, học giỏi, gặp dữ hóa lành.", "Dễ coi trọng danh tiếng hơn thực chất.", [
    "Thông minh, có danh tiếng tốt, gặp nạn dễ được hóa giải.",
    "Cha mẹ có học, được xã hội kính trọng.",
    "Gia tộc có danh giá; tinh thần thanh cao, nề nếp.",
    "Nhà cửa có tiếng, giấy tờ nhà đất thuận lợi, rõ ràng.",
    "Lợi thi cử, bằng cấp, có danh tiếng trong nghề nghiệp.",
    "Giao du với người có danh tiếng và học thức.",
    "Ra ngoài được nhiều người biết đến, có uy tín.",
    "Gặp thầy thuốc giỏi, bệnh tật dễ được chữa khỏi.",
    "Kiếm tiền nhờ danh tiếng, uy tín và chuyên môn.",
    "Con cái học giỏi, thành đạt về đường khoa bảng.",
    "Bạn đời có học, danh giá, vợ chồng tôn trọng nhau.",
    "Anh chị em học hành tốt, có tiếng tăm trong xã hội.",
  ]),
  star("hoa-ky", "Hóa Kỵ", G.HOA, "Trở ngại, ganh ghét, thị phi, vướng mắc.", "Biết thận trọng, có ý chí cố gắng vượt khó.", "Hay gặp cản trở, hiểu lầm và thị phi.", [
    "Hay gặp trở ngại, thị phi; cần kiên trì và thận trọng.",
    "Dễ hiểu lầm với cha mẹ, cha mẹ có nhiều nỗi lo.",
    "Tinh thần hay vướng bận, gia tộc có điều phiền muộn.",
    "Nhà đất dễ vướng mắc, tranh chấp, giấy tờ rắc rối.",
    "Công việc gặp cản trở, dễ bị người khác ganh ghét.",
    "Bạn bè dễ phản bội hoặc hiểu lầm, nên chọn người mà chơi.",
    "Ra ngoài dễ gặp thị phi, mọi việc không được như ý.",
    "Đề phòng bệnh kéo dài, nên khám và chữa trị sớm.",
    "Tiền bạc hay bị kẹt, thất thoát hoặc vướng nợ nần.",
    "Hay lo lắng về con cái, con có phần khó dạy bảo.",
    "Vợ chồng dễ hiểu lầm, ghen tuông, cần tin tưởng nhau.",
    "Anh chị em dễ bất hòa, tranh chấp quyền lợi.",
  ], {
    combos: [{ with: ["thanh-long"], scope: "dong-cung", tone: "mixed", text: "Đồng cung Thanh Long: theo truyền thống, phần xấu của Kỵ được giảm bớt." }],
  }),

  // ======================= LỘC TỒN – THIÊN MÃ =======================
  star("loc-ton", "Lộc Tồn", G.LOC, "Tài lộc, tích lũy, tính bảo thủ.", "Giữ của tốt, có phúc lộc bền vững.", "Dễ keo kiệt, bảo thủ, sống cô độc.", [
    "Cẩn trọng, biết tích lũy, có lộc bền nhưng tính hơi bảo thủ.",
    "Cha mẹ có của ăn của để, có thể để lại tài sản.",
    "Phúc lộc bền vững, được hưởng di sản của tổ tiên.",
    "Có nhà đất, tài sản tích lũy chắc chắn, lâu dài.",
    "Công việc ổn định, thu nhập đều, hợp tài chính, kế toán.",
    "Ít bạn nhưng bạn đáng tin, quan hệ được giữ gìn lâu.",
    "Ra ngoài kiếm được lộc, nhưng việc đi lại khá vất vả.",
    "Sức khỏe ổn định, nên chú ý hệ tiêu hóa.",
    "Tiền bạc tích lũy tốt, rất giỏi giữ của.",
    "Con cái ít nhưng ngoan ngoãn, có phúc phần.",
    "Bạn đời biết vun vén, hôn nhân bền vững.",
    "Anh chị em ít, mỗi người tự lo cho cuộc sống riêng.",
  ], { combos: [{ with: ["thien-ma"], scope: "tam-phuong", tone: "good", text: "Gặp Thiên Mã: Lộc Mã giao trì, đi xa làm ăn có lộc." }] }),
  star("thien-ma", "Thiên Mã", G.LOC, "Di chuyển, biến động, năng động.", "Nhanh nhẹn, hợp đi xa, có nhiều cơ hội.", "Bôn ba, khó ổn định ở một chỗ.", [
    "Năng động, thích đi lại, hợp làm ăn ở những nơi xa.",
    "Cha mẹ hay đi xa, hoặc con cái sớm rời nhà lập nghiệp.",
    "Gia tộc tản mát nhiều nơi; tinh thần thích tự do.",
    "Hay chuyển nhà, có thể có nhà ở nhiều nơi khác nhau.",
    "Công việc liên quan đến đi lại, vận tải, thương mại.",
    "Bạn bè ở nhiều nơi, quan hệ xã hội rộng khắp.",
    "Đi xa thuận lợi, ra ngoài làm ăn dễ phát đạt.",
    "Dễ mệt mỏi vì đi lại nhiều, nên chú ý chân tay.",
    "Kiếm tiền nhờ di chuyển, buôn bán ở những nơi xa.",
    "Con cái lớn lên thường đi xa, lập nghiệp nơi khác.",
    "Bạn đời năng động, có thể quen nhau khi đi xa.",
    "Anh chị em mỗi người một nơi, ít khi gặp nhau.",
  ], { combos: [{ with: ["loc-ton", "hoa-loc"], scope: "tam-phuong", tone: "good", text: "Gặp Lộc Tồn hoặc Hóa Lộc: Lộc Mã giao trì, đi xa làm ăn có lộc." }] }),
];
