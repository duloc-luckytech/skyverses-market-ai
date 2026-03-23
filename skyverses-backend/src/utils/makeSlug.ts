export function makeSlug(text: string) {
    if (!text) return "";
    return text
      .normalize("NFD")                       // tách dấu
      .replace(/[\u0300-\u036f]/g, "")        // xoá dấu
      .replace(/đ/g, "d")                     // chuẩn hoá đ
      .replace(/Đ/g, "d")                     // chuẩn hoá Đ
      .replace(/[^a-zA-Z0-9\s]/g, " ")        // xoá ký tự đặc biệt
      .replace(/\s+/g, " ")                   // gom khoảng trắng
      .trim()
      .toLowerCase();
  }