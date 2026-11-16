/**
 * سكريبت الموقع التفاعلي لمكتب عبدالله الأحمد للمحاماة والاستشارات القانونية
 */

document.addEventListener("DOMContentLoaded", function () {
  const config = window.SITE_CONFIG || {};

  // 1. معالجة وتجهيز رابط واتساب الرسمي
  function buildWhatsAppUrl() {
    const rawNumber = config.WHATSAPP_NUMBER || "+96599914161";
    // إزالة أية مسافات أو إشارات زائدة للرابط
    const cleanNumber = rawNumber.replace(/[^0-9]/g, "");
    const message = encodeURIComponent(config.whatsappMessage || "السلام عليكم ورحمة الله وبركاته، أود الاستفسار بخصوص استشارة قانونية لدى مكتب الأستاذ عبدالله الأحمد المحترم.");
    return `https://wa.me/${cleanNumber}?text=${message}`;
  }

  const whatsappUrl = buildWhatsAppUrl();

  // تطبيق رابط الواتساب على كافة الأزرار والروابط المخصصة في الموقع
  document.querySelectorAll(".js-whatsapp-link").forEach(function (el) {
    el.setAttribute("href", whatsappUrl);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");
  });

  // 2. تحديث أرقام الهاتف والنصوص التعريفية من ملف الإعدادات
  if (config.phoneDisplay) {
    document.querySelectorAll(".js-phone-display").forEach(function (el) {
      el.textContent = config.phoneDisplay;
    });
  }

  if (config.phoneCall) {
    document.querySelectorAll(".js-phone-link").forEach(function (el) {
      el.setAttribute("href", `tel:${config.phoneCall}`);
    });
  }

  // تحديث رابط الخريطة من الإعدادات
  if (config.mapUrl) {
    document.querySelectorAll(".js-map-link").forEach(function (el) {
      el.setAttribute("href", config.mapUrl);
    });
  }

  // 3. التحكم في قسم الخدمات القانونية طبقاً للتوجيهات:
  // "إذا لم تتوفر قائمة الخدمات، أخفِ هذا القسم مؤقتاً بدلاً من عرض معلومات افتراضية."
  const servicesSection = document.getElementById("services");
  const navLinkServices = document.getElementById("navLinkServices");
  const servicesContainer = document.getElementById("servicesContainer");

  const hasConfirmedServices = config.showServicesSection && Array.isArray(config.services) && config.services.length > 0;

  if (hasConfirmedServices) {
    if (servicesSection) servicesSection.classList.remove("hidden");
    if (navLinkServices) navLinkServices.style.display = "";

    // تعبئة بطاقات الخدمات
    if (servicesContainer) {
      servicesContainer.innerHTML = "";
      config.services.forEach(function (service) {
        const card = document.createElement("div");
        card.className = "service-card";
        card.innerHTML = `
          <div class="service-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h3 class="service-card-title">${service.title}</h3>
          <p class="service-card-desc">${service.description}</p>
        `;
        servicesContainer.appendChild(card);
      });
    }
  } else {
    // إخفاء القسم ورابط القائمة تماماً إذا لم تكن هناك خدمات مؤكدة
    if (servicesSection) servicesSection.classList.add("hidden");
    if (navLinkServices) navLinkServices.style.display = "none";
  }

  // 4. معالجة صورة المحامي (Lawyer Photo Fallback & Integration)
  const lawyerPhotoEl = document.getElementById("lawyerPhoto");
  if (lawyerPhotoEl) {
    lawyerPhotoEl.addEventListener("error", function () {
      // في حال عدم توفر ملف الصورة lawyer.jpg بعد، يتم التبديل تلقائياً للبديل الرمزي الفخم
      this.src = "assets/images/placeholder-lawyer.svg";
    });
  }

  // 5. شريط التنقل العلوي وتأثير التمرير (Sticky Navbar)
  const header = document.querySelector(".site-header");
  function handleHeaderScroll() {
    if (window.scrollY > 30) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
  window.addEventListener("scroll", handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  // 6. قائمة الموبايل (Mobile Navigation Drawer)
  const mobileToggle = document.querySelector(".mobile-menu-toggle");
  const navMenu = document.querySelector(".header-nav");

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", function () {
      const isOpen = navMenu.classList.toggle("open");
      mobileToggle.classList.toggle("active", isOpen);
      mobileToggle.setAttribute("aria-expanded", isOpen);
    });

    // إغلاق القائمة عند النقر على أي رابط
    navMenu.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        navMenu.classList.remove("open");
        mobileToggle.classList.remove("active");
        mobileToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // 7. تمييز القسم النشط أثناء التمرير (Active Section Highlighting)
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".header-nav .nav-link");

  function highlightNavOnScroll() {
    const scrollPos = window.scrollY + 120;
    sections.forEach(function (section) {
      if (section.classList.contains("hidden")) return;
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute("id");

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(function (link) {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }
  window.addEventListener("scroll", highlightNavOnScroll, { passive: true });

  // 8. روابط التواصل الاجتماعي في التذييل (تظهر فقط إذا كانت محددة وليست فارغة)
  const socialContainer = document.getElementById("footerSocials");
  if (socialContainer && config.socialLinks) {
    let hasAnySocial = false;
    Object.keys(config.socialLinks).forEach(function (platform) {
      const url = config.socialLinks[platform];
      if (url && url.trim().length > 0) {
        hasAnySocial = true;
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.className = "footer-social-link";
        a.setAttribute("aria-label", platform);
        a.innerHTML = `<span style="font-size: 0.8rem; text-transform: uppercase;">${platform}</span>`;
        socialContainer.appendChild(a);
      }
    });
    if (!hasAnySocial) {
      socialContainer.style.display = "none";
    }
  }

  // 9. سنة حقوق النشر الحالية
  const yearEl = document.getElementById("currentYear");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
