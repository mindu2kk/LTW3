import BASE_URL from "./config";

/**
 * Hàm gọi API dùng chung cho toàn bộ app.
 *
 * @param {string} path     - Đường dẫn API, ví dụ "/user/list"
 * @param {string} method   - HTTP method: "GET", "POST", "PUT" (mặc định "GET")
 * @param {object} body     - Dữ liệu gửi lên (chỉ dùng với POST/PUT)
 * @param {boolean} isFile  - true nếu gửi file (FormData), không set Content-Type
 * @returns {Promise}       - Resolve với data JSON, reject nếu lỗi
 */
function api(path, method = "GET", body = null, isFile = false) {
  const token = localStorage.getItem("token");

  const headers = {};

  // Gắn token vào header nếu có
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Nếu không phải file thì set Content-Type JSON
  // Nếu là file (FormData) thì để browser tự set multipart/form-data + boundary
  if (!isFile && body) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFile ? body : body ? JSON.stringify(body) : null,
  }).then((response) => {
    if (!response.ok) {
      // Trả về lỗi kèm message từ server để component hiển thị
      return response.json().then((err) => {
        return Promise.reject(err.message || "Loi server");
      });
    }
    // Nếu response rỗng (ví dụ logout trả 200 không có body) thì trả null
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }
    return null;
  });
}

export default api;
