"""
Sinh bộ dữ liệu đối chiếu chéo (cross-implementation differential fixtures) từ
thư viện mã nguồn mở lasotuvi (MIT, (c) 2016 doanguyen) – một triển khai Tử Vi
độc lập, viết bằng Python, theo hệ thống Thái Thứ Lang / Thiên Lương.

Đây KHÔNG phải "sự thật tuyệt đối": nó chỉ là một nguồn độc lập với engine của
chúng ta, giúp phát hiện lỗi cài đặt. Những điểm hai bên khác nhau do khác biệt
trường phái đã được ghi nhận trong src/config/rules/conflicts.ts và được bỏ qua
khi so sánh (xem src/tests/stars/cross-check.test.ts).

Cách dùng:
    git clone --depth 1 https://github.com/doanguyen/lasotuvi.git /tmp/lasotuvi
    python3 scripts/reference/generate_lasotuvi_fixtures.py /tmp/lasotuvi \
        > src/tests/fixtures/lasotuvi-cross-check.json
"""
import json
import random
import sys

sys.path.insert(0, sys.argv[1])

from lasotuvi.App import lapDiaBan  # noqa: E402
from lasotuvi.DiaBan import diaBan  # noqa: E402
from lasotuvi.AmDuong import ngayThangNam  # noqa: E402

# Tên sao lasotuvi -> id trong engine
NAME_TO_ID = {
    "Tử vi": "tu-vi", "Liêm trinh": "liem-trinh", "Thiên đồng": "thien-dong", "Vũ khúc": "vu-khuc",
    "Thái Dương": "thai-duong", "Thiên cơ": "thien-co", "Thiên phủ": "thien-phu", "Thái âm": "thai-am",
    "Tham lang": "tham-lang", "Cự môn": "cu-mon", "Thiên tướng": "thien-tuong", "Thiên lương": "thien-luong",
    "Thất sát": "that-sat", "Phá quân": "pha-quan",
    "Thái tuế": "thai-tue", "Thiếu dương": "thieu-duong", "Tang môn": "tang-mon", "Thiếu âm": "thieu-am",
    "Tử phù": "tu-phu", "Tuế phá": "tue-pha", "Long đức": "long-duc", "Bạch hổ": "bach-ho",
    "Phúc đức": "phuc-duc", "Điếu khách": "dieu-khach", "Trực phù": "truc-phu",
    "Lộc tồn": "loc-ton", "Bác sỹ": "bac-si", "Lực sĩ": "luc-si", "Thanh long": "thanh-long",
    "Tiểu hao": "tieu-hao", "Tướng quân": "tuong-quan", "Tấu thư": "tau-thu", "Phi liêm": "phi-liem",
    "Hỷ thần": "hy-than", "Bệnh phù": "benh-phu", "Đại hao": "dai-hao", "Phục binh": "phuc-binh",
    "Tràng sinh": "trang-sinh", "Mộc dục": "moc-duc", "Quan đới": "quan-doi", "Lâm quan": "lam-quan",
    "Đế vượng": "de-vuong", "Suy": "suy", "Bệnh": "benh", "Tử": "tu", "Mộ": "mo", "Tuyệt": "tuyet",
    "Thai": "thai", "Dưỡng": "duong",
    "Đà la": "da-la", "Kình dương": "kinh-duong", "Địa không": "dia-khong", "Địa kiếp": "dia-kiep",
    "Linh tinh": "linh-tinh", "Hỏa tinh": "hoa-tinh", "Văn xương": "van-xuong", "Văn Khúc": "van-khuc",
    "Thiên khôi": "thien-khoi", "Thiên việt": "thien-viet", "Tả phù": "ta-phu", "Hữu bật": "huu-bat",
    "Long trì": "long-tri", "Phượng các": "phuong-cac", "Tam thai": "tam-thai", "Bát tọa": "bat-toa",
    "Ân quang": "an-quang", "Thiên quý": "thien-quy", "Thiên khốc": "thien-khoc", "Thiên hư": "thien-hu",
    "Thiên đức": "thien-duc", "Nguyệt đức": "nguyet-duc", "Thiên hình": "thien-hinh", "Thiên riêu": "thien-rieu",
    "Thiên y": "thien-y", "Quốc ấn": "quoc-an", "Đường phù": "duong-phu", "Đào hoa": "dao-hoa",
    "Hồng loan": "hong-loan", "Thiên hỷ": "thien-hy", "Thiên giải": "thien-giai", "Địa giải": "dia-giai",
    "Giải thần": "giai-than", "Thai phụ": "thai-phu", "Phong cáo": "phong-cao", "Thiên tài": "thien-tai",
    "Thiên thọ": "thien-tho", "Thiên thương": "thien-thuong", "Thiên sứ": "thien-su", "Thiên la": "thien-la",
    "Địa võng": "dia-vong", "Hóa khoa": "hoa-khoa", "Hóa quyền": "hoa-quyen", "Hóa lộc": "hoa-loc",
    "Hóa kỵ": "hoa-ky", "Cô thần": "co-than", "Quả tú": "qua-tu", "Thiên mã": "thien-ma",
    "Phá toái": "pha-toai", "Thiên quan": "thien-quan", "Thiên phúc": "thien-phuc", "Lưu hà": "luu-ha",
    "Thiên trù": "thien-tru", "Kiếp sát": "kiep-sat", "Hoa cái": "hoa-cai", "Văn tinh": "van-tinh",
    "Đẩu quân": "dau-quan", "Thiên không": "thien-khong",
}
# "Quan phù" xuất hiện ở cả vòng Thái Tuế (id 19) và vòng Bác Sĩ (id 38).
ID_BY_SAOID = {19: "quan-phu-tt", 38: "quan-phu-bs"}

