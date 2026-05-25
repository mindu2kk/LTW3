/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 * @returns {Promise}       A Promise that resolves with { data } hoặc reject nếu lỗi.
 */
function fetchModel(url) {
  // Lấy token đã lưu khi login
  const token = localStorage.getItem("token");

  return fetch(url, {
    headers: {
      // Gửi token qua Authorization header — không bị chặn cross-site như cookie
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })
    .then(function (response) {
      if (!response.ok) {
        // return reject luôn để dừng chain, không chạy .then tiếp theo
        return Promise.reject(new Error(`Lỗi HTTP! Trạng thái: ${response.status}`));
      }
      return response.json();
    })
    .then(function (data) {
      // Bọc vào { data } để các component dùng response.data cho thống nhất
      return { data: data };
    })
    .catch(function (error) {
      console.error("Lỗi khi fetch model:", error);
      return Promise.reject(error);
    });
}

export default fetchModel;
