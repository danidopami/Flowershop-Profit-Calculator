# FloraProfit - Ứng Dụng Tính Giá Vốn & Lợi Nhuận Bó Hoa Cho Florist

Ứng dụng web chuyên sâu dành cho chủ tiệm hoa, florist và quản lý xưởng hoa nhằm tính toán chính xác giá vốn (COGS), hao hụt nguyên liệu, chi phí phụ trợ, phân bổ vận hành và lợi nhuận gộp/ròng theo thời gian thực dựa trên bảng giá kho sỉ thực tế.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Dựa trên phản hồi trong bước làm rõ yêu cầu, các quyết định kiến trúc then chốt đã được xác nhận:
> - **Bảng giá Kho Trí Hải tích hợp sẵn**: Nạp đầy đủ cơ sở dữ liệu hàng trăm mã hoa nhập khẩu và trong nước (Trung Quốc, Hà Lan, Ecuador, Malaysia, Nam Phi, Đà Lạt, Hoa khô, Lá phụ) với đơn giá theo bó/cành và tự động quy đổi giá trên từng cành. Florist có thể tìm kiếm nhanh, sửa giá hoặc bổ sung hoa mới.
> - **Song hành 2 chế độ định giá**: Hỗ trợ chuyển đổi mượt mà giữa Biên Lợi Nhuận (% Margin) và Hệ số Markup (x) kèm hiển thị quy đổi tương hỗ giúp người dùng làm chủ cả hai cách tính phổ biến trong ngành hoa.
> - **Thư viện mẫu & Xuất phiếu báo giá**: Lưu trữ các công thức bó hoa (kèm mẫu demo "Autumn Sunset"), quản lý catalog thiết kế và xuất phiếu báo giá / đơn hàng chuyên nghiệp (hỗ trợ in ấn và tải về).

---

### 1. Overview & Core Concept

- **Mục tiêu**: Loại bỏ hoàn toàn tình trạng tính nhẩm ước chừng gây thất thoát lợi nhuận trong tiệm hoa do không tính tới tỉ lệ hoa gãy hỏng, xốp cắm, giấy gói và công cắm.
- **Đối tượng sử dụng**: Chủ shop hoa tươi, Florist tự do (freelancer), nhân viên cắm hoa chính (lead florist), quản lý chuỗi hoa sự kiện/tiệc cưới.
- **Giá trị cốt lõi**:
  - Tra cứu giá cành tức thì từ catalog hoa kho sỉ Trí Hải.
  - Điều chỉnh nhanh 5 biến phí bằng thanh trượt trực quan với phản hồi tính toán tức thời (<50ms).
  - Tách bạch rõ ràng giữa Giá vốn nguyên liệu (COGS), Tổng chi phí thực tế (Total Cost), Lợi nhuận gộp (Gross Profit) và Lợi nhuận ròng đút túi (Net Profit).
  - Xuất phiếu báo giá thanh lịch, lịch sự gửi khách hàng cá nhân hoặc doanh nghiệp.

---

### 2. User Experience & Visual Design

#### A. Key User Flows
1. **Flow 1: Xây dựng công thức bó hoa (Recipe Builder)**
   - Người dùng nhập tên mẫu hoa (hoặc chọn mẫu có sẵn như "Autumn Sunset", "Bó hoa cưới Pastel", v.v.).
   - Gõ tìm kiếm loại hoa (auto-complete theo tên tiếng Việt, tiếng Trung hoặc xuất xứ: Ecuador, Hà Lan, Đà Lạt, Trung Quốc, Malaysia).
   - Chọn quy cách và số lượng cành/khối lượng -> Hệ thống tính ngay thành tiền từng loại và tổng tiền hoa thô (*Raw Flower Cost*).
2. **Flow 2: Tùy biến chi phí với 5 Interactive Sliders**
   - Kéo trượt hoặc nhập số cho: Tỉ lệ hoa hao hụt (0-30%), Chi phí giấy gói & phụ liệu (10k-200k), Công cắm / Nhân công (Cố định hoặc % nguyên liệu), Phân bổ vận hành & ship (0-20%), Mục tiêu Margin % hoặc Markup x.
   - Thẻ kết quả và thanh phân bổ chi phí trực quan cập nhật mượt mà theo từng pixel kéo chuột.
3. **Flow 3: Phân tích kết quả & Định giá bán**
   - Xem bảng sao kê chuẩn xác theo công thức FRD: Tiền hoa thô -> Tiền bù hao hụt -> Phụ liệu -> Công cắm -> COGS -> Phân bổ vận hành -> Total Cost -> Giá bán đề xuất -> Lợi nhuận gộp & ròng.
   - Chức năng làm tròn giá thông minh (làm tròn lên hàng chục nghìn: ví dụ `444.470₫` thành `450.000₫` hoặc `1.060.000₫`).
