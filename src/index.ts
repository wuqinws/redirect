export default {
  async fetch(request, env) {
    const country = request.cf.country; // 获取 Cloudflare 识别的 IP 国家
    const url = new URL(request.url);
    const userAgent = request.headers.get("User-Agent") || "";
    const cookies = request.headers.get("Cookie") || "";

    // ====================================================
    // 1. 白名单放行 (爬虫 + 静态资源 + 手动偏好)
    // ====================================================
    
    // A. 放行 Googlebot/Bingbot (SEO 命根子)
    if (userAgent.includes("Googlebot") || userAgent.includes("bingbot")) {
      return fetch(request); 
    }

    // B. 放行静态资源 (图片/JS/CSS 不做跳转，节省资源)
    if (url.pathname.match(/\.(png|jpg|jpeg|gif|css|js|svg)$/)) {
      return fetch(request);
    }

    // C. 放行“手动偏好” (用户如果之前点过“留在 US”，Cookie 里会有记录)
    if (cookies.includes("manual_override=true")) {
      return fetch(request);
    }

    // ====================================================
    // 2. 自动跳转逻辑 (只针对 US 站)
    // ====================================================
    
    // 如果 IP 是加拿大 -> 302 去 CA 站
    if (country === "CA") {
      return Response.redirect("https://ca.yourdomain.com" + url.pathname, 302);
    }

    // 如果 IP 是英国 -> 302 去 UK 站
    if (country === "GB") { // 注意：英国代码通常是 GB
      return Response.redirect("https://uk.yourdomain.com" + url.pathname, 302);
    }

    // 如果 IP 是英国 -> 302 去 UK 站
    if (country === "US") { // 注意：英国代码通常是 GB
      return Response.redirect("https://wenshan.space" + url.pathname, 302);
    }

    // ... 其他国家规则

    // 如果 IP 是 US 或其他未定义国家 -> 放行，留在 US 站
    return fetch(request);
  }
};
