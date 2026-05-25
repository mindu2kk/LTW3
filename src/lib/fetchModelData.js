/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 * @returns {Promise}       A Promise that resolves with the parsed JSON data.
 */
function fetchModel(url) {
  // Trả về một "Lời hứa" (Promise) vì việc lấy dữ liệu qua mạng tốn thời gian
  return new Promise(function (resolve, reject) {
    const userId = localStorage.getItem("userId");

    const headers = {};
    if (userId) {
      headers["x-user-id"] = userId;
    }

    // Gọi API fetch có sẵn của trình duyệt để gửi HTTP GET Request
    fetch(url, {
      headers: headers,
      credentials: "include",
    })
      .then(function (response) {
        // Kiểm tra xem Server có phản hồi thành công (Mã 200 -> 299) không
        if (!response.ok) {
          // Nếu lỗi (ví dụ 404 Not Found), từ chối (reject) lời hứa và quăng lỗi
          reject(new Error(`Lỗi HTTP! Trạng thái: ${response.status}`));
        } else {
          // Nếu thành công, dịch dữ liệu từ chuỗi sang Object JavaScript (JSON)
          return response.json();
        }
      })
      .then(function (data) {
        // Sau khi dịch xong, hoàn thành lời hứa (resolve) và giao hàng
        // Lưu ý: Bọc data vào một object { data: data } để tiện sử dụng ở các component
        resolve({ data: data });
      })
      .catch(function (error) {
        // Bắt mọi lỗi xảy ra trong quá trình kết nối mạng (như đứt cáp, server sập)
        console.error("Lỗi khi fetch model:", error);
        reject(error);
      });
  });
}

export default fetchModel;