4. **Flow 4: Lưu kho công thức & Xuất phiếu báo giá (Quote Export)**
   - Bấm "Lưu mẫu hoa" vào thư viện công thức cá nhân (lưu trên trình duyệt với LocalStorage).
   - Bấm "Xuất phiếu báo giá" mở modal phiếu in sang trọng, hiển thị thương hiệu tiệm hoa, thông tin khách hàng, danh sách hoa và tổng thanh toán. Có nút in (Print) / lưu PDF chuẩn A4.
5. **Flow 5: Quản lý bảng giá Kho (Wholesale Catalog Manager)**
   - Tab tra cứu toàn bộ bảng giá Trí Hải, lọc theo Xuất xứ / Loại hoa (Hoa hồng, Cúc, Tulip, Calla Lily, Cát tường, Lá phụ, Hoa khô).
   - Chỉnh sửa giá nhập khi kho điều chỉnh hoặc nhập thêm loại hoa nội địa mới.

#### B. Visual Identity & Theme
- **Phong cách**: Botanical Editorial & Modern Florist Studio — tinh tế, sạch sẽ, chuẩn xác như bảng tính chuyên nghiệp nhưng mềm mại và ấm áp theo thẩm mỹ ngành hoa.
- **Bảng màu (Tailwind Tokens & 60-30-10 Rule)**:
  - Canvas (60%): Trắng sạch `#FAFAF9` (Stone-50) tạo nền tảng rõ ràng cho mắt khi xem nhiều con số.
  - Cấu trúc & Thẻ (30%): Mặt thẻ `#FFFFFF` với viền siêu mỏng `border-stone-200`, chữ chính `stone-900`, chữ phụ `stone-500`.
  - Điểm nhấn (10%): Xanh rêu thảo mộc `#1E3A2B` (Emerald/Stone Deep Forest) đại diện cho thương hiệu cao cấp; nhấn số liệu thành công với ngọc lục bảo `#059669` và nhấn lưu ý với màu hổ phách đất `#D97706`.
- **Typography**:
  - Tiêu đề & Tên hoa: *Plus Jakarta Sans* hiện đại, thanh thoát.
  - Số liệu & Tiền tệ: Phông chữ đơn cách bảng biểu `font-mono tabular-nums` đảm bảo thẳng hàng tuyệt đối khi tính toán tài chính.
- **Kỷ luật giao diện Anti-Slop**:
  - Không dùng viền dày bên trái (`border-l-4`), không chấm tròn nhấp nháy vô cớ, không thẻ lồng trong thẻ.
  - Sử dụng đường kẻ hairline tinh tế, khoảng cách thoáng đãng và thẻ hiển thị số rõ ràng.

---

### 3. Key Product Decisions & Trade-Offs

- **Cơ sở dữ liệu hoa Trí Hải tĩnh kết hợp LocalStorage**:
  - *Lựa chọn*: Tích hợp sẵn bộ dữ liệu hơn 100 loại hoa và lá phụ chuẩn xác từ 29 trang tài liệu (giá cành, giá bó, xuất xứ, quy cách). Lưu các tùy biến giá và công thức mới vào `localStorage`.
  - *Lý do*: Đáp ứng tốc độ phản hồi tức thì, hoạt động mượt mà offline, không phụ thuộc kết nối backend cồng kềnh, người dùng mở app là dùng ngay.
- **Cơ chế tính giá kép (Dual Pricing Engine: Margin vs Markup)**:
  - *Lựa chọn*: Đồng bộ thời gian thực hai chiều giữa `% Margin` và `Hệ số Markup`:
    - Khi người dùng kéo Margin $40\%$, Markup tự động nhảy thành $\frac{1}{1 - 0.40} = 1.67x$.
    - Khi người dùng kéo Markup $2.5x$, Margin tự động nhảy thành $\frac{2.5 - 1}{2.5} = 60\%$.
  - *Lý do*: Một số florist quen tư duy nhân hệ số (Markup), trong khi quản lý chuỗi lại quen tư duy tỷ suất sinh lời trên doanh thu (Margin). Phục vụ hoàn hảo cả 2 góc nhìn.
- **Hỗ trợ đơn vị cành lẻ và phân số của bó lá**:
  - *Lựa chọn*: Cho phép nhập số lượng dạng thập phân (ví dụ `0.2 bó Lá Bạc To` hay `0.5 bó hoa baby`) hoặc số cành lẻ để phản ánh đúng thực tế bó hoa cắm tại xưởng.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FloraProfit Studio App                          │