random.seed(20261023)
cases = []
# Bao phủ đều 12 giờ, 2 giới tính, nhiều năm (cả 10 Can, 12 Chi, 5 Cục).
for i in range(240):
    year = random.randint(1930, 2030)
    month = random.randint(1, 12)
    day = random.randint(1, 28)
    hour_branch = i % 12  # 0 = Tý
    gender = 1 if (i // 12) % 2 == 0 else -1
    cases.append((day, month, year, hour_branch, gender))

out = []
for (dd, mm, yy, hb, gender) in cases:
    nn, tt, nnnn, nhuan = ngayThangNam(dd, mm, yy, True, 7)
    db = lapDiaBan(diaBan, dd, mm, yy, hb + 1, gender, True, 7)
    stars = {}
    tuan, triet = [], []
    dai_han = {}
    tieu_han = {}
    for cung in range(1, 13):
        c = db.thapNhiCung[cung]
        for sao in c.cungSao:
            sid = ID_BY_SAOID.get(sao["saoID"]) or NAME_TO_ID.get(sao["saoTen"])
            if sid is None:
                raise SystemExit("Chưa ánh xạ tên sao: " + sao["saoTen"])
            stars[sid] = cung - 1
        if getattr(c, "tuanTrung", False):
            tuan.append(cung - 1)
        if getattr(c, "trietLo", False):
            triet.append(cung - 1)
        dai_han[cung - 1] = c.cungDaiHan
        tieu_han[cung - 1] = c.cungTieuHan
    out.append({
        "input": {"day": dd, "month": mm, "year": yy, "hourBranch": hb, "gender": "male" if gender == 1 else "female"},
        "lunar": {"day": nn, "month": tt, "year": nnnn, "isLeap": bool(nhuan)},
        "menh": db.cungMenh - 1,
        "than": db.cungThan - 1,
        "stars": stars,
        "tuan": sorted(tuan),
        "triet": sorted(triet),
        "majorPeriodStartAge": dai_han,
        "minorPeriodYearBranch": tieu_han,
    })

json.dump({
    "source": "lasotuvi (https://github.com/doanguyen/lasotuvi, MIT) – generated by scripts/reference/generate_lasotuvi_fixtures.py",
    "note": "Cross-implementation reference. Not ground truth; known school differences are excluded in tests.",
    "cases": out,
}, sys.stdout, ensure_ascii=False, separators=(",", ":"))