├────────────────────────────────────────────────────────────────────────┤
│  Top Navigation (Brand Wordmark · Tab Switcher · Currency/Save Action) │
├───────────────────────────────┬────────────────────────────────────────┤
│          LEFT COLUMN          │              RIGHT COLUMN              │
│       Recipe & Controls       │          Financial Dashboard           │
│ ┌───────────────────────────┐ │ ┌────────────────────────────────────┐ │
│ │ 1. Recipe Builder         │ │ │ Financial Summary Card (COGS, Cost)│ │
│ │  - Flower Autocomplete    │ │ │ - Suggested Retail Price           │ │
│ │  - Stem / Unit inputs     │ │ │ - Gross Profit & Net Profit KPIs   │ │
│ │  - Dynamic flower rows    │ │ ├────────────────────────────────────┤ │
│ ├───────────────────────────┤ │ │ Visual Cost Breakdown Bar          │ │
│ │ 2. 5 Variable Sliders     │ │ │ (Flowers | Waste | Pack | Labor...) │ │
│ │  - Wastage Rate (0-30%)   │ │ ├────────────────────────────────────┤ │
│ │  - Packaging Cost         │ │ │ Quick Price Rounding Presets       │ │
│ │  - Labor Cost (Fixed / %) │ │ ├────────────────────────────────────┤ │
│ │  - Overhead (0-20%)       │ │ │ Export Printable Quote Slip        │ │
│ │  - Margin % / Markup x    │ │ │ Save to Catalog                    │ │
│ └───────────────────────────┘ │ └────────────────────────────────────┘ │
├───────────────────────────────┴────────────────────────────────────────┤
│                      Modal / Slide-over Views                          │
│  - Recipe Library Catalog (Autumn Sunset preset, saved bouquets)       │
│  - Trí Hải Wholesale Price Master Catalog (Search, filter, edit prices)│
│  - Professional Printable Invoice/Quote Sheet for Clients             │
└────────────────────────────────────────────────────────────────────────┘
```

#### Các Thực Thể Dữ Liệu Chính (Data Models)
- `WholesaleFlowerItem`: `{ id, name, originalChineseName?, category, origin, packUnit, packPrice, stemsPerPack, unitPrice, note? }`
- `RecipeItem`: `{ id, flowerId, flowerName, origin, unit, quantity, unitCost, totalCost }`
- `FloristRecipe`: `{ id, name, description?, category, items, wastagePercent, packagingCost, laborCostType, laborCostValue, overheadPercent, pricingMode, targetMargin, markupFactor, roundedPrice, createdAt }`
- `FinancialBreakdown`: `{ rawFlowerCost, wastageCost, packagingCost, laborCost, cogs, overheadCost, totalCost, suggestedPrice, roundedPrice, grossProfit, netProfit, grossMarginPercent, netMarginPercent }`

---

### 5. Implementation Roadmap

1. **Khởi tạo dữ liệu Bảng giá Kho Trí Hải (`src/data/triHaiFlowers.ts`)**:
   - Trích xuất toàn bộ các dòng sản phẩm từ 29 trang tài liệu (Hồng Trung Quốc Ohara/Manta/Juliet/Pink Floyd, Tulip Hà Lan 10+ màu, Cúc Mẫu Đơn Malaysia, Hồng Ecuador 60/70/80cm, Calla Lily, Đào Đông, Lan Hồ Điệp Đà Lạt, Cỏ/Lá phụ, Hoa khô, v.v.).
2. **Xây dựng module công thức toán học (`src/utils/calculator.ts`)**:
   - Hiện thực hóa toàn bộ hệ thống công thức FRD Mục 4 (COGS, Total Cost, Suggested Price theo Margin & Markup, Gross/Net Profit).
3. **Phát triển giao diện Recipe Builder (`src/components/RecipeBuilder.tsx`)**:
   - Thanh tìm kiếm thông minh với gợi ý nhanh, chọn hoa theo nguồn gốc, thêm nhanh và đổi số lượng.
4. **Phát triển bộ 5 thanh trượt thời gian thực (`src/components/CostSliders.tsx`)**:
   - Slider tùy biến có ô nhập số kèm, chuyển đổi linh hoạt chế độ công thợ cố định/% và Margin/Markup.
5. **Phát triển Dashboard kết quả tài chính (`src/components/FinancialDashboard.tsx`)**:
   - Sao kê rõ ràng từng dòng chi phí đúng chuẩn biểu mẫu FRD, thẻ giá bán lớn nổi bật, phân bổ chi phí dạng thanh màu trực quan.
6. **Thư viện mẫu hoa & Xuất phiếu báo giá (`src/components/RecipeLibraryModal.tsx`, `src/components/QuoteExportModal.tsx`)**:
   - Lưu trữ, nạp lại mẫu "Autumn Sunset", xuất phiếu báo giá đẹp mắt cho tiệm hoa.
7. **Tối ưu hóa giao diện, typography, responsive và xác thực build (`compile_applet`)**.
